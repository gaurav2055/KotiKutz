"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import DarkInput from "@/components/ui/DarkInput";
import Spinner from "@/components/ui/Spinner";

const RULES = [
  { label: "At least 8 characters",  check: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",   check: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",   check: (p: string) => /[a-z]/.test(p) },
  { label: "One number",             check: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",  check: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function AdminSetPasswordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect away if not signed in
  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  const rulesOk = RULES.every((r) => r.check(password));
  const canSubmit = rulesOk && password === confirm && !saving;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }
    router.replace("/admin");
  }

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Set Your Password</h1>
          <p className="text-white/50 text-sm">Choose a password to secure your KotiKutz staff account.</p>
        </div>

        <div className="space-y-4">
          <DarkInput
            label="New Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          {password && (
            <ul className="space-y-1 px-1">
              {RULES.map((r) => (
                <li key={r.label} className={`flex items-center gap-2 text-xs ${r.check(password) ? "text-brand-green" : "text-white/40"}`}>
                  <span>{r.check(password) ? "✓" : "○"}</span>
                  {r.label}
                </li>
              ))}
            </ul>
          )}

          <DarkInput
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
            autoComplete="new-password"
          />

          {confirm && password !== confirm && (
            <p className="text-red-400 text-xs px-1">Passwords do not match.</p>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-11 bg-brand-green text-black text-sm font-semibold rounded-xl hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Setting password…" : "Set Password & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
