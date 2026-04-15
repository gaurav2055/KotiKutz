"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CalendarDays, KeyRound, Trash2, ChevronRight, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import type { Profile } from "@/app/profile/page";

type ProfileSidebarProps = {
  userId: string;
  profile: Profile;
  totalVisits: number;
  onAvatarUpdate: (url: string) => void;
  onChangePassword: () => void;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function ProfileSidebar({ userId, profile, totalVisits, onAvatarUpdate, onChangePassword }: ProfileSidebarProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const googleLinked = user?.identities?.some((i) => i.provider === "google") ?? false;

  async function handleLinkGoogle() {
    setLinkingGoogle(true);
    setGoogleError(null);
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: window.location.href },
    });
    if (error) {
      setGoogleError(error.message === "manual_linking_disabled"
        ? "Google linking is not enabled. Please contact support."
        : error.message);
      setLinkingGoogle(false);
    }
  }

  const displayName = profile.first_name && profile.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : profile.name ?? "User";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const newPath = `${userId}/avatar.${ext}`;

    // Delete old file first if the extension changed (upsert alone won't remove it)
    if (profile.avatar_url) {
      const oldPath = profile.avatar_url.split("/storage/v1/object/public/avatars/")[1];
      if (oldPath && oldPath !== newPath) {
        await supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    const { error } = await supabase.storage.from("avatars").upload(newPath, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(newPath);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
      onAvatarUpdate(publicUrl);
    }
    setUploading(false);
  }

  return (
    <aside className="w-full md:w-[240px] md:shrink-0">

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

        <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-red-500">
            <Trash2 className="w-4 h-4" />
            Delete Account
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Google account link */}
        {googleLinked ? (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-green-600">
            <GoogleIcon />
            Google Connected
          </div>
        ) : (
          <button
            onClick={handleLinkGoogle}
            disabled={linkingGoogle}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <div className="flex items-center gap-2 text-sm text-black">
              <GoogleIcon />
              {linkingGoogle ? "Redirecting…" : "Connect Google"}
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {googleError && (
        <p className="text-red-500 text-xs mt-2 px-1">{googleError}</p>
      )}
    </aside>
  );
}
