import { useSearchStore } from "@/stores/useSearchStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2, Music2, Mic2, Disc } from "lucide-react";
import { useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import { SongMenu } from "@/components/SongMenu";
import { Link } from "react-router-dom";
import type { Song } from "@/types";

interface Artist {
  name: string;
  imageUrl: string;
  songCount: number;
}

interface Album {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
}

interface SearchResults {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
}

const SearchPage = () => {
  const { query, results, isLoading, setQuery, setResults, setLoading, clearSearch } = useSearchStore();
  const { setCurrentSong, initializeQueue } = usePlayerStore();
  const { fetchPlaylists } = usePlaylistStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const typedResults = results as unknown as SearchResults;
  const songs = typedResults?.songs ?? (Array.isArray(results) ? results : []);
  const artists = typedResults?.artists ?? [];
  const albums = typedResults?.albums ?? [];
  const hasResults = songs.length > 0 || artists.length > 0 || albums.length > 0;

  useEffect(() => {
    fetchPlaylists();
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [fetchPlaylists]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/songs/search?q=${encodeURIComponent(query)}`);
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, setLoading, setResults]);

  const handleSelect = (song: Song) => {
    initializeQueue(songs);
    setCurrentSong(song);
  };

  return (
    <div className='h-full flex flex-col bg-zinc-950'>
      <div className='p-4 pt-6'>
        <h1 className='text-2xl font-bold text-white mb-4'>Search</h1>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400' />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Songs, artists, albums...'
            className='pl-9 pr-9 bg-zinc-800 border-none text-white placeholder:text-zinc-400 rounded-full h-11 focus-visible:ring-1 focus-visible:ring-white text-base'
          />
          {isLoading ? (
            <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin' />
          ) : query ? (
            <X className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 cursor-pointer hover:text-white' onClick={clearSearch} />
          ) : null}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto px-4 pb-4'>
        {!query && (
          <div className='flex flex-col items-center justify-center h-48 text-center'>
            <Music2 className='h-12 w-12 text-zinc-600 mb-3' />
            <p className='text-zinc-400 text-sm'>Search for songs, artists, or albums</p>
          </div>
        )}

        {query && !isLoading && !hasResults && (
          <div className='flex flex-col items-center justify-center h-48 text-center'>
            <p className='text-white font-semibold mb-1'>No results found</p>
            <p className='text-zinc-400 text-sm'>Try a different search term</p>
          </div>
        )}

        {/* Artists */}
        {artists.length > 0 && (
          <section className='mb-6'>
            <div className='flex items-center gap-2 mb-3'>
              <Mic2 className='h-4 w-4 text-zinc-400' />
              <h2 className='text-sm font-semibold text-zinc-400 uppercase tracking-wider'>Artists</h2>
            </div>
            <div className='space-y-1'>
              {artists.map((artist) => (
                <Link
                  key={artist.name}
                  to={`/artists/${encodeURIComponent(artist.name)}`}
                  className='flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors'
                >
                  <img src={artist.imageUrl} alt={artist.name} className='w-12 h-12 rounded-full object-cover flex-shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-white truncate'>{artist.name}</p>
                    <p className='text-xs text-zinc-400'>{artist.songCount} song{artist.songCount !== 1 ? "s" : ""}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <section className='mb-6'>
            <div className='flex items-center gap-2 mb-3'>
              <Disc className='h-4 w-4 text-zinc-400' />
              <h2 className='text-sm font-semibold text-zinc-400 uppercase tracking-wider'>Albums</h2>
            </div>
            <div className='space-y-1'>
              {albums.map((album) => (
                <Link key={album._id} to={`/albums/${album._id}`} className='flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors'>
                  <img src={album.imageUrl} alt={album.title} className='w-12 h-12 rounded-lg object-cover flex-shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-white truncate'>{album.title}</p>
                    <p className='text-xs text-zinc-400 truncate'>Album • {album.artist}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Songs */}
        {songs.length > 0 && (
          <section>
            <div className='flex items-center gap-2 mb-3'>
              <Music2 className='h-4 w-4 text-zinc-400' />
              <h2 className='text-sm font-semibold text-zinc-400 uppercase tracking-wider'>Songs</h2>
            </div>
            <div className='space-y-1'>
              {songs.map((song) => (
                <div
                  key={song._id}
                  className='flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 active:bg-zinc-700 transition-colors'
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className='w-12 h-12 rounded object-cover flex-shrink-0 cursor-pointer'
                    onClick={() => handleSelect(song)}
                  />
                  <div className='flex-1 min-w-0 cursor-pointer' onClick={() => handleSelect(song)}>
                    <p className='text-sm font-medium text-white truncate'>{song.title}</p>
                    <p className='text-xs text-zinc-400 truncate'>{song.artist}</p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <SongMenu song={song} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SearchPage;