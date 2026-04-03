import { axiosInstance } from "@/lib/axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const updateApiToken = (token: string | null) => {
  if (token) axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axiosInstance.defaults.headers.common["Authorization"];
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, userId } = useAuth();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const { checkAdminStatus } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        updateApiToken(token);

        if (token && userId && isLoaded && user) {
          await checkAdminStatus();
          if (userId) initSocket(userId);

          // Sync user to MongoDB on every sign in
          try {
            await fetch("https://spotify-clone-q2iy.onrender.com/api/auth/callback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
              }),
            });
          } catch (err) {
            console.log("Error syncing user:", err);
          }
        }
      } catch (error: any) {
        updateApiToken(null);
        console.log("Error in auth provider", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    return () => disconnectSocket();
  }, [getToken, userId, isLoaded, user, checkAdminStatus, initSocket, disconnectSocket]);

  if (loading)
    return (
      <div className='h-screen w-full flex items-center justify-center'>
        <Loader className='size-8 text-emerald-500 animate-spin' />
      </div>
    );

  return <>{children}</>;
};

export default AuthProvider;
