import { create } from "zustand";
import type { Song } from "@/types";

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
      const res = await fetch("/api/users/liked-songs");
      const data = await res.json();
      set({
        likedSongs: data,
        likedIds: new Set(data.map((s: Song) => s._id)),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  likeSong: async (songId) => {
    const res = await fetch(`/api/users/liked-songs/${songId}`, {
      method: "POST",
    });
    const data = await res.json();
    set({
      likedSongs: data,
      likedIds: new Set(data.map((s: Song) => s._id)),
    });
  },

  unlikeSong: async (songId) => {
    const res = await fetch(`/api/users/liked-songs/${songId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    set({
      likedSongs: data,
      likedIds: new Set(data.map((s: Song) => s._id)),
    });
  },

  isLiked: (songId) => get().likedIds.has(songId),
}));