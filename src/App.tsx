import { ArcadeShell } from './arcade';
import { GomokuGame } from './GomokuGame';

export default function App() {
  return (
    <ArcadeShell gameId="gomoku">
      <GomokuGame />
    </ArcadeShell>
  );
}
