const CHIPS = ["Free", "No signup", "Unlimited", "Files never leave your device"];

export function TrustChips() {
  return (
    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Key facts">
      {CHIPS.map((c) => (
        <li
          key={c}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          {c}
        </li>
      ))}
    </ul>
  );
}
