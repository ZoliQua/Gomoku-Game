import type { ReactNode } from 'react';
import { formatNumber, useDental, useIsTouch, useKitMessages, useLang, useMessages, type RulesSection } from './arcade';
import { Stone } from './components/Stone';
import { ToothIcon } from './components/ToothIcon';
import { MESSAGES } from './i18n';
import { BOARD_SIZE, WIN_LENGTH } from './logic/constants';
import { winScoreRange } from './logic/scoring';

const STEP = 38;
const PIECE = 34;

/** Rules diagram: five black pieces in a row (with a check mark) and a few white ones that did not make it. */
export function FiveDiagram() {
  const m = useMessages(MESSAGES);
  const [dental] = useDental();
  const [lang] = useLang();
  const X0 = 20;
  const at = (i: number) => X0 + i * STEP;
  const piece = (variant: 'black' | 'white', x: number, y: number) => (
    <g key={`${variant}-${x}-${y}`} transform={`translate(${x} ${y})`}>
      {dental ? <ToothIcon variant={variant} size={PIECE} /> : <Stone variant={variant} size={PIECE} />}
    </g>
  );
  const rowY = 84;
  return (
    <svg viewBox="0 0 240 170" role="img" aria-label={m('rulesDiagramLabel', { win: formatNumber(WIN_LENGTH, lang) })} style={{ width: '100%', maxWidth: 320, height: 'auto', display: 'block', margin: '8px auto' }}>
      <rect x={4} y={30} width={232} height={134} rx={8} fill="#d2a05c" stroke="var(--panel-border-strong)" />
      <g stroke="rgba(60,38,14,0.85)" strokeWidth={1}>
        <path d={`M${X0} ${rowY + PIECE / 2}H${at(4) + PIECE}`} />
        <path d={`M${X0} ${rowY - STEP + PIECE / 2}H${at(4) + PIECE}`} />
        <path d={`M${X0} ${rowY + STEP + PIECE / 2}H${at(4) + PIECE}`} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${at(i) + PIECE / 2} 34V160`} />
        ))}
      </g>
      {[0, 2, 3].map((i) => piece('white', at(i), rowY - STEP))}
      {[1, 4].map((i) => piece('white', at(i), rowY + STEP))}
      {[0, 1, 2, 3, 4].map((i) => piece('black', at(i), rowY))}
      <rect x={at(0) - 3} y={rowY - 3} width={at(4) + PIECE - at(0) + 6} height={PIECE + 6} rx={PIECE / 2} fill="none" stroke="var(--text)" strokeWidth={2} strokeDasharray="5 3" />
      <g fontSize="13" fontWeight="700" fill="var(--text)">
        <path d="M215 12l5 6 11-13" fill="none" stroke="var(--ok)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        <text x={X0} y={16}>{m('rulesDiagramCaption', { win: formatNumber(WIN_LENGTH, lang) })}</text>
      </g>
    </svg>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- the diagram and its hook belong together
export function useRulesSections(): RulesSection[] {
  const m = useMessages(MESSAGES);
  const k = useKitMessages();
  const [lang] = useLang();
  const touch = useIsTouch();
  const num = (n: number) => formatNumber(n, lang);
  const range = (mode: 'easy' | 'medium' | 'hard') => {
    const r = winScoreRange(mode);
    return `${num(r.min)}–${num(r.max)}`;
  };
  const ios = typeof navigator !== 'undefined' && /iP(hone|od)/.test(navigator.userAgent);
  const mobile: ReactNode = (
    <ul>
      <li>{m('rulesMobileTap')}</li>
      <li>{m('rulesMobileRing')}</li>
      <li>{m('rulesMobileFs')}</li>
      {ios && <li>{k('iosHomeScreenTip')}</li>}
    </ul>
  );
  return [
    {
      id: 'goal',
      body: (
        <>
          <p>{m('rulesGoal', { size: num(BOARD_SIZE), win: num(WIN_LENGTH) })}</p>
          <FiveDiagram />
        </>
      ),
    },
    { id: 'play', body: <p>{touch ? m('rulesPlayTouch') : m('rulesPlayKeys')}</p> },
    {
      id: 'rules',
      body: (
        <ul>
          <li>{m('rulesRulesBoard', { win: num(WIN_LENGTH), over: num(WIN_LENGTH + 1) })}</li>
          <li>{m('rulesRulesOrder')}</li>
          <li>{m('rulesRulesSave')}</li>
        </ul>
      ),
    },
    {
      id: 'scoring',
      body: (
        <p>
          {m('rulesScoringText', {
            min: range('easy'),
            mid: range('medium'),
            max: range('hard'),
          })}
        </p>
      ),
    },
    { id: 'dental', body: <p>{m('rulesDentalText')}</p> },
    { id: 'mobile', body: mobile },
  ];
}
