import { useId, type CSSProperties } from 'react';

export type StoneVariant = 'black' | 'white';

export type StoneProps = {
  variant: StoneVariant;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

export const Stone = ({ variant, size = '100%', className, style, title }: StoneProps) => {
  const isBlack = variant === 'black';
  // Unique per instance: 225 cells used to share two duplicate element ids.
  const gradientId = `gmk-stone-${variant}-${useId().replace(/:/g, '')}`;
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
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="32%" r="68%">
          {isBlack ? (
            <>
              <stop offset="0%" stopColor="#5a5a5d" />
              <stop offset="55%" stopColor="#1f1f22" />
              <stop offset="100%" stopColor="#000" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1ebd5" />
              <stop offset="100%" stopColor="#c8b890" />
            </>
          )}
        </radialGradient>
      </defs>
      {/* drop shadow */}
      <circle cx="50" cy="54" r="40" fill="rgba(0,0,0,0.32)" />
      <circle cx="50" cy="50" r="40" fill={`url(#${gradientId})`} />
      {!isBlack && (
        // subtle rim for white stone so it stands out on the board
        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(120,90,40,0.35)" strokeWidth="1" />
      )}
    </svg>
  );
};

export default Stone;
