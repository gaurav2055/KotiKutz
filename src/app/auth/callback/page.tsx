"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Spinner from "@/components/ui/Spinner";

function redirectByType(type: string | null, router: ReturnType<typeof useRouter>) {
  if (type === "invite") {
    router.replace("/admin/set-password");
  } else if (type === "recovery") {
    router.replace("/auth/set-password");
  } else {
    router.replace("/");
  }
}

function CallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    // All hash/window access is inside useEffect — client-only, never SSR.
    const hashParams  = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(window.location.search);

    const type          = hashParams.get("type") ?? queryParams.get("type");
    const access_token  = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");
    const code          = queryParams.get("code"); // PKCE flow

    async function run() {
      // Implicit flow: tokens in hash — set session directly.
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (!error) { redirectByType(type, router); return; }
      }

      // PKCE flow: exchange code for session.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) { redirectByType(type, router); return; }
      }

      // Fallback: session already set by createBrowserClient auto-detection.
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { redirectByType(type, router); }
    }

    run();

    // Belt-and-suspenders: catch SIGNED_IN if it fires after run() already checked.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY")) {
        const liveType = new URLSearchParams(window.location.hash.substring(1)).get("type") ?? type;
        redirectByType(liveType, router);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111]">
      <Spinner size="lg" label="Signing you in…" />
    </div>
  );
}

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
