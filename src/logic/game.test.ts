import { describe, expect, it } from 'vitest';
import { duelRoundScore } from '../arcade';
import { createDemoState, demoMove, demoStep } from './autopilot';
import { CENTER_INDEX, TOTAL_CELLS } from './constants';
import { advanceGame, arcadeStatusOf, createInitialState } from './game';
import { isGomokuState, restoreSavedState, wasRoundInProgress } from './persist';
import { outcomeOf, roundScoreFor } from './scoring';
import { boardWith, drawBoard, idx, seededRng } from './testUtils';
import { boardHasWinner } from './win';
import type { GameAction, GameState } from './types';

const rng = () => 0;
const step = (s: GameState, a: GameAction) => advanceGame(s, a, { rng });
const playing = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState({ status: 'playing' }),
  ...over,
});
const placeAll = (s: GameState, cells: Array<[number, number]>) =>
  cells.reduce((acc, [r, c]) => step(acc, { type: 'place', index: idx(r, c) }), s);

/** Black to move with four in a row on row 7 (cols 3–6); White has four scattered stones. */
const blackAboutToWin = (over: Partial<GameState> = {}): GameState =>
  playing({
    board: boardWith([
      [7, 3, 'B'], [7, 4, 'B'], [7, 5, 'B'], [7, 6, 'B'],
      [0, 0, 'W'], [0, 2, 'W'], [0, 4, 'W'], [0, 6, 'W'],
    ]),
    moveCount: 8,
    lastMoveIndex: idx(0, 6),
    ...over,
  });

describe('advanceGame — lifecycle', () => {
  it('starts idle; start / pause / resume move between idle, playing and paused', () => {
    const s = createInitialState();
    expect(s.status).toBe('idle');
    expect(s.board).toHaveLength(TOTAL_CELLS);
    expect(s.focusIndex).toBe(CENTER_INDEX);
    expect(step(s, { type: 'place', index: 0 })).toBe(s);
    const p = step(s, { type: 'start' });
    expect(p.status).toBe('playing');
    const paused = step(p, { type: 'pause' });
    expect(paused.status).toBe('paused');
    expect(step(paused, { type: 'place', index: 0 })).toBe(paused);
    expect(step(paused, { type: 'resume' }).status).toBe('playing');
    expect(step(s, { type: 'pause' })).toBe(s);
  });

  it('maps rounds onto arcade statuses', () => {
    expect(arcadeStatusOf('idle')).toBe('idle');
    expect(arcadeStatusOf('playing')).toBe('running');
    expect(arcadeStatusOf('paused')).toBe('paused');
    expect(arcadeStatusOf('won')).toBe('gameOver');
    expect(arcadeStatusOf('draw')).toBe('gameOver');
  });

  it('places, alternates and ignores filled cells', () => {
    let s = step(playing(), { type: 'place', index: CENTER_INDEX });
    expect(s.board[CENTER_INDEX]).toBe('B');
    expect(s.current).toBe('W');
    expect(s.lastMoveIndex).toBe(CENTER_INDEX);
    expect(s.moveCount).toBe(1);
    const before = s;
    s = step(s, { type: 'place', index: CENTER_INDEX });
    expect(s).toBe(before);
    expect(step(s, { type: 'place', index: -1 })).toBe(s);
    expect(step(s, { type: 'place', index: TOTAL_CELLS })).toBe(s);
  });

  it('never places a stone for the AI from human input', () => {
    const s = playing({ mode: 'medium', current: 'W', startingStone: 'W' });
    expect(step(s, { type: 'place', index: 0 })).toBe(s);
    const ai = step(s, { type: 'aiMove' });
    expect(ai.board[CENTER_INDEX]).toBe('W');
  });

  it('plays a full PvP round to a horizontal win', () => {
    const s = placeAll(playing(), [[7, 5], [9, 9], [7, 6], [9, 10], [7, 7], [9, 11], [7, 8], [9, 12], [7, 9]]);
    expect(s.status).toBe('won');
    expect(s.winner).toBe('B');
    expect(s.scores).toEqual({ black: 1, white: 0, draws: 0 });
    expect(s.winningLine?.length).toBeGreaterThanOrEqual(5);
    expect(step(s, { type: 'place', index: 0 })).toBe(s);
  });

  it('a win on the very last cell is a win, not a draw', () => {
    // Draw pattern, re-coloured so the only empty cell completes a five.
    const b = drawBoard();
    for (let c = 10; c <= 13; c++) b[idx(14, c)] = 'B';
    b[idx(14, 9)] = 'W'; // cap the run on the left so only (14,14) completes five
    b[idx(14, 14)] = null;
    expect(boardHasWinner(b)).toBe(false);
    const blacks = b.filter((x) => x === 'B').length;
    const whites = b.filter((x) => x === 'W').length;
    const s = playing({ board: b, moveCount: blacks + whites, current: 'B', lastMoveIndex: idx(0, 0) });
    const next = step(s, { type: 'place', index: idx(14, 14) });
    expect(next.status).toBe('won');
    expect(next.moveCount).toBe(TOTAL_CELLS);
  });

  it('a full board without five is a draw and resets the streak', () => {
    const b = drawBoard();
    const last = b[TOTAL_CELLS - 1] as 'B' | 'W';
    b[TOTAL_CELLS - 1] = null;
    const s = playing({ mode: 'pvp', board: b, moveCount: TOTAL_CELLS - 1, current: last, currentStreak: 3 });
    const next = step(s, { type: 'place', index: TOTAL_CELLS - 1 });
    expect(next.status).toBe('draw');
    expect(next.scores.draws).toBe(1);
    expect(next.currentStreak).toBe(0);
    expect(next.roundScore).toBe(0); // PvP is unranked
  });

  it('loser goes first next round; draws and abandoned rounds alternate the opener', () => {
    const won = step(blackAboutToWin(), { type: 'place', index: idx(7, 7) });
    expect(won.winner).toBe('B');
    const next = step(won, { type: 'newRound' });
    expect(next.startingStone).toBe('W');
    expect(next.current).toBe('W');
    expect(next.status).toBe('playing');
    expect(next.board.every((c) => c === null)).toBe(true);
    expect(next.lastMoveIndex).toBeNull();
    expect(next.round).toBe(won.round + 1);
    expect(next.scores).toEqual(won.scores);
    expect(next.points).toBe(won.points);
    expect(next.roundScore).toBe(0);
    const abandoned = step(step(next, { type: 'place', index: 0 }), { type: 'newRound' });
    expect(abandoned.startingStone).toBe('B');
  });

  it('changing mode starts a new match; reset match goes back to idle', () => {
    const won = step(blackAboutToWin({ mode: 'medium', currentStreak: 1 }), { type: 'place', index: idx(7, 7) });
    expect(won.points).toBeGreaterThan(0);
    const changed = step(won, { type: 'changeMode', mode: 'hard' });
    expect(changed).toMatchObject({ mode: 'hard', status: 'playing', points: 0, currentStreak: 0, startingStone: 'B' });
    expect(changed.scores).toEqual({ black: 0, white: 0, draws: 0 });
    expect(changed.bestStreaks.medium).toBe(2);
    expect(step(createInitialState(), { type: 'changeMode', mode: 'easy' }).status).toBe('idle');
    const reset = step(won, { type: 'resetMatch' });
    expect(reset).toMatchObject({ status: 'idle', mode: 'medium', points: 0, moveCount: 0 });
    expect(reset.bestStreaks.medium).toBe(2);
    expect(reset.round).toBe(won.round + 1);
  });

  it('streak counts human wins only and best streak never decreases', () => {
    const s = blackAboutToWin({ mode: 'easy', currentStreak: 4, bestStreaks: { pvp: 0, easy: 4, medium: 0, hard: 0 } });
    const won = step(s, { type: 'place', index: idx(7, 7) });
    expect(won.currentStreak).toBe(5);
    expect(won.bestStreaks.easy).toBe(5);
    // AI (White) wins → streak resets, best stays.
    const lost = step(
      playing({
        mode: 'medium',
        current: 'W',
        board: boardWith([[3, 3, 'W'], [3, 4, 'W'], [3, 5, 'W'], [3, 6, 'W'], [0, 0, 'B'], [0, 2, 'B'], [0, 4, 'B'], [0, 6, 'B'], [9, 9, 'B']]),
        moveCount: 9,
        currentStreak: 5,
        bestStreaks: { ...won.bestStreaks, medium: 5 },
      }),
      { type: 'aiMove' },
    );
    expect(lost.status).toBe('won');
    expect(lost.winner).toBe('W');
    expect(lost.currentStreak).toBe(0);
    expect(lost.bestStreaks.medium).toBe(5);
    expect(lost.roundScore).toBe(0);
  });

  it('focus moves only to valid cells', () => {
    const s = playing();
    expect(step(s, { type: 'focus', index: 3 }).focusIndex).toBe(3);
    expect(step(s, { type: 'focus', index: 999 })).toBe(s);
  });
});

describe('scoring — duelRoundScore', () => {
  it('uses mode as difficulty, stones as moves and 225 cells', () => {
    expect(roundScoreFor('medium', 'B', 'B', 9)).toBe(duelRoundScore({ outcome: 'win', difficulty: 'medium', moves: 9, boardCells: 225 }));
    expect(roundScoreFor('medium', 'B', 'B', 9)).toBe(490);
    expect(roundScoreFor('hard', 'B', 'W', 30)).toBe(0);
    expect(roundScoreFor('hard', 'B', null, 225)).toBe(125);
    expect(roundScoreFor('easy', 'B', 'B', 225)).toBe(100);
    expect(roundScoreFor('pvp', 'B', 'W', 9)).toBe(0);
  });

  it('judges outcomes from the human side; PvP decided rounds are wins', () => {
    expect(outcomeOf('easy', 'B', 'B')).toBe('win');
    expect(outcomeOf('easy', 'B', 'W')).toBe('loss');
    expect(outcomeOf('hard', 'B', null)).toBe('draw');
    expect(outcomeOf('pvp', 'B', 'W')).toBe('win');
    expect(outcomeOf('pvp', 'B', null)).toBe('draw');
  });

  it('a ranked win adds the round score to the match points', () => {
    const won = step(blackAboutToWin({ mode: 'hard', points: 100 }), { type: 'place', index: idx(7, 7) });
    expect(won.roundScore).toBe(Math.round(500 * (1 + 216 / 225)));
    expect(won.points).toBe(100 + won.roundScore);
  });
});

describe('persist', () => {
  const won = () => step(blackAboutToWin({ mode: 'medium' }), { type: 'place', index: idx(7, 7) });

  it('accepts real states', () => {
    expect(isGomokuState(playing())).toBe(true);
    expect(isGomokuState(blackAboutToWin())).toBe(true);
    expect(isGomokuState({ ...blackAboutToWin(), status: 'paused' })).toBe(true);
    expect(isGomokuState(won())).toBe(true);
    expect(isGomokuState(JSON.parse(JSON.stringify(won())))).toBe(true);
  });

  it('rejects garbage and inconsistent saves', () => {
    const ok = blackAboutToWin();
    expect(isGomokuState(null)).toBe(false);
    expect(isGomokuState('x')).toBe(false);
    expect(isGomokuState(createInitialState())).toBe(false); // idle is never saved
    expect(isGomokuState({ ...ok, board: ok.board.slice(1) })).toBe(false);
    expect(isGomokuState({ ...ok, board: ok.board.map((c, i) => (i === 100 ? 'X' : c)) })).toBe(false);
    expect(isGomokuState({ ...ok, mode: 'insane' })).toBe(false);
    expect(isGomokuState({ ...ok, moveCount: 7 })).toBe(false);
    expect(isGomokuState({ ...ok, current: 'W' })).toBe(false);
    expect(isGomokuState({ ...ok, points: -1 })).toBe(false);
    expect(isGomokuState({ ...ok, points: 1.5 })).toBe(false);
    expect(isGomokuState({ ...ok, scores: { black: 0, white: 0 } })).toBe(false);
    expect(isGomokuState({ ...ok, bestStreaks: { pvp: 0, easy: 0, medium: 0 } })).toBe(false);
    expect(isGomokuState({ ...ok, focusIndex: 225 })).toBe(false);
    expect(isGomokuState({ ...ok, lastMoveIndex: idx(10, 10) })).toBe(false);
    expect(isGomokuState({ ...ok, winner: 'B' })).toBe(false);
    expect(isGomokuState({ ...ok, status: 'won' })).toBe(false);
    expect(isGomokuState({ ...won(), winner: 'W' })).toBe(false);
    expect(isGomokuState({ ...won(), status: 'playing', winner: null, winningLine: null, roundScore: 0 })).toBe(false);
    expect(isGomokuState({ ...playing(), status: 'draw' })).toBe(false);
  });

  it('restores paused; a finished round resumes as the next round with the match kept', () => {
    const best = { pvp: 0, easy: 0, medium: 7, hard: 0 };
    const mid = restoreSavedState(blackAboutToWin(), best);
    expect(mid.status).toBe('paused');
    expect(mid.moveCount).toBe(8);
    expect(mid.bestStreaks.medium).toBe(7);
    const finished = won();
    expect(wasRoundInProgress(finished)).toBe(false);
    const next = restoreSavedState(finished, best);
    expect(next).toMatchObject({ status: 'paused', moveCount: 0, roundScore: 0, points: finished.points, round: finished.round + 1, startingStone: 'W' });
    expect(next.scores).toEqual(finished.scores);
  });
});

describe('demo autopilot', () => {
  it('plays legal moves on the real reducer until the round ends, each move fast', () => {
    const r = seededRng(7);
    let s = createDemoState();
    let slowest = 0;
    let plies = 0;
    while (s.status === 'playing' && plies < TOTAL_CELLS) {
      const t0 = performance.now();
      const move = demoMove(s, r);
      slowest = Math.max(slowest, performance.now() - t0);
      expect(s.board[move]).toBeNull();
      s = demoStep(s, r);
      plies += 1;
      expect(s.moveCount).toBe(plies);
    }
    expect(['won', 'draw']).toContain(s.status);
    expect(slowest).toBeLessThan(60);
    expect(demoStep(s, r)).toBe(s);
  });
});
