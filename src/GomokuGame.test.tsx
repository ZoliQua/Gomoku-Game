import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadSession, readStats, saveSession } from './arcade';
import { GomokuDemo } from './demo/GomokuDemo';
import { GomokuGame } from './GomokuGame';
import { advanceGame, createInitialState } from './logic/game';
import { boardWith, idx } from './logic/testUtils';
import type { GameState, Mode } from './logic/types';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

const key = (k: string) => fireEvent.keyDown(window, { key: k });

/** Black (human) to move with four on row 7 (cols 3–6); the cursor sits on (7,7). */
const aboutToWin = (mode: Mode, over: Partial<GameState> = {}): GameState => ({
  ...createInitialState({ mode, status: 'playing' }),
  board: boardWith([
    [7, 3, 'B'], [7, 4, 'B'], [7, 5, 'B'], [7, 6, 'B'],
    [0, 0, 'W'], [0, 2, 'W'], [0, 4, 'W'], [0, 6, 'W'],
  ]),
  moveCount: 8,
  lastMoveIndex: idx(0, 6),
  focusIndex: idx(7, 7),
  ...over,
});

const seed = (data: GameState, seconds = 30) =>
  saveSession('gomoku', { schema: 1, data, seconds, score: data.points });

const stones = () => screen.queryAllByRole('button', { name: /(black|white) stone/ }).length;

describe('<GomokuGame />', () => {
  it('starts with Space, pauses with P / Esc and reports status to the host', () => {
    const onStatusChange = vi.fn();
    render(<GomokuGame onStatusChange={onStatusChange} />);
    expect(screen.getByRole('dialog', { name: 'Gomoku' })).toBeTruthy();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'idle' }));
    act(() => key(' '));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'running' }));
    act(() => key('p'));
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeTruthy();
    expect(onStatusChange).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'paused' }));
    act(() => key('Escape'));
    expect(screen.queryByRole('dialog')).toBeNull();
    act(() => key('Escape'));
    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeTruthy();
  });

  it('places with Enter on the cursor and moves the cursor with the arrows', () => {
    render(<GomokuGame />);
    act(() => key('1')); // PvP: both colours by hand
    act(() => key(' ')); // start
    act(() => key('Enter'));
    act(() => key('ArrowRight'));
    act(() => key('Enter'));
    expect(screen.getByRole('button', { name: 'Row 8, column 8, black stone' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Row 8, column 9, white stone' })).toBeTruthy();
  });

  it('pausing freezes the AI; resuming lets it answer', () => {
    seed(createInitialState({ mode: 'medium', status: 'playing' }), 0);
    render(<GomokuGame />);
    act(() => key('p')); // resume the restored (paused) round
    act(() => key('Enter'));
    expect(stones()).toBe(1);
    act(() => key('p'));
    act(() => vi.advanceTimersByTime(3000));
    expect(stones()).toBe(1);
    act(() => key('p'));
    act(() => vi.advanceTimersByTime(1100));
    expect(stones()).toBe(2);
  });

  it('autosaves the match on unmount and restores it paused with Welcome back', () => {
    const { unmount } = render(<GomokuGame />);
    act(() => key('1')); // PvP, so no AI reply changes the stone count
    act(() => key(' '));
    act(() => key('Enter'));
    act(() => vi.advanceTimersByTime(1200));
    unmount();
    const saved = loadSession<GameState>('gomoku', 1);
    expect(saved?.data).toMatchObject({ status: 'playing', moveCount: 1 });

    render(<GomokuGame embedded />);
    expect(screen.getByRole('dialog', { name: 'Welcome back' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(stones()).toBe(1);
  });

  it('a won ranked round calls onGameOver once, records stats and keeps the match saved', () => {
    const onGameOver = vi.fn();
    const onRunEnd = vi.fn();
    seed(aboutToWin('medium'));
    render(<GomokuGame onGameOver={onGameOver} onRunEnd={onRunEnd} />);
    expect(screen.getByRole('dialog', { name: 'Welcome back' })).toBeTruthy();
    act(() => key('p'));
    act(() => key('Enter'));
    expect(screen.getByRole('dialog', { name: 'You win!' })).toBeTruthy();
    // medium base 250 × (1 + 216/225) = 490
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(490);
    expect(onRunEnd).toHaveBeenCalledWith(expect.objectContaining({ score: 490, outcome: 'win', ranked: true }));
    expect(readStats('gomoku')).toMatchObject({ best: 490, plays: 1, wins: 1 });

    act(() => vi.advanceTimersByTime(1500));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    const saved = loadSession<GameState>('gomoku', 1);
    expect(saved?.data).toMatchObject({ status: 'won', points: 490, scores: { black: 1, white: 0, draws: 0 } });

    act(() => key('r'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(stones()).toBe(0);
    expect(readStats('gomoku').plays).toBe(1);
  });

  it('PvP rounds are unranked: they count as plays but never as Best or onGameOver', () => {
    const onGameOver = vi.fn();
    const onRunEnd = vi.fn();
    seed(aboutToWin('pvp'));
    render(<GomokuGame onGameOver={onGameOver} onRunEnd={onRunEnd} />);
    act(() => key('p'));
    act(() => key('Enter'));
    expect(screen.getByRole('dialog', { name: 'Black wins!' })).toBeTruthy();
    expect(onGameOver).not.toHaveBeenCalled();
    expect(onRunEnd).toHaveBeenCalledWith(expect.objectContaining({ score: 0, outcome: 'win', ranked: false }));
    expect(readStats('gomoku')).toMatchObject({ best: 0, plays: 1 });
  });

  it('a save taken after a finished round resumes as the next round with the match kept', () => {
    const won = advanceGame(aboutToWin('hard'), { type: 'place', index: idx(7, 7) }, { rng: () => 0 });
    seed(won);
    render(<GomokuGame />);
    expect(screen.getByRole('dialog', { name: 'Welcome back' }).textContent).toContain(`${won.points} points`);
    expect(stones()).toBe(0);
    expect(readStats('gomoku').plays).toBe(0); // the finished round is not re-recorded
  });

  it('C asks before resetting the match; Enter confirms and drops the save', () => {
    seed(aboutToWin('easy', { points: 120, scores: { black: 1, white: 0, draws: 0 }, currentStreak: 1 }));
    render(<GomokuGame />);
    act(() => key('c'));
    expect(screen.getByRole('dialog', { name: 'Reset match?' })).toBeTruthy();
    act(() => key('Escape'));
    expect(screen.queryByRole('dialog', { name: 'Reset match?' })).toBeNull();
    expect(loadSession('gomoku', 1)).not.toBeNull();
    act(() => key('c'));
    act(() => key('Enter'));
    expect(screen.getByRole('dialog', { name: 'Gomoku' })).toBeTruthy();
    expect(loadSession('gomoku', 1)).toBeNull();
    expect(stones()).toBe(0);
  });

  it('I toggles stones ↔ teeth; T is left to the arcade theme', () => {
    const { container } = render(<GomokuGame />);
    const root = container.querySelector('.gmk-app') as HTMLElement;
    expect(root.dataset.iconStyle).toBe('stone');
    act(() => key('t'));
    expect(root.dataset.iconStyle).toBe('stone');
    act(() => key('i'));
    expect(root.dataset.iconStyle).toBe('tooth');
    expect(localStorage.getItem('gomoku.iconStyle')).toBe('tooth');
  });

  it('ignores hotkeys while typing in a field', () => {
    render(
      <>
        <input aria-label="nick" />
        <GomokuGame />
      </>,
    );
    const input = screen.getByLabelText('nick');
    act(() => {
      fireEvent.keyDown(input, { key: ' ' });
      fireEvent.keyDown(input, { key: '1' });
    });
    expect(screen.getByRole('dialog', { name: 'Gomoku' })).toBeTruthy();
    // Opens in Medium; the '1' typed into the field must not switch to PvP.
    expect(screen.getByRole('button', { name: 'Medium' }).getAttribute('aria-pressed')).toBe('true');
  });
});

describe('<GomokuDemo />', () => {
  it('plays by itself without touching stats, saves or storage', () => {
    const { container } = render(<GomokuDemo />);
    const demo = container.querySelector('.arc-demo') as HTMLElement;
    expect(demo).toBeTruthy();
    // One timeout per ply: let React re-arm it between steps.
    for (let i = 0; i < 10; i++) act(() => vi.advanceTimersByTime(300));
    expect(container.querySelectorAll('.dot').length).toBeGreaterThanOrEqual(5);
    expect(container.querySelectorAll('button, [tabindex]').length).toBe(0);
    expect(readStats('gomoku').plays).toBe(0);
    expect(localStorage.length).toBe(0);
  });

  it('freezes when inactive', () => {
    const { container } = render(<GomokuDemo active={false} />);
    act(() => vi.advanceTimersByTime(3000));
    expect(container.querySelectorAll('.dot').length).toBe(0);
  });
});
