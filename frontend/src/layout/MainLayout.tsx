import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import { QueuePanel } from "./components/QueuePanel";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { useEffect, useState } from "react";
import { AuthInterceptor } from "@/lib/AuthInterceptor";

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className='h-screen bg-black text-white flex flex-col'>
      <AuthInterceptor />

      {/* Desktop layout */}
      {!isMobile && (
        <>
          <ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
            <AudioPlayer />

            {/* Left sidebar */}
            <ResizablePanel defaultSize={20} minSize={10} maxSize={30}>
              <LeftSidebar />
            </ResizablePanel>

            <ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

            {/* Main content */}
            <ResizablePanel defaultSize={60}>
              <Outlet />
            </ResizablePanel>

            <ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

            {/* Right sidebar */}
            <ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
              <FriendsActivity />
            </ResizablePanel>
          </ResizablePanelGroup>

          <QueuePanel />
          <PlaybackControls />
        </>
      )}

      {/* Mobile layout */}
      {isMobile && (
        <>
          <AudioPlayer />

          {/* Main scrollable content — padded so it clears player + nav */}
          <div className='flex-1 overflow-y-auto pb-36'>
            <Outlet />
          </div>

          {/* Player bar sits above bottom nav */}
          <div className='fixed bottom-16 left-0 right-0 z-40'>
            <PlaybackControls />
          </div>

          <MobileBottomNav />
        </>
      )}
    </div>
  );
};

export default MainLayout;
