import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search products" }) {
  return (
    <div className="relative px-4">
      <Search
        size={17}
        className="pointer-events-none absolute left-7 top-1/2 -translate-y-1/2 text-ink-700"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl2 bg-paper py-2.5 pl-10 pr-9 text-sm shadow-soft outline-none placeholder:text-ink-700/60"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-7 top-1/2 -translate-y-1/2 text-ink-700"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
