"use client";

import Dropdown from "@/components/ui/Dropdown";
import SearchInput from "@/components/ui/SearchInput";
import CategoryList from "@/components/services/CategoryList";
import type { FiltersState } from "@/app/services/page";

const GENDER_OPTIONS = [
  { label: "Male",   value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Unisex", value: "Unisex" },
];

type Props = {
  filters: FiltersState;
  categories: string[];
  locationOptions: { label: string; value: string }[];
  onChange: (filters: FiltersState) => void;
};

export default function ServicesSidebar({ filters, categories, locationOptions, onChange }: Props) {
  function toggleCategory(cat: string) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  }

  return (
    <aside className="w-full bg-brand-dark py-6 md:py-12 px-6 overflow-hidden md:h-full md:min-h-screen">
      <h3 className="text-xl font-semibold text-white mb-6">Filter</h3>

      <div className="mb-4">
        <Dropdown
          value={filters.locationId}
          onChange={(val) => onChange({ ...filters, locationId: val })}
          options={locationOptions}
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
        categories={categories}
        selected={filters.categories}
        onToggle={toggleCategory}
        onSelectAll={() => onChange({ ...filters, categories: [] })}
      />
    </aside>
  );
}
