import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://spotify-clone-q2iy.onrender.com/api",
});

// Used by AdminPage to set token directly
export const setGetTokenFn = (fn: () => Promise<string | null>) => {
  axiosInstance.interceptors.request.use(async (config) => {
    const token = await fn();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

export const useAxiosWithAuth = () => {
  return axiosInstance;
};