type TapeKind = 'yellow' | 'pink' | 'right' | null | undefined;

type Props = {
  photo: string;
  caption?: string;
  rotate?: number;
  tape?: TapeKind;
  width?: number | string;
};

export function Polaroid({ photo, caption, rotate = -2, tape, width = 120 }: Props) {
  const tapeBackground =
    tape === 'pink' ? 'var(--bg-tape-pink)' : 'var(--bg-tape)';
  const isRight = tape === 'right';

  return (
    <div
      className="polaroid"
      style={{ width, transform: `rotate(${rotate}deg)` }}
    >
      {tape && (
        <div
          className="tape"
          style={{
            left: isRight ? 'auto' : -8,
            right: isRight ? -8 : 'auto',
            top: -6,
            transform: `rotate(${isRight ? 10 : -12}deg)`,
            background: tapeBackground,
          }}
        />
      )}
      <div
        className="photo"
        style={{ backgroundImage: `url(${photo})` }}
      />
      {caption && <div className="cap">{caption}</div>}
    </div>
  );
}
