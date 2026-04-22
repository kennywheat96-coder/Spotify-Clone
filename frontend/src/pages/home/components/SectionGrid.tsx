import type { Song } from "@/types";
import SectionGridSkeleton from "./SectionGridSkeleton";
import { Button } from "@/components/ui/button";
import { SongMenu } from "@/components/SongMenu";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Play, Pause } from "lucide-react";

type SectionGridProps = {
  title: string;
  songs: Song[];
  isLoading: boolean;
};

const SectionGrid = ({ songs, title, isLoading }: SectionGridProps) => {
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();

  if (isLoading) return <SectionGridSkeleton />;

  return (
    <div className='mb-8'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-xl sm:text-2xl font-bold'>{title}</h2>
        <Button variant='link' className='text-sm text-zinc-400 hover:text-white'>
          Show all
        </Button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {songs.map((song, index) => {
          const isCurrentSong = currentSong?._id === song._id;

          const handlePlay = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (isCurrentSong) togglePlay();
            else playAlbum(songs, index);
          };

          return (
            <div
              key={song._id}
              className='bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-700/40 transition-all group cursor-pointer'
              onClick={handlePlay}
            >
              <div className='relative mb-4'>
                <div className='aspect-square rounded-md shadow-lg overflow-hidden'>
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                </div>
                <div className={`absolute inset-0 bg-black/40 rounded-md flex items-center justify-center transition-opacity ${
                  isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg'>
                    {isCurrentSong && isPlaying
                      ? <Pause className='h-5 w-5 text-black' />
                      : <Play className='h-5 w-5 text-black' />
                    }
                  </div>
                </div>
              </div>

              <div className='flex items-start justify-between gap-1'>
                <div className='min-w-0 flex-1'>
                  <h3 className='font-medium mb-1 truncate'>{song.title}</h3>
                  <p className='text-sm text-zinc-400 truncate'>{song.artist}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()} className='flex-shrink-0'>
                  <SongMenu song={song} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SectionGrid;