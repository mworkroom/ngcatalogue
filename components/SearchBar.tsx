interface SearchBarProps {
  value: string;
  label: string;
  printLabel: string;
  onChange: (value: string) => void;
  onPrint: () => void;
}

export function SearchBar({
  value,
  label,
  printLabel,
  onChange,
  onPrint
}: SearchBarProps) {
  return (
    <section className="search-panel">
      <div className="search-wrap">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          value={value}
          type="search"
          autoComplete="off"
          placeholder={label}
          aria-label={label}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <button
        type="button"
        className="print-button"
        aria-label={printLabel}
        onClick={onPrint}
      >
        {printLabel}
      </button>
    </section>
  );
}
