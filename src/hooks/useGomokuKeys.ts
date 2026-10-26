import { useEffect, useRef } from 'react';
import { ARCADE_KEYS, isKey, shouldIgnoreKey } from '../arcade';
import type { Mode } from '../logic/types';

type FocusDirection = 'up' | 'down' | 'left' | 'right';

const KEY_TO_DIRECTION: Record<string, FocusDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

const MODE_KEYS: Record<string, Mode> = { '1': 'pvp', '2': 'easy', '3': 'medium', '4': 'hard' };

export type GomokuKeyHandlers = {
  /** Arrows / WASD. */
  onMove: (direction: FocusDirection) => void;
  /** Space / Enter: start · place on the focused cell · resume · next round. */
  onPrimary: () => void;
  /** P / Esc. */
  onTogglePause: () => void;
  /** R. */
  onNewRound: () => void;
  /** N cycles, 1–4 jump. */
  onCycleMode: () => void;
  onSelectMode: (mode: Mode) => void;
  /** I — stones ↔ teeth (T is the arcade theme key). */
  onToggleIcons: () => void;
  /** X — reset the match (asks for confirmation). */
  onResetMatch: () => void;
  /** When set, a confirmation is open: only Enter (confirm) and Esc (cancel) work. */
  confirm?: { onConfirm: () => void; onCancel: () => void } | null;
};

/**
 * One window keydown listener for the component's lifetime; handlers are read
 * from a ref so re-renders never re-subscribe. Typing in form fields and
 * modifier shortcuts are left to the browser (`shouldIgnoreKey`).
 */
export function useGomokuKeys(handlers: GomokuKeyHandlers): void {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnoreKey(event)) return;
      const h = ref.current;
      const key = event.key;

      if (h.confirm) {
        if (key === 'Enter') {
          event.preventDefault();
          h.confirm.onConfirm();
        } else if (key === 'Escape') {
          event.preventDefault();
          h.confirm.onCancel();
        }
        return;
      }

      const direction = KEY_TO_DIRECTION[key];
      if (direction) {
        if (ARROW_KEYS.has(key)) event.preventDefault();
        h.onMove(direction);
        return;
      }
      if (key === ' ' || key === 'Enter') {
        event.preventDefault();
        h.onPrimary();
        return;
      }
      if (isKey(event, ARCADE_KEYS.pause)) {
        event.preventDefault();
        h.onTogglePause();
        return;
      }
      if (isKey(event, ARCADE_KEYS.restart)) {
        h.onNewRound();
        return;
      }
      if (key === 'n' || key === 'N') {
        h.onCycleMode();
        return;
      }
      const mode = MODE_KEYS[key];
      if (mode) {
        h.onSelectMode(mode);
        return;
      }
      if (key === 'i' || key === 'I') {
        h.onToggleIcons();
        return;
      }
      if (key === 'c' || key === 'C') {
        h.onResetMatch();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
