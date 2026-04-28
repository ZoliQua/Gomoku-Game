import { memo } from 'react';
import type { IconStyle } from '../hooks/useIconStyle';
import { BOARD_SIZE } from '../logic/constants';
import type { Cell as CellValue } from '../logic/types';
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
  return value === 'B'
    ? `Row ${row}, column ${col}, black ${noun}`
    : `Row ${row}, column ${col}, white ${noun}`;
};

const Piece = ({ value, iconStyle }: { value: 'B' | 'W'; iconStyle: IconStyle }) => {
  if (iconStyle === 'tooth') {
    return <ToothIcon variant={value === 'B' ? 'black' : 'white'} />;
  }
  return <Stone variant={value === 'B' ? 'black' : 'white'} />;
};

export const Cell = memo(({
  index,
  value,
  isFocused,
  isWinning,
  isLastMove,
  isInteractive,
  iconStyle,
  onSelect,
  onFocusCell,
}: CellProps) => {
  const handleClick = () => {
    if (!isInteractive) return;
    onSelect(index);
  };
  const handleFocus = () => onFocusCell(index);

  return (
    <button
      type="button"
      className={[
        'gmk-cell',
        value ? `gmk-cell-${value.toLowerCase()}` : 'gmk-cell-empty',
        isFocused ? 'gmk-cell-focused' : '',
        isWinning ? 'gmk-cell-winning' : '',
        isLastMove ? 'gmk-cell-last' : '',
      ].filter(Boolean).join(' ')}
      aria-label={ariaForValue(index, value, iconStyle)}
      onClick={handleClick}
      onFocus={handleFocus}
      tabIndex={isFocused ? 0 : -1}
      data-index={index}
    >
      {value !== null && (
        <span className={`gmk-stone gmk-piece-${iconStyle}`} aria-hidden="true">
          <Piece value={value} iconStyle={iconStyle} />
        </span>
      )}
      {isLastMove && value !== null && (
        <span className="gmk-last-marker" aria-hidden="true" />
      )}
    </button>
  );
});

Cell.displayName = 'Cell';

export default Cell;
