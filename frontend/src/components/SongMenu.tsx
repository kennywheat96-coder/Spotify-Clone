import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, ListPlus, ListEnd, SkipForward, Disc } from "lucide-react";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useNavigate } from "react-router-dom";
import type { Song } from "@/types";

interface SongMenuProps {
  song: Song & { albumId?: string };
}

export const SongMenu = ({ song }: SongMenuProps) => {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowPlaylists(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleAddToQueue = () => {
    const { queue } = usePlayerStore.getState();
    usePlayerStore.setState({ queue: [...queue, song] });
    setOpen(false);
    import("react-hot-toast").then(({ default: toast }) => toast.success("Added to queue"));
  };

  const handlePlayNext = () => {
    const { queue, currentIndex } = usePlayerStore.getState();
    const newQueue = [...queue];
    newQueue.splice(currentIndex + 1, 0, song);
    usePlayerStore.setState({ queue: newQueue });
    setOpen(false);
    import("react-hot-toast").then(({ default: toast }) => toast.success("Playing next"));
  };

  const handleGoToAlbum = () => {
    if (song.albumId) {
      navigate(`/albums/${song.albumId}`);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
          setShowPlaylists(false);
        }}
        className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700/50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full mb-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-[200] overflow-hidden min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          {!showPlaylists ? (
            <>
              {/* Add to Queue */}
              <button
                onClick={handleAddToQueue}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors"
              >
                <ListEnd className="h-4 w-4 text-zinc-400" />
                Add to Queue
              </button>

              {/* Play Next */}
              <button
                onClick={handlePlayNext}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors"
              >
                <SkipForward className="h-4 w-4 text-zinc-400" />
                Play Next
              </button>

              {/* Add to Playlist */}
              <button
                onClick={() => setShowPlaylists(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors"
              >
                <ListPlus className="h-4 w-4 text-zinc-400" />
                Add to Playlist
              </button>

              {/* Go to Album */}
              {song.albumId && (
                <button
                  onClick={handleGoToAlbum}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors border-t border-zinc-700"
                >
                  <Disc className="h-4 w-4 text-zinc-400" />
                  Go to Album
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setShowPlaylists(false)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-zinc-400 hover:text-white transition-colors border-b border-zinc-700"
              >
                ← Back
              </button>
              <AddToPlaylistMenu songId={song._id} />
            </>
          )}
        </div>
      )}
    </div>
  );
};
