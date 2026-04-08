import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SongMenu } from "@/components/SongMenu";
import { LikeButton } from "@/components/LikeButton";
import { Play, Pause, Shuffle } from "lucide-react";
import { formatDuration } from "@/pages/album/AlbumPage";
import type { Song } from "@/types";

const ArtistPage = () => {
  const { artistName } = useParams<{ artistName: string }>();
  const { songs, albums, fetchSongs, fetchAlbums } = useMusicStore();
  const { currentSong, isPlaying, playAlbum, togglePlay, toggleShuffle, isShuffle } = usePlayerStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (songs.length === 0) fetchSongs();
    if (albums.length === 0) fetchAlbums();
  }, [fetchSongs, fetchAlbums, songs.length, albums.length]);

  const decodedName = decodeURIComponent(artistName || "");

  // Get all songs where this artist is credited
  const artistSongs = useMemo(() => {
    return songs.filter((song) =>
      song.artist.toLowerCase().includes(decodedName.toLowerCase())
    );
  }, [songs, decodedName]);

  // Get all albums where this artist is credited
  const artistAlbums = useMemo(() => {
    return albums.filter((album) =>
      album.artist.toLowerCase().includes(decodedName.toLowerCase())
    );
  }, [albums, decodedName]);

  const coverImage = artistSongs[0]?.imageUrl || artistAlbums[0]?.imageUrl;

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

  if (artistSongs.length === 0 && artistAlbums.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-400">No songs found for "{decodedName}"</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="relative min-h-full">
          {/* Background blur */}
          <div className="absolute inset-0 pointer-events-none">
            {coverImage && (
              <img
                src={coverImage}
                alt=""
                className="w-full h-64 object-cover opacity-20 blur-2xl scale-110"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/80 to-zinc-950" />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 p-4 sm:p-8 pt-8">
              {coverImage && (
                <img
                  src={coverImage}
                  alt={decodedName}
                  className="w-32 h-32 sm:w-48 sm:h-48 rounded-full object-cover shadow-2xl flex-shrink-0"
                />
              )}
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase text-zinc-400 mb-1">Artist</p>
                <h1 className="text-3xl sm:text-5xl font-bold text-white mb-2">{decodedName}</h1>
                <p className="text-zinc-400 text-sm">{artistSongs.length} songs</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 px-4 sm:px-8 pb-6">
              <Button
                onClick={handlePlay}
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-500 hover:bg-green-400 hover:scale-105 transition-all"
                disabled={artistSongs.length === 0}
              >
                {isArtistPlaying ? (
                  <Pause className="h-5 w-5 text-black" />
                ) : (
                  <Play className="h-5 w-5 text-black" />
                )}
              </Button>
              <Button
                onClick={handleShuffle}
                size="icon"
                variant="ghost"
                className={`w-10 h-10 transition-colors ${isShuffle ? "text-green-500" : "text-zinc-400 hover:text-white"}`}
              >
                <Shuffle className="h-5 w-5" />
              </Button>
            </div>

            {/* Albums */}
            {artistAlbums.length > 0 && (
              <div className="px-4 sm:px-8 mb-8">
                <h2 className="text-lg font-bold text-white mb-4">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {artistAlbums.map((album) => (
                    <div
                      key={album._id}
                      onClick={() => navigate(`/albums/${album._id}`)}
                      className="cursor-pointer group"
                    >
                      <img
                        src={album.imageUrl}
                        alt={album.title}
                        className="w-full aspect-square object-cover rounded-lg mb-2 group-hover:opacity-80 transition-opacity"
                      />
                      <p className="text-sm font-medium text-white truncate">{album.title}</p>
                      <p className="text-xs text-zinc-400">{album.releaseYear}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Songs */}
            <div className="px-4 sm:px-8 pb-8">
              <h2 className="text-lg font-bold text-white mb-4">Songs</h2>
              <div className="space-y-1">
                {artistSongs.map((song, index) => {
                  const isCurrentSong = currentSong?._id === song._id;
                  return (
                    <div
                      key={song._id}
                      onClick={() => playAlbum(artistSongs, index)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-zinc-800 group transition-colors ${
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
                      <span className="text-xs text-zinc-400 flex-shrink-0">
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
        </div>
      </ScrollArea>
    </div>
  );
};

export default ArtistPage;