# ⚫⚪ Amőba (Gomoku) — Öt egy sorban

[English](README.md) · [Deutsch](README.de.md) · **Magyar**

Minimalista, típusbiztos **Gomoku** (amőba, öt egy sorban) **15 × 15-ös gobanon**, **React 18**, **Vite** és **TypeScript** alapokon – billentyűzetre és érintésre is, rácsos DOM, canvas és játékmotor nélkül. Játssz barátod ellen, vagy három gépi szint ellen egészen az α-β minimaxig, és egy kattintással válthatsz **kövek és fogak** között.
Önállóan fut, **és** a **[Zoltan's Arcade](https://github.com/ZoliQua/Arcade-Game-Center)** tizenöt játékának egyike.

[![CI](https://github.com/ZoliQua/Gomoku-Game/actions/workflows/ci.yml/badge.svg)](https://github.com/ZoliQua/Gomoku-Game/actions/workflows/ci.yml)
![license](https://img.shields.io/badge/license-MIT-green)
![node](https://img.shields.io/badge/node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![react](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![typescript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)

---

## 📑 Tartalom

- [A Zoltan's Arcade család](#-a-zoltans-arcade-család)
- [Funkciók](#-funkciók)
- [Gyors kezdés](#-gyors-kezdés)
- [Irányítás](#%EF%B8%8F-irányítás)
- [Pontozás és statisztika](#-pontozás-és-statisztika)
- [Automatikus mentés és folytatás](#-automatikus-mentés-és-folytatás)
- [Beágyazás az Arcade-Game-Centerbe](#-beágyazás-az-arcade-game-centerbe)
- [Hogyan működik](#-hogyan-működik)
- [Játékmódok és gépi ellenfél](#-játékmódok-és-gépi-ellenfél)
- [Kövek és fogak](#-kövek-és-fogak)
- [Parancsok](#-parancsok)
- [Felépítés](#%EF%B8%8F-felépítés)
- [Közreműködés](#-közreműködés)
- [Licenc](#%EF%B8%8F-licenc)

## 🕹️ A Zoltan's Arcade család

Minden játék önálló repó, amely a portálba is beilleszthető. Közös a dizájnrendszerük, a pontozási modelljük és a mentési formátumuk, a becsomagolt [`src/arcade/`](./src/arcade) készleten keresztül.

| Játék | Repó | Műfaj |
| --- | --- | --- |
| 🏠 **Arcade portál** | [Arcade-Game-Center](https://github.com/ZoliQua/Arcade-Game-Center) | Minden játék egy helyen, élő demók, statisztika, ranglista |
| 🧱 Tetris | [Tetris-Game](https://github.com/ZoliQua/Tetris-Game) | Árkád |
| 🐍 Snake | [Snake-Game](https://github.com/ZoliQua/Snake-Game) | Reflex |
| 🔢 2048 | [2048-Game](https://github.com/ZoliQua/2048-Game) | Logikai |
| 🟡 Pac-Man | [Pac-Man-Game](https://github.com/ZoliQua/Pac-Man-Game) | Labirintus |
| ⚫ **Amőba (Gomoku)** (ez a repó) | [Gomoku-Game](https://github.com/ZoliQua/Gomoku-Game) | Stratégia |
| 🦷 Tic-Tac-Toe | [Tic-Tac-Toe-Game](https://github.com/ZoliQua/Tic-Tac-Toe-Game) | Párbaj |
| 🏓 Breakout | [Breakout-Game](https://github.com/ZoliQua/Breakout-Game) | Ütő |
| 👾 Space Invaders | [Space-Invaders-Game](https://github.com/ZoliQua/Space-Invaders-Game) | Lövöldözős |
| 🔴 Négy egy sorban | [Connect-Four-Game](https://github.com/ZoliQua/Connect-Four-Game) | Párbaj |
| 🔩 Nut Sort | [Nut-Sort-Game](https://github.com/ZoliQua/Nut-Sort-Game) | Rendezős |
| 🃏 Texas Hold'em | [Texas-Holdem-Game](https://github.com/ZoliQua/Texas-Holdem-Game) | Kártya |
| 💣 Aknakereső | [Minesweeper-Game](https://github.com/ZoliQua/Minesweeper-Game) | Logika |
| ♠️ Solitaire | [Solitaire-Game](https://github.com/ZoliQua/Solitaire-Game) | Kártya |
| 🎴 Ulti | [Ulti-Game](https://github.com/ZoliQua/Ulti-Game) | Kártya |
| 🂡 Snapszer | [Snapszer-Game](https://github.com/ZoliQua/Snapszer-Game) | Kártya |

## ✨ Funkciók

- ⚫⚪ **Klasszikus 15 × 15-ös goban** hajszálvékony rácsal és 9 csillagponttal, beágyazott SVG-ben rajzolva
- 🎮 **Négy mód** — PvP (ugyanazon az eszközön), Könnyű (véletlenszerű, kő melletti gép), Közepes (mintázat-heurisztika), Nehéz (α-β minimax iteratív mélyítéssel)
- 🏆 **Egységes arcade pontozás** — minden kört a közös párbaj-képlettel pontozunk; Pontok, Legjobb, N–V–D, sorozat és idő egy panelen
- 🔥 **Módonkénti legjobb sorozat** — a PvP / Könnyű / Közepes / Nehéz mind a saját örök rekordját őrzi
- 🔄 **A vesztes kezd** — az előző kör vesztese nyit a következőben (döntetlennél a kezdés váltakozik)
- ⏸️ **Szünet** (P / Esc) megállítja a bevitelt, a gépet és az időt
- 💾 **Automatikus mentés és folytatás** — az egész meccs (tábla, állás, pontok, sorozat) átvészeli az újratöltést és a portálon belüli fülváltást
- ⚡ **Gépi késleltetés** — azonnali / 0,15 s / 0,35 s / 1 s, megjegyezve
- 🔔 **Opcionális hang** — Web Audio-val generált kattintás-, győzelem- és döntetlenhang, alapból kikapcsolva
- 📖 **Szabályok ablak** öt-egy-sorban ábrával (megnyitásakor a kör szünetel), egy **Befejezés** gomb, amely idő előtt lezárja a kört és rangsorolja a pontszámát, valamint egy **Teljes képernyő** gomb
- 📱 **Telefonra kész** — koppints egy metszéspontra, a tábla a képernyő teljes szélességét használja (legalább 24 px-es mezők 360 px-en), gyűrűs jelölő az utolsó lépésen, teljes képernyős mód iPhone-on
- 🎯 **Gyűrűs jelölő az utolsó lépésen** és animált nyerővonal
- 🌗 **Sötét / világos téma**, az összes arcade játékkal közösen (**T** billentyű)
- 🌍 **Három nyelv** — angol, magyar és német; a felső sávban vagy a beállításokban váltható (linkátadáshoz `?lang=en|hu|de` is); a számok az adott nyelv tagolását követik
- 🦷 **Fogas mód** — „Fogas mód” / "Dental mode" / „Zahnmodus” kapcsoló a beállításokban, alapból kikapcsolva (vagy `?dental=1`), az egész arcade-on közös: a kövek fogak lesznek (a korábbi Kövek ↔ Fogak kapcsoló mostantól a közös mód; a régi `gomoku.iconStyle = 'tooth'` választás egyszer átkerül az `arcade.dental` értékbe); csak megjelenés
- 🤖 **Bemutató demó** (`<GomokuDemo />`) — az igazi motor, Közepes gép Közepes gép ellen, a portál nyitóoldalán
- ⌨️ **Billentyűzet az első**; a gyorsbillentyűket figyelmen kívül hagyjuk, amíg űrlapmezőbe gépelsz
- 🧪 **Tesztelve** — szabályok, gépi ellenfél, pontozás, mentés-ellenőrzés és komponensviselkedés Vitesttel + Testing Libraryvel

## 🚀 Gyors kezdés

**Node ≥ 20** és npm szükséges.

```bash
git clone https://github.com/ZoliQua/Gomoku-Game.git
cd Gomoku-Game
npm install
npm run dev          # http://localhost:5173
```

Éles build: `npm run build && npm run preview`. A build relatív elérési utakat használ, így a `dist/` bármelyik almappából kiszolgálható.

## ⌨️ Irányítás

| Billentyű | Művelet |
| --- | --- |
| 🖱️ Kattintás / érintés | Kő lerakása arra a metszéspontra |
| ⬆️ ⬇️ ⬅️ ➡️ / **W A S D** | Kurzor mozgatása (a szélen megáll, nincs átfordulás) |
| **Szóköz** / **Enter** | Indítás · lerakás a kurzorra · folytatás · következő kör |
| **P** / **Esc** | Szünet / folytatás |
| **R** | Új kör (a meccs marad) |
| **N** · **1–4** | Módok léptetése · ugrás a PvP / Könnyű / Közepes / Nehéz módra (új meccset indít) |
| **I** | Kövek ↔ fogak váltása |
| **C** | Meccs újrakezdése (előbb rákérdez: az **Enter** megerősít, az **Esc** elvet) |
| **T** | Sötét / világos téma váltása (önálló oldalon) |

**Telefonon:** koppints arra a metszéspontra, amelyiket szeretnéd; a tábla szélről szélre ér, így minden metszéspont még 360 px-en is legalább 24 px széles. A gyűrűvel körbevett kő az utolsó lépés. A **Szabályok**, **Befejezés** és **Teljes képernyő** gomb a Játék panelen van. iPhone-on add hozzá az oldalt a Főképernyőhöz, így böngészősávok nélkül látod. A **Befejezés** azonnal lezárja a kört, és rangsorolja a kör pontszámát (0, amíg a kör folyik); az **R** billentyű továbbra is az új kör billentyűje, ezért a Szabályok ablak csak a gombjával nyílik.

A nyílbillentyűk `preventDefault()`-ot hívnak, így az oldal játék közben soha nem görget. A mezők valódi `<button>`-ök, ilyen feliratokkal: „8. sor, 8. oszlop, fekete kő”.

> A 2.0-ban változott: az **Esc** mostantól szünetel (arcade szabvány) a pontszámok nullázása helyett; a nullázás a **Meccs újrakezdése** gombra / **C** billentyűre került (ugyanaz, mint a Tic-Tac-Toe-ban); az ikonváltó a **T**-ről (ami most az arcade téma billentyűje) az **I**-re költözött.

## 🎯 Pontozás és statisztika

Minden kör egy arcade futam, a készlet közös `duelRoundScore` függvényével pontozva (ugyanaz a skála, mint a Tic-Tac-Toe-ban):

| Eredmény (a te oldalad) | Pont |
| --- | --- |
| Győzelem | alap × (1 + a 225 mező üres hányada) — a gyors győzelem az alap akár 2-szeresét adja |
| Döntetlen | alap ÷ 4 |
| Vereség | 0 |

| Mód | Könnyű | Közepes | Nehéz | PvP |
| --- | --- | --- | --- | --- |
| Alap | 100 | 250 | 500 | nem rangsorolt (0) |

Példa: Közepes módban nyerni úgy, hogy a 9. kő van a táblán → 250 × (1 + 216/225) = **490**.

A statisztikapanel mutatja a **Pontokat** (a meccs összege), a **Legjobbat** (a valaha volt legjobb egyetlen kör), az **N–V–D**-t (PvP-ben F–Fe–D), a **Sorozatot** (jelenlegi · a mód legjobbja) és az **Időt** (a köré, szünetet követve).
A befejezett köröket egyszer rögzítjük a `localStorage`-ban az `arcade.stats.gomoku` alatt (`best`, `plays`, `wins`, `totalScore`, `totalSeconds`, …).
A PvP-körök nem rangsoroltak: csak játékként számítanak, és soha nem érintik a Legjobbat vagy a ranglistát.
A módonkénti legjobb sorozatok a `gomoku.highScore.<mode>` alatt vannak (történelmi kulcsnév — sorozatot tárol, nem pontot).

## 💾 Automatikus mentés és folytatás

Az egész meccs nagyjából másodpercenként, valamint az oldal elrejtésekor és a játék leválasztásakor mentődik
(kulcs: `arcade.session.gomoku`, sémaverzióval, betöltéskor szigorúan ellenőrizve — a táblának, a kövek számának, a soron lévő félnek és
a győzelem állapotának egyeznie kell). Újratöltéskor a **Üdv újra** felirat jelenik meg szüneteltetett meccsel. A pontgyűjtő játékokkal ellentétben
a befejezett kör **nem** törli a mentést: az állás és a pontok átmennek a körök között, és közvetlenül egy kör után készült mentés
a következő, üres körként folytatódik (a befejezett kört soha nem pontozzuk kétszer). A mentés csak a
**Meccs újrakezdése**, az *Automatikusan mentve* jelvény melletti **Elvetés** vagy a **Befejezés** (amely idő előtt lezárja a kört) hatására törlődik.

## 🧩 Beágyazás az Arcade-Game-Centerbe

```tsx
import { GomokuGame, GomokuDemo } from '@arcade/gomoku';

<GomokuGame
  embedded                                   // az oldalcím elrejtése; a portál mutatja
  onGameOver={(score) => submitScore('gomoku', score)}   // rangsorolt, pontot érő körök, vagy idő előtt befejezett kör
  onRunEnd={(run) => log(run.outcome, run.ranked)}       // minden befejezett kör
  onStatusChange={({ status, score, seconds }) => updateHeader(status, seconds)}
/>
<GomokuDemo active={cardIsVisible} />         // nyitóoldali bemutató mód
```

Mindkét komponens a `src/arcade/types.ts` közös `ArcadeGameProps` / `ArcadeDemoProps` szerződését követi.
Állapotleképezés: `idle` (az első kör előtt) · `running` (a kör folyik) · `paused` · `gameOver` (a kör megnyerve, döntetlen vagy idő előtt befejezve);
a futamkulcs a körszámláló, a `score` a kör pontja (0, amíg véget nem ér).

## 🧠 Hogyan működik

```
idle ─(start)→ playing ⇄ paused
                 ├─ öt vagy több egy sorban ─→ won ──────┐
                 ├─ 225 kő, nincs öt ────────→ draw ─────┼─(új kör)→ playing
                 └─ Idő előtti befejezés ────→ finished ─┘
```

Az `advanceGame(state, action, ctx): GameState` birtokol minden átmenetet:

1. **`place`** — csak emberi bevitel: a soron lévő fél kövét leteszi egy üres metszéspontra; a gép helyett soha nem lép.
2. **`aiMove`** — `bestMove(board, stone, mode, rng)`; a véletlenszám-generátor beinjektált, így a tesztek determinisztikusak.
3. **Előbb a győzelem ellenőrzése** — a `checkWinAt(board, lastIndex)` csak az utolsó kövön átmenő négy vonalat nézi. Utána jön a döntetlen-ellenőrzés (tele a tábla). A nyerő 225. kő győzelem, soha nem döntetlen.
4. **Körvég** — az állás, a sorozat (csak az ember győzelmei), a legjobb sorozat (soha nem csökken) és a kör pontja (`duelRoundScore`) hozzáadódik a meccs pontjaihoz.
5. **`newRound`** — üres tábla, a vesztes nyit, a meccs marad. A **`changeMode`** új meccset indít. A **`resetMatch`** visszatér az idle állapotba.
6. **`finish`** — Idő előtti befejezés: a kör nyertes nélkül ér véget és 0 pontot ér; `finished` kimenettel jelentjük (a pontszám 0 esetén is a ranglistára kerül), a mentés pedig törlődik.
7. **`pause` / `resume`** — szünet alatt a `place` és az `aiMove` hatástalan, és a `useAITurn` leállítja az időzítőjét.

A `useAITurn` a választott késleltetés után küldi az `aiMove`-ot; egy lépés, szünet, új kör, módváltás vagy leválasztás megszakítja.
A `useGomokuKeys` egyetlen window-figyelőt köt fel a komponens teljes élettartamára.

## 🤖 Játékmódok és gépi ellenfél

| Mód | Fekete | Fehér | Legyőzhető? |
| --- | --- | --- | --- |
| **PvP** | Ember | Ember (ugyanazon az eszközön) | Bármelyik játékos által |
| **Könnyű** | Ember | Gép (véletlenszerű, kövek mellett) | Szinte mindig |
| **Közepes** | Ember | Gép (mintázat-heurisztika, mohó) | Némi erőfeszítéssel |
| **Nehéz** | Ember | Gép (α-β + iteratív mélyítés) | **Legyőzhető**, de szilárdan játssza a fenyegetéseket |

**A Nehéz nem legyőzhetetlen** — a szabad gomoku (Renju-korlátozások nélkül, a hosszabb sor is nyer) a feketének kedvez, a 4 mélységű α-β keresés kézzel hangolt heurisztikával pedig kikap egy erős embertől.

A Közepes 5 lépéses prioritást követ: **azonnali nyerés → nyerés blokkolása → nyílt négyes csinálása → nyílt négyes blokkolása → heurisztika maximuma** az üres mezőkön, amelyek bármelyik kőtől legfeljebb 2 Csebisev-távolságra vannak. A Nehéz ugyanazt a heurisztikát használja levélértékelőként az α-β minimaxban iteratív mélyítéssel (2, 4 mélység), 250 ms-os kerettel és lépésenként 12 legjobban rendezett lépésre korlátozott elágazással. A demó mindkét oldalon Közepest használ (néhány ms lépésenként), három véletlen nyitólépés után.

## ⚫⚪ Kövek és fogak

- ⚫⚪ **Kövek** *(alapértelmezett)* — go-kövek sugaras színátmenettel, meleg fa gobanon.
- 🦷 **Fogak** — az arcade-szerte közös **Fogas mód**: fekete zápfogak és fehér metszőfogak (különböző alakkal, nem csak színnel) ugyanazokon a helyeken.

Váltás a **Beállítások** **Fogas mód** sorával, az arcade felső sávjával vagy az **I** billentyűvel; a közös `arcade.dental` beállításban tárolva. A régi `gomoku.iconStyle = 'tooth'` választás egyszer átkerül (csak ha a fogas mód még sosem volt beállítva), a régi kulcs pedig törlődik. A modell változatlan (`'B'` / `'W'`), csak a megjelenítés vált.
A tábla tokenjei (`--gmk-board-bg`, `--gmk-grid-line`, `--gmk-tooth-*`) a tábla keretén vannak a `GameBoard.module.css`-ben; az utolsó lépés gyűrűje és a nyerővonal a készlet `--danger` / `--ok` értékét használja.

## 🧪 Parancsok

| Parancs | Cél |
| --- | --- |
| `npm run dev` | Vite fejlesztői szerver |
| `npm run build` | Típusellenőrzés (`tsc -b`) és éles build |
| `npm run preview` | Az éles build kiszolgálása |
| `npm run typecheck` | `tsc -b` |
| `npm run lint` | ESLint |
| `npm test` | Vitest (logikai és komponensteszt) |
| `npm run check` | lint → typecheck → test → build (amit a CI futtat) |

## 🏗️ Felépítés

```
src/
  arcade/            becsomagolt Zoltan's Arcade készlet — itt ne szerkeszd (lásd a README-jét)
  logic/             tiszta játékszabályok — nincs React, nincs DOM
    types.ts constants.ts grid.ts win.ts patterns.ts
    ai.ts            könnyű / közepes / nehéz (α-β + iteratív mélyítés), beinjektált RNG
    game.ts          advanceGame reducer + createInitialState + arcadeStatusOf
    scoring.ts       kör kimenetele + duelRoundScore burkoló
    persist.ts       szigorú mentett-munkamenet ellenőrző + visszaállítás
    autopilot.ts     demóvezérlő (Közepes Közepes ellen az igazi reduceren)
    *.test.ts        szabályok, gépi ellenfél, pontozás, mentés, demó
  hooks/             useAITurn, useGomokuKeys, useBestStreak, useAIDelay, useIconStyle, useSound
  components/        GameBoard (teljes + mini), Cell, Stone, ToothIcon, GobanBackground, WinningLine,
                     ModeSelect, AISpeedToggle, DentalToggle, SoundToggle
  demo/GomokuDemo.tsx nyitóoldali bemutató mód
  rules.tsx          a Szabályok ablak szakaszai + a FiveDiagram
  GomokuGame.tsx     a beágyazható játék (ArcadeGameProps)
  App.tsx            önálló oldal: <ArcadeShell><GomokuGame/></ArcadeShell>
  main.tsx           belépési pont; egyszer tölti be az arcade.css-t
  index.ts           csomag belépési pont az Arcade-Game-Centerhez
```

Az eredeti tervezési jegyzetek és a gépi ellenfél specifikációja a [GAME-PLAN.md](./GAME-PLAN.md) fájlban van.

## 🤝 Közreműködés

Lásd a [CONTRIBUTING.md](./CONTRIBUTING.md), a [Magatartási kódex](./CODE_OF_CONDUCT.md) és a [SECURITY.md](./SECURITY.md) fájlt.
A közreműködők a [CONTRIBUTORS.md](./CONTRIBUTORS.md) fájlban szerepelnek; a változások a [CHANGELOG.md](./CHANGELOG.md) fájlban.

## ⚖️ Licenc

[MIT](./LICENSE) © 2026 Zoltán Dul

---

<p align="center">Készítette ❤️-vel Zoltán Dul · a <a href="https://github.com/ZoliQua/Arcade-Game-Center">Zoltan's Arcade</a> része</p>
