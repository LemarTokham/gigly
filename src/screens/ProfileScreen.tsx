import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Polaroid } from '../components/Polaroid';
import { BottomNav } from '../components/BottomNav';
import { EmptyState } from '../components/EmptyState';
import { Avatar } from '../components/Avatar';
import { IconShare, IconSettings } from '../components/icons';
import { useShallow } from 'zustand/react/shallow';
import { selectTopGigs, selectYouFeed, selectVenueStats, useStore } from '../store';
import { ticketDate } from '../lib/dates';
import { shareLink } from '../lib/share';

const tapes: ('yellow' | 'pink' | null)[] = ['yellow', 'pink', null];

function shelfPolaroid(i: number): { rotate: number; tape: 'yellow' | 'pink' | null } {
  const rotates = [-3, 2, -1.5, 1.5, -2, 2.5, -1, 1.2];
  return { rotate: rotates[i % rotates.length], tape: tapes[i % tapes.length] };
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const top3 = useStore(useShallow(selectTopGigs));
  const youFeed = useStore(useShallow(selectYouFeed));
  const stats = useStore(useShallow(selectVenueStats));

  const [tab, setTab] = useState<'shelf' | 'map' | 'upcoming'>('shelf');
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  if (!user) return null;

  const handleShare = async () => {
    const result = await shareLink({
      title: `${user.name} on gigly`,
      text: `${user.bio}`,
    });
    if (result === 'copied') {
      setShareNotice('link copied');
      setTimeout(() => setShareNotice(null), 1800);
    }
  };

  const lovedCount = youFeed.filter((g) => g.tier === 'loved').length;

  return (
    <div className="gigly-app">
      <div className="app-bar">
        <div className="title">you</div>
        <div className="actions">
          <button className="icon-btn" aria-label="Share" onClick={handleShare}>
            <IconShare />
          </button>
          <button className="icon-btn" aria-label="Settings" onClick={() => navigate('/settings')}>
            <IconSettings />
          </button>
        </div>
      </div>
      {shareNotice && <div className="toast" style={{ top: 16 }}>{shareNotice}</div>}

      <div className="scroll">
        {/* Profile header */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '4px 0 14px' }}>
          <Avatar name={user.name} color={user.avaColor} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', lineHeight: 1.1 }}>
              {user.name}
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
              @{user.handle} · {user.city} · seen {youFeed.length}
            </div>
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--ink)', marginTop: 4 }}>
              {user.bio}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: '8px 4px' }}>
          {[
            { v: String(youFeed.length), l: 'gigs' },
            { v: String(new Set(youFeed.map((g) => g.artistSlug)).size), l: 'artists' },
            { v: String(stats.venues), l: 'venues' },
            { v: String(lovedCount), l: 'loved' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                textAlign: 'center',
                padding: '6px 0',
                borderRight: i < 3 ? '1px dashed var(--border-soft)' : 'none',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}>
                {s.v}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-soft)', textTransform: 'uppercase', marginTop: 4 }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Top 3 */}
        <div className="section-head" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
          <span>your top 3 · pinned</span>
          <button
            onClick={() => navigate('/settings')}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--terracotta)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            EDIT
          </button>
        </div>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-around', padding: '8px 0 18px', overflow: 'visible' }}>
          {top3.length === 0 ? (
            <EmptyState hand="pick your top 3" body="open settings to pin them." />
          ) : (
            top3.map((g, i) => (
              <button
                key={g.id}
                onClick={() => navigate(`/gig/${g.id}`)}
                style={{ position: 'relative', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                <Polaroid
                  photo={g.photo}
                  caption={g.artist}
                  rotate={[-3, 2, -1.5][i % 3]}
                  tape={tapes[i % 3]}
                  width={108}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    left: '50%',
                    transform: `translateX(-50%) rotate(${[-1.5, 1, -0.75][i % 3]}deg)`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    letterSpacing: '0.18em',
                    color: 'var(--ink-faded)',
                  }}
                >
                  {ticketDate(g.dateISO)}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Tabs */}
        <div className="segmented" style={{ padding: '4px 0 8px', margin: '4px 0 12px' }}>
          {(['shelf', 'map', 'upcoming'] as const).map((t) => (
            <button key={t} className={`seg ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'shelf' && (
          youFeed.length === 0 ? (
            <EmptyState hand="nothing logged yet" body="tap + below to log your first gig." />
          ) : (
            <>
              <div className="gallery">
                {youFeed.slice(0, 8).map((g, i) => {
                  const { rotate, tape } = shelfPolaroid(i);
                  return (
                    <button
                      key={g.id}
                      onClick={() => navigate(`/gig/${g.id}`)}
                      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <Polaroid photo={g.photo} caption={g.artist} rotate={rotate} tape={tape} width="100%" />
                    </button>
                  );
                })}
              </div>
              {youFeed.length > 8 && (
                <button
                  onClick={() => navigate('/gallery')}
                  style={{
                    display: 'block', margin: '24px auto 0',
                    background: 'transparent', border: 'none',
                    fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-soft)',
                    cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--terracotta)',
                  }}
                >
                  see the whole shelf →
                </button>
              )}
            </>
          )
        )}

        {tab === 'map' && (
          <button
            onClick={() => navigate('/map')}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            open the venue map →
          </button>
        )}

        {tab === 'upcoming' && (
          <UpcomingPanel onOpen={(slug) => navigate(`/artist/${slug}`)} />
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function UpcomingPanel({ onOpen }: { onOpen: (slug: string) => void }) {
  const upcoming = useStore((s) => s.upcoming);
  if (upcoming.length === 0) {
    return <EmptyState hand="no upcoming on the radar" />;
  }
  return (
    <div className="card" style={{ padding: '4px 14px' }}>
      {upcoming.slice(0, 5).map((u, i) => (
        <button
          key={u.id}
          onClick={() => onOpen(u.artistSlug)}
          style={{
            display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 12,
            padding: '11px 0',
            borderBottom: i < Math.min(4, upcoming.length - 1) ? '1px dashed var(--border-soft)' : 'none',
            width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
              {u.artist}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-faded)', marginTop: 2 }}>
              {u.venue.toUpperCase()} · {u.date.toUpperCase()}
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--rust)' }}>{u.score}</div>
        </button>
      ))}
    </div>
  );
}
