import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'gomoku.soundEnabled';

const read = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const write = (value: boolean): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
  } catch {
    // ignore
  }
};

interface WebkitWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export const useSound = (): {
  enabled: boolean;
  setEnabled: (next: boolean) => void;
  toggle: () => void;
  click: () => void;
  win: () => void;
  draw: () => void;
} => {
  const [enabled, setEnabledState] = useState<boolean>(() => read());
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureCtx = useCallback((): AudioContext | null => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const w = window as WebkitWindow;
      const Ctor = window.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    return () => {
      const ctx = ctxRef.current;
      if (ctx && ctx.state !== 'closed') {
        try { ctx.close(); } catch { /* noop */ }
      }
      ctxRef.current = null;
    };
  }, []);

  const beep = useCallback((
    freq: number,
    durationSec: number,
    volume = 0.08,
    type: OscillatorType = 'sine',
    startOffsetSec = 0,
  ) => {
    const ctx = ensureCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const start = ctx.currentTime + startOffsetSec;
    const end = start + durationSec;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.start(start);
    osc.stop(end + 0.02);
  }, [ensureCtx]);

  const click = useCallback(() => {
    if (!enabled) return;
    // wood-on-wood "tock" — short low square pulse
    beep(380, 0.04, 0.09, 'square');
  }, [enabled, beep]);

  const win = useCallback(() => {
    if (!enabled) return;
    beep(880, 0.12, 0.10, 'sine', 0);
    beep(1175, 0.14, 0.10, 'sine', 0.10);
    beep(1568, 0.20, 0.10, 'sine', 0.22);
  }, [enabled, beep]);

  const draw = useCallback(() => {
    if (!enabled) return;
    beep(440, 0.18, 0.07, 'triangle', 0);
    beep(330, 0.22, 0.07, 'triangle', 0.18);
  }, [enabled, beep]);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState((prev) => {
      if (prev === next) return prev;
      write(next);
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    setEnabledState((prev) => {
      const next = !prev;
      write(next);
      return next;
    });
  }, []);

  return useMemo(
    () => ({ enabled, setEnabled, toggle, click, win, draw }),
    [enabled, setEnabled, toggle, click, win, draw],
  );
};
