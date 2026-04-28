import { useCallback, useReducer, useRef } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { IconStyleToggle } from './components/IconStyleToggle';
import { ModeSelect } from './components/ModeSelect';
import { Overlay } from './components/Overlay';
import { ScoreBoard } from './components/ScoreBoard';
import { useAITurn } from './hooks/useAITurn';
import { useBestStreak } from './hooks/useBestStreak';
import { useElapsedSeconds } from './hooks/useElapsedSeconds';
import { useIconStyle } from './hooks/useIconStyle';
import { useKeyboardSelect } from './hooks/useKeyboardSelect';
import { STORAGE_KEY_BEST } from './logic/constants';
import { advanceGame, createInitialState } from './logic/game';
import type { GameAction, GameState, Mode } from './logic/types';
import './styles/gmk.css';

const readBestStreak = (): number => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_BEST);
    if (raw === null) return 0;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
  } catch {
    return 0;
  }
};

const init = (): GameState => createInitialState({ bestStreak: readBestStreak() });

export const GomokuGame = () => {
  const rngRef = useRef<() => number>(Math.random);
  const reducer = useCallback(
    (state: GameState, action: GameAction): GameState =>
      advanceGame(state, action, { rng: rngRef.current }),
    [],
  );

  const [state, dispatch] = useReducer(reducer, undefined, init);

  const { style: iconStyle, setStyle: setIconStyle, toggle: toggleIconStyle } =
    useIconStyle();

  const bestStreak = useBestStreak(state.currentStreak);
  const isHumanTurn = state.mode === 'pvp' || state.current === state.humanStone;
  const roundKey = `${state.mode}-${state.startingStone}-${state.scores.black + state.scores.white + state.scores.draws}`;
  const elapsed = useElapsedSeconds(state.status, roundKey);

  useAITurn(state, dispatch);
  useKeyboardSelect({ state, dispatch, onToggleIconStyle: toggleIconStyle });

  const handleModeChange = (mode: Mode) => dispatch({ type: 'changeMode', mode });
  const handleNewRound = () => dispatch({ type: 'newRound' });
  const handleResetScores = () => dispatch({ type: 'resetScores' });

  const effectiveBest = Math.max(bestStreak, state.bestStreak);

  return (
    <div className="gmk-app" data-mode={state.mode} data-icon-style={iconStyle}>
      <div className="gmk-shell">
        <header className="gmk-header">
          <div className="gmk-header-row">
            <h1 className="gmk-title">
              <span className="gmk-title-icon" aria-hidden="true">
                {iconStyle === 'tooth' ? '🦷' : '⚫⚪'}
              </span>
              Gomoku
            </h1>
            <IconStyleToggle style={iconStyle} onChange={setIconStyle} />
          </div>
          <p className="gmk-subtitle">
            {iconStyle === 'tooth'
              ? 'Five in a row, dental edition — 15 × 15 board, keyboard-first.'
              : 'Five in a row on a 15 × 15 goban — keyboard-first.'}
          </p>
        </header>

        <ModeSelect mode={state.mode} onChange={handleModeChange} />

        <main className="gmk-main">
          <ScoreBoard
            state={state}
            bestStreak={effectiveBest}
            elapsedSeconds={elapsed}
            iconStyle={iconStyle}
          />

          <div className="gmk-board-frame">
            <GameBoard
              state={state}
              dispatch={dispatch}
              isHumanTurn={isHumanTurn}
              iconStyle={iconStyle}
            />
            <Overlay
              state={state}
              iconStyle={iconStyle}
              onNewRound={handleNewRound}
            />
          </div>

          <GameControls
            onNewRound={handleNewRound}
            onResetScores={handleResetScores}
          />

          <div className="gmk-help">
            <p>
              <kbd className="gmk-kbd">↑↓←→</kbd> / <kbd className="gmk-kbd">WASD</kbd> move ·{' '}
              <kbd className="gmk-kbd">Enter</kbd>/<kbd className="gmk-kbd">Space</kbd> place ·{' '}
              <kbd className="gmk-kbd">R</kbd> new round ·{' '}
              <kbd className="gmk-kbd">N</kbd> cycle mode ·{' '}
              <kbd className="gmk-kbd">1–4</kbd> jump mode ·{' '}
              <kbd className="gmk-kbd">T</kbd> toggle icons ·{' '}
              <kbd className="gmk-kbd">Esc</kbd> reset scores
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GomokuGame;
