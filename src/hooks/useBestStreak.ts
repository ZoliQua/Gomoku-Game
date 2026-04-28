import { useEffect, useState } from 'react';
import { STORAGE_KEY_BEST } from '../logic/constants';

const readBest = (): number => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BEST);
    if (raw === null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
};

const writeBest = (value: number): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY_BEST, String(Math.floor(value)));
  } catch {
    // ignore quota / privacy mode errors
  }
};

export const useBestStreak = (currentStreak: number): number => {
  const [best, setBest] = useState<number>(() => readBest());

  useEffect(() => {
    if (currentStreak > best) {
      writeBest(currentStreak);
      setBest(currentStreak);
    }
  }, [currentStreak, best]);

  return best;
};
