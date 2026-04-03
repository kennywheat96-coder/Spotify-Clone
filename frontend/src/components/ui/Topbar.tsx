import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/clerk-react";
import { SearchBar } from "../SearchBar";
import { LayoutDashboardIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios";

const MASCOT_EMOJIS: Record<string, string> = {
  zeraphon: "⚡", valkara: "🗡️", solmaar: "☀️", krython: "🔱",
  nyxara: "🌑", thornblade: "🛡️", embervex: "🐲", lumicorn: "🦄",
  frostwing: "🦋", grimmoth: "🦇", stoneback: "🐢", glimmerfang: "🦊",
  coralspine: "🐉", woolveil: "🐑", nebulon: "👾", voidcrawler: "🕷️",
  pulsarfin: "🐬", asterix: "☄️", quantumflea: "🔮", solarius: "🌟",
  driftmoss: "🌿",
};

const Topbar = () => {
  const { isAdmin, checkAdminStatus } = useAuthStore();
  const { isSignedIn } = useAuth();
  const [mascot, setMascot] = useState<string | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (!isSignedIn) return;
    const fetchMascot = async () => {
      try {
        const { data } = await axiosInstance.get("/users/mascot");
        if (data.mascot) setMascot(data.mascot);
      } catch (err) {
        console.log("Error fetching mascot:", err);
      }
    };
    fetchMascot();
  }, [isSignedIn]);

  return (
    <div className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10'>
      <div className='flex gap-2 items-center'>
        <img src='/spotify.png' className='size-8' alt='Spotify logo' />
        <span className='font-semibold hidden sm:block'>Spotify but Better</span>
      </div>

      {/* Search bar — hidden on mobile */}
      <div className='hidden sm:block flex-1 max-w-md mx-4'>
        <SearchBar />
      </div>

      <div className='flex items-center gap-4'>
        {isAdmin && (
          <Link
            to='/admin'
            className={cn(buttonVariants({ variant: "outline" }), "flex gap-1")}
          >
            <LayoutDashboardIcon className='size-4 mr-1' />
            Admin
          </Link>
        )}

        <SignedOut>
          <SignInButton mode='modal'>
            <button className={cn(buttonVariants({ variant: "outline" }))}>Sign in</button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className='flex items-center gap-2'>
            {mascot && (
              <div
                className='w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg'
                title={`Your mascot: ${mascot}`}
              >
                {MASCOT_EMOJIS[mascot] || "🎵"}
              </div>
            )}
            <UserButton />
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Topbar;
