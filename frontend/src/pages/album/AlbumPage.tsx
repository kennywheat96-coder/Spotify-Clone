import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { LikeButton } from "@/components/LikeButton";
import { SongMenu } from "@/components/SongMenu";
import { Clock, Pause, Play, Shuffle } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const AlbumPage = () => {
  const { albumId } = useParams();
  const { fetchAlbumById, currentAlbum, isLoading } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay, toggleShuffle, isShuffle } = usePlayerStore();

  useEffect(() => {
    if (albumId) fetchAlbumById(albumId);
  }, [fetchAlbumById, albumId]);

  if (isLoading) return null;

  const handlePlayAlbum = () => {
    if (!currentAlbum) return;
    const isCurrentAlbumPlaying = currentAlbum?.songs.some((song) => song._id === currentSong?._id);
    if (isCurrentAlbumPlaying) togglePlay();
    else playAlbum(currentAlbum?.songs, 0);
  };

  const handleShuffle = () => {
    if (!currentAlbum) return;
    const shuffled = [...currentAlbum.songs].sort(() => Math.random() - 0.5);
    playAlbum(shuffled, 0);
    if (!isShuffle) toggleShuffle();
  };

  const handlePlaySong = (index: number) => {
    if (!currentAlbum) return;
    playAlbum(currentAlbum?.songs, index);
  };

  const isCurrentAlbumPlaying =
    currentAlbum?.songs.some((song) => song._id === currentSong?._id) && isPlaying;

  return (
    <div className='h-full'>
      <ScrollArea className='h-full rounded-md'>
        <div className='relative min-h-full'>
          <div
            className='absolute inset-0 bg-gradient-to-b from-[#5038a0]/80 via-zinc-900/80 to-zinc-900 pointer-events-none'
            aria-hidden='true'
          />

          <div className='relative z-10'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row p-4 sm:p-6 gap-4 sm:gap-6 pb-6 sm:pb-8 items-center sm:items-end'>
              <img
                src={currentAlbum?.imageUrl}
                alt={currentAlbum?.title}
                className='w-36 h-36 sm:w-[240px] sm:h-[240px] shadow-xl rounded flex-shrink-0'
              />
              <div className='flex flex-col justify-end text-center sm:text-left'>
                <p className='text-sm font-medium'>Album</p>
                <h1 className='text-3xl sm:text-5xl lg:text-7xl font-bold my-2 sm:my-4 line-clamp-2'>
                  {currentAlbum?.title}
                </h1>
                <div className='flex items-center justify-center sm:justify-start gap-2 text-sm text-zinc-100 flex-wrap'>
                  <span className='font-medium text-white'>{currentAlbum?.artist}</span>
                  <span>• {currentAlbum?.songs.length} songs</span>
                  <span>• {currentAlbum?.releaseYear}</span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className='px-4 sm:px-6 pb-4 flex items-center gap-4'>
              <Button
                onClick={handlePlayAlbum}
                size='icon'
                className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 transition-all'
              >
                {isCurrentAlbumPlaying ? (
                  <Pause className='h-5 w-5 sm:h-7 sm:w-7 text-black' />
                ) : (
                  <Play className='h-5 w-5 sm:h-7 sm:w-7 text-black' />
                )}
              </Button>

              <Button
                onClick={handleShuffle}
                size='icon'
                variant='ghost'
                className={`w-10 h-10 transition-colors ${isShuffle ? "text-green-500" : "text-zinc-400 hover:text-white"}`}
              >
                <Shuffle className='h-5 w-5' />
              </Button>

              {isCurrentAlbumPlaying && (
                <div className='hidden sm:block flex-1'>
                  <AudioVisualizer className='w-full h-12' />
                </div>
              )}
            </div>

            {/* Song list */}
            <div className='bg-black/20 backdrop-blur-sm'>
              {/* Desktop header */}
              <div className='hidden sm:grid grid-cols-[16px_4fr_2fr_1fr_auto] gap-4 px-10 py-2 text-sm text-zinc-400 border-b border-white/5'>
                <div>#</div>
                <div>Title</div>
                <div>Released Date</div>
                <div><Clock className='h-4 w-4' /></div>
                <div />
              </div>

              {/* Mobile header */}
              <div className='grid sm:hidden grid-cols-[16px_1fr_auto_auto] gap-3 px-4 py-2 text-sm text-zinc-400 border-b border-white/5'>
                <div>#</div>
                <div>Title</div>
                <div><Clock className='h-4 w-4' /></div>
                <div />
              </div>

              <div className='px-2 sm:px-6'>
                <div className='space-y-1 py-4'>
                  {currentAlbum?.songs.map((song, index) => {
                    const isCurrentSong = currentSong?._id === song._id;
                    return (
                      <div
                        key={song._id}
                        onClick={() => handlePlaySong(index)}
                        className={`grid grid-cols-[16px_1fr_auto_auto] sm:grid-cols-[16px_4fr_2fr_1fr_auto] gap-3 sm:gap-4 px-3 sm:px-4 py-2 text-sm
                          text-zinc-400 hover:bg-white/5 rounded-md group cursor-pointer ${
                            isCurrentSong ? "bg-white/10 text-green-400" : ""
                          }`}
                      >
                        <div className='flex items-center justify-center'>
                          {isCurrentSong && isPlaying ? (
                            <div className='size-4 text-green-500'>♫</div>
                          ) : (
                            <span className='group-hover:hidden'>{index + 1}</span>
                          )}
                          {!isCurrentSong && (
                            <Play className='h-4 w-4 hidden group-hover:block' />
                          )}
                        </div>

                        <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                          <img src={song.imageUrl} alt={song.title} className='size-9 sm:size-10 flex-shrink-0' />
                          <div className='min-w-0'>
                            <div className={`font-medium truncate ${isCurrentSong ? "text-green-400" : "text-white"}`}>
                              {song.title}
                            </div>
                            <div className='truncate text-xs sm:text-sm'>{song.artist}</div>
                          </div>
                        </div>

                        {/* Released date - desktop only */}
                        <div className='hidden sm:flex items-center'>
                          {song.createdAt.split("T")[0]}
                        </div>

                        <div className='flex items-center text-xs sm:text-sm'>
                          {formatDuration(song.duration)}
                        </div>

                        <div className='flex items-center gap-1 sm:gap-2' onClick={(e) => e.stopPropagation()}>
                          <LikeButton songId={song._id} size='sm' />
                          <SongMenu song={song} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default AlbumPage;