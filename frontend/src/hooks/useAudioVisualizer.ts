import { useEffect, useRef } from "react";

export const useAudioVisualizer = (isPlaying: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barCount = 48;

    // Initialize bars with random heights
    if (barsRef.current.length === 0) {
      barsRef.current = Array.from({ length: barCount }, () => Math.random() * 0.5 + 0.1);
    }

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / barCount) - 1;

      barsRef.current = barsRef.current.map((bar) => {
        const delta = (Math.random() - 0.5) * 0.15;
        return Math.min(1, Math.max(0.05, bar + delta));
      });

      barsRef.current.forEach((bar, i) => {
        const barHeight = bar * canvas.height;
        const x = i * (barWidth + 1);
        const green = Math.floor(bar * 155) + 100;
        ctx.fillStyle = `rgb(0, ${green}, 80)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      });
    };

    if (isPlaying) {
      draw();
    } else {
      cancelAnimationFrame(animationRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / barCount) - 1;
      barsRef.current.forEach((_, i) => {
        const x = i * (barWidth + 1);
        ctx.fillStyle = `rgb(0, 155, 80)`;
        ctx.fillRect(x, canvas.height - 2, barWidth, 2);
      });
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  return canvasRef;
};