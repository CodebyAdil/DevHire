import { cn } from '../lib/utils.js';

/*
  Brand mark for DevHire. Restrained and specific to the product: a small
  geometric "shortlist" (three candidate rows) with a checkmark on the top
  row — a vetted, ranked shortlist, which is exactly what the app produces.
  Paired with a two-weight wordmark. Works at navbar size and as a favicon.
*/
export function BrandMark({ className }) {
  return (
    <span
      className={cn(
        'flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25',
        className,
      )}
    >
      <svg
        viewBox="0 0 20 20"
        className="size-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* top row + check (the selected candidate) */}
        <path d="M4 5.5h5.5" />
        <path d="M12 4.6l1.6 1.6 3-3.2" opacity="0.95" />
        {/* remaining shortlist rows */}
        <path d="M4 10h8.5" />
        <path d="M4 14.5h6" />
      </svg>
    </span>
  );
}

export function Logo({ className, markClassName }) {
  return (
    <span
      className={cn(
        'flex items-center gap-2.5 font-bold tracking-tight',
        className,
      )}
    >
      <BrandMark className={markClassName} />
      <span className="text-lg leading-none">
        Dev<span className="font-extrabold text-primary">Hire</span>
      </span>
    </span>
  );
}
