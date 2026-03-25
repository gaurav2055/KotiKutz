"use client";

import Dropdown from "@/components/ui/Dropdown";
import SearchInput from "@/components/ui/SearchInput";
import CategoryList from "@/components/services/CategoryList";
import type { FiltersState } from "@/app/services/page";

const CATEGORIES = ["Hair", "Beard", "Skin"];

const LOCATION_OPTIONS = [
  { label: "Porwal Road",     value: "Porwal Road" },
  { label: "Viman Nagar",     value: "Viman Nagar" },
  { label: "Dhanori",         value: "Dhanori" },
  { label: "Lohegaon",        value: "Lohegaon" },
  { label: "Dahisar, Mumbai", value: "Dahisar, Mumbai" },
];

const GENDER_OPTIONS = [
  { label: "Men",   value: "Men" },
  { label: "Women", value: "Women" },
  { label: "Kids",  value: "Kids" },
];

type Props = {
  filters: FiltersState;
  onChange: (filters: FiltersState) => void;
};

export default function ServicesSidebar({ filters, onChange }: Props) {
  function toggleCategory(cat: string) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  }

  return (
    <aside className="w-[344px] shrink-0 bg-brand-dark py-12 px-6 min-h-screen">
      <h3 className="text-xl font-semibold text-white mb-6">Filter</h3>

      <div className="mb-4">
        <Dropdown
          value={filters.location}
          onChange={(val) => onChange({ ...filters, location: val })}
          options={LOCATION_OPTIONS}
          placeholder="Choose Location"
        />
      </div>

      <div className="mb-6">
        <Dropdown
          value={filters.gender}
          onChange={(val) => onChange({ ...filters, gender: val })}
          options={GENDER_OPTIONS}
          placeholder="Choose Gender"
        />
      </div>

      <div className="mb-6">
        <SearchInput
          value={filters.search}
          onChange={(val) => onChange({ ...filters, search: val })}
          placeholder="Search"
        />
      </div>

      <hr className="border-gray-700 mb-6" />

      <CategoryList
        categories={CATEGORIES}
        selected={filters.categories}
        onToggle={toggleCategory}
        onSelectAll={() => onChange({ ...filters, categories: [] })}
      />
    </aside>
  );
}
