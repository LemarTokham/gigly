type Props = {
  n?: number;
  size?: number;
};

export function Stars({ n = 0, size = 14 }: Props) {
  const out = [];
  for (let i = 1; i <= 5; i++) {
    let src: string;
    if (n >= i) src = '/assets/icons/star-filled.svg';
    else if (n >= i - 0.5) src = '/assets/icons/star-half.svg';
    else src = '/assets/icons/star-empty.svg';
    out.push(<img key={i} src={src} width={size} height={size} alt="" />);
  }
  return (
    <span className="stars-row" style={{ display: 'flex', gap: 1 }}>
      {out}
    </span>
  );
}
