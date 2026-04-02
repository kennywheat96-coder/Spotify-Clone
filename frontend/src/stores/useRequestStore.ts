import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";

interface SongRequest {
  _id: string;
  artistName: string;
  songName: string;
  youtubeUrl: string;
  albumName: string;
  type: "single" | "album";
  notes: string;
  status: "pending" | "approved" | "rejected" | "completed";
  requestedBy: string;
  requestedByName: string;
  createdAt: string;
}

interface RequestStore {
  requests: SongRequest[];
  myRequests: SongRequest[];
  isLoading: boolean;
  fetchAllRequests: () => Promise<void>;
  fetchMyRequests: () => Promise<void>;
  createRequest: (data: Partial<SongRequest>) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
}

export const useRequestStore = create<RequestStore>((set) => ({
  requests: [],
  myRequests: [],
  isLoading: false,

  fetchAllRequests: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/requests");
      set({ requests: data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyRequests: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/requests/my");
      set({ myRequests: data });
    } finally {
      set({ isLoading: false });
    }
  },

  createRequest: async (data) => {
    const { data: newRequest } = await axiosInstance.post("/requests", data);
    set((s) => ({ myRequests: [newRequest, ...s.myRequests] }));
  },

  updateStatus: async (id, status) => {
    const { data: updated } = await axiosInstance.put(`/requests/${id}`, { status });
    set((s) => ({
      requests: s.requests.map((r) => (r._id === id ? updated : r)),
    }));
  },

  deleteRequest: async (id) => {
    await axiosInstance.delete(`/requests/${id}`);
    set((s) => ({
      requests: s.requests.filter((r) => r._id !== id),
    }));
  },
}));