import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppBar } from '../components/AppBar';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../store';

export function CommentsScreen() {
  const { id = '' } = useParams();
  const gig = useStore((s) => s.gigs.find((g) => String(g.id) === id));
  const addComment = useStore((s) => s.addComment);
  const [body, setBody] = useState('');

  if (!gig) {
    return (
      <div className="gigly-app">
        <AppBar title="comments" back small />
        <div className="scroll">
          <EmptyState hand="that gig isn't on file" />
        </div>
      </div>
    );
  }

  const submit = () => {
    const txt = body.trim();
    if (!txt) return;
    addComment(gig.id, txt);
    setBody('');
  };

  return (
    <div className="gigly-app">
      <AppBar title={gig.artist} back small />
      <div className="scroll" style={{ padding: '0 16px 100px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-soft)', padding: '4px 0 12px' }}>
          {gig.venue.toUpperCase()} · {gig.date}
        </div>
        {gig.comments.length === 0 ? (
          <EmptyState hand="no comments yet" body="be the first." />
        ) : (
          <div>
            {gig.comments.map((c) => (
              <div key={c.id} className="comment">
                <Avatar name={c.user} size={28} color={pickAva(c.user)} />
                <div>
                  <div className="body">
                    <span className="who">{c.user}</span>
                    {c.body}
                  </div>
                  <div className="meta">{c.ago}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="comment-composer">
        <textarea
          className="field-textarea"
          placeholder="say something nice"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button onClick={submit} disabled={!body.trim()}>post</button>
      </div>
    </div>
  );
}

function pickAva(handle: string): 'olive' | 'terracotta' | 'mustard' | 'plum' | 'indigo' {
  const palette = ['olive', 'terracotta', 'mustard', 'plum', 'indigo'] as const;
  let h = 0;
  for (const c of handle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}
