import { motion } from 'motion/react';
import { cn } from '../lib/utils.js';

export function PageContainer({ className, children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn('mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10', className)}
    >
      {children}
    </motion.main>
  );
}
