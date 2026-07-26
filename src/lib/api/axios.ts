import axios from "axios";
import { createClient } from "../supabase/client";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    if (typeof document !== "undefined") {
      const match = document.cookie.match(new RegExp('(^| )menntun-active-school=([^;]+)'));
      if (match) {
        config.headers["X-Active-School-Id"] = match[2];
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
