import { create } from "zustand";
import type { Song } from "@/types";
import { axiosInstance } from "@/lib/axios";

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
      const { data } = await axiosInstance.get("/users/recommendations");
      set({ recommendations: data });
    } finally {
      set({ isLoading: false });
    }
  },
}));