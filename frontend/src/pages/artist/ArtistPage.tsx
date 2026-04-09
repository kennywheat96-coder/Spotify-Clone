import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { SongMenu } from "@/components/SongMenu";
import { LikeButton } from "@/components/LikeButton";
import { Play, Pause, Shuffle } from "lucide-react";
import { formatDuration } from "@/pages/album/AlbumPage";
import { axiosInstance } from "@/lib/axios";

const ArtistPage = () => {
  const { artistName } = useParams<{ artistName: string }>();
  const { songs, albums, fetchSongs, fetchAlbums } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay, toggleShuffle, isShuffle } = usePlayerStore();
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const [artistImageUrl, setArtistImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (songs.length === 0) fetchSongs();
    if (albums.length === 0) fetchAlbums();
  }, [fetchSongs, fetchAlbums, songs.length, albums.length]);

  const decodedName = decodeURIComponent(artistName || "");

  useEffect(() => {
    if (!decodedName) return;
    axiosInstance
      .get(`/admin/artists/${encodeURIComponent(decodedName)}`)
      .then((res) => {
        if (res.data?.imageUrl) setArtistImageUrl(res.data.imageUrl);
      })
      .catch(() => {});
  }, [decodedName]);

  const artistSongs = useMemo(() => {
    return songs.filter((song) => {
      const parts = song.artist
        .toLowerCase()
        .split(/&|,|\bx\b|\bfeat\.?\b|\bft\.?\b/)
        .map((p) => p.trim());
      return parts.some((p) => p === decodedName.toLowerCase());
    });
  }, [songs, decodedName]);

  const artistAlbums = useMemo(() => {
    return albums.filter((album) => {
      const parts = album.artist
        .toLowerCase()
        .split(/&|,|\bx\b|\bfeat\.?\b|\bft\.?\b/)
        .map((p) => p.trim());
      return parts.some((p) => p === decodedName.toLowerCase());
    });
  }, [albums, decodedName]);

  const fallbackImage = artistSongs[0]?.imageUrl || artistAlbums[0]?.imageUrl;
  const bannerImage = artistImageUrl || fallbackImage;

  const isArtistPlaying =
    artistSongs.some((s) => s._id === currentSong?._id) && isPlaying;

  const handlePlay = () => {
    if (artistSongs.length === 0) return;
    if (isArtistPlaying) togglePlay();
    else playAlbum(artistSongs, 0);
  };

  const handleShuffle = () => {
    if (artistSongs.length === 0) return;
    const shuffled = [...artistSongs].sort(() => Math.random() - 0.5);
    playAlbum(shuffled, 0);
    if (!isShuffle) toggleShuffle();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", decodedName);
      formData.append("imageFile", file);
      const res = await axiosInstance.post("/admin/artists/image", formData);
      setArtistImageUrl(res.data.imageUrl);
      import("react-hot-toast").then(({ default: toast }) =>
        toast.success("Artist photo updated!")
      );
    } catch {
      import("react-hot-toast").then(({ default: toast }) =>
        toast.error("Failed to upload photo")
      );
    } finally {
      setUploading(false);
    }
  };

  if (artistSongs.length === 0 && artistAlbums.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-400">No songs found for "{decodedName}"</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-950">

      {/* ── Hero Banner ── */}
      <div className="relative w-full h-64 sm:h-80 bg-zinc-900">
        {bannerImage && (
          <>
            {/* Blurred background fill */}
            <img
              src={bannerImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
            />
            {/* Main image */}
            <img
              src={bannerImage}
              alt={decodedName}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </>
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* Admin upload */}
        {isAdmin && (
          <label className="absolute top-3 right-3 cursor-pointer bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full transition-colors z-10">
            {uploading ? "Uploading..." : "📷 Change Photo"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        )}

        {/* Artist info + play */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-300 tracking-widest mb-1">
              Artist
            </p>
            <h1 className="text-2xl sm:text-5xl font-bold text-white drop-shadow-lg leading-tight">
              {decodedName}
            </h1>
            <p className="text-zinc-300 text-sm mt-1">{artistSongs.length} songs</p>
          </div>
          <Button
            onClick={handlePlay}
            size="icon"
            className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 transition-all flex-shrink-0 shadow-xl"
            disabled={artistSongs.length === 0}
          >
            {isArtistPlaying ? (
              <Pause className="h-6 w-6 text-black" />
            ) : (
              <Play className="h-6 w-6 text-black" />
            )}
          </Button>
        </div>
      </div>

      {/* ── Shuffle ── */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3">
        <Button
          onClick={handleShuffle}
          size="icon"
          variant="ghost"
          className={`w-10 h-10 transition-colors ${isShuffle ? "text-green-500" : "text-zinc-400 hover:text-white"}`}
        >
          <Shuffle className="h-5 w-5" />
        </Button>
        <span className="text-xs text-zinc-500">Shuffle</span>
      </div>

      {/* ── Albums ── */}
      {artistAlbums.length > 0 && (
        <div className="mb-8">
          <h2 className="text-base font-bold text-white mb-4 px-4 sm:px-6">Albums</h2>
          <div
            className="flex gap-3 px-4 sm:px-6 pb-2"
            style={{
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
              scrollSnapType: "x mandatory",
            }}
          >
            {artistAlbums.map((album) => (
              <div
                key={album._id}
                onClick={() => navigate(`/albums/${album._id}`)}
                className="cursor-pointer group flex-shrink-0 w-36 sm:w-44"
                style={{ scrollSnapAlign: "start" }}
              >
                <img
                  src={album.imageUrl}
                  alt={album.title}
                  className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-lg mb-2 group-hover:opacity-80 transition-opacity shadow-md"
                />
                <p className="text-sm font-medium text-white truncate">{album.title}</p>
                <p className="text-xs text-zinc-400">{album.releaseYear}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Songs ── */}
      <div className="px-4 sm:px-6 pb-32">
        <h2 className="text-base font-bold text-white mb-4">Songs</h2>
        <div className="space-y-1">
          {artistSongs.map((song, index) => {
            const isCurrentSong = currentSong?._id === song._id;
            return (
              <div
                key={song._id}
                onClick={() => playAlbum(artistSongs, index)}
                className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg cursor-pointer hover:bg-zinc-800 group transition-colors ${
                  isCurrentSong ? "bg-zinc-800" : ""
                }`}
              >
                <img
                  src={song.imageUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isCurrentSong ? "text-green-400" : "text-white"}`}>
                    {song.title}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                </div>
                <span className="text-xs text-zinc-400 flex-shrink-0 hidden sm:block">
                  {formatDuration(song.duration)}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <LikeButton songId={song._id} size="sm" />
                  <SongMenu song={song} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default ArtistPage;