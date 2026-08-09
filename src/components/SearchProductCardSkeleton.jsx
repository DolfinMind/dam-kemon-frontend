/** Skeleton shaped to match the compact shop-first discovery card. */
export default function SearchProductCardSkeleton() {
  return (
    <div className="card-soft animate-pulse p-4">
      <div className="flex items-start gap-3.5">
        <div className="h-[68px] w-[68px] shrink-0 rounded-xl bg-cream-soft sm:h-20 sm:w-20" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-28 rounded bg-cream-soft" />
          <div className="h-5 w-5/6 rounded bg-cream-soft" />
          <div className="h-4 w-20 rounded bg-cream-soft" />
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-16 rounded-xl bg-acid-soft/50" />
        <div className="h-12 rounded-xl bg-cream-soft" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
        <div className="h-3 w-20 rounded bg-cream-soft" />
        <div className="h-7 w-28 rounded-full bg-cream-soft" />
      </div>
    </div>
  );
}
