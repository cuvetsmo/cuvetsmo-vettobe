const SITES = [
  { name: "cuvetsmo", url: "https://cuvetsmo.com", desc: "main" },
  { name: "Labs", url: "https://labs.cuvetsmo.com", desc: "experiments" },
  { name: "Imaging", url: "https://imaging.cuvetsmo.com", desc: "DICOM" },
  { name: "Web3", url: "https://web3.cuvetsmo.com", desc: "playground" },
  { name: "Vet to be", url: "https://vettobe.cuvetsmo.com", desc: "internship", active: true },
];

export function EcosystemBar() {
  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-strong)]/60 text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-1.5 flex items-center gap-1 overflow-x-auto">
        <span className="text-[var(--color-ink-faint)] mr-2 whitespace-nowrap hidden sm:inline">
          CUVETSMO ecosystem:
        </span>
        {SITES.map((s) => (
          <a
            key={s.name}
            href={s.url}
            className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
              s.active
                ? "!text-[var(--color-accent-strong)] bg-[var(--color-accent-soft)] font-medium"
                : "!text-[var(--color-ink-muted)] hover:!text-[var(--color-ink)] hover:bg-[var(--color-surface-lift)]"
            }`}
          >
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}
