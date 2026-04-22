import { useMusicStore } from "@/stores/useMusicStore";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import { SongMenu } from "@/components/SongMenu";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Play, Pause } from "lucide-react";

const FeaturedSection = () => {
  const { isLoading, featuredSongs, error } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  if (isLoading) return <FeaturedGridSkeleton />;
  if (error) return <p className='text-red-500 mb-4 text-lg'>{error}</p>;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
      {featuredSongs.map((song, index) => {
        const isCurrentSong = currentSong?._id === song._id;

        const handlePlay = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (isCurrentSong) togglePlay();
          else playAlbum(featuredSongs, index);
        };

        return (
          <div
            key={song._id}
            className='flex items-center bg-zinc-800/50 rounded-md overflow-hidden hover:bg-zinc-700/50 transition-colors group cursor-pointer relative'
            onClick={handlePlay}
          >
            <div className='relative flex-shrink-0'>
              <img
                src={song.imageUrl}
                alt={song.title}
                className='w-16 sm:w-20 h-16 sm:h-20 object-cover'
              />
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                  {isCurrentSong && isPlaying
                    ? <Pause className='h-4 w-4 text-black' />
                    : <Play className='h-4 w-4 text-black' />
                  }
                </div>
              </div>
            </div>

            <div className='flex-1 p-4 min-w-0'>
              <p className='font-medium truncate'>{song.title}</p>
              <p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
            </div>

            <div className='pr-2 flex-shrink-0' onClick={(e) => e.stopPropagation()}>
              <SongMenu song={song} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FeaturedSection;