import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { SongMenu } from "@/components/SongMenu";
import { Clock, ListMusic, Play, Pause, Trash2, Shuffle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import type { Song } from "@/types";

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const { currentPlaylist, fetchPlaylistById, deletePlaylist, removeSongFromPlaylist } = usePlaylistStore();
  const { currentSong, isPlaying, playAlbum, togglePlay, toggleShuffle, isShuffle } = usePlayerStore();
  const { user } = useUser();

  useEffect(() => {
    if (playlistId) fetchPlaylistById(playlistId);
  }, [playlistId, fetchPlaylistById]);

  if (!currentPlaylist) return null;

  const songs = currentPlaylist.songs as unknown as Song[];
  const isOwner = currentPlaylist.owner === user?.id;
  const isCurrentPlaylistPlaying =
    songs.some((s) => s._id === currentSong?._id) && isPlaying;

  const handlePlayPause = () => {
    if (isCurrentPlaylistPlaying) togglePlay();
    else playAlbum(songs, 0);
  };

  const handleShuffle = () => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playAlbum(shuffled, 0);
    if (!isShuffle) toggleShuffle();
  };

  const handleDelete = async () => {
    if (!playlistId) return;
    await deletePlaylist(playlistId);
    window.history.back();
  };

  return (
    <div className='h-full rounded-md overflow-hidden'>
      <ScrollArea className='h-full'>

        {/* Header */}
        <div className='relative bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-4 sm:p-6'>
          <div className='flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 mt-4 sm:mt-10'>
            <div className='w-36 h-36 sm:size-52 rounded-md bg-zinc-700 flex items-center justify-center flex-shrink-0 shadow-2xl'>
              {currentPlaylist.imageUrl ? (
                <img src={currentPlaylist.imageUrl} alt={currentPlaylist.name} className='size-full object-cover rounded-md' />
              ) : (
                <ListMusic className='size-12 sm:size-20 text-zinc-400' />
              )}
            </div>
            <div className='flex flex-col gap-2 text-center sm:text-left'>
              <p className='text-xs font-semibold uppercase text-zinc-400'>Playlist</p>
              <h1 className='text-3xl sm:text-5xl md:text-6xl font-bold text-white line-clamp-2'>
                {currentPlaylist.name}
              </h1>
              {currentPlaylist.description && (
                <p className='text-zinc-400 text-sm'>{currentPlaylist.description}</p>
              )}
              <p className='text-zinc-400 text-sm'>{songs.length} songs</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className='flex items-center gap-4 px-4 sm:px-6 py-4 bg-zinc-900'>
          <Button
            onClick={handlePlayPause}
            size='icon'
            className='w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 transition-all'
            disabled={songs.length === 0}
          >
            {isCurrentPlaylistPlaying ? (
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
            disabled={songs.length === 0}
          >
            <Shuffle className='h-5 w-5' />
          </Button>

          {isCurrentPlaylistPlaying && (
            <div className='hidden sm:block flex-1'>
              <AudioVisualizer className='w-full h-12' />
            </div>
          )}

          {isOwner && (
            <Button
              onClick={handleDelete}
              size='icon'
              variant='ghost'
              className='text-zinc-400 hover:text-red-400 transition-colors ml-auto'
              title='Delete playlist'
            >
              <Trash2 className='h-5 w-5' />
            </Button>
          )}
        </div>

        {/* Song list */}
        <div className='px-2 sm:px-6 pb-6 bg-zinc-900'>
          {/* Desktop header */}
          <div className='hidden sm:grid grid-cols-[16px_4fr_2fr_auto] gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-zinc-800 mb-2'>
            <div>#</div>
            <div>Title</div>
            <div>Artist</div>
            <div className='flex justify-end'><Clock className='h-4 w-4' /></div>
          </div>

          {/* Mobile header */}
          <div className='grid sm:hidden grid-cols-[16px_1fr_auto] gap-3 px-3 py-2 text-sm text-zinc-400 border-b border-zinc-800 mb-2'>
            <div>#</div>
            <div>Title</div>
            <div />
          </div>

          {songs.length === 0 ? (
            <div className='text-center py-16'>
              <ListMusic className='h-12 w-12 text-zinc-600 mx-auto mb-4' />
              <p className='text-zinc-400'>No songs in this playlist yet</p>
              <p className='text-zinc-500 text-sm mt-1'>Search for songs and add them here</p>
            </div>
          ) : (
            <div className='space-y-1'>
              {songs.map((song, index) => {
                const isCurrentSong = currentSong?._id === song._id;
                return (
                  <div
                    key={song._id}
                    onClick={() => playAlbum(songs, index)}
                    className={`grid grid-cols-[16px_1fr_auto] sm:grid-cols-[16px_4fr_2fr_auto] gap-3 sm:gap-4 px-3 sm:px-4 py-2 text-sm rounded-md group cursor-pointer hover:bg-zinc-800 ${
                      isCurrentSong ? "bg-zinc-800 text-green-400" : "text-zinc-400"
                    }`}
                  >
                    <div className='flex items-center'>
                      {isCurrentSong && isPlaying ? (
                        <div className='size-4 text-green-400'>▶</div>
                      ) : (
                        <span className='group-hover:hidden'>{index + 1}</span>
                      )}
                    </div>

                    <div className='flex items-center gap-2 sm:gap-3 min-w-0'>
                      <img src={song.imageUrl} alt={song.title} className='size-9 sm:size-10 rounded object-cover flex-shrink-0' />
                      <div className='min-w-0'>
                        <p className={`font-medium truncate ${isCurrentSong ? "text-green-400" : "text-white"}`}>
                          {song.title}
                        </p>
                        <p className='text-xs text-zinc-400 truncate sm:hidden'>{song.artist}</p>
                      </div>
                    </div>

                    {/* Artist - desktop only */}
                    <div className='hidden sm:flex items-center'>{song.artist}</div>

                    <div className='flex items-center justify-end gap-1 sm:gap-2' onClick={(e) => e.stopPropagation()}>
                      {isOwner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSongFromPlaylist(currentPlaylist._id, song._id);
                          }}
                          className='opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400 transition-all'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      )}
                      <SongMenu song={song} />
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

export default PlaylistPage;