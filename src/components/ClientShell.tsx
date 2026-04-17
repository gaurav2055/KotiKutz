"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthModalProvider } from "@/contexts/AuthModalContext";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <AuthModalProvider>
      <div className="min-h-screen flex flex-col">
        {!isAdmin && <Navbar />}
        <div className="flex-1">{children}</div>
        {!isAdmin && <Footer />}
      </div>
    </AuthModalProvider>
  );
}
