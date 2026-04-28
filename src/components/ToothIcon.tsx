import type { CSSProperties } from 'react';

export type ToothVariant = 'black' | 'white';

export type ToothIconProps = {
  variant: ToothVariant;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

const TOOTH_PATH =
  'M30 14c-9 0-16 7-16 17 0 7 2 12 4 18 2 5 4 13 5 22 1 8 4 13 8 13 4 0 6-3 7-10 1-7 2-11 5-11 3 0 4 4 5 11 1 7 3 10 7 10 4 0 7-5 8-13 1-9 3-17 5-22 2-6 4-11 4-18 0-10-7-17-16-17-5 0-9 2-12 5-3-3-7-5-12-5z';

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
        d={TOOTH_PATH}
        fill="rgba(0, 0, 0, 0.3)"
        transform="translate(0, 3)"
      />
      <path
        d={TOOTH_PATH}
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
    </svg>
  );
};

export default ToothIcon;
