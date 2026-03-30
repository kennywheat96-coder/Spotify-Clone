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
  Image, ChevronDown, ChevronUp, MoveRight
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface BulkSong {
  id: string;
  audioFile: File;
  imageFile: File | null;
  title: string;
  artist: string;
  duration: number;
  albumId: string;
  status: "pending" | "uploading" | "done" | "error";
}

interface AlbumGroup {
  id: string;
  artist: string;
  songs: BulkSong[];
  isExpanded: boolean;
  sharedImage: File | null;
  sharedAlbumId: string;
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
  const [songs, setSongs] = useState<BulkSong[]>([]);
  const [groups, setGroups] = useState<AlbumGroup[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [movingSongId, setMovingSongId] = useState<string | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Force fresh album fetch every time dialog opens
  useEffect(() => {
    if (open) {
      useMusicStore.getState().fetchAlbums();
    }
  }, [open]);

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

  const handleAudioFiles = async (files: FileList) => {
    const newSongs: BulkSong[] = [];

    const sortedFiles = Array.from(files).sort((a, b) => {
      const aMatch = a.name.match(/^(\d+)/);
      const bMatch = b.name.match(/^(\d+)/);
      if (aMatch && bMatch) return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      else if (aMatch) return -1;
      else if (bMatch) return 1;
      else return a.lastModified - b.lastModified;
    });

    toast.loading("Reading MP3 tags and fetching covers...", { id: "loading" });

    for (const file of sortedFiles) {
      if (!file.type.startsWith("audio/")) continue;

      let artist = "";
      let title = "";
      let duration = 180;
      let imageFile: File | null = null;

      try {
        const { parseBlob } = await import("music-metadata-browser");
        const metadata = await parseBlob(file);
        artist = metadata.common.artist || "";
        title = metadata.common.title || "";
        duration = Math.floor(metadata.format.duration || 180);

        const pictures = metadata.common.picture;
        if (pictures && pictures.length > 0) {
          const pic = pictures[0];
          const blob = new Blob([new Uint8Array(pic.data)], { type: pic.format });
          imageFile = new File([blob], "cover.jpg", { type: pic.format });
        }
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

      if (!imageFile && artist && title) {
        imageFile = await fetchCoverArt(artist, title);
      }

      if (duration === 180) {
        duration = await parseDuration(file);
      }

      newSongs.push({
        id: Math.random().toString(36).slice(2),
        audioFile: file,
        imageFile,
        title,
        artist,
        duration,
        albumId: "none",
        status: "pending",
      });
    }

    toast.success("Songs loaded!", { id: "loading" });

    const allSongs = [...songs, ...newSongs];
    setSongs(allSongs);
    rebuildGroups(allSongs);
  };

  const rebuildGroups = (allSongs: BulkSong[]) => {
    const groupMap: { [artist: string]: BulkSong[] } = {};
    for (const song of allSongs) {
      const key = song.artist || "Unknown Artist";
      if (!groupMap[key]) groupMap[key] = [];
      groupMap[key].push(song);
    }

    setGroups((prevGroups) =>
      Object.entries(groupMap).map(([artist, artistSongs]) => {
        const existing = prevGroups.find((g) => g.artist === artist);
        return {
          id: existing?.id ?? Math.random().toString(36).slice(2),
          artist,
          songs: artistSongs,
          isExpanded: existing?.isExpanded ?? true,
          sharedImage: existing?.sharedImage ?? null,
          sharedAlbumId: existing?.sharedAlbumId ?? "none",
        };
      })
    );
  };

  const toggleGroup = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => g.id === id ? { ...g, isExpanded: !g.isExpanded } : g)
    );
  };

  const applyImageToGroup = (id: string, artist: string, file: File) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, sharedImage: file } : g))
    );
    setSongs((prev) =>
      prev.map((s) => (s.artist === artist ? { ...s, imageFile: file } : s))
    );
  };

  const applyAlbumToGroup = (id: string, artist: string, albumId: string) => {
    setGroups((prev) =>
      prev.map((g) => g.id === id ? { ...g, sharedAlbumId: albumId } : g)
    );
    setSongs((prev) =>
      prev.map((s) => (s.artist === artist ? { ...s, albumId } : s))
    );
  };

  const renameGroup = (id: string, oldArtist: string, newArtist: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.artist === oldArtist ? { ...s, artist: newArtist } : s))
    );
    setGroups((prev) =>
      prev.map((g) => g.id === id ? { ...g, artist: newArtist } : g)
    );
  };

  const removeGroup = (artist: string) => {
    const updated = songs.filter((s) => s.artist !== artist);
    setSongs(updated);
    rebuildGroups(updated);
  };

  const updateSongField = (id: string, field: string, value: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        songs: g.songs.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
      }))
    );
  };

  const removeSong = (id: string) => {
    const updated = songs.filter((s) => s.id !== id);
    setSongs(updated);
    rebuildGroups(updated);
  };

  const moveSongToGroup = (songId: string, newArtist: string) => {
    const updated = songs.map((s) =>
      s.id === songId ? { ...s, artist: newArtist } : s
    );
    setSongs(updated);
    rebuildGroups(updated);
    setMovingSongId(null);
    toast.success(`Song moved to ${newArtist}`);
  };

  const uploadAll = async () => {
    const pending = songs.filter((s) => s.status === "pending");
    if (pending.length === 0) return toast.error("No songs to upload");

    const missing = pending.filter((s) => !s.imageFile);
    if (missing.length > 0) {
      return toast.error(`${missing.length} songs missing cover images`);
    }

    setIsUploading(true);

    for (const song of pending) {
      setSongs((prev) =>
        prev.map((s) => (s.id === song.id ? { ...s, status: "uploading" } : s))
      );

      try {
        const formData = new FormData();
        formData.append("title", song.title);
        formData.append("artist", song.artist);
        formData.append("duration", song.duration.toString());
        if (song.albumId && song.albumId !== "none") {
          formData.append("albumId", song.albumId);
        }
        formData.append("audioFile", song.audioFile);
        formData.append("imageFile", song.imageFile!);

        await axiosInstance.post("/admin/songs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setSongs((prev) =>
          prev.map((s) => (s.id === song.id ? { ...s, status: "done" } : s))
        );
      } catch {
        setSongs((prev) =>
          prev.map((s) => (s.id === song.id ? { ...s, status: "error" } : s))
        );
      }
    }

    setIsUploading(false);
    toast.success("Bulk upload complete!");
  };

  const pendingCount = songs.filter((s) => s.status === "pending").length;
  const doneCount = songs.filter((s) => s.status === "done").length;
  const artistNames = groups.map((g) => g.artist);

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

        {/* Drop zone */}
        <div
          className='border-2 border-dashed border-zinc-600 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition-colors'
          onClick={() => audioInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleAudioFiles(e.dataTransfer.files);
          }}
        >
          <Music className='h-10 w-10 text-zinc-400 mx-auto mb-3' />
          <p className='text-white font-medium'>Drop MP3 files here or click to browse</p>
          <p className='text-zinc-400 text-sm mt-1'>
            Cover art and metadata auto-detected from MP3 tags 🎵
          </p>
          <input
            ref={audioInputRef}
            type='file'
            accept='audio/*'
            multiple
            hidden
            onChange={(e) => e.target.files && handleAudioFiles(e.target.files)}
          />
        </div>

        {/* Stats + Upload All */}
        {songs.length > 0 && (
          <div className='flex items-center justify-between px-1'>
            <p className='text-sm text-zinc-400'>
              {songs.length} songs • {doneCount} uploaded • {pendingCount} pending
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => { setSongs([]); setGroups([]); }}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                size='sm'
                className='bg-emerald-500 hover:bg-emerald-600 text-black'
                onClick={uploadAll}
                disabled={isUploading || pendingCount === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Uploading...
                  </>
                ) : (
                  `Upload All (${pendingCount})`
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Grouped song list */}
        <ScrollArea className='max-h-[50vh]'>
          <div className='space-y-4 pr-2'>
            {groups.map((group) => (
              <div
                key={group.id}
                className='bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden'
              >
                {/* Group header */}
                <div className='flex items-center gap-3 p-3 bg-zinc-800'>

                  {/* Group cover image */}
                  <div
                    className='w-12 h-12 rounded-md border-2 border-dashed border-zinc-600 flex items-center justify-center cursor-pointer hover:border-emerald-500 flex-shrink-0 overflow-hidden'
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) applyImageToGroup(group.id, group.artist, file);
                      };
                      input.click();
                    }}
                  >
                    {group.sharedImage ? (
                      <img
                        src={URL.createObjectURL(group.sharedImage)}
                        alt='cover'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <Image className='h-4 w-4 text-zinc-500' />
                    )}
                  </div>

                  {/* Artist name editor */}
                  <div className='flex-1'>
                    <Input
                      value={group.artist}
                      onChange={(e) => renameGroup(group.id, group.artist, e.target.value)}
                      className='bg-zinc-700 border-zinc-600 h-7 text-sm font-medium text-white mb-0.5'
                      placeholder='Artist name'
                      disabled={isUploading}
                    />
                    <p className='text-xs text-zinc-400'>{group.songs.length} songs</p>
                  </div>

                  {/* Apply album to all */}
                  <Select
                    value={group.sharedAlbumId}
                    onValueChange={(value) => applyAlbumToGroup(group.id, group.artist, value)}
                  >
                    <SelectTrigger className='bg-zinc-700 border-zinc-600 h-8 text-xs w-44'>
                      <SelectValue placeholder='Apply album to all' />
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

                  {/* Delete group */}
                  <button
                    onClick={() => removeGroup(group.artist)}
                    className='text-zinc-500 hover:text-red-400 transition-colors ml-1'
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

                {/* Songs in group */}
                {group.isExpanded && (
                  <div className='space-y-2 p-3'>
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

                          {/* Individual song cover */}
                          <div
                            className='w-10 h-10 rounded-md border border-zinc-600 flex items-center justify-center cursor-pointer hover:border-emerald-500 flex-shrink-0 overflow-hidden'
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                  setSongs((prev) =>
                                    prev.map((s) =>
                                      s.id === song.id ? { ...s, imageFile: file } : s
                                    )
                                  );
                                }
                              };
                              input.click();
                            }}
                          >
                            {song.imageFile ? (
                              <img
                                src={URL.createObjectURL(song.imageFile)}
                                alt='cover'
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <Upload className='h-3 w-3 text-zinc-500' />
                            )}
                          </div>

                          {/* Title & Duration */}
                          <div className='flex-1 grid grid-cols-2 gap-2'>
                            <div>
                              <label className='text-xs text-zinc-400'>Title</label>
                              <Input
                                value={song.title}
                                onChange={(e) => updateSongField(song.id, "title", e.target.value)}
                                className='bg-zinc-700 border-zinc-600 h-7 text-xs mt-0.5'
                                disabled={song.status === "done"}
                              />
                            </div>
                            <div>
                              <label className='text-xs text-zinc-400'>Duration (sec)</label>
                              <Input
                                value={song.duration}
                                onChange={(e) => updateSongField(song.id, "duration", e.target.value)}
                                className='bg-zinc-700 border-zinc-600 h-7 text-xs mt-0.5'
                                type='number'
                                disabled={song.status === "done"}
                              />
                            </div>
                          </div>

                          {/* Status move & remove */}
                          <div className='flex items-center gap-2 flex-shrink-0'>
                            {song.status === "done" && (
                              <CheckCircle className='h-4 w-4 text-emerald-500' />
                            )}
                            {song.status === "uploading" && (
                              <Loader2 className='h-4 w-4 text-blue-400 animate-spin' />
                            )}
                            {song.status === "error" && (
                              <span className='text-xs text-red-400'>Error</span>
                            )}
                            {song.status !== "done" && (
                              <>
                                {/* Move to group */}
                                {artistNames.length > 1 && (
                                  <div className='relative'>
                                    <button
                                      onClick={() => setMovingSongId(
                                        movingSongId === song.id ? null : song.id
                                      )}
                                      className='text-zinc-400 hover:text-blue-400 transition-colors'
                                      title='Move to different group'
                                    >
                                      <MoveRight className='h-3 w-3' />
                                    </button>

                                    {movingSongId === song.id && (
                                      <div className='absolute right-0 bottom-6 bg-zinc-700 border border-zinc-600 rounded-md shadow-xl z-50 min-w-[150px]'>
                                        <p className='text-xs text-zinc-400 px-2 py-1 border-b border-zinc-600'>
                                          Move to:
                                        </p>
                                        {artistNames
                                          .filter((a) => a !== group.artist)
                                          .map((artist) => (
                                            <button
                                              key={artist}
                                              onClick={() => moveSongToGroup(song.id, artist)}
                                              className='w-full text-left px-3 py-1.5 text-xs text-white hover:bg-zinc-600 transition-colors'
                                            >
                                              {artist}
                                            </button>
                                          ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Remove song */}
                                <button
                                  onClick={() => removeSong(song.id)}
                                  className='text-zinc-500 hover:text-red-400'
                                  disabled={isUploading}
                                >
                                  <X className='h-3 w-3' />
                                </button>
                              </>
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
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadDialog;