"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import DarkInput from "@/components/ui/DarkInput";

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
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const canSubmit =
    form.email !== "" &&
    form.password !== "" &&
    (mode === "login" || form.name !== "");

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
      <button className="w-full flex items-center justify-center gap-3 h-11 bg-white text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors mb-4 cursor-pointer">
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
          <DarkInput placeholder="Full Name" value={form.name} onChange={(v) => set("name", v)} />
        )}
        <DarkInput placeholder="Email"    value={form.email}    onChange={(v) => set("email", v)}    type="email"    />
        <DarkInput placeholder="Password" value={form.password} onChange={(v) => set("password", v)} type="password" />
        {mode === "signup" && (
          <DarkInput placeholder="Phone Number (optional)" value={form.phone} onChange={(v) => set("phone", v)} type="tel" />
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

      {/* Submit */}
      <button
        disabled={!canSubmit}
        className="w-full h-11 bg-brand-green text-black text-sm font-semibold rounded-xl mt-5 hover:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {mode === "login" ? "Log In" : "Create Account"}
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
