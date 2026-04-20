import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song } from "@/types";
import { useChatStore } from "./useChatStore";

interface PlayerStore {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentIndex: number;
  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";
  volume: number;
  progress: number;
  isQueueVisible: boolean;

  initializeQueue: (songs: Song[]) => void;
  playAlbum: (songs: Song[], startIndex?: number) => void;
  setCurrentSong: (song: Song | null) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  toggleQueue: () => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  moveToFirst: (index: number) => void;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      queue: [],
      currentIndex: -1,
      isShuffle: false,
      repeatMode: "off",
      volume: 0.8,
      progress: 0,
      isQueueVisible: false,

      initializeQueue: (songs: Song[]) => {
        set({
          queue: songs,
          currentSong: get().currentSong || songs[0],
          currentIndex: get().currentIndex === -1 ? 0 : get().currentIndex,
        });
      },

      playAlbum: (songs: Song[], startIndex = 0) => {
        if (songs.length === 0) return;
        const song = songs[startIndex];
        const socket = useChatStore.getState().socket;
        if (socket.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity: `Playing ${song.title} by ${song.artist}`,
          });
        }
        set({ queue: songs, currentSong: song, currentIndex: startIndex, isPlaying: true });
      },

      setCurrentSong: (song: Song | null) => {
        if (!song) return;
        const socket = useChatStore.getState().socket;
        if (socket.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity: `Playing ${song.title} by ${song.artist}`,
          });
        }
        const songIndex = get().queue.findIndex((s) => s._id === song._id);
        set({
          currentSong: song,
          isPlaying: true,
          currentIndex: songIndex !== -1 ? songIndex : get().currentIndex,
        });
      },

      togglePlay: () => {
        const willStartPlaying = !get().isPlaying;
        const currentSong = get().currentSong;
        const socket = useChatStore.getState().socket;
        if (socket.auth) {
          socket.emit("update_activity", {
            userId: socket.auth.userId,
            activity:
              willStartPlaying && currentSong
                ? `Playing ${currentSong.title} by ${currentSong.artist}`
                : "Idle",
          });
        }
        set({ isPlaying: willStartPlaying });
      },

      playNext: () => {
        const { currentIndex, queue, isShuffle, repeatMode } = get();
        let nextIndex: number;
        if (repeatMode === "one") nextIndex = currentIndex;
        else if (isShuffle) nextIndex = Math.floor(Math.random() * queue.length);
        else nextIndex = currentIndex + 1;

        if (nextIndex < queue.length) {
          const nextSong = queue[nextIndex];
          const socket = useChatStore.getState().socket;
          if (socket.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${nextSong.title} by ${nextSong.artist}`,
            });
          }
          set({ currentSong: nextSong, currentIndex: nextIndex, isPlaying: true });
        } else if (repeatMode === "all") {
          const firstSong = queue[0];
          const socket = useChatStore.getState().socket;
          if (socket.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${firstSong.title} by ${firstSong.artist}`,
            });
          }
          set({ currentSong: firstSong, currentIndex: 0, isPlaying: true });
        } else {
          set({ isPlaying: false });
          const socket = useChatStore.getState().socket;
          if (socket.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: "Idle",
            });
          }
        }
      },

      playPrevious: () => {
        const { currentIndex, queue } = get();
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          const prevSong = queue[prevIndex];
          const socket = useChatStore.getState().socket;
          if (socket.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: `Playing ${prevSong.title} by ${prevSong.artist}`,
            });
          }
          set({ currentSong: prevSong, currentIndex: prevIndex, isPlaying: true });
        } else {
          set({ isPlaying: false });
          const socket = useChatStore.getState().socket;
          if (socket.auth) {
            socket.emit("update_activity", {
              userId: socket.auth.userId,
              activity: "Idle",
            });
          }
        }
      },

      removeFromQueue: (index: number) => {
        const { queue, currentIndex } = get();
        const newQueue = queue.filter((_, i) => i !== index);
        let newIndex = currentIndex;
        if (index < currentIndex) newIndex = currentIndex - 1;
        set({ queue: newQueue, currentIndex: newIndex });
      },

      reorderQueue: (fromIndex: number, toIndex: number) => {
        const { queue, currentIndex } = get();
        if (fromIndex === toIndex) return;
        const newQueue = [...queue];
        const [moved] = newQueue.splice(fromIndex, 1);
        newQueue.splice(toIndex, 0, moved);

        let newCurrentIndex = currentIndex;
        if (fromIndex === currentIndex) {
          newCurrentIndex = toIndex;
        } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
          newCurrentIndex = currentIndex - 1;
        } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
          newCurrentIndex = currentIndex + 1;
        }

        set({ queue: newQueue, currentIndex: newCurrentIndex });
      },

      moveToFirst: (index: number) => {
        const { queue, currentIndex } = get();
        if (index <= currentIndex + 1) return;
        const newQueue = [...queue];
        const [moved] = newQueue.splice(index, 1);
        newQueue.splice(currentIndex + 1, 0, moved);
        set({ queue: newQueue });
        import("react-hot-toast").then(({ default: toast }) =>
          toast.success("Playing next")
        );
      },

      toggleShuffle: () => set((s) => ({ isShuffle: !s.isShuffle })),
      cycleRepeat: () =>
        set((s) => ({
          repeatMode:
            s.repeatMode === "off" ? "all" : s.repeatMode === "all" ? "one" : "off",
        })),
      setVolume: (volume) => set({ volume }),
      setProgress: (progress) => set({ progress }),
      toggleQueue: () => set((s) => ({ isQueueVisible: !s.isQueueVisible })),
    }),
    {
name: "player-storage-v2",
      partialize: (state) => ({
        queue: state.queue,
        currentIndex: state.currentIndex,
        volume: state.volume,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
      }),
    }
  )
);