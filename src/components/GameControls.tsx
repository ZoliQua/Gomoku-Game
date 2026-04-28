export type GameControlsProps = {
  onNewRound: () => void;
  onResetScores: () => void;
};

export const GameControls = ({ onNewRound, onResetScores }: GameControlsProps) => {
  return (
    <div className="gmk-controls">
      <button type="button" className="gmk-btn gmk-btn-primary" onClick={onNewRound}>
        New round
        <kbd className="gmk-kbd">R</kbd>
      </button>
      <button type="button" className="gmk-btn gmk-btn-ghost" onClick={onResetScores}>
        Reset scores
        <kbd className="gmk-kbd">Esc</kbd>
      </button>
    </div>
  );
};

export default GameControls;
