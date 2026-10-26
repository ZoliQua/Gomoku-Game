import { memo, type ReactNode } from 'react';
import { BOARD_SIZE, STAR_POINT_COORDS } from '../logic/constants';
import styles from './GameBoard.module.css';

const VIEW = 100;
const cellSize = VIEW / BOARD_SIZE;
const halfCell = cellSize / 2;

const lineColor = 'var(--gmk-grid-line)';
const starColor = 'var(--gmk-star-point)';

/** Static goban: 15×15 hairlines through the cell centres + 9 star points. */
export const GobanBackground = memo(function GobanBackground() {
  const lines: ReactNode[] = [];

  // Horizontal lines (one per row, through the cell centres).
  for (let r = 0; r < BOARD_SIZE; r++) {
    const y = halfCell + r * cellSize;
    lines.push(
      <line
        key={`h${r}`}
        x1={halfCell}
        y1={y}
        x2={VIEW - halfCell}
        y2={y}
        stroke={lineColor}
        strokeWidth="0.18"
        vectorEffect="non-scaling-stroke"
      />,
    );
  }
  // Vertical lines.
  for (let c = 0; c < BOARD_SIZE; c++) {
    const x = halfCell + c * cellSize;
    lines.push(
      <line
        key={`v${c}`}
        x1={x}
        y1={halfCell}
        x2={x}
        y2={VIEW - halfCell}
        stroke={lineColor}
        strokeWidth="0.18"
        vectorEffect="non-scaling-stroke"
      />,
    );
  }

  return (
    <svg
      className={styles.goban}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {lines}
      {STAR_POINT_COORDS.map(([r, c]) => (
        <circle
          key={`star-${r}-${c}`}
          cx={halfCell + c * cellSize}
          cy={halfCell + r * cellSize}
          r={cellSize * 0.12}
          fill={starColor}
        />
      ))}
    </svg>
  );
});

export default GobanBackground;
