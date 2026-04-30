import type { AISpeed } from '../hooks/useAIDelay';

export type AISpeedToggleProps = {
  speed: AISpeed;
  onChange: (next: AISpeed) => void;
};

const OPTIONS: ReadonlyArray<{ id: AISpeed; label: string; hint: string }> = [
  { id: 'instant', label: '0', hint: 'Instant' },
  { id: 'fast', label: '0.15s', hint: 'Fast (150 ms)' },
  { id: 'normal', label: '0.35s', hint: 'Normal (350 ms)' },
  { id: 'slow', label: '1s', hint: 'Slow (1000 ms)' },
];

export const AISpeedToggle = ({ speed, onChange }: AISpeedToggleProps) => {
  return (
    <div className="gmk-settings-group" role="radiogroup" aria-label="AI speed">
      <span className="gmk-settings-label">AI delay</span>
      <div className="gmk-segmented">
        {OPTIONS.map(({ id, label, hint }) => {
          const active = id === speed;
          return (
            <button
              type="button"
              key={id}
              role="radio"
              aria-checked={active}
              title={hint}
              className={`gmk-segmented-btn${active ? ' gmk-segmented-active' : ''}`}
              onClick={() => onChange(id)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AISpeedToggle;
