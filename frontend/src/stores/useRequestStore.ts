import { create } from "zustand";

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
      const res = await fetch("/api/requests");
      const data = await res.json();
      set({ requests: data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyRequests: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/requests/my");
      const data = await res.json();
      set({ myRequests: data });
    } finally {
      set({ isLoading: false });
    }
  },

  createRequest: async (data) => {
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const newRequest = await res.json();
    set((s) => ({ myRequests: [newRequest, ...s.myRequests] }));
  },

  updateStatus: async (id, status) => {
    const res = await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await res.json();
    set((s) => ({
      requests: s.requests.map((r) => (r._id === id ? updated : r)),
    }));
  },

  deleteRequest: async (id) => {
    await fetch(`/api/requests/${id}`, { method: "DELETE" });
    set((s) => ({
      requests: s.requests.filter((r) => r._id !== id),
    }));
  },
}));