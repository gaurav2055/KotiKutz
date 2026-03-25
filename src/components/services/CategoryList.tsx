type CategoryListProps = {
  categories: string[];
  selected: string[];
  onToggle: (cat: string) => void;
  onSelectAll: () => void;
};

export default function CategoryList({ categories, selected, onToggle, onSelectAll }: CategoryListProps) {
  const allSelected = selected.length === 0;

  return (
    <div>
      {/* All option */}
      <button
        onClick={onSelectAll}
        className={`w-full text-left pl-3 py-3 border-b border-b-gray-800 text-brand-green font-semibold text-lg transition-colors ${
          allSelected ? "border-l-2 border-brand-green" : "border-l-2 border-transparent"
        }`}
      >
        All
      </button>

      {categories.map((cat) => {
        const isSelected = selected.includes(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`w-full text-left pl-3 py-3 border-b border-b-gray-800 text-brand-green font-semibold text-lg transition-colors ${
              isSelected ? "border-l-2 border-brand-green" : "border-l-2 border-transparent"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
