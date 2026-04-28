import type { IconStyle } from '../hooks/useIconStyle';
import type { GameState } from '../logic/types';
import { Stone } from './Stone';
import { ToothIcon } from './ToothIcon';

export type OverlayProps = {
  state: GameState;
  iconStyle: IconStyle;
  onNewRound: () => void;
};

export const Overlay = ({ state, iconStyle, onNewRound }: OverlayProps) => {
  if (state.status !== 'won' && state.status !== 'draw') return null;

  const isWin = state.status === 'won';
  const winner = state.winner;
  const title = isWin && winner
    ? `${winner === 'B' ? 'Black' : 'White'} wins!`
    : "It's a draw";
  const subtitle = isWin
    ? 'Press R or click below for a new round'
    : 'Board full, no five in a row';

  return (
    <div className="gmk-overlay" role="dialog" aria-live="polite" aria-label={title}>
      <div className="gmk-overlay-card">
        {isWin && winner && (
          <div className="gmk-overlay-icon" aria-hidden="true">
            {iconStyle === 'tooth' ? (
              <ToothIcon variant={winner === 'B' ? 'black' : 'white'} />
            ) : (
              <Stone variant={winner === 'B' ? 'black' : 'white'} />
            )}
          </div>
        )}
        <h2 className="gmk-overlay-title">{title}</h2>
        <p className="gmk-overlay-sub">{subtitle}</p>
        <button
          type="button"
          className="gmk-btn gmk-btn-primary gmk-overlay-btn"
          onClick={onNewRound}
          autoFocus
        >
          New round
          <kbd className="gmk-kbd">R</kbd>
        </button>
      </div>
    </div>
  );
};

export default Overlay;
