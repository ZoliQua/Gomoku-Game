export type SoundToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

export const SoundToggle = ({ enabled, onToggle }: SoundToggleProps) => {
  return (
    <div className="gmk-settings-group">
      <span className="gmk-settings-label">Sound</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        title={enabled ? 'Sound on (click to mute)' : 'Sound off (click to enable)'}
        className={`gmk-sound-btn${enabled ? ' gmk-sound-on' : ''}`}
        onClick={onToggle}
      >
        <span aria-hidden="true">{enabled ? '🔊' : '🔇'}</span>
        <span className="gmk-sound-label">{enabled ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
};

export default SoundToggle;
