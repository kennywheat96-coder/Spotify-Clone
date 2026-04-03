import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Song {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  audioUrl: string;
  albumId?: string;
}

interface EditSongDialogProps {
  song: Song;
  onClose: () => void;
}

const EditSongDialog = ({ song, onClose }: EditSongDialogProps) => {
  const { albums, fetchAlbums, fetchSongs } = useMusicStore();
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [albumId, setAlbumId] = useState(song.albumId || "none");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(song.imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("artist", artist);
      formData.append("albumId", albumId === "none" ? "" : albumId);
      if (imageFile) formData.append("imageFile", imageFile);
      if (audioFile) formData.append("audioFile", audioFile);

      await axiosInstance.put(`/admin/songs/${song._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Song updated!");
      await fetchSongs();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update song");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className='bg-zinc-900 border-zinc-700 max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Song</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Cover image */}
          <div
            className='w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-zinc-600 cursor-pointer hover:border-emerald-500 transition-colors relative'
            onClick={() => imageRef.current?.click()}
          >
            <img src={imagePreview} alt='cover' className='w-full h-full object-cover' />
            <div className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity'>
              <Upload className='h-6 w-6 text-white' />
              <span className='text-white text-sm ml-2'>Change Cover</span>
            </div>
          </div>
          <input ref={imageRef} type='file' accept='image/*' hidden onChange={handleImageChange} />

          {/* Title */}
          <div>
            <label className='text-xs text-zinc-400 mb-1 block'>Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)}
              className='bg-zinc-800 border-zinc-600 text-white' />
          </div>

          {/* Artist */}
          <div>
            <label className='text-xs text-zinc-400 mb-1 block'>Artist</label>
            <Input value={artist} onChange={(e) => setArtist(e.target.value)}
              className='bg-zinc-800 border-zinc-600 text-white' />
          </div>

          {/* Album */}
          <div>
            <label className='text-xs text-zinc-400 mb-1 block'>Album</label>
            <Select value={albumId} onValueChange={setAlbumId}>
              <SelectTrigger className='bg-zinc-800 border-zinc-600 text-white'>
                <SelectValue placeholder='Select album' />
              </SelectTrigger>
              <SelectContent className='bg-zinc-800 border-zinc-700'>
                <SelectItem value='none'>No Album (Single)</SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album._id} value={album._id}>{album.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audio file */}
          <div>
            <label className='text-xs text-zinc-400 mb-1 block'>Audio File</label>
            <div
              className='flex items-center gap-3 p-3 bg-zinc-800 border border-zinc-600 rounded-md cursor-pointer hover:border-emerald-500 transition-colors'
              onClick={() => audioRef.current?.click()}
            >
              <Upload className='h-4 w-4 text-zinc-400' />
              <span className='text-sm text-zinc-400'>
                {audioFile ? audioFile.name : "Click to replace audio file"}
              </span>
            </div>
            <input ref={audioRef} type='file' accept='audio/*' hidden
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
          </div>

          {/* Buttons */}
          <div className='flex gap-2 pt-2'>
            <Button variant='outline' className='flex-1' onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className='flex-1 bg-emerald-500 hover:bg-emerald-600 text-black'
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSongDialog;
