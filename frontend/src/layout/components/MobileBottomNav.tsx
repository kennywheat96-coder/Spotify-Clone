import { cn } from "@/lib/utils";
import { HomeIcon, Search, Library, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: HomeIcon, label: "Home", to: "/" },
  { icon: Search, label: "Search", to: "/search" },
  { icon: Library, label: "Library", to: "/library" },
  { icon: Heart, label: "Liked", to: "/liked" },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <div className='md:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-zinc-800'>
      <div className='flex items-center justify-around px-2 py-2 pb-safe'>
        {navItems.map(({ icon: Icon, label, to }) => {
          const isActive = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon
                className={cn("size-6", isActive && "text-green-400")}
                fill={isActive ? "currentColor" : "none"}
              />
              <span className={cn("text-[10px] font-medium", isActive && "text-white")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
