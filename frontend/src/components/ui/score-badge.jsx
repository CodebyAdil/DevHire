import { cn } from '../../lib/utils.js';

/*
  Presents the backend's integer matchScore (0–100). Purely visual tiering —
  the value itself is never altered.
*/
function tier(score) {
  if (score >= 80)
    return 'bg-success-muted text-success-foreground ring-success/20';
  if (score >= 60) return 'bg-info-muted text-info-foreground ring-info/20';
  return 'bg-danger-muted text-danger-foreground ring-danger/20';
}

export function ScoreBadge({ score, size = 'md', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-0.5 rounded-full font-bold ring-1 ring-inset tabular-nums',
        size === 'lg' ? 'px-3 py-1 text-base' : 'px-2.5 py-0.5 text-xs',
        tier(score),
        className,
      )}
      aria-label={`Match score ${score} out of 100`}
    >
      {score}
      <span className="text-[0.7em] font-semibold opacity-60">/100</span>
    </span>
  );
}
