import { useStore } from '../store';

type Props = {
  size?: number;
  rotate?: number;
};

export function Wordmark({ size = 76, rotate = -3 }: Props) {
  const theme = useStore((s) => s.theme);
  const src = theme === 'midnight'
    ? '/assets/gigly-ticket-dark.png'
    : '/assets/gigly-ticket-light.png';
  return (
    <img
      src={src}
      alt="gigly"
      style={{
        height: size,
        width: 'auto',
        transform: `rotate(${rotate}deg)`,
        display: 'block',
        // Tickets have transparent surrounds; keep the shadow soft so it sits on paper.
        filter: 'drop-shadow(0 1px 1px rgba(58,46,34,0.12))',
        // Ticket is roughly 1.7:1, leave a little breathing room.
        marginLeft: -4,
      }}
    />
  );
}
