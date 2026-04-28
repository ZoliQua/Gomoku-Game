import { BOARD_SIZE, CANDIDATE_RADIUS, TOTAL_CELLS } from './constants';
import type { Board } from './types';

export const indexToRowCol = (index: number): [number, number] => [
  Math.floor(index / BOARD_SIZE),
  index % BOARD_SIZE,
];

export const rowColToIndex = (row: number, col: number): number =>
  row * BOARD_SIZE + col;

export const inBounds = (row: number, col: number): boolean =>
  row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;

export const EMPTY_BOARD: Board = (() => {
  const arr: (null)[] = new Array(TOTAL_CELLS);
  for (let i = 0; i < TOTAL_CELLS; i++) arr[i] = null;
  return arr;
})();

export const getEmptyCells = (board: Board): number[] => {
  const out: number[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) out.push(i);
  }
  return out;
};

export const isFull = (board: Board): boolean => {
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) return false;
  }
  return true;
};

export const moveFocus = (
  index: number,
  direction: 'up' | 'down' | 'left' | 'right',
): number => {
  const [row, col] = indexToRowCol(index);
  switch (direction) {
    case 'up':
      return rowColToIndex(row === 0 ? 0 : row - 1, col);
    case 'down':
      return rowColToIndex(row === BOARD_SIZE - 1 ? BOARD_SIZE - 1 : row + 1, col);
    case 'left':
      return rowColToIndex(row, col === 0 ? 0 : col - 1);
    case 'right':
      return rowColToIndex(row, col === BOARD_SIZE - 1 ? BOARD_SIZE - 1 : col + 1);
  }
};

/**
 * Empty cells within Chebyshev distance `radius` of any non-empty cell.
 * On an empty board returns just [CENTER].
 */
export const getCandidateCells = (
  board: Board,
  radius: number = CANDIDATE_RADIUS,
): number[] => {
  const seen = new Set<number>();
  let anyStone = false;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) continue;
    anyStone = true;
    const [row, col] = indexToRowCol(i);
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (!inBounds(r, c)) continue;
        const idx = rowColToIndex(r, c);
        if (board[idx] === null) seen.add(idx);
      }
    }
  }

  if (!anyStone) {
    return [Math.floor(BOARD_SIZE / 2) * BOARD_SIZE + Math.floor(BOARD_SIZE / 2)];
  }
  return Array.from(seen);
};
