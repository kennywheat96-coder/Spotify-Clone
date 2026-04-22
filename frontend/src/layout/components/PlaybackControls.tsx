import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { LikeButton } from "@/components/LikeButton";
import { AddToPlaylistMenu } from "@/components/AddToPlaylistMenu";
import {
  ChevronDown, Laptop2, ListMusic, Mic2, Pause, Play,
  Repeat, Repeat1, Shuffle, SkipBack, SkipForward,
  Volume1, Volume2, VolumeX, ListPlus, X, GripVertical
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const PlaybackControls = () => {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrevious,
    isShuffle, toggleShuffle,
    repeatMode, cycleRepeat,
    isQueueVisible, toggleQueue,
    queue, currentIndex,
removeFromQueue, reorderQueue, moveToFirst,
  } = usePlayerStore();

  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Mobile queue drag state
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragFromIndex = useRef<number | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const pointerStartY = useRef(0);
  const mobileQueueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    audioRef.current = document.querySelector("audio");
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => usePlayerStore.setState({ isPlaying: false });

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentSong]);

  const handleSeek = (value: number[]) => {
    if (audioRef.current) audioRef.current.currentTime = value[0];
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (audioRef.current) audioRef.current.volume = value[0] / 100;
  };

  const toggleMute = () => {
    const newVolume = volume === 0 ? 75 : 0;
    setVolume(newVolume);
    if (audioRef.current) audioRef.current.volume = newVolume / 100;
  };

  // Mobile queue pointer handlers
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

    if (deltaY > 30 && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (dragFromIndex.current === null || deltaY < 8) return;

    isDragging.current = true;
    setDraggingIndex(dragFromIndex.current);

    if (!mobileQueueRef.current) return;
    const rows = mobileQueueRef.current.querySelectorAll("[data-queue-item]");
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

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;
  const progress = duration ? (currentTime / duration) * 100 : 0;
  const upNext = queue.slice(currentIndex + 1);

  return (
    <>
      {/* ─── DESKTOP PLAYER ─── */}
      <footer className={`hidden sm:block h-24 bg-zinc-900 border-t px-4 transition-all duration-500 ${
        currentSong ? "border-green-500/20 shadow-[0_-4px_20px_rgba(34,197,94,0.1)]" : "border-zinc-800"
      }`}>
        <div className='flex justify-between items-center h-full max-w-[1800px] mx-auto'>
          <div className='flex items-center gap-4 min-w-[180px] w-[30%]'>
            {currentSong && (
              <>
                <img src={currentSong.imageUrl} alt={currentSong.title} className='w-14 h-14 object-cover rounded-md' />
                <div className='flex-1 min-w-0'>
                  <div className='font-medium truncate hover:underline cursor-pointer'>{currentSong.title}</div>
                  <div className='text-sm text-zinc-400 truncate hover:underline cursor-pointer'>{currentSong.artist}</div>
                </div>
                <LikeButton songId={currentSong._id} size='sm' />
              </>
            )}
          </div>

          <div className='flex flex-col items-center gap-2 flex-1 max-w-[45%]'>
            <div className='flex items-center gap-6'>
              <Button size='icon' variant='ghost'
                className={`hover:text-white ${isShuffle ? "text-green-500" : "text-zinc-400"}`}
                onClick={toggleShuffle} disabled={!currentSong}>
                <Shuffle className='h-4 w-4' />
              </Button>
              <Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'
                onClick={playPrevious} disabled={!currentSong}>
                <SkipBack className='h-4 w-4' />
              </Button>
              <Button size='icon'
                className='bg-white hover:bg-white/80 text-black rounded-full h-8 w-8'
                onClick={togglePlay} disabled={!currentSong}>
                {isPlaying ? <Pause className='h-5 w-5' /> : <Play className='h-5 w-5' />}
              </Button>
              <Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'
                onClick={playNext} disabled={!currentSong}>
                <SkipForward className='h-4 w-4' />
              </Button>
              <Button size='icon' variant='ghost'
                className={`hover:text-white ${repeatMode !== "off" ? "text-green-500" : "text-zinc-400"}`}
                onClick={cycleRepeat} disabled={!currentSong}>
                <RepeatIcon className='h-4 w-4' />
              </Button>
            </div>
            <div className='flex items-center gap-2 w-full'>
              <div className='text-xs text-zinc-400'>{formatTime(currentTime)}</div>
              <Slider value={[currentTime]} max={duration || 100} step={1}
                className='w-full hover:cursor-grab active:cursor-grabbing' onValueChange={handleSeek} />
              <div className='text-xs text-zinc-400'>{formatTime(duration)}</div>
            </div>
          </div>

          <div className='flex items-center gap-4 min-w-[180px] w-[30%] justify-end'>
            <Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'><Mic2 className='h-4 w-4' /></Button>
            <Button size='icon' variant='ghost'
              className={`hover:text-white ${isQueueVisible ? "text-green-500" : "text-zinc-400"}`}
              onClick={toggleQueue}>
              <ListMusic className='h-4 w-4' />
            </Button>
            <Button size='icon' variant='ghost' className='hover:text-white text-zinc-400'><Laptop2 className='h-4 w-4' /></Button>
            <div className='flex items-center gap-2'>
              <Button size='icon' variant='ghost' className='hover:text-white text-zinc-400' onClick={toggleMute}>
                <VolumeIcon className='h-4 w-4' />
              </Button>
              <Slider value={[volume]} max={100} step={1}
                className='w-24 hover:cursor-grab active:cursor-grabbing' onValueChange={handleVolumeChange} />
            </div>
          </div>
        </div>
      </footer>

      {/* ─── MOBILE MINI PLAYER ─── */}
      <div className={`sm:hidden fixed left-2 right-2 z-40 transition-all duration-500 ease-in-out ${
        currentSong && !isExpanded
          ? "bottom-[4.5rem] opacity-100 translate-y-0"
          : "bottom-[4.5rem] opacity-0 translate-y-4 pointer-events-none"
      }`}>
        {currentSong && (
          <div
            className='relative overflow-hidden rounded-xl bg-zinc-900 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.15)] cursor-pointer'
            onClick={() => setIsExpanded(true)}
          >
            <div className='absolute top-0 left-0 right-0 h-0.5 bg-zinc-700'>
              <div className='h-full bg-green-500 transition-all duration-300' style={{ width: `${progress}%` }} />
            </div>
            <div className='absolute inset-0 opacity-10'>
              <img src={currentSong.imageUrl} alt='' className='w-full h-full object-cover blur-xl scale-110' />
            </div>
            <div className='relative flex items-center gap-3 px-3 py-2.5'>
              <img src={currentSong.imageUrl} alt={currentSong.title}
                className={`w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-lg ${isPlaying ? "ring-2 ring-green-500/50" : ""}`}
              />
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-semibold text-white truncate'>{currentSong.title}</p>
                <p className='text-xs text-zinc-400 truncate'>{currentSong.artist}</p>
              </div>
              <div className='flex items-center gap-1 flex-shrink-0' onClick={(e) => e.stopPropagation()}>
                <LikeButton songId={currentSong._id} size='sm' />
                <button onClick={playPrevious} className='p-2 text-zinc-400 hover:text-white transition-colors'>
                  <SkipBack className='h-4 w-4' />
                </button>
                <button onClick={togglePlay}
                  className='w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform'>
                  {isPlaying ? <Pause className='h-4 w-4 text-black' /> : <Play className='h-4 w-4 text-black ml-0.5' />}
                </button>
                <button onClick={playNext} className='p-2 text-zinc-400 hover:text-white transition-colors'>
                  <SkipForward className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MOBILE EXPANDED PLAYER ─── */}
      <div className={`sm:hidden fixed inset-0 z-[100] flex flex-col transition-all duration-500 ease-in-out ${
        isExpanded && currentSong ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"
      }`}>
        {currentSong && (
          <>
            <div className='absolute inset-0'>
              <img src={currentSong.imageUrl} alt='' className='w-full h-full object-cover blur-3xl scale-110 opacity-40' />
              <div className='absolute inset-0 bg-zinc-950/70' />
            </div>

            <div className='relative flex flex-col h-full px-6 pt-12 pb-8'>

              {/* Header */}
              <div className='flex items-center justify-between mb-6'>
                <button onClick={() => { setIsExpanded(false); setShowQueue(false); setShowAddToPlaylist(false); }}
                  className='text-white p-2'>
                  <ChevronDown className='h-6 w-6' />
                </button>
                <p className='text-sm font-semibold text-white'>
                  {showQueue ? "Queue" : showAddToPlaylist ? "Add to Playlist" : "Now Playing"}
                </p>
                <div className='flex gap-2'>
                  <button
                    onClick={() => { setShowAddToPlaylist(!showAddToPlaylist); setShowQueue(false); }}
                    className={`p-2 transition-colors ${showAddToPlaylist ? "text-green-400" : "text-zinc-400"}`}
                  >
                    <ListPlus className='h-5 w-5' />
                  </button>
                  <button
                    onClick={() => { setShowQueue(!showQueue); setShowAddToPlaylist(false); }}
                    className={`p-2 transition-colors ${showQueue ? "text-green-400" : "text-zinc-400"}`}
                  >
                    <ListMusic className='h-5 w-5' />
                  </button>
                </div>
              </div>

              {/* Add to Playlist view */}
              {showAddToPlaylist && (
                <div className='flex-1 overflow-y-auto'>
                  <AddToPlaylistMenu songId={currentSong._id} />
                </div>
              )}

              {/* Queue view */}
              {showQueue && !showAddToPlaylist && (
                <div className='flex-1 overflow-y-auto space-y-2'>
                  <p className='text-xs text-zinc-400 uppercase tracking-wider mb-3'>Now Playing</p>
                  <div className='flex items-center gap-3 bg-zinc-800/50 rounded-lg p-3 mb-4'>
                    <img src={currentSong.imageUrl} alt={currentSong.title} className='w-10 h-10 rounded object-cover' />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-green-400 truncate'>{currentSong.title}</p>
                      <p className='text-xs text-zinc-400 truncate'>{currentSong.artist}</p>
                    </div>
                  </div>

                  {upNext.length > 0 && (
                    <>
                      <p className='text-xs text-zinc-400 uppercase tracking-wider mb-1'>
                        Next Up ({upNext.length})
                      </p>
                      <p className='text-xs text-zinc-600 mb-2'>Drag to reorder · Hold to play next</p>
                      <div className='space-y-1' ref={mobileQueueRef}>
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
                              className={`flex items-center gap-3 p-3 rounded-lg select-none transition-all
                                ${isBeingDragged ? "opacity-40 bg-zinc-700" : "bg-zinc-800/30"}
                                ${isDropTarget ? "border-t-2 border-green-500" : ""}
                              `}
                              style={{ touchAction: "pan-y" }}
                            >
                              <GripVertical className='h-4 w-4 text-zinc-600 flex-shrink-0' />
                              <img
                                src={song.imageUrl}
                                alt={song.title}
                                className='w-10 h-10 rounded object-cover flex-shrink-0 pointer-events-none'
                              />
                              <div className='flex-1 min-w-0 pointer-events-none'>
                                <p className='text-sm text-white truncate'>{song.title}</p>
                                <p className='text-xs text-zinc-400 truncate'>{song.artist}</p>
                              </div>
                              <button
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={() => removeFromQueue(absoluteIndex)}
                                className='p-1.5 text-zinc-400 hover:text-red-400 transition-colors flex-shrink-0'
                              >
                                <X className='h-4 w-4' />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {upNext.length === 0 && (
                    <p className='text-zinc-500 text-sm text-center mt-8'>No more songs in queue</p>
                  )}
                </div>
              )}

              {/* Normal player view */}
              {!showQueue && !showAddToPlaylist && (
                <>
                  <div className='flex justify-center mb-8'>
                    <img src={currentSong.imageUrl} alt={currentSong.title}
                      className={`w-64 h-64 rounded-2xl object-cover shadow-2xl transition-all duration-300 ${
                        isPlaying ? "scale-100 shadow-[0_0_60px_rgba(34,197,94,0.3)]" : "scale-95 opacity-80"
                      }`}
                    />
                  </div>

                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex-1 min-w-0 mr-4'>
                      <p className='text-xl font-bold text-white truncate'>{currentSong.title}</p>
                      <p className='text-zinc-400 truncate'>{currentSong.artist}</p>
                    </div>
                    <LikeButton songId={currentSong._id} size='sm' />
                  </div>

                  <div className='mb-4'>
                    <Slider value={[currentTime]} max={duration || 100} step={1}
                      className='w-full hover:cursor-grab active:cursor-grabbing' onValueChange={handleSeek} />
                    <div className='flex justify-between mt-1'>
                      <span className='text-xs text-zinc-400'>{formatTime(currentTime)}</span>
                      <span className='text-xs text-zinc-400'>{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between mb-8'>
                    <button onClick={toggleShuffle}
                      className={`p-2 transition-colors ${isShuffle ? "text-green-500" : "text-zinc-400"}`}>
                      <Shuffle className='h-5 w-5' />
                    </button>
                    <button onClick={playPrevious} className='p-2 text-white'>
                      <SkipBack className='h-7 w-7' />
                    </button>
                    <button onClick={togglePlay}
                      className='w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl active:scale-95 transition-transform'>
                      {isPlaying ? <Pause className='h-7 w-7 text-black' /> : <Play className='h-7 w-7 text-black ml-1' />}
                    </button>
                    <button onClick={playNext} className='p-2 text-white'>
                      <SkipForward className='h-7 w-7' />
                    </button>
                    <button onClick={cycleRepeat}
                      className={`p-2 transition-colors ${repeatMode !== "off" ? "text-green-500" : "text-zinc-400"}`}>
                      <RepeatIcon className='h-5 w-5' />
                    </button>
                  </div>

                  <div className='flex items-center gap-3'>
                    <button onClick={toggleMute} className='text-zinc-400'>
                      <VolumeIcon className='h-4 w-4' />
                    </button>
                    <Slider value={[volume]} max={100} step={1}
                      className='flex-1 hover:cursor-grab active:cursor-grabbing' onValueChange={handleVolumeChange} />
                    <Volume2 className='h-4 w-4 text-zinc-400' />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};