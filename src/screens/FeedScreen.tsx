import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { TierChip } from '../components/TierChip';
import { BottomNav } from '../components/BottomNav';
import { EmptyState } from '../components/EmptyState';
import { Wordmark } from '../components/Wordmark';
import {
  IconHeart,
  IconChat,
  IconList,
  IconSearch,
  IconBell,
  IconUser,
} from '../components/icons';
import { useShallow } from 'zustand/react/shallow';
import {
  selectArtistsFeed,
  selectFriendFeed,
  selectLocalFeed,
  selectUnreadCount,
  useStore,
} from '../store';
import { ago } from '../lib/dates';
import type { Gig } from '../types';

type Tab = 'Friends' | 'Artists' | 'Local';

function FeedCard({
  entry,
  onOpen,
  onLike,
  isLocalArtist,
}: {
  entry: Gig;
  onOpen: () => void;
  onLike: () => void;
  isLocalArtist?: boolean;
}) {
  return (
    <button className="feed-card" onClick={onOpen}>
      <div
        className="thumb"
        style={{ backgroundImage: `url(${entry.photo})` }}
      />
      <div>
        <div className="head">
          <Avatar name={entry.user} color={pickAva(entry.user)} />
          <span className="who">
            <b>{entry.user}</b> logged a gig
          </span>
          <span className="ago">{ago(entry.dateISO)}</span>
        </div>
        <div className="title" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
          <span>{entry.artist}{entry.tour ? ` · ${entry.tour}` : ''}</span>
          {isLocalArtist && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 8,
                letterSpacing: '0.18em',
                padding: '2px 5px',
                background: 'var(--bg-tape)',
                color: 'var(--ink-fixed)',
                borderRadius: 2,
                transform: 'rotate(-1.5deg)',
                display: 'inline-block',
                lineHeight: 1,
              }}
            >
              LOCAL
            </span>
          )}
        </div>
        <div className="meta">
          {entry.venue.toUpperCase()} · {entry.city.toUpperCase()} · {entry.date}
        </div>
        <div className="stars" style={{ gap: 8 }}>
          <TierChip tier={entry.tier} size="sm" />
          {entry.note && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--ink-soft)',
                letterSpacing: '0.06em',
              }}
            >
              {entry.note}
            </span>
          )}
        </div>
        {entry.review && <p className="review">"{entry.review}"</p>}
        <div className="actions">
          <button
            className={`act ${entry.liked ? 'liked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
          >
            <IconHeart size={13} fill={entry.liked ? 'currentColor' : 'none'} />{' '}
            {entry.likes}
          </button>
          <button className="act" onClick={(e) => e.stopPropagation()}>
            <IconChat size={13} /> {entry.comments.length}
          </button>
          <button className="act" onClick={(e) => e.stopPropagation()}>
            <IconList size={13} /> setlist
          </button>
        </div>
      </div>
    </button>
  );
}

function pickAva(handle: string): 'olive' | 'terracotta' | 'mustard' | 'plum' | 'indigo' {
  const palette = ['olive', 'terracotta', 'mustard', 'plum', 'indigo'] as const;
  let h = 0;
  for (const c of handle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

export function FeedScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('Friends');
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');

  const friendFeed = useStore(useShallow(selectFriendFeed));
  const artistsFeed = useStore(useShallow(selectArtistsFeed));
  const localFeed = useStore(useShallow(selectLocalFeed));
  const unread = useStore(selectUnreadCount);
  const toggleLike = useStore((s) => s.toggleLike);
  const followedArtists = useStore(useShallow((s) => s.followedArtists));
  const localArtists = useStore(useShallow((s) => s.localArtists));
  const userCity = useStore((s) => s.user?.city ?? 'NYC');

  const localArtistSlugs = useMemo(
    () => new Set(localArtists.map((a) => a.artistSlug)),
    [localArtists]
  );

  const entries = useMemo(() => {
    const base =
      tab === 'Friends' ? friendFeed : tab === 'Artists' ? artistsFeed : localFeed;
    if (!q.trim()) return base;
    const ql = q.toLowerCase();
    return base.filter((g) =>
      `${g.artist} ${g.venue} ${g.user}`.toLowerCase().includes(ql)
    );
  }, [tab, friendFeed, artistsFeed, localFeed, q]);

  return (
    <div className="gigly-app">
      <div className="app-bar">
        <Wordmark />
        <div className="actions">
          <button
            className="icon-btn"
            aria-label="Search"
            onClick={() => {
              setSearchOpen((o) => !o);
              if (searchOpen) setQ('');
            }}
          >
            <IconSearch />
          </button>
          <button
            className="icon-btn"
            aria-label="Friends"
            onClick={() => navigate('/friends')}
          >
            <IconUser />
          </button>
          <button
            className="icon-btn"
            aria-label="Notifications"
            onClick={() => navigate('/notifications')}
          >
            <IconBell />
            {unread > 0 && <span className="dot" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div style={{ padding: '0 16px 8px' }}>
          <input
            className="field-input"
            autoFocus
            placeholder="search artists, venues, friends"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      )}

      <div className="segmented">
        {(['Friends', 'Artists', 'Local'] as const).map((t) => (
          <button
            key={t}
            className={`seg ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="scroll">
        {/* Local-artists strip — only on Local tab, only when feed has content */}
        {tab === 'Local' && entries.length > 0 && (
          <>
            <div
              className="section-head"
              style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>local artists · {userCity}</span>
              <button
                onClick={() => navigate('/discover')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  color: 'var(--terracotta)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                SEE ALL
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 10,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                paddingBottom: 12,
                margin: '0 -16px',
                paddingLeft: 16,
                paddingRight: 16,
              }}
            >
              {localArtists.slice(0, 6).map((a) => (
                <button
                  key={a.artistSlug}
                  onClick={() => navigate(`/artist/${a.artistSlug}`)}
                  style={{
                    flex: '0 0 auto',
                    width: 140,
                    textAlign: 'left',
                    background: 'var(--paper-warm)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 6,
                    padding: '10px 12px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 8,
                      letterSpacing: '0.18em',
                      color: 'var(--mustard-deep)',
                      textTransform: 'uppercase',
                    }}
                  >
                    LOCAL
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 16,
                      lineHeight: 1.1,
                      color: 'var(--ink)',
                      marginTop: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {a.artist}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 9,
                      letterSpacing: '0.08em',
                      color: 'var(--ink-soft)',
                      marginTop: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {a.genre}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 4,
                      marginTop: 6,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--rust)', lineHeight: 1 }}>
                      {a.score}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-faded)' }}>
                      /10
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="section-head" style={{ marginTop: 4 }}>
              recent in {userCity}
            </div>
          </>
        )}

        {entries.length === 0 ? (
          q.trim() ? (
            <EmptyState hand="no matches" body="try a different search." />
          ) : tab === 'Friends' ? (
            <button
              onClick={() => navigate('/friends')}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                padding: 0, cursor: 'pointer',
              }}
            >
              <EmptyState
                hand="no friends to follow yet"
                body="tap to find some."
              />
            </button>
          ) : tab === 'Artists' ? (
            followedArtists.length === 0 ? (
              <button
                onClick={() => navigate('/discover')}
                style={{
                  width: '100%', background: 'transparent', border: 'none',
                  padding: 0, cursor: 'pointer',
                }}
              >
                <EmptyState
                  hand="follow some artists"
                  body="tap to find ones you love. you'll see how others experienced their shows."
                />
              </button>
            ) : (
              <EmptyState
                hand="quiet from your artists"
                body="no recent logs for the artists you follow."
              />
            )
          ) : (
            // Local
            <EmptyState
              hand="quiet in your area"
              body={`no recent logs in ${userCity}. yours will show up here too once you log them.`}
            />
          )
        ) : (
          entries.map((e) => (
            <FeedCard
              key={e.id}
              entry={e}
              onOpen={() => navigate(`/gig/${e.id}`)}
              onLike={() => toggleLike(e.id)}
              isLocalArtist={tab === 'Local' && localArtistSlugs.has(e.artistSlug)}
            />
          ))
        )}

        {entries.length > 0 && tab === 'Friends' && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0 8px',
              fontFamily: 'var(--font-hand)',
              fontSize: 18,
              color: 'var(--ink-faded)',
            }}
          >
            that's all your friends · go to a show ↓
          </div>
        )}
        {entries.length > 0 && tab === 'Artists' && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0 8px',
              fontFamily: 'var(--font-hand)',
              fontSize: 18,
              color: 'var(--ink-faded)',
            }}
          >
            following {followedArtists.length} {followedArtists.length === 1 ? 'artist' : 'artists'} · find more ↓
          </div>
        )}
        {entries.length > 0 && tab === 'Local' && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px 0 8px',
              fontFamily: 'var(--font-hand)',
              fontSize: 18,
              color: 'var(--ink-faded)',
            }}
          >
            change your city in settings ↓
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
