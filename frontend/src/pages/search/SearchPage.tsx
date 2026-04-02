import { useSearchStore } from "@/stores/useSearchStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2, Music2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { axiosInstance } from "@/lib/axios";
import { SongContextMenu } from "@/components/SongContextMenu";
import type { Song } from "@/types";

const SearchPage = () => {
  const { query, results, isLoading, setQuery, setResults, setLoading, clearSearch } = useSearchStore();
  const { setCurrentSong, initializeQueue } = usePlayerStore();
  const { fetchPlaylists } = usePlaylistStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPlaylists();
    // Auto focus search input on mobile
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [fetchPlaylists]);

  // Debounced search
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
    initializeQueue(results);
    setCurrentSong(song);
  };

  return (
    <div className='h-full flex flex-col bg-zinc-950'>
      {/* Search header */}
      <div className='p-4 pt-6'>
        <h1 className='text-2xl font-bold text-white mb-4'>Search</h1>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400' />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='What do you want to play?'
            className='pl-9 pr-9 bg-zinc-800 border-none text-white placeholder:text-zinc-400 rounded-full h-11 focus-visible:ring-1 focus-visible:ring-white text-base'
          />
          {isLoading ? (
            <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin' />
          ) : query ? (
            <X
              className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 cursor-pointer hover:text-white'
              onClick={clearSearch}
            />
          ) : null}
        </div>
      </div>

      {/* Results */}
      <div className='flex-1 overflow-y-auto px-4'>
        {!query && (
          <div className='flex flex-col items-center justify-center h-48 text-center'>
            <Music2 className='h-12 w-12 text-zinc-600 mb-3' />
            <p className='text-zinc-400 text-sm'>Search for songs, artists, or albums</p>
          </div>
        )}

        {query && !isLoading && results.length === 0 && (
          <div className='flex flex-col items-center justify-center h-48 text-center'>
            <p className='text-white font-semibold mb-1'>No results found</p>
            <p className='text-zinc-400 text-sm'>Try a different search term</p>
          </div>
        )}

        {results.length > 0 && (
          <div className='space-y-1 pb-4'>
            <p className='text-xs text-zinc-400 uppercase tracking-wider mb-3'>
              {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            {results.map((song) => (
              <SongContextMenu key={song._id} songId={song._id}>
                <div
                  onClick={() => handleSelect(song)}
                  className='flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 active:bg-zinc-700 cursor-pointer transition-colors'
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className='w-12 h-12 rounded object-cover flex-shrink-0'
                  />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-white truncate'>{song.title}</p>
                    <p className='text-xs text-zinc-400 truncate'>{song.artist}</p>
                  </div>
                </div>
              </SongContextMenu>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
