// Small "Alpha" status pill — rounded, mono, accent-red. Reused next to the
// logo (navbar + footer) and the hero so the product reads as pre-release.
export default function AlphaBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-red/10 text-red border border-red/20 font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.08em] px-1.5 py-0.5 leading-none align-middle ${className}`}
      title="Damkemon is in alpha — features and data are still evolving."
    >
      Alpha
    </span>
  );
}
