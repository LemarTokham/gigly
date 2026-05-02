import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TierChip } from '../components/TierChip';
import { BottomNav } from '../components/BottomNav';
import { IconSearch, IconSettings } from '../components/icons';
import { useShallow } from 'zustand/react/shallow';
import { selectVenueStats, useStore } from '../store';
import type { Venue, VenueStatus } from '../types';

const filters = ['Visited', 'Upcoming', 'Wishlist', 'All'] as const;
type Filter = typeof filters[number];

const pinColor = (s: VenueStatus): string =>
  s === 'visited' ? '#C8553D' : s === 'upcoming' ? '#D4A24C' : '#5C3A4E';

export function MapScreen() {
  const navigate = useNavigate();
  const venues = useStore((s) => s.venues);
  const gigs = useStore((s) => s.gigs);
  const stats = useStore(useShallow(selectVenueStats));

  const [filter, setFilter] = useState<Filter>('Visited');

  const visitedCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const g of gigs) {
      if (g.scope !== 'self') continue;
      m.set(g.venueSlug, (m.get(g.venueSlug) ?? 0) + 1);
    }
    return m;
  }, [gigs]);

  const visited = useMemo(() => venues.filter((v) => v.status === 'visited'), [venues]);

  const filteredVenues = useMemo(() => {
    if (filter === 'All') return venues;
    return venues.filter((v) => v.status === filter.toLowerCase());
  }, [venues, filter]);

  // Default selected: first visited
  const initial = visited[0]?.id ?? venues[0]?.id ?? 0;
  const [selected, setSelected] = useState(initial);
  const sel: Venue | undefined = venues.find((v) => v.id === selected);
  const lastGigForSel = useMemo(() => {
    if (!sel) return null;
    const list = gigs
      .filter((g) => g.venueSlug === sel.slug && g.scope === 'self')
      .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
    return list[0] ?? null;
  }, [sel, gigs]);

  return (
    <div className="gigly-app">
      <div className="app-bar">
        <div className="title">map</div>
        <div className="actions">
          <button className="icon-btn" aria-label="Search">
            <IconSearch />
          </button>
          <button className="icon-btn" aria-label="Settings" onClick={() => navigate('/settings')}>
            <IconSettings />
          </button>
        </div>
      </div>

      <div className="chip-row">
        {filters.map((f) => (
          <button
            key={f}
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 4, padding: '4px 16px 10px' }}>
        {[
          { v: String(stats.venues), l: 'venues' },
          { v: String(stats.cities), l: 'cities' },
          { v: String(stats.countries), l: 'countries' },
          { v: String(stats.gigs), l: 'gigs' },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '6px 0',
              background: 'var(--paper-warm)',
              border: '1px solid var(--border-soft)',
              borderRadius: 4,
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}>
              {s.v}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.16em', color: 'var(--ink-soft)', textTransform: 'uppercase', marginTop: 3 }}>
              {s.l}
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          margin: '0 16px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            background: '#EFE3C8',
          }}
        >
          <rect x="0" y="0" width="100" height="100" fill="#EFE3C8" />
          <path
            d="M -5 70 Q 20 65, 35 75 T 80 70 L 110 75 L 110 100 L -5 100 Z"
            fill="#C9D8C0"
            opacity="0.55"
          />
          <path
            d="M 20 -5 Q 22 25, 18 50 T 25 105"
            stroke="#C9D8C0"
            strokeWidth="6"
            fill="none"
            opacity="0.7"
          />
          <rect x="44" y="22" width="6" height="32" fill="#C9D2A2" opacity="0.6" rx="0.5" />
          <circle cx="68" cy="46" r="5" fill="#C9D2A2" opacity="0.55" />
          <circle cx="20" cy="20" r="4" fill="#C9D2A2" opacity="0.55" />
          <g
            stroke="#9A876E"
            strokeWidth="0.4"
            fill="none"
            opacity="0.55"
            strokeDasharray="0.8 0.8"
          >
            <path d="M 0 30 L 100 35" />
            <path d="M 0 50 Q 30 48, 60 52 T 100 50" />
            <path d="M 0 65 L 100 62" />
            <path d="M 30 0 L 32 100" />
            <path d="M 55 0 Q 53 30, 56 60 T 58 100" />
            <path d="M 75 0 L 73 100" />
          </g>
          <g transform="translate(86, 12)" opacity="0.7">
            <circle r="5" fill="none" stroke="#6B5A47" strokeWidth="0.4" />
            <path d="M 0 -4 L 1 0 L 0 4 L -1 0 Z" fill="#9C3F2E" />
            <text x="0" y="-6" textAnchor="middle" fontFamily="Special Elite, monospace" fontSize="2.5" fill="#6B5A47">
              N
            </text>
          </g>
          <text
            x="6"
            y="14"
            fontFamily="DM Serif Display, Georgia, serif"
            fontStyle="italic"
            fontSize="6"
            fill="#6B5A47"
            opacity="0.55"
          >
            New York
          </text>
          {sel &&
            visited
              .filter((v) => v.id !== sel.id)
              .slice(0, 3)
              .map((v, i) => (
                <path
                  key={i}
                  d={`M ${sel.x} ${sel.y} Q ${(sel.x + v.x) / 2 + (i - 1) * 4} ${
                    (sel.y + v.y) / 2 - 6
                  }, ${v.x} ${v.y}`}
                  stroke="#C8553D"
                  strokeWidth="0.3"
                  strokeDasharray="0.6 0.8"
                  fill="none"
                  opacity="0.55"
                />
              ))}
          {filteredVenues.map((v) => {
            const c = pinColor(v.status);
            const isSel = v.id === selected;
            const count = visitedCount.get(v.slug) ?? 0;
            return (
              <g
                key={v.id}
                transform={`translate(${v.x}, ${v.y})`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(v.id)}
              >
                <ellipse cx="0" cy="2" rx={isSel ? 2.4 : 1.8} ry="0.6" fill="rgba(58,46,34,0.25)" />
                <path
                  d="M 0 -7 C -3 -7 -3 -3 0 0 C 3 -3 3 -7 0 -7 Z"
                  fill={c}
                  stroke="#2B2018"
                  strokeWidth="0.3"
                  transform={isSel ? 'scale(1.35)' : 'scale(1)'}
                  style={{ transition: 'transform 200ms cubic-bezier(.34,1.5,.64,1)' }}
                />
                <circle cx="0" cy="-4.5" r="1" fill="#F4ECD8" />
                {count > 1 && (
                  <g transform="translate(2.5, -7)">
                    <circle r="1.6" fill="#2B2018" />
                    <text textAnchor="middle" y="0.6" fontFamily="Special Elite, monospace" fontSize="1.8" fill="#F4ECD8">
                      {count}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            background: 'rgba(244,236,216,0.92)',
            backdropFilter: 'blur(4px)',
            border: '1px solid var(--border-soft)',
            borderRadius: 4,
            padding: '6px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.06em',
            color: 'var(--ink)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#C8553D' }} />visited
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D4A24C' }} />upcoming
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5C3A4E' }} />wishlist
          </div>
        </div>

        {/* Selected venue card */}
        {sel && (
          <button
            onClick={() => navigate(`/venue/${sel.slug}`)}
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 12,
              background: 'var(--paper-warm)',
              border: '1px solid var(--border-soft)',
              borderRadius: 6,
              padding: '10px 12px',
              boxShadow: 'var(--shadow-lift)',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 8,
              alignItems: 'center',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-soft)' }}>
                {sel.status === 'visited' && lastGigForSel
                  ? `LAST · ${lastGigForSel.date}`
                  : sel.status.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', lineHeight: 1.1, marginTop: 2 }}>
                {sel.name}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.06em', marginTop: 2 }}>
                {sel.city}{' '}
                {(visitedCount.get(sel.slug) ?? 0) > 0 &&
                  `· ${visitedCount.get(sel.slug)} gig${visitedCount.get(sel.slug) === 1 ? '' : 's'}`}
              </div>
            </div>
            {lastGigForSel && (
              <div style={{ textAlign: 'center' }}>
                <TierChip tier={lastGigForSel.tier} size="sm" />
              </div>
            )}
          </button>
        )}
      </div>

      {/* Recent venues strip */}
      <div style={{ padding: '10px 16px 0' }}>
        <div className="section-head" style={{ margin: '0 0 6px' }}>
          recent · tap to focus
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {visited.slice(0, 6).map((v) => (
            <button
              key={v.id}
              onClick={() => setSelected(v.id)}
              style={{
                flex: '0 0 auto',
                textAlign: 'left',
                background: selected === v.id ? 'var(--ink-fixed)' : 'var(--paper-warm)',
                color: selected === v.id ? 'var(--cream)' : 'var(--ink)',
                border: '1px solid',
                borderColor: selected === v.id ? 'var(--ink-fixed)' : 'var(--border-soft)',
                borderRadius: 4,
                padding: '6px 10px',
                cursor: 'pointer',
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.14em', opacity: 0.7 }}>
                ×{visitedCount.get(v.slug) ?? 0}
              </div>
              <div style={{ fontWeight: 600 }}>{v.name}</div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
