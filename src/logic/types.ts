export type Stone = 'B' | 'W';
export type Cell = Stone | null;
export type Board = readonly Cell[];

export type WinningLine = readonly number[];

/**
 * Round lifecycle. `idle` only before the very first round of a fresh match;
 * `paused` freezes input, the AI and the timer; `won` / `draw` end the round.
 */
export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'draw';

export type Mode = 'pvp' | 'easy' | 'medium' | 'hard';

export type Scores = { black: number; white: number; draws: number };

export type BestStreaks = { pvp: number; easy: number; medium: number; hard: number };

export type GameState = {
  board: Board;
  current: Stone;
  status: GameStatus;
  winner: Stone | null;
  winningLine: WinningLine | null;
  lastMoveIndex: number | null;
  mode: Mode;
  humanStone: Stone;
  startingStone: Stone;
  /** Match tally (kept between rounds, cleared on mode change / reset match). */
  scores: Scores;
  bestStreaks: BestStreaks;
  currentStreak: number;
  /** Stones on the board in the current round. */
  moveCount: number;
  focusIndex: number;
  /** Sum of this match's round scores (duelRoundScore). */
  points: number;
  /** Score of the round that just ended; 0 while a round is in play. */
  roundScore: number;
  /** Round counter — the arcade run key. Increments on every new round. */
  round: number;
};

export type GameAction =
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'place'; index: number }
  | { type: 'aiMove' }
  | { type: 'newRound' }
  | { type: 'changeMode'; mode: Mode }
  | { type: 'resetMatch' }
  | { type: 'focus'; index: number };

export type Rng = () => number;
