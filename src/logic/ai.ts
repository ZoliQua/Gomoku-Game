import {
  AI_HARD_BUDGET_MS,
  CENTER_INDEX,
  HARD_DEPTHS,
  TOTAL_CELLS,
} from './constants';
import { getCandidateCells } from './grid';
import { evaluateBoard, PATTERN_SCORES, scoreCell, scoreCellCombined } from './patterns';
import type { Board, Cell, Mode, Rng, Stone } from './types';
import { checkWinAt } from './win';

const opposite = (stone: Stone): Stone => (stone === 'B' ? 'W' : 'B');

const placeAt = (board: Board, index: number, stone: Stone): Board => {
  const next = board.slice() as Cell[];
  next[index] = stone;
  return next;
};

const pickRandom = <T,>(arr: readonly T[], rng: Rng): T => {
  const i = Math.floor(rng() * arr.length);
  return arr[i] as T;
};

const isEmptyBoard = (board: Board): boolean => {
  for (let i = 0; i < board.length; i++) if (board[i] !== null) return false;
  return true;
};

// ---------- Easy ----------

export const easyMove = (board: Board, _stone: Stone, rng: Rng): number => {
  if (isEmptyBoard(board)) return CENTER_INDEX;
  const candidates = getCandidateCells(board, 2);
  if (candidates.length === 0) return CENTER_INDEX;
  return pickRandom(candidates, rng);
};

// ---------- Medium (greedy heuristic + 5-step priority) ----------

const findImmediateWin = (board: Board, stone: Stone): number | null => {
  const candidates = getCandidateCells(board, 1);
  for (const idx of candidates) {
    const next = placeAt(board, idx, stone);
    if (checkWinAt(next, idx)) return idx;
  }
  return null;
};

const findLiveFourThreat = (board: Board, stone: Stone): number | null => {
  const candidates = getCandidateCells(board, 1);
  let best: { idx: number; score: number } | null = null;
  for (const idx of candidates) {
    const score = scoreCell(board, idx, stone);
    if (score >= PATTERN_SCORES.liveFour) {
      if (!best || score > best.score) best = { idx, score };
    }
  }
  return best ? best.idx : null;
};

export const mediumMove = (board: Board, stone: Stone, rng: Rng): number => {
  if (isEmptyBoard(board)) return CENTER_INDEX;
  const opp = opposite(stone);

  // 1. Win-now.
  const myWin = findImmediateWin(board, stone);
  if (myWin !== null) return myWin;

  // 2. Block opponent's win-now.
  const oppWin = findImmediateWin(board, opp);
  if (oppWin !== null) return oppWin;

  // 3. Make a live-four if possible.
  const myFour = findLiveFourThreat(board, stone);
  if (myFour !== null) return myFour;

  // 4. Block opponent's live-four threat.
  const oppFour = findLiveFourThreat(board, opp);
  if (oppFour !== null) return oppFour;

  // 5. Heuristic argmax over candidates.
  const candidates = getCandidateCells(board, 2);
  if (candidates.length === 0) return CENTER_INDEX;

  let bestScore = -Infinity;
  const bestIdxs: number[] = [];
  for (const idx of candidates) {
    const { combined } = scoreCellCombined(board, idx, stone);
    if (combined > bestScore) {
      bestScore = combined;
      bestIdxs.length = 0;
      bestIdxs.push(idx);
    } else if (combined === bestScore) {
      bestIdxs.push(idx);
    }
  }
  return bestIdxs.length === 1 ? (bestIdxs[0] as number) : pickRandom(bestIdxs, rng);
};

// ---------- Hard (heuristic + α-β with iterative deepening) ----------

type SearchContext = {
  rootStone: Stone;
  deadline: number;
  abort: { timedOut: boolean };
};

const orderedCandidates = (board: Board, stone: Stone): number[] => {
  const cands = getCandidateCells(board, 2);
  // Sort by static score for `stone` desc — best moves first to maximise α-β cutoffs.
  return cands
    .map((idx) => ({ idx, s: scoreCell(board, idx, stone) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.idx);
};

const minimax = (
  board: Board,
  toMove: Stone,
  depth: number,
  alpha: number,
  beta: number,
  ctx: SearchContext,
  lastIdx: number | null,
): { score: number; index: number } => {
  // Check time budget periodically.
  if (performance.now() >= ctx.deadline) {
    ctx.abort.timedOut = true;
    return { score: 0, index: lastIdx ?? CENTER_INDEX };
  }

  // Terminal: previous move (by opposite of toMove) won.
  if (lastIdx !== null) {
    const win = checkWinAt(board, lastIdx);
    if (win) {
      const score = win.winner === ctx.rootStone
        ? PATTERN_SCORES.five * 100 - depth
        : -(PATTERN_SCORES.five * 100) + depth;
      return { score, index: lastIdx };
    }
  }

  if (depth === 0) {
    return { score: evaluateBoard(board, ctx.rootStone), index: lastIdx ?? CENTER_INDEX };
  }

  const candidates = orderedCandidates(board, toMove);
  if (candidates.length === 0) {
    return { score: evaluateBoard(board, ctx.rootStone), index: lastIdx ?? CENTER_INDEX };
  }

  const isMaximizing = toMove === ctx.rootStone;
  let best: { score: number; index: number } = {
    score: isMaximizing ? -Infinity : Infinity,
    index: candidates[0] as number,
  };

  let a = alpha;
  let b = beta;

  // Limit branching factor to top-N to keep search tractable.
  const BRANCH_CAP = 12;
  const limited = candidates.slice(0, BRANCH_CAP);

  for (const idx of limited) {
    const next = placeAt(board, idx, toMove);
    const result = minimax(next, opposite(toMove), depth - 1, a, b, ctx, idx);
    if (ctx.abort.timedOut) return best;

    if (isMaximizing) {
      if (result.score > best.score) best = { score: result.score, index: idx };
      if (best.score > a) a = best.score;
    } else {
      if (result.score < best.score) best = { score: result.score, index: idx };
      if (best.score < b) b = best.score;
    }
    if (b <= a) break;
  }

  return best;
};

export const hardMove = (board: Board, stone: Stone, rng: Rng): number => {
  if (isEmptyBoard(board)) return CENTER_INDEX;

  // Tactical short-circuits — same as Medium, but cheaper than searching.
  const myWin = findImmediateWin(board, stone);
  if (myWin !== null) return myWin;
  const oppWin = findImmediateWin(board, opposite(stone));
  if (oppWin !== null) return oppWin;

  const ctx: SearchContext = {
    rootStone: stone,
    deadline: performance.now() + AI_HARD_BUDGET_MS,
    abort: { timedOut: false },
  };

  let bestIdx = -1;
  let bestScore = -Infinity;

  for (const depth of HARD_DEPTHS) {
    if (performance.now() >= ctx.deadline) break;
    ctx.abort.timedOut = false;
    const result = minimax(board, stone, depth, -Infinity, Infinity, ctx, null);
    if (!ctx.abort.timedOut) {
      bestIdx = result.index;
      bestScore = result.score;
    }
  }

  if (bestIdx < 0 || bestIdx >= TOTAL_CELLS || board[bestIdx] !== null) {
    // Fallback to Medium if search failed somehow.
    return mediumMove(board, stone, rng);
  }
  void bestScore;
  return bestIdx;
};

// ---------- Dispatcher ----------

export const bestMove = (
  board: Board,
  stone: Stone,
  mode: Mode,
  rng: Rng,
): number => {
  switch (mode) {
    case 'easy':
      return easyMove(board, stone, rng);
    case 'medium':
      return mediumMove(board, stone, rng);
    case 'hard':
      return hardMove(board, stone, rng);
    case 'pvp':
      return -1;
  }
};
