import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="leaklens-scrollbar min-h-0 flex-1 overflow-y-auto"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
