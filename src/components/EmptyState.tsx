type Props = {
  hand: string;
  body?: string;
};

export function EmptyState({ hand, body }: Props) {
  return (
    <div className="empty">
      <div className="hand">{hand}</div>
      {body && <div className="body">{body}</div>}
    </div>
  );
}
