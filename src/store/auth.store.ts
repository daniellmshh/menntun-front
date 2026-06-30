import { create } from "zustand";
import { Session } from "@supabase/supabase-js";
import { RequestUser } from "@/types";

interface AuthState {
  user: RequestUser | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: RequestUser | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, session: null, isLoading: false }),
}));
