import { formatElapsed } from '../hooks/useElapsedSeconds';
import type { IconStyle } from '../hooks/useIconStyle';
import type { GameState, Stone as StoneVal } from '../logic/types';
import { Stone as StoneIcon } from './Stone';
import { ToothIcon } from './ToothIcon';

export type ScoreBoardProps = {
  state: GameState;
  bestStreak: number;
  elapsedSeconds: number;
  iconStyle: IconStyle;
};

const stoneName = (stone: StoneVal): string => (stone === 'B' ? 'Black' : 'White');

const statusLabel = (state: GameState): string => {
  if (state.status === 'won' && state.winner) {
    return `${stoneName(state.winner)} wins!`;
  }
  if (state.status === 'draw') return 'Draw';
  if (state.mode === 'pvp') {
    return `${stoneName(state.current)}'s turn`;
  }
  const aiStone: StoneVal = state.humanStone === 'B' ? 'W' : 'B';
  return state.current === aiStone ? 'AI thinking…' : 'Your turn';
};

const PieceIcon = ({ stone, iconStyle }: { stone: StoneVal; iconStyle: IconStyle }) => {
  const variant = stone === 'B' ? 'black' : 'white';
  return iconStyle === 'tooth'
    ? <ToothIcon variant={variant} />
    : <StoneIcon variant={variant} />;
};

export const ScoreBoard = ({
  state,
  bestStreak,
  elapsedSeconds,
  iconStyle,
}: ScoreBoardProps) => {
  return (
    <div className="gmk-scoreboard">
      <div className="gmk-score gmk-score-b">
        <span className="gmk-score-icon" aria-hidden="true">
          <PieceIcon stone="B" iconStyle={iconStyle} />
        </span>
        <span className="gmk-score-label">Black</span>
        <span className="gmk-score-value">{state.scores.black}</span>
      </div>
      <div className="gmk-score gmk-score-draws">
        <span className="gmk-score-label">Draws</span>
        <span className="gmk-score-value">{state.scores.draws}</span>
      </div>
      <div className="gmk-score gmk-score-w">
        <span className="gmk-score-icon" aria-hidden="true">
          <PieceIcon stone="W" iconStyle={iconStyle} />
        </span>
        <span className="gmk-score-label">White</span>
        <span className="gmk-score-value">{state.scores.white}</span>
      </div>
      <div className="gmk-meta">
        <span className="gmk-meta-row">
          <span className="gmk-meta-label">Status</span>
          <span className="gmk-meta-value">{statusLabel(state)}</span>
        </span>
        <span className="gmk-meta-row">
          <span className="gmk-meta-label">Streak</span>
          <span className="gmk-meta-value">{state.currentStreak}</span>
        </span>
        <span className="gmk-meta-row">
          <span className="gmk-meta-label">Best</span>
          <span className="gmk-meta-value">{bestStreak}</span>
        </span>
        <span className="gmk-meta-row">
          <span className="gmk-meta-label">Time</span>
          <span className="gmk-meta-value">{formatElapsed(elapsedSeconds)}</span>
        </span>
      </div>
    </div>
  );
};

export default ScoreBoard;
