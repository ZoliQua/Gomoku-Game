import { MODE_LABEL } from '../logic/constants';
import type { Mode } from '../logic/types';

export type ModeSelectProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const MODES: readonly Mode[] = ['pvp', 'easy', 'medium', 'hard'];

export const ModeSelect = ({ mode, onChange }: ModeSelectProps) => (
  <div className="arc-segmented arc-segmented--full" role="group" aria-label="Game mode">
    {MODES.map((id, i) => (
      <button
        type="button"
        key={id}
        aria-pressed={id === mode}
        title={`${MODE_LABEL[id]} (${i + 1})`}
        onClick={() => onChange(id)}
      >
        {MODE_LABEL[id]}
      </button>
    ))}
  </div>
);

export default ModeSelect;
