import { describe, expect, it } from 'vitest';
import { bestMove, easyMove, hardMove, mediumMove } from './ai';
import { TOTAL_CELLS } from './constants';
import { advanceGame, createInitialState } from './game';
import { getCandidateCells } from './grid';
import { boardWith, emptyBoard, idx, seededRng } from './testUtils';
import { boardHasWinner } from './win';

const zero = () => 0;

describe('AI', () => {
  it('opens in the centre on an empty board at every level', () => {
    const b = emptyBoard();
    expect(easyMove(b, 'B', zero)).toBe(idx(7, 7));
    expect(mediumMove(b, 'B', zero)).toBe(idx(7, 7));
    expect(hardMove(b, 'B', zero)).toBe(idx(7, 7));
    expect(bestMove(b, 'B', 'pvp', zero)).toBe(-1);
  });

  it('medium and hard take a win in one, even over blocking', () => {
    const b = boardWith([
      [5, 3, 'B'], [5, 4, 'B'], [5, 5, 'B'], [5, 6, 'B'],
      [9, 4, 'W'], [9, 5, 'W'], [9, 6, 'W'], [9, 7, 'W'],
    ]);
    expect([idx(5, 2), idx(5, 7)]).toContain(mediumMove(b, 'B', zero));
    expect([idx(5, 2), idx(5, 7)]).toContain(hardMove(b, 'B', zero));
  });

  it('medium and hard block a four (single winning cell)', () => {
    // White four closed on the left by Black; the only winning cell is (9,8).
    const b = boardWith([[9, 3, 'B'], [9, 4, 'W'], [9, 5, 'W'], [9, 6, 'W'], [9, 7, 'W'], [7, 7, 'B'], [2, 2, 'B']]);
    expect(mediumMove(b, 'B', zero)).toBe(idx(9, 8));
    expect(hardMove(b, 'B', zero)).toBe(idx(9, 8));
  });

  it('answers an open four on one of its ends', () => {
    const b = boardWith([[9, 4, 'W'], [9, 5, 'W'], [9, 6, 'W'], [9, 7, 'W'], [7, 7, 'B'], [2, 2, 'B'], [3, 3, 'B']]);
    expect([idx(9, 3), idx(9, 8)]).toContain(mediumMove(b, 'B', zero));
    expect([idx(9, 3), idx(9, 8)]).toContain(hardMove(b, 'B', zero));
  });

  it('medium blocks an open three before it becomes an open four', () => {
    const b = boardWith([[7, 5, 'W'], [7, 6, 'W'], [7, 7, 'W'], [5, 5, 'B'], [3, 10, 'B']]);
    expect([idx(7, 4), idx(7, 8)]).toContain(mediumMove(b, 'B', zero));
  });

  it('hard returns a legal move within its time budget on a mid-game board', () => {
    const b = emptyBoard();
    let stone: 'B' | 'W' = 'B';
    let placed = 0;
    for (let r = 4; r <= 10 && placed < 14; r++) {
      for (let c = 4; c <= 10 && placed < 14; c++) {
        if ((r + c) % 3 === 0) {
          b[idx(r, c)] = stone;
          stone = stone === 'B' ? 'W' : 'B';
          placed++;
        }
      }
    }
    const t0 = performance.now();
    const m = hardMove(b, 'B', zero);
    expect(performance.now() - t0).toBeLessThan(600);
    expect(m).toBeGreaterThanOrEqual(0);
    expect(m).toBeLessThan(TOTAL_CELLS);
    expect(b[m]).toBeNull();
  });

  it('restricts candidates to cells near stones', () => {
    const b = emptyBoard();
    b[idx(7, 7)] = 'B';
    const cands = getCandidateCells(b, 2);
    expect(cands).toHaveLength(24);
    expect(cands).not.toContain(idx(7, 7));
  });

  it('easy and medium never play an illegal move against a random opponent', () => {
    const r = seededRng(3);
    for (const mode of ['easy', 'medium'] as const) {
      for (let g = 0; g < 10; g++) {
        let s = createInitialState({ mode, status: 'playing' });
        while (s.status === 'playing' && s.moveCount < 60) {
          const before = s.moveCount;
          if (s.current === 'B') {
            const empties = s.board.flatMap((c, i) => (c === null ? [i] : []));
            s = advanceGame(s, { type: 'place', index: empties[Math.floor(r() * empties.length)] as number }, { rng: r });
          } else {
            s = advanceGame(s, { type: 'aiMove' }, { rng: r });
          }
          expect(s.moveCount).toBe(before + 1);
        }
        expect(!boardHasWinner(s.board) || s.status === 'won').toBe(true);
      }
    }
  });
});
