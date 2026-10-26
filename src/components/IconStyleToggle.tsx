import type { IconStyle } from '../hooks/useIconStyle';

export type IconStyleToggleProps = {
  style: IconStyle;
  onChange: (next: IconStyle) => void;
};

const OPTIONS: ReadonlyArray<{ id: IconStyle; label: string; icon: string; hint: string }> = [
  { id: 'stone', label: 'Stones', icon: '⚫⚪', hint: 'Classic black / white stones (I)' },
  { id: 'tooth', label: 'Teeth', icon: '🦷', hint: 'Black / white tooth icons (I)' },
];

export const IconStyleToggle = ({ style, onChange }: IconStyleToggleProps) => (
  <div className="gmk-setting">
    <span className="gmk-setting__label">
      Pieces
    </span>
    <div className="arc-segmented" role="group" aria-label="Piece style">
      {OPTIONS.map(({ id, label, icon, hint }) => (
        <button type="button" key={id} aria-pressed={id === style} title={hint} onClick={() => onChange(id)}>
          <span aria-hidden="true">{icon}</span> {label}
        </button>
      ))}
    </div>
  </div>
);

export default IconStyleToggle;
