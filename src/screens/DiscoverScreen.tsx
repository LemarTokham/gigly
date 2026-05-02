import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { EmptyState } from '../components/EmptyState';
import { IconPin, IconSearch } from '../components/icons';
import { useStore } from '../store';
import { countdownCompact } from '../lib/dates';

const genres = ['All', 'Rock', 'Indie', 'Hip-hop', 'Electronic', 'Folk', 'Metal'];

export function DiscoverScreen() {
  const navigate = useNavigate();
  const upcoming = useStore((s) => s.upcoming);
  const localArtists = useStore((s) => s.localArtists);

  const [filter, setFilter] = useState('All');
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    return upcoming.filter((u) => {
      if (filter !== 'All' && u.genre !== filter) return false;
      if (q.trim() && !`${u.artist} ${u.venue}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [upcoming, filter, q]);

  return (
    <div className="gigly-app">
      <div className="app-bar">
        <div className="title">discover</div>
        <div className="actions">
          <button className="icon-btn" aria-label="My city">
            <IconPin />
          </button>
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
        </div>
      </div>

      {searchOpen && (
        <div style={{ padding: '0 16px 8px' }}>
          <input
            className="field-input"
            autoFocus
            placeholder="search artists or venues"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      )}

      <div className="chip-row">
        {genres.map((f) => (
          <button
            key={f}
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="scroll">
        <div className="section-head">Upcoming · near you</div>
        {filtered.length === 0 ? (
          <EmptyState hand="nothing in this filter" body="try All, or change your city." />
        ) : (
          filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => navigate(`/artist/${u.artistSlug}`)}
              style={{
                background: 'var(--paper-warm)',
                border: '1px solid var(--border-soft)',
                borderRadius: 8,
                padding: 14,
                marginBottom: 10,
                boxShadow: 'var(--shadow-card)',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 10,
                alignItems: 'center',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {u.sold && (
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 9,
                        letterSpacing: '0.18em',
                        color: 'var(--cream)',
                        background: 'var(--ink-fixed)',
                        padding: '2px 6px',
                        borderRadius: 2,
                      }}
                    >
                      SOLD OUT
                    </span>
                  )}
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--terracotta)' }}>
                    · OPENS IN {countdownCompact(u.dateISO).toUpperCase()}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', lineHeight: 1.1 }}>
                  {u.artist}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-soft)', marginTop: 4 }}>
                  {u.venue.toUpperCase()} · {u.date.toUpperCase()}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '4px 8px', border: '1.5px solid var(--rust)', borderRadius: 2, transform: 'rotate(-2deg)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', color: 'var(--rust)' }}>GIG IT</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--rust)', lineHeight: 1 }}>{u.score}</div>
              </div>
            </button>
          ))
        )}

        <div className="section-head" style={{ marginTop: 14 }}>local · up-and-coming</div>
        <div className="card" style={{ padding: '4px 14px' }}>
          {localArtists.map((a, i) => (
            <button
              key={a.artistSlug}
              onClick={() => navigate(`/artist/${a.artistSlug}`)}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr auto',
                alignItems: 'center',
                gap: 12,
                padding: '11px 0',
                borderBottom: i < localArtists.length - 1 ? '1px dashed var(--border-soft)' : 'none',
                width: '100%',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-soft)' }}>{i + 1}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{a.artist}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--ink-faded)', marginTop: 2 }}>
                  {a.genre.toUpperCase()} · {a.gigs} gigs played
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--rust)' }}>{a.score}</div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
