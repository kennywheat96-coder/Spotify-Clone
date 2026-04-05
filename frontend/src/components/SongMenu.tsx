import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, ListPlus, ListEnd, SkipForward, Disc } from "lucide-react";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useNavigate } from "react-router-dom";
import type { Song } from "@/types";

interface SongMenuProps {
  song: Song;
}

export const SongMenu = ({ song }: SongMenuProps) => {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Calculate menu position when opening
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const menuHeight = 200;
    const menuWidth = 200;

    // Position above or below depending on space
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow > menuHeight
      ? rect.bottom + 4
      : rect.top - menuHeight - 4;

    // Position left or right depending on space
    const spaceRight = window.innerWidth - rect.left;
    const left = spaceRight > menuWidth
      ? rect.left
      : rect.right - menuWidth;

    setMenuPos({ top, left });
    setOpen(!open);
    setShowPlaylists(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setShowPlaylists(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close on scroll
  useEffect(() => {
    const handleScroll = () => {
      setOpen(false);
      setShowPlaylists(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
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
    <>
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-700/50"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-[9999] overflow-hidden min-w-[200px]"
          style={{ top: menuPos.top, left: menuPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          {!showPlaylists ? (
            <>
              <button
                onClick={handleAddToQueue}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors"
              >
                <ListEnd className="h-4 w-4 text-zinc-400" />
                Add to Queue
              </button>

              <button
                onClick={handlePlayNext}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors"
              >
                <SkipForward className="h-4 w-4 text-zinc-400" />
                Play Next
              </button>

              <button
                onClick={() => setShowPlaylists(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-zinc-700 transition-colors"
              >
                <ListPlus className="h-4 w-4 text-zinc-400" />
                Add to Playlist
              </button>

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
        </div>,
        document.body
      )}
    </>
  );
};
