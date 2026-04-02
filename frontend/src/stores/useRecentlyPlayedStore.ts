import { create } from "zustand";
import type { Song } from "@/types";
import { axiosInstance } from "@/lib/axios";

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
      const { data } = await axiosInstance.get("/users/recently-played");
      set({ recentlyPlayed: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addRecentlyPlayed: async (songId) => {
    try {
      await axiosInstance.post(`/users/recently-played/${songId}`);
    } catch (err) {
      console.error("Failed to track recently played:", err);
    }
  },
}));