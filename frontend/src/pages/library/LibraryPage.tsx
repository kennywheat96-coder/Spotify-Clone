import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ListMusic, Plus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SignedIn } from "@clerk/clerk-react";
import { RequestSongDialog } from "@/components/RequestSongDialog";

const LibraryPage = () => {
  const { playlists, fetchPlaylists, isLoading, createPlaylist } = usePlaylistStore();
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    setShowCreateInput(false);
  };

  return (
    <ScrollArea className='h-full'>
      <div className='p-4 md:p-6'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold text-white'>Your Library</h1>
          <SignedIn>
            <button
              onClick={() => setShowCreateInput(!showCreateInput)}
              className='text-zinc-400 hover:text-white transition-colors p-1'
              title='Create playlist'
            >
              {showCreateInput ? <X className='size-5' /> : <Plus className='size-5' />}
            </button>
          </SignedIn>
        </div>

        {/* Create playlist input */}
        <SignedIn>
          {showCreateInput && (
            <div className='mb-4 flex gap-2'>
              <input
                type='text'
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
                placeholder='Playlist name...'
                autoFocus
                className='flex-1 bg-zinc-800 text-white text-sm px-3 py-2 rounded-lg outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-white'
              />
              <button
                onClick={handleCreatePlaylist}
                className='text-sm bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/80'
              >
                Create
              </button>
            </div>
          )}
        </SignedIn>

        <SignedIn>
          <section className='mb-6'>
            <h2 className='text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3'>
              Playlists
            </h2>

            {isLoading ? (
              <div className='space-y-2'>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className='flex items-center gap-4 p-3'>
                    <div className='size-14 rounded-lg bg-zinc-800 animate-pulse flex-shrink-0' />
                    <div className='space-y-2 flex-1'>
                      <div className='h-4 bg-zinc-800 rounded animate-pulse w-1/2' />
                      <div className='h-3 bg-zinc-800 rounded animate-pulse w-1/3' />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='space-y-1'>
                {/* Liked Songs */}
                <Link to='/liked' className='flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800 transition-colors'>
                  <div className='size-14 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center flex-shrink-0'>
                    <Heart className='size-6 text-white' fill='white' />
                  </div>
                  <div>
                    <p className='font-semibold text-white'>Liked Songs</p>
                    <p className='text-sm text-zinc-400'>Playlist</p>
                  </div>
                </Link>

                {/* User playlists */}
                {playlists.map((playlist) => (
                  <Link key={playlist._id} to={`/playlists/${playlist._id}`}
                    className='flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800 transition-colors'>
                    {playlist.imageUrl ? (
                      <img src={playlist.imageUrl} alt={playlist.name} className='size-14 rounded-lg object-cover flex-shrink-0' />
                    ) : (
                      <div className='size-14 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0'>
                        <ListMusic className='size-6 text-zinc-400' />
                      </div>
                    )}
                    <div>
                      <p className='font-semibold text-white'>{playlist.name}</p>
                      <p className='text-sm text-zinc-400'>Playlist • {playlist.songs.length} songs</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Request a Song */}
          <section>
            <h2 className='text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3'>
              Actions
            </h2>
            <RequestSongDialog />
          </section>
        </SignedIn>
      </div>
    </ScrollArea>
  );
};

export default LibraryPage;
