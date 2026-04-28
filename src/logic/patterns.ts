import { DIRECTIONS, WIN_LENGTH } from './constants';
import { inBounds, indexToRowCol, rowColToIndex } from './grid';
import type { Board, Cell, Stone } from './types';

/**
 * Pattern scores for a hypothetical placement of `stone` at a candidate cell,
 * scanned along one direction. Bigger = more valuable.
 */
const SCORE_FIVE = 100000;
const SCORE_LIVE_FOUR = 10000;
const SCORE_DEAD_FOUR = 1000;
const SCORE_LIVE_THREE = 500;
const SCORE_DEAD_THREE = 100;
const SCORE_LIVE_TWO = 50;
const SCORE_DEAD_TWO = 10;
const SCORE_LIVE_ONE = 1;

/**
 * Score the run that would form if `stone` were placed at (row, col),
 * scanning along (dr, dc). The cell at (row, col) is treated as `stone`
 * even though `board` may not yet contain it — the caller does NOT need
 * to mutate the board first.
 */
const scoreOneDirection = (
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  stone: Stone,
): number => {
  let runLen = 1;

  // Walk negative.
  let r = row - dr;
  let c = col - dc;
  while (inBounds(r, c) && board[rowColToIndex(r, c)] === stone) {
    runLen++;
    r -= dr;
    c -= dc;
  }
  const negOpen = inBounds(r, c) && board[rowColToIndex(r, c)] === null;

  // Walk positive.
  r = row + dr;
  c = col + dc;
  while (inBounds(r, c) && board[rowColToIndex(r, c)] === stone) {
    runLen++;
    r += dr;
    c += dc;
  }
  const posOpen = inBounds(r, c) && board[rowColToIndex(r, c)] === null;

  if (runLen >= WIN_LENGTH) return SCORE_FIVE;

  const openEnds = (negOpen ? 1 : 0) + (posOpen ? 1 : 0);
  if (openEnds === 0) return 0;

  if (runLen === 4) return openEnds === 2 ? SCORE_LIVE_FOUR : SCORE_DEAD_FOUR;
  if (runLen === 3) return openEnds === 2 ? SCORE_LIVE_THREE : SCORE_DEAD_THREE;
  if (runLen === 2) return openEnds === 2 ? SCORE_LIVE_TWO : SCORE_DEAD_TWO;
  if (runLen === 1) return openEnds === 2 ? SCORE_LIVE_ONE : 0;
  return 0;
};

/**
 * Score the value of placing `stone` at `index` on `board`. The cell at
 * `index` is assumed empty by the caller; we treat it as `stone` for the
 * scan only.
 */
export const scoreCell = (board: Board, index: number, stone: Stone): number => {
  const [row, col] = indexToRowCol(index);
  let total = 0;
  for (const [dr, dc] of DIRECTIONS) {
    total += scoreOneDirection(board, row, col, dr, dc, stone);
  }
  return total;
};

/**
 * Combined offence + defence score: how good this move is for `stone`,
 * plus how much it denies the opponent if they had played here.
 */
export const scoreCellCombined = (
  board: Board,
  index: number,
  stone: Stone,
): { offence: number; defence: number; combined: number } => {
  const offence = scoreCell(board, index, stone);
  const opponent: Stone = stone === 'B' ? 'W' : 'B';
  const defence = scoreCell(board, index, opponent);
  const combined = offence + defence * 0.9;
  return { offence, defence, combined };
};

/**
 * Static board evaluation from `stone`'s perspective. Sum of scoreCell
 * over all empty cells weighted by both colours' threats. Used as the
 * leaf evaluator for minimax.
 *
 * NOTE: This is intentionally cheap and approximate — it sums potential,
 * not realised threats. Real strength comes from search depth.
 */
export const evaluateBoard = (board: Board, stone: Stone): number => {
  const opponent: Stone = stone === 'B' ? 'W' : 'B';
  let myScore = 0;
  let oppScore = 0;
  for (let i = 0; i < board.length; i++) {
    const cell: Cell = board[i] ?? null;
    if (cell === null) continue;
    if (cell === stone) {
      // Score the existing stone's contribution.
      myScore += scoreExistingStone(board, i, stone);
    } else {
      oppScore += scoreExistingStone(board, i, opponent);
    }
  }
  return myScore - oppScore * 1.1;
};

/**
 * Score an already-placed stone by scanning the runs through it.
 * Each line is counted once via direction normalization (we only walk
 * the positive half from the leftmost stone of the run).
 */
const scoreExistingStone = (board: Board, index: number, stone: Stone): number => {
  const [row, col] = indexToRowCol(index);
  let total = 0;
  for (const [dr, dc] of DIRECTIONS) {
    // Only count this run once: skip if there is a same-colour stone
    // at (row - dr, col - dc) — meaning we are not the leftmost.
    const r0 = row - dr;
    const c0 = col - dc;
    if (inBounds(r0, c0) && board[rowColToIndex(r0, c0)] === stone) continue;

    // Measure the run.
    let runLen = 1;
    let r = row + dr;
    let c = col + dc;
    while (inBounds(r, c) && board[rowColToIndex(r, c)] === stone) {
      runLen++;
      r += dr;
      c += dc;
    }
    const posOpen = inBounds(r, c) && board[rowColToIndex(r, c)] === null;
    const negOpen = inBounds(r0, c0) && board[rowColToIndex(r0, c0)] === null;
    const openEnds = (posOpen ? 1 : 0) + (negOpen ? 1 : 0);

    if (runLen >= WIN_LENGTH) {
      total += SCORE_FIVE;
      continue;
    }
    if (openEnds === 0) continue;

    if (runLen === 4) total += openEnds === 2 ? SCORE_LIVE_FOUR : SCORE_DEAD_FOUR;
    else if (runLen === 3) total += openEnds === 2 ? SCORE_LIVE_THREE : SCORE_DEAD_THREE;
    else if (runLen === 2) total += openEnds === 2 ? SCORE_LIVE_TWO : SCORE_DEAD_TWO;
    else if (runLen === 1) total += openEnds === 2 ? SCORE_LIVE_ONE : 0;
  }
  return total;
};

export const PATTERN_SCORES = {
  five: SCORE_FIVE,
  liveFour: SCORE_LIVE_FOUR,
  deadFour: SCORE_DEAD_FOUR,
  liveThree: SCORE_LIVE_THREE,
  deadThree: SCORE_DEAD_THREE,
  liveTwo: SCORE_LIVE_TWO,
  deadTwo: SCORE_DEAD_TWO,
  liveOne: SCORE_LIVE_ONE,
} as const;
