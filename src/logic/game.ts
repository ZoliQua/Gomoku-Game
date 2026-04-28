import { bestMove } from './ai';
import { CENTER_INDEX, TOTAL_CELLS } from './constants';
import { EMPTY_BOARD } from './grid';
import { checkWinAt, isDraw } from './win';
import type { Board, Cell, GameAction, GameState, Mode, Rng, Stone } from './types';

const opposite = (stone: Stone): Stone => (stone === 'B' ? 'W' : 'B');

const aiStoneFor = (state: Pick<GameState, 'mode' | 'humanStone'>): Stone | null => {
  if (state.mode === 'pvp') return null;
  return opposite(state.humanStone);
};

const placeAt = (board: Board, index: number, stone: Stone): Board => {
  const next = board.slice() as Cell[];
  next[index] = stone;
  return next;
};

export type CreateInitialOptions = {
  mode?: Mode;
  humanStone?: Stone;
  bestStreak?: number;
  startingStone?: Stone;
};

export const createInitialState = (opts: CreateInitialOptions = {}): GameState => {
  const mode: Mode = opts.mode ?? 'pvp';
  const humanStone: Stone = opts.humanStone ?? 'B';
  const startingStone: Stone = opts.startingStone ?? 'B';
  return {
    board: EMPTY_BOARD,
    current: startingStone,
    status: 'playing',
    winner: null,
    winningLine: null,
    lastMoveIndex: null,
    mode,
    humanStone,
    startingStone,
    scores: { black: 0, white: 0, draws: 0 },
    bestStreak: opts.bestStreak ?? 0,
    currentStreak: 0,
    moveCount: 0,
    focusIndex: CENTER_INDEX,
  };
};

const applyMoveResult = (
  state: GameState,
  board: Board,
  lastIndex: number,
): GameState => {
  const win = checkWinAt(board, lastIndex);
  if (win) {
    const aiStone = aiStoneFor(state);
    const humanWon =
      aiStone === null
        ? win.winner === 'B' // PvP: count B (Black) wins toward streak
        : win.winner === state.humanStone;

    const scores = {
      ...state.scores,
      black: state.scores.black + (win.winner === 'B' ? 1 : 0),
      white: state.scores.white + (win.winner === 'W' ? 1 : 0),
    };
    const currentStreak = humanWon ? state.currentStreak + 1 : 0;
    const bestStreak = Math.max(state.bestStreak, currentStreak);

    return {
      ...state,
      board,
      lastMoveIndex: lastIndex,
      status: 'won',
      winner: win.winner,
      winningLine: win.line,
      scores,
      currentStreak,
      bestStreak,
      moveCount: state.moveCount + 1,
    };
  }

  if (isDraw(board)) {
    return {
      ...state,
      board,
      lastMoveIndex: lastIndex,
      status: 'draw',
      winner: null,
      winningLine: null,
      scores: { ...state.scores, draws: state.scores.draws + 1 },
      currentStreak: 0,
      moveCount: state.moveCount + 1,
    };
  }

  return {
    ...state,
    board,
    lastMoveIndex: lastIndex,
    current: opposite(state.current),
    moveCount: state.moveCount + 1,
  };
};

const tryPlace = (state: GameState, index: number, stone: Stone): GameState => {
  if (state.status !== 'playing') return state;
  if (index < 0 || index >= TOTAL_CELLS) return state;
  if (state.board[index] !== null) return state;
  if (state.current !== stone) return state;
  const next = placeAt(state.board, index, stone);
  return applyMoveResult(state, next, index);
};

export type AdvanceContext = { rng: Rng };

export const advanceGame = (
  state: GameState,
  action: GameAction,
  ctx: AdvanceContext,
): GameState => {
  switch (action.type) {
    case 'place':
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
      const nextStarting: Stone = opposite(state.startingStone);
      return {
        ...state,
        board: EMPTY_BOARD,
        current: nextStarting,
        status: 'playing',
        winner: null,
        winningLine: null,
        lastMoveIndex: null,
        startingStone: nextStarting,
        moveCount: 0,
        focusIndex: CENTER_INDEX,
      };
    }

    case 'changeMode': {
      const startingStone: Stone = 'B';
      return {
        ...state,
        mode: action.mode,
        board: EMPTY_BOARD,
        current: startingStone,
        startingStone,
        status: 'playing',
        winner: null,
        winningLine: null,
        lastMoveIndex: null,
        scores: { black: 0, white: 0, draws: 0 },
        currentStreak: 0,
        moveCount: 0,
        focusIndex: CENTER_INDEX,
      };
    }

    case 'resetScores':
      return {
        ...state,
        scores: { black: 0, white: 0, draws: 0 },
        currentStreak: 0,
      };

    case 'focus': {
      if (action.index < 0 || action.index >= TOTAL_CELLS) return state;
      return { ...state, focusIndex: action.index };
    }
  }
};
