# Gomoku Game — CLAUDE.md

## Project Facts

* **Repository (standalone)**: `https://github.com/ZoliQua/Gomoku-Game`
* **Portal repo**: <https://github.com/ZoliQua/Arcade-Game-Center> — this game ships embedded as the **5th game**. It follows the shared arcade standard (`src/arcade/` kit, Snake-Game is the reference implementation).
* **Sister projects**:
  + <https://github.com/ZoliQua/Snake-Game>
  + <https://github.com/ZoliQua/Tetris-Game>
  + <https://github.com/ZoliQua/2048-Game>
  + <https://github.com/ZoliQua/Tic-Tac-Toe-Game>
  Mirror their architecture, hook patterns, and conventions unless a Gomoku-specific reason dictates otherwise.
* **Plan**: `GAME-PLAN.md` holds the original v1 design, AI specification and roadmap (historical; this file and the code win on conflicts).
* **Stack**: React 18.3, Vite 5.4, TypeScript 5.6, ESLint 9 flat config, Vitest 2.1 + jsdom + Testing Library — identical to Snake-Game. Styles are CSS Modules (`GomokuGame.module.css`, `components/GameBoard.module.css`) on top of the kit's `arcade.css`; no global selectors.
* **Package manager**: npm. **Node**: >=20. Package `gomoku-game`, version 2.0.0.
* **Scripts**:
  + `npm run dev` / `build` (`tsc -b && vite build`) / `preview`
  + `npm run typecheck` — `tsc -b`
  + `npm run lint` — ESLint
  + `npm test` — Vitest (logic + component tests); `npm run test:watch`
  + `npm run check` — lint → typecheck → test → build (same as CI)
* **Arcade id**: `gomoku`, colour token `--game-gomoku`. `App.tsx` is exactly `<ArcadeShell gameId="gomoku"><GomokuGame /></ArcadeShell>`.
* **Board**: fixed **15 × 15** (`Board = readonly Cell[]`, length 225).
* **Stones**: `'B'` / `'W'`; the human is always Black. Loser-goes-first between rounds (draw / abandoned round → alternate).
* **Modes**: `'pvp'`, `'easy'` (random near-stone), `'medium'` (pattern heuristic), `'hard'` (heuristic + α-β, iterative deepening 2/4, 250 ms budget).
* **Win**: 5-or-more in a row in 4 directions; free-Gomoku — overlines (6+) **win**. Win check only on the lines through the last stone, then the draw check.
* **Status / arcade mapping**: logic `idle → playing ⇄ paused → won | draw`. Arcade: `idle` (before the first round only) · `running` (`playing`) · `paused` · `gameOver` (`won`/`draw`). **Each round is one arcade run**; `runKey` = `state.round` (increments on every new round, mode change, reset).
* **Scoring**: only `duelRoundScore` from the kit (`logic/scoring.ts`): difficulty = mode (`null` for PvP → `ranked: false`), moves = stones on board, boardCells = 225, outcome from the human side (PvP: `draw` if drawn else `win`). The reducer stores `roundScore` (0 while in play) and adds it to `points` (match total). `useArcadeRun` gets `score = roundScore`.
* **Stat panel**: Points (match), Best (`stats.best`, best single ranked round), W–L–D (B–W–D in PvP), Streak (current · best for the mode), Time (`useRunTimer`, per round, pause-aware).
* **Session**: `arcade.session.gomoku`, schema 1, validated by `isGomokuState` (logic/persist.ts). Saved whenever status ≠ `idle` — including after a finished round, so the match (tally, points, streak) survives between rounds. Restore is always paused + "Welcome back"; a save of a finished round resumes as the next empty round (never re-scored). Discarded only on Reset match / Discard (both return to `idle`).
* **Local settings keys (unchanged)**: `gomoku.iconStyle`, `gomoku.aiSpeed`, `gomoku.soundEnabled`, `gomoku.highScore.<mode>` (best **streaks**; legacy `gomoku.highScore` migrates to Hard). The registry must **not** declare `gomoku.highScore` as `legacyBestKey` — it is a streak, not a score.
* **Keys**: arrows/WASD cursor · Space/Enter primary (start / place / resume / next round) · P/Esc pause · R new round · N / 1–4 mode · I stones↔teeth · C reset match (Enter confirm, Esc cancel). T is the arcade theme key — never bind it.
* **AI delay**: Instant / 150 / 350 / 1000 ms (`useAIDelay`). `useAITurn` cancels on move, pause, new round, mode change, confirm dialog and unmount.
* **Sound**: Web Audio cues in `GomokuGame` only — never in the demo.
* **Demo**: `GomokuDemo` — Medium vs Medium (3 random opening plies) on the real reducer, 300 ms per ply, restart 1.5 s after a round; `GameBoard variant="mini"` (no buttons, CSS discs); no keys, stats, saves, sound or storage writes.
* **No game loop**: state advances only on input and the AI's delayed dispatch.
* **Rendering**: DOM grid of buttons; inline SVG for goban lines, star points, stones/teeth and the winning line. No canvas.
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

Logic lives outside presentation. **`src/logic/*` and `src/hooks/*` may not import from `react-dom` or `src/components/*`**; they may import the vendored kit (`../arcade`).

```
src/
  arcade/              VENDORED kit from Arcade-Game-Center/packages/kit — never edit here
  logic/
    constants.ts       BOARD_SIZE, WIN_LENGTH, AI budgets, MODE_LABEL, storage key prefix
    types.ts           Stone, Cell, Board, GameStatus, Mode, GameState, GameAction
    grid.ts win.ts patterns.ts ai.ts
    game.ts            advanceGame reducer, createInitialState, arcadeStatusOf, isHumanTurn
    scoring.ts         outcomeOf / roundScoreFor (duelRoundScore)
    persist.ts         isGomokuState validator, restoreSavedState
    autopilot.ts       demo driver
    testUtils.ts       test helpers (boards, seeded RNG, draw board)
    *.test.ts
  hooks/               useAITurn, useGomokuKeys, useBestStreak, useAIDelay, useIconStyle, useSound
  components/          GameBoard (+ .module.css, full | mini), Cell, Stone, ToothIcon,
                       GobanBackground, WinningLine, ModeSelect, AISpeedToggle, IconStyleToggle, SoundToggle
  demo/GomokuDemo.tsx  landing-page attract mode
  GomokuGame.tsx       embeddable game (ArcadeGameProps) + GomokuGame.module.css + GomokuGame.test.tsx
  App.tsx main.tsx     standalone page (ArcadeShell; main imports arcade.css, applies theme)
  index.ts             exports { GomokuGame, GomokuDemo, default } + types
  test/setup.ts        Vitest setup (copied from Snake-Game)
```

Stats, Best, session autosave, theme, score panel and overlays come from `src/arcade/`. Change the kit only in Arcade-Game-Center and sync it. The same `src/` is mirrored into `Arcade-Game-Center/apps/gomoku/` once integrated — keep them identical.

A central pure reducer — `advanceGame(state, action, ctx): GameState` — owns every transition; `ctx: { rng }` keeps AI moves deterministic in tests.

---

## Type Model

```ts
type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'draw';
type GameState = {
  board: Board; current: Stone; status: GameStatus;
  winner: Stone | null; winningLine: readonly number[] | null; lastMoveIndex: number | null;
  mode: Mode; humanStone: Stone; startingStone: Stone;
  scores: { black: number; white: number; draws: number };   // match tally
  bestStreaks: Record<Mode, number>; currentStreak: number;
  moveCount: number; focusIndex: number;
  points: number;      // match total of round scores
  roundScore: number;  // last finished round (0 while in play)
  round: number;       // arcade run key
};
type GameAction =
  | { type: 'start' } | { type: 'pause' } | { type: 'resume' }
  | { type: 'place'; index: number }   // human turns only
  | { type: 'aiMove' } | { type: 'newRound' } | { type: 'changeMode'; mode: Mode }
  | { type: 'resetMatch' } | { type: 'focus'; index: number };
```

---

## Game Modes & AI (summary — full spec in GAME-PLAN.md)

| Mode      | Player 1 (B)      | Player 2 (W)            | Beatable?           |
| --------- | ----------------- | ----------------------- | ------------------- |
| `pvp`     | Human             | Human (same device)     | Yes, by either      |
| `easy`    | Human             | AI (random near-stone)  | Yes, almost always  |
| `medium`  | Human             | AI (greedy heuristic)   | Yes, with effort    |
| `hard`    | Human             | AI (α-β + heuristic)    | Beatable but hard   |

**Hard AI is not unbeatable** — Gomoku without Renju restrictions is a Black-favored game, and a v1 α-β AI with depth 4–6 will lose to a strong human. This is intentional for v1; stronger play (VCF/VCT search, opening book, deeper search) is a v1.1 question.

Pure logic is RNG-injected. `bestMove(board, stone, mode, rng)` accepts a `() => number` so `easy` is deterministic in tests. `Math.random` is only invoked at the call sites (`GomokuGame`, `GomokuDemo`), never inside `src/logic/*`.

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
* **Mode change starts a new match, not a new best**: `changeMode` zeros tally, points and `currentStreak`; best streaks and stats are preserved. Selecting the current mode is a no-op.
* **Human input never plays for the AI**: `place` is rejected on the AI's turn.
* **Pause blocks everything**: no `place`, no `aiMove`, timer stopped.
* **Each round recorded exactly once** (`useArcadeRun`, runKey = round); a restored finished round is converted to the next round, never re-recorded.
* **Keyboard hygiene**: single `keydown` listener per mount (`useGomokuKeys`, handlers via ref), starts with `shouldIgnoreKey`, arrows call `preventDefault`, cursor clamps at the edges.
* **Portal-purity** of `logic/` and `hooks/`: no imports from `react-dom` or `src/components/*`.
* **CSS scope tightness**: CSS Modules only; no `:root`, `body`, `*` or bare element selectors. Colours from kit tokens (wood/stones/teeth are identity colours). Must read well in dark and light themes.
* **Initial state**: `createInitialState()` returns an empty 225-cell board, `current: 'B'`, `status: 'idle'`, `mode: 'pvp'`, all-zero tally/points, `round: 0`; the component seeds `bestStreaks` from `localStorage`.
* **Demo purity**: no keyboard listeners, stats, sessions, sound or storage writes; frozen when `active === false`.

---

## Working Rules (short)

* **Verify before and after every non-trivial change.** Read the target file and its neighbours. After the edit, re-check imports, signatures, call sites, and state transitions.
* **No hallucination.** Do not invent files, hooks, or scripts. If something is not verified, say so explicitly.
* **Small, local, reversible changes.** One fix or one feature at a time.
* **Preserve architecture.** No changes to Vite config, `tsconfig`, folder layout, styling approach, or rendering strategy without a stated reason and approval. Toolchain must stay identical to Snake-Game.
* **No new dependencies** without justification. Default is React + Vite + TS only.
* **Pure logic is RNG-injected.** `bestMove` and any randomized helper accept an RNG.
* **Portal-purity is a hard rule.** `src/logic/*` and `src/hooks/*` may not import from `react-dom` or `src/components/*`. Never edit `src/arcade/`.
* **End-of-task report**: changed files, verified checks, unverified gaps, real risks only.

---

## Git & Commit Rules

- Commit **only** as `Zoltán Dul <zoltan.dul@gmail.com>` (the global git identity).
- **Never** add `Co-Authored-By: Claude …`, "Generated with Claude Code" or any AI attribution
  to commit messages or pull-request descriptions.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
