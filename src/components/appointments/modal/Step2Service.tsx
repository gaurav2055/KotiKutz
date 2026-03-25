"use client";

import { useState } from "react";
import { Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import type { SelectedService } from "./types";

const SERVICE_CATALOG = [
  {
    category: "HAIR",
    items: [
      { id: 1,  name: "Regular Hair Cut",             duration: "~30 min", price: 350  },
      { id: 2,  name: "Hair Cut + Beard",              duration: "~50 min", price: 550  },
      { id: 3,  name: "Hair Cut + Beard + Spa",        duration: "~90 min", price: 990  },
      { id: 6,  name: "Hair Colour",                   duration: "~60 min", price: 800  },
      { id: 7,  name: "Hair Spa Treatment",            duration: "~45 min", price: 600  },
    ],
  },
  {
    category: "BEARD",
    items: [
      { id: 4,  name: "Beard Styling",                 duration: "~20 min", price: 250  },
      { id: 5,  name: "Beard Trim",                    duration: "~15 min", price: 150  },
      { id: 8,  name: "Beard Colour",                  duration: "~30 min", price: 400  },
    ],
  },
  {
    category: "SKIN",
    items: [
      { id: 9,  name: "Face Cleanup",                  duration: "~30 min", price: 500  },
      { id: 10, name: "D-Tan",                          duration: "~40 min", price: 600  },
      { id: 11, name: "Hydra Facial",                  duration: "~60 min", price: 1200 },
    ],
  },
  {
    category: "COMBO",
    items: [
      { id: 12, name: "Hair + Beard + D-Tan",          duration: "~80 min", price: 1100 },
      { id: 13, name: "Hair + Beard + Hydra Facial",   duration: "~120 min", price: 1800 },
    ],
  },
];

type Props = {
  selectedServices: SelectedService[];
  onUpdate: (services: SelectedService[]) => void;
  onBack:   () => void;
  onCancel: () => void;
  onNext:   () => void;
};

export default function Step2Service({ selectedServices, onUpdate, onBack, onCancel, onNext }: Props) {
  // All categories open by default
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  function toggleCategory(cat: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function isSelected(id: number) {
    return selectedServices.some((s) => s.id === id);
  }

  function toggle(item: { id: number; name: string; price: number; duration: string }, category: string) {
    if (isSelected(item.id)) {
      onUpdate(selectedServices.filter((s) => s.id !== item.id));
    } else {
      onUpdate([...selectedServices, { ...item, category }]);
    }
  }

  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div>
      <div className="flex gap-4 mb-6">

        {/* Service list — fixed height + scroll */}
        <div className="flex-1 max-h-72 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
          {SERVICE_CATALOG.map((group) => {
            const isOpen = !collapsed.has(group.category);
            return (
              <div key={group.category}>
                {/* Category header — clickable to collapse */}
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="w-full flex items-center gap-3 mb-2 group"
                >
                  <span className="text-xs font-bold text-brand-green tracking-widest">{group.category}</span>
                  <div className="flex-1 h-px bg-gray-700" />
                  {isOpen
                    ? <ChevronUp  className="w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-colors" />
                    : <ChevronDown className="w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-colors" />
                  }
                </button>

                {isOpen && (
                  <div className="space-y-2">
                    {group.items.map((item) => {
                      const selected = isSelected(item.id);
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                            selected
                              ? "border-brand-green bg-[#1a1a1a]"
                              : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-gray-600"
                          }`}
                        >
                          <div>
                            <p className="text-sm text-white font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.duration}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white">₹{item.price}</span>
                            <button
                              onClick={() => toggle(item, group.category)}
                              className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                selected
                                  ? "bg-brand-green text-black hover:opacity-80"
                                  : "border border-gray-500 text-gray-400 hover:border-brand-green hover:text-brand-green"
                              }`}
                            >
                              {selected ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Cart */}
        <div className="w-44 shrink-0 border border-[#2a2a2a] rounded-xl p-3 flex flex-col">
          <p className="text-xs font-bold text-gray-400 tracking-widest mb-3">CART</p>
          {selectedServices.length === 0 ? (
            <p className="text-xs text-gray-600 italic">No services added</p>
          ) : (
            <div className="flex-1 space-y-2">
              {selectedServices.map((s) => (
                <div key={s.id} className="flex justify-between items-start gap-1">
                  <p className="text-xs text-gray-300 leading-tight">{s.name}</p>
                  <p className="text-xs text-white shrink-0">₹{s.price}</p>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xs font-bold text-brand-green">₹{total}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-700 mb-4" />

      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">Back</button>
        <div className="flex gap-3">
          <ModalButton variant="outline" onClick={onCancel}>Cancel</ModalButton>
          <ModalButton variant="green"   onClick={onNext} disabled={selectedServices.length === 0}>Next</ModalButton>
        </div>
      </div>
    </div>
  );
}

function ModalButton({ variant, onClick, disabled, children }: {
  variant: "outline" | "green";
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const styles = {
    outline: "border border-gray-600 text-gray-300 hover:bg-gray-800",
    green:   "bg-brand-green text-black hover:opacity-80 disabled:opacity-40",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2 text-sm rounded-full font-medium transition-all cursor-pointer disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
