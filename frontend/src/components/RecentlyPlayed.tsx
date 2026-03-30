import { useRecentlyPlayedStore } from "@/stores/useRecentlyPlayedStore";
import { useEffect } from "react";
import { Clock } from "lucide-react";
import { SongCard } from "./SongCard";
import { motion } from "framer-motion";

export const RecentlyPlayed = () => {
  const { recentlyPlayed, fetchRecentlyPlayed, isLoading } = useRecentlyPlayedStore();

  useEffect(() => {
    fetchRecentlyPlayed();
  }, [fetchRecentlyPlayed]);

  // Filter out null songs and make sure it's an array
  if (isLoading || !Array.isArray(recentlyPlayed) || recentlyPlayed.length === 0) return null;

  // Filter out any null or undefined entries
  const validSongs = recentlyPlayed.filter((song) => song && song._id);

  if (validSongs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='mb-8'
    >
      <div className='flex items-center gap-2 mb-4'>
        <Clock className='size-5 text-zinc-400' />
        <h2 className='text-xl font-bold text-white'>Recently Played</h2>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'>
        {validSongs.slice(0, 6).map((song, index) => (
          <SongCard
            key={song._id}
            song={song}
            index={index}
            songs={validSongs}
          />
        ))}
      </div>
    </motion.div>
  );
};