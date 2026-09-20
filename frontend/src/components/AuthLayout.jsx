import { motion } from 'motion/react';
import { Sparkles, FileText, Target, ListOrdered } from 'lucide-react';

const HIGHLIGHTS = [
  {
    Icon: FileText,
    title: 'Bulk resume intake',
    description: 'Drop in a stack of PDF resumes and let parsing do the busywork.',
  },
  {
    Icon: Target,
    title: 'AI match scoring',
    description: 'Score every candidate against each job’s exact requirements.',
  },
  {
    Icon: ListOrdered,
    title: 'Ranked shortlists',
    description: 'See your strongest candidates first, sorted by match score.',
  },
];

export function AuthLayout({ children }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16">
      {/* Marketing / brand panel — the unauthenticated entry hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="hidden flex-col justify-center lg:flex"
      >
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          AI-assisted recruiting
        </div>
        <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground">
          Hire the right developer,{' '}
          <span className="text-primary">faster.</span>
        </h1>
        <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
          DevHire screens resumes and ranks candidates against your job
          requirements, so your shortlist is ready before your coffee gets cold.
        </p>

        <ul className="mt-9 space-y-5">
          {HIGHLIGHTS.map(({ Icon, title, description }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
              className="flex items-start gap-3.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.section>

      {/* Form panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
