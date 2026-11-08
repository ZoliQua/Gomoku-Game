import { useCallback, useEffect, useState } from 'react';
import { applyDental, DENTAL_KEY, readDental, readString, removeKey, useDental } from '../arcade';

/** Piece artwork: classic stones, or teeth while the shared dental mode is on. */
export type IconStyle = 'stone' | 'tooth';

/** The old per-game piece-style key (`'stone' | 'tooth'`), replaced by `arcade.dental`. */
export const LEGACY_ICON_STYLE_KEY = 'gomoku.iconStyle';

/**
 * One-time migration of the old per-game setting: a saved `'tooth'` turns the
 * shared dental mode on — only if dental mode was never chosen — and the old
 * key is removed either way. Silent: the caller announces the change after
 * mount. Returns true when it switched dental mode on.
 */
export const migrateLegacyIconStyle = (): boolean => {
  const legacy = readString(LEGACY_ICON_STYLE_KEY);
  if (legacy === null) return false;
  const adopt = legacy === 'tooth' && readString(DENTAL_KEY) === null;
  if (adopt) applyDental(true, { silent: true });
  removeKey(LEGACY_ICON_STYLE_KEY);
  return adopt;
};

/** Piece style bound to the shared dental mode: tooth = dental on, stone = off. */
export const useIconStyle = (): {
  style: IconStyle;
  setStyle: (next: IconStyle) => void;
  toggle: () => void;
} => {
  // Runs before useDental reads the preference, so the first paint is already right.
  const [migrated] = useState(migrateLegacyIconStyle);
  const [dental, setDental] = useDental();

  useEffect(() => {
    // Tell the rest of the page (portal / shell toggles) about the migrated value.
    if (migrated) applyDental(readDental());
  }, [migrated]);

  const setStyle = useCallback((next: IconStyle) => setDental(next === 'tooth'), [setDental]);
  const toggle = useCallback(() => setDental(!dental), [dental, setDental]);

  return { style: dental ? 'tooth' : 'stone', setStyle, toggle };
};
