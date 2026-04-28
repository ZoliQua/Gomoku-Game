// Logic + AI smoke test for Gomoku.
import { advanceGame, createInitialState } from '../src/logic/game.ts';
import { checkWinAt, isDraw, boardHasWinner } from '../src/logic/win.ts';
import { bestMove, easyMove, mediumMove, hardMove } from '../src/logic/ai.ts';
import { BOARD_SIZE, TOTAL_CELLS } from '../src/logic/constants.ts';
import { getCandidateCells } from '../src/logic/grid.ts';

let pass = 0, fail = 0;
const assert = (label, cond) => {
  if (cond) { pass++; console.log(`  ok  ${label}`); }
  else { fail++; console.log(`  FAIL ${label}`); }
};

const empty = () => Array.from({ length: TOTAL_CELLS }, () => null);
const idx = (r, c) => r * BOARD_SIZE + c;

// 1. checkWinAt — horizontal, vertical, both diagonals, both stones.
{
  // Horizontal B at row 7, cols 5..9.
  const b = empty();
  for (let c = 5; c <= 9; c++) b[idx(7, c)] = 'B';
  const w = checkWinAt(b, idx(7, 7));
  assert('horizontal B win detected', w?.winner === 'B' && w.line.length >= 5);
}
{
  // Vertical W at col 3, rows 4..8.
  const b = empty();
  for (let r = 4; r <= 8; r++) b[idx(r, 3)] = 'W';
  const w = checkWinAt(b, idx(6, 3));
  assert('vertical W win detected', w?.winner === 'W' && w.line.length >= 5);
}
{
  // Diagonal ↘ B from (3,3) to (7,7).
  const b = empty();
  for (let i = 0; i < 5; i++) b[idx(3 + i, 3 + i)] = 'B';
  const w = checkWinAt(b, idx(5, 5));
  assert('diagonal ↘ B win detected', w?.winner === 'B' && w.line.length >= 5);
}
{
  // Diagonal ↙ W from (4,8) to (8,4).
  const b = empty();
  for (let i = 0; i < 5; i++) b[idx(4 + i, 8 - i)] = 'W';
  const w = checkWinAt(b, idx(6, 6));
  assert('diagonal ↙ W win detected', w?.winner === 'W' && w.line.length >= 5);
}
{
  // 4-in-row should NOT win.
  const b = empty();
  for (let c = 0; c < 4; c++) b[idx(0, c)] = 'B';
  assert('4-in-row not a win', checkWinAt(b, idx(0, 2)) === null);
}
{
  // Edge bleed: B at row 7 cols 13..14 + row 8 cols 0..2 should NOT trigger.
  const b = empty();
  b[idx(7, 13)] = 'B'; b[idx(7, 14)] = 'B';
  b[idx(8, 0)] = 'B'; b[idx(8, 1)] = 'B'; b[idx(8, 2)] = 'B';
  assert('no edge bleed across rows', checkWinAt(b, idx(7, 14)) === null);
}
{
  // Overline (6 in row) counts as win in v1.
  const b = empty();
  for (let c = 0; c < 6; c++) b[idx(0, c)] = 'B';
  assert('overline (6) counts as win', checkWinAt(b, idx(0, 3))?.winner === 'B');
}

// 2. isDraw + win-on-last-move ordering
{
  // A board with no winner that's not full → not a draw.
  const b = empty();
  b[idx(0, 0)] = 'B';
  assert('not draw on partial board', isDraw(b) === false);
}

// 3. Empty-board AI plays centre.
{
  const b = empty();
  assert('Easy on empty plays centre', easyMove(b, 'B', () => 0) === idx(7, 7));
  assert('Medium on empty plays centre', mediumMove(b, 'B', () => 0) === idx(7, 7));
  assert('Hard on empty plays centre', hardMove(b, 'B', () => 0) === idx(7, 7));
}

// 4. Medium takes immediate win.
{
  // B has 4 in a row at row 5 cols 3..6, col 7 wins.
  const b = empty();
  for (let c = 3; c <= 6; c++) b[idx(5, c)] = 'B';
  const m = mediumMove(b, 'B', () => 0);
  assert('Medium takes win-in-1', m === idx(5, 7) || m === idx(5, 2));
}

// 5. Medium blocks opponent's immediate win.
{
  // W has 4 in a row at row 9 cols 4..7, B (medium) must block at col 3 or 8.
  const b = empty();
  for (let c = 4; c <= 7; c++) b[idx(9, c)] = 'W';
  // give B at least one stone so candidates exist
  b[idx(7, 7)] = 'B';
  const m = mediumMove(b, 'B', () => 0);
  assert('Medium blocks W win-in-1', m === idx(9, 3) || m === idx(9, 8));
}

// 6. Hard short-circuits to win.
{
  const b = empty();
  for (let c = 3; c <= 6; c++) b[idx(7, c)] = 'B';
  // Add a couple of W stones near to force candidate gen.
  b[idx(6, 5)] = 'W'; b[idx(8, 5)] = 'W';
  const m = hardMove(b, 'B', () => 0);
  assert('Hard takes win-in-1', m === idx(7, 7) || m === idx(7, 2));
}

// 7. Hard time budget — full random midgame board, must return a legal move quickly.
{
  const b = empty();
  // Place ~12 stones randomly in middle.
  let toggle = 'B';
  let placed = 0;
  for (let r = 4; r <= 10 && placed < 14; r++) {
    for (let c = 4; c <= 10 && placed < 14; c++) {
      if ((r + c) % 3 === 0) {
        b[idx(r, c)] = toggle;
        toggle = toggle === 'B' ? 'W' : 'B';
        placed++;
      }
    }
  }
  const t0 = performance.now();
  const m = hardMove(b, 'B', () => 0);
  const dt = performance.now() - t0;
  assert(`Hard returns legal move (idx=${m}, ${dt.toFixed(0)}ms)`, m >= 0 && m < TOTAL_CELLS && b[m] === null);
  assert(`Hard within ~600ms budget (${dt.toFixed(0)}ms)`, dt < 600);
}

// 8. getCandidateCells returns small set near stones.
{
  const b = empty();
  b[idx(7, 7)] = 'B';
  const cands = getCandidateCells(b, 2);
  assert(`candidates near single stone count = ${cands.length}`, cands.length >= 8 && cands.length <= 24);
  assert('candidates do not include the stone', !cands.includes(idx(7, 7)));
}

// 9. Reducer: place + no-op on filled cell.
{
  const rng = Math.random;
  let s = createInitialState({ mode: 'pvp' });
  s = advanceGame(s, { type: 'place', index: idx(7, 7) }, { rng });
  assert('place places B at center', s.board[idx(7,7)] === 'B' && s.current === 'W' && s.lastMoveIndex === idx(7,7));
  const before = s.board.slice();
  s = advanceGame(s, { type: 'place', index: idx(7, 7) }, { rng });
  assert('place on filled cell is no-op', JSON.stringify(s.board) === JSON.stringify(before));
}

// 10. Reducer: full PvP win flow.
{
  const rng = Math.random;
  let s = createInitialState({ mode: 'pvp' });
  // B plays a row, W plays elsewhere.
  const moves = [
    [7, 5, 'B'], [9, 9, 'W'],
    [7, 6, 'B'], [9, 10, 'W'],
    [7, 7, 'B'], [9, 11, 'W'],
    [7, 8, 'B'], [9, 12, 'W'],
    [7, 9, 'B'], // B wins horizontally
  ];
  for (const [r, c] of moves) {
    s = advanceGame(s, { type: 'place', index: idx(r, c) }, { rng });
    if (s.status !== 'playing') break;
  }
  assert('PvP B wins horizontally', s.status === 'won' && s.winner === 'B' && s.scores.black === 1);
  assert('winningLine has 5+ entries', (s.winningLine?.length ?? 0) >= 5);
}

// 11. AI never plays an illegal move (Easy + Medium quick check).
{
  const rng = Math.random;
  for (let g = 0; g < 30; g++) {
    let s = createInitialState({ mode: 'medium' });
    while (s.status === 'playing' && s.moveCount < 50) {
      if (s.current === 'B') {
        const empties = s.board.map((c,i)=>c===null?i:-1).filter(i=>i>=0);
        s = advanceGame(s, { type: 'place', index: empties[Math.floor(rng()*empties.length)] }, { rng });
      } else {
        s = advanceGame(s, { type: 'aiMove' }, { rng });
      }
    }
    assert(`game ${g}: no illegal AI moves`, !boardHasWinner(s.board) || s.status === 'won');
  }
}

console.log(`\nPass: ${pass}  Fail: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
