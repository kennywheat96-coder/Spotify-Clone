import { useLikedStore } from "@/stores/useLikedStore";
import { Heart } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface LikeButtonProps {
  songId: string;
  size?: "sm" | "md";
}

export const LikeButton = ({ songId, size = "md" }: LikeButtonProps) => {
  const { isLiked, likeSong, unlikeSong, fetchLikedSongs } = useLikedStore();
  const liked = isLiked(songId);

  useEffect(() => {
    fetchLikedSongs();
  }, [fetchLikedSongs]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked) {
      await unlikeSong(songId);
      toast("Removed from Liked Songs", { icon: "💔" });
    } else {
      await likeSong(songId);
      toast.success("Added to Liked Songs");
    }
  };

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={handleClick}
      className={`transition-all hover:scale-110 active:scale-95 ${
        liked ? "text-green-500" : "text-zinc-400 hover:text-white"
      }`}
      title={liked ? "Remove from liked songs" : "Add to liked songs"}
    >
      <Heart className={iconSize} fill={liked ? "currentColor" : "none"} />
    </button>
  );
};