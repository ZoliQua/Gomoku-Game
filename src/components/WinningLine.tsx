import { BOARD_SIZE } from '../logic/constants';
import type { WinningLine as Line } from '../logic/types';
import styles from './GameBoard.module.css';

export type WinningLineProps = {
  line: Line;
};

const VIEW = 100;
const cellSize = VIEW / BOARD_SIZE;
const halfCell = cellSize / 2;

const cellCenter = (index: number): { x: number; y: number } => {
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  return {
    x: halfCell + col * cellSize,
    y: halfCell + row * cellSize,
  };
};

export const WinningLine = ({ line }: WinningLineProps) => {
  if (line.length < 2) return null;
  const start = cellCenter(line[0] as number);
  const end = cellCenter(line[line.length - 1] as number);

  return (
    <svg
      className={styles.winLine}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="var(--gmk-win-line)"
        strokeWidth="3"
        strokeLinecap="round"
        className={styles.winStroke}
        pathLength={100}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export default WinningLine;
