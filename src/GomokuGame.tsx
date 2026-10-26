import { useCallback, useEffect, useReducer, useRef, useState, type CSSProperties } from 'react';
import {
  DUEL_BASE_POINTS,
  formatClock,
  GameOverlay,
  KeyHelp,
  SaveBadge,
  StatPanel,
  useArcadeRun,
  useRestoredSession,
  useRunTimer,
  useSessionAutosave,
  type ArcadeGameProps,
  type OverlayAction,
} from './arcade';
import { AISpeedToggle } from './components/AISpeedToggle';
import { GameBoard } from './components/GameBoard';
import { IconStyleToggle } from './components/IconStyleToggle';
import { ModeSelect } from './components/ModeSelect';
import { SoundToggle } from './components/SoundToggle';
import { useAIDelay } from './hooks/useAIDelay';
import { useAITurn } from './hooks/useAITurn';
import { readBestStreaks, useBestStreaks } from './hooks/useBestStreak';
import { useGomokuKeys } from './hooks/useGomokuKeys';
import { useIconStyle } from './hooks/useIconStyle';
import { useSound } from './hooks/useSound';
import { MODE_LABEL } from './logic/constants';
import { advanceGame, arcadeStatusOf, createInitialState, isHumanTurn } from './logic/game';
import { moveFocus } from './logic/grid';
import { isGomokuState, restoreSavedState, wasRoundInProgress } from './logic/persist';
import { isRanked, stateOutcome } from './logic/scoring';
import type { GameAction, GameState, Mode } from './logic/types';
import styles from './GomokuGame.module.css';

/** Bump when GameState changes shape; older saves are then discarded. */
const SESSION_SCHEMA = 1;

const MODE_ORDER: readonly Mode[] = ['pvp', 'easy', 'medium', 'hard'];

const KEYS: [string, string][] = [
  ['← ↑ → ↓', 'Move cursor (or WASD)'],
  ['Space Enter', 'Place · start · next round'],
  ['P Esc', 'Pause / resume'],
  ['R', 'New round'],
  ['N 1–4', 'Cycle / pick mode'],
  ['I', 'Stones ↔ teeth'],
  ['C', 'Reset match'],
];

const rng = () => Math.random();
const reducer = (state: GameState, action: GameAction): GameState => advanceGame(state, action, { rng });

const tally = (state: GameState): { label: string; value: string } => {
  const { black, white, draws } = state.scores;
  if (state.mode === 'pvp') return { label: 'B–W–D', value: `${black}–${white}–${draws}` };
  const human = state.humanStone === 'B' ? black : white;
  const ai = state.humanStone === 'B' ? white : black;
  return { label: 'W–L–D', value: `${human}–${ai}–${draws}` };
};

const turnLabel = (state: GameState): string => {
  if (state.mode === 'pvp') return `${state.current === 'B' ? 'Black' : 'White'} to move`;
  return isHumanTurn(state) ? 'Your turn' : 'AI thinking…';
};

const resultTitle = (state: GameState): string => {
  if (state.status === 'draw' || state.winner === null) return "It's a draw";
  if (state.mode === 'pvp') return `${state.winner === 'B' ? 'Black' : 'White'} wins!`;
  return state.winner === state.humanStone ? 'You win!' : 'The AI wins';
};

export function GomokuGame(props: ArcadeGameProps = {}) {
  const { embedded = false } = props;
  const restored = useRestoredSession<GameState>('gomoku', SESSION_SCHEMA, isGomokuState);
  const [boot] = useState(() => {
    const deviceBest = readBestStreaks();
    // Ranked by default: the arcade scores rounds against the AI; PvP is one key away.
    if (!restored) return { state: createInitialState({ bestStreaks: deviceBest, mode: 'medium' }), seconds: 0 };
    return {
      state: restoreSavedState(restored.data, deviceBest),
      seconds: wasRoundInProgress(restored.data) ? restored.seconds : 0,
    };
  });

  const [state, dispatch] = useReducer(reducer, boot.state);
  const [welcomeBack, setWelcomeBack] = useState(restored !== null);
  const [confirmReset, setConfirmReset] = useState(false);

  const { style: iconStyle, setStyle: setIconStyle, toggle: toggleIconStyle } = useIconStyle();
  const { speed: aiSpeed, delayMs: aiDelay, setSpeed: setAISpeed } = useAIDelay();
  const sound = useSound();
  useBestStreaks(state.bestStreaks);

  const status = arcadeStatusOf(state.status);
  const seconds = useRunTimer(
    status === 'running' && !confirmReset,
    state.round,
    state.round === boot.state.round ? boot.seconds : 0,
  );

  const stats = useArcadeRun({
    gameId: 'gomoku',
    status,
    score: state.roundScore,
    seconds,
    runKey: state.round,
    outcome: () => stateOutcome(state),
    ranked: isRanked(state.mode),
    props,
  });


  // The match (scores, streak, points) survives between rounds; only an
  // explicit reset / discard (which returns to idle) drops the save.
  const savedAt = useSessionAutosave({
    gameId: 'gomoku',
    schema: SESSION_SCHEMA,
    enabled: state.status !== 'idle',
    discard: state.status === 'idle',
    data: state,
    seconds,
    score: state.points,
  });

  useAITurn(state, dispatch, aiDelay, !confirmReset);

  // Sound: one click per placed stone, a cue when a round ends.
  const lastMoveCountRef = useRef(state.moveCount);
  useEffect(() => {
    if (state.moveCount > lastMoveCountRef.current) sound.click();
    lastMoveCountRef.current = state.moveCount;
  }, [state.moveCount, sound]);
  const lastStatusRef = useRef(state.status);
  useEffect(() => {
    if (lastStatusRef.current === 'playing') {
      if (state.status === 'won') sound.win();
      else if (state.status === 'draw') sound.draw();
    }
    lastStatusRef.current = state.status;
  }, [state.status, sound]);

  const start = useCallback(() => {
    setWelcomeBack(false);
    dispatch({ type: 'start' });
  }, []);

  const togglePause = useCallback(() => {
    if (state.status === 'playing') dispatch({ type: 'pause' });
    else if (state.status === 'paused') {
      setWelcomeBack(false);
      dispatch({ type: 'resume' });
    }
  }, [state.status]);

  const newRound = useCallback(() => {
    setWelcomeBack(false);
    dispatch({ type: state.status === 'idle' ? 'start' : 'newRound' });
  }, [state.status]);

  const place = useCallback((index: number) => dispatch({ type: 'place', index }), []);
  const focusCell = useCallback((index: number) => dispatch({ type: 'focus', index }), []);

  const selectMode = useCallback(
    (mode: Mode) => {
      if (mode === state.mode) return;
      setWelcomeBack(false);
      setConfirmReset(false);
      dispatch({ type: 'changeMode', mode });
    },
    [state.mode],
  );

  const hasMatch = state.status !== 'idle' || state.points > 0 || state.currentStreak > 0;
  const requestReset = useCallback(() => {
    if (hasMatch) setConfirmReset(true);
  }, [hasMatch]);
  const confirmResetMatch = useCallback(() => {
    setConfirmReset(false);
    setWelcomeBack(false);
    dispatch({ type: 'resetMatch' });
  }, []);
  const cancelReset = useCallback(() => setConfirmReset(false), []);

  const discardSave = useCallback(() => {
    setConfirmReset(false);
    setWelcomeBack(false);
    dispatch({ type: 'resetMatch' });
  }, []);

  const primary = useCallback(() => {
    switch (state.status) {
      case 'idle':
        start();
        return;
      case 'paused':
        togglePause();
        return;
      case 'won':
      case 'draw':
        newRound();
        return;
      case 'playing':
        place(state.focusIndex);
    }
  }, [state.status, state.focusIndex, start, togglePause, newRound, place]);

  useGomokuKeys({
    onMove: (direction) => {
      if (state.status === 'playing') focusCell(moveFocus(state.focusIndex, direction));
    },
    onPrimary: primary,
    onTogglePause: togglePause,
    onNewRound: newRound,
    onCycleMode: () => selectMode(MODE_ORDER[(MODE_ORDER.indexOf(state.mode) + 1) % MODE_ORDER.length] as Mode),
    onSelectMode: selectMode,
    onToggleIcons: toggleIconStyle,
    onResetMatch: requestReset,
    confirm: confirmReset ? { onConfirm: confirmResetMatch, onCancel: cancelReset } : null,
  });

  const best = Math.max(stats.best, state.roundScore);
  const newBest = status === 'gameOver' && state.roundScore > 0 && state.roundScore > stats.bestBeforeRun;
  const ranked = isRanked(state.mode);
  const record = tally(state);
  const interactive = state.status === 'playing' && isHumanTurn(state) && !confirmReset;

  let overlay: { title: string; message: string; actions: OverlayAction[] } | null = null;
  if (confirmReset) {
    overlay = {
      title: 'Reset match?',
      message: 'Clears the board, the W–L–D tally, points and the current streak. Best streaks and arcade stats stay.',
      actions: [
        { label: 'Reset match', onClick: confirmResetMatch, primary: true, kbd: 'Enter' },
        { label: 'Keep playing', onClick: cancelReset, kbd: 'Esc' },
      ],
    };
  } else if (state.status === 'idle') {
    overlay = {
      title: 'Gomoku',
      message: `Five in a row wins. Mode: ${MODE_LABEL[state.mode]}${ranked ? '' : ' (unranked)'} — change it on the right or with 1–4.`,
      actions: [{ label: 'Start', onClick: start, primary: true, kbd: 'Space' }],
    };
  } else if (state.status === 'paused') {
    overlay = welcomeBack
      ? {
          title: 'Welcome back',
          message: `Your ${MODE_LABEL[state.mode]} match was restored — ${record.label} ${record.value}, ${state.points} points.`,
          actions: [
            { label: 'Continue', onClick: togglePause, primary: true, kbd: 'P' },
            { label: 'New round', onClick: newRound, kbd: 'R' },
          ],
        }
      : {
          title: 'Paused',
          message: 'Your match is autosaved — the AI waits while you are away.',
          actions: [
            { label: 'Resume', onClick: togglePause, primary: true, kbd: 'P' },
            { label: 'New round', onClick: newRound, kbd: 'R' },
          ],
        };
  } else if (status === 'gameOver') {
    overlay = {
      title: resultTitle(state),
      message: ranked
        ? `+${state.roundScore} points · Match ${state.points} · Best ${best}${newBest ? ' — new best!' : ''}`
        : `${record.label} ${record.value} · PvP rounds are unranked and count as plays only.`,
      actions: [{ label: 'New round', onClick: newRound, primary: true, kbd: 'R' }],
    };
  }

  const primaryLabel =
    state.status === 'idle'
      ? 'Start'
      : state.status === 'playing'
        ? 'Pause'
        : state.status === 'paused'
          ? 'Resume'
          : 'Next round';
  const primaryClick = state.status === 'playing' ? togglePause : primary;

  return (
    <div
      className={`arc-game gmk-app ${styles.game}`}
      data-mode={state.mode}
      data-icon-style={iconStyle}
      style={{ '--game-color': 'var(--game-gomoku)' } as CSSProperties}
    >
      {!embedded && (
        <header className="arc-game__head">
          <div>
            <h1 className="arc-game__title">
              <span className={styles.titleIcon} aria-hidden="true">
                {iconStyle === 'tooth' ? '🦷' : '⚫⚪'}
              </span>{' '}
              Gomoku
            </h1>
            <p className="arc-game__sub">
              {iconStyle === 'tooth'
                ? 'Five in a row, dental edition — 15 × 15 board, keyboard-first.'
                : 'Five in a row on a 15 × 15 goban — keyboard-first.'}
            </p>
          </div>
        </header>
      )}

      <StatPanel
        status={status}
        statusLabel={status === 'running' ? turnLabel(state) : undefined}
        items={[
          { label: 'Points', value: state.points },
          { label: 'Best', value: best, highlight: newBest },
          { label: record.label, value: record.value },
          { label: 'Streak', value: `${state.currentStreak} · best ${state.bestStreaks[state.mode]}` },
          { label: 'Time', value: formatClock(seconds) },
        ]}
      />

      <div className={styles.layout}>
        <div className={`arc-game__board ${styles.boardWrap}`}>
          <GameBoard
            board={state.board}
            winningLine={state.winningLine}
            lastMoveIndex={state.lastMoveIndex}
            focusIndex={state.focusIndex}
            interactive={interactive}
            iconStyle={iconStyle}
            onPlace={place}
            onFocusCell={focusCell}
          />
          {overlay && <GameOverlay {...overlay} />}
        </div>

        <aside className={styles.side}>
          <section className="arc-panel">
            <h2 className="arc-panel__title">Game</h2>
            <div className={styles.buttons}>
              <button type="button" className="arc-btn arc-btn--primary" onClick={primaryClick}>
                {primaryLabel}
              </button>
              <button type="button" className="arc-btn" onClick={newRound} disabled={state.status === 'idle'}>
                New round
              </button>
            </div>
            <button
              type="button"
              className={`arc-btn arc-btn--ghost ${styles.reset}`}
              onClick={requestReset}
              disabled={!hasMatch}
            >
              Reset match <kbd className="arc-kbd">C</kbd>
            </button>
            <div className={styles.save}>
              <SaveBadge savedAt={state.status !== 'idle' ? savedAt : null} onDiscard={discardSave} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Mode</h2>
            <ModeSelect mode={state.mode} onChange={selectMode} />
            <p className={styles.note}>
              {ranked
                ? `Ranked: a win pays ${DUEL_BASE_POINTS[state.mode as Exclude<Mode, 'pvp'>]}–${
                    DUEL_BASE_POINTS[state.mode as Exclude<Mode, 'pvp'>] * 2
                  } (faster wins pay more), a draw a quarter. Changing mode starts a new match.`
                : 'Two players on one device. Unranked — rounds count as plays only.'}
            </p>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Settings</h2>
            <div className={styles.settings}>
              <AISpeedToggle speed={aiSpeed} onChange={setAISpeed} disabled={state.mode === 'pvp'} />
              <IconStyleToggle style={iconStyle} onChange={setIconStyle} />
              <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
            </div>
          </section>

          <section className="arc-panel">
            <h2 className="arc-panel__title">Keys</h2>
            <KeyHelp rows={KEYS} />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default GomokuGame;
