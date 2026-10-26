# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [2.0.0] — 2026-10-24

### Added
- Shared Zoltan's Arcade kit (`src/arcade/`): unified stats, theme, standalone shell and UI (StatPanel, GameOverlay, KeyHelp, SaveBadge).
- Arcade scoring: every round is scored with the kit's `duelRoundScore` (difficulty = mode, moves = stones on the board, 225 cells, outcome from the human side). PvP rounds are unranked (`ranked: false`).
- Stat panel with Points (match total), Best (best single round), W–L–D (B–W–D in PvP), Streak (current · best per mode) and Time.
- `idle` start screen before the first round and **P / Esc pause** that freezes input, the AI and the timer.
- Autosave & resume of the whole match (`arcade.session.gomoku`) with a strict validator; restored paused with **Welcome back**. The match survives between rounds and is dropped only by Reset match / Discard.
- **Reset match** button (and **C**, as in Tic-Tac-Toe) with an in-board confirmation.
- `GomokuDemo` attract mode: Medium vs Medium on the real reducer, one move every 300 ms, restarts 1.5 s after a round.
- `embedded`, `onGameOver`, `onRunEnd` and `onStatusChange` props (shared `ArcadeGameProps` contract).
- Vitest + Testing Library suite (rules incl. edges/overlines/draws, AI, scoring, persist, demo, component behaviour) replacing `scripts/sanity.mjs`; `npm run check`; GitHub Actions CI.
- Code of Conduct, Contributing, Contributors and Security docs, issue/PR templates, game favicon.

### Changed
- The game opens in **Medium** (ranked) mode; PvP is still one key (1) away.
- **Esc** now pauses (arcade standard) instead of opening "reset scores"; reset moved to the Reset match button / **C**. Shift+Esc is gone.
- Icon toggle moved from **T** (now the arcade theme key) to **I**.
- **Space / Enter** also start the first round, resume and open the next round.
- UI rebuilt on the arcade design system (dark & light); board styles moved to a CSS Module, page-level `page.css` and the `.gmk-app` stylesheet removed.
- Toolchain aligned with the arcade games (ESLint 9 flat config via `typescript-eslint`, Vitest 2, jsdom); base path is relative (`base: './'`).
- Settings keys are unchanged: `gomoku.iconStyle`, `gomoku.aiSpeed`, `gomoku.soundEnabled`, `gomoku.highScore.<mode>` (best streaks).

### Fixed
- Pressing Enter / Space during the AI's thinking delay placed a stone **for the AI** (the keyboard path skipped the turn check); `place` now accepts human turns only.
- The winning-line SVG was inset 12 px inside the board grid, so the strike did not line up with the stones; its dash animation now uses `pathLength` so long diagonals are fully drawn.
- Every stone rendered the same two SVG gradient ids (up to 225 duplicate `id`s); ids are now unique per stone.
- Hotkeys fired while typing in form fields and with Cmd/Ctrl held (e.g. Cmd+R started a new round and blocked the browser reload); the keyboard listener was re-attached on every cursor move.
- **T** collided with the arcade theme toggle.
- Clicking the already selected mode wiped the match tally.
- `npm run typecheck` checked nothing (`tsc --noEmit` on the empty solution tsconfig); it now runs `tsc -b`.
- Board colours followed `prefers-color-scheme` instead of the arcade theme, and `page.css` styled `:root` / `body` globally.
- Board `role="grid"` without rows was invalid ARIA; cells are now labelled buttons in a labelled group, and segmented controls use `aria-pressed`.
- Cell click handlers were recreated on every render, defeating `Cell` memoisation.

## [1.0.0] — 2026-04-30

- First release (2026-04-29): 15 × 15 Gomoku with PvP / Easy / Medium / Hard (α-β) modes, stones ↔ teeth toggle, best streak and round timer.
- Feature pack (2026-04-30): loser-goes-first, AI speed setting, per-mode best streaks, Esc confirmation dialog and optional sound effects.
