import type { AvaColor } from '../types';

const colors: Record<AvaColor, string> = {
  olive: '#6F7A3D',
  terracotta: '#C8553D',
  mustard: '#D4A24C',
  plum: '#5C3A4E',
  indigo: '#364C6E',
};

type Props = {
  name: string;
  color?: AvaColor;
  size?: number;
};

export function Avatar({ name, color = 'olive', size = 22 }: Props) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Serif Display', Georgia, serif",
        fontSize: size * 0.5,
        color: '#F4ECD8',
        background: colors[color],
        flexShrink: 0,
      }}
    >
      {name[0]}
    </span>
  );
}
