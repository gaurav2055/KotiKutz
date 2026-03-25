"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import DarkInput from "@/components/ui/DarkInput";
import { supabase } from "@/lib/supabase";

export type AuthMode = "login" | "signup";

type Props = {
  onClose:      () => void;
  defaultMode?: AuthMode;
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function AuthModal({ onClose, defaultMode = "login" }: Props) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  const passwordRules = [
    { label: "At least 8 characters",  met: form.password.length >= 8 },
    { label: "One uppercase letter",   met: /[A-Z]/.test(form.password) },
    { label: "One lowercase letter",   met: /[a-z]/.test(form.password) },
    { label: "One number",             met: /[0-9]/.test(form.password) },
    { label: "One special character",  met: /[^A-Za-z0-9]/.test(form.password) },
  ];
  const passwordValid = passwordRules.every((r) => r.met);

  const canSubmit =
    !loading &&
    form.email !== "" &&
    form.password !== "" &&
    (mode === "login" || (
      form.name !== "" &&
      passwordValid &&
      form.password === form.confirmPassword
    ));

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) { setError(error.message); setLoading(false); return; }
    } else {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name, phone: form.phone },
        },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      setLoading(false);
      setEmailSent(true);
      return;
    }
    setLoading(false);
    onClose();
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  if (emailSent) {
    return (
      <Modal theme="dark" width="w-[420px]" onClose={onClose}>
        <div className="flex flex-col items-center text-center py-4 gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 7.5-9.75-7.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#f3f4f6]">Check your email</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            We sent a confirmation link to <span className="text-white font-medium">{form.email}</span>.<br />
            Click the link in that email to activate your account.
          </p>
          <p className="text-xs text-gray-600">Didn&apos;t receive it? Check your spam folder.</p>
          <button
            onClick={onClose}
            className="mt-2 w-full h-11 bg-brand-green text-black text-sm font-semibold rounded-xl hover:opacity-80 transition-opacity cursor-pointer"
          >
            Got it
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal theme="dark" width="w-[420px]" onClose={onClose}>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-[#f3f4f6] mb-1">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-sm text-gray-500">
          {mode === "login" ? "Log in to your KotiKutz account" : "Join KotiKutz today"}
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-[#1c1c1c] rounded-xl p-1 mb-6">
        {(["login", "signup"] as AuthMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === m
                ? "bg-brand-green text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {m === "login" ? "Log In" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* Google OAuth */}
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 h-11 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors mb-4 cursor-pointer"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-xs text-gray-500">or</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      {/* Form fields */}
      <div className="space-y-3">
        {mode === "signup" && (
          <DarkInput label="Full Name" placeholder="John Doe" value={form.name} onChange={(v) => set("name", v)} name="name" autoComplete="name" />
        )}
        <DarkInput label="Email" placeholder="you@example.com" value={form.email} onChange={(v) => set("email", v)} type="email" name="email" autoComplete="email" />
        <DarkInput label="Password" placeholder="••••••••" value={form.password} onChange={(v) => set("password", v)} type="password" name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />
        {mode === "signup" && form.password !== "" && (
          <ul className="space-y-1 px-1">
            {passwordRules.map((rule) => (
              <li key={rule.label} className={`flex items-center gap-2 text-xs ${rule.met ? "text-brand-green" : "text-gray-500"}`}>
                <span>{rule.met ? "✓" : "○"}</span>
                {rule.label}
              </li>
            ))}
          </ul>
        )}
        {mode === "signup" && (
          <>
            <div>
              <DarkInput label="Confirm Password" placeholder="••••••••" value={form.confirmPassword} onChange={(v) => set("confirmPassword", v)} type="password" name="confirmPassword" autoComplete="new-password" />
              {form.confirmPassword !== "" && form.password !== form.confirmPassword && (
                <p className="text-red-400 text-xs mt-1 px-1">Passwords do not match.</p>
              )}
            </div>
            <DarkInput label="Phone Number (optional)" placeholder="+91 98765 43210" value={form.phone} onChange={(v) => set("phone", v)} type="tel" name="phone" autoComplete="tel" />
          </>
        )}
      </div>

      {/* Forgot password */}
      {mode === "login" && (
        <div className="text-right mt-2">
          <button className="text-xs text-gray-500 hover:text-brand-green transition-colors">
            Forgot password?
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs mt-3 text-center">{error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full h-11 bg-brand-green text-black text-sm font-semibold rounded-xl mt-5 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
      </button>

      {/* Switch mode */}
      <p className="text-center text-xs text-gray-500 mt-4">
        {mode === "login" ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="text-brand-green hover:underline"
        >
          {mode === "login" ? "Sign Up" : "Log In"}
        </button>
      </p>
    </Modal>
  );
}
