import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ca2-med-api.vercel.app/",
});

// Add request interceptor to automatically include token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;