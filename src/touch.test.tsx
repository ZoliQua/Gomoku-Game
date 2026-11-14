import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyDental, applyLang } from './arcade';
import { GomokuGame } from './GomokuGame';
import { setCoarsePointer } from './test/touchEnv';

beforeEach(() => {
  localStorage.clear();
  applyDental(false, { silent: true });
  applyLang('en', { silent: true });
  vi.useFakeTimers();
  setCoarsePointer(true);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const key = (k: string) => fireEvent.keyDown(window, { key: k });
const cell = (row: number, col: number) => screen.getByRole('button', { name: new RegExp(`^Row ${row}, column ${col},`) });
const tap = (el: HTMLElement) => {
  fireEvent.pointerDown(el, { pointerId: 1, pointerType: 'touch', button: 0 });
  fireEvent.pointerUp(el, { pointerId: 1, pointerType: 'touch', button: 0 });
  fireEvent.click(el);
};

describe('Gomoku touch controls', () => {
  it('marks the board as a tap board', () => {
    render(<GomokuGame />);
    expect(document.querySelector('.arc-board-tap')).toBeTruthy();
  });

  it('a tap on an intersection places a stone and ringed marker shows the last move', () => {
    render(<GomokuGame />);
    act(() => key('1')); // PvP so no AI answer
    act(() => key(' '));
    tap(cell(8, 8));
    expect(cell(8, 8).getAttribute('aria-label')).toContain('black stone');
    const marked = document.querySelectorAll('[data-last-move="ring"]');
    expect(marked).toHaveLength(1);
    expect(cell(8, 8).contains(marked[0] as Node)).toBe(true);
    tap(cell(8, 9));
    expect(cell(8, 9).getAttribute('aria-label')).toContain('white stone');
    expect(document.querySelectorAll('[data-last-move="ring"]')).toHaveLength(1);
  });

  it('shows touch help instead of keys', () => {
    render(<GomokuGame />);
    expect(screen.getByText('Tap an intersection')).toBeTruthy();
  });

  it('the full-screen button toggles the immersive mode', () => {
    render(<GomokuGame />);
    fireEvent.click(screen.getByRole('button', { name: /Full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: /Exit full screen/ }));
    expect(document.documentElement.dataset.arcadeImmersive).toBeUndefined();
  });
});
