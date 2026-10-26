import type { Mode } from './types';

export const BOARD_SIZE = 15;
export const WIN_LENGTH = 5;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;
export const CENTER_INDEX = Math.floor(TOTAL_CELLS / 2); // 112 for 15×15

export const AI_DELAY_MS = 350;
export const AI_HARD_BUDGET_MS = 250;

// Candidate restriction radius (Chebyshev distance) used by Medium / Hard
// when picking which empty cells to evaluate.
export const CANDIDATE_RADIUS = 2;

// Iterative-deepening targets for Hard. Even depths only — odd depths give
// a half-move advantage to whoever plays last and tend to over/underestimate.
export const HARD_DEPTHS: readonly number[] = [2, 4];

// Star points (3, 7, 11) on a 15×15 goban — drawn as small filled dots.
export const STAR_POINT_COORDS: ReadonlyArray<readonly [number, number]> = [
  [3, 3], [3, 7], [3, 11],
  [7, 3], [7, 7], [7, 11],
  [11, 3], [11, 7], [11, 11],
];

export const PLACE_ANIMATION_MS = 130;
export const STRIKE_ANIMATION_MS = 400;

// Prefix of the per-mode best win-streak keys (`gomoku.highScore.<mode>`).
// Historical name: it stores streaks, not arcade scores — the arcade Best
// score lives in `arcade.stats.gomoku`.
export const STORAGE_KEY_BEST = 'gomoku.highScore';

// 4 line directions as (dRow, dCol). Diagonals included.
export const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],   // horizontal →
  [1, 0],   // vertical ↓
  [1, 1],   // diagonal ↘
  [1, -1],  // diagonal ↙
];

export const MODE_LABEL: Record<Mode, string> = {
  pvp: 'PvP',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};
