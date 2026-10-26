import { BOARD_SIZE, TOTAL_CELLS } from './constants';
import type { Board, Cell } from './types';

export const idx = (r: number, c: number): number => r * BOARD_SIZE + c;

export const emptyBoard = (): Cell[] => Array.from({ length: TOTAL_CELLS }, () => null);

/** Build a board from `[row, col, stone]` triples. */
export const boardWith = (stones: ReadonlyArray<readonly [number, number, 'B' | 'W']>): Board => {
  const b = emptyBoard();
  for (const [r, c, s] of stones) b[idx(r, c)] = s;
  return b;
};

/** Deterministic Park–Miller RNG for reproducible AI games. */
export const seededRng = (seed = 1) => {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

/** A full 15×15 board with no five anywhere (longest run is two in every direction). */
export const drawBoard = (): Cell[] =>
  emptyBoard().map((_, i) => {
    const r = Math.floor(i / BOARD_SIZE);
    const c = i % BOARD_SIZE;
    return (c + 2 * r) % 4 < 2 ? 'B' : 'W';
  });
