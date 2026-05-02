import type { CSSProperties } from 'react';
import type { Tier } from '../types';

const palette: Record<Tier, string> = {
  loved: 'var(--terracotta)',
  mid: 'var(--mustard-deep)',
  nah: 'var(--plum)',
};

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, { fs: number; pad: string; borderWidth: number; tracking: string }> = {
  sm: { fs: 9,  pad: '2px 6px', borderWidth: 1,   tracking: '0.18em' },
  md: { fs: 10, pad: '3px 8px', borderWidth: 1.5, tracking: '0.2em' },
  lg: { fs: 13, pad: '5px 12px', borderWidth: 2,  tracking: '0.22em' },
};

type Props = {
  tier: Tier;
  size?: Size;
  rotate?: number;
  style?: CSSProperties;
};

export function TierChip({ tier, size = 'md', rotate = -1.5, style }: Props) {
  const c = palette[tier];
  const s = sizes[size];
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontSize: s.fs,
        letterSpacing: s.tracking,
        textTransform: 'uppercase',
        padding: s.pad,
        border: `${s.borderWidth}px solid ${c}`,
        color: c,
        borderRadius: 2,
        transform: `rotate(${rotate}deg)`,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {tier}
    </span>
  );
}
