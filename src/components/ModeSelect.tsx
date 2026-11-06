import { useMessages } from '../arcade';
import { MESSAGES, MODE_KEY } from '../i18n';
import type { Mode } from '../logic/types';

export type ModeSelectProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const MODES: readonly Mode[] = ['pvp', 'easy', 'medium', 'hard'];

export const ModeSelect = ({ mode, onChange }: ModeSelectProps) => {
  const t = useMessages(MESSAGES);
  return (
    <div className="arc-segmented arc-segmented--full" role="group" aria-label={t('modeGroup')}>
      {MODES.map((id, i) => (
        <button
          type="button"
          key={id}
          aria-pressed={id === mode}
          title={`${t(MODE_KEY[id])} (${i + 1})`}
          onClick={() => onChange(id)}
        >
          {t(MODE_KEY[id])}
        </button>
      ))}
    </div>
  );
};

export default ModeSelect;
