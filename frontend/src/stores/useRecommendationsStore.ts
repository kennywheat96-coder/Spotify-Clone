import { create } from "zustand";
import type { Song } from "@/types";

interface RecommendationsStore {
  recommendations: Song[];
  isLoading: boolean;
  fetchRecommendations: () => Promise<void>;
}

export const useRecommendationsStore = create<RecommendationsStore>((set) => ({
  recommendations: [],
  isLoading: false,

  fetchRecommendations: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/users/recommendations");
      const data = await res.json();
      set({ recommendations: data });
    } finally {
      set({ isLoading: false });
    }
  },
}));