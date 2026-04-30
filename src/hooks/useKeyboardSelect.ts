import { useEffect } from 'react';
import { moveFocus } from '../logic/grid';
import type { GameAction, GameState, Mode } from '../logic/types';

const MODE_ORDER: readonly Mode[] = ['pvp', 'easy', 'medium', 'hard'] as const;

const MODE_KEY_MAP: Record<string, Mode> = {
  '1': 'pvp',
  '2': 'easy',
  '3': 'medium',
  '4': 'hard',
};

export type KeyboardSelectOptions = {
  state: GameState;
  dispatch: (action: GameAction) => void;
  onResetRequested?: () => void;
  onToggleIconStyle?: () => void;
};

export const useKeyboardSelect = ({
  state,
  dispatch,
  onResetRequested,
  onToggleIconStyle,
}: KeyboardSelectOptions): void => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const key = event.key;
      const lower = key.toLowerCase();

      if (key === 'ArrowUp' || lower === 'w') {
        if (state.status !== 'playing') return;
        event.preventDefault();
        dispatch({ type: 'focus', index: moveFocus(state.focusIndex, 'up') });
        return;
      }
      if (key === 'ArrowDown' || lower === 's') {
        if (state.status !== 'playing') return;
        event.preventDefault();
        dispatch({ type: 'focus', index: moveFocus(state.focusIndex, 'down') });
        return;
      }
      if (key === 'ArrowLeft' || lower === 'a') {
        if (state.status !== 'playing') return;
        event.preventDefault();
        dispatch({ type: 'focus', index: moveFocus(state.focusIndex, 'left') });
        return;
      }
      if (key === 'ArrowRight' || lower === 'd') {
        if (state.status !== 'playing') return;
        event.preventDefault();
        dispatch({ type: 'focus', index: moveFocus(state.focusIndex, 'right') });
        return;
      }

      if (key === 'Enter' || key === ' ') {
        if (state.status !== 'playing') return;
        event.preventDefault();
        dispatch({ type: 'place', index: state.focusIndex });
        return;
      }

      if (lower === 'r') {
        event.preventDefault();
        dispatch({ type: 'newRound' });
        return;
      }

      if (lower === 'n') {
        event.preventDefault();
        const idx = MODE_ORDER.indexOf(state.mode);
        const nextMode = MODE_ORDER[(idx + 1) % MODE_ORDER.length] as Mode;
        dispatch({ type: 'changeMode', mode: nextMode });
        return;
      }

      const mappedMode = MODE_KEY_MAP[key];
      if (mappedMode) {
        event.preventDefault();
        if (mappedMode !== state.mode) {
          dispatch({ type: 'changeMode', mode: mappedMode });
        }
        return;
      }

      if (key === 'Escape') {
        event.preventDefault();
        // Shift+Esc bypasses confirm and resets immediately.
        if (event.shiftKey) {
          dispatch({ type: 'resetScores' });
          return;
        }
        if (onResetRequested) onResetRequested();
        else dispatch({ type: 'resetScores' });
        return;
      }

      if (lower === 't') {
        if (onToggleIconStyle) {
          event.preventDefault();
          onToggleIconStyle();
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    state.focusIndex,
    state.status,
    state.mode,
    dispatch,
    onResetRequested,
    onToggleIconStyle,
  ]);
};
