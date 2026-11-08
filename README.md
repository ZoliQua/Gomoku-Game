# ⚫⚪ Gomoku — Five in a Row

A minimal, type-safe **Gomoku** (Five in a Row) on a **15 × 15 goban**, built with **React 18**, **Vite** and **TypeScript** — keyboard-first, grid-based DOM, no canvas, no game engine. Play a friend or three AI levels up to α-β minimax, with a one-click **stones ↔ teeth** toggle.
Runs on its own **and** as one of the eleven games of **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)**.

[![CI](https://github.com/ZoliQua/Gomoku-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Gomoku-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Table of contents

- [The Zoltan's Arcade family](#-the-zoltans-arcade-family)
- [Features](#-features)
- [Quick start](#-quick-start)
- [Controls](#%EF%B8%8F-controls)
- [Scoring & stats](#-scoring--stats)
- [Autosave & resume](#-autosave--resume)
- [Embedding in Arcade-Game-Center](#-embedding-in-arcade-game-center)
- [How it works](#-how-it-works)
- [Game modes & AI](#-game-modes--ai)
- [Stones & teeth](#-stones--teeth)
- [Scripts](#-scripts)
- [Architecture](#%EF%B8%8F-architecture)
- [Contributing](#-contributing)
- [License](#%EF%B8%8F-license)

## 🕹️ The Zoltan's Arcade family

Every game is a standalone repo that also plugs into the portal. They share one design system, one scoring model and one save format through the vendored [`src/arcade/`](./src/arcade) kit.

| Game | Repo | Genre |
| --- | --- | --- |
| 🏠 **Arcade portal** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | All games in one place, live demos, stats, leaderboard |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reflex |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Puzzle |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Maze |
| ⚫ **Gomoku** (this repo) | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Strategy |
| 🦷 Tic-Tac-Toe | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Duel |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Paddle |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Shooter |
| 🔴 Connect Four | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Duel |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Sorting |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Cards |

## ✨ Features

- ⚫⚪ **Classic 15 × 15 goban** with hairline grid and 9 star points, drawn in inline SVG
- 🎮 **Four modes** — PvP (same device), Easy (random near-stone AI), Medium (pattern heuristic), Hard (α-β minimax with iterative deepening)
- 🏆 **Unified arcade scoring** — every round is scored with the shared duel formula; Points, Best, W–L–D, streak and time in one panel
- 🔥 **Per-mode best streaks** — PvP / Easy / Medium / Hard each keep their own all-time record
- 🔄 **Loser-goes-first** — the previous round's loser opens the next one (draws alternate)
- ⏸️ **Pause** (P / Esc) freezes input, the AI and the timer
- 💾 **Autosave & resume** — the whole match (board, tally, points, streak) survives reloads and portal tab switches
- 🦷 **Stones ↔ Teeth** icon toggle (persisted)
- ⚡ **AI delay** — Instant / 0.15 s / 0.35 s / 1 s, persisted
- 🔔 **Optional sound** — procedural Web Audio click / win / draw cues, off by default
- 🎯 **Last-move marker** and an animated winning-line strike
- 🌗 **Dark / light theme** shared with every arcade game (press **T**)
- 🤖 **Attract-mode demo** (`<GomokuDemo />`) — the real engine, Medium AI vs Medium AI, on the portal's landing page
- ⌨️ **Keyboard-first**; hotkeys are ignored while you type in a form field
- 🧪 **Tested** — rules, AI, scoring, save validation and component behaviour with Vitest + Testing Library

## 🚀 Quick start

Requires **Node ≥ 20** and npm.

```bash
git clone https://github.com/ZoliQua/Gomoku-Game.git
cd Gomoku-Game
npm install
npm run dev          # http://localhost:5173
```

Production build: `npm run build && npm run preview`. The build uses relative asset paths, so `dist/` can be served from any sub-folder.

## ⌨️ Controls

| Key | Action |
| --- | --- |
| 🖱️ Click / touch | Place a piece on that intersection |
| ⬆️ ⬇️ ⬅️ ➡️ / **W A S D** | Move the cursor (clamps at the edges, no wrap) |
| **Space** / **Enter** | Start · place on the cursor · resume · next round |
| **P** / **Esc** | Pause / resume |
| **R** | New round (keeps the match) |
| **N** · **1–4** | Cycle modes · jump to PvP / Easy / Medium / Hard (starts a new match) |
| **I** | Toggle Stones ↔ Teeth |
| **C** | Reset match (asks first: **Enter** confirms, **Esc** cancels) |
| **T** | Toggle dark / light theme (standalone page) |

Arrow keys call `preventDefault()` so the page never scrolls during play. Cells are real `<button>`s with labels such as "Row 8, column 8, black stone".

> Changed in 2.0: **Esc** now pauses (arcade standard) instead of resetting scores, reset moved to the **Reset match** button / **C** (same key as Tic-Tac-Toe); the icon toggle moved from **T** (now the arcade theme key) to **I**.

## 🎯 Scoring & stats

Each round is one arcade run, scored with the kit's shared `duelRoundScore` (same scale as Tic-Tac-Toe):

| Result (your side) | Points |
| --- | --- |
| Win | base × (1 + empty share of the 225 cells) — a quick win pays up to 2 × base |
| Draw | base ÷ 4 |
| Loss | 0 |

| Mode | Easy | Medium | Hard | PvP |
| --- | --- | --- | --- | --- |
| Base | 100 | 250 | 500 | unranked (0) |

Example: winning on Medium with the 9th stone on the board → 250 × (1 + 216/225) = **490**.

The stat panel shows **Points** (the match total), **Best** (best single round ever), **W–L–D** (B–W–D in PvP),
**Streak** (current · best for the mode) and **Time** (the round, pause-aware).
Finished rounds are recorded once in `localStorage` under `arcade.stats.gomoku` (`best`, `plays`, `wins`, `totalScore`, `totalSeconds`, …).
PvP rounds are unranked: they count as plays only and never touch Best or the leaderboard.
Best streaks per mode stay under `gomoku.highScore.<mode>` (a historical key name — it stores streaks, not scores).

## 💾 Autosave & resume

The whole match is saved about once a second and whenever the page is hidden or the game is unmounted
(key `arcade.session.gomoku`, schema-versioned and validated strictly on load — board, stone counts, side to move and
win state must all agree). Reloading shows **Welcome back** with the match paused. Unlike score-attack games, a finished
round does **not** clear the save: the match tally and points carry over between rounds, and a save taken right after a
round resumes as the next, empty round (the finished round is never scored twice). The save is dropped only by
**Reset match** or **Discard** next to the *Autosaved* badge.

## 🧩 Embedding in Arcade-Game-Center

```tsx
import { GomokuGame, GomokuDemo } from '@arcade/gomoku';

<GomokuGame
  embedded                                   // hide the page title; the portal shows it
  onGameOver={(score) => submitScore('gomoku', score)}   // ranked rounds with points only
  onRunEnd={(run) => log(run.outcome, run.ranked)}       // every finished round
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<GomokuDemo active={cardIsVisible} />         // landing-page attract mode
```

Both components follow the shared `ArcadeGameProps` / `ArcadeDemoProps` contract from `src/arcade/types.ts`.
Status mapping: `idle` (before the first round) · `running` (round in play) · `paused` · `gameOver` (round won or drawn);
the run key is the round counter, `score` is the round's points (0 until it ends).

## 🧠 How it works

```
idle ─(start)→ playing ⇄ paused
                 ├─ five or more in a row ─→ won  ─┐
                 └─ 225 stones, no five ───→ draw ─┴─(new round)→ playing
```

`advanceGame(state, action, ctx): GameState` owns every transition:

1. **`place`** — human input only: drops the side to move's stone on an empty intersection; never plays for the AI.
2. **`aiMove`** — `bestMove(board, stone, mode, rng)`; RNG is injected so tests are deterministic.
3. **Win check first** — `checkWinAt(board, lastIndex)` scans only the four lines through the last stone. Then the draw check (full board). A winning 225th stone is a win, never a draw.
4. **Round end** — tally, streak (human wins only), best streak (never decreases) and the round score (`duelRoundScore`) added to the match points.
5. **`newRound`** — empty board, loser opens, match kept. **`changeMode`** starts a new match. **`resetMatch`** returns to idle.
6. **`pause` / `resume`** — while paused, `place` and `aiMove` are no-ops and `useAITurn` cancels its timer.

`useAITurn` dispatches `aiMove` after the chosen delay; a move, pause, new round, mode change or unmount cancels it.
`useGomokuKeys` attaches one window listener for the component's lifetime.

## 🤖 Game modes & AI

| Mode | Black | White | Beatable? |
| --- | --- | --- | --- |
| **PvP** | Human | Human (same device) | By either player |
| **Easy** | Human | AI (random near-stone) | Almost always |
| **Medium** | Human | AI (pattern heuristic, greedy) | With effort |
| **Hard** | Human | AI (α-β + iterative deepening) | **Beatable**, but plays solid threats |

**Hard is not unbeatable** — free Gomoku (no Renju restrictions, overlines count as wins) favours Black, and a depth-4 α-β search with a hand-tuned heuristic will lose to a strong human.

Medium follows a 5-step priority: **win-now → block-win → make-live-four → block-live-four → heuristic argmax** over empty cells within Chebyshev distance 2 of any stone. Hard uses the same heuristic as the leaf evaluator inside α-β minimax with iterative deepening (depths 2, 4), a 250 ms budget and a branching cap of 12 best-ordered moves per ply. The demo uses Medium for both sides (a few ms per move) after three random opening plies.

## ⚫⚪ Stones & teeth

- ⚫⚪ **Stones** *(default)* — go-style stones with radial gradients over a warm wood goban.
- 🦷 **Teeth** — the arcade-wide **Dental mode**: black molars and white incisors (different shapes, not just colours) in the same positions.

Switch with the **Dental mode** row in **Settings**, the arcade top bar, or **I**; stored in the shared `arcade.dental` preference. An old `gomoku.iconStyle = 'tooth'` choice is migrated once (only if dental mode was never set) and the old key removed. The model is unchanged (`'B'` / `'W'`), only rendering swaps.
Board tokens (`--gmk-board-bg`, `--gmk-grid-line`, `--gmk-tooth-*`) live on the board frame in `GameBoard.module.css`; the last-move dot and winning line use the kit's `--danger` / `--ok`.

## 🧪 Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and production build |
| `npm run preview` | Serve the production build |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (logic + component tests) |
| `npm run check` | lint → typecheck → test → build (what CI runs) |

## 🏗️ Architecture

```
src/
  arcade/            vendored Zoltan's Arcade kit — do not edit here (see its README)
  logic/             pure game rules — no React, no DOM
    types.ts constants.ts grid.ts win.ts patterns.ts
    ai.ts            easy / medium / hard (α-β + iterative deepening), RNG injected
    game.ts          advanceGame reducer + createInitialState + arcadeStatusOf
    scoring.ts       round outcome + duelRoundScore wrapper
    persist.ts       strict saved-session validator + restore
    autopilot.ts     demo driver (Medium vs Medium on the real reducer)
    *.test.ts        rules, AI, scoring, persist, demo
  hooks/             useAITurn, useGomokuKeys, useBestStreak, useAIDelay, useIconStyle, useSound
  components/        GameBoard (full + mini), Cell, Stone, ToothIcon, GobanBackground, WinningLine,
                     ModeSelect, AISpeedToggle, DentalToggle, SoundToggle
  demo/GomokuDemo.tsx landing-page attract mode
  GomokuGame.tsx     the embeddable game (ArcadeGameProps)
  App.tsx            standalone page: <ArcadeShell><GomokuGame/></ArcadeShell>
  main.tsx           entry; loads the shared arcade.css once
  index.ts           package entry used by Arcade-Game-Center
```

The original design notes and AI specification are kept in [GAME-PLAN.md](./GAME-PLAN.md).

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md), the [Code of Conduct](./CODE_OF_CONDUCT.md) and [SECURITY.md](./SECURITY.md).
Contributors are listed in [CONTRIBUTORS.md](./CONTRIBUTORS.md); changes in [CHANGELOG.md](./CHANGELOG.md).

## ⚖️ License

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Made with ❤️ by Zoltán Dul · part of <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a></p>
