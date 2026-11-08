import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, loadSession, saveSession } from './arcade';
import { GomokuGame } from './GomokuGame';
import { createInitialState } from './logic/game';
import { boardWith, idx } from './logic/testUtils';
import type { GameState } from './logic/types';

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
  applyDental(false, { silent: true });
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const stat = (label: string) => {
  const dt = screen.getAllByRole('term').find((el) => el.textContent === label);
  return dt?.nextElementSibling?.textContent;
};
const boardRoot = (container: HTMLElement) => container.querySelector('[data-dental]') as HTMLElement;

/** A ranked round in progress: 4 black + 4 white pieces, 240 match points. */
const midRound = (): GameState => ({
  ...createInitialState({ mode: 'medium', status: 'playing' }),
  board: boardWith([
    [7, 3, 'B'], [7, 4, 'B'], [7, 5, 'B'], [3, 3, 'B'],
    [0, 0, 'W'], [0, 2, 'W'], [0, 4, 'W'], [0, 6, 'W'],
  ]),
  moveCount: 8,
  lastMoveIndex: idx(0, 6),
  focusIndex: idx(7, 7),
  points: 240,
  scores: { black: 2, white: 1, draws: 0 },
});

describe('Gomoku dental mode', () => {
  it('renders the pieces as teeth — black a molar, white an incisor — when dental mode is on', () => {
    applyDental(true, { silent: true });
    saveSession('gomoku', { schema: 1, data: midRound(), seconds: 30, score: 240 });
    const { container } = render(<GomokuGame />);
    expect(boardRoot(container).dataset.dental).toBe('true');
    const teeth = screen.getAllByTestId('gomoku-piece-tooth');
    expect(teeth).toHaveLength(8);
    expect(teeth.filter((el) => el.dataset.shape === 'molar')).toHaveLength(4);
    expect(teeth.filter((el) => el.dataset.shape === 'incisor')).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: /black tooth/ })).toHaveLength(4);
    expect(screen.getByRole('checkbox', { name: /Dental mode/ })).toHaveProperty('checked', true);
  });

  it('toggling dental mode mid-round keeps the board, the score and the run', () => {
    saveSession('gomoku', { schema: 1, data: midRound(), seconds: 30, score: 240 });
    const { container } = render(<GomokuGame />);
    act(() => key('p')); // continue the restored round
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getAllByRole('button', { name: /(black|white) stone/ })).toHaveLength(8);

    act(() => applyDental(true));
    expect(boardRoot(container).dataset.dental).toBe('true');
    expect(screen.getAllByTestId('gomoku-piece-tooth')).toHaveLength(8);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stat('Points')).toBe('240');
    expect(stat('W–L–D')).toBe('2–1–0');
    act(() => key('Enter')); // the round goes on: black plays (7,7)
    expect(screen.getByRole('button', { name: 'Row 8, column 8, black tooth' })).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: /Dental mode/ }));
    expect(boardRoot(container).dataset.dental).toBe('false');
    expect(localStorage.getItem('arcade.dental')).toBe('0');
    expect(screen.getByRole('button', { name: 'Row 8, column 8, black stone' })).toBeTruthy();
    expect(stat('Points')).toBe('240');
    act(() => vi.advanceTimersByTime(1200));
    expect(loadSession<GameState>('gomoku', 1)?.data).toMatchObject({ status: 'playing', points: 240 });
  });

  it('with dental mode off the classic stones are drawn', () => {
    saveSession('gomoku', { schema: 1, data: midRound(), seconds: 30, score: 240 });
    const { container } = render(<GomokuGame />);
    expect(boardRoot(container).dataset.dental).toBe('false');
    expect(screen.queryAllByTestId('gomoku-piece-tooth')).toHaveLength(0);
    expect(screen.getAllByRole('button', { name: /black stone/ })).toHaveLength(4);
    expect(screen.getByRole('checkbox', { name: /Dental mode/ })).toHaveProperty('checked', false);
  });

  it('labels the settings row „Fogas mód” in Hungarian and says the pieces become teeth', () => {
    applyLang('hu', { silent: true });
    render(<GomokuGame />);
    const box = screen.getByRole('checkbox', { name: /Fogas mód/ });
    expect(box.closest('label')?.textContent).toMatch(/fog/i);
  });

  it('I toggles the shared dental mode', () => {
    const { container } = render(<GomokuGame />);
    act(() => key('i'));
    expect(boardRoot(container).dataset.dental).toBe('true');
    expect(localStorage.getItem('arcade.dental')).toBe('1');
  });
});

describe('legacy icon-style migration', () => {
  it('an old „tooth” choice turns dental mode on once and the old key is removed', () => {
    localStorage.setItem('gomoku.iconStyle', 'tooth');
    const { container } = render(<GomokuGame />);
    expect(localStorage.getItem('arcade.dental')).toBe('1');
    expect(localStorage.getItem('gomoku.iconStyle')).toBeNull();
    expect(boardRoot(container).dataset.dental).toBe('true');
  });

  it('never overrides a dental choice that was already made', () => {
    localStorage.setItem('gomoku.iconStyle', 'tooth');
    localStorage.setItem('arcade.dental', '0');
    const { container } = render(<GomokuGame />);
    expect(localStorage.getItem('arcade.dental')).toBe('0');
    expect(localStorage.getItem('gomoku.iconStyle')).toBeNull();
    expect(boardRoot(container).dataset.dental).toBe('false');
  });

  it('an old „stone” choice just drops the key', () => {
    localStorage.setItem('gomoku.iconStyle', 'stone');
    render(<GomokuGame />);
    expect(localStorage.getItem('arcade.dental')).toBeNull();
    expect(localStorage.getItem('gomoku.iconStyle')).toBeNull();
  });
});
