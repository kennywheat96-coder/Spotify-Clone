import { create } from "zustand";
import type { Song } from "@/types";

interface RecentlyPlayedStore {
  recentlyPlayed: Song[];
  isLoading: boolean;
  fetchRecentlyPlayed: () => Promise<void>;
  addRecentlyPlayed: (songId: string) => Promise<void>;
}

export const useRecentlyPlayedStore = create<RecentlyPlayedStore>((set) => ({
  recentlyPlayed: [],
  isLoading: false,

  fetchRecentlyPlayed: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/users/recently-played");
      const data = await res.json();
      set({ recentlyPlayed: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addRecentlyPlayed: async (songId) => {
    try {
      await fetch(`/api/users/recently-played/${songId}`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to track recently played:", err);
    }
  },
}));