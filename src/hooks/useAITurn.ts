import { useEffect } from 'react';
import { AI_DELAY_MS } from '../logic/constants';
import { aiStoneFor } from '../logic/game';
import type { GameAction, GameState } from '../logic/types';

/**
 * Dispatches `aiMove` after `delayMs` whenever it is the AI's turn in a round
 * that is in play. Any state change (move, pause, new round, mode change),
 * `enabled` turning false or unmount cancels the pending move.
 */
export const useAITurn = (
  state: GameState,
  dispatch: (action: GameAction) => void,
  delayMs: number = AI_DELAY_MS,
  enabled = true,
): void => {
  const aiStone = aiStoneFor(state);
  const aiToMove = enabled && state.status === 'playing' && aiStone !== null && state.current === aiStone;

  useEffect(() => {
    if (!aiToMove) return;
    const timer = window.setTimeout(() => dispatch({ type: 'aiMove' }), Math.max(0, delayMs));
    return () => window.clearTimeout(timer);
  }, [aiToMove, state.board, state.round, dispatch, delayMs]);
};
