import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://spotify-clone-q2iy.onrender.com/api",
});

// Token is set from outside React components
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

axiosInstance.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export const useAxiosWithAuth = () => {
  return axiosInstance;
};