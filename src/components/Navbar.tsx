"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { UserCircle2, User, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const LOGO = "/logo.png";

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, loading, signOut } = useAuth();

  const isLoggedIn = !loading && user !== null;
  const userAvatar = user?.user_metadata?.avatar_url ?? null;

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        setIsAdmin(["employee", "manager", "super_admin"].includes(data?.role ?? ""));
      });
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="bg-brand-dark sticky top-0 z-50 w-full">
        {/* Main bar */}
        <div className="flex items-center justify-between px-6 md:px-8 h-[70px] md:h-[100px]">
          {/* Logo */}
          <Link href="/" onClick={closeMenu}>
            <Image
              src={LOGO}
              alt="KotiKutz"
              width={108}
              height={41}
              className="object-contain w-[80px] md:w-[108px]"
            />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8 text-white text-xl">
            <Link href="/"             className="hover:text-brand-green transition-colors">Home</Link>
            <Link href="/about"        className="hover:text-brand-green transition-colors">About Us</Link>
            <Link href="/services"     className="hover:text-brand-green transition-colors">Services</Link>
            <Link href="/appointments" className="hover:text-brand-green transition-colors">Book Appointment</Link>
            <Link href="/testimonials" className="hover:text-brand-green transition-colors">Testimonials</Link>

            {isLoggedIn ? (
              <div ref={dropdownRef} className="relative ml-4 shrink-0">
                <button onClick={() => setDropdownOpen((o) => !o)} className="relative cursor-pointer">
                  <div className="w-12 h-12 rounded-full border-2 border-brand-green flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                    {userAvatar ? (
                      <Image src={userAvatar} alt="Profile" width={48} height={48} className="object-cover w-full h-full" />
                    ) : (
                      <UserCircle2 className="w-8 h-8 text-white" />
                    )}
                  </div>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-14 w-48 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-xl overflow-hidden z-50">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-[#252525] transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-brand-green hover:bg-[#252525] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
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

          {/* Mobile right side: avatar + hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            {isLoggedIn && (
              <Link href="/profile" onClick={closeMenu}>
                <div className="w-9 h-9 rounded-full border-2 border-brand-green flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                  {userAvatar ? (
                    <Image src={userAvatar} alt="Profile" width={36} height={36} className="object-cover w-full h-full" />
                  ) : (
                    <UserCircle2 className="w-5 h-5 text-white" />
                  )}
                </div>
              </Link>
            )}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="text-white p-1"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="lg:hidden bg-brand-dark border-t border-white/10 px-6 py-5 flex flex-col gap-5">
            <Link href="/"             onClick={closeMenu} className="text-white text-lg hover:text-brand-green transition-colors">Home</Link>
            <Link href="/about"        onClick={closeMenu} className="text-white text-lg hover:text-brand-green transition-colors">About Us</Link>
            <Link href="/services"     onClick={closeMenu} className="text-white text-lg hover:text-brand-green transition-colors">Services</Link>
            <Link href="/appointments" onClick={closeMenu} className="text-white text-lg hover:text-brand-green transition-colors">Book Appointment</Link>
            <Link href="/testimonials" onClick={closeMenu} className="text-white text-lg hover:text-brand-green transition-colors">Testimonials</Link>

            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeMenu}
                    className="flex items-center gap-2 text-brand-green text-lg hover:opacity-80 transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { signOut(); closeMenu(); }}
                  className="flex items-center gap-2 text-red-400 text-lg hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setAuthOpen(true); closeMenu(); }}
                className="text-left text-brand-green text-lg font-medium"
              >
                Login
              </button>
            )}
          </div>
        )}
      </nav>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
