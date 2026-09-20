import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils.js';

/* Inline error state — always surfaces the actual backend message passed in. */
export function ErrorState({ message, className, children }) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border border-danger/25 bg-danger-muted px-4 py-3 text-sm',
        className,
      )}
    >
      <AlertCircle
        className="mt-0.5 size-4 shrink-0 text-danger"
        aria-hidden="true"
      />
      <div className="flex-1 space-y-2">
        <p className="font-medium text-danger-foreground">{message}</p>
        {children}
      </div>
    </div>
  );
}

/* Designed empty state with an icon, headline, supporting copy, and optional CTA. */
export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-6 py-14 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm ring-1 ring-border">
          <Icon className="size-6" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
