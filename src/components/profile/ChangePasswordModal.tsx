"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import TextInput from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

type Props = { onClose: () => void };

const PASSWORD_RULES = [
  { label: "At least 8 characters",  check: (p: string) => p.length >= 8 },
  { label: "One uppercase letter",   check: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter",   check: (p: string) => /[a-z]/.test(p) },
  { label: "One number",             check: (p: string) => /[0-9]/.test(p) },
  { label: "One special character",  check: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function ChangePasswordModal({ onClose }: Props) {
  const { user } = useAuth();
  const [form, setForm] = useState({ current: "", newPass: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  const rulesOk = PASSWORD_RULES.every((r) => r.check(form.newPass));
  const canSubmit = !loading && form.current && rulesOk && form.newPass === form.confirm;

  async function handleSubmit() {
    if (!canSubmit || !user?.email) return;
    setLoading(true);
    setError(null);

    // Re-authenticate with current password to verify it's correct
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: form.current,
    });
    if (authError) {
      setError("Current password is incorrect.");
      setLoading(false);
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({ password: form.newPass });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <Modal theme="light" width="w-[459px]" onClose={onClose}>
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-black mb-2">Password Updated</h2>
          <p className="text-sm text-gray-500 mb-6">Your password has been changed successfully.</p>
          <Button variant="dark" onClick={onClose} className="w-full">Done</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal theme="light" width="w-[459px]" onClose={onClose}>
      <h2 className="text-lg font-bold text-black uppercase tracking-wide mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your current password, then choose a new one.</p>

      <div className="space-y-4">
        <TextInput
          label="Current Password"
          type="password"
          value={form.current}
          onChange={(v) => set("current", v)}
        />
        <TextInput
          label="New Password"
          type="password"
          value={form.newPass}
          onChange={(v) => set("newPass", v)}
        />

        {/* Password rules */}
        {form.newPass && (
          <ul className="space-y-1 px-1">
            {PASSWORD_RULES.map((r) => (
              <li key={r.label} className={`flex items-center gap-2 text-xs ${r.check(form.newPass) ? "text-brand-green" : "text-gray-400"}`}>
                <span>{r.check(form.newPass) ? "✓" : "○"}</span>
                {r.label}
              </li>
            ))}
          </ul>
        )}

        <TextInput
          label="Confirm New Password"
          type="password"
          value={form.confirm}
          onChange={(v) => set("confirm", v)}
        />
        {form.confirm && form.newPass !== form.confirm && (
          <p className="text-red-500 text-xs">Passwords do not match.</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="dark" onClick={handleSubmit} disabled={!canSubmit}>
          {loading ? "Updating…" : "Update Password"}
        </Button>
      </div>
    </Modal>
  );
}
