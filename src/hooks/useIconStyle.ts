import { useCallback, useState } from 'react';

export type IconStyle = 'stone' | 'tooth';

const STORAGE_KEY = 'gomoku.iconStyle';

const read = (): IconStyle => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === 'tooth' ? 'tooth' : 'stone';
  } catch {
    return 'stone';
  }
};

const write = (value: IconStyle): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // ignore quota / privacy mode errors
  }
};

export const useIconStyle = (): {
  style: IconStyle;
  setStyle: (next: IconStyle) => void;
  toggle: () => void;
} => {
  const [style, setStyleState] = useState<IconStyle>(() => read());

  const setStyle = useCallback((next: IconStyle) => {
    setStyleState((prev) => {
      if (prev === next) return prev;
      write(next);
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    setStyleState((prev) => {
      const next: IconStyle = prev === 'stone' ? 'tooth' : 'stone';
      write(next);
      return next;
    });
  }, []);

  return { style, setStyle, toggle };
};
