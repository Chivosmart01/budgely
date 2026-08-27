'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, LinearProgress } from '@mui/material';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Scroll to top smoothly on page transition
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [pathname]);

  return (
    <Box sx={{ position: 'relative', width: '100%', minHeight: '100%' }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1], // Custom snappy cubic bezier
          }}
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
