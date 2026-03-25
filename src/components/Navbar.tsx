"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { UserCircle2, Pencil } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const LOGO = "/logo.png";

// TODO: Replace with real auth state from context/store
const IS_LOGGED_IN = false;
const USER_AVATAR: string | null = null; // set to image URL when user has uploaded one

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);

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

          {IS_LOGGED_IN ? (
            <Link href="/profile" className="relative ml-4 shrink-0">
              {/* Avatar ring */}
              <div className="w-12 h-12 rounded-full border-2 border-brand-green flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
                {USER_AVATAR ? (
                  <Image src={USER_AVATAR} alt="Profile" width={48} height={48} className="object-cover w-full h-full" />
                ) : (
                  <UserCircle2 className="w-8 h-8 text-white" />
                )}
              </div>
              {/* Edit badge */}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gray-600 rounded-full border-2 border-brand-dark flex items-center justify-center">
                <Pencil className="w-2.5 h-2.5 text-white" />
              </div>
            </Link>
          ) : (
            <Button className="ml-4" onClick={() => setAuthOpen(true)}>Login</Button>
          )}
        </div>
      </nav>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
