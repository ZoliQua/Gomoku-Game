import { useEffect } from 'react';
import { STORAGE_KEY_BEST } from '../logic/constants';
import { EMPTY_BEST_STREAKS } from '../logic/game';
import type { BestStreaks, Mode } from '../logic/types';

const MODES: readonly Mode[] = ['pvp', 'easy', 'medium', 'hard'] as const;

const keyFor = (mode: Mode): string => `${STORAGE_KEY_BEST}.${mode}`;
const LEGACY_KEY = STORAGE_KEY_BEST; // pre-C3 single-key best streak

const readOne = (mode: Mode): number => {
  try {
    const raw = window.localStorage.getItem(keyFor(mode));
    if (raw === null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
};

const readLegacy = (): number => {
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (raw === null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
};

const writeOne = (mode: Mode, value: number): void => {
  try {
    window.localStorage.setItem(keyFor(mode), String(Math.floor(value)));
  } catch {
    // ignore
  }
};

/**
 * Read all four per-mode best streaks. Migrate legacy single-key value
 * to Hard on first load (most-pessimistic assumption).
 */
export const readBestStreaks = (): BestStreaks => {
  const out = { ...EMPTY_BEST_STREAKS };
  let anyPresent = false;
  for (const m of MODES) {
    const v = readOne(m);
    out[m] = v;
    if (v > 0) anyPresent = true;
  }
  if (!anyPresent) {
    const legacy = readLegacy();
    if (legacy > 0) {
      out.hard = legacy;
      writeOne('hard', legacy);
    }
  }
  return out;
};

/**
 * Persist best-streaks that grew since last call. Reducer is the source
 * of truth; this hook just mirrors changes into localStorage.
 */
export const useBestStreaks = (bestStreaks: BestStreaks): void => {
  useEffect(() => {
    for (const m of MODES) {
      const cur = readOne(m);
      const next = bestStreaks[m];
      if (next > cur) writeOne(m, next);
    }
  }, [bestStreaks]);
};
