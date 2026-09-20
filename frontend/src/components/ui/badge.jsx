import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils.js';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset',
  {
    variants: {
      variant: {
        success:
          'bg-success-muted text-success-foreground ring-success/20',
        danger: 'bg-danger-muted text-danger-foreground ring-danger/20',
        info: 'bg-info-muted text-info-foreground ring-info/20',
        neutral: 'bg-muted text-muted-foreground ring-border',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
);

export function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
