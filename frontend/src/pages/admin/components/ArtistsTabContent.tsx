import { useState, useMemo } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { axiosInstance } from "@/lib/axios";
import { Search, Pencil, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const ArtistsTabContent = () => {
  const { songs, fetchSongs } = useMusicStore();
  const [search, setSearch] = useState("");
  const [editingArtist, setEditingArtist] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Build unique artist list with song counts from songs already in store
  const artists = useMemo(() => {
    const map = new Map<string, { name: string; count: number; imageUrl: string }>();
    songs.forEach((song) => {
      if (!map.has(song.artist)) {
        map.set(song.artist, { name: song.artist, count: 0, imageUrl: song.imageUrl });
      }
      map.get(song.artist)!.count++;
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [songs]);

  const filtered = artists.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRename = async (oldName: string) => {
    if (!newName.trim() || newName.trim() === oldName) {
      setEditingArtist(null);
      return;
    }

    setIsLoading(true);
    try {
      const res = await axiosInstance.post("/admin/artists/rename", {
        oldName,
        newName: newName.trim(),
      });
      toast.success(res.data.message);
      await fetchSongs();
      setEditingArtist(null);
      setNewName("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to rename artist");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (artist: string) => {
    setEditingArtist(artist);
    setNewName(artist);
  };

  const cancelEdit = () => {
    setEditingArtist(null);
    setNewName("");
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search artists..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
        />
      </div>

      <p className="text-xs text-zinc-500">{filtered.length} artists</p>

      {/* Artist list */}
      <div className="space-y-1">
        {filtered.map((artist) => (
          <div
            key={artist.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 group transition-colors"
          >
            {/* Avatar */}
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />

            {/* Name / Edit input */}
            <div className="flex-1 min-w-0">
              {editingArtist === artist.name ? (
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(artist.name);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="w-full bg-zinc-700 border border-zinc-500 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-green-500"
                />
              ) : (
                <div>
                  <p className="text-sm font-medium text-white truncate">{artist.name}</p>
                  <p className="text-xs text-zinc-400">{artist.count} songs</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {editingArtist === artist.name ? (
                <>
                  <button
                    onClick={() => handleRename(artist.name)}
                    disabled={isLoading}
                    className="p-1.5 text-green-400 hover:text-green-300 transition-colors"
                    title="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startEdit(artist.name)}
                  className="p-1.5 text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Rename artist"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistsTabContent;