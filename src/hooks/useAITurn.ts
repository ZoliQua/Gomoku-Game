import { useEffect } from 'react';
import { AI_DELAY_MS } from '../logic/constants';
import type { GameAction, GameState, Stone } from '../logic/types';

const opposite = (stone: Stone): Stone => (stone === 'B' ? 'W' : 'B');

export const useAITurn = (
  state: GameState,
  dispatch: (action: GameAction) => void,
): void => {
  useEffect(() => {
    if (state.mode === 'pvp') return;
    if (state.status !== 'playing') return;
    const aiStone = opposite(state.humanStone);
    if (state.current !== aiStone) return;

    const timer = setTimeout(() => {
      dispatch({ type: 'aiMove' });
    }, AI_DELAY_MS);

    return () => clearTimeout(timer);
  }, [state.mode, state.status, state.current, state.humanStone, state.board, dispatch]);
};
