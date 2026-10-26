import { memo } from 'react';
import type { IconStyle } from '../hooks/useIconStyle';
import { BOARD_SIZE } from '../logic/constants';
import type { Cell as CellValue } from '../logic/types';
import styles from './GameBoard.module.css';
import { Stone } from './Stone';
import { ToothIcon } from './ToothIcon';

export type CellProps = {
  index: number;
  value: CellValue;
  isFocused: boolean;
  isWinning: boolean;
  isLastMove: boolean;
  isInteractive: boolean;
  iconStyle: IconStyle;
  onSelect: (index: number) => void;
  onFocusCell: (index: number) => void;
};

const ariaForValue = (index: number, value: CellValue, iconStyle: IconStyle): string => {
  const row = Math.floor(index / BOARD_SIZE) + 1;
  const col = (index % BOARD_SIZE) + 1;
  if (value === null) return `Row ${row}, column ${col}, empty`;
  const noun = iconStyle === 'tooth' ? 'tooth' : 'stone';
  return `Row ${row}, column ${col}, ${value === 'B' ? 'black' : 'white'} ${noun}`;
};

const Piece = ({ value, iconStyle }: { value: 'B' | 'W'; iconStyle: IconStyle }) =>
  iconStyle === 'tooth' ? (
    <ToothIcon variant={value === 'B' ? 'black' : 'white'} />
  ) : (
    <Stone variant={value === 'B' ? 'black' : 'white'} />
  );

/** One intersection of the full board: a real button (click / Enter to place). */
export const Cell = memo(function Cell({
  index,
  value,
  isFocused,
  isWinning,
  isLastMove,
  isInteractive,
  iconStyle,
  onSelect,
  onFocusCell,
}: CellProps) {
  const canPlace = isInteractive && value === null;
  return (
    <button
      type="button"
      className={[
        styles.cell,
        value === null ? styles.empty : '',
        canPlace ? styles.playable : '',
        isFocused ? styles.focused : '',
        isWinning ? styles.winning : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaForValue(index, value, iconStyle)}
      aria-disabled={!canPlace}
      onClick={() => {
        if (canPlace) onSelect(index);
      }}
      onFocus={() => onFocusCell(index)}
      tabIndex={isFocused ? 0 : -1}
      data-index={index}
    >
      {value !== null && (
        <span className={`${styles.piece} ${iconStyle === 'tooth' ? styles.tooth : ''}`} aria-hidden="true">
          <Piece value={value} iconStyle={iconStyle} />
        </span>
      )}
      {isLastMove && value !== null && <span className={styles.lastMarker} aria-hidden="true" />}
    </button>
  );
});

export default Cell;
