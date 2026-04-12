export default function FeedSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="break-inside-avoid mb-4 rounded-2xl bg-secondary/40 border border-border/20 overflow-hidden animate-pulse"
          style={{ height: `${220 + (i % 3) * 80}px` }}
        />
      ))}
    </div>
  );
}
