import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyLang, formatNumber, LANGS, loadSession, saveSession } from './arcade';
import { GomokuGame } from './GomokuGame';
import { MESSAGES } from './i18n';
import { createInitialState } from './logic/game';
import type { GameState } from './logic/types';

beforeEach(() => {
  localStorage.clear();
  applyLang('en', { silent: true });
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

describe('Gomoku messages', () => {
  it('has every key in en / hu / de with a non-empty value', () => {
    const keys = Object.keys(MESSAGES.en).sort();
    expect(keys.length).toBeGreaterThan(0);
    for (const lang of LANGS) {
      expect(Object.keys(MESSAGES[lang]).sort()).toEqual(keys);
      for (const k of keys) {
        const value = (MESSAGES[lang] as Record<string, string>)[k];
        expect(typeof value, `${lang}.${k}`).toBe('string');
        expect(value.trim(), `${lang}.${k}`).not.toBe('');
      }
    }
  });
});

describe('<GomokuGame /> in other languages', () => {
  it('shows the German start overlay after applyLang("de")', () => {
    applyLang('de');
    render(<GomokuGame />);
    const dialog = screen.getByRole('dialog', { name: 'Gomoku' });
    expect(dialog.textContent).toContain('Fünf in einer Reihe gewinnt');
    expect(screen.getAllByRole('button', { name: /Start/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Spiel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mittel' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('uses the Hungarian game name „Amőba”', () => {
    applyLang('hu');
    render(<GomokuGame />);
    expect(screen.getByRole('dialog', { name: 'Amőba' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /Indítás/ }).length).toBeGreaterThan(0);
  });

  it('switching to Hungarian mid-round keeps the board and the run', () => {
    render(<GomokuGame />);
    act(() => key('1')); // PvP
    act(() => key(' ')); // start
    act(() => key('Enter')); // black on (8, 8)
    expect(screen.getByRole('button', { name: 'Row 8, column 8, black stone' })).toBeTruthy();

    act(() => applyLang('hu'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: '8. sor, 8. oszlop, fekete kő' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Fehér lép');
    act(() => vi.advanceTimersByTime(1200));
    expect(loadSession<GameState>('gomoku', 1)?.data).toMatchObject({ status: 'playing', moveCount: 1, mode: 'pvp' });
  });

  it('formats match points with the locale grouping', () => {
    const data: GameState = { ...createInitialState({ mode: 'hard', status: 'playing' }), points: 12345 };
    saveSession('gomoku', { schema: 1, data, seconds: 0, score: data.points });
    render(<GomokuGame />);
    expect(stat('Points')).toBe('12,345');
    expect(screen.getByRole('dialog', { name: 'Welcome back' }).textContent).toContain('12,345 points');
    act(() => applyLang('hu'));
    expect(stat('Pontok')).toBe(formatNumber(12345, 'hu'));
    expect(screen.getByRole('dialog', { name: 'Üdv újra!' }).textContent).toContain(`${formatNumber(12345, 'hu')} pont`);
    act(() => applyLang('de'));
    expect(stat('Punkte')).toBe('12.345');
  });
});
