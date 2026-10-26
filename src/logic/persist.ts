import { TOTAL_CELLS, WIN_LENGTH } from './constants';
import { advanceGame } from './game';
import { boardHasWinner, checkWinAt } from './win';
import type { BestStreaks, GameState, GameStatus, Mode, Stone } from './types';

const STONES: readonly Stone[] = ['B', 'W'];
const MODES: readonly Mode[] = ['pvp', 'easy', 'medium', 'hard'];
/** `idle` is never saved: there is nothing to resume before the first round. */
const SAVED_STATUSES: readonly GameStatus[] = ['playing', 'paused', 'won', 'draw'];

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const isCount = (v: unknown): v is number => isInt(v) && v >= 0 && v <= 1_000_000_000;
const isIndex = (v: unknown): v is number => isInt(v) && v >= 0 && v < TOTAL_CELLS;
const isStone = (v: unknown): v is Stone => STONES.includes(v as Stone);
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function isScores(v: unknown): boolean {
  return isRecord(v) && isCount(v.black) && isCount(v.white) && isCount(v.draws);
}

function isBestStreaks(v: unknown): v is BestStreaks {
  return isRecord(v) && MODES.every((m) => isCount(v[m]));
}

/**
 * Strict guard for a saved Gomoku session. Never trust localStorage: the board,
 * counters and the round result must all be mutually consistent.
 */
export function isGomokuState(v: unknown): v is GameState {
  if (!isRecord(v)) return false;
  const s = v;

  if (!Array.isArray(s.board) || s.board.length !== TOTAL_CELLS) return false;
  if (!s.board.every((c) => c === null || isStone(c))) return false;
  if (!isStone(s.current) || !isStone(s.humanStone) || !isStone(s.startingStone)) return false;
  if (!MODES.includes(s.mode as Mode)) return false;
  if (!SAVED_STATUSES.includes(s.status as GameStatus)) return false;
  if (!isScores(s.scores) || !isBestStreaks(s.bestStreaks)) return false;
  if (!isCount(s.currentStreak) || !isCount(s.points) || !isCount(s.roundScore) || !isCount(s.round)) {
    return false;
  }
  if (!isIndex(s.focusIndex)) return false;

  const board = s.board as GameState['board'];
  let black = 0;
  let white = 0;
  for (const c of board) {
    if (c === 'B') black += 1;
    else if (c === 'W') white += 1;
  }
  if (!isInt(s.moveCount) || s.moveCount !== black + white) return false;
  // Players alternate from the opener: they have as many stones as the other
  // side or exactly one more.
  const opener = s.startingStone === 'B' ? black : white;
  const second = s.startingStone === 'B' ? white : black;
  if (opener - second !== 0 && opener - second !== 1) return false;

  if (s.lastMoveIndex === null) {
    if (s.moveCount !== 0) return false;
  } else if (!isIndex(s.lastMoveIndex) || board[s.lastMoveIndex] === null) {
    return false;
  }

  const status = s.status as GameStatus;
  if (status === 'won') {
    if (!isStone(s.winner) || s.lastMoveIndex === null) return false;
    const win = checkWinAt(board, s.lastMoveIndex as number);
    if (!win || win.winner !== s.winner) return false;
    if (
      !Array.isArray(s.winningLine) ||
      s.winningLine.length < WIN_LENGTH ||
      !s.winningLine.every((i) => isIndex(i) && board[i] === s.winner)
    ) {
      return false;
    }
  } else {
    if (s.winner !== null || s.winningLine !== null) return false;
    if (status === 'draw' && s.moveCount !== TOTAL_CELLS) return false;
    // A round still in play cannot already contain five in a row.
    if (status === 'playing' || status === 'paused') {
      if (s.roundScore !== 0 || boardHasWinner(board)) return false;
      // The side to move follows from the opener and the stone count.
      const toMove: Stone = s.moveCount % 2 === 0 ? s.startingStone : s.startingStone === 'B' ? 'W' : 'B';
      if (s.current !== toMove) return false;
    }
  }

  return true;
}

const maxStreaks = (a: BestStreaks, b: BestStreaks): BestStreaks => ({
  pvp: Math.max(a.pvp, b.pvp),
  easy: Math.max(a.easy, b.easy),
  medium: Math.max(a.medium, b.medium),
  hard: Math.max(a.hard, b.hard),
});

/**
 * Turn a validated save into the state the game resumes from — always paused.
 * A save taken after a finished round (the match is kept between rounds)
 * resumes as the next, empty round, so the finished round is never re-scored.
 * Best streaks are merged with the ones stored on this device.
 */
export function restoreSavedState(saved: GameState, deviceBest: BestStreaks): GameState {
  const base: GameState = { ...saved, bestStreaks: maxStreaks(saved.bestStreaks, deviceBest) };
  const next =
    base.status === 'won' || base.status === 'draw'
      ? advanceGame(base, { type: 'newRound' }, { rng: () => 0 })
      : base;
  return { ...next, status: 'paused' };
}

/** True when the saved round was still in play (its timer should resume). */
export const wasRoundInProgress = (saved: GameState): boolean =>
  saved.status === 'playing' || saved.status === 'paused';
