import { useLikedStore } from "@/stores/useLikedStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LikeButton } from "@/components/LikeButton";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { Heart, Play, Pause, Clock } from "lucide-react";
import { useEffect } from "react";
import { formatDuration } from "@/pages/album/AlbumPage";

const LikedSongsPage = () => {
  const { likedSongs, fetchLikedSongs } = useLikedStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  useEffect(() => {
    fetchLikedSongs();
  }, [fetchLikedSongs]);

  const isCurrentListPlaying =
    likedSongs.some((s) => s._id === currentSong?._id) && isPlaying;

  const handlePlayPause = () => {
    if (isCurrentListPlaying) togglePlay();
    else if (likedSongs.length > 0) playAlbum(likedSongs, 0);
  };

  return (
    <div className='h-full rounded-md overflow-hidden'>
      <ScrollArea className='h-full'>

        {/* Header */}
        <div className='relative min-h-[300px] bg-gradient-to-b from-indigo-800 via-zinc-800 to-zinc-900 p-6'>
          <div className='flex flex-col md:flex-row items-center md:items-end gap-6 mt-10'>
            <div className='size-52 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center shadow-2xl'>
              <Heart className='size-24 text-white' fill='white' />
            </div>
            <div className='flex flex-col gap-3'>
              <p className='text-xs font-semibold uppercase text-zinc-300'>Playlist</p>
              <h1 className='text-4xl md:text-6xl font-bold text-white'>Liked Songs</h1>
              <p className='text-zinc-300 text-sm'>{likedSongs.length} songs</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center gap-6 px-6 py-4 bg-zinc-900'>
          <Button
            onClick={handlePlayPause}
            size='icon'
            className='w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 transition-all'
            disabled={likedSongs.length === 0}
          >
            {isCurrentListPlaying ? (
              <Pause className='h-7 w-7 text-black' />
            ) : (
              <Play className='h-7 w-7 text-black' />
            )}
          </Button>

          {isCurrentListPlaying && (
            <AudioVisualizer className='flex-1 h-12' />
          )}
        </div>

        {/* Song list */}
        <div className='px-6 pb-6 bg-zinc-900'>
          <div className='grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-zinc-800 mb-2'>
            <div>#</div>
            <div>Title</div>
            <div>Artist</div>
            <div className='flex justify-center'><Clock className='h-4 w-4' /></div>
            <div />
          </div>

          {likedSongs.length === 0 ? (
            <div className='text-center py-16'>
              <Heart className='h-12 w-12 text-zinc-600 mx-auto mb-4' />
              <p className='text-zinc-400'>No liked songs yet</p>
              <p className='text-zinc-500 text-sm mt-1'>
                Hit the heart button on any song to save it here
              </p>
            </div>
          ) : (
            <div className='space-y-1'>
              {likedSongs.map((song, index) => {
                const isCurrentSong = currentSong?._id === song._id;
                return (
                  <div
                    key={song._id}
                    onClick={() => playAlbum(likedSongs, index)}
                    className={`grid grid-cols-[16px_4fr_2fr_1fr_40px] gap-4 px-4 py-2 text-sm rounded-md group cursor-pointer hover:bg-zinc-800 ${
                      isCurrentSong ? "bg-zinc-800 text-green-400" : "text-zinc-400"
                    }`}
                  >
                    <div className='flex items-center'>
                      {isCurrentSong && isPlaying ? (
                        <span className='text-green-400'>▶</span>
                      ) : (
                        <span className='group-hover:hidden'>{index + 1}</span>
                      )}
                    </div>

                    <div className='flex items-center gap-3'>
                      <img
                        src={song.imageUrl}
                        alt={song.title}
                        className='size-10 rounded object-cover'
                      />
                      <p className={`font-medium truncate ${isCurrentSong ? "text-green-400" : "text-white"}`}>
                        {song.title}
                      </p>
                    </div>

                    <div className='flex items-center'>{song.artist}</div>

                    <div className='flex items-center justify-center'>
                      {formatDuration(song.duration)}
                    </div>

                    <div className='flex items-center justify-center'>
                      <LikeButton songId={song._id} size='sm' />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default LikedSongsPage;