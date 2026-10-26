import type { ArcadeStatus } from '../arcade';
import { bestMove } from './ai';
import { CENTER_INDEX, TOTAL_CELLS } from './constants';
import { EMPTY_BOARD } from './grid';
import { roundScoreFor } from './scoring';
import { checkWinAt, isDraw } from './win';
import type {
  BestStreaks,
  Board,
  Cell,
  GameAction,
  GameState,
  GameStatus,
  Mode,
  Rng,
  Stone,
} from './types';

export const opposite = (stone: Stone): Stone => (stone === 'B' ? 'W' : 'B');

/** The AI's stone, or null in PvP. */
export const aiStoneFor = (state: Pick<GameState, 'mode' | 'humanStone'>): Stone | null => {
  if (state.mode === 'pvp') return null;
  return opposite(state.humanStone);
};

/** True when the side to move is a human (always in PvP). */
export const isHumanTurn = (state: Pick<GameState, 'mode' | 'humanStone' | 'current'>): boolean =>
  state.mode === 'pvp' || state.current === state.humanStone;

const placeAt = (board: Board, index: number, stone: Stone): Board => {
  const next = board.slice() as Cell[];
  next[index] = stone;
  return next;
};

export const EMPTY_BEST_STREAKS: BestStreaks = {
  pvp: 0,
  easy: 0,
  medium: 0,
  hard: 0,
};

export type CreateInitialOptions = {
  mode?: Mode;
  humanStone?: Stone;
  bestStreaks?: BestStreaks;
  startingStone?: Stone;
  /** Defaults to `idle` (waiting for the first round to start). */
  status?: GameStatus;
  round?: number;
};

export const createInitialState = (opts: CreateInitialOptions = {}): GameState => {
  const mode: Mode = opts.mode ?? 'pvp';
  const humanStone: Stone = opts.humanStone ?? 'B';
  const startingStone: Stone = opts.startingStone ?? 'B';
  return {
    board: EMPTY_BOARD,
    current: startingStone,
    status: opts.status ?? 'idle',
    winner: null,
    winningLine: null,
    lastMoveIndex: null,
    mode,
    humanStone,
    startingStone,
    scores: { black: 0, white: 0, draws: 0 },
    bestStreaks: opts.bestStreaks ?? EMPTY_BEST_STREAKS,
    currentStreak: 0,
    moveCount: 0,
    focusIndex: CENTER_INDEX,
    points: 0,
    roundScore: 0,
    round: opts.round ?? 0,
  };
};

const applyMoveResult = (state: GameState, board: Board, lastIndex: number): GameState => {
  const moveCount = state.moveCount + 1;
  const win = checkWinAt(board, lastIndex);
  if (win) {
    const aiStone = aiStoneFor(state);
    // PvP keeps the original rule: the streak follows Black.
    const humanWon = aiStone === null ? win.winner === 'B' : win.winner === state.humanStone;

    const scores = {
      ...state.scores,
      black: state.scores.black + (win.winner === 'B' ? 1 : 0),
      white: state.scores.white + (win.winner === 'W' ? 1 : 0),
    };
    const currentStreak = humanWon ? state.currentStreak + 1 : 0;
    const prevBest = state.bestStreaks[state.mode];
    const bestStreaks: BestStreaks =
      currentStreak > prevBest ? { ...state.bestStreaks, [state.mode]: currentStreak } : state.bestStreaks;
    const roundScore = roundScoreFor(state.mode, state.humanStone, win.winner, moveCount);

    return {
      ...state,
      board,
      lastMoveIndex: lastIndex,
      status: 'won',
      winner: win.winner,
      winningLine: win.line,
      scores,
      currentStreak,
      bestStreaks,
      moveCount,
      roundScore,
      points: state.points + roundScore,
    };
  }

  if (isDraw(board)) {
    const roundScore = roundScoreFor(state.mode, state.humanStone, null, moveCount);
    return {
      ...state,
      board,
      lastMoveIndex: lastIndex,
      status: 'draw',
      winner: null,
      winningLine: null,
      scores: { ...state.scores, draws: state.scores.draws + 1 },
      currentStreak: 0,
      moveCount,
      roundScore,
      points: state.points + roundScore,
    };
  }

  return {
    ...state,
    board,
    lastMoveIndex: lastIndex,
    current: opposite(state.current),
    moveCount,
  };
};

const tryPlace = (state: GameState, index: number, stone: Stone): GameState => {
  if (state.status !== 'playing') return state;
  if (!Number.isInteger(index) || index < 0 || index >= TOTAL_CELLS) return state;
  if (state.board[index] !== null) return state;
  if (state.current !== stone) return state;
  const next = placeAt(state.board, index, stone);
  return applyMoveResult(state, next, index);
};

/** A fresh, empty round on top of the current match. */
const freshRound = (state: GameState, startingStone: Stone, status: GameStatus): GameState => ({
  ...state,
  board: EMPTY_BOARD,
  current: startingStone,
  startingStone,
  status,
  winner: null,
  winningLine: null,
  lastMoveIndex: null,
  moveCount: 0,
  focusIndex: CENTER_INDEX,
  roundScore: 0,
  round: state.round + 1,
});

export type AdvanceContext = { rng: Rng };

export const advanceGame = (state: GameState, action: GameAction, ctx: AdvanceContext): GameState => {
  switch (action.type) {
    case 'start':
      return state.status === 'idle' ? { ...state, status: 'playing' } : state;

    case 'pause':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;

    case 'resume':
      return state.status === 'paused' ? { ...state, status: 'playing' } : state;

    case 'place':
      // Human input only: never place a stone for the AI (e.g. Enter pressed
      // during the AI's thinking delay).
      if (!isHumanTurn(state)) return state;
      return tryPlace(state, action.index, state.current);

    case 'aiMove': {
      if (state.status !== 'playing') return state;
      const aiStone = aiStoneFor(state);
      if (aiStone === null) return state;
      if (state.current !== aiStone) return state;
      const idx = bestMove(state.board, aiStone, state.mode, ctx.rng);
      if (idx < 0 || idx >= TOTAL_CELLS) return state;
      if (state.board[idx] !== null) return state;
      return tryPlace(state, idx, aiStone);
    }

    case 'newRound': {
      // Loser-goes-first: after a decided round the loser opens the next one;
      // after a draw or an abandoned round the opener alternates.
      const decided = state.status === 'won' && state.winner !== null;
      const nextStarting: Stone = decided
        ? opposite(state.winner as Stone)
        : opposite(state.startingStone);
      return freshRound(state, nextStarting, 'playing');
    }

    case 'changeMode': {
      // A new mode is a new match: tallies, streak and points start over.
      const status: GameStatus = state.status === 'idle' ? 'idle' : 'playing';
      return {
        ...freshRound(state, 'B', status),
        mode: action.mode,
        scores: { black: 0, white: 0, draws: 0 },
        currentStreak: 0,
        points: 0,
      };
    }

    case 'resetMatch':
      return createInitialState({
        mode: state.mode,
        humanStone: state.humanStone,
        bestStreaks: state.bestStreaks,
        round: state.round + 1,
      });

    case 'focus': {
      if (!Number.isInteger(action.index) || action.index < 0 || action.index >= TOTAL_CELLS) return state;
      if (action.index === state.focusIndex) return state;
      return { ...state, focusIndex: action.index };
    }
  }
};

/** Map the round lifecycle onto the shared arcade status. */
export const arcadeStatusOf = (status: GameStatus): ArcadeStatus => {
  switch (status) {
    case 'idle':
      return 'idle';
    case 'playing':
      return 'running';
    case 'paused':
      return 'paused';
    case 'won':
    case 'draw':
      return 'gameOver';
  }
};
