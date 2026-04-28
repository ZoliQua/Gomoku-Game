# ⚫⚪ Gomoku — Five in a Row

A minimal, type-safe **Gomoku** (Five in a Row) on a **15 × 15 goban**, built with **React 18**, **Vite**, and **TypeScript**. Keyboard-first, grid-based, no canvas, no external game engine. Three AI difficulty levels including α-β minimax with iterative deepening, and a one-click **stones ↔ teeth** icon toggle.

![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Table of contents

- [Features](#-features)
- [How it works](#-how-it-works)
- [Game modes & AI](#-game-modes--ai)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Usage](#-usage)
- [Controls](#-controls)
- [Scoring](#-scoring)
- [Stones & teeth](#-stones--teeth)
- [Scripts](#-scripts)
- [Architecture](#-architecture)
- [Sister projects](#-sister-projects)
- [License](#-license)

## ✨ Features

- ⚫⚪ **Classic 15 × 15 goban** with hairline grid and 9 traditional star points, drawn in inline SVG
- 🦷 **Stones ↔ Teeth toggle** — switch between traditional black/white stones and matching black/white tooth icons (persisted in `localStorage`)
- 🎮 **Four modes** — Player-vs-Player, Easy (random near-stone AI), Medium (pattern heuristic AI), Hard (α-β minimax with iterative deepening)
- 🧠 **Pattern-based AI** — open/closed twos, threes, fours, fives; 5-step priority (win → block → live-four → block live-four → heuristic argmax)
- ⏱️ **Real-time round timer** (`mm:ss`) that pauses on win or draw
- 🏆 **Persistent best streak** in `localStorage` (`gomoku.highScore`) across refreshes and modes
- 🎯 **Last-move marker** — small accent dot on the most recently placed piece, so replays and observation are easy
- ⌨️ **Keyboard-first** — arrows + WASD to move focus, Enter/Space to place, R for new round, T to toggle icons, 1–4 to jump modes
- ✨ **CSS-only animations** — stone pop on placement, animated SVG strikethrough on the winning line, last-move fade-in
- 🧼 **Pure game logic** separated from UI — `src/logic/*` and `src/hooks/*` never import from `components/`
- 🎨 **Plain CSS** scoped under `.gmk-app` — drop-in compatible with the [`Arcade-Game-Center`](https://github.com/ZoliQua/Arcade-Game-Center) portal as the **5th game**
- 🔒 **Type-safe** — strict TypeScript, no `any` escape hatches in game code

## 🧠 How it works

The game is a small state machine driven by a single pure reducer:

```
idle → playing ──┬── (5+ in a row) ──→ won
                 └── (225 cells, no winner) → draw

won  → (R / new round) → playing
draw → (R / new round) → playing
```

`advanceGame(state, action, ctx): GameState` owns every transition:

1. **`place`** — drops the current player's stone on an empty intersection. Filled-cell clicks are silent no-ops.
2. **`aiMove`** — `bestMove(board, stone, mode, rng)` picks a move under the current mode's strategy. RNG is injected so tests are deterministic.
3. **Win check first** — `checkWinAt(board, lastIndex)` only scans the four lines through the last placed stone (±5 cells in horizontal, vertical, and both diagonals). O(1) per move, never a full-board scan.
4. **Then draw check** — only triggers when all 225 cells are filled and no winner. A winning move on the very last cell is recorded as `won`, never `draw`.
5. **Streak bookkeeping** — `currentStreak` increments only on a human win, resets on any loss or draw. `bestStreak` only ever increases.
6. **`newRound`** — clears the board, alternates the starting stone, keeps session scores. **`changeMode`** resets session scores too.

A small React hook (`useAITurn`) watches the state and dispatches `aiMove` after a 350 ms delay when it's the AI's turn — the timer is cancelled on every state change and on unmount, so no stale move ever fires after a new round, mode change, or unmount.

## 🤖 Game modes & AI

| Mode      | Player 1 (Black)  | Player 2 (White)              | Beatable?                                       |
| --------- | ----------------- | ----------------------------- | ----------------------------------------------- |
| **PvP**   | Human             | Human (same device)           | Yes, by either player                           |
| **Easy**  | Human             | AI (random near-stone)        | Yes, almost always                              |
| **Medium**| Human             | AI (pattern heuristic, greedy)| Yes, with effort                                |
| **Hard**  | Human             | AI (α-β + iterative deepening)| **Beatable**, but plays solid threats           |

**Hard is not unbeatable** — Free Gomoku (no Renju restrictions) is a known Black-favored game, and a v1 α-β AI at depth 4 with a hand-tuned heuristic and candidate restriction will lose to a strong human, especially when the human plays Black. This is intentional for v1; stronger play (VCF/VCT search, deeper iterative deepening, opening book) is on the v1.1 backlog.

The Medium AI follows a 5-step priority: **win-now → block-opponent-win → make-live-four → block-opponent-live-four → heuristic argmax** over a candidate set restricted to empty cells within Chebyshev distance 2 of any stone (typically 30–60 cells in the mid-game). The Hard AI uses the same heuristic as a leaf evaluator inside an α-β minimax search with iterative deepening, a 250 ms wall-clock budget, and a branching cap of 12 best-ordered moves per ply.

## 📦 Requirements

- 🟢 **Node ≥ 20**
- 📦 **npm** (the lockfile is committed as `package-lock.json`)

## 🚀 Installation

```bash
git clone https://github.com/ZoliQua/Gomoku-Game.git
cd Gomoku-Game
npm install
```

## 🕹️ Usage

Start the dev server:

```bash
npm run dev
```

Then open `http://localhost:5173` in a modern desktop browser.

For a production build:

```bash
npm run build
npm run preview
```

## ⌨️ Controls

| Key                            | Action                                  |
| ------------------------------ | --------------------------------------- |
| 🖱️ Click / Touch              | Place a piece on the chosen cell        |
| ⬆️ / ⬇️ / ⬅️ / ➡️             | Move the focus indicator                |
| **W** / **A** / **S** / **D**  | Move the focus indicator (alternate)    |
| **Enter** / **Space**          | Place piece on the focused cell         |
| **R**                          | New round (after win / draw)            |
| **N**                          | Cycle through modes (PvP → Easy → …)    |
| **1** / **2** / **3** / **4**  | Jump to PvP / Easy / Medium / Hard      |
| **T**                          | Toggle icon style (Stones ↔ Teeth)      |
| **Esc**                        | Reset session scores                    |

Arrow keys call `preventDefault()` so the page never scrolls during play. Cells are real `<button>` elements with `aria-label`s ("Row 8, column 8, black stone"), so screen readers and `Tab` navigation work natively. Focus clamps at the edges of the 15 × 15 grid — pressing Right on column 15 stays at column 15, no row-wrap.

## 🎯 Scoring

Gomoku has no continuous score, so this game tracks three things instead:

| Stat               | Meaning                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| **Session scores** | `{ Black wins, White wins, draws }` for the current mode. Resets on mode change. |
| **Current streak** | Consecutive **human** wins in the current session. Resets on loss or draw.    |
| **Best streak**    | Longest human win streak ever, across all modes. Persisted in `localStorage`. |

The best streak is stored under `gomoku.highScore` and only written when strictly higher than the previous best — it never decreases. Clear your site data to reset it.

## ⚫⚪ Stones & teeth

The game ships with **two visual styles**, switchable from the header toggle or the **T** key:

- ⚫⚪ **Stones** *(default)* — traditional black and white go-style stones with radial gradients and a soft drop shadow, drawn in inline SVG over a warm wood-tone goban.
- 🦷 **Teeth** — black and white tooth silhouettes in the same positions, sharing the goban background.

The chosen style is persisted under `gomoku.iconStyle` in `localStorage`, so refreshing the page keeps your preference. The internal model is unchanged (the marks are still `'B'` and `'W'`); only the rendering swaps.

Default tokens (overridable from the portal):

| Variable                       | Default                  | Use                       |
| ------------------------------ | ------------------------ | ------------------------- |
| `--gmk-board-bg`               | `#d8a865`                | warm wood goban           |
| `--gmk-grid-line`              | `rgba(60, 38, 14, 0.85)` | hairline grid + star pts  |
| `--gmk-last-move`              | `#ef4444`                | last-move accent dot      |
| `--gmk-win-line`               | `#10b981`                | winning line strikethrough|
| `--gmk-tooth-black-fill`       | `#1c1c1f`                | black tooth body          |
| `--gmk-tooth-white-fill`       | `#f6f0dc`                | white tooth body          |

## 🧪 Scripts

| Script                | Purpose                                |
| --------------------- | -------------------------------------- |
| `npm run dev`         | Start the local dev server (Vite)      |
| `npm run build`       | Type-check and produce a prod bundle   |
| `npm run preview`     | Preview the production build           |
| `npm run typecheck`   | Run `tsc --noEmit`                     |
| `npm run lint`        | Run ESLint across the project          |

## 🏗️ Architecture

Logic lives outside presentation. **`src/logic/*` and `src/hooks/*` never import from `components/`** — that's what makes this package drop-in for the [`Arcade-Game-Center`](https://github.com/ZoliQua/Arcade-Game-Center) monorepo.

```
src/
  logic/             pure game rules — no React, no DOM
    types.ts            Stone, Cell, Board (length-225 readonly array), GameState, GameAction
    constants.ts        BOARD_SIZE=15, WIN_LENGTH=5, AI_DELAY_MS=350, AI_HARD_BUDGET_MS=250, ...
    grid.ts             index ↔ (row, col), getEmptyCells, isFull, getCandidateCells
    win.ts              checkWinAt(board, lastIndex), isDraw(board)
    patterns.ts         pattern detection (live4 / dead4 / live3 / ...) + leaf evaluator
    ai.ts               easy / medium / hard with α-β + iterative deepening; RNG injected
    game.ts             advanceGame(state, action, ctx) reducer + createInitialState
  hooks/
    useKeyboardSelect.ts    arrow/WASD/Enter/R/N/1–4/T/Esc; preventDefault on arrows
    useAITurn.ts            cancellable setTimeout dispatching `aiMove`
    useBestStreak.ts        localStorage-backed best streak, write-on-new-best only
    useElapsedSeconds.ts    mm:ss round timer; pauses on won / draw
    useIconStyle.ts         localStorage-backed stones ↔ teeth preference
  components/
    GameBoard.tsx       15×15 CSS grid + 225 Cell children + GobanBackground + WinningLine
    Cell.tsx            <button> + aria-label + Stone or ToothIcon when filled + last-move dot
    Stone.tsx           SVG stone, black / white variant, radial gradient + drop shadow
    ToothIcon.tsx       SVG tooth, black / white variant, currentColor-themable
    GobanBackground.tsx absolutely positioned SVG: 15×15 hairline grid + 9 star points
    WinningLine.tsx     absolutely positioned SVG line, stroke-dashoffset reveal
    ScoreBoard.tsx      Black / White / draws + streak + best + status + timer
    GameControls.tsx    new round / reset session scores
    ModeSelect.tsx      PvP / Easy / Medium / Hard segmented control
    IconStyleToggle.tsx Stones ↔ Teeth pill toggle
    Overlay.tsx         won / draw overlay
  styles/
    gmk.css             every selector scoped under .gmk-app
    page.css            standalone-only chrome (deleted on portal integration)
  GomokuGame.tsx        root for both standalone AND portal; wraps in .gmk-app
  App.tsx               standalone-only chrome (footer, page title)
  main.tsx              standalone-only React entry
  index.ts              library entry — exports { GomokuGame }
```

The dual-root layout (`GomokuGame.tsx` + `App.tsx` + `index.ts`) means **zero refactoring** when this game is moved into the [`Arcade-Game-Center`](https://github.com/ZoliQua/Arcade-Game-Center) monorepo as the 5th game — the portal renders `<GomokuGame />` directly inside its shell.

## 🧩 Sister projects

- 🐍 [Snake-Game](https://github.com/ZoliQua/Snake-Game)
- 🟦 [Tetris-Game](https://github.com/ZoliQua/Tetris-Game)
- 🔢 [2048-Game](https://github.com/ZoliQua/2048-Game)
- 🦷 [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game)
- 🕹️ [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) — the portal that hosts them all

## ⚖️ License

Released under the [MIT License](./LICENSE). © 2026 Zoltan Dul.

---

<p align="center">Made with ⚫⚪ by Zoltan Dul</p>
