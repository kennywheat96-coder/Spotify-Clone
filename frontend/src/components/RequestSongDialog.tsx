import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRequestStore } from "@/stores/useRequestStore";
import { useUser } from "@clerk/clerk-react";
import { Music2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export const RequestSongDialog = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { createRequest } = useRequestStore();
  const { user } = useUser();

  const [form, setForm] = useState({
    artistName: "",
    songName: "",
    youtubeUrl: "",
    albumName: "",
    type: "single" as "single" | "album",
    notes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.artistName || !form.songName) {
      return toast.error("Artist name and song name are required");
    }

    setIsLoading(true);
    try {
      await createRequest({
        ...form,
        requestedByName: user?.fullName || "",
      });
      toast.success("Request submitted! We'll add it soon 🎵");
      setForm({
        artistName: "",
        songName: "",
        youtubeUrl: "",
        albumName: "",
        type: "single",
        notes: "",
      });
      setOpen(false);
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          className='w-full justify-start text-white hover:bg-zinc-800 gap-2'
        >
          <Music2 className='size-5' />
          <span className='hidden md:inline'>Request a Song</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='bg-zinc-900 border-zinc-700 max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Music2 className='size-5 text-emerald-500' />
            Request a Song
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-2'>

          {/* Artist Name */}
          <div className='space-y-1'>
            <label className='text-sm font-medium text-zinc-300'>
              Artist Name <span className='text-red-400'>*</span>
            </label>
            <Input
              value={form.artistName}
              onChange={(e) => update("artistName", e.target.value)}
              placeholder='e.g. Drake'
              className='bg-zinc-800 border-zinc-700 text-white'
            />
          </div>

          {/* Song Name */}
          <div className='space-y-1'>
            <label className='text-sm font-medium text-zinc-300'>
              Song Name <span className='text-red-400'>*</span>
            </label>
            <Input
              value={form.songName}
              onChange={(e) => update("songName", e.target.value)}
              placeholder='e.g. Gods Plan'
              className='bg-zinc-800 border-zinc-700 text-white'
            />
          </div>

          {/* Type */}
          <div className='space-y-1'>
            <label className='text-sm font-medium text-zinc-300'>Type</label>
            <div className='flex gap-3'>
              <button
                onClick={() => update("type", "single")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  form.type === "single"
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Single
              </button>
              <button
                onClick={() => update("type", "album")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  form.type === "album"
                    ? "bg-emerald-500 text-black"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Full Album
              </button>
            </div>
          </div>

          {/* Album Name (shown when album selected) */}
          {form.type === "album" && (
            <div className='space-y-1'>
              <label className='text-sm font-medium text-zinc-300'>Album Name</label>
              <Input
                value={form.albumName}
                onChange={(e) => update("albumName", e.target.value)}
                placeholder='e.g. Certified Lover Boy'
                className='bg-zinc-800 border-zinc-700 text-white'
              />
            </div>
          )}

          {/* YouTube URL */}
          <div className='space-y-1'>
            <label className='text-sm font-medium text-zinc-300'>
              YouTube URL <span className='text-zinc-500'>(optional)</span>
            </label>
            <Input
              value={form.youtubeUrl}
              onChange={(e) => update("youtubeUrl", e.target.value)}
              placeholder='https://youtube.com/watch?v=...'
              className='bg-zinc-800 border-zinc-700 text-white'
            />
            <p className='text-xs text-zinc-500'>
              Paste a YouTube link to help us find the right song
            </p>
          </div>

          {/* Notes */}
          <div className='space-y-1'>
            <label className='text-sm font-medium text-zinc-300'>
              Notes <span className='text-zinc-500'>(optional)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder='Any extra details...'
              rows={3}
              className='w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-emerald-500 resize-none placeholder:text-zinc-500'
            />
          </div>
        </div>

        <div className='flex gap-2 justify-end'>
          <Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='bg-emerald-500 hover:bg-emerald-600 text-black'
          >
            {isLoading ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};