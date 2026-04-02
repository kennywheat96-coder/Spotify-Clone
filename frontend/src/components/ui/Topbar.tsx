import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { SearchBar } from "../SearchBar";
import { LayoutDashboardIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { buttonVariants } from "./button";
import { cn } from "@/lib/utils";

const Topbar = () => {
  const { isAdmin, checkAdminStatus } = useAuthStore();

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

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
            className={cn(buttonVariants({ variant: "outline" }), "hidden sm:flex gap-1")}
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
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
};

export default Topbar;