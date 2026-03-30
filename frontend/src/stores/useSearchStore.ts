import { create } from "zustand";
import type { Song } from "@/types";

interface SearchStore {
  query: string;
  results: Song[];
  isLoading: boolean;
  setQuery: (query: string) => void;
  setResults: (results: Song[]) => void;
  setLoading: (loading: boolean) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",
  results: [],
  isLoading: false,

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearSearch: () => set({ query: "", results: [] }),
}));