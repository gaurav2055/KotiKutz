"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, KeyRound, Trash2, ChevronRight, Camera } from "lucide-react";

type ProfileSidebarProps = {
  onChangePassword: () => void;
};

export default function ProfileSidebar({ onChangePassword }: ProfileSidebarProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(URL.createObjectURL(file));
    // TODO: upload file to backend/storage and persist URL
  }

  return (
    <aside className="w-[240px] shrink-0">

      {/* Profile card */}
      <div className="bg-brand-dark rounded-[10px] overflow-hidden mb-3">
        {/* Avatar + name + location */}
        <div className="flex flex-col items-center py-6 px-4">

          {/* Clickable avatar with camera overlay */}
          <button
            onClick={() => fileRef.current?.click()}
            className="relative w-[61px] h-[61px] rounded-full mb-2 group"
          >
            <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
              {avatar ? (
                <Image src={avatar} alt="Profile" fill className="object-cover rounded-full" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-green">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              )}
            </div>

            {/* Camera overlay on hover */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-brand-green font-semibold text-base">Gaurav Suvarna</p>
          <p className="text-gray-400 text-sm">Viman Nagar, Pune</p>
        </div>

        {/* Total visits */}
        <div className="flex items-center justify-between bg-white/5 px-4 py-3">
          <span className="text-gray-300 text-sm">Total Visits</span>
          <span className="text-brand-green font-semibold text-sm">12</span>
        </div>
      </div>

      {/* Account nav */}
      <div className="bg-white border border-gray-200 rounded-[10px] overflow-hidden">
        <p className="text-xs text-gray-500 uppercase tracking-widest px-4 py-2 border-b border-gray-100">Account</p>

        <Link href="/appointments" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-black">
            <CalendarDays className="w-4 h-4" />
            My Appointments
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Link>

        <button
          onClick={onChangePassword}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
        >
          <div className="flex items-center gap-2 text-sm text-black">
            <KeyRound className="w-4 h-4" />
            Change Password
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2 text-sm text-red-500">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>
    </aside>
  );
}
