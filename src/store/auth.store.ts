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
  setActiveSchoolId: (schoolId: string | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setActiveSchoolId: (schoolId) => {
    if (typeof document !== "undefined") {
      if (schoolId) {
        document.cookie = `menntun-active-school=${schoolId}; path=/; max-age=31536000`; // 1 year
      } else {
        document.cookie = "menntun-active-school=; path=/; max-age=0";
      }
    }
    set((state) => ({ 
      user: state.user ? { ...state.user, activeSchoolId: schoolId } : null 
    }));
  },
  clear: () => {
    if (typeof document !== "undefined") {
      document.cookie = "menntun-active-school=; path=/; max-age=0";
    }
    set({ user: null, session: null, isLoading: false });
  },
}));
