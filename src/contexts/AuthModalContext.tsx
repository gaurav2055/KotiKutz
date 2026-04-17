"use client";

import { createContext, useCallback, useContext, useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

type AuthModalContextType = { openAuthModal: () => void };

const AuthModalContext = createContext<AuthModalContextType>({ openAuthModal: () => {} });

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openAuthModal = useCallback(() => setOpen(true), []);
  return (
    <AuthModalContext.Provider value={{ openAuthModal }}>
      {children}
      {open && <AuthModal onClose={() => setOpen(false)} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
