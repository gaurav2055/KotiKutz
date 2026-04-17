"use client";

import { createContext, useContext } from "react";

export type AdminRole = "employee" | "manager" | "super_admin";

type AdminContextType = {
  role: AdminRole;
  userName: string;
};

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({
  role,
  userName,
  children,
}: AdminContextType & { children: React.ReactNode }) {
  return (
    <AdminContext.Provider value={{ role, userName }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextType {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
