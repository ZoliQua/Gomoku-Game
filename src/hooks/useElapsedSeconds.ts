import { useEffect, useRef, useState } from 'react';
import type { GameStatus } from '../logic/types';

export const formatElapsed = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = m < 10 ? `0${m}` : String(m);
  const ss = s < 10 ? `0${s}` : String(s);
  return `${mm}:${ss}`;
};

export type ElapsedKey = string | number;

export const useElapsedSeconds = (status: GameStatus, roundKey: ElapsedKey): number => {
  const [elapsed, setElapsed] = useState(0);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    setElapsed(0);
    startedAtRef.current = status === 'playing' ? Date.now() : null;
  }, [roundKey, status]);

  useEffect(() => {
    if (status !== 'playing') return;
    if (startedAtRef.current === null) startedAtRef.current = Date.now();
    const id = setInterval(() => {
      const start = startedAtRef.current;
      if (start === null) return;
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 250);
    return () => clearInterval(id);
  }, [status]);

  return elapsed;
};
