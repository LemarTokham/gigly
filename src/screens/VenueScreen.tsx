import { useNavigate, useParams } from 'react-router-dom';
import { AppBar } from '../components/AppBar';
import { Polaroid } from '../components/Polaroid';
import { EmptyState } from '../components/EmptyState';
import { useShallow } from 'zustand/react/shallow';
import { selectGigsByVenue, useStore } from '../store';
import { countdownCompact } from '../lib/dates';
import type { VenueStatus } from '../types';

const pinColor = (s: VenueStatus): string =>
  s === 'visited' ? '#C8553D' : s === 'upcoming' ? '#D4A24C' : '#5C3A4E';

export function VenueScreen() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const venue = useStore((s) => s.venues.find((v) => v.slug === slug));
  const upcoming = useStore((s) => s.upcoming);
  const gigsHere = useStore(useShallow((s) => selectGigsByVenue(s, slug)));

  if (!venue) {
    return (
      <div className="gigly-app">
        <AppBar title="venue" back small />
        <div className="scroll">
          <EmptyState hand="we don't have that venue on file" body="log a gig there to add it." />
        </div>
      </div>
    );
  }

  const matchingUpcoming = upcoming.filter((u) => u.venueSlug === slug);
  const youGigs = gigsHere.filter((g) => g.scope === 'self');

  return (
    <div className="gigly-app">
      <AppBar title="venue" back small display={false} />
      <div className="scroll" style={{ padding: '0 0 100px' }}>
        {/* Header */}
        <div style={{ padding: '6px 16px 14px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-soft)' }}>
            VENUE · {venue.city.toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--ink)', lineHeight: 1.05, marginTop: 6 }}>
            {venue.name}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-faded)', marginTop: 8 }}>
            {youGigs.length} {youGigs.length === 1 ? 'gig logged' : 'gigs logged'}
          </div>
        </div>

        {/* Mini map */}
        <div style={{ margin: '0 16px 12px' }}>
          <svg
            viewBox="0 0 100 60"
            style={{ width: '100%', height: 140, borderRadius: 8, border: '1px solid var(--border-soft)', background: '#EFE3C8', boxShadow: 'var(--shadow-card)' }}
          >
            <rect x="0" y="0" width="100" height="60" fill="#EFE3C8" />
            <path d="M -5 50 Q 30 45, 60 52 T 110 48 L 110 60 L -5 60 Z" fill="#C9D8C0" opacity="0.55" />
            <g stroke="#9A876E" strokeWidth="0.4" fill="none" opacity="0.55" strokeDasharray="0.8 0.8">
              <path d="M 0 18 L 100 22" />
              <path d="M 0 36 L 100 38" />
              <path d="M 25 0 L 27 60" />
              <path d="M 65 0 L 63 60" />
            </g>
            <g transform={`translate(50, 30)`}>
              <ellipse cx="0" cy="3" rx="3.5" ry="0.8" fill="rgba(58,46,34,0.25)" />
              <path
                d="M 0 -10 C -4.5 -10 -4.5 -4.5 0 0 C 4.5 -4.5 4.5 -10 0 -10 Z"
                fill={pinColor(venue.status)}
                stroke="#2B2018"
                strokeWidth="0.4"
                transform="scale(1.5)"
              />
              <circle cx="0" cy="-6.5" r="1.4" fill="#F4ECD8" transform="scale(1.5)" />
            </g>
            <text
              x="50"
              y="55"
              textAnchor="middle"
              fontFamily="DM Serif Display, Georgia, serif"
              fontStyle="italic"
              fontSize="5"
              fill="#6B5A47"
              opacity="0.7"
            >
              {venue.city}
            </text>
          </svg>
        </div>

        {/* Upcoming here */}
        <div style={{ padding: '0 16px' }}>
          <div className="section-head">upcoming here</div>
          {matchingUpcoming.length === 0 ? (
            <EmptyState hand="quiet on the calendar" />
          ) : (
            matchingUpcoming.map((u) => (
              <button
                key={u.id}
                onClick={() => navigate(`/artist/${u.artistSlug}`)}
                className="card"
                style={{
                  display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'center',
                  width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--terracotta)' }}>
                    OPENS IN {countdownCompact(u.dateISO).toUpperCase()}{u.sold ? ' · SOLD OUT' : ''}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink)', marginTop: 2 }}>
                    {u.artist}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-soft)', letterSpacing: '0.06em', marginTop: 2 }}>
                    {u.date.toUpperCase()}
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '4px 8px', border: '1.5px solid var(--rust)', borderRadius: 2, transform: 'rotate(-2deg)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', color: 'var(--rust)' }}>GIG IT</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--rust)', lineHeight: 1 }}>{u.score}</div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Your gigs here */}
        <div style={{ padding: '0 16px' }}>
          <div className="section-head" style={{ marginTop: 18 }}>your nights here</div>
          {youGigs.length === 0 ? (
            <EmptyState hand="not yet" body="log a gig there and it'll show up." />
          ) : (
            <div className="gallery">
              {youGigs.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => navigate(`/gig/${g.id}`)}
                  style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                >
                  <Polaroid
                    photo={g.photo}
                    caption={g.artist}
                    rotate={[-2, 2, -1.5, 1.5][i % 4]}
                    tape={(['yellow', 'pink', null] as const)[i % 3]}
                    width="100%"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
