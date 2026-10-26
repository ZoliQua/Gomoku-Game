import { useEffect, useState } from 'react';
import type { ArcadeDemoProps } from '../arcade';
import { GameBoard } from '../components/GameBoard';
import { createDemoState, demoStep } from '../logic/autopilot';

const DEMO_MOVE_MS = 300;
const DEMO_RESTART_MS = 1500;

const rng = () => Math.random();

/**
 * Attract mode for the portal landing page: the real Gomoku reducer with the
 * Medium heuristic playing both sides. No keyboard, no stats, no saves, no sound.
 */
export function GomokuDemo({ active = true }: ArcadeDemoProps) {
  const [state, setState] = useState(createDemoState);

  // One timeout per step: a move while the round is in play, a fresh round after it ends.
  useEffect(() => {
    if (!active) return;
    const over = state.status !== 'playing';
    const id = window.setTimeout(
      () => setState((prev) => (over ? createDemoState() : demoStep(prev, rng))),
      over ? DEMO_RESTART_MS : DEMO_MOVE_MS,
    );
    return () => window.clearTimeout(id);
  }, [active, state]);

  return (
    <div className="arc-demo">
      <GameBoard
        board={state.board}
        winningLine={state.winningLine}
        lastMoveIndex={state.lastMoveIndex}
        variant="mini"
      />
    </div>
  );
}

export default GomokuDemo;
