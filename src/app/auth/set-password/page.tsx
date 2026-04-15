"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import TextInput from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

const RULES = [
  { label: "At least 8 characters",  check: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",   check: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",   check: (p: string) => /[a-z]/.test(p) },
  { label: "One number",             check: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",  check: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SetPasswordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/");
  }, [user, authLoading, router]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center">
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
    router.replace("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-black mb-1">Set New Password</h1>
          <p className="text-gray-500 text-sm">Choose a new password for your account.</p>
        </div>

        <div className="space-y-4">
          <TextInput
            label="New Password"
            type="password"
            value={password}
            onChange={setPassword}
          />

          {password && (
            <ul className="space-y-1 px-1">
              {RULES.map((r) => (
                <li key={r.label} className={`flex items-center gap-2 text-xs ${r.check(password) ? "text-brand-green" : "text-gray-400"}`}>
                  <span>{r.check(password) ? "✓" : "○"}</span>
                  {r.label}
                </li>
              ))}
            </ul>
          )}

          <TextInput
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={setConfirm}
          />

          {confirm && password !== confirm && (
            <p className="text-red-500 text-xs">Passwords do not match.</p>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button
            variant="dark"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
          >
            {saving ? "Saving…" : "Set Password"}
          </Button>
        </div>
      </div>
    </main>
  );
}
