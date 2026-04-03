import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MascotWheelDialog } from "@/components/MascotWheelDialog";
import { axiosInstance } from "@/lib/axios";

const AuthCallbackPage = () => {
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();
  const syncAttempted = useRef(false);
  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !user || syncAttempted.current) return;

      try {
        syncAttempted.current = true;

        const res = await fetch("https://spotify-clone-q2iy.onrender.com/api/auth/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          }),
        });

        const data = await res.json();
        console.log("Auth callback response:", data);

        if (data.isNewUser && !data.mascot) {
          setShowWheel(true);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.log("Error in auth callback", error);
        navigate("/");
      }
    };

    syncUser();
  }, [isLoaded, user, navigate]);

  const handleMascotClaimed = async (mascotId: string) => {
    try {
      await axiosInstance.post("/users/mascot", { mascot: mascotId });
    } catch (error) {
      console.log("Error saving mascot", error);
    } finally {
      navigate("/");
    }
  };

  if (showWheel) {
    return <MascotWheelDialog onComplete={handleMascotClaimed} />;
  }

  return (
    <div className='h-screen w-full bg-black flex items-center justify-center'>
      <Card className='w-[90%] max-w-md bg-zinc-900 border-zinc-800'>
        <CardContent className='flex flex-col items-center gap-4 pt-6'>
          <Loader className='size-6 text-emerald-500 animate-spin' />
          <h3 className='text-zinc-400 text-xl font-bold'>Logging you in</h3>
          <p className='text-zinc-400 text-sm'>Redirecting...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;
