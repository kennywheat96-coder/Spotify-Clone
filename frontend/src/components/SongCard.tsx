import { motion } from "framer-motion";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { SongContextMenu } from "./SongContextMenu";
import { SongMenu } from "./SongMenu";
import { Play, Pause } from "lucide-react";
import type { Song } from "@/types";

interface SongCardProps {
  song: Song;
  index: number;
  songs: Song[];
}

export const SongCard = ({ song, index, songs }: SongCardProps) => {
  const { currentSong, isPlaying, playAlbum, togglePlay } = usePlayerStore();
  const isCurrentSong = currentSong?._id === song._id;

  const handleClick = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      playAlbum(songs, index);
    }
  };

  return (
    <SongContextMenu songId={song._id}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className='bg-zinc-800/50 rounded-md p-3 hover:bg-zinc-700/50 transition-all cursor-pointer group relative'
      >
        {/* Album art */}
        <div className='relative mb-3' onClick={handleClick}>
          <img
            src={song.imageUrl}
            alt={song.title}
            className='w-full aspect-square object-cover rounded-md shadow-lg'
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className='absolute inset-0 bg-black/40 rounded-md flex items-center justify-center'
          >
            <motion.div
              whileTap={{ scale: 0.9 }}
              className='w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg'
            >
              {isCurrentSong && isPlaying ? (
                <Pause className='h-5 w-5 text-black' />
              ) : (
                <Play className='h-5 w-5 text-black' />
              )}
            </motion.div>
          </motion.div>

          {/* Now playing indicator */}
          {isCurrentSong && isPlaying && (
            <div className='absolute bottom-2 right-2 flex gap-0.5 items-end'>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className='w-1 bg-green-400 rounded-full'
                  animate={{ height: [4, 12, 4] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Song info + 3-dot menu */}
        <div className='flex items-start justify-between gap-1'>
          <div className='min-w-0 flex-1' onClick={handleClick}>
            <p className={`font-medium text-sm truncate ${isCurrentSong ? "text-green-400" : "text-white"}`}>
              {song.title}
            </p>
            <p className='text-zinc-400 text-xs truncate mt-0.5'>{song.artist}</p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <SongMenu song={song} />
          </div>
        </div>
      </motion.div>
    </SongContextMenu>
  );
};
