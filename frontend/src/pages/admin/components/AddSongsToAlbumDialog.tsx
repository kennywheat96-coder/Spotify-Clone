import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAxiosWithAuth } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Check, Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Props {
  albumId: string;
  onClose: () => void;
}

const AddSongsToAlbumDialog = ({ albumId, onClose }: Props) => {
  const { songs, albums, fetchSongs, fetchAlbums } = useMusicStore();
  const axiosInstance = useAxiosWithAuth();
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const album = albums.find((a) => a._id === albumId);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  const availableSongs = songs.filter(
    (song) =>
      !album?.songs.some((s: any) => s._id === song._id || s === song._id) &&
      (song.title.toLowerCase().includes(search.toLowerCase()) ||
        song.artist.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleSong = (songId: string) => {
    setSelectedIds((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  const handleAddSongs = async () => {
    if (selectedIds.length === 0) return toast.error("Select at least one song");
    setIsLoading(true);

    try {
      await axiosInstance.post(`/admin/albums/${albumId}/songs`, {
        songIds: selectedIds,
      });

      toast.success(`${selectedIds.length} songs added to album!`);
      fetchAlbums();
      fetchSongs();
      onClose();
    } catch (error: any) {
      toast.error("Failed to add songs: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='bg-zinc-900 border-zinc-700 max-w-lg'>
        <DialogHeader>
          <DialogTitle>Add Songs to — {album?.title}</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400' />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search songs...'
            className='pl-9 bg-zinc-800 border-zinc-700'
          />
        </div>

        {selectedIds.length > 0 && (
          <p className='text-sm text-emerald-400'>
            {selectedIds.length} songs selected
          </p>
        )}

        {/* Song list */}
        <ScrollArea className='h-[400px] pr-2'>
          <div className='space-y-1'>
            {availableSongs.length === 0 ? (
              <p className='text-zinc-400 text-sm text-center py-8'>
                {search ? "No songs match your search" : "All songs already in album"}
              </p>
            ) : (
              availableSongs.map((song) => {
                const isSelected = selectedIds.includes(song._id);
                return (
                  <div
                    key={song._id}
                    onClick={() => toggleSong(song._id)}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "hover:bg-zinc-800"
                    }`}
                  >
                    <img
                      src={song.imageUrl}
                      alt={song.title}
                      className='w-10 h-10 rounded object-cover flex-shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-white truncate'>
                        {song.title}
                      </p>
                      <p className='text-xs text-zinc-400 truncate'>{song.artist}</p>
                    </div>
                    {isSelected && (
                      <Check className='h-4 w-4 text-emerald-400 flex-shrink-0' />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className='flex gap-2 justify-end'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSongs}
            disabled={isLoading || selectedIds.length === 0}
            className='bg-emerald-500 hover:bg-emerald-600 text-black'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Adding...
              </>
            ) : (
              `Add ${selectedIds.length > 0 ? selectedIds.length : ""} Songs`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSongsToAlbumDialog;