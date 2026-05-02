import { useNavigate, useParams } from 'react-router-dom';
import { AppBar } from '../components/AppBar';
import { TierChip } from '../components/TierChip';
import { Polaroid } from '../components/Polaroid';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { useShallow } from 'zustand/react/shallow';
import { selectArtistOtherLogs, selectGigsByArtist, useStore } from '../store';
import { countdownCompact, longDate, ago } from '../lib/dates';

export function ArtistScreen() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const allGigs = useStore((s) => s.gigs);
  const upcoming = useStore((s) => s.upcoming);
  const localArtists = useStore((s) => s.localArtists);
  const gigsHere = useStore(useShallow((s) => selectGigsByArtist(s, slug)));
  const otherLogs = useStore(useShallow((s) => selectArtistOtherLogs(s, slug)));
  const followedArtists = useStore(useShallow((s) => s.followedArtists));
  const friends = useStore(useShallow((s) => s.friends));
  const toggleArtistFollow = useStore((s) => s.toggleArtistFollow);
  const isFollowed = followedArtists.includes(slug);
  const friendHandles = new Set(friends.map((f) => f.handle));

  const matchingUpcoming = upcoming.filter((u) => u.artistSlug === slug);
  const localMatch = localArtists.find((a) => a.artistSlug === slug);

  // Pretty name: prefer the most recent gig, else upcoming, else local, else slug
  const prettyName =
    gigsHere[0]?.artist ||
    matchingUpcoming[0]?.artist ||
    localMatch?.artist ||
    slug.split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ');

  const tierScore = { loved: 9, mid: 6, nah: 3 } as const;
  const avgFromTiers = gigsHere.length
    ? gigsHere.reduce((acc, g) => acc + tierScore[g.tier], 0) / gigsHere.length
    : 0;
  const aggregateScore =
    matchingUpcoming[0]?.score ??
    localMatch?.score ??
    Math.min(9.9, avgFromTiers || 8);

  const totalLogs = allGigs.filter((g) => g.artistSlug === slug).length;

  return (
    <div className="gigly-app">
      <AppBar title="artist" back small display={false} />
      <div className="scroll" style={{ padding: '0 0 100px' }}>
        {/* Hero / nameplate */}
        <div style={{ padding: '6px 16px 18px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-soft)', marginBottom: 6 }}>
            ARTIST
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink)', lineHeight: 1.05 }}>
            {prettyName}
          </div>
          {localMatch && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-faded)', marginTop: 6 }}>
              {localMatch.genre.toUpperCase()} · {localMatch.gigs} gigs played
            </div>
          )}
          <div style={{ display: 'inline-block', marginTop: 12, padding: '6px 12px', border: '1.5px solid var(--rust)', borderRadius: 2, transform: 'rotate(-1.5deg)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--rust)' }}>GIG IT</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--rust)', marginLeft: 8 }}>
              {Number(aggregateScore).toFixed(1)}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-faded)', marginTop: 8 }}>
            {totalLogs} {totalLogs === 1 ? 'log' : 'logs'} on gigly
          </div>
          <button
            onClick={() => toggleArtistFollow(slug)}
            className={isFollowed ? 'btn btn-ghost' : 'btn btn-primary'}
            style={{ marginTop: 14, padding: '8px 18px', fontSize: 14, width: 'auto', display: 'inline-block' }}
          >
            {isFollowed ? 'following' : 'follow'}
          </button>
          {isFollowed && (
            <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-faded)', marginTop: 8 }}>
              their logs show up in your Artists feed.
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div style={{ padding: '0 16px' }}>
          <div className="section-head">upcoming</div>
          {matchingUpcoming.length === 0 ? (
            <div className="empty" style={{ margin: 0 }}>
              <div className="hand">no shows on the radar</div>
              <div className="body">we'll surface tour announcements here.</div>
            </div>
          ) : (
            matchingUpcoming.map((u) => (
              <div
                key={u.id}
                className="card"
                style={{ marginBottom: 10, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 10 }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--terracotta)' }}>
                    OPENS IN {countdownCompact(u.dateISO).toUpperCase()}{u.sold ? ' · SOLD OUT' : ''}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', marginTop: 4 }}>
                    {u.venue}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.06em', marginTop: 2 }}>
                    {u.date.toUpperCase()} · {u.city.toUpperCase()}
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/venue/${u.venueSlug}`)}
                  style={{ padding: '8px 12px', fontSize: 12 }}
                >
                  venue
                </button>
              </div>
            ))
          )}
        </div>

        {/* Your gigs */}
        <div style={{ padding: '0 16px' }}>
          <div className="section-head" style={{ marginTop: 18 }}>logs you've made for them</div>
          {gigsHere.filter((g) => g.scope === 'self').length === 0 ? (
            <EmptyState hand="not yet" body="next time, hit + below." />
          ) : (
            <div className="gallery">
              {gigsHere.filter((g) => g.scope === 'self').map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/gig/${g.id}`)}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                >
                  <Polaroid
                    photo={g.photo}
                    caption={`${g.venue} · ${g.date}`}
                    rotate={[-2, 2, -1.5, 1.5, -1, 1][i % 6]}
                    tape={(['yellow', 'pink', null] as const)[i % 3]}
                    width="100%"
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <TierChip tier={g.tier} size="sm" />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faded)' }}>
                      {longDate(g.dateISO).split(' · ')[1]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Everyone else's takes */}
        <div style={{ padding: '0 16px' }}>
          <div className="section-head" style={{ marginTop: 18 }}>everyone else's takes</div>
          {otherLogs.length === 0 ? (
            <EmptyState hand="no one's logged this artist yet" />
          ) : (
            <div className="card" style={{ padding: '4px 14px' }}>
              {otherLogs.map((g, i) => {
                const isFriend = friendHandles.has(g.user);
                return (
                  <button
                    key={g.id}
                    onClick={() => navigate(`/gig/${g.id}`)}
                    style={{
                      display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 12, alignItems: 'flex-start',
                      padding: '12px 0',
                      borderBottom: i < otherLogs.length - 1 ? '1px dashed var(--border-soft)' : 'none',
                      width: '100%', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer',
                    }}
                  >
                    <Avatar name={g.user} size={32} color={pickAva(g.user)} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, color: 'var(--ink)' }}>
                        <b>{g.user}</b>
                        {isFriend && (
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em',
                              color: 'var(--terracotta)', marginLeft: 6, padding: '1px 5px',
                              border: '1px solid var(--terracotta)', borderRadius: 2,
                              verticalAlign: 'middle',
                            }}
                          >
                            FRIEND
                          </span>
                        )}
                        <span style={{ color: 'var(--ink-soft)', fontWeight: 400 }}> · {g.venue}</span>
                      </div>
                      {g.review && (
                        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--paper-deep)', marginTop: 3, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{g.review}"
                        </div>
                      )}
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-faded)', marginTop: 3 }}>
                        {g.date} · {ago(g.dateISO)} · {g.likes} likes
                      </div>
                    </div>
                    <TierChip tier={g.tier} size="sm" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
