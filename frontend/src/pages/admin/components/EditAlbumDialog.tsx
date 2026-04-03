import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/lib/axios";
import { useMusicStore } from "@/stores/useMusicStore";
import { Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface Album {
  _id: string;
  title: string;
  artist: string;
  imageUrl: string;
  releaseYear: number;
}

interface EditAlbumDialogProps {
  album: Album;
  onClose: () => void;
}

const EditAlbumDialog = ({ album, onClose }: EditAlbumDialogProps) => {
  const { fetchAlbums } = useMusicStore();
  const [title, setTitle] = useState(album.title);
  const [artist, setArtist] = useState(album.artist);
  const [releaseYear, setReleaseYear] = useState(album.releaseYear.toString());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(album.imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

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
      formData.append("releaseYear", releaseYear);
      if (imageFile) formData.append("imageFile", imageFile);

      await axiosInstance.put(`/admin/albums/${album._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Album updated!");
      await fetchAlbums();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update album");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className='bg-zinc-900 border-zinc-700 max-w-md'>
        <DialogHeader>
          <DialogTitle>Edit Album</DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Cover image */}
          <div
            className='w-full h-40 rounded-lg overflow-hidden border-2 border-dashed border-zinc-600 cursor-pointer hover:border-violet-500 transition-colors relative'
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

          {/* Release Year */}
          <div>
            <label className='text-xs text-zinc-400 mb-1 block'>Release Year</label>
            <Input value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)}
              type='number' className='bg-zinc-800 border-zinc-600 text-white' />
          </div>

          {/* Buttons */}
          <div className='flex gap-2 pt-2'>
            <Button variant='outline' className='flex-1' onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className='flex-1 bg-violet-500 hover:bg-violet-600 text-white'
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

export default EditAlbumDialog;
