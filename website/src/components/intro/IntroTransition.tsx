'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface IntroTransitionProps {
  isVisible: boolean;
  reducedMotion: boolean;
  isSkipping: boolean;
  onExitComplete: () => void;
  children: React.ReactNode;
}

export default function IntroTransition({
  isVisible,
  reducedMotion,
  isSkipping,
  onExitComplete,
  children,
}: IntroTransitionProps) {
  return (
    <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
      {isVisible && (
        <motion.div
          key="capstone-intro-curtain"
          role="dialog"
          aria-modal="true"
          aria-label="Capstone Project Introduction"
          initial={reducedMotion ? { opacity: 0 } : { y: '0%', opacity: 1 }}
          animate={reducedMotion ? { opacity: 1 } : { y: '0%', opacity: 1 }}
          exit={
            reducedMotion
              ? {
                  opacity: 0,
                  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                }
              : {
                  y: '-100%',
                  transition: {
                    duration: isSkipping ? 0.48 : 0.9,
                    ease: [0.76, 0, 0.24, 1],
                  },
                }
          }
          transition={
            reducedMotion
              ? { duration: 0.35, ease: 'easeOut' }
              : { duration: 0.4 }
          }
          className="fixed inset-0 z-[100] bg-olive-dark overflow-hidden border-b border-gold/45 shadow-[0_24px_64px_rgba(41,50,31,0.58)] will-change-transform"
        >
          <motion.div
            className="w-full h-full"
            initial={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0.25,
                    scale: 0.97,
                    y: -20,
                    transition: {
                      duration: isSkipping ? 0.35 : 0.65,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  }
            }
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
