import { create } from "zustand";
import type { Song } from "@/types";
import { axiosInstance } from "@/lib/axios";

interface LikedStore {
  likedSongs: Song[];
  likedIds: Set<string>;
  isLoading: boolean;

  fetchLikedSongs: () => Promise<void>;
  likeSong: (songId: string) => Promise<void>;
  unlikeSong: (songId: string) => Promise<void>;
  isLiked: (songId: string) => boolean;
}

export const useLikedStore = create<LikedStore>((set, get) => ({
  likedSongs: [],
  likedIds: new Set(),
  isLoading: false,

  fetchLikedSongs: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/users/liked-songs");
      set({
        likedSongs: data,
        likedIds: new Set(data.map((s: Song) => s._id)),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  likeSong: async (songId) => {
    const { data } = await axiosInstance.post(`/users/liked-songs/${songId}`);
    set({
      likedSongs: data,
      likedIds: new Set(data.map((s: Song) => s._id)),
    });
  },

  unlikeSong: async (songId) => {
    const { data } = await axiosInstance.delete(`/users/liked-songs/${songId}`);
    set({
      likedSongs: data,
      likedIds: new Set(data.map((s: Song) => s._id)),
    });
  },

  isLiked: (songId) => get().likedIds.has(songId),
}));