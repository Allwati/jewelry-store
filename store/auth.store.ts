import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "CUSTOMER";
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      clearUser: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "jewelry-auth",
    }
  )
);
