import { queryClient } from "@/components/wrappers/QueryProvider";
import axios from "axios";

const api = axios.create({
  withCredentials: true,
  baseURL:
    typeof window === "undefined"
      ? process.env.BASE_URL || "http://localhost:3000"
      : "",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      if (status === 403) {
        const pathname = window.location.pathname;
        const slug = pathname.split("/")[2];
        if (slug) {
          queryClient.invalidateQueries({ queryKey: ["workspace", slug] });
        }
      }
    }

    return Promise.reject(error);
  },
);
export default api;
