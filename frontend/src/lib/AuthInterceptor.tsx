import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setAuthToken } from "./axios";

export const AuthInterceptor = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    // Get token immediately and set it
    const initToken = async () => {
      const token = await getToken();
      setAuthToken(token);
    };

    initToken();

    // Refresh token every 50 seconds (tokens expire in 60s)
    const interval = setInterval(async () => {
      const token = await getToken();
      setAuthToken(token);
    }, 50000);

    return () => {
      clearInterval(interval);
      setAuthToken(null);
    };
  }, [getToken, isLoaded, isSignedIn]);

  return null;
};
