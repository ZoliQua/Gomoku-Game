import type { IconStyle } from '../hooks/useIconStyle';

export type IconStyleToggleProps = {
  style: IconStyle;
  onChange: (next: IconStyle) => void;
};

const OPTIONS: ReadonlyArray<{ id: IconStyle; label: string; icon: string; hint: string }> = [
  { id: 'stone', label: 'Stones', icon: '⚫⚪', hint: 'Classic black / white stones' },
  { id: 'tooth', label: 'Teeth', icon: '🦷', hint: 'Black / white tooth icons' },
];

export const IconStyleToggle = ({ style, onChange }: IconStyleToggleProps) => {
  return (
    <div
      className="gmk-icon-toggle"
      role="radiogroup"
      aria-label="Icon style"
    >
      {OPTIONS.map(({ id, label, icon, hint }) => {
        const active = id === style;
        return (
          <button
            type="button"
            key={id}
            role="radio"
            aria-checked={active}
            title={hint}
            className={`gmk-icon-toggle-btn${active ? ' gmk-icon-toggle-active' : ''}`}
            onClick={() => onChange(id)}
          >
            <span className="gmk-icon-toggle-icon" aria-hidden="true">{icon}</span>
            <span className="gmk-icon-toggle-label">{label}</span>
          </button>
        );
      })}
      <span className="gmk-icon-toggle-kbd" aria-hidden="true">
        <kbd className="gmk-kbd">T</kbd>
      </span>
    </div>
  );
};

export default IconStyleToggle;
