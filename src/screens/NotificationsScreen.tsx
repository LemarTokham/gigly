import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/AppBar';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../store';
import { IconHeart, IconChat, IconUser, IconCal } from '../components/icons';

export function NotificationsScreen() {
  const navigate = useNavigate();
  const notifications = useStore((s) => s.notifications);
  const markRead = useStore((s) => s.markNotificationsRead);

  useEffect(() => {
    // After a small delay so the user sees what was unread
    const t = setTimeout(() => markRead(), 800);
    return () => clearTimeout(t);
  }, [markRead]);

  return (
    <div className="gigly-app">
      <AppBar title="notifications" back small />
      <div className="scroll">
        {notifications.length === 0 ? (
          <EmptyState hand="all caught up" body="check back after the next gig." />
        ) : (
          notifications.map((n) => {
            const onClick = () => {
              if (n.gigId) navigate(`/gig/${n.gigId}`);
              else if (n.kind === 'follow' && n.actor) navigate('/friends');
              else if (n.kind === 'upcoming') navigate('/discover');
            };
            return (
              <button
                key={n.id}
                onClick={onClick}
                className={`notif ${n.read ? '' : 'unread'}`}
                style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {n.actor ? (
                    <Avatar name={n.actor} size={28} color={pickAva(n.actor)} />
                  ) : (
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--mustard)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-fixed)' }}>
                      <IconCal size={14} />
                    </span>
                  )}
                </div>
                <div className="body">
                  {n.actor && <span style={{ fontWeight: 600 }}>{n.actor} </span>}
                  {n.body}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    {n.kind === 'like' && <IconHeart size={11} />}
                    {n.kind === 'comment' && <IconChat size={11} />}
                    {n.kind === 'follow' && <IconUser size={11} />}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'var(--ink-faded)' }}>
                      {n.kind.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span className="ago">{n.ago}</span>
              </button>
            );
          })
        )}
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
