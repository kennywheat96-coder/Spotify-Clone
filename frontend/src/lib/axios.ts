import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://spotify-clone-q2iy.onrender.com/api",
});

// Holds a reference to Clerk's getToken function
let getTokenFn: (() => Promise<string | null>) | null = null;

export const setGetTokenFn = (fn: () => Promise<string | null>) => {
  getTokenFn = fn;
};

axiosInstance.interceptors.request.use(async (config) => {
  if (getTokenFn) {
    const token = await getTokenFn();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const useAxiosWithAuth = () => {
  return axiosInstance;
};