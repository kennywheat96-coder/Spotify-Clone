import { usePlayerStore } from "@/stores/usePlayerStore";
import { useRecentlyPlayedStore } from "@/stores/useRecentlyPlayedStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSongRef = useRef<string | null>(null);

  const { currentSong, isPlaying, playNext } = usePlayerStore();
  const { addRecentlyPlayed } = useRecentlyPlayedStore();

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) audioRef.current?.play();
    else audioRef.current?.pause();
  }, [isPlaying]);

  // Handle song ends
  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => playNext();
    audio?.addEventListener("ended", handleEnded);
    return () => audio?.removeEventListener("ended", handleEnded);
  }, [playNext]);

  // Handle song changes
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    const audio = audioRef.current;
    const isSongChange = prevSongRef.current !== currentSong.audioUrl;

    if (isSongChange) {
      audio.src = currentSong.audioUrl;
      audio.currentTime = 0;
      prevSongRef.current = currentSong.audioUrl;
      addRecentlyPlayed(currentSong._id);
      if (isPlaying) audio.play();
    }
  }, [currentSong, isPlaying, addRecentlyPlayed]);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
};

export default AudioPlayer;