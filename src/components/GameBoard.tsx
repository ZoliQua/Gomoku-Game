import { useMemo } from 'react';
import type { IconStyle } from '../hooks/useIconStyle';
import { BOARD_SIZE } from '../logic/constants';
import type { GameAction, GameState } from '../logic/types';
import { Cell } from './Cell';
import { GobanBackground } from './GobanBackground';
import { WinningLine } from './WinningLine';

export type GameBoardProps = {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isHumanTurn: boolean;
  iconStyle: IconStyle;
};

export const GameBoard = ({ state, dispatch, isHumanTurn, iconStyle }: GameBoardProps) => {
  const interactive = state.status === 'playing' && isHumanTurn;

  const winningSet = useMemo(() => {
    if (!state.winningLine) return null;
    return new Set(state.winningLine);
  }, [state.winningLine]);

  const onSelect = (index: number) => dispatch({ type: 'place', index });
  const onFocusCell = (index: number) => dispatch({ type: 'focus', index });

  return (
    <div
      className="gmk-board"
      role="grid"
      aria-label="Gomoku board"
      style={{
        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
      }}
    >
      <GobanBackground />
      {state.board.map((value, index) => (
        <Cell
          key={index}
          index={index}
          value={value}
          isFocused={state.focusIndex === index}
          isWinning={winningSet ? winningSet.has(index) : false}
          isLastMove={state.lastMoveIndex === index}
          isInteractive={interactive}
          iconStyle={iconStyle}
          onSelect={onSelect}
          onFocusCell={onFocusCell}
        />
      ))}
      {state.winningLine && <WinningLine line={state.winningLine} />}
    </div>
  );
};

export default GameBoard;
