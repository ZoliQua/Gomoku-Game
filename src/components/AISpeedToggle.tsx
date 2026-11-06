import { useMessages } from '../arcade';
import type { AISpeed } from '../hooks/useAIDelay';
import { MESSAGES, type GomokuMessageKey } from '../i18n';

export type AISpeedToggleProps = {
  speed: AISpeed;
  onChange: (next: AISpeed) => void;
  disabled?: boolean;
};

const OPTIONS: ReadonlyArray<{ id: AISpeed; label: string; hint: GomokuMessageKey }> = [
  { id: 'instant', label: '0', hint: 'speedInstant' },
  { id: 'fast', label: '0.15s', hint: 'speedFast' },
  { id: 'normal', label: '0.35s', hint: 'speedNormal' },
  { id: 'slow', label: '1s', hint: 'speedSlow' },
];

export const AISpeedToggle = ({ speed, onChange, disabled = false }: AISpeedToggleProps) => {
  const t = useMessages(MESSAGES);
  return (
    <div className="gmk-setting">
      <span className="gmk-setting__label">
        {t('aiDelay')}
      </span>
      <div className="arc-segmented" role="group" aria-label={t('aiDelay')}>
        {OPTIONS.map(({ id, label, hint }) => (
          <button
            type="button"
            key={id}
            aria-pressed={id === speed}
            title={t(hint)}
            disabled={disabled}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AISpeedToggle;
