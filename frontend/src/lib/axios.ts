import axios from "axios";
import { useAuth } from "@clerk/clerk-react";

export const axiosInstance = axios.create({
  baseURL: "https://spotify-clone-q2iy.onrender.com/api",
});

export const useAxiosWithAuth = () => {
  const { getToken } = useAuth();

  axiosInstance.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return axiosInstance;
};