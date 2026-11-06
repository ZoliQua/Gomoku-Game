import { useMessages } from '../arcade';
import type { IconStyle } from '../hooks/useIconStyle';
import { MESSAGES, type GomokuMessageKey } from '../i18n';

export type IconStyleToggleProps = {
  style: IconStyle;
  onChange: (next: IconStyle) => void;
};

const OPTIONS: ReadonlyArray<{ id: IconStyle; label: GomokuMessageKey; icon: string; hint: GomokuMessageKey }> = [
  { id: 'stone', label: 'stones', icon: '⚫⚪', hint: 'stonesHint' },
  { id: 'tooth', label: 'teeth', icon: '🦷', hint: 'teethHint' },
];

export const IconStyleToggle = ({ style, onChange }: IconStyleToggleProps) => {
  const t = useMessages(MESSAGES);
  return (
    <div className="gmk-setting">
      <span className="gmk-setting__label">
        {t('pieces')}
      </span>
      <div className="arc-segmented" role="group" aria-label={t('pieceStyle')}>
        {OPTIONS.map(({ id, label, icon, hint }) => (
          <button type="button" key={id} aria-pressed={id === style} title={t(hint)} onClick={() => onChange(id)}>
            <span aria-hidden="true">{icon}</span> {t(label)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default IconStyleToggle;
