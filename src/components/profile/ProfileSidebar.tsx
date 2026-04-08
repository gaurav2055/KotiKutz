"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, KeyRound, Trash2, ChevronRight, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/app/profile/page";

type ProfileSidebarProps = {
  userId: string;
  profile: Profile;
  totalVisits: number;
  onAvatarUpdate: (url: string) => void;
  onChangePassword: () => void;
};

export default function ProfileSidebar({ userId, profile, totalVisits, onAvatarUpdate, onChangePassword }: ProfileSidebarProps) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.name ?? "User";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const path = `${userId}/avatar.${file.name.split(".").pop()}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      onAvatarUpdate(publicUrl);
    }
    setUploading(false);
  }

  return (
    <aside className="w-[240px] shrink-0">

      {/* Profile card */}
      <div className="bg-brand-dark rounded-[10px] overflow-hidden mb-3">
        <div className="flex flex-col items-center py-6 px-4">

          {/* Clickable avatar with camera overlay */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="relative w-[61px] h-[61px] rounded-full mb-2 group"
          >
            <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="Profile" fill className="object-cover rounded-full" />
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-brand-green">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-brand-green font-semibold text-base">{displayName}</p>
          <p className="text-gray-400 text-sm">
            {profile.preferred_location_name ?? "No location set"}
          </p>
        </div>

        {/* Total visits */}
        <div className="flex items-center justify-between bg-white/5 px-4 py-3">
          <span className="text-gray-300 text-sm">Total Visits</span>
          <span className="text-brand-green font-semibold text-sm">{totalVisits}</span>
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
