# ⚫⚪ Gomoku — Fünf in einer Reihe

[English](README.md) · **Deutsch** · [Magyar](README.hu.md)

Ein minimalistisches, typsicheres **Gomoku** (Fünf in einer Reihe) auf einem **15 × 15-Goban**, gebaut mit **React 18**, **Vite** und **TypeScript** — für Tastatur und Touch, ein DOM-Raster, kein Canvas, keine Spiel-Engine. Spiele gegen einen Freund oder gegen drei KI-Stufen bis hin zum α-β-Minimax, mit einem Klick zwischen **Steinen und Zähnen** wechseln.
Läuft eigenständig **und** als eines der fünfzehn Spiele von **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)**.

[![CI](https://github.com/ZoliQua/Gomoku-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Gomoku-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Inhaltsverzeichnis

- [Die Zoltan's-Arcade-Familie](#-die-zoltans-arcade-familie)
- [Features](#-features)
- [Schnellstart](#-schnellstart)
- [Steuerung](#%EF%B8%8F-steuerung)
- [Wertung & Statistiken](#-wertung--statistiken)
- [Autosave & Fortsetzen](#-autosave--fortsetzen)
- [Einbindung in Arcade-Game-Center](#-einbindung-in-arcade-game-center)
- [So funktioniert es](#-so-funktioniert-es)
- [Spielmodi & KI](#-spielmodi--ki)
- [Steine & Zähne](#-steine--zähne)
- [Skripte](#-skripte)
- [Architektur](#%EF%B8%8F-architektur)
- [Mitmachen](#-mitmachen)
- [Lizenz](#%EF%B8%8F-lizenz)

## 🕹️ Die Zoltan's-Arcade-Familie

Jedes Spiel ist ein eigenständiges Repo, das sich auch ins Portal einklinkt. Alle teilen sich ein Designsystem, ein Wertungsmodell und ein Speicherformat über das mitgelieferte Kit [`src/arcade/`](./src/arcade).

| Spiel | Repo | Genre |
| --- | --- | --- |
| 🏠 **Arcade-Portal** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | Alle Spiele an einem Ort, Live-Demos, Statistiken, Bestenliste |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Arcade |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reflex |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Puzzle |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Labyrinth |
| ⚫ **Gomoku** (dieses Repo) | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Strategie |
| 🦷 Tic-Tac-Toe | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Duell |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Schläger |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Shooter |
| 🔴 Vier gewinnt | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Duell |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Sortieren |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Karten |
| 💣 Minesweeper | [Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game) | Logik |
| ♠️ Solitaire | [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game) | Karten |
| 🎴 Ulti | [Ulti-Game](https://github.com/ZoliQua/Ulti-Game) | Karten |
| 🂡 Snapszer | [Snapszer-Game](https://github.com/ZoliQua/Snapszer-Game) | Karten |

## ✨ Features

- ⚫⚪ **Klassischer 15 × 15-Goban** mit feinem Raster und 9 Sternpunkten, als Inline-SVG gezeichnet
- 🎮 **Vier Modi** — PvP (am selben Gerät), Leicht (zufällige KI neben bestehenden Steinen), Mittel (Muster-Heuristik), Schwer (α-β-Minimax mit iterativer Vertiefung)
- 🏆 **Einheitliche Arcade-Wertung** — jede Runde wird mit der gemeinsamen Duell-Formel gewertet; Punkte, Bestwert, S–N–U, Serie und Zeit in einem Panel
- 🔥 **Beste Serien pro Modus** — PvP / Leicht / Mittel / Schwer führen jeweils ihren eigenen Rekord
- 🔄 **Verlierer beginnt** — der Verlierer der letzten Runde eröffnet die nächste (bei Unentschieden wechselt der Beginn)
- ⏸️ **Pause** (P / Esc) friert Eingabe, KI und Zeit ein
- 💾 **Autosave & Fortsetzen** — das ganze Match (Brett, Bilanz, Punkte, Serie) übersteht Neuladen und Tab-Wechsel im Portal
- ⚡ **KI-Verzögerung** — sofort / 0,15 s / 0,35 s / 1 s, wird gespeichert
- 🔔 **Optionaler Ton** — per Web Audio erzeugte Klick-, Sieg- und Unentschieden-Signale, standardmäßig aus
- 📖 **Regeln-Dialog** mit Diagramm zu „Fünf in einer Reihe“ (beim Öffnen pausiert die Runde), ein **Beenden**-Knopf, der die Runde vorzeitig beendet und ihre Punktzahl wertet, und ein **Vollbild**-Knopf
- 📱 **Handy-tauglich** — Kreuzung antippen, das Brett nutzt die volle Bildschirmbreite (Felder von mindestens 24 px bei 360 px), Ring-Markierung für den letzten Zug, Vollbildmodus auf dem iPhone
- 🎯 **Ring-Markierung für den letzten Zug** und eine animierte Gewinnlinie
- 🌗 **Dunkles / helles Design**, geteilt mit allen Arcade-Spielen (Taste **T**)
- 🌍 **Drei Sprachen** — Englisch, Ungarisch und Deutsch; umschaltbar in der oberen Leiste oder in den Einstellungen (auch per `?lang=en|hu|de` für Links); Zahlen folgen der Gruppierung der jeweiligen Sprache
- 🦷 **Zahnmodus** — ein Schalter „Zahnmodus“ / „Fogas mód“ / "Dental mode" in den Einstellungen, standardmäßig aus (oder `?dental=1`), arcade-weit geteilt: Die Steine werden zu Zähnen (der frühere Schalter Steine ↔ Zähne ist jetzt der gemeinsame Modus; eine alte Wahl `gomoku.iconStyle = 'tooth'` wird einmalig nach `arcade.dental` übernommen); nur Darstellung
- 🤖 **Attract-Mode-Demo** (`<GomokuDemo />`) — die echte Engine, Mittel-KI gegen Mittel-KI, auf der Startseite des Portals
- ⌨️ **Tastatur zuerst**; Hotkeys werden ignoriert, solange du in ein Formularfeld tippst
- 🧪 **Getestet** — Regeln, KI, Wertung, Speicher-Validierung und Komponentenverhalten mit Vitest + Testing Library

## 🚀 Schnellstart

Benötigt **Node ≥ 20** und npm.

```bash
git clone https://github.com/ZoliQua/Gomoku-Game.git
cd Gomoku-Game
npm install
npm run dev          # http://localhost:5173
```

Produktions-Build: `npm run build && npm run preview`. Der Build nutzt relative Asset-Pfade, daher kann `dist/` aus jedem Unterordner ausgeliefert werden.

## ⌨️ Steuerung

| Taste | Aktion |
| --- | --- |
| 🖱️ Klick / Touch | Stein auf diese Kreuzung setzen |
| ⬆️ ⬇️ ⬅️ ➡️ / **W A S D** | Cursor bewegen (stoppt am Rand, kein Umbruch) |
| **Leertaste** / **Enter** | Start · auf den Cursor setzen · weiter · nächste Runde |
| **P** / **Esc** | Pause / weiter |
| **R** | Neue Runde (das Match bleibt) |
| **N** · **1–4** | Modi durchschalten · direkt zu PvP / Leicht / Mittel / Schwer (startet ein neues Match) |
| **I** | Steine ↔ Zähne umschalten |
| **C** | Match zurücksetzen (fragt vorher: **Enter** bestätigt, **Esc** bricht ab) |
| **T** | Dunkles / helles Design umschalten (eigenständige Seite) |

**Auf dem Handy:** Tippe auf die gewünschte Kreuzung; das Brett reicht von Rand zu Rand, jede Kreuzung ist also auch bei 360 px mindestens 24 px breit. Der Stein mit einem Ring ist der letzte Zug. Die Knöpfe **Regeln**, **Beenden** und **Vollbild** findest du im Panel „Spiel“. Auf dem iPhone füge die Seite zum Home-Bildschirm hinzu, dann siehst du sie ohne Browserleisten. **Beenden** beendet die Runde sofort und wertet die Rundenpunktzahl (0, solange die Runde läuft); die Taste **R** bleibt die Taste für die neue Runde, der Regeln-Dialog öffnet sich daher nur über seinen Knopf.

Pfeiltasten rufen `preventDefault()` auf, damit die Seite während des Spiels nie scrollt. Felder sind echte `<button>`s mit Beschriftungen wie „Reihe 8, Spalte 8, schwarzer Stein“.

> Geändert in 2.0: **Esc** pausiert jetzt (Arcade-Standard), statt die Punkte zurückzusetzen; das Zurücksetzen liegt beim Knopf **Match zurücksetzen** / **C** (dieselbe Taste wie bei Tic-Tac-Toe); der Symbol-Schalter wanderte von **T** (jetzt die Arcade-Design-Taste) auf **I**.

## 🎯 Wertung & Statistiken

Jede Runde ist ein Arcade-Lauf und wird mit dem gemeinsamen `duelRoundScore` des Kits gewertet (gleiche Skala wie Tic-Tac-Toe):

| Ergebnis (deine Seite) | Punkte |
| --- | --- |
| Sieg | Basis × (1 + leerer Anteil der 225 Felder) — ein schneller Sieg bringt bis zum 2-Fachen der Basis |
| Unentschieden | Basis ÷ 4 |
| Niederlage | 0 |

| Modus | Leicht | Mittel | Schwer | PvP |
| --- | --- | --- | --- | --- |
| Basis | 100 | 250 | 500 | ungewertet (0) |

Beispiel: Ein Sieg im Modus Mittel mit dem 9. Stein auf dem Brett → 250 × (1 + 216/225) = **490**.

Das Statistik-Panel zeigt **Punkte** (Match-Summe), **Bestwert** (beste Einzelrunde aller Zeiten), **S–N–U** (S–W–U bei PvP), **Serie** (aktuell · beste im Modus) und **Zeit** (der Runde, pausenbewusst).
Beendete Runden werden einmal in `localStorage` unter `arcade.stats.gomoku` erfasst (`best`, `plays`, `wins`, `totalScore`, `totalSeconds`, …).
PvP-Runden werden nicht gewertet: Sie zählen nur als Spiele und berühren weder den Bestwert noch die Bestenliste.
Beste Serien pro Modus liegen unter `gomoku.highScore.<mode>` (ein historischer Schlüsselname — er speichert Serien, keine Punkte).

## 💾 Autosave & Fortsetzen

Das ganze Match wird etwa einmal pro Sekunde gespeichert sowie beim Ausblenden der Seite und beim Unmount des Spiels
(Schlüssel `arcade.session.gomoku`, mit Schema-Version und beim Laden streng validiert — Brett, Steinanzahl, Zugrecht und
Gewinnstatus müssen zusammenpassen). Beim Neuladen erscheint **Willkommen zurück** mit pausiertem Match. Anders als bei Highscore-Spielen
löscht eine beendete Runde den Speicherstand **nicht**: Bilanz und Punkte des Matches bleiben zwischen den Runden erhalten, und ein Stand direkt nach einer Runde
wird als nächste, leere Runde fortgesetzt (die beendete Runde wird nie doppelt gewertet). Der Stand wird nur durch
**Match zurücksetzen**, **Verwerfen** neben dem Badge *Automatisch gespeichert* oder **Beenden** (das die Runde vorzeitig beendet) verworfen.

## 🧩 Einbindung in Arcade-Game-Center

```tsx
import { GomokuGame, GomokuDemo } from '@arcade/gomoku';

<GomokuGame
  embedded                                   // Seitentitel ausblenden; das Portal zeigt ihn
  onGameOver={(score) => submitScore('gomoku', score)}   // nur gewertete Runden mit Punkten (oder vorzeitig beendete)
  onRunEnd={(run) => log(run.outcome, run.ranked)}       // jede beendete Runde
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<GomokuDemo active={cardIsVisible} />         // Attract-Mode für die Startseite
```

Beide Komponenten folgen dem gemeinsamen Vertrag `ArcadeGameProps` / `ArcadeDemoProps` aus `src/arcade/types.ts`.
Status-Zuordnung: `idle` (vor der ersten Runde) · `running` (Runde läuft) · `paused` · `gameOver` (Runde gewonnen, unentschieden oder vorzeitig beendet);
der Lauf-Schlüssel ist der Rundenzähler, `score` sind die Punkte der Runde (0, bis sie endet).

## 🧠 So funktioniert es

```
idle ─(start)→ playing ⇄ paused
                 ├─ fünf oder mehr in einer Reihe ─→ won ──────┐
                 ├─ 225 Steine, keine Fünf ────────→ draw ─────┼─(neue Runde)→ playing
                 └─ Vorzeitig beenden ─────────────→ finished ─┘
```

`advanceGame(state, action, ctx): GameState` besitzt jeden Übergang:

1. **`place`** — nur menschliche Eingabe: setzt den Stein der Seite am Zug auf eine leere Kreuzung; spielt nie für die KI.
2. **`aiMove`** — `bestMove(board, stone, mode, rng)`; der Zufallsgenerator wird injiziert, damit Tests deterministisch sind.
3. **Erst die Gewinnprüfung** — `checkWinAt(board, lastIndex)` prüft nur die vier Linien durch den letzten Stein. Danach die Unentschieden-Prüfung (volles Brett). Ein gewinnender 225. Stein ist ein Sieg, nie ein Unentschieden.
4. **Rundenende** — Bilanz, Serie (nur Siege des Menschen), beste Serie (sinkt nie) und die Rundenpunktzahl (`duelRoundScore`) werden zu den Match-Punkten addiert.
5. **`newRound`** — leeres Brett, Verlierer eröffnet, Match bleibt. **`changeMode`** startet ein neues Match. **`resetMatch`** kehrt zu idle zurück.
6. **`finish`** — Vorzeitig beenden: Die Runde endet ohne Sieger und bringt 0 Punkte; sie wird mit dem Ergebnis `finished` gemeldet (die Punktzahl kommt auch bei 0 in die Bestenliste) und der Speicherstand wird verworfen.
7. **`pause` / `resume`** — in der Pause sind `place` und `aiMove` wirkungslos, und `useAITurn` bricht seinen Timer ab.

`useAITurn` löst `aiMove` nach der gewählten Verzögerung aus; ein Zug, eine Pause, eine neue Runde, ein Moduswechsel oder Unmount bricht es ab.
`useGomokuKeys` hängt einen einzigen Window-Listener für die Lebensdauer der Komponente an.

## 🤖 Spielmodi & KI

| Modus | Schwarz | Weiß | Schlagbar? |
| --- | --- | --- | --- |
| **PvP** | Mensch | Mensch (am selben Gerät) | Von beiden Spielern |
| **Leicht** | Mensch | KI (zufällig neben Steinen) | Fast immer |
| **Mittel** | Mensch | KI (Muster-Heuristik, gierig) | Mit Mühe |
| **Schwer** | Mensch | KI (α-β + iterative Vertiefung) | **Schlagbar**, spielt aber solide Drohungen |

**Schwer ist nicht unschlagbar** — freies Gomoku (ohne Renju-Beschränkungen, Überlängen gewinnen) begünstigt Schwarz, und eine α-β-Suche mit Tiefe 4 und handgestimmter Heuristik verliert gegen einen starken Menschen.

Mittel folgt einer 5-stufigen Priorität: **sofort gewinnen → Sieg blocken → offene Vier bilden → offene Vier blocken → Heuristik-Maximum** über leere Felder im Chebyshev-Abstand 2 zu irgendeinem Stein. Schwer nutzt dieselbe Heuristik als Blattbewertung im α-β-Minimax mit iterativer Vertiefung (Tiefen 2, 4), einem Budget von 250 ms und einer Verzweigungsgrenze von 12 bestsortierten Zügen pro Halbzug. Die Demo nutzt für beide Seiten Mittel (wenige ms pro Zug) nach drei zufälligen Eröffnungszügen.

## ⚫⚪ Steine & Zähne

- ⚫⚪ **Steine** *(Standard)* — Go-Steine mit Radialverläufen auf einem warmen Holz-Goban.
- 🦷 **Zähne** — der arcade-weite **Zahnmodus**: schwarze Backenzähne und weiße Schneidezähne (verschiedene Formen, nicht nur Farben) auf denselben Positionen.

Umschalten mit der Zeile **Zahnmodus** in den **Einstellungen**, in der oberen Arcade-Leiste oder mit **I**; gespeichert in der gemeinsamen Einstellung `arcade.dental`. Eine alte Wahl `gomoku.iconStyle = 'tooth'` wird einmalig übernommen (nur wenn der Zahnmodus nie gesetzt wurde) und der alte Schlüssel entfernt. Das Modell bleibt unverändert (`'B'` / `'W'`), nur das Rendering wechselt.
Brett-Token (`--gmk-board-bg`, `--gmk-grid-line`, `--gmk-tooth-*`) liegen auf dem Brettrahmen in `GameBoard.module.css`; der Ring des letzten Zugs und die Gewinnlinie nutzen die Kit-Werte `--danger` / `--ok`.

## 🧪 Skripte

| Skript | Zweck |
| --- | --- |
| `npm run dev` | Vite-Entwicklungsserver |
| `npm run build` | Typprüfung (`tsc -b`) und Produktions-Build |
| `npm run preview` | Produktions-Build ausliefern |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (Logik- und Komponententests) |
| `npm run check` | lint → typecheck → test → build (was die CI ausführt) |

## 🏗️ Architektur

```
src/
  arcade/            mitgeliefertes Zoltan's-Arcade-Kit — hier nicht bearbeiten (siehe dessen README)
  logic/             reine Spielregeln — kein React, kein DOM
    types.ts constants.ts grid.ts win.ts patterns.ts
    ai.ts            leicht / mittel / schwer (α-β + iterative Vertiefung), RNG injiziert
    game.ts          advanceGame-Reducer + createInitialState + arcadeStatusOf
    scoring.ts       Rundenergebnis + duelRoundScore-Wrapper
    persist.ts       strenger Validator für gespeicherte Sitzungen + Wiederherstellung
    autopilot.ts     Demo-Treiber (Mittel gegen Mittel auf dem echten Reducer)
    *.test.ts        Regeln, KI, Wertung, Persistenz, Demo
  hooks/             useAITurn, useGomokuKeys, useBestStreak, useAIDelay, useIconStyle, useSound
  components/        GameBoard (voll + mini), Cell, Stone, ToothIcon, GobanBackground, WinningLine,
                     ModeSelect, AISpeedToggle, DentalToggle, SoundToggle
  demo/GomokuDemo.tsx Attract-Mode für die Startseite
  rules.tsx          Abschnitte des Regeln-Dialogs + das FiveDiagram
  GomokuGame.tsx     das einbettbare Spiel (ArcadeGameProps)
  App.tsx            eigenständige Seite: <ArcadeShell><GomokuGame/></ArcadeShell>
  main.tsx           Einstieg; lädt arcade.css einmal
  index.ts           Paket-Einstieg für Arcade-Game-Center
```

Die ursprünglichen Designnotizen und die KI-Spezifikation stehen in [GAME-PLAN.md](./GAME-PLAN.md).

## 🤝 Mitmachen

Siehe [CONTRIBUTING.md](./CONTRIBUTING.md), den [Verhaltenskodex](./CODE_OF_CONDUCT.md) und [SECURITY.md](./SECURITY.md).
Mitwirkende stehen in [CONTRIBUTORS.md](./CONTRIBUTORS.md); Änderungen in [CHANGELOG.md](./CHANGELOG.md).

## ⚖️ Lizenz

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Mit ❤️ gemacht von Zoltán Dul · Teil von <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a></p>
