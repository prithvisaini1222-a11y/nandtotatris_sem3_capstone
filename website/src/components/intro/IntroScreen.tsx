'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { INTRO_SESSION_STORAGE_KEY } from '@/config/project';
import IntroTransition from './IntroTransition';
import IntroAnimation from './IntroAnimation';

interface IntroContextValue {
  replayIntro: () => void;
  isIntroActive: boolean;
}

const IntroContext = createContext<IntroContextValue>({
  replayIntro: () => {},
  isIntroActive: false,
});

export function useIntro(): IntroContextValue {
  return useContext(IntroContext);
}

interface IntroScreenProps {
  isVisible: boolean;
  isExiting: boolean;
  isSkipping: boolean;
  reducedMotion: boolean;
  runId: number;
  onSkip: () => void;
  onExitComplete: () => void;
}

export default function IntroScreen({
  isVisible,
  isExiting,
  isSkipping,
  reducedMotion,
  runId,
  onSkip,
  onExitComplete,
}: IntroScreenProps) {
  return (
    <IntroTransition
      isVisible={isVisible}
      reducedMotion={reducedMotion}
      isSkipping={isSkipping}
      onExitComplete={onExitComplete}
    >
      <IntroAnimation
        key={runId}
        reducedMotion={reducedMotion}
        isExiting={isExiting}
        onSkip={onSkip}
      />
    </IntroTransition>
  );
}

const FULL_HOLD_DURATION_MS = 4750;
const REDUCED_HOLD_DURATION_MS = 2200;
const SAFETY_CLEANUP_MS = 6500;
const SKIP_CLEANUP_MS = 1100;

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Deterministic initial state on SSR and initial hydration pass to prevent hydration mismatches
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [runId, setRunId] = useState(0);

  const hasCheckedInitialVisitRef = useRef(false);
  const pendingReplayRef = useRef(false);
  const isRenderedRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    isRenderedRef.current = isRendered;
  }, [isRendered]);

  const clearPendingDomFlag = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.removeAttribute('data-intro-pending');
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const finishIntroImmediately = useCallback(() => {
    clearTimers();
    clearPendingDomFlag();
    isRenderedRef.current = false;
    setIsVisible(false);
    setIsExiting(false);
    setIsRendered(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }, [clearPendingDomFlag, clearTimers]);

  const startIntroSequence = useCallback(() => {
    clearTimers();
    setIsSkipping(false);
    setIsExiting(false);
    setRunId((prev) => prev + 1);
    isRenderedRef.current = true;
    setIsRendered(true);
    setIsVisible(true);

    try {
      sessionStorage.setItem(INTRO_SESSION_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage access errors in restricted browsing modes
    }

    // Clear SSR pre-paint guard once the IntroScreen overlay frame has mounted
    rafRef.current = window.requestAnimationFrame(() => {
      clearPendingDomFlag();
    });

    const mediaReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const effectiveReducedMotion = prefersReducedMotion || mediaReducedMotion;
    const holdMs = effectiveReducedMotion
      ? REDUCED_HOLD_DURATION_MS
      : FULL_HOLD_DURATION_MS;

    exitTimerRef.current = window.setTimeout(() => {
      setIsExiting(true);
      setIsVisible(false);
    }, holdMs);

    safetyTimerRef.current = window.setTimeout(() => {
      finishIntroImmediately();
    }, SAFETY_CLEANUP_MS);
  }, [clearPendingDomFlag, clearTimers, finishIntroImmediately, prefersReducedMotion]);

  const handleSkip = useCallback(() => {
    if (!isVisible) return;
    clearTimers();
    clearPendingDomFlag();
    setIsSkipping(true);
    setIsExiting(true);
    setIsVisible(false);

    try {
      sessionStorage.setItem(INTRO_SESSION_STORAGE_KEY, 'true');
    } catch {
      // Ignore storage errors
    }

    safetyTimerRef.current = window.setTimeout(() => {
      finishIntroImmediately();
    }, SKIP_CLEANUP_MS);
  }, [clearPendingDomFlag, clearTimers, finishIntroImmediately, isVisible]);

  const handleExitComplete = useCallback(() => {
    finishIntroImmediately();
  }, [finishIntroImmediately]);

  const replayIntro = useCallback(() => {
    try {
      sessionStorage.removeItem(INTRO_SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (pathname !== '/') {
      pendingReplayRef.current = true;
      router.push('/');
      return;
    }

    startIntroSequence();
  }, [pathname, router, startIntroSequence]);

  // Initial session check & navigation guard
  useEffect(() => {
    if (pathname !== '/') {
      clearPendingDomFlag();
      if (isRenderedRef.current) {
        finishIntroImmediately();
      }
      return;
    }

    if (pendingReplayRef.current) {
      pendingReplayRef.current = false;
      startIntroSequence();
      return;
    }

    if (hasCheckedInitialVisitRef.current) {
      clearPendingDomFlag();
      return;
    }

    hasCheckedInitialVisitRef.current = true;
    startIntroSequence();
  }, [
    clearPendingDomFlag,
    finishIntroImmediately,
    pathname,
    startIntroSequence,
  ]);

  // Lock body scroll only while the intro screen is active, always restore cleanly
  useEffect(() => {
    if (!isRendered || !isVisible) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isRendered, isVisible]);

  // Keyboard Escape support to skip intro
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSkip, isVisible]);

  // Global unmount cleanup
  useEffect(() => {
    return () => {
      clearTimers();
      clearPendingDomFlag();
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [clearPendingDomFlag, clearTimers]);

  return (
    <IntroContext.Provider
      value={{
        replayIntro,
        isIntroActive: isRendered,
      }}
    >
      {children}
      {isRendered && (
        <IntroScreen
          isVisible={isVisible}
          isExiting={isExiting}
          isSkipping={isSkipping}
          reducedMotion={prefersReducedMotion}
          runId={runId}
          onSkip={handleSkip}
          onExitComplete={handleExitComplete}
        />
      )}
    </IntroContext.Provider>
  );
}
