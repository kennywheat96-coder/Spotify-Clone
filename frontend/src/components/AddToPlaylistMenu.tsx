import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useUser } from "@clerk/clerk-react";
import { ListMusic, Check } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface AddToPlaylistMenuProps {
  songId: string;
}

export const AddToPlaylistMenu = ({ songId }: AddToPlaylistMenuProps) => {
  const { playlists, addSongToPlaylist } = usePlaylistStore();
  const { user } = useUser();
  const [addedTo, setAddedTo] = useState<string | null>(null);

  const userPlaylists = playlists.filter((p) => p.owner === user?.id);

  const handleAdd = async (playlistId: string, playlistName: string) => {
    await addSongToPlaylist(playlistId, songId);
    setAddedTo(playlistId);
    toast.success(`Added to ${playlistName}`);
    setTimeout(() => setAddedTo(null), 2000);
  };

  if (userPlaylists.length === 0) {
    return (
      <div className="p-3 text-xs text-zinc-400 text-center">
        No playlists yet. Create one first!
      </div>
    );
  }

  return (
    <div className="py-1 min-w-[180px]">
      <p className="text-xs text-zinc-500 uppercase tracking-wider px-3 py-1">
        Add to playlist
      </p>
      {userPlaylists.map((playlist) => (
        <button
          key={playlist._id}
          onClick={() => handleAdd(playlist._id, playlist.name)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
        >
          {playlist.imageUrl ? (
            <img
              src={playlist.imageUrl}
              alt={playlist.name}
              className="size-8 rounded object-cover"
            />
          ) : (
            <div className="size-8 rounded bg-zinc-600 flex items-center justify-center">
              <ListMusic className="size-4 text-zinc-400" />
            </div>
          )}
          <span className="flex-1 text-left truncate">{playlist.name}</span>
          {addedTo === playlist._id && (
            <Check className="size-4 text-green-400" />
          )}
        </button>
      ))}
    </div>
  );
};