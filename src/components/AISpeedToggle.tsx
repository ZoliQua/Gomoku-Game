import type { AISpeed } from '../hooks/useAIDelay';

export type AISpeedToggleProps = {
  speed: AISpeed;
  onChange: (next: AISpeed) => void;
  disabled?: boolean;
};

const OPTIONS: ReadonlyArray<{ id: AISpeed; label: string; hint: string }> = [
  { id: 'instant', label: '0', hint: 'Instant' },
  { id: 'fast', label: '0.15s', hint: 'Fast (150 ms)' },
  { id: 'normal', label: '0.35s', hint: 'Normal (350 ms)' },
  { id: 'slow', label: '1s', hint: 'Slow (1000 ms)' },
];

export const AISpeedToggle = ({ speed, onChange, disabled = false }: AISpeedToggleProps) => (
  <div className="gmk-setting">
    <span className="gmk-setting__label">
      AI delay
    </span>
    <div className="arc-segmented" role="group" aria-label="AI delay">
      {OPTIONS.map(({ id, label, hint }) => (
        <button
          type="button"
          key={id}
          aria-pressed={id === speed}
          title={hint}
          disabled={disabled}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  </div>
);

export default AISpeedToggle;
