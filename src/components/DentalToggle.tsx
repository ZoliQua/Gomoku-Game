import { useKitMessages, useMessages } from '../arcade';
import { MESSAGES } from '../i18n';

export type DentalToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

/** Settings row for the shared dental mode (`arcade.dental`): stones ↔ teeth. */
export const DentalToggle = ({ enabled, onToggle }: DentalToggleProps) => {
  const t = useMessages(MESSAGES);
  const k = useKitMessages();
  return (
    <label className="arc-field gmk-dental">
      <input type="checkbox" checked={enabled} onChange={onToggle} />
      <span>{k('dental')}</span>
      <strong aria-live="polite">{t(enabled ? 'on' : 'off')}</strong>
      <small className="gmk-dental__hint">{t('dentalHint')}</small>
    </label>
  );
};

export default DentalToggle;
