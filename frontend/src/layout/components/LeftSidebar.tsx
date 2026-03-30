import PlaylistSkeleton from "@/components/skeletons/PlaylistSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { SignedIn } from "@clerk/clerk-react";
import { Heart, HomeIcon, Library, MessageCircle, Plus, ListMusic } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RequestSongDialog } from "@/components/RequestSongDialog";

const LeftSidebar = () => {
  const { albums, fetchAlbums, isLoading } = useMusicStore();
  const { playlists, fetchPlaylists, createPlaylist } = usePlaylistStore();
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    fetchAlbums();
    fetchPlaylists();
  }, [fetchAlbums, fetchPlaylists]);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await createPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    setShowCreateInput(false);
  };

  return (
    <div className='h-full flex flex-col gap-2'>
      {/* Navigation menu */}
      <div className='rounded-lg bg-zinc-900 p-4'>
        <div className='space-y-2'>
          <Link
            to={"/"}
            className={cn(
              buttonVariants({
                variant: "ghost",
                className: "w-full justify-start text-white hover:bg-zinc-800",
              })
            )}
          >
            <HomeIcon className='mr-2 size-5' />
            <span className='hidden md:inline'>Home</span>
          </Link>

          <SignedIn>
            <Link
              to={"/chat"}
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  className: "w-full justify-start text-white hover:bg-zinc-800",
                })
              )}
            >
              <MessageCircle className='mr-2 size-5' />
              <span className='hidden md:inline'>Messages</span>
            </Link>
          </SignedIn>

          {/* Request a Song */}
          <SignedIn>
            <RequestSongDialog />
          </SignedIn>
        </div>
      </div>

      {/* Library section */}
      <div className='flex-1 rounded-lg bg-zinc-900 p-4'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center text-white px-2'>
            <Library className='size-5 mr-2' />
            <span className='hidden md:inline'>Your Library</span>
          </div>

          <SignedIn>
            <button
              onClick={() => setShowCreateInput(!showCreateInput)}
              className='text-zinc-400 hover:text-white transition-colors'
              title='Create playlist'
            >
              <Plus className='size-5' />
            </button>
          </SignedIn>
        </div>

        {/* New playlist input */}
        {showCreateInput && (
          <div className='mb-3 flex gap-2'>
            <input
              type='text'
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
              placeholder='Playlist name...'
              autoFocus
              className='flex-1 bg-zinc-800 text-white text-sm px-3 py-1.5 rounded-md outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-white'
            />
            <button
              onClick={handleCreatePlaylist}
              className='text-xs bg-white text-black px-3 py-1.5 rounded-md font-medium hover:bg-white/80'
            >
              Create
            </button>
          </div>
        )}

        <ScrollArea className='h-[calc(100vh-300px)]'>
          <div className='space-y-2'>
            {isLoading ? (
              <PlaylistSkeleton />
            ) : (
              <>
                {/* Liked Songs */}
                <SignedIn>
                  <Link
                    to='/liked'
                    className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 cursor-pointer'
                  >
                    <div className='size-12 rounded-md bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center flex-shrink-0'>
                      <Heart className='size-5 text-white' fill='white' />
                    </div>
                    <div className='flex-1 min-w-0 hidden md:block'>
                      <p className='font-medium truncate'>Liked Songs</p>
                      <p className='text-sm text-zinc-400 truncate'>Playlist</p>
                    </div>
                  </Link>
                </SignedIn>

                {/* User Playlists */}
                {playlists.length > 0 && (
                  <div className='mb-2'>
                    <p className='text-xs text-zinc-500 uppercase tracking-wider px-2 mb-2'>
                      Your Playlists
                    </p>
                    {playlists.map((playlist) => (
                      <Link
                        to={`/playlists/${playlist._id}`}
                        key={playlist._id}
                        className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
                      >
                        {playlist.imageUrl ? (
                          <img
                            src={playlist.imageUrl}
                            alt={playlist.name}
                            className='size-12 rounded-md flex-shrink-0 object-cover'
                          />
                        ) : (
                          <div className='size-12 rounded-md flex-shrink-0 bg-zinc-700 flex items-center justify-center'>
                            <ListMusic className='size-5 text-zinc-400' />
                          </div>
                        )}
                        <div className='flex-1 min-w-0 hidden md:block'>
                          <p className='font-medium truncate'>{playlist.name}</p>
                          <p className='text-sm text-zinc-400 truncate'>
                            Playlist • {playlist.songs.length} songs
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Albums */}
                <p className='text-xs text-zinc-500 uppercase tracking-wider px-2 mb-2'>
                  Albums
                </p>
                {albums.map((album) => (
                  <Link
                    to={`/albums/${album._id}`}
                    key={album._id}
                    className='p-2 hover:bg-zinc-800 rounded-md flex items-center gap-3 group cursor-pointer'
                  >
                    <img
                      src={album.imageUrl}
                      alt='Playlist img'
                      className='size-12 rounded-md flex-shrink-0 object-cover'
                    />
                    <div className='flex-1 min-w-0 hidden md:block'>
                      <p className='font-medium truncate'>{album.title}</p>
                      <p className='text-sm text-zinc-400 truncate'>Album • {album.artist}</p>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeftSidebar;