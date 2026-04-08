"use client";

import { useState } from "react";
import Modal         from "@/components/ui/Modal";
import StepIndicator from "./modal/StepIndicator";
import Step1Details  from "./modal/Step1Details";
import Step2Service  from "./modal/Step2Service";
import Step3DateTime from "./modal/Step3DateTime";
import Step4Confirm  from "./modal/Step4Confirm";
import { useAuth }   from "@/contexts/AuthContext";
import type { BookingForm } from "./modal/types";

type Props = {
  onClose: () => void;
};

export default function BookAppointmentModal({ onClose }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);

  const isLoggedIn = user !== null;

  const [form, setForm] = useState<BookingForm>({
    name:       user?.user_metadata?.full_name ?? "",
    email:      user?.email ?? "",
    phone:      user?.user_metadata?.phone ?? "",
    location:   "",
    locationId: "",
    gender:     "Male",
    services:   [],
    date:       "",
    staffId:    "",
    staffName:  "",
    timeSlot:   "",
  });

  function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Modal theme="dark" width="w-[600px]" scrollable onClose={onClose}>
      <StepIndicator current={step} />

      {step === 1 && (
        <Step1Details
          form={form}
          isLoggedIn={isLoggedIn}
          onUpdate={update}
          onCancel={onClose}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2Service
          selectedServices={form.services}
          onUpdate={(s) => update("services", s)}
          onBack={() => setStep(1)}
          onCancel={onClose}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <Step3DateTime
          form={form}
          onUpdate={update}
          onBack={() => setStep(2)}
          onCancel={onClose}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <Step4Confirm
          form={form}
          userId={user?.id ?? ""}
          onBack={() => setStep(3)}
          onCancel={onClose}
          onConfirm={onClose}
        />
      )}
    </Modal>
  );
}
