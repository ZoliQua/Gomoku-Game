import type { Mode } from '../logic/types';

export type ModeSelectProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const MODES: ReadonlyArray<{ id: Mode; label: string; hint: string }> = [
  { id: 'pvp', label: 'PvP', hint: '1' },
  { id: 'easy', label: 'Easy', hint: '2' },
  { id: 'medium', label: 'Medium', hint: '3' },
  { id: 'hard', label: 'Hard', hint: '4' },
];

export const ModeSelect = ({ mode, onChange }: ModeSelectProps) => {
  return (
    <div className="gmk-mode-select" role="radiogroup" aria-label="Game mode">
      {MODES.map(({ id, label, hint }) => {
        const active = id === mode;
        return (
          <button
            type="button"
            key={id}
            role="radio"
            aria-checked={active}
            className={`gmk-mode-button${active ? ' gmk-mode-active' : ''}`}
            onClick={() => onChange(id)}
          >
            <span className="gmk-mode-label">{label}</span>
            <span className="gmk-mode-hint" aria-hidden="true">{hint}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ModeSelect;
