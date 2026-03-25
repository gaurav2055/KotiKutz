"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { UserCircle2, User, LogOut } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

const LOGO = "/logo.png";

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading, signOut } = useAuth();

  const isLoggedIn = !loading && user !== null;
  const userAvatar = user?.user_metadata?.avatar_url ?? null;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-brand-dark h-[100px] flex items-center justify-between px-8 w-full">
        {/* Logo */}
        <Link href="/">
          <Image
            src={LOGO}
            alt="KotiKutz"
            width={108}
            height={41}
            className="object-contain"
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8 text-white text-xl">
          <Link href="/"             className="hover:text-brand-green transition-colors">Home</Link>
          <Link href="/about"        className="hover:text-brand-green transition-colors">About Us</Link>
          <Link href="/services"     className="hover:text-brand-green transition-colors">Services</Link>
          <Link href="/appointments" className="hover:text-brand-green transition-colors">Book Appointment</Link>
          <Link href="/testimonials" className="hover:text-brand-green transition-colors">Testimonials</Link>

          {isLoggedIn ? (
            <div ref={dropdownRef} className="relative ml-4 shrink-0">
              {/* Avatar button */}
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="relative cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full border-2 border-brand-green flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                  {userAvatar ? (
                    <Image src={userAvatar} alt="Profile" width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <UserCircle2 className="w-8 h-8 text-white" />
                  )}
                </div>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-14 w-44 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-xl overflow-hidden z-50">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#252525] transition-colors"
                  >
                    <User className="w-4 h-4 text-gray-400" />
                    My Profile
                  </Link>
                  <button
                    onClick={() => { signOut(); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#252525] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button className="ml-4" onClick={() => setAuthOpen(true)}>Login</Button>
          )}
        </div>
      </nav>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
