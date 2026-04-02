import { create } from "zustand";
import { axiosInstance } from "@/lib/axios";
 
interface Song {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
}
 
interface Playlist {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  songs: Song[];
  owner: string;
}
 
interface PlaylistStore {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
 
  fetchPlaylists: () => Promise<void>;
  fetchPlaylistById: (id: string) => Promise<void>;
  createPlaylist: (name: string, description?: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addSongToPlaylist: (playlistId: string, songId: string) => Promise<void>;
  removeSongFromPlaylist: (playlistId: string, songId: string) => Promise<void>;
}
 
export const usePlaylistStore = create<PlaylistStore>((set) => ({
  playlists: [],
  currentPlaylist: null,
  isLoading: false,
 
  fetchPlaylists: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/playlists");
      set({ playlists: data });
    } finally {
      set({ isLoading: false });
    }
  },
 
  fetchPlaylistById: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get(`/playlists/${id}`);
      set({ currentPlaylist: data });
    } finally {
      set({ isLoading: false });
    }
  },
 
  createPlaylist: async (name, description = "") => {
    const { data } = await axiosInstance.post("/playlists", { name, description });
    set((s) => ({ playlists: [data, ...s.playlists] }));
  },
 
  deletePlaylist: async (id) => {
    await axiosInstance.delete(`/playlists/${id}`);
    set((s) => ({ playlists: s.playlists.filter((p) => p._id !== id) }));
  },
 
  addSongToPlaylist: async (playlistId, songId) => {
    const { data } = await axiosInstance.post(`/playlists/${playlistId}/songs`, { songId });
    set((s) => ({
      playlists: s.playlists.map((p) => (p._id === playlistId ? data : p)),
      currentPlaylist: s.currentPlaylist?._id === playlistId ? data : s.currentPlaylist,
    }));
  },
 
  removeSongFromPlaylist: async (playlistId, songId) => {
    const { data } = await axiosInstance.delete(`/playlists/${playlistId}/songs`, {
      data: { songId },
    });
    set((s) => ({
      playlists: s.playlists.map((p) => (p._id === playlistId ? data : p)),
      currentPlaylist: s.currentPlaylist?._id === playlistId ? data : s.currentPlaylist,
    }));
  },
}));