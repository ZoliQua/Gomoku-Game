import { describe, expect, it } from 'vitest';
import { TOTAL_CELLS } from './constants';
import { idx, emptyBoard, boardWith, drawBoard } from './testUtils';
import { boardHasWinner, checkWinAt, isDraw } from './win';

const line = (cells: Array<[number, number]>, s: 'B' | 'W' = 'B') => boardWith(cells.map(([r, c]) => [r, c, s] as const));

describe('checkWinAt', () => {
  it('detects five horizontally, vertically and on both diagonals', () => {
    const h = line([[7, 5], [7, 6], [7, 7], [7, 8], [7, 9]]);
    expect(checkWinAt(h, idx(7, 7))).toMatchObject({ winner: 'B' });
    const v = line([[4, 3], [5, 3], [6, 3], [7, 3], [8, 3]], 'W');
    expect(checkWinAt(v, idx(6, 3))).toMatchObject({ winner: 'W' });
    const d = line([[3, 3], [4, 4], [5, 5], [6, 6], [7, 7]]);
    expect(checkWinAt(d, idx(5, 5))?.line).toEqual([idx(3, 3), idx(4, 4), idx(5, 5), idx(6, 6), idx(7, 7)]);
    const a = line([[4, 8], [5, 7], [6, 6], [7, 5], [8, 4]], 'W');
    expect(checkWinAt(a, idx(8, 4))).toMatchObject({ winner: 'W' });
  });

  it('detects fives that touch every edge and corner', () => {
    expect(checkWinAt(line([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]), idx(0, 0))).not.toBeNull();
    expect(checkWinAt(line([[10, 14], [11, 14], [12, 14], [13, 14], [14, 14]]), idx(14, 14))).not.toBeNull();
    expect(checkWinAt(line([[10, 10], [11, 11], [12, 12], [13, 13], [14, 14]]), idx(12, 12))).not.toBeNull();
    expect(checkWinAt(line([[0, 14], [1, 13], [2, 12], [3, 11], [4, 10]]), idx(0, 14))).not.toBeNull();
    expect(checkWinAt(line([[14, 0], [14, 1], [14, 2], [14, 3], [14, 4]]), idx(14, 2))).not.toBeNull();
  });

  it('does not count four, or runs that wrap across a row edge', () => {
    expect(checkWinAt(line([[0, 0], [0, 1], [0, 2], [0, 3]]), idx(0, 2))).toBeNull();
    const bleed = line([[7, 12], [7, 13], [7, 14], [8, 0], [8, 1]]);
    expect(checkWinAt(bleed, idx(7, 14))).toBeNull();
    expect(checkWinAt(bleed, idx(8, 0))).toBeNull();
    // Diagonal that would continue past the right edge.
    expect(checkWinAt(line([[0, 12], [1, 13], [2, 14], [3, 0], [4, 1]]), idx(2, 14))).toBeNull();
  });

  it('a mixed line is not a win and an empty cell never wins', () => {
    const b = boardWith([[7, 5, 'B'], [7, 6, 'B'], [7, 7, 'W'], [7, 8, 'B'], [7, 9, 'B']]);
    expect(checkWinAt(b, idx(7, 6))).toBeNull();
    expect(checkWinAt(emptyBoard(), idx(7, 7))).toBeNull();
  });

  it('overlines (6+) count as a win and return the full run (free Gomoku)', () => {
    const six = line([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]);
    const w = checkWinAt(six, idx(0, 3));
    expect(w?.winner).toBe('B');
    expect(w?.line).toHaveLength(6);
  });
});

describe('isDraw', () => {
  it('is false on a partial board and true on a full board without five', () => {
    expect(isDraw(boardWith([[0, 0, 'B']]))).toBe(false);
    const full = drawBoard();
    expect(boardHasWinner(full)).toBe(false);
    expect(isDraw(full)).toBe(true);
    expect(full).toHaveLength(TOTAL_CELLS);
  });
});
