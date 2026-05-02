import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { TierChip } from '../components/TierChip';
import { AppBar } from '../components/AppBar';
import { IconShare, IconSpotify, IconHeart, IconChat } from '../components/icons';
import { useStore } from '../store';
import { ago, longDate } from '../lib/dates';
import { shareLink } from '../lib/share';

type SetlistItem = {
  n: number;
  t: string;
  d: string;
  highlight?: boolean;
};

// Tiny mock setlists keyed by artistSlug. Real data comes from setlist.fm later.
const setlists: Record<string, SetlistItem[]> = {
  metallica: [
    { n: 1, t: 'Whiplash', d: '4:08' },
    { n: 2, t: 'For Whom the Bell Tolls', d: '5:12' },
    { n: 3, t: 'Ride the Lightning', d: '6:36' },
    { n: 4, t: 'Lux Æterna', d: '3:22' },
    { n: 5, t: 'Screaming Suicide', d: '4:51' },
    { n: 6, t: 'Welcome Home (Sanitarium)', d: '6:28' },
    { n: 7, t: 'Sad But True', d: '5:24' },
    { n: 8, t: 'Master of Puppets', d: '8:47', highlight: true },
    { n: 9, t: 'Fade to Black', d: '7:01' },
    { n: 10, t: 'Nothing Else Matters', d: '6:17' },
    { n: 11, t: 'Enter Sandman', d: '5:36' },
  ],
  xg: [
    { n: 1, t: 'NEW DANCE', d: '3:22' },
    { n: 2, t: 'GRL GVNG', d: '3:01' },
    { n: 3, t: 'WOKE UP', d: '3:14' },
    { n: 4, t: 'PUPPET SHOW', d: '3:09' },
    { n: 5, t: 'IS THIS LOVE', d: '3:46' },
    { n: 6, t: 'X-GENE', d: '3:20', highlight: true },
    { n: 7, t: 'LEFT RIGHT', d: '3:11' },
  ],
  'phoebe-bridgers': [
    { n: 1, t: 'Motion Sickness', d: '4:01' },
    { n: 2, t: 'Garden Song', d: '3:32' },
    { n: 3, t: 'Punisher', d: '3:06' },
    { n: 4, t: 'Moon Song', d: '4:47', highlight: true },
    { n: 5, t: 'Kyoto', d: '3:04' },
    { n: 6, t: 'I Know the End', d: '5:32' },
  ],
};

export function GigDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const gig = useStore((s) => s.gigs.find((g) => String(g.id) === id));
  const toggleLike = useStore((s) => s.toggleLike);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const handleShare = async () => {
    if (!gig) return;
    const result = await shareLink({
      title: `${gig.artist} on gigly`,
      text: `${gig.artist} at ${gig.venue} — ${gig.tier}`,
    });
    if (result === 'copied') {
      setShareNotice('link copied');
      setTimeout(() => setShareNotice(null), 1800);
    }
  };

  if (!gig) {
    return (
      <div className="gigly-app">
        <AppBar title="GIG" back small />
        <div className="scroll">
          <div className="empty">
            <div className="hand">that gig isn't on file</div>
            <div className="body">it might have been removed.</div>
          </div>
        </div>
      </div>
    );
  }

  const setlist = setlists[gig.artistSlug] ?? [];
  const gigItScore = (8 + ((gig.id * 13) % 20) / 10).toFixed(1);
  const ratingsCount = 800 + ((gig.id * 211) % 900);

  return (
    <div className="gigly-app">
      <AppBar
        small
        back
        title="GIG"
        display={false}
        right={
          <button className="icon-btn" aria-label="Share" onClick={handleShare}>
            <IconShare />
          </button>
        }
      />
      {shareNotice && (
        <div className="toast" style={{ top: 16 }}>{shareNotice}</div>
      )}

      <div className="scroll" style={{ padding: '0 0 100px' }}>
        {/* Hero */}
        <div style={{ position: 'relative', height: 220, overflow: 'hidden', background: 'var(--ink-fixed)' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${gig.photo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'grayscale(0.2) contrast(1.1) brightness(0.7)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 30%, rgba(43,32,24,0.85) 100%)',
            }}
          />
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 14, color: 'var(--cream)' }}>
            <Link
              to={`/venue/${gig.venueSlug}`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.18em',
                opacity: 0.85,
                color: 'var(--cream)',
                textDecoration: 'none',
              }}
            >
              {gig.venue.toUpperCase()} · {gig.date}
            </Link>
            <Link
              to={`/artist/${gig.artistSlug}`}
              style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontSize: 32,
                lineHeight: 1,
                marginTop: 6,
                letterSpacing: '-0.01em',
                color: 'var(--cream)',
                textDecoration: 'none',
              }}
            >
              {gig.artist}
            </Link>
          </div>
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <div
              className="stamp-imprint"
              style={{
                background: 'rgba(244,236,216,0.15)',
                color: '#FBE8B0',
                borderColor: '#FBE8B0',
              }}
            >
              LOGGED
            </div>
          </div>
        </div>

        {/* Score row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '14px 16px 4px' }}>
          <div className="card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-soft)' }}>
              {gig.scope === 'self' ? 'YOUR TAKE' : `${gig.user.toUpperCase()}'S TAKE`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <TierChip tier={gig.tier} size="lg" />
            </div>
          </div>
          <div className="card">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--rust)' }}>
              GIG IT SCORE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--rust)' }}>
                {gigItScore}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-soft)' }}>
                /10 · {ratingsCount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Review */}
        {gig.review && (
          <div style={{ padding: '4px 16px 0' }}>
            <div className="section-head">{gig.scope === 'self' ? 'Your review' : `${gig.user}'s review`}</div>
            <div className="card">
              <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--paper-deep)', margin: 0, lineHeight: 1.45 }}>
                "{gig.review}"
              </p>
              {gig.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                  {gig.tags.map((t, i) => (
                    <span
                      key={t}
                      className={`sticker ${i % 2 ? 'pink' : ''}`}
                      style={{ transform: `rotate(${(i % 3 - 1) * 1.5}deg)` }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 12 }}>
                <button
                  className={`act ${gig.liked ? 'liked' : ''}`}
                  onClick={() => toggleLike(gig.id)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                    color: gig.liked ? 'var(--terracotta)' : 'var(--ink-soft)',
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                  }}
                >
                  <IconHeart size={14} fill={gig.liked ? 'currentColor' : 'none'} /> {gig.likes}
                </button>
                <button
                  onClick={() => navigate(`/gig/${gig.id}/comments`)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                    color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)', fontSize: 11,
                  }}
                >
                  <IconChat size={14} /> {gig.comments.length} comments
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faded)', marginLeft: 'auto' }}>
                  {ago(gig.dateISO)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Setlist */}
        <div style={{ padding: '0 16px' }}>
          <div className="section-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Setlist · via setlist.fm</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faded)' }}>
              {setlist.length > 0 ? `${setlist.length} songs` : 'pending sync'}
            </span>
          </div>
          {setlist.length > 0 ? (
            <div className="card" style={{ padding: '4px 14px' }}>
              {setlist.map((s) => (
                <div key={s.n} className="setlist-row">
                  <span className="setlist-num">{String(s.n).padStart(2, '0')}</span>
                  <span
                    className="setlist-title"
                    style={s.highlight ? { color: 'var(--terracotta)', fontWeight: 600 } : {}}
                  >
                    {s.t}{' '}
                    {s.highlight && (
                      <span style={{ fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--terracotta)', marginLeft: 6 }}>
                        ← unreal
                      </span>
                    )}
                  </span>
                  <span className="setlist-dur">{s.d}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{ margin: 0 }}>
              <div className="hand">setlist not synced yet</div>
              <div className="body">we'll pull it from setlist.fm soon.</div>
            </div>
          )}

          {setlist.length > 0 && (
            <>
              <button
                style={{
                  width: '100%',
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  background: 'var(--ink-fixed)',
                  color: 'var(--cream)',
                  border: 'none',
                  borderRadius: 4,
                  padding: '14px 18px',
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: 'inset 0 -2px 0 #000, 0 1px 0 rgba(58,46,34,0.15)',
                  cursor: 'pointer',
                }}
              >
                <IconSpotify size={18} /> Make a Spotify playlist
              </button>
              <div style={{ textAlign: 'center', marginTop: 8, fontFamily: 'var(--font-serif)', fontSize: 12, fontStyle: 'italic', color: 'var(--ink-faded)' }}>
                or open in Apple Music
              </div>
            </>
          )}
        </div>

        <div style={{ padding: '16px 16px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faded)', letterSpacing: '0.06em' }}>
          {longDate(gig.dateISO).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
