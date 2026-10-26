export type SoundToggleProps = {
  enabled: boolean;
  onToggle: () => void;
};

export const SoundToggle = ({ enabled, onToggle }: SoundToggleProps) => (
  <label className="arc-field">
    <input type="checkbox" checked={enabled} onChange={onToggle} />
    <span>Sound effects</span>
    <strong aria-live="polite">{enabled ? 'On' : 'Off'}</strong>
  </label>
);

export default SoundToggle;
