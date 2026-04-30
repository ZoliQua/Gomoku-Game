export type Stone = 'B' | 'W';
export type Cell = Stone | null;
export type Board = readonly Cell[];

export type WinningLine = readonly number[];

export type GameStatus = 'idle' | 'playing' | 'won' | 'draw';

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
  scores: Scores;
  bestStreaks: BestStreaks;
  currentStreak: number;
  moveCount: number;
  focusIndex: number;
};

export type GameAction =
  | { type: 'place'; index: number }
  | { type: 'aiMove' }
  | { type: 'newRound' }
  | { type: 'changeMode'; mode: Mode }
  | { type: 'resetScores' }
  | { type: 'focus'; index: number };

export type Rng = () => number;
