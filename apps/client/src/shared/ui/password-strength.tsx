const LABELS = ['', 'WEAK', 'FAIR', 'GOOD', 'STRONG'] as const;
const COLORS = ['', '#ff6a6a', '#e0a84b', '#b9b9b9', 'var(--fg)'] as const;

function calcScore(value: string): number {
  if (!value) return 0;
  let s = 0;
  if (value.length >= 8) s++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) s++;
  if (/\d/.test(value)) s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;
  if (value.length >= 12 && s >= 3) s = 4;
  return s;
}

function PasswordStrength({ value }: { value: string }) {
  const score = calcScore(value);

  return (
    <div>
      <div className="mt-1.5 flex gap-1">
        {([1, 2, 3, 4] as const).map((i) => (
          <div
            key={i}
            className="h-0.5 flex-1 transition-colors duration-200"
            style={{ background: i <= score ? COLORS[score] : 'var(--hairline-strong)' }}
          />
        ))}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-fg-dimmer">
        {value ? `STRENGTH · ${LABELS[score]}` : 'STRENGTH · —'}
      </div>
    </div>
  );
}

export { PasswordStrength };
