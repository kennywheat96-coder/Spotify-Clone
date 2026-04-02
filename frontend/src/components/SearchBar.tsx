import { useSearchStore } from "@/stores/useSearchStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { usePlaylistStore } from "@/stores/usePlaylistStore";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SongContextMenu } from "./SongContextMenu";
import { axiosInstance } from "@/lib/axios";
import type { Song } from "@/types";

export const SearchBar = () => {
  const { query, results, isLoading, setQuery, setResults, setLoading, clearSearch } = useSearchStore();
  const { setCurrentSong, initializeQueue } = usePlayerStore();
  const { fetchPlaylists } = usePlaylistStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/songs/search?q=${encodeURIComponent(query)}`);
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, setLoading, setResults]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (song: Song) => {
    initializeQueue(results);
    setCurrentSong(song);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="What do you want to play?"
          className="pl-9 pr-9 bg-zinc-800 border-none text-white placeholder:text-zinc-400 rounded-full focus-visible:ring-1 focus-visible:ring-white"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 animate-spin" />
        ) : query ? (
          <X
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 cursor-pointer hover:text-white"
            onClick={clearSearch}
          />
        ) : null}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-zinc-800 rounded-md shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <p className="text-xs text-zinc-400 px-2 py-1 uppercase tracking-wider">
              Songs — right-click to add to playlist
            </p>
            {results.map((song) => (
              <SongContextMenu key={song._id} songId={song._id}>
                <div
                  onClick={() => handleSelect(song)}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-700 cursor-pointer group"
                >
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate group-hover:text-green-400 transition-colors">
                      {song.title}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                  </div>
                </div>
              </SongContextMenu>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && !isLoading && query && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-zinc-800 rounded-md shadow-xl z-50 p-4 text-center">
          <p className="text-zinc-400 text-sm">No results for "{query}"</p>
        </div>
      )}
    </div>
  );
};
