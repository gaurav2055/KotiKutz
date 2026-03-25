"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import TextInput from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";

type ChangePasswordModalProps = {
  onClose: () => void;
};

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [form, setForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <Modal theme="light" width="w-[459px]" onClose={onClose}>
      <h2 className="text-lg font-bold text-black uppercase tracking-wide mb-1">Change Password</h2>
      <p className="text-sm text-gray-500 mb-6">Enter your current password, then choose a new one.</p>

      <div className="space-y-4">
        <TextInput label="Current Password"     type="password" value={form.current} onChange={(v) => set("current", v)} />
        <TextInput label="New Password"         type="password" value={form.newPass} onChange={(v) => set("newPass", v)} />
        <TextInput label="Confirm New Password" type="password" value={form.confirm} onChange={(v) => set("confirm", v)} />
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button variant="dark">Update Password</Button>
      </div>
    </Modal>
  );
}
