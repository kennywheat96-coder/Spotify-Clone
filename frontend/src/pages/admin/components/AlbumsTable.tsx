import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMusicStore } from "@/stores/useMusicStore";
import { axiosInstance } from "@/lib/axios";
import { Calendar, Music, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import AddSongsToAlbumDialog from "./AddSongsToAlbumDialog";
import EditAlbumDialog from "./EditAlbumDialog";
import toast from "react-hot-toast";

const AlbumsTable = () => {
  const { albums, deleteAlbum, fetchAlbums, fetchSongs } = useMusicStore();
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<any>(null);
  const [fixingAlbum, setFixingAlbum] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

const handleFixArtists = async (albumId: string) => {
      setFixingAlbum(albumId);
    try {
      const res = await axiosInstance.post(`/admin/albums/${albumId}/fix-artists`);
      toast.success(res.data.message);
      await fetchSongs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fix artists");
    } finally {
      setFixingAlbum(null);
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className='hover:bg-zinc-800/50'>
            <TableHead className='w-[50px]'></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Release Year</TableHead>
            <TableHead>Songs</TableHead>
            <TableHead className='text-right'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {albums.map((album) => (
            <TableRow key={album._id} className='hover:bg-zinc-800/50'>
              <TableCell>
                <img src={album.imageUrl} alt={album.title} className='w-10 h-10 rounded object-cover' />
              </TableCell>
              <TableCell className='font-medium'>{album.title}</TableCell>
              <TableCell>{album.artist}</TableCell>
              <TableCell>
                <span className='inline-flex items-center gap-1 text-zinc-400'>
                  <Calendar className='h-4 w-4' />
                  {album.releaseYear}
                </span>
              </TableCell>
              <TableCell>
                <span className='inline-flex items-center gap-1 text-zinc-400'>
                  <Music className='h-4 w-4' />
                  {album.songs.length} songs
                </span>
              </TableCell>
              <TableCell className='text-right'>
                <div className='flex gap-2 justify-end'>
                  {/* Fix Artists button */}
                  <Button
                    variant='ghost'
                    size='sm'
onClick={() => handleFixArtists(album._id)}
                    disabled={fixingAlbum === album._id}
                    className='text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10'
                    title='Fix all song artists to match album artist'
                  >
                    <Wrench className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='sm'
                    onClick={() => setSelectedAlbum(album._id)}
                    className='text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10'>
                    <Plus className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='sm'
                    onClick={() => setEditingAlbum(album)}
                    className='text-blue-400 hover:text-blue-300 hover:bg-blue-400/10'>
                    <Pencil className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='sm'
                    onClick={() => deleteAlbum(album._id)}
                    className='text-red-400 hover:text-red-300 hover:bg-red-400/10'>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedAlbum && (
        <AddSongsToAlbumDialog albumId={selectedAlbum} onClose={() => setSelectedAlbum(null)} />
      )}

      {editingAlbum && (
        <EditAlbumDialog album={editingAlbum} onClose={() => setEditingAlbum(null)} />
      )}
    </>
  );
};

export default AlbumsTable;