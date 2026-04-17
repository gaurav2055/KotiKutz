"use client";

import { createContext, useContext, useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

type AuthModalContextType = { openAuthModal: () => void };

const AuthModalContext = createContext<AuthModalContextType>({ openAuthModal: () => {} });

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AuthModalContext.Provider value={{ openAuthModal: () => setOpen(true) }}>
      {children}
      {open && <AuthModal onClose={() => setOpen(false)} />}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
