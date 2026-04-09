import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAxiosWithAuth } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import {
  Upload, X, CheckCircle, Loader2, Music,
  Image, ChevronDown, ChevronUp, FolderPlus, Plus
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface BulkSong {
  id: string;
  audioFile: File;
  title: string;
  artist: string;
  duration: number;
  albumId: string;
  status: "pending" | "uploading" | "done" | "error";
}

interface AlbumGroup {
  id: string;
  name: string;
  songs: BulkSong[];
  isExpanded: boolean;
  coverImage: File | null;
  albumId: string;
}

const parseDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      resolve(Math.floor(audio.duration));
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => resolve(180);
  });
};

const BulkUploadDialog = () => {
  const axiosInstance = useAxiosWithAuth();
  const { albums } = useMusicStore();
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<AlbumGroup[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      useMusicStore.getState().fetchAlbums();
    }
  }, [open]);

  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) return toast.error("Enter a folder name");
    if (groups.find((g) => g.name === name)) return toast.error("Folder already exists");

    const newGroup: AlbumGroup = {
      id: Math.random().toString(36).slice(2),
      name,
      songs: [],
      isExpanded: true,
      coverImage: null,
      albumId: "none",
    };

    setGroups((prev) => [...prev, newGroup]);
    setActiveGroupId(newGroup.id);
    setNewFolderName("");
  };

  const fetchCoverArt = async (artist: string, title: string): Promise<File | null> => {
    try {
      const query = encodeURIComponent(`${artist} ${title}`);
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=1`);
      const data = await res.json();
      if (data.results?.length > 0) {
        const imageUrl = data.results[0].artworkUrl100.replace("100x100", "600x600");
        const imgRes = await fetch(imageUrl);
        const blob = await imgRes.blob();
        return new File([blob], "cover.jpg", { type: "image/jpeg" });
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleAudioFiles = async (files: FileList, targetGroupId: string) => {
    const sortedFiles = Array.from(files).sort((a, b) => {
      const aMatch = a.name.match(/^(\d+)/);
      const bMatch = b.name.match(/^(\d+)/);
      if (aMatch && bMatch) return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      else if (aMatch) return -1;
      else if (bMatch) return 1;
      else return a.lastModified - b.lastModified;
    });

    toast.loading("Reading MP3 tags...", { id: "loading" });

    const newSongs: BulkSong[] = [];

    // Get the group and its assigned album artist
    const group = groups.find((g) => g.id === targetGroupId);
    const assignedAlbum = albums.find((a) => a._id === group?.albumId);

    for (const file of sortedFiles) {
      if (!file.type.startsWith("audio/")) continue;

      let artist = "";
      let title = "";
      let duration = 180;

      try {
        const { parseBlob } = await import("music-metadata-browser");
        const metadata = await parseBlob(file);
        artist = metadata.common.artist || "";
        title = metadata.common.title || "";
        duration = Math.floor(metadata.format.duration || 180);
      } catch {
        // Fall back to filename
      }

      if (!artist || !title) {
        const withoutExt = file.name.replace(/\.[^/.]+$/, "");
        const withoutTrackNum = withoutExt.replace(/^\d+\s*-\s*/, "");
        const parts = withoutTrackNum.split(" - ");
        if (!artist) artist = parts.length >= 2 ? parts[0].trim() : "";
        if (!title) title = parts.length >= 2 ? parts.slice(1).join(" - ").trim() : withoutTrackNum.trim();
      }

      if (duration === 180) {
        duration = await parseDuration(file);
      }

      // If group has an album assigned, use that album's artist
      const finalArtist = assignedAlbum ? assignedAlbum.artist : artist;

      newSongs.push({
        id: Math.random().toString(36).slice(2),
        audioFile: file,
        title,
        artist: finalArtist,
        duration,
        albumId: "none",
        status: "pending",
      });
    }

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== targetGroupId) return g;
        const updatedSongs = [...g.songs, ...newSongs];

        if (!g.coverImage && newSongs.length > 0) {
          const firstSong = newSongs[0];
          if (firstSong.artist && firstSong.title) {
            fetchCoverArt(firstSong.artist, firstSong.title).then((coverFile) => {
              if (coverFile) {
                setGroups((prev2) =>
                  prev2.map((g2) =>
                    g2.id === targetGroupId ? { ...g2, coverImage: coverFile } : g2
                  )
                );
              }
            });
          }
        }

        return { ...g, songs: updatedSongs };
      })
    );

    toast.success(`${newSongs.length} songs added!`, { id: "loading" });
  };

  const toggleGroup = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isExpanded: !g.isExpanded } : g))
    );
  };

  const setCoverImage = (groupId: string, file: File) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, coverImage: file } : g))
    );
  };

  const setGroupAlbum = (groupId: string, albumId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, albumId } : g))
    );
  };

  const renameGroup = (id: string, newName: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, name: newName } : g))
    );
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
    if (activeGroupId === id) setActiveGroupId(null);
  };

  const updateSongField = (groupId: string, songId: string, field: string, value: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, songs: g.songs.map((s) => (s.id === songId ? { ...s, [field]: value } : s)) }
          : g
      )
    );
  };

  const removeSong = (groupId: string, songId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, songs: g.songs.filter((s) => s.id !== songId) } : g
      )
    );
  };

  const applyAlbumArtist = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    const assignedAlbum = albums.find((a) => a._id === group?.albumId);
    if (!assignedAlbum) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              songs: g.songs.map((s) => ({
                ...s,
                artist: assignedAlbum.artist,
              })),
            }
          : g
      )
    );
    toast.success(`Set all artists to "${assignedAlbum.artist}"`);
  };

  const uploadAll = async () => {
    const filledGroups = groups.map((g) => ({
      ...g,
      songs: g.songs.map((s) => ({
        ...s,
        artist: s.artist.trim() || g.name,
        title: s.title.trim() || s.audioFile.name.replace(/\.[^/.]+$/, ""),
      })),
    }));

    const allPending = filledGroups.flatMap((g) =>
      g.songs.filter((s) => s.status === "pending").map((s) => ({ ...s, group: g }))
    );

    if (allPending.length === 0) return toast.error("No songs to upload");

    const missingCover = filledGroups.filter(
      (g) => !g.coverImage && g.songs.some((s) => s.status === "pending")
    );
    if (missingCover.length > 0) {
      return toast.error(`${missingCover.map((g) => g.name).join(", ")} missing cover image`);
    }

    setGroups(filledGroups);
    setIsUploading(true);

    for (const { group, ...song } of allPending) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === group.id
            ? { ...g, songs: g.songs.map((s) => (s.id === song.id ? { ...s, status: "uploading" } : s)) }
            : g
        )
      );

      try {
        const formData = new FormData();
        formData.append("title", song.title);
        formData.append("artist", song.artist);
        formData.append("duration", song.duration.toString());
        if (group.albumId && group.albumId !== "none") {
          formData.append("albumId", group.albumId);
        }
        formData.append("audioFile", song.audioFile);
        formData.append("imageFile", group.coverImage!);

        await axiosInstance.post("/admin/songs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? { ...g, songs: g.songs.map((s) => (s.id === song.id ? { ...s, status: "done" } : s)) }
              : g
          )
        );
      } catch {
        setGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? { ...g, songs: g.songs.map((s) => (s.id === song.id ? { ...s, status: "error" } : s)) }
              : g
          )
        );
      }
    }

    setIsUploading(false);
    toast.success("Bulk upload complete!");
  };

  const totalPending = groups.reduce(
    (acc, g) => acc + g.songs.filter((s) => s.status === "pending").length,
    0
  );
  const totalDone = groups.reduce(
    (acc, g) => acc + g.songs.filter((s) => s.status === "done").length,
    0
  );
  const totalSongs = groups.reduce((acc, g) => acc + g.songs.length, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='bg-blue-500 hover:bg-blue-600 text-white'>
          <Upload className='mr-2 h-4 w-4' />
          Bulk Upload
        </Button>
      </DialogTrigger>

      <DialogContent className='bg-zinc-900 border-zinc-700 max-w-4xl max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle>Bulk Upload Songs</DialogTitle>
        </DialogHeader>

        {/* Create folder row */}
        <div className='flex gap-2'>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createFolder()}
            placeholder='New folder name (e.g. Drake - For All The Dogs)'
            className='bg-zinc-800 border-zinc-600 text-white'
          />
          <Button
            onClick={createFolder}
            className='bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0'
          >
            <FolderPlus className='h-4 w-4 mr-1' />
            Create
          </Button>
        </div>

        {/* Stats + Upload All */}
        {totalSongs > 0 && (
          <div className='flex items-center justify-between px-1'>
            <p className='text-sm text-zinc-400'>
              {totalSongs} songs • {totalDone} uploaded • {totalPending} pending
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setGroups([])}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                size='sm'
                className='bg-emerald-500 hover:bg-emerald-600 text-black'
                onClick={uploadAll}
                disabled={isUploading || totalPending === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Uploading...
                  </>
                ) : (
                  `Upload All (${totalPending})`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Folders */}
        <ScrollArea className='max-h-[55vh]'>
          <div className='space-y-4 pr-2'>
            {groups.length === 0 && (
              <div className='text-center py-10 text-zinc-500'>
                <FolderPlus className='h-10 w-10 mx-auto mb-3 opacity-30' />
                <p>Create a folder above, then add songs to it</p>
              </div>
            )}

            {groups.map((group) => (
              <div
                key={group.id}
                className='bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden'
              >
                {/* Group header */}
                <div className='flex items-center gap-3 p-3 bg-zinc-800'>

                  {/* Cover image picker */}
                  <div
                    className='w-14 h-14 rounded-md border-2 border-dashed border-zinc-600 flex items-center justify-center cursor-pointer hover:border-emerald-500 flex-shrink-0 overflow-hidden transition-colors'
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) setCoverImage(group.id, file);
                      };
                      input.click();
                    }}
                    title='Click to set cover image for all songs in this folder'
                  >
                    {group.coverImage ? (
                      <img
                        src={URL.createObjectURL(group.coverImage)}
                        alt='cover'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='flex flex-col items-center gap-1'>
                        <Image className='h-4 w-4 text-zinc-500' />
                        <span className='text-[9px] text-zinc-500'>Cover</span>
                      </div>
                    )}
                  </div>

                  {/* Folder name + song count */}
                  <div className='flex-1'>
                    <Input
                      value={group.name}
                      onChange={(e) => renameGroup(group.id, e.target.value)}
                      className='bg-zinc-700 border-zinc-600 h-7 text-sm font-medium text-white mb-0.5'
                      placeholder='Folder name'
                      disabled={isUploading}
                    />
                    <p className='text-xs text-zinc-400'>{group.songs.length} songs</p>
                  </div>

                  {/* Album selector */}
                  <Select
                    value={group.albumId}
                    onValueChange={(value) => setGroupAlbum(group.id, value)}
                  >
                    <SelectTrigger className='bg-zinc-700 border-zinc-600 h-8 text-xs w-44'>
                      <SelectValue placeholder='Assign album' />
                    </SelectTrigger>
                    <SelectContent className='bg-zinc-800 border-zinc-700'>
                      <ScrollArea className='max-h-48'>
                        <SelectItem value='none'>No Album (Singles)</SelectItem>
                        {albums.map((album) => (
                          <SelectItem key={album._id} value={album._id}>
                            {album.title}
                          </SelectItem>
                        ))}
                      </ScrollArea>
                    </SelectContent>
                  </Select>

                  {/* Use Album Artist button */}
                  {group.albumId !== "none" && (
                    <button
                      onClick={() => applyAlbumArtist(group.id)}
                      className='text-xs text-emerald-400 hover:text-emerald-300 whitespace-nowrap'
                      title='Set all songs to album artist'
                      disabled={isUploading}
                    >
                      Use Album Artist
                    </button>
                  )}

                  {/* Add songs button */}
                  <button
                    onClick={() => {
                      setActiveGroupId(group.id);
                      audioInputRef.current?.click();
                    }}
                    className='text-zinc-400 hover:text-emerald-400 transition-colors'
                    title='Add songs to this folder'
                    disabled={isUploading}
                  >
                    <Plus className='h-4 w-4' />
                  </button>

                  {/* Delete group */}
                  <button
                    onClick={() => removeGroup(group.id)}
                    className='text-zinc-500 hover:text-red-400 transition-colors'
                    disabled={isUploading}
                  >
                    <X className='h-4 w-4' />
                  </button>

                  {/* Expand/collapse */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className='text-zinc-400 hover:text-white'
                  >
                    {group.isExpanded ? (
                      <ChevronUp className='h-4 w-4' />
                    ) : (
                      <ChevronDown className='h-4 w-4' />
                    )}
                  </button>
                </div>

                {/* Drop zone inside group */}
                {group.isExpanded && group.songs.length === 0 && (
                  <div
                    className='m-3 border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-500 transition-colors'
                    onClick={() => {
                      setActiveGroupId(group.id);
                      audioInputRef.current?.click();
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      setActiveGroupId(group.id);
                      if (e.dataTransfer.files) handleAudioFiles(e.dataTransfer.files, group.id);
                    }}
                  >
                    <Music className='h-6 w-6 text-zinc-500 mx-auto mb-2' />
                    <p className='text-zinc-400 text-sm'>Drop MP3s here or click + to add songs</p>
                  </div>
                )}

                {/* Songs list */}
                {group.isExpanded && group.songs.length > 0 && (
                  <div
                    className='space-y-2 p-3'
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) handleAudioFiles(e.dataTransfer.files, group.id);
                    }}
                  >
                    {group.songs.map((song) => (
                      <div
                        key={song.id}
                        className={`bg-zinc-800 rounded-lg p-3 border ${
                          song.status === "done"
                            ? "border-emerald-500/50"
                            : song.status === "error"
                            ? "border-red-500/50"
                            : "border-zinc-700"
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <div className='flex-1 grid grid-cols-2 gap-2'>
                            <div>
                              <label className='text-xs text-zinc-400'>Title</label>
                              <Input
                                value={song.title}
                                onChange={(e) => updateSongField(group.id, song.id, "title", e.target.value)}
                                className='bg-zinc-700 border-zinc-600 h-7 text-xs mt-0.5'
                                disabled={song.status === "done" || isUploading}
                              />
                            </div>
                            <div>
                              <label className='text-xs text-zinc-400'>Artist</label>
                              <Input
                                value={song.artist}
                                onChange={(e) => updateSongField(group.id, song.id, "artist", e.target.value)}
                                className='bg-zinc-700 border-zinc-600 h-7 text-xs mt-0.5'
                                disabled={song.status === "done" || isUploading}
                              />
                            </div>
                          </div>

                          <div className='w-20'>
                            <label className='text-xs text-zinc-400'>Duration</label>
                            <Input
                              value={song.duration}
                              onChange={(e) => updateSongField(group.id, song.id, "duration", e.target.value)}
                              className='bg-zinc-700 border-zinc-600 h-7 text-xs mt-0.5'
                              type='number'
                              disabled={song.status === "done" || isUploading}
                            />
                          </div>

                          <div className='flex items-center gap-2 flex-shrink-0 mt-3'>
                            {song.status === "done" && <CheckCircle className='h-4 w-4 text-emerald-500' />}
                            {song.status === "uploading" && <Loader2 className='h-4 w-4 text-blue-400 animate-spin' />}
                            {song.status === "error" && <span className='text-xs text-red-400'>Error</span>}
                            {song.status !== "done" && (
                              <button
                                onClick={() => removeSong(group.id, song.id)}
                                className='text-zinc-500 hover:text-red-400'
                                disabled={isUploading}
                              >
                                <X className='h-3 w-3' />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Hidden file input */}
        <input
          ref={audioInputRef}
          type='file'
          accept='audio/*'
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files && activeGroupId) {
              handleAudioFiles(e.target.files, activeGroupId);
              e.target.value = "";
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;