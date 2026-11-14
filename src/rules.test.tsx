import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, duelRoundScore, formatNumber } from './arcade';
import { GomokuGame } from './GomokuGame';
import { BOARD_SIZE, WIN_LENGTH } from './logic/constants';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
  setCoarsePointer(false);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  applyLang('en', { silent: true });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const openRules = () => fireEvent.click(screen.getByRole('button', { name: /Szabályok/ }));
const rulesDialog = () => screen.getByRole('dialog', { name: /szabályok/ });
const headings = () => within(rulesDialog()).getAllByRole('heading', { level: 3 }).map((h) => h.textContent);

describe('Gomoku rules dialog', () => {
  it('shows a Rules button; opening mid-round pauses and closing leaves it paused', () => {
    render(<GomokuGame />);
    expect(screen.getByRole('button', { name: /Szabályok/ })).toBeTruthy();
    act(() => key(' '));
    expect(screen.queryByRole('dialog')).toBeNull();
    openRules();
    expect(screen.getByRole('dialog', { name: 'Amőba — szabályok' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Bezárás' }));
    expect(screen.getByRole('dialog', { name: 'Szünet' })).toBeTruthy();
  });

  it('R is the new-round key, so it does not open the rules; the game keys stay quiet behind the dialog', () => {
    render(<GomokuGame />);
    act(() => key(' '));
    openRules();
    act(() => key('r'));
    expect(screen.getByRole('dialog', { name: 'Szünet' })).toBeTruthy(); // no new round started
    expect(rulesDialog()).toBeTruthy();
  });

  it('lists goal, play, rules, scoring, dental in order; mobile only on touch', () => {
    const { unmount } = render(<GomokuGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód']);
    unmount();
    setCoarsePointer(true);
    render(<GomokuGame />);
    openRules();
    expect(headings()).toEqual(['Cél', 'Így játssz', 'Szabályok', 'Pontozás', 'Fogas mód', 'Mobilon']);
    expect(rulesDialog().textContent).toContain('Koppints');
    expect(rulesDialog().textContent).toContain('Teljes képernyő');
  });

  it('prints the real win ranges and the board numbers in full sentences', () => {
    render(<GomokuGame />);
    openRules();
    const text = rulesDialog().textContent ?? '';
    // Longest game = board full; shortest win = the opener's fifth stone (9 stones on the board).
    const range = (difficulty: 'easy' | 'medium' | 'hard') => {
      const pay = (moves: number) => duelRoundScore({ outcome: 'win', difficulty, moves, boardCells: BOARD_SIZE * BOARD_SIZE });
      return `${formatNumber(pay(BOARD_SIZE * BOARD_SIZE), 'hu')}–${formatNumber(pay(2 * WIN_LENGTH - 1), 'hu')}`;
    };
    expect(text).toContain(
      `Egy gép elleni győzelem ${range('easy')} (könnyű), ${range('medium')} (közepes) vagy ${range('hard')} (nehéz) pontot ér`,
    );
    expect(range('medium')).toBe('250–490'); // 250 × (1 + 216/225) = 490, guards the helper itself
    expect(text).toContain(`Rakj le elsőként ${formatNumber(WIN_LENGTH, 'hu')} követ egy sorban`);
    expect(text).toContain(`a ${formatNumber(BOARD_SIZE, 'hu')} × ${formatNumber(BOARD_SIZE, 'hu')}-es táblán`);
    expect(text).toContain(`${formatNumber(WIN_LENGTH, 'hu')} vagy több kő egy sorban nyer (szabad gomoku: a ${formatNumber(WIN_LENGTH + 1, 'hu')} vagy több is számít)`);
  });

  it('the Mode panel note shows the same real range', () => {
    render(<GomokuGame />);
    expect(document.body.textContent).toContain('250–490 pontot ér');
  });

  it('has a described five-in-a-row diagram', () => {
    render(<GomokuGame />);
    openRules();
    expect(within(rulesDialog()).getByRole('img', { name: /Ábra/ })).toBeTruthy();
  });

  it('keeps the round when the language changes inside the rules', () => {
    render(<GomokuGame />);
    act(() => key('1'));
    act(() => key(' '));
    act(() => key('Enter'));
    const stones = () => screen.getAllByRole('button', { name: /fekete|schwarz|black/i }).length;
    const before = stones();
    openRules();
    act(() => applyLang('de'));
    expect(screen.getByRole('heading', { level: 2, name: 'Gomoku — Regeln' })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 3, name: 'Ziel' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Schließen' }));
    expect(screen.getByRole('dialog', { name: 'Pausiert' })).toBeTruthy();
    expect(stones()).toBe(before);
  });
});
