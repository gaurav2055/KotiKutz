"use client";

import { useEffect, useState } from "react";
import { Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { SelectedService } from "./types";

type ServiceRow = {
  id: string;
  name: string;
  price: number;
  category: string;
};

type ServiceGroup = {
  category: string;
  items: ServiceRow[];
};

type Props = {
  selectedServices: SelectedService[];
  onUpdate: (services: SelectedService[]) => void;
  onBack:   () => void;
  onCancel: () => void;
  onNext:   () => void;
};

export default function Step2Service({ selectedServices, onUpdate, onBack, onCancel, onNext }: Props) {
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("services")
      .select("id, name, price, category")
      .then(({ data }) => {
        if (!data) return;
        const map: Record<string, ServiceRow[]> = {};
        data.forEach((s) => {
          if (!map[s.category]) map[s.category] = [];
          map[s.category].push(s);
        });
        setGroups(Object.entries(map).map(([category, items]) => ({ category, items })));
      });
  }, []);

  function toggleCategory(cat: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function isSelected(id: string) {
    return selectedServices.some((s) => s.id === id);
  }

  function toggle(item: ServiceRow) {
    if (isSelected(item.id)) {
      onUpdate(selectedServices.filter((s) => s.id !== item.id));
    } else {
      onUpdate([...selectedServices, { ...item, duration: "", category: item.category }]);
    }
  }

  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">

        {/* Service list */}
        <div className="flex-1 max-h-72 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
          {groups.map((group) => {
            const isOpen = !collapsed.has(group.category);
            return (
              <div key={group.category}>
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="w-full flex items-center gap-3 mb-2 group"
                >
                  <span className="text-xs font-bold text-brand-green tracking-widest">{group.category.toUpperCase()}</span>
                  <div className="flex-1 h-px bg-gray-700" />
                  {isOpen
                    ? <ChevronUp   className="w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-colors" />
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
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-white">₹{item.price}</span>
                            <button
                              onClick={() => toggle(item)}
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
        <div className="w-full sm:w-44 sm:shrink-0 border border-[#2a2a2a] rounded-xl p-3 flex flex-col">
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
