export default function DimensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Same components, different token values — the Dimension skin is a data-theme swap.
  return (
    <div data-theme="warp" className="min-h-dvh bg-bg text-ink">
      {children}
    </div>
  );
}
