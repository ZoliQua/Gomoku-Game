import { memo, useMemo } from 'react';
import { useMessages } from '../arcade';
import type { IconStyle } from '../hooks/useIconStyle';
import { MESSAGES } from '../i18n';
import { BOARD_SIZE } from '../logic/constants';
import type { Board, WinningLine as Line } from '../logic/types';
import { Cell } from './Cell';
import styles from './GameBoard.module.css';
import { GobanBackground } from './GobanBackground';
import { WinningLine } from './WinningLine';

export type GameBoardProps = {
  board: Board;
  winningLine: Line | null;
  lastMoveIndex: number | null;
  focusIndex?: number;
  /** True when the human may place a stone right now. */
  interactive?: boolean;
  iconStyle?: IconStyle;
  onPlace?: (index: number) => void;
  onFocusCell?: (index: number) => void;
  /** `mini` renders the compact, non-interactive landing-page variant. */
  variant?: 'full' | 'mini';
};

const noop = () => {};

const gridStyle = {
  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
  gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
};

export const GameBoard = memo(function GameBoard({
  board,
  winningLine,
  lastMoveIndex,
  focusIndex = -1,
  interactive = false,
  iconStyle = 'stone',
  onPlace = noop,
  onFocusCell = noop,
  variant = 'full',
}: GameBoardProps) {
  const winningSet = useMemo(() => (winningLine ? new Set(winningLine) : null), [winningLine]);
  const t = useMessages(MESSAGES);

  if (variant === 'mini') {
    return (
      <div className={`${styles.frame} ${styles.mini}`} aria-hidden="true">
        <div className={styles.board} style={gridStyle}>
          <GobanBackground />
          {board.map((value, index) => (
            <div key={index} className={styles.cell}>
              {value !== null && (
                <span
                  className={[
                    styles.dot,
                    value === 'B' ? styles.dotBlack : styles.dotWhite,
                    lastMoveIndex === index ? styles.dotLast : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
              )}
            </div>
          ))}
          {winningLine && <WinningLine line={winningLine} />}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      <div className={styles.board} role="group" aria-label={t('board')} style={gridStyle}>
        <GobanBackground />
        {board.map((value, index) => (
          <Cell
            key={index}
            index={index}
            value={value}
            isFocused={focusIndex === index}
            isWinning={winningSet ? winningSet.has(index) : false}
            isLastMove={lastMoveIndex === index}
            isInteractive={interactive}
            iconStyle={iconStyle}
            onSelect={onPlace}
            onFocusCell={onFocusCell}
          />
        ))}
        {winningLine && <WinningLine line={winningLine} />}
      </div>
    </div>
  );
});

export default GameBoard;
