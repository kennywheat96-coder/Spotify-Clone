import { usePlayerStore } from "@/stores/usePlayerStore";
import { useRecentlyPlayedStore } from "@/stores/useRecentlyPlayedStore";
import { useEffect, useRef } from "react";

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const prevSongIdRef = useRef<string | null>(null);

  const { currentSong, isPlaying, playNext, playPrevious } = usePlayerStore();
  const { addRecentlyPlayed } = useRecentlyPlayedStore();

  // Handle song ends
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => playNext();
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [playNext]);

  // Main playback effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const isSongChange = prevSongIdRef.current !== currentSong._id;

    if (isSongChange) {
      prevSongIdRef.current = currentSong._id;
      audio.src = currentSong.audioUrl;
      audio.currentTime = 0;
      addRecentlyPlayed(currentSong._id);

      if (isPlaying) {
        audio.load();
        audio.play().catch((err) => console.log("Play error:", err));
      }
    } else {
      if (isPlaying) {
        audio.play().catch((err) => console.log("Play error:", err));
      } else {
        audio.pause();
      }
    }
  }, [currentSong, isPlaying, addRecentlyPlayed]);

  // Media Session API
  useEffect(() => {
    if (!currentSong || !("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      artwork: [
        { src: currentSong.imageUrl, sizes: "96x96", type: "image/jpeg" },
        { src: currentSong.imageUrl, sizes: "512x512", type: "image/jpeg" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current?.play();
      usePlayerStore.setState({ isPlaying: true });
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
      usePlayerStore.setState({ isPlaying: false });
    });

    navigator.mediaSession.setActionHandler("nexttrack", () => playNext());
    navigator.mediaSession.setActionHandler("previoustrack", () => playPrevious());
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [currentSong, isPlaying, playNext, playPrevious]);

  return (
    <audio
      ref={audioRef}
      playsInline
      webkit-playsinline="true"
      preload="auto"
    />
  );
};

export default AudioPlayer;
