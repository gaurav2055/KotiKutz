"use client";

import { useState } from "react";
import Modal         from "@/components/ui/Modal";
import StepIndicator from "./modal/StepIndicator";
import Step1Details  from "./modal/Step1Details";
import Step2Service  from "./modal/Step2Service";
import Step3DateTime from "./modal/Step3DateTime";
import Step4Confirm  from "./modal/Step4Confirm";
import type { BookingForm } from "./modal/types";

type Props = {
  onClose:    () => void;
  isLoggedIn?: boolean;
};

const LOGGED_IN_DEFAULTS = {
  name:  "Gaurav Suvarna",
  email: "jaygauravs@gmail.com",
  phone: "+91 9820571506",
};

export default function BookAppointmentModal({ onClose, isLoggedIn = true }: Props) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<BookingForm>({
    name:     isLoggedIn ? LOGGED_IN_DEFAULTS.name  : "",
    email:    isLoggedIn ? LOGGED_IN_DEFAULTS.email : "",
    phone:    isLoggedIn ? LOGGED_IN_DEFAULTS.phone : "",
    location: "",
    gender:   "Male",
    services: [],
    date:     "",
    stylist:  "",
    timeSlot: "",
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
            onBack={() => setStep(3)}
            onCancel={onClose}
            onConfirm={onClose}
          />
        )}
    </Modal>
  );
}
