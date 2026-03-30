import { useRecommendationsStore } from "@/stores/useRecommendationsStore";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { SongCard } from "./SongCard";
import { motion } from "framer-motion";

export const Recommendations = () => {
  const { recommendations, fetchRecommendations, isLoading } =
    useRecommendationsStore();

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // Safety check — make sure it's an array before rendering
  if (isLoading || !Array.isArray(recommendations) || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='mb-8'
    >
      <div className='flex items-center gap-2 mb-4'>
        <Sparkles className='size-5 text-green-400' />
        <h2 className='text-xl font-bold text-white'>Recommended For You</h2>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {recommendations.slice(0, 10).map((song, index) => (
          <SongCard
            key={song._id}
            song={song}
            index={index}
            songs={recommendations}
          />
        ))}
      </div>
    </motion.div>
  );
};