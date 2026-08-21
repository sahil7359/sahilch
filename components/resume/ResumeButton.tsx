'use client';

// Triggers the shared ResumeGate (mounted once in the prime layout) via a custom
// event, so nav / hero / footer all open the same gated modal.
export function ResumeButton({
  className,
  children = 'Résumé',
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('open-resume-gate'))}
      className={className}
    >
      {children}
    </button>
  );
}
