import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

export const QueuePanel = () => {
  const {
    queue,
    currentSong,
    currentIndex,
    isQueueVisible,
    toggleQueue,
    setCurrentSong,
    removeFromQueue,
    reorderQueue,
    moveToFirst,
  } = usePlayerStore();

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const dragFromIndex = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const pointerStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isQueueVisible) return null;

  const upNext = queue.slice(currentIndex + 1);
  const prevSongs = queue.slice(0, currentIndex);

  const handlePointerDown = (e: React.PointerEvent, absoluteIndex: number) => {
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        moveToFirst(absoluteIndex);
      }
    }, 500);

    pointerStartY.current = e.clientY;
    dragFromIndex.current = absoluteIndex;
    isDragging.current = false;

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const deltaY = Math.abs(e.clientY - pointerStartY.current);

    if (deltaY > 8 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (dragFromIndex.current === null) return;
    if (deltaY < 30) return;

    isDragging.current = true;
    setDraggingIndex(dragFromIndex.current);

    if (!containerRef.current) return;
    const rows = containerRef.current.querySelectorAll("[data-queue-item]");
    let closestIndex: number | null = null;
    let closestDist = Infinity;

    rows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      const dist = Math.abs(e.clientY - midY);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = Number((row as HTMLElement).dataset.queueItem);
      }
    });

    setDragOverIndex(closestIndex);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (
      isDragging.current &&
      dragFromIndex.current !== null &&
      dragOverIndex !== null &&
      dragFromIndex.current !== dragOverIndex
    ) {
      reorderQueue(dragFromIndex.current, dragOverIndex);
    }

    dragFromIndex.current = null;
    isDragging.current = false;
    setDraggingIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="fixed right-0 top-0 h-[calc(100vh-6rem)] w-80 bg-zinc-900 border-l border-zinc-800 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="font-semibold text-white">Queue</h2>
        <Button size="icon" variant="ghost" onClick={toggleQueue}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">

          {/* Now Playing */}
          {currentSong && (
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">Now Playing</p>
              <div className="flex items-center gap-3 bg-zinc-800 rounded-md p-2">
                <img
                  src={currentSong.imageUrl}
                  alt={currentSong.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-400 truncate">{currentSong.title}</p>
                  <p className="text-xs text-zinc-400 truncate">{currentSong.artist}</p>
                </div>
              </div>
            </div>
          )}

          {/* Up Next */}
          {upNext.length > 0 && (
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">
                Next Up ({upNext.length})
              </p>
              <p className="text-xs text-zinc-600 mb-2">Drag to reorder · Hold to play next</p>
              <div className="space-y-1" ref={containerRef}>
                {upNext.map((song, i) => {
                  const absoluteIndex = currentIndex + 1 + i;
                  const isBeingDragged = draggingIndex === absoluteIndex;
                  const isDropTarget = dragOverIndex === absoluteIndex && !isBeingDragged;

                  return (
                    <div
                      key={`${song._id}-${i}`}
                      data-queue-item={absoluteIndex}
                      onPointerDown={(e) => handlePointerDown(e, absoluteIndex)}
                      onPointerMove={(e) => handlePointerMove(e)}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      className={`flex items-center gap-3 p-2 rounded-md group transition-all select-none
                        ${isBeingDragged ? "opacity-40 bg-zinc-700" : "hover:bg-zinc-800"}
                        ${isDropTarget ? "border-t-2 border-green-500" : ""}
                      `}
                      style={{ touchAction: "none" }}
                    >
                      <GripVertical className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400 flex-shrink-0 transition-colors" />

                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className="w-9 h-9 rounded object-cover flex-shrink-0 pointer-events-none"
                      />
                      <div className="flex-1 min-w-0 pointer-events-none">
                        <p className="text-sm text-white truncate group-hover:text-green-400 transition-colors">
                          {song.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                      </div>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => removeFromQueue(absoluteIndex)}
                        className="p-1 text-zinc-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Previously Played */}
          {prevSongs.length > 0 && (
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wider mb-3">
                Previously Played
              </p>
              <div className="space-y-1">
                {prevSongs.map((song, i) => (
                  <div
                    key={`${song._id}-prev-${i}`}
                    onClick={() => setCurrentSong(song)}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800 cursor-pointer group opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <img src={song.imageUrl} alt={song.title} className="w-9 h-9 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{song.title}</p>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upNext.length === 0 && prevSongs.length === 0 && !currentSong && (
            <p className="text-zinc-400 text-sm text-center mt-8">No songs in queue</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};