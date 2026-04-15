"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/ui/Spinner";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("type"); // "invite" | "recovery" | null

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) return;

      if (event === "SIGNED_IN" && type === "invite") {
        // New staff invite — redirect to set password
        router.replace("/admin/set-password");
      } else if (event === "PASSWORD_RECOVERY") {
        // Customer forgot-password flow
        router.replace("/auth/set-password");
      } else if (event === "SIGNED_IN") {
        router.replace("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111]">
      <Spinner size="lg" label="Signing you in…" />
    </div>
  );
}

// Suspense wrapper required because useSearchParams() needs it in Next.js App Router
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <Spinner size="lg" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
