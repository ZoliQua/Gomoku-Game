import { DIRECTIONS, WIN_LENGTH } from './constants';
import { inBounds, indexToRowCol, isFull, rowColToIndex } from './grid';
import type { Board, Stone, WinningLine } from './types';

export type WinResult = { winner: Stone; line: WinningLine };

/**
 * Check whether placing stone at lastIndex completed a 5-or-more in a row.
 * Only scans the 4 lines through that cell — O(1) per move.
 * Returns the full run (length ≥ 5) if found, including overlines.
 */
export const checkWinAt = (board: Board, lastIndex: number): WinResult | null => {
  const stone = board[lastIndex];
  if (stone === null || stone === undefined) return null;
  const [row, col] = indexToRowCol(lastIndex);

  for (const [dr, dc] of DIRECTIONS) {
    const line: number[] = [lastIndex];

    // Walk in negative direction.
    let r = row - dr;
    let c = col - dc;
    while (inBounds(r, c) && board[rowColToIndex(r, c)] === stone) {
      line.unshift(rowColToIndex(r, c));
      r -= dr;
      c -= dc;
    }

    // Walk in positive direction.
    r = row + dr;
    c = col + dc;
    while (inBounds(r, c) && board[rowColToIndex(r, c)] === stone) {
      line.push(rowColToIndex(r, c));
      r += dr;
      c += dc;
    }

    if (line.length >= WIN_LENGTH) {
      return { winner: stone, line };
    }
  }

  return null;
};

export const isDraw = (board: Board): boolean =>
  isFull(board) && !boardHasWinner(board);

/**
 * Slow full-board win check. Used only for tests / sanity — not for the
 * hot path. Production code uses checkWinAt(board, lastIndex).
 */
export const boardHasWinner = (board: Board): boolean => {
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== null && checkWinAt(board, i)) return true;
  }
  return false;
};
