import { usePlayerStore } from "@/stores/usePlayerStore";
import { useRecentlyPlayedStore } from "@/stores/useRecentlyPlayedStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSongRef = useRef<string | null>(null);

  const { currentSong, isPlaying, playNext, playPrevious } = usePlayerStore();
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

  // Media Session API — enables lock screen controls and background playback
  useEffect(() => {
    if (!currentSong || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      artwork: [{ src: currentSong.imageUrl, sizes: "512x512", type: "image/jpeg" }],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      usePlayerStore.setState({ isPlaying: true });
      audioRef.current?.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      usePlayerStore.setState({ isPlaying: false });
      audioRef.current?.pause();
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => {
      playNext();
    });

    navigator.mediaSession.setActionHandler("previoustrack", () => {
      playPrevious();
    });
  }, [currentSong, playNext, playPrevious]);

  return <audio ref={audioRef} crossOrigin="anonymous" />;
};

export default AudioPlayer;
