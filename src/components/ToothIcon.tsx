import type { CSSProperties } from 'react';

export type ToothVariant = 'black' | 'white';

export type ToothIconProps = {
  variant: ToothVariant;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

/** Incisor (white player) — the kit's `Tooth` outline. */
const TOOTH_PATH =
  'M30 14c-9 0-16 7-16 17 0 7 2 12 4 18 2 5 4 13 5 22 1 8 4 13 8 13 4 0 6-3 7-10 1-7 2-11 5-11 3 0 4 4 5 11 1 7 3 10 7 10 4 0 7-5 8-13 1-9 3-17 5-22 2-6 4-11 4-18 0-10-7-17-16-17-5 0-9 2-12 5-3-3-7-5-12-5z';

/** Wide, flat-crowned molar (black player) — the kit's `Molar` outline, so the
 *  two players differ by shape as well as by colour. */
const MOLAR_PATH =
  'M18 22c0-8 6-12 14-12 6 0 10 3 18 3s12-3 18-3c8 0 14 4 14 12 0 10-4 18-6 26-2 10-2 22-6 30-3 6-8 6-10 0-2-8-3-16-10-16s-8 8-10 16c-2 6-7 6-10 0-4-8-4-20-6-30-2-8-6-16-6-26z';

export const ToothIcon = ({
  variant,
  size = '100%',
  className,
  style,
  title,
}: ToothIconProps) => {
  const isBlack = variant === 'black';
  const fill = isBlack ? 'var(--gmk-tooth-black-fill)' : 'var(--gmk-tooth-white-fill)';
  const stroke = isBlack ? 'var(--gmk-tooth-black-stroke)' : 'var(--gmk-tooth-white-stroke)';
  const d = isBlack ? MOLAR_PATH : TOOTH_PATH;
  const highlight = isBlack ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.7)';
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {/* drop shadow */}
      <path
        d={d}
        fill="rgba(0, 0, 0, 0.3)"
        transform="translate(0, 3)"
      />
      <path
        d={d}
        fill={fill}
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* enamel highlight curve */}
      <path
        d="M38 30c-2 4-3 9-3 13"
        fill="none"
        stroke={highlight}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {isBlack && (
        // occlusal fissure: the molar's chewing surface, a second shape cue
        <path
          d="M34 22q8 7 16 0t16 0"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

export default ToothIcon;
