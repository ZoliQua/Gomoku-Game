import { duelRoundScore, type DuelDifficulty, type RunOutcome } from '../arcade';
import { TOTAL_CELLS } from './constants';
import type { GameState, Mode, Stone } from './types';

/** Arcade difficulty of a mode; PvP is unranked (null). */
export const difficultyOf = (mode: Mode): DuelDifficulty | null => (mode === 'pvp' ? null : mode);

export const isRanked = (mode: Mode): boolean => mode !== 'pvp';

/**
 * Outcome of a finished round from the human's side. PvP has no single
 * human side: a decided round counts as a `win` (a play), a full board as a `draw`.
 */
export const outcomeOf = (
  mode: Mode,
  humanStone: Stone,
  winner: Stone | null,
): RunOutcome => {
  if (winner === null) return 'draw';
  if (mode === 'pvp') return 'win';
  return winner === humanStone ? 'win' : 'loss';
};

/** Points for a finished round — the shared arcade duel formula, 225 cells. */
export const roundScoreFor = (
  mode: Mode,
  humanStone: Stone,
  winner: Stone | null,
  moves: number,
): number =>
  duelRoundScore({
    outcome: outcomeOf(mode, humanStone, winner),
    difficulty: difficultyOf(mode),
    moves,
    boardCells: TOTAL_CELLS,
  });

/** Outcome of the round held in `state` (meaningful once it is won / drawn). */
export const stateOutcome = (state: GameState): RunOutcome =>
  state.status === 'finished' ? 'finished' : outcomeOf(state.mode, state.humanStone, state.status === 'won' ? state.winner : null);
