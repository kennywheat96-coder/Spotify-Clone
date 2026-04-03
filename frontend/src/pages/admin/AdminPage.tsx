import { useAuthStore } from "@/stores/useAuthStore";
import Header from "./components/Header";
import DashboardStats from "./components/DashboardStats";
import { Album, Music, Music2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SongsTabContent from "./components/SongsTabContent";
import AlbumsTabContent from "./components/AlbumsTabContent";
import RequestsTabContent from "./components/RequestsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";
import { useRequestStore } from "@/stores/useRequestStore";
import { AuthInterceptor } from "@/lib/AuthInterceptor";

const AdminPage = () => {
  const { isAdmin, isLoading } = useAuthStore();
  const { fetchAlbums, fetchSongs, fetchStats } = useMusicStore();
  const { requests, fetchAllRequests } = useRequestStore();

  useEffect(() => {
    if (!isAdmin) return;
    fetchAlbums();
    fetchSongs();
    fetchStats();
    fetchAllRequests();
  }, [isAdmin, fetchAlbums, fetchSongs, fetchStats, fetchAllRequests]);

  if (!isAdmin && !isLoading) return <div>Unauthorized</div>;

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className='min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100 p-8'>
      <AuthInterceptor />
      <Header />
      <DashboardStats />

      <Tabs defaultValue='songs' className='space-y-6'>
        <TabsList className='p-1 bg-zinc-800/50'>
          <TabsTrigger value='songs' className='data-[state=active]:bg-zinc-700'>
            <Music className='mr-2 size-4' />
            Songs
          </TabsTrigger>
          <TabsTrigger value='albums' className='data-[state=active]:bg-zinc-700'>
            <Album className='mr-2 size-4' />
            Albums
          </TabsTrigger>
          <TabsTrigger value='requests' className='data-[state=active]:bg-zinc-700'>
            <Music2 className='mr-2 size-4' />
            Requests
            {pendingCount > 0 && (
              <span className='ml-2 bg-emerald-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full'>
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='songs'>
          <SongsTabContent />
        </TabsContent>
        <TabsContent value='albums'>
          <AlbumsTabContent />
        </TabsContent>
        <TabsContent value='requests'>
          <RequestsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
