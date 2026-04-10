"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import NotificationsCard from "@/components/profile/NotificationsCard";
import RecentActivity from "@/components/profile/RecentActivity";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export type Profile = {
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  dob: string | null;
  gender: string | null;
  preferred_location_id: string | null;
  preferred_location_name: string | null;
};

export default function ProfilePage() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalVisits, setTotalVisits] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase
        .from("profiles")
        .select("name, first_name, last_name, email, phone, avatar_url, dob, gender, preferred_location_id, locations(name)")
        .eq("id", user.id)
        .single(),
      supabase
        .from("appointments")
        .select("id", { count: "exact" })
        .eq("user_id", user.id),
    ]).then(([{ data: profileData }, { count }]) => {
      if (profileData) {
        const locRaw = profileData.locations as unknown;
        const loc = Array.isArray(locRaw) ? (locRaw[0] as { name: string } | undefined) ?? null : locRaw as { name: string } | null;
        setProfile({
          name:                   profileData.name,
          first_name:             profileData.first_name,
          last_name:              profileData.last_name,
          email:                  profileData.email ?? user.email ?? null,
          phone:                  profileData.phone,
          avatar_url:             profileData.avatar_url,
          dob:                    profileData.dob,
          gender:                 profileData.gender,
          preferred_location_id:  profileData.preferred_location_id,
          preferred_location_name: loc?.name ?? null,
        });
      }
      setTotalVisits(count ?? 0);
      setLoading(false);
    });
  }, [user]);

  function updateProfile(updated: Partial<Profile>) {
    setProfile((prev) => prev ? { ...prev, ...updated } : prev);
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" label="Loading profile…" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <main className="max-w-[1440px] mx-auto px-4 md:px-16 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <ProfileSidebar
          userId={user.id}
          profile={profile}
          totalVisits={totalVisits}
          onAvatarUpdate={(url) => updateProfile({ avatar_url: url })}
          onChangePassword={() => setPasswordModalOpen(true)}
        />
        <div className="flex-1">
          <PersonalInfoForm
            userId={user.id}
            profile={profile}
            onSave={updateProfile}
          />
          <NotificationsCard userId={user.id} />
          <RecentActivity userId={user.id} />
        </div>
      </div>

      {passwordModalOpen && (
        <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />
      )}
    </main>
  );
}
