import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ListMusic } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SignedIn } from "@clerk/clerk-react";

const LibraryPage = () => {
  const { playlists, fetchPlaylists, isLoading } = usePlaylistStore();

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  return (
    <ScrollArea className='h-full'>
      <div className='p-4 md:p-6'>
        <h1 className='text-2xl font-bold text-white mb-6'>Your Library</h1>
        <SignedIn>
          <section>
            <h2 className='text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3'>
              Playlists
            </h2>
            {isLoading ? (
              <div className='space-y-2'>
                {Array.from({ length: 4 }).map((_, i) => (
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
              <div className='space-y-2'>
                <Link to='/liked' className='flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800 transition-colors'>
                  <div className='size-14 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center flex-shrink-0'>
                    <Heart className='size-6 text-white' fill='white' />
                  </div>
                  <div>
                    <p className='font-semibold text-white'>Liked Songs</p>
                    <p className='text-sm text-zinc-400'>Playlist</p>
                  </div>
                </Link>
                {playlists.map((playlist) => (
                  <Link key={playlist._id} to={`/playlists/${playlist._id}`} className='flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800 transition-colors'>
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
        </SignedIn>
      </div>
    </ScrollArea>
  );
};

export default LibraryPage;
