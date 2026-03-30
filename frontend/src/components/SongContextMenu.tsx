import { useState, useRef, useEffect } from "react";
import { AddToPlaylistMenu } from "./AddToPlaylistMenu";
import { ListPlus } from "lucide-react";

interface SongContextMenuProps {
  songId: string;
  children: React.ReactNode;
}

export const SongContextMenu = ({ songId, children }: SongContextMenuProps) => {
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onContextMenu={handleContextMenu} className="relative">
      {children}

      {/* Context menu */}
      {menuPos && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-zinc-800 border border-zinc-700 rounded-md shadow-xl overflow-hidden"
          style={{
            top: menuPos.y,
            left: menuPos.x,
            // Prevent menu going off screen
            transform: `translate(
              ${menuPos.x + 200 > window.innerWidth ? "-100%" : "0"},
              ${menuPos.y + 300 > window.innerHeight ? "-100%" : "0"}
            )`,
          }}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700">
            <ListPlus className="size-4 text-zinc-400" />
            <span className="text-sm text-zinc-400">Add to playlist</span>
          </div>
          <AddToPlaylistMenu songId={songId} />
        </div>
      )}
    </div>
  );
};