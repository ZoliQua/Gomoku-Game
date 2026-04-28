# Gomoku Game — CLAUDE.md

## Project Facts

* **Repository (standalone)**: `https://github.com/ZoliQua/Gomoku-Game`
* **Portal repo**: <https://github.com/ZoliQua/Arcade-Game-Center> — this game ships embedded as the **5th game**. Read `Arcade-Game-Center/MIGRATION.md` before any structural change to know what the portal will expect.
* **Sister projects**:
  + <https://github.com/ZoliQua/Snake-Game>
  + <https://github.com/ZoliQua/Tetris-Game>
  + <https://github.com/ZoliQua/2048-Game>
  + <https://github.com/ZoliQua/Tic-Tac-Toe-Game>
  Mirror their architecture, hook patterns, and conventions unless a Gomoku-specific reason dictates otherwise.
* **Plan**: see `GAME-PLAN.md` in the repo root for the full design, AI specification, board sizing, and phased roadmap.
* **Stack**: React 18+, Vite, TypeScript, plain CSS scoped under `.gmk-app`.
* **Package manager**: npm.
* **Node**: >=20.
* **Scripts**:
  + `npm run dev` — local dev server
  + `npm run build` — production build
  + `npm run preview` — preview production build
  + `npm run typecheck` — `tsc --noEmit`
  + `npm run lint` — ESLint
  + `npm run test` — Vitest (only if a test setup actually exists)
* **Board**: fixed **15 × 15** in v1 (`Board = readonly Cell[]` of length `BOARD_SIZE * BOARD_SIZE = 225`). Larger / smaller boards are an open question, not a v1 feature.
* **Stones**: internally `'B'` (Black) and `'W'` (White). Black goes first.
* **Modes**: `'pvp'`, `'easy'` (random AI), `'medium'` (pattern heuristic), `'hard'` (heuristic + α-β minimax with candidate restriction).
* **Win**: 5-or-more in a row in any of 4 directions (horizontal, vertical, both diagonals). Free-Gomoku rules — overlines (6+) **count as a win** in v1; Renju forbidden moves are an open question.
* **Win check** runs **only on the line through the last placed stone** (4 directions, ±5 cells), not over the full board. Order matters: check win first, then draw (full board, no winner).
* **Best stat**: longest human (Black) win streak across all modes. `localStorage` key `gomoku.highScore`. Only written when strictly higher.
* **Session scores**: `{ black, white, draws }`, displayed live; reset on mode change or explicit `Esc`. Not persisted in v1.
* **AI delay**: `AI_DELAY_MS = 350` (constants.ts). `useAITurn` dispatches `{ type: 'aiMove' }` after this delay; the timer is cancelled on state change or unmount. Hard AI must complete its search **before** the dispatch fires (target < 250 ms per move).
* **No game loop**: 2048-style. There is no auto-tick. State only advances on user input and on AI's delayed dispatch. There is **no `useGameLoop`** in this project.
* **Rendering**: DOM grid (CSS grid) for the board, inline SVG for the goban background lines + star points + stones + last-move marker. No canvas.
* **Last-move marker**: a small accent dot/ring drawn on the most recently placed stone; cleared on new round.
* **Target platform**: desktop browser primary; touch works (cells are buttons), pinch-zoom not required at 15×15 on mobile.
* **Communication**: respond to the user in **Hungarian** in chat, even though this file and the codebase are in English.

If any fact above disagrees with the real repository, verify first and flag the divergence to the user before editing code.

---

## Primary Goal

A correct, type-safe Gomoku that is easy to review, debug, and extend, and that **drops into the Arcade-Game-Center portal as the 5th game with zero refactoring**. Treat this as a maintainable project, not a one-shot script.

The standalone repo and the portal embedding are not separate codebases — they are the same `src/logic/`, `src/hooks/`, `src/components/` tree, with two roots on top of it (`App.tsx` for standalone, `GomokuGame.tsx` for both).

**Priority order**: correctness → truthfulness → verification → small diffs → maintainability → polish.

---

## Architecture

Logic lives outside presentation. **`src/logic/*` and `src/hooks/*` may not import from `react-dom`, from any portal package (`@arcade/*`), or from `src/components/*`.** This is the rule that makes the package portal-droppable.

```
src/
  logic/
    constants.ts        # BOARD_SIZE=15, WIN_LENGTH=5, AI_DELAY_MS, search radii
    types.ts            # Stone, Cell, Board, GameStatus, Mode, GameState, GameAction
    grid.ts             # index ↔ (row,col), getEmptyCells, isFull, neighbour candidates
    win.ts              # checkWinAt(board, lastIndex) -> { winner, line } | null; isDraw
    patterns.ts         # pattern detection (live3, dead4, etc.) — used by AI eval
    ai.ts               # bestMove(board, stone, mode, rng); minimax + α-β + move ordering
    game.ts             # advanceGame(state, action, ctx) — single pure reducer
  hooks/
    useKeyboardSelect.ts   # arrow + WASD navigation; Enter/Space → place; R/N/1-4/Esc/T
    useAITurn.ts           # setTimeout-driven AI move dispatcher; cancels on change / unmount
    useBestStreak.ts       # localStorage-backed best win streak; key 'gomoku.highScore'
    useElapsedSeconds.ts   # mm:ss round timer; pauses on 'won' / 'draw'
  components/
    GameBoard.tsx     # 15×15 CSS grid + 225 Cell children + SVG goban background overlay
    Cell.tsx          # one cell button; aria-label; renders Stone when filled
    Stone.tsx         # SVG stone, 'black' | 'white' variant; uses currentColor for highlights
    GobanBackground.tsx # absolutely positioned SVG: grid lines + star points
    LastMoveMarker.tsx  # small accent dot rendered on the last placed stone
    ScoreBoard.tsx    # B / W / draws + currentStreak + bestStreak + status + timer
    GameControls.tsx  # new round / reset session scores
    ModeSelect.tsx    # PvP / Easy / Medium / Hard segmented control
    Overlay.tsx       # idle / won / draw overlay
  styles/
    gmk.css           # ALL game styles, every selector starts with `.gmk-app`
  GomokuGame.tsx      # root component for both standalone AND portal; wraps in <div className="gmk-app">
  App.tsx             # standalone-only chrome (header/footer); imports GomokuGame
  main.tsx            # standalone-only React entry; renders <App />
  index.ts            # library entry: `export { GomokuGame } from './GomokuGame'; export { default } from './GomokuGame';`
```

Use this layout only after confirming what is already on disk. If the repo diverges, follow the existing convention and flag the divergence — do not silently restructure.

A central pure reducer — `advanceGame(state, action, ctx): GameState` — owns every state transition. Hooks dispatch actions and read state; they never mutate `board`, `scores`, or any other field directly. The reducer takes a `ctx: { rng }` argument exactly like the Tic-Tac-Toe reducer, so AI moves stay deterministic in tests.

---

## Type Model

```ts
type Stone = 'B' | 'W';
type Cell = Stone | null;
type Board = readonly Cell[];                  // length = BOARD_SIZE * BOARD_SIZE = 225
type WinningLine = readonly [number, number, number, number, number, ...number[]]; // 5+ indices

type GameStatus = 'idle' | 'playing' | 'won' | 'draw';
type Mode = 'pvp' | 'easy' | 'medium' | 'hard';

type GameState = {
  board: Board;
  current: Stone;
  status: GameStatus;
  winner: Stone | null;
  winningLine: WinningLine | null;
  lastMoveIndex: number | null;
  mode: Mode;
  humanStone: Stone;             // always 'B' in v1
  startingStone: Stone;          // who started this round
  scores: { black: number; white: number; draws: number };
  bestStreak: number;
  currentStreak: number;
  moveCount: number;
  focusIndex: number;            // 0..(BOARD_SIZE*BOARD_SIZE - 1)
};

type GameAction =
  | { type: 'place'; index: number }
  | { type: 'aiMove' }
  | { type: 'newRound' }
  | { type: 'changeMode'; mode: Mode }
  | { type: 'resetScores' }
  | { type: 'focus'; index: number };
```

The `Board` is a flat array — not a 2D matrix. `index ↔ (row, col)` conversion lives in `grid.ts`.

---

## Game Modes & AI (summary — full spec in GAME-PLAN.md)

| Mode      | Player 1 (B)      | Player 2 (W)            | Beatable?           |
| --------- | ----------------- | ----------------------- | ------------------- |
| `pvp`     | Human             | Human (same device)     | Yes, by either      |
| `easy`    | Human             | AI (random near-stone)  | Yes, almost always  |
| `medium`  | Human             | AI (greedy heuristic)   | Yes, with effort    |
| `hard`    | Human             | AI (α-β + heuristic)    | Beatable but hard   |

**Hard AI is not unbeatable** — Gomoku without Renju restrictions is a Black-favored game, and a v1 α-β AI with depth 4–6 will lose to a strong human. This is intentional for v1; stronger play (VCF/VCT search, opening book, deeper search) is a v1.1 question.

Pure logic is RNG-injected. `bestMove(board, stone, mode, rng)` accepts a `() => number` so `easy` is deterministic in tests. `Math.random` is only invoked at the call site (in `useAITurn`), never inside `src/logic/*`.

---

## Bug Checklist (Gomoku-specific essentials)

* **Win detection on all 4 directions**, both stones, including diagonals. Use `checkWinAt(board, lastIndex)` — only scan the line through the last placed stone.
* **Win on the *last* possible move**: a winning move on move 225 records `won`, not `draw`. Order: check win first, then draw.
* **Edge bleed**: when scanning a horizontal line near the right edge, do not wrap into the next row. Use `(row, col)` bounds, not raw `index ± 1`.
* **No-op on filled cell / dead state**: clicks on filled cells, on `won` / `draw` cells, are silently dropped. AI does not tick in dead states.
* **AI delay cancellation**: changing mode, starting a new round, or unmounting cancels any pending `setTimeout`. No stale `aiMove` ever fires after a state change.
* **AI candidate restriction**: medium / hard AI only considers empty cells within Chebyshev distance 2 of any non-empty cell. Empty board → centre. Verified by checking move count of considered candidates is ≪ 225 in mid-game.
* **Hard AI move budget**: < 250 ms per move at depth 4 on a typical board. Search exits cleanly on time-out (iterative deepening).
* **Last-move marker** updates on every placement, clears on new round, persists through win/draw display.
* **Streak stickiness**: `currentStreak` increments only on a human win, resets on any loss or draw. `bestStreak` updates only when `currentStreak > bestStreak`, never decreases.
* **Mode change resets session, not best**: `changeMode` zeros `{ black, white, draws }` and `currentStreak`; `bestStreak` and `localStorage` preserved.
* **Keyboard hygiene**: single `keydown` listener per mount, removed on unmount, arrows call `preventDefault`, focus indicator visible during play, focus clamps to `0..224` with row/column edge clamping.
* **Portal-purity** of `logic/` and `hooks/`: no imports from `react-dom`, `@arcade/*`, or `src/components/*`. Verified with grep in CI.
* **CSS scope tightness**: every selector in `src/styles/gmk.css` starts with `.gmk-app`. No `:root`, no global `body`, no naked element selectors at root.
* **Initial state**: `createInitialState()` returns an empty 225-cell board, `current: 'B'`, `status: 'playing'`, `mode: 'pvp'`, all-zero scores, `lastMoveIndex: null`, `bestStreak` loaded from `localStorage` if present.

---

## Working Rules (short)

* **Verify before and after every non-trivial change.** Read the target file and its neighbours. After the edit, re-check imports, signatures, call sites, and state transitions.
* **No hallucination.** Do not invent files, hooks, or scripts. If something is not verified, say so explicitly.
* **Small, local, reversible changes.** One fix or one feature at a time.
* **Preserve architecture.** No changes to Vite config, `tsconfig`, folder layout, styling approach, or rendering strategy without a stated reason and approval.
* **No new dependencies** without justification. Default is React + Vite + TS only.
* **Pure logic is RNG-injected.** `bestMove` and any randomized helper accept an RNG. `Math.random` is only invoked from `useAITurn` (or its tests).
* **Portal-purity is a hard rule.** `src/logic/*` and `src/hooks/*` may not import from `react-dom`, from any portal package, or from `src/components/*`.
* **End-of-task report**: changed files, verified checks, unverified gaps, real risks only.
