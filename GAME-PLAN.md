# ⚫⚪ Gomoku — GAME-PLAN.md

Development plan for a minimal, type-safe Gomoku (Five in a Row) on a **15 × 15** board, built in the same spirit as
[ZoliQua/Snake-Game](https://github.com/ZoliQua/Snake-Game),
[ZoliQua/Tetris-Game](https://github.com/ZoliQua/Tetris-Game),
[ZoliQua/2048-Game](https://github.com/ZoliQua/2048-Game), and
[ZoliQua/Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game),
and designed from day one to be embedded in
[ZoliQua/Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) **as the 5th game** without rework:
**React 18 + Vite + TypeScript**, keyboard-first, grid-based DOM (no canvas), pure game logic separated from presentation, strict types with no `any` escape hatches in game code.

> **Repository (standalone)**: `https://github.com/ZoliQua/Gomoku-Game`
> **Portal repo**: <https://github.com/ZoliQua/Arcade-Game-Center>
> **Mirror architecture**: Snake / Tetris / 2048 / Tic-Tac-Toe.
> **Portal integration**: this repo must satisfy the "Adding a 5th game" steps in `Arcade-Game-Center/MIGRATION.md` *out of the box*, with no post-hoc refactoring.

---

## 📑 Table of contents

* [Goals](#-goals)
* [Non-goals (v1)](#-non-goals-v1)
* [Tech stack](#-tech-stack)
* [Game specification](#-game-specification)
* [Type model](#-type-model)
* [Architecture](#-architecture)
* [State machine](#-state-machine)
* [Game modes & AI](#-game-modes--ai)
* [AI implementation detail](#-ai-implementation-detail)
* [Scoring & best-score semantics](#-scoring--best-score-semantics)
* [Visual identity](#-visual-identity)
* [Controls](#-controls)
* [Phased roadmap](#-phased-roadmap)
* [Gomoku-specific bug checklist](#-gomoku-specific-bug-checklist)
* [Performance budget](#-performance-budget)
* [Portal integration checklist](#-portal-integration-checklist)
* [Working rules](#-working-rules)
* [Open questions](#-open-questions)

---

## 🎯 Goals

* A correct, minimal, type-safe Gomoku that is easy to review, debug, and extend.
* Follow Snake / Tetris / 2048 / Tic-Tac-Toe conventions exactly: `logic/` + `hooks/` + `components/`, a single pure entry point for state transitions, keyboard-first input, `localStorage`-backed best stat, real-time elapsed timer.
* **Standalone-first, portal-ready**. The standalone Vite app must be playable on its own (`npm run dev`, deploy to Vercel), AND the `src/logic/`, `src/hooks/`, `src/components/` folders must be pure enough for `git subtree`-pull into the Arcade-Game-Center monorepo with zero behavioural changes.
* **Traditional look, no theme overlay**. Black and white go-style stones on a warm goban (wood-tone board) with hairline grid and 9 star points. No mascot, no theming gimmick — Gomoku is its own identity.
* Three AI difficulty levels (random / heuristic / α-β minimax with heuristic eval) and a local 2-player mode.
* Desktop browser primary; touch works natively (cells are buttons — no swipe needed).

**Priority order**: correctness → truthfulness → verification → small diffs → maintainability → polish.

---

## 🚫 Non-goals (v1)

* No online multiplayer, no networking, no accounts.
* No board sizes other than 15×15 in v1 (13×13 / 19×19 are an open question).
* No undo / redo. Each placed stone is final within a round.
* No replays, no SGF / move recording, no game export.
* No sound, no skins, no animation library.
* No canvas, no WebGL.
* No leaderboard beyond the local stat in `localStorage`.
* No Renju forbidden-move enforcement, no overline penalty, no swap2 / pro openings — these are open questions for v1.1.
* No move hints, no AI explanation, no opening book.

---

## 🧰 Tech stack

| Area        | Choice                              | Reason                                  |
| ----------- | ----------------------------------- | --------------------------------------- |
| Framework   | React 18                            | Same as the family                       |
| Bundler     | Vite 5                              | Same as the family                       |
| Language    | TypeScript (strict)                 | No `any` in game logic                   |
| Styling     | Plain CSS (scoped under `.gmk-app`) | Portal-compatible: scoped at root        |
| State       | Local React state + hooks           | No Zustand, no Redux                     |
| Persistence | `localStorage`                      | Best stat                                |
| Renderer    | DOM grid (CSS grid) + inline SVG    | Goban background + stones in SVG; no canvas |
| Package mgr | npm                                 | `package-lock.json` committed in standalone |
| Node        | ≥ 20                                | Same as the family                       |

**Scripts** (standalone repo, mirroring the family): `npm run dev`, `npm run build`, `npm run preview`, `npm run typecheck`, `npm run lint`.

---

## 🎮 Game specification

* **Board**: 15 × 15, 225 cells, indexed `0..224` row-major (`i = row * 15 + col`).
* **Stones**: `'B'` (Black) and `'W'` (White). Black always opens within a round. Across rounds the starting stone alternates by default; loser-goes-first is an open question.
* **Move**: clicking an empty cell, or pressing Enter/Space on the focused empty cell, places the current player's stone there. Moves on filled cells are no-ops.
* **Win condition**: any **5 or more** in a row, in any of 4 directions: horizontal, vertical, and the two diagonals. Six-in-a-row (overline) **counts as a win** in v1 — this is "Free Gomoku" rules. Renju (overline forbidden for Black) is an explicit v1.1 toggle in open questions.
* **Win check** runs **only on the line through the last-placed stone**, scanning ±5 cells in each of the 4 directions. Full-board scans are unnecessary and pointlessly expensive at 15×15.
* **Draw condition**: the board is full and no winning line was completed. Pure draws are extraordinarily rare in Free Gomoku (Black wins with perfect play); we still handle the case so 225-move games end cleanly.
* **Round end**: on win or draw, the board freezes, an overlay appears, the round-scores are updated. The next round starts on user action (Enter / `R` / "New round" button).
* **No-op detection**: clicking a filled cell, an opponent-stone cell, or any cell while `status !== 'playing'` is silently ignored — no state change, no AI tick.
* **Last-move marker**: a small accent dot or ring is drawn on the most recent placement to make replays / observation easier. Clears on new round.

---

## 🧱 Type model

```ts
export const BOARD_SIZE = 15;
export const WIN_LENGTH = 5;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE; // 225

type Stone = 'B' | 'W';
type Cell = Stone | null;
type Board = readonly Cell[];                       // length = TOTAL_CELLS

type WinningLine = readonly number[];               // 5+ cell indices, in order

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
  humanStone: Stone;            // 'B' in v1
  startingStone: Stone;
  scores: { black: number; white: number; draws: number };
  bestStreak: number;
  currentStreak: number;
  moveCount: number;
  focusIndex: number;
};

type GameAction =
  | { type: 'place'; index: number }
  | { type: 'aiMove' }
  | { type: 'newRound' }
  | { type: 'changeMode'; mode: Mode }
  | { type: 'resetScores' }
  | { type: 'focus'; index: number };
```

The `Board` is a flat readonly array of length 225 — not a 2D matrix. Row/column conversion lives in `grid.ts`. We deliberately do not use a tuple type here because TypeScript chokes on length-225 tuples; an invariant comment + `BOARD_SIZE` constant + runtime-asserted length keep us honest.

---

## 🏗️ Architecture

Logic lives outside presentation. Do not bury game rules inside JSX. **`src/logic/*` must not import from `react`, `src/hooks/*`, or `src/components/*` — this is what makes the package portal-droppable.**

```
src/
  logic/
    types.ts            # shared types
    constants.ts        # BOARD_SIZE, WIN_LENGTH, AI_DELAY_MS, AI search params
    grid.ts             # index ↔ (row,col), neighbours, getEmptyCells, isFull
    win.ts              # checkWinAt(board, lastIndex) -> { winner, line } | null; isDraw
    patterns.ts         # pattern detection (open/closed 2/3/4, five), shared by AI eval
    ai.ts               # bestMove(board, stone, mode, rng); minimax core; heuristic for medium
    game.ts             # advanceGame(state, action, ctx) — single pure reducer; createInitialState
  hooks/
    useKeyboardSelect.ts   # arrows + WASD + Enter/Space + R + N + 1-4 + Esc + T (toggle, reserved)
    useAITurn.ts           # setTimeout-driven AI move dispatcher; cancels on change / unmount
    useBestStreak.ts       # localStorage-backed best win streak; key 'gomoku.highScore'
    useElapsedSeconds.ts   # mm:ss round timer; pauses on 'won' / 'draw'
  components/
    GameBoard.tsx          # 15×15 CSS grid + 225 Cell children + GobanBackground + WinningLine overlay
    Cell.tsx               # one cell button; aria-label; renders Stone when filled
    Stone.tsx              # SVG stone, 'black' | 'white' variant
    GobanBackground.tsx    # SVG behind the cells: grid lines + 9 star points
    LastMoveMarker.tsx     # small accent dot on the last-placed stone
    WinningLine.tsx        # SVG line connecting the centres of the winning stones
    ScoreBoard.tsx         # B / W / draws + currentStreak + bestStreak + status + timer
    GameControls.tsx       # new round / reset session scores
    ModeSelect.tsx         # PvP / Easy / Medium / Hard segmented control
    Overlay.tsx            # idle / won / draw overlay
  styles/
    gmk.css                # ALL game styles, every selector starts with `.gmk-app`
  GomokuGame.tsx           # root component; wraps everything in <div className="gmk-app">
  App.tsx                  # standalone-only chrome (header/footer)
  main.tsx                 # React entry (standalone-only)
  index.ts                 # library entry: `export { GomokuGame } from './GomokuGame'; export { default } from './GomokuGame';`
```

**Why two roots (`GomokuGame.tsx` AND `App.tsx`)?** Per `Arcade-Game-Center/MIGRATION.md` step 3: when the game is moved into the monorepo, `App.tsx`, `main.tsx`, and `index.html` are deleted, and the portal renders `<GomokuGame />` directly inside its shell. Designing this split from day one means **zero refactoring** on integration day — the standalone `App.tsx` just adds page-level chrome (page title, GitHub link, tab title) around `<GomokuGame />`.

Central pure reducer shape:

```ts
function advanceGame(state: GameState, action: GameAction, ctx: { rng: () => number }): GameState;
```

`advanceGame` owns every state transition. Hooks dispatch actions and read state; they never mutate `board`, `scores`, or any other field directly.

---

## 🔄 State machine

```
idle ──(place / aiMove)──▶ playing ──┬──(winning move)──▶ won
                                      │
                                      └──(225 cells placed, no winner)──▶ draw

won  ──(newRound)──▶ playing
draw ──(newRound)──▶ playing

(any) ──(changeMode)──▶ playing  // session scores reset; board reset; current = B
```

* `idle → playing`: the initial state on mount is `playing` (`B` to move). `idle` is reserved for a future "press any key to start" landing card.
* `playing → won`: as soon as a placed stone completes a 5-in-a-row through that stone. The winning player is recorded, the winning line (≥5 indices) is set, the AI does not respond.
* `playing → draw`: as soon as `moveCount === 225` and no win was scored on the last move. Vanishingly rare in Free Gomoku.
* `won → playing` / `draw → playing`: on `newRound`. The board is cleared, `moveCount` reset, `winner`/`winningLine`/`lastMoveIndex` cleared, `current` set to the new starting stone, `scores` carried over.
* `→ playing` via `changeMode`: full board reset, `scores` reset, `current = B`, `humanStone = B`, `bestStreak` carried over.

Input is silently ignored in `won` and `draw` states except `newRound` and `changeMode`. AI does not tick in those states.

---

## 🤖 Game modes & AI

Four modes, all sharing the same `advanceGame` reducer. Mode only changes who provides the second player's moves.

| Mode      | Player 1 (B)   | Player 2 (W)               | Beatable?                |
| --------- | -------------- | -------------------------- | ------------------------ |
| `pvp`     | Human          | Human (same device)        | Yes, by either player    |
| `easy`    | Human          | AI (random near-stone)     | Yes, almost always       |
| `medium`  | Human          | AI (greedy heuristic)      | Yes, with effort         |
| `hard`    | Human          | AI (heuristic + α-β)       | **Beatable**, but hard   |

**Important**: unlike Tic-Tac-Toe Hard, Gomoku Hard in v1 is **not unbeatable**. Free Gomoku without Renju restrictions is a known Black-favored game, and a v1 α-β AI at depth 4–6 with a hand-tuned heuristic and candidate restriction will lose to a strong human — especially when the human plays Black. This is intentional for v1; the goal is *fun + non-trivial*, not perfect play. Stronger play (VCF/VCT search, wider depth, opening book) is a v1.1 question.

The **RNG is injected**. `bestMove(board, stone, mode, rng)` accepts a `() => number` so `easy` is deterministic in tests. `Math.random` is only invoked at the call site (in `useAITurn`), never inside pure logic.

**AI delay** (`AI_DELAY_MS`, default `350`): when it's the AI's turn, `useAITurn` waits `AI_DELAY_MS` before dispatching `{ type: 'aiMove' }`. The delay is cancelled if the game state changes (new round, mode change, unmount) before it fires. The actual search must complete **inside** the dispatch (target < 250 ms per move on a typical mid-game board) so the perceived response time stays at the delay.

---

## 🧠 AI implementation detail

### Easy

```ts
function easyMove(board, stone, rng) {
  const candidates = neighborhood(board, 2); // empty cells within Chebyshev distance 2 of any stone
  if (candidates.length === 0) return CENTER_INDEX; // empty board → centre
  return pickRandom(candidates, rng);
}
```

### Medium — pattern heuristic, greedy

For each candidate cell `i`, compute a score in two passes (one for `stone`, one for the opponent):

1. Place a hypothetical stone at `i`.
2. For each of 4 directions, scan ±4 cells around `i` and classify the run (`patterns.ts`):

   | Pattern           | Description                                | Score |
   | ----------------- | ------------------------------------------ | ----- |
   | `five`            | 5 in a row (game-winning)                  | 100000 |
   | `live4`           | open 4 (`_XXXX_`)                          | 10000  |
   | `dead4` / `four`  | closed 4 (one end blocked, e.g. `OXXXX_`)  | 1000   |
   | `live3`           | open 3 (`_XXX_`)                           | 500    |
   | `dead3`           | closed 3                                    | 100    |
   | `live2`           | open 2                                      | 50     |
   | `dead2`           | closed 2                                    | 10     |

3. Sum across directions for `stone` (offence) and for the opponent at the same cell (defence — what the opponent would gain if they played here next).
4. Pick `argmax(offenceScore + α · defenceScore)`, tie-break by distance to centre, then random.

5-step priority short-circuits (in order):

1. If the AI can complete 5-in-a-row this move → take it.
2. Else if the opponent has a single-move win threat → block it.
3. Else if the AI can create a `live4` → take it.
4. Else if the opponent has a `live4` threat → block it.
5. Else fall back to the heuristic above.

### Hard — heuristic eval + α-β minimax

* Same heuristic as Medium, used as the **leaf evaluation** for minimax search.
* **Candidate restriction**: at each ply, only consider empty cells within Chebyshev distance 2 of any non-empty cell (typically 30–60 cells in the mid-game, vs 200+ raw empties). Empty board → centre, then ring around.
* **Move ordering**: sort candidates at each ply by their static heuristic score (descending) so α-β pruning is effective.
* **Iterative deepening**: search depth 2, then 4, then 6 within a 250 ms wall-clock budget; return the best move from the deepest completed iteration.
* **No transposition table in v1** — Gomoku has too few exact state repeats at 15×15 to justify the memory/code cost; revisit in v1.1 if depth > 6 is needed.

The heuristic and the search are both implemented in `src/logic/ai.ts`, with shared pattern code in `src/logic/patterns.ts`. Both modules are pure — no React, no DOM, no `Math.random` (RNG injected).

---

## 🎯 Scoring & best-score semantics

Gomoku doesn't have a continuous score. Instead we track:

* **Session scores**: `{ black, white, draws }`, displayed on the scoreboard. Persists across rounds within the same mode. Resets when `mode` changes or the user presses "Reset scores".
* **Current streak**: number of consecutive *human wins* in the current mode (vs AI) or Black wins (in PvP). Resets to `0` on a loss or draw.
* **Best streak**: longest streak of human wins across the entire history of the game, across all modes. Persisted to `localStorage` under key `gomoku.highScore`. Only written when strictly higher than the existing best.

The portal's `GAMES` registry expects a single `best` value per game. We expose `bestStreak` as that value:

```ts
{
  id: 'gomoku',
  name: 'Gomoku',
  Icon: BlackStoneIcon,
  color: 'var(--gmk-accent)',
  best: () => useBestStreak().value,
}
```

**Mode-weighted streak** *(decision)*: a hard-mode win counts the same as an easy-mode win in the streak counter. Open question lists per-mode streaks for v1.1.

---

## 🎨 Visual identity

Traditional goban look — no mascot, no theme overlay. The board is the identity.

* **Board**: warm wood tone (`--gmk-board-bg: #d8a865` light, `#3a2a18` dark) with a faint paper-grain texture (CSS gradient, no image).
* **Grid lines**: hairline strokes in a darker tone (`--gmk-grid-line: #5a3a18` light, `#a07840` dark).
* **Star points**: 9 traditional stars at (3,3), (3,7), (3,11), (7,3), (7,7), (7,11), (11,3), (11,7), (11,11) — small filled circles in the grid-line colour.
* **Stones**: SVG circles with radial gradient — Black: deep slate (`#1a1a1d` core, `#3a3a3d` rim), White: cream (`#f6f0dc` core, `#d8c89c` rim). Each stone has a soft drop shadow.
* **Last-move marker**: small accent dot (`--gmk-last-move: #ef4444`) at the centre of the most recent stone.
* **Winning line**: thin SVG stroke (`stroke-dasharray` reveal, ~400 ms) connecting the 5 centres in the winning line, in `--gmk-win-line: #10b981`.
* **Focus indicator**: 2 px ring on the focused cell in `--gmk-accent`, no fill change (so it doesn't get confused with a stone).

Tokens (overridable from portal):
```
--gmk-black-stone, --gmk-white-stone,
--gmk-board-bg, --gmk-grid-line, --gmk-star-point,
--gmk-last-move, --gmk-win-line,
--gmk-accent
```

The whole game roots at `<div class="gmk-app">`, which both *defines* these CSS variables and *consumes* them. Portal `tokens.css` may override them on `:root` or on the portal shell, but the `.gmk-app` block always wins for game-internal rendering.

---

## ⌨️ Controls

| Input                         | Action                                                                  |
| ----------------------------- | ----------------------------------------------------------------------- |
| Mouse / touch click on a cell | Place stone on that cell (if empty + your turn)                         |
| ⬆️ ⬇️ ⬅️ ➡️                  | Move focus indicator on the 15×15 grid (clamped to edges, no wrap)      |
| **W A S D**                   | Move focus indicator (alt)                                              |
| **Page Up / Page Down**       | Jump focus by 5 rows (open question — ergonomic on 15×15)               |
| **Home / End**                | Jump focus to start/end of current row (open question)                  |
| **Enter** / **Space**         | Place stone on focused cell                                             |
| **R**                         | New round (after `won` / `draw`); ignored during play                   |
| **N**                         | Cycle through modes (PvP → Easy → Medium → Hard → PvP)                  |
| **1–4**                       | Jump to mode (`1`=PvP, `2`=Easy, `3`=Medium, `4`=Hard)                  |
| **Esc**                       | Reset session scores                                                    |

Single `keydown` listener per mount, removed on unmount. Arrow keys call `event.preventDefault()` so the page never scrolls. Keys other than the listed ones are ignored. **No input is accepted in `won` / `draw` except** `R`, `N`, `1–4`, `Esc`.

Cells are real `<button>` elements with `aria-label="Row 8, column 8, empty"` (or `"black stone"` / `"white stone"` when filled), so screen readers and keyboard `Tab` work natively.

---

## 🗺️ Phased roadmap

Each phase ends with a concrete **Done when** criterion. Do not start the next phase until the previous one is verified.

### Phase 0 — Scaffold
Vite + React + TS setup mirroring the family. ESLint config, `tsconfig*`, script names. Empty `src/logic/`, `src/hooks/`, `src/components/`. Dual-root: `App.tsx` + `GomokuGame.tsx` + `index.ts`.
**Done when**: `npm run dev` shows an empty page with the standalone chrome; `npm run typecheck` and `npm run build` pass.

### Phase 1 — Goban background + stones
Render the 15×15 CSS grid. Build `GobanBackground` (lines + star points) and `Stone` (B/W SVG circles). Hard-code a small board (e.g., a 4-stone diagonal) to verify rendering, focus styles, last-move marker, colour tokens.
**Done when**: lines and star points render at the right positions; both stone variants render at multiple sizes; a hand-built test board displays correctly.

### Phase 2 — `checkWinAt(board, lastIndex)` and `isDraw(board)`
Pure functions. `checkWinAt` returns `{ winner, line }` or `null` by scanning ±4 cells in each of the 4 directions through `lastIndex`, then returning the run if length ≥ 5. `isDraw` returns `true` iff every cell is filled AND no winner.
**Done when**: unit table — all 4 directions, both stones, edges of the board, overlines all resolve correctly; full-board with no win returns `null`.

### Phase 3 — `advanceGame` + place action (PvP only)
Implement the reducer for `place`, `newRound`, `changeMode`, `resetScores`, `focus`. PvP only — no AI yet. Stones alternate B / W. On win, set `status='won'`, `winner`, `winningLine`, freeze board. On full board with no win, set `status='draw'`. Input on filled cells / wrong status is a no-op. `lastMoveIndex` updates on every place, clears on new round.
**Done when**: a full PvP round can be played to a win and to a draw; `newRound` cleanly resets the board and alternates `startingStone`; clicking a filled cell does nothing.

### Phase 4 — Mouse + keyboard input
Wire `Cell.tsx` `onClick` to dispatch `{ type: 'place', index }`. Implement `useKeyboardSelect`: arrow keys move `focusIndex` (clamped), Enter/Space dispatches place, R/N/1–4/Esc handled. Arrows call `preventDefault`.
**Done when**: a full round is playable with keyboard alone; focus indicator is visible; arrow navigation never scrolls the page; focus clamps at edges (no row-wrap, no column-wrap).

### Phase 5 — Last-move marker + winning-line strike
Render `LastMoveMarker` on `lastMoveIndex`. Render `WinningLine` SVG from the centre of `winningLine[0]` to the centre of `winningLine[winningLine.length - 1]` with `stroke-dashoffset` reveal animation (~400 ms).
**Done when**: every direction's win renders a correctly positioned strike; the strike does not appear on draws; the last-move marker tracks the most recent stone.

### Phase 6 — `bestMove` Easy
Implement Easy AI (random near-stone; centre on empty board). Wire `useAITurn` to dispatch `{ type: 'aiMove' }` after `AI_DELAY_MS` whenever it's the AI's turn. RNG injection: tests pass a deterministic RNG.
**Done when**: in Easy mode, the AI plays a random adjacent legal move ~350 ms after the human; over 200 simulated games, AI wins, losses, and draws (or near-draws) all occur.

### Phase 7 — `patterns.ts` + Medium heuristic
Implement pattern detection for `five`, `live4`, `dead4`, `live3`, `dead3`, `live2`, `dead2` along a ±4 window in any of 4 directions through a candidate cell. Then implement `mediumMove` with the 5-step priority + heuristic argmax. Test against a fixture set: every "you can win now" position takes the win; every "you must block" position blocks; every double-three-creating move is preferred over single-three when available.
**Done when**: against random play, Medium AI wins ≥ 80% of games as Black, ≥ 70% as White; never misses a single-move win or single-move block; never plays a non-adjacent move when stones exist.

### Phase 8 — `bestMove` Hard (α-β + iterative deepening)
Full minimax + α-β with candidate restriction (Chebyshev distance ≤ 2 from any non-empty cell), move ordering by static heuristic, iterative deepening from depth 2 to depth 6 within a 250 ms time budget. Use the Medium heuristic for leaf eval.
**Done when**: in Hard vs Medium head-to-heads, Hard wins > 60%; Hard moves complete in < 250 ms on a typical mid-game board; manual play test (≥ 10 games) feels like "a strong club beginner" — fun, beatable with effort, never makes obvious blunders.

### Phase 9 — Mode select + scores
`ModeSelect.tsx` segmented control. `changeMode` action resets the board and session scores. `ScoreBoard.tsx` displays `{ black, white, draws }` and the current streak.
**Done when**: switching modes mid-round clears the board and zeros the session scores; the streak counter increments on human win, resets on loss or draw.

### Phase 10 — Best streak persistence + elapsed timer
`useBestStreak`: read on mount, write only when `currentStreak > bestStreak`. Key: `gomoku.highScore`. `useElapsedSeconds`: `mm:ss` round-timer; pauses on `won` / `draw`.
**Done when**: best streak survives a refresh; timer resets on `newRound` and pauses on round end; best streak does not regress.

### Phase 11 — Place + win animations
Stone scales `0 → 1` with a 130 ms pop on placement. Last-move marker fades in. Winning-line strike reveals via `stroke-dashoffset`. Draw state: a brief grayscale shimmer on the whole board. CSS-only.
**Done when**: animations never desync from logical state; rapid clicks never produce visual glitches; no animation library was added.

### Phase 12 — Polish + ship standalone
README mirroring the family structure (badges, TOC, features, controls, scoring, scripts, architecture, license). Deploy to Vercel. Tag `v1.0.0`.
**Done when**: `npm run build` produces a clean prod bundle; the app is live at a Vercel URL; the release is tagged.

### Phase 13 — Portal integration smoke test (5th game)
Run through `Arcade-Game-Center/MIGRATION.md` "Adding a 5th game" steps end-to-end against a local clone of the monorepo. Specifically: subtree-add this repo, strip chrome, rename to `GomokuGame.tsx` (no-op since we already named it that), scope CSS (no-op since already `.gmk-app`), workspace `package.json`, register in `Shell.tsx` `GAMES` array, register in `App.tsx` route, add the landing-page preview component.
**Done when**: the game card appears on the portal landing as the 5th game; clicking it loads Gomoku inside the portal shell; no console errors; high score key `gomoku.highScore` round-trips through the portal's storage; **zero post-integration source changes were needed** beyond what `MIGRATION.md` prescribes mechanically.

---

## 🧪 Gomoku-specific bug checklist

Confirm each item was checked before closing any non-trivial task, or explicitly state it was not:

* **Win detection covers all 4 directions**: horizontal, vertical, both diagonals. Both stones tested for each direction, including edges of the board.
* **`checkWinAt` only scans through `lastIndex`** — it does not iterate the whole board. Verify call cost is O(1) per move (constant ±4 cells × 4 directions).
* **No edge bleed**: a horizontal scan near the right edge (col 14) does not wrap into row+1, col 0. Use `(row, col)` bounds.
* **Overline handling**: a 6-in-a-row in v1 counts as a win. The recorded `winningLine` may be 5 or more cells; downstream code (WinningLine SVG) handles arrays of any `length ≥ 5`.
* **Win on the *last* move**: a winning move that fills cell #225 is recorded as `won`, not `draw`. Order: check win first, then draw.
* **Draw only on full board**: `isDraw` returns false on a non-full board even if no winner *yet* exists.
* **No-op on filled cell**: clicking an already-stoned cell does nothing — no state mutation, no AI tick, no streak change, no `moveCount` increment, no `lastMoveIndex` change.
* **No-op in dead states**: clicks on cells in `won` / `draw` are silently dropped. AI does not tick in dead states.
* **AI delay cancellation**: changing mode, starting a new round, or unmounting cancels any pending `setTimeout`. No stale `aiMove` ever fires after a state change.
* **AI candidate restriction**: medium / hard AI only consider empty cells within Chebyshev distance 2 of any non-empty cell. Verified by logging candidate count at each move (typically 30–60 in mid-game; ≤ 1 on empty board → centre fallback).
* **Hard AI move budget**: each move completes in < 250 ms. Iterative deepening exits cleanly on time-out without crashing or returning an invalid move.
* **AI never plays an illegal move**: the index returned by `bestMove` is always `0..224` and points to an empty cell. Verified with assertions in dev / tests.
* **First-move handling**: on an empty board, AI plays the centre cell (112), not a random corner.
* **Last-move marker** updates on every successful place (human or AI) and clears on new round; never points to a winning-line stone after the round ends if visually distracting (decision: keep it visible — confirms the winning move).
* **Starting stone alternation**: round N starts with `B`, round N+1 with `W`, round N+2 with `B`, etc. (Open question: loser-goes-first.)
* **Streak stickiness**: `currentStreak` increments only on a human win, resets on any loss or draw. `bestStreak` updates only when `currentStreak > bestStreak`, never decreases.
* **Mode change resets session, not best**: `changeMode` zeros `{ black, white, draws }` and `currentStreak`, but `bestStreak` and `localStorage` are preserved.
* **Keyboard hygiene**: single listener per mount, cleaned up on unmount, arrows call `preventDefault`, focus indicator visible at all times during play.
* **Focus index bounds**: arrow keys clamp `focusIndex` to `0..224` with edge clamping (no wrap). Pressing Right on column 14 stays at column 14.
* **Winning line geometry**: the SVG strike connects the *centres* of the first and last stones in `winningLine`, not the cell corners. Length ≥ 5 supported.
* **Stones render at every cell size**: tested at 24 px, 32 px, 48 px. No clipping, no overflow into neighbouring cells.
* **Portal-purity of `logic/` and `hooks/`**: no imports from `react-dom`, `@arcade/ui`, `@/components`, or any UI-side path. Pure functions and pure-state hooks only. Verified with a grep test (`grep -rE "from ['\"](\\.\\./)*components|from ['\"]react-dom" src/logic src/hooks` must return nothing).
* **CSS scope tightness**: every selector in `src/styles/gmk.css` starts with `.gmk-app`. No `:root`, no global `body`, no naked element selectors at the top level.
* **Initial state**: `createInitialState()` returns an empty 225-cell board, `current: 'B'`, `status: 'playing'`, `mode: 'pvp'`, all-zero scores, `lastMoveIndex: null`, `bestStreak` loaded from `localStorage` if present.

---

## 🚦 Performance budget

* **First paint**: < 250 ms after mount on a modern desktop browser.
* **Re-render of a single move**: < 16 ms — no full-board re-render. `Cell.tsx` is `memo`-ed and only re-renders when its `value`, `isFocused`, `isWinning`, `isLastMove`, or `iconStyle` change.
* **AI move (Hard)**: < 250 ms per move on mid-game boards. Easy / Medium: < 30 ms.
* **Bundle size**: standalone production build ≤ 200 kB JS (gzip ≤ 65 kB), CSS ≤ 12 kB (gzip ≤ 3 kB). Family baseline; flag if we drift over.
* **Lighthouse Performance ≥ 95** on a clean Vite prod build. Family baseline.

---

## 🔌 Portal integration checklist

A pre-flight check that this repo satisfies `Arcade-Game-Center/MIGRATION.md` step 1–11 *as currently written* for the 5th-game flow. Maintain this checklist as the migration doc evolves.

| MIGRATION.md step                                 | Pre-satisfied here?                                | Action on integration day                    |
| ------------------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| 1. `git subtree add --prefix=apps/gomoku …`       | N/A — done in monorepo                             | Run the command                              |
| 2. Strip chrome (`index.html`, `main.tsx`, etc.)  | ✅ Chrome already isolated in `App.tsx` + `main.tsx` | Delete the listed files                      |
| 3. Rename `App.tsx` → `<Game>Game.tsx`            | ✅ Already named `GomokuGame.tsx`                   | No-op (or delete `App.tsx`)                 |
| 3. Wrap root in `<div className="gmk-app">`      | ✅ Already wrapped                                  | No-op                                        |
| 4. Scope CSS under `.gmk-app`                    | ✅ Every selector pre-scoped                        | No-op                                        |
| 5. `src/index.ts` library entry                  | ✅ Pre-built, exports `GomokuGame`                  | No-op                                        |
| 6. Replace `package.json` with workspace package | ❌ Standalone has full Vite deps                    | Replace with `@arcade/gomoku` package.json   |
| 7. Replace `tsconfig.json`                       | ❌ Standalone has full Vite tsconfig                | Replace with the monorepo's tsconfig         |
| 8. CSS Modules typing                            | N/A — using plain CSS                              | Skip                                         |
| 9. Register in portal                            | N/A — happens in monorepo                          | Add to `Shell.tsx` `GAMES`, `App.tsx` route, `Landing.tsx` preview, `package.json` deps |
| 10. Extend sync script                           | N/A — happens in monorepo                          | Add `gomoku` case to `sync-to-upstream.sh`   |
| 11. `npm install && typecheck && build && dev`   | N/A — happens in monorepo                          | Run                                          |

The two `❌` rows are the only manual changes integration day. Everything else is already done by following this plan.

**Portal-side artefacts to prepare** (these go in the monorepo, not this repo):

* `GAMES` entry: `{ id: 'gomoku', name: 'Gomoku', Icon: BlackStoneIcon, color: '#1a1a1d', best: 'gomoku.highScore' }` — exact shape TBD by inspecting the current `Shell.tsx`.
* Landing-page preview component: a static mini goban (5×5) with one black and one white stone, ~80×80 px. Lives in `apps/portal/src/Landing.tsx`.
* Sidebar icon: a small black stone, exported from `packages/ui/src/Icons.tsx` so the portal can render it without depending on `@arcade/gomoku`.

---

## 📏 Working rules

* **Verify before and after every non-trivial change.** Read the target file and its neighbours. After the edit, re-check imports, signatures, call sites, and state transitions.
* **No hallucination.** Do not invent files, hooks, or scripts. If something is not verified, say so explicitly.
* **Small, local, reversible changes.** One fix or one feature at a time. No bundling refactor + feature + style.
* **Preserve architecture.** No changes to Vite config, `tsconfig`, folder layout, styling approach, or rendering strategy without a stated reason and approval.
* **Explicitness over cleverness.** Small pure functions, explicit types, direct state transitions.
* **No new dependencies** without justification. Default is React + Vite + TS only. No game engines, no Zustand, no immer, no animation libs.
* **Pure logic is RNG-injected.** `bestMove` and any randomized helper accept an RNG. `Math.random` is only invoked from `useAITurn` (or its tests), never from inside `src/logic/*`.
* **Portal-purity is a hard rule.** `src/logic/*` and `src/hooks/*` may not import from `react-dom`, from any portal package, or from `src/components/*`. Grep-tests in CI enforce this.
* **AI search has a wall-clock budget.** Hard mode uses iterative deepening with a 250 ms cap. Never let the search block the UI thread for > 300 ms.
* **End-of-task report**: changed files, verified checks, unverified gaps, real risks only.

**Communication**: respond to the user in **Hungarian** in chat, even though this file and the codebase are in English (same convention as Snake / Tetris / 2048 / Tic-Tac-Toe).

---

## ❓ Open questions

* **Board size**: lock 15×15 in v1 (current plan), or ship a 13×13 / 15×15 / 19×19 selector? 13×13 makes Hard AI feasibly stronger; 19×19 is more "go-flavoured" but slower to render and search.
* **Renju forbidden moves for Black**: currently free Gomoku (Black wins with perfect play). Implement the three Renju forbidden patterns (overline, double-four, double-three) for Black as a v1.1 toggle to balance the game?
* **Overline handling**: in free mode v1, a 6-in-a-row by either side counts as a win. Some rule sets count it for White but not for Black. Stick with "any 5+ wins" or split by colour?
* **Loser-goes-first**: currently `startingStone` strictly alternates. Tradition often gives the previous loser the first move next round. Implement, or keep strict alternation?
* **Best-streak weighting**: a streak of 5 Easy wins counts the same as 5 Hard wins. Alternative: per-mode streaks, expose the maximum to the portal. Or expose only Hard streaks (Hard is hard but beatable, so a Hard streak of even 2 is meaningful).
* **AI delay configurability**: 350 ms hard-coded vs. user-tunable slider (e.g., 0 / 350 / 800 ms)?
* **Single undo**: Tic-Tac-Toe forbids undo. Gomoku games are 30–80 moves long; a single undo (one human move + one AI move reverted) might be a quality-of-life feature. Implement, or keep "moves are final" for parity with the family?
* **Move history sidebar**: list of moves (`B(8,8) — W(7,8) — …`)? Useful for analysis, but adds presentation complexity.
* **Stone style toggle (Tic-Tac-Toe-Game inspired)**: ship classic black/white stones (current plan) plus an alternative "dental" theme (healthy / decayed teeth) under a Teeth ↔ Classic toggle, or keep Gomoku visually pure?
* **Sound**: out of scope for v1. Reconsider for v1.1 (subtle "click" on placement, "ding" on win)?
* **Touch UX on mobile**: 15×15 cells get small on a phone. Add pinch-zoom / pan, or accept "desktop primary"?
* **Confirmation dialogs**: `Esc` resets session scores. Confirm in a modal, or commit immediately?
* **Keyboard shortcut for swap-colour**: currently human is always Black. Allow human-as-White for variety?

---

**Guiding principle**: correctness over speed, verification over confidence, truth over fluency, small safe diffs over large rewrites. When in doubt — inspect more, assume less, change less, state uncertainty clearly.
