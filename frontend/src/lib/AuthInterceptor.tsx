import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { setGetTokenFn } from "./axios";

export const AuthInterceptor = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    // Register the getToken function so axios can call it fresh on every request
    setGetTokenFn(getToken);

    return () => {
      setGetTokenFn(() => Promise.resolve(null));
    };
  }, [getToken]);

  return null;
};

