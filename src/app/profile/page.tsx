"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import NotificationsCard from "@/components/profile/NotificationsCard";
import RecentActivity from "@/components/profile/RecentActivity";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  return (
    <main className="max-w-[1440px] mx-auto px-16 py-12">
      <div className="flex gap-8 items-start">
        <ProfileSidebar onChangePassword={() => setPasswordModalOpen(true)} />
        <div className="flex-1">
          <PersonalInfoForm />
          <NotificationsCard />
          <RecentActivity />
        </div>
      </div>

      {passwordModalOpen && (
        <ChangePasswordModal onClose={() => setPasswordModalOpen(false)} />
      )}
    </main>
  );
}
