import { useAudioVisualizer } from "@/hooks/useAudioVisualizer";
import { usePlayerStore } from "@/stores/usePlayerStore";

interface AudioVisualizerProps {
  className?: string;
}

export const AudioVisualizer = ({ className }: AudioVisualizerProps) => {
  const { isPlaying, currentSong } = usePlayerStore();
  const canvasRef = useAudioVisualizer(isPlaying);

  if (!currentSong) return null;

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className={`rounded-md opacity-80 ${className}`}
    />
  );
};