import { create } from "zustand";

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

export const usePlaylistStore = create<PlaylistStore>((set) => ({  playlists: [],
  currentPlaylist: null,
  isLoading: false,

  fetchPlaylists: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/playlists");
      const data = await res.json();
      set({ playlists: data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPlaylistById: async (id) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/playlists/${id}`);
      const data = await res.json();
      set({ currentPlaylist: data });
    } finally {
      set({ isLoading: false });
    }
  },

  createPlaylist: async (name, description = "") => {
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const newPlaylist = await res.json();
    set((s) => ({ playlists: [newPlaylist, ...s.playlists] }));
  },

  deletePlaylist: async (id) => {
    await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    set((s) => ({ playlists: s.playlists.filter((p) => p._id !== id) }));
  },

  addSongToPlaylist: async (playlistId, songId) => {
    const res = await fetch(`/api/playlists/${playlistId}/songs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId }),
    });
    const updated = await res.json();
    set((s) => ({
      playlists: s.playlists.map((p) => (p._id === playlistId ? updated : p)),
      currentPlaylist: s.currentPlaylist?._id === playlistId ? updated : s.currentPlaylist,
    }));
  },

  removeSongFromPlaylist: async (playlistId, songId) => {
    const res = await fetch(`/api/playlists/${playlistId}/songs`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ songId }),
    });
    const updated = await res.json();
    set((s) => ({
      playlists: s.playlists.map((p) => (p._id === playlistId ? updated : p)),
      currentPlaylist: s.currentPlaylist?._id === playlistId ? updated : s.currentPlaylist,
    }));
  },
}));