import { easyMove, mediumMove } from './ai';
import { advanceGame, createInitialState } from './game';
import type { GameState, Rng } from './types';

/** Opening plies played at random (near the stones) so demo games vary. */
const RANDOM_OPENING_PLIES = 3;

/** A fresh AI-vs-AI round for the landing-page demo. */
export const createDemoState = (): GameState => createInitialState({ mode: 'pvp', status: 'playing' });

/**
 * The demo's move for whoever is to play: a few random opening plies, then the
 * Medium heuristic (win → block → fours → argmax). Medium is a single greedy
 * pass over ~30–60 candidate cells, i.e. a few milliseconds — no search.
 */
export const demoMove = (state: GameState, rng: Rng): number =>
  state.moveCount < RANDOM_OPENING_PLIES
    ? easyMove(state.board, state.current, rng)
    : mediumMove(state.board, state.current, rng);

/** Advance the demo by one ply on the real reducer (no-op once the round is over). */
export const demoStep = (state: GameState, rng: Rng): GameState => {
  if (state.status !== 'playing') return state;
  return advanceGame(state, { type: 'place', index: demoMove(state, rng) }, { rng });
};
