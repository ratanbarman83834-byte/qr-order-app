import { CATEGORIES } from "../services/productService";

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
      {CATEGORIES.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-ink-950 text-paper"
                : "bg-paper text-ink-800 shadow-soft"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
