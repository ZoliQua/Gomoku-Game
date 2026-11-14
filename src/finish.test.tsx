import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang, loadSession, saveSession } from './arcade';
import { GomokuGame } from './GomokuGame';
import { createInitialState } from './logic/game';
import { boardWith } from './logic/testUtils';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('hu', { silent: true });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  applyLang('en', { silent: true });
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const finishBtn = () => screen.queryByRole('button', { name: 'Befejezés' });

/** A round in play (PvP-free: Medium), human Black to move, a few stones down. */
function seedRound() {
  const data = {
    ...createInitialState({ mode: 'medium', status: 'playing' }),
    board: boardWith([[7, 7, 'B'], [7, 8, 'W']]),
    moveCount: 2,
    lastMoveIndex: 7 * 15 + 8,
    points: 250,
  };
  saveSession('gomoku', { schema: 1, data, seconds: 10, score: 250 });
}

describe('Gomoku finish early', () => {
  it('is hidden before the round starts and visible after the first move', () => {
    render(<GomokuGame />);
    expect(finishBtn()).toBeNull();
    act(() => key(' '));
    expect(finishBtn()).toBeTruthy();
  });

  it('confirms with the round score (0 mid-round), ranks it once and shows the finished card', () => {
    seedRound();
    const onGameOver = vi.fn();
    render(<GomokuGame onGameOver={onGameOver} />);
    act(() => key('p'));
    fireEvent.click(finishBtn()!);
    expect(screen.getByRole('alertdialog').textContent).toContain('0 pont kerül a ranglistára');
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(onGameOver).toHaveBeenCalledWith(0, { finished: true });
    expect(screen.getByRole('dialog', { name: 'Idő előtt befejezve' })).toBeTruthy();
    act(() => vi.advanceTimersByTime(3000));
    expect(loadSession('gomoku', 1)).toBeNull();
    expect(onGameOver).toHaveBeenCalledTimes(1);
    expect(finishBtn()).toBeNull();
  });

  it('Cancel changes nothing', () => {
    seedRound();
    const onGameOver = vi.fn();
    render(<GomokuGame onGameOver={onGameOver} />);
    act(() => key('p'));
    const before = document.body.textContent;
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Mégse' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onGameOver).not.toHaveBeenCalled();
    expect(document.body.textContent).toBe(before);
  });

  it('a new round can start after finishing', () => {
    seedRound();
    render(<GomokuGame />);
    act(() => key('p'));
    fireEvent.click(finishBtn()!);
    fireEvent.click(screen.getByRole('button', { name: 'Befejezem' }));
    act(() => key('r'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(finishBtn()).toBeTruthy();
  });
});
