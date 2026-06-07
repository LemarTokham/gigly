import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Polaroid } from '../components/Polaroid';
import { AppBar } from '../components/AppBar';
import { TierChip } from '../components/TierChip';
import { IconCam } from '../components/icons';
import { useStore } from '../store';
import { useShallow } from 'zustand/react/shallow';
import { isoDaysAgo, longDate, ticketDate } from '../lib/dates';
import type { Gig, Tier } from '../types';

const allTags = [
  'SOLD OUT', 'FRONT ROW', 'FIRST TIME', 'WITH FRIENDS',
  'RAINY', 'PIT', 'ENCORE', 'CRIED',
];

const stockPhotos = [
  '/assets/concert-photos/concert-crowd.webp',
  '/assets/concert-photos/metallica-band.jpg',
];

type Match = {
  artist: string;
  tour?: string;
  venue: string;
  city: string;
  dateISO: string;
};

const presetMatches: Match[] = [
  { artist: 'Metallica',         tour: 'M72 World Tour',     venue: 'Foro Sol',         city: 'CDMX', dateISO: isoDaysAgo(0, 22) },
  { artist: 'XG',                tour: 'The 1st Howl',       venue: 'Kia Forum',        city: 'LA',   dateISO: isoDaysAgo(2, 21) },
  { artist: 'Phoebe Bridgers',                              venue: 'Palau Sant Jordi', city: 'BCN',  dateISO: isoDaysAgo(5, 21) },
  { artist: 'beabadoobee',                                  venue: 'Brooklyn Steel',   city: 'NYC',  dateISO: isoDaysAgo(11, 21) },
  { artist: 'Geese',                                        venue: 'Bowery Ballroom',  city: 'NYC',  dateISO: isoDaysAgo(7, 21) },
];

const COMPARE_CAP = 4;

const tierCopy: Record<Tier, { line: string; sub: string }> = {
  loved: { line: 'loved it',     sub: 'one of those nights' },
  mid:   { line: 'mid',          sub: 'it was alright' },
  nah:   { line: 'nah',          sub: "wasn't for me" },
};

export function LogGigScreen() {
  const navigate = useNavigate();
  const logGig = useStore((s) => s.logGig);
  const allGigs = useStore((s) => s.gigs);
  const rankings = useStore(useShallow((s) => s.rankings));

  const [step, setStep] = useState<'search' | 'details' | 'compare' | 'done'>('search');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<Match | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [review, setReview] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [photoIdx, setPhotoIdx] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [savedRank, setSavedRank] = useState<number | null>(null);

  // Compare state — set up on entering 'compare' step
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(0);
  const [comparesDone, setComparesDone] = useState(0);

  const matches = presetMatches.filter(
    (m) =>
      !query ||
      m.artist.toLowerCase().includes(query.toLowerCase()) ||
      m.venue.toLowerCase().includes(query.toLowerCase())
  );

  const toggleTag = (t: string) =>
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);

  const cyclePhoto = () =>
    setPhotoIdx((i) => (i === null ? 0 : (i + 1) % stockPhotos.length));

  // Existing same-tier gigs in user's preferred order, best first
  const tierList: Gig[] = useMemo(() => {
    if (!tier) return [];
    return rankings[tier]
      .map((id) => allGigs.find((g) => g.id === id))
      .filter((g): g is Gig => Boolean(g));
  }, [tier, rankings, allGigs]);

  const photoForSubmit = photoIdx !== null ? stockPhotos[photoIdx] : stockPhotos[0];

  const finalize = (rank: number) => {
    if (!picked || !tier) return;
    const id = logGig({
      artist: picked.artist,
      tour: picked.tour,
      venue: picked.venue,
      city: picked.city,
      dateISO: picked.dateISO,
      tier,
      rank,
      review: review.trim(),
      tags,
      photo: photoForSubmit,
    });
    setSavedId(id);
    setSavedRank(rank);
    setStep('done');
  };

  const submit = () => {
    if (!picked || !tier) return;
    if (tierList.length === 0) {
      finalize(0);
      return;
    }
    setLo(0);
    setHi(tierList.length);
    setComparesDone(0);
    setStep('compare');
  };

  // Compare-step handlers
  const choosePreference = (newWins: boolean) => {
    const mid = Math.floor((lo + hi) / 2);
    let nextLo = lo;
    let nextHi = hi;
    if (newWins) nextHi = mid;
    else nextLo = mid + 1;
    const nextDone = comparesDone + 1;
    setLo(nextLo);
    setHi(nextHi);
    setComparesDone(nextDone);
    if (nextLo >= nextHi || nextDone >= COMPARE_CAP) {
      finalize(nextLo);
    }
  };

  const skipCompare = () => finalize(tierList.length); // append at end of bucket

  // ---------- SEARCH ----------
  if (step === 'search') {
    return (
      <div className="gigly-app">
        <AppBar title="Log a gig" back onBack={() => navigate('/feed')} small />
        <div style={{ padding: '4px 16px 8px' }}>
          <div className="field" style={{ marginBottom: 6 }}>
            <div className="field-label">Artist or tour</div>
            <input
              className="field-input"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="who'd you see?"
            />
            <div className="field-help">we match it with setlist.fm</div>
          </div>
        </div>
        <div className="scroll" style={{ padding: '0 16px 100px' }}>
          <div className="section-head">Recent shows · matches</div>
          {matches.map((m, i) => (
            <button
              key={i}
              onClick={() => {
                setPicked(m);
                setStep('details');
              }}
              style={{
                width: '100%', textAlign: 'left',
                background: 'var(--paper-warm)', border: '1px solid var(--border-soft)',
                borderRadius: 8, padding: '12px 14px', marginBottom: 10, cursor: 'pointer',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)', lineHeight: 1.1 }}>
                {m.artist}
              </div>
              {m.tour && (
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--paper-deep)', marginTop: 2 }}>
                  {m.tour}
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-soft)', letterSpacing: '0.06em', marginTop: 4 }}>
                {m.venue.toUpperCase()} · {m.city.toUpperCase()} · {longDate(m.dateISO).toUpperCase()}
              </div>
            </button>
          ))}
          {matches.length === 0 && (
            <div className="empty">
              <div className="hand">no matches</div>
              <div className="body">enter the gig manually below.</div>
            </div>
          )}
          <button
            onClick={() => {
              if (!query.trim()) return;
              setPicked({
                artist: query.trim(),
                venue: 'unknown venue',
                city: 'NYC',
                dateISO: isoDaysAgo(0, 21),
              });
              setStep('details');
            }}
            style={{
              width: '100%', textAlign: 'center',
              background: 'transparent',
              border: '1px dashed var(--border-strong)',
              borderRadius: 8, padding: 14, marginTop: 8,
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              color: 'var(--ink-soft)', cursor: 'pointer',
            }}
          >
            can't find it · enter manually
          </button>
        </div>
      </div>
    );
  }

  // ---------- DONE ----------
  if (step === 'done' && picked && tier) {
    return (
      <div className="gigly-app">
        <div className="toast">LOGGED · {tier.toUpperCase()}</div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            textAlign: 'center',
          }}
        >
          <Polaroid
            photo={photoForSubmit}
            caption={`${picked.artist} · ${longDate(picked.dateISO).split(' · ')[1] ?? ''}`}
            rotate={-3}
            tape="yellow"
            width={220}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink)', marginTop: 28 }}>
            nice one.
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--ink-soft)', fontSize: 14, marginTop: 6, maxWidth: 240 }}>
            {savedRank === 0 && tierList.length > 0
              ? `your new #1 ${tier} gig.`
              : tierList.length > 0 && savedRank !== null
              ? `slotted in at #${savedRank + 1} of your ${tier} gigs.`
              : `your first ${tier} log.`}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 22, width: 220 }}
            onClick={() => (savedId ? navigate(`/gig/${savedId}`) : navigate('/feed'))}
          >
            See it
          </button>
          <button
            style={{
              background: 'transparent', border: 'none',
              marginTop: 10, fontFamily: 'var(--font-serif)', fontSize: 13,
              color: 'var(--ink-soft)', textDecoration: 'underline',
              textDecorationColor: 'var(--terracotta)', textUnderlineOffset: 4, cursor: 'pointer',
            }}
            onClick={() => navigate('/feed')}
          >
            back to feed →
          </button>
        </div>
      </div>
    );
  }

  // ---------- COMPARE ----------
  if (step === 'compare' && picked && tier) {
    const midIdx = Math.floor((lo + hi) / 2);
    const opponent = tierList[midIdx];
    if (!opponent) {
      // safety: nothing to compare to → finalize
      finalize(lo);
      return null;
    }
    const tierLabel = tier.toUpperCase();

    return (
      <div className="gigly-app">
        <AppBar
          small
          back
          onBack={() => setStep('details')}
          title={`rank vs your ${tierLabel}`}
          display={false}
        />
        <div className="scroll" style={{ padding: '6px 16px 100px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-soft)' }}>
            {comparesDone + 1} OF {Math.min(tierList.length, COMPARE_CAP)}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', lineHeight: 1.1, margin: '8px 0 4px' }}>
            which would you go back to?
          </div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-faded)', marginBottom: 18 }}>
            tap the one that wins.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
            <ChoiceCard
              onClick={() => choosePreference(true)}
              photo={photoForSubmit}
              label={picked.artist}
              meta={`${picked.venue.toUpperCase()} · ${ticketDate(picked.dateISO)}`}
              tier={tier}
              caption="this gig"
              rotate={-2}
            />
            <ChoiceCard
              onClick={() => choosePreference(false)}
              photo={opponent.photo}
              label={opponent.artist}
              meta={`${opponent.venue.toUpperCase()} · ${opponent.date}`}
              tier={opponent.tier}
              caption={`#${midIdx + 1} of your ${tier}`}
              rotate={2}
            />
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-faded)', marginTop: 22 }}>
            VS
          </div>

          <button
            onClick={skipCompare}
            style={{
              marginTop: 22, background: 'transparent', border: 'none',
              fontFamily: 'var(--font-serif)', fontSize: 13, fontStyle: 'italic',
              color: 'var(--ink-soft)', textDecoration: 'underline',
              textDecorationColor: 'var(--terracotta)', textUnderlineOffset: 4,
              cursor: 'pointer',
            }}
          >
            skip · just save it
          </button>
        </div>
      </div>
    );
  }

  // ---------- DETAILS ----------
  if (!picked) return null;

  return (
    <div className="gigly-app">
      <AppBar title={picked.artist} back onBack={() => setStep('search')} small />
      <div className="scroll" style={{ padding: '0 16px 110px' }}>
        {/* Header card */}
        <div
          style={{
            background: 'var(--paper-warm)', border: '1px solid var(--border-soft)',
            borderRadius: 8, padding: '14px 14px 12px', position: 'relative',
            boxShadow: 'var(--shadow-card)', marginBottom: 16,
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-soft)' }}>
            {picked.venue.toUpperCase()} · {picked.city.toUpperCase()}
          </div>
          {picked.tour && (
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', lineHeight: 1.1, marginTop: 4 }}>
              {picked.tour}
            </div>
          )}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', color: 'var(--paper-deep)', marginTop: 4 }}>
            {longDate(picked.dateISO).toUpperCase()}
          </div>
        </div>

        {/* Photo */}
        <div className="section-head">A photo from the night</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
          {photoIdx !== null ? (
            <button
              onClick={cyclePhoto}
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              aria-label="Cycle photo"
            >
              <Polaroid photo={stockPhotos[photoIdx]} rotate={-2} tape="yellow" width={140} />
            </button>
          ) : (
            <button
              onClick={cyclePhoto}
              style={{
                width: 140, aspectRatio: '1 / 1.18',
                background: 'var(--bg3)', border: '2px dashed var(--border-strong)',
                borderRadius: 4, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: 'var(--ink-soft)', fontFamily: 'var(--font-serif)', fontSize: 13,
              }}
            >
              <IconCam size={26} /> add photo
            </button>
          )}
          <div style={{ flex: 1, fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-faded)', paddingTop: 12 }}>
            {photoIdx !== null ? 'tap to swap.' : "it'll go in the polaroid frame on your shelf."}
          </div>
        </div>

        {/* Tier picker */}
        <div className="section-head">how was it?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          {(['loved', 'mid', 'nah'] as const).map((t) => {
            const active = tier === t;
            return (
              <button
                key={t}
                onClick={() => setTier(t)}
                style={{
                  background: active ? 'var(--paper-warm)' : 'transparent',
                  border: active
                    ? `2px solid ${t === 'loved' ? 'var(--terracotta)' : t === 'mid' ? 'var(--mustard-deep)' : 'var(--plum)'}`
                    : '1px dashed var(--border-strong)',
                  borderRadius: 8,
                  padding: '14px 6px',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  boxShadow: active ? 'var(--shadow-card)' : 'none',
                }}
              >
                <TierChip tier={t} size="md" rotate={0} />
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, color: active ? 'var(--ink)' : 'var(--ink-faded)', lineHeight: 1.1 }}>
                  {tierCopy[t].sub}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stickers */}
        <div className="section-head">stickers · how was the night?</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {allTags.map((t, i) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
                padding: '4px 9px', borderRadius: 2,
                transform: `rotate(${(i % 3 - 1) * 1.6}deg)`,
                border: tags.includes(t) ? 'none' : '1px dashed var(--border-strong)',
                background: tags.includes(t)
                  ? i % 2 ? 'var(--bg-tape-pink)' : 'var(--bg-tape)'
                  : 'transparent',
                color: tags.includes(t) ? 'var(--ink-fixed)' : 'var(--ink-faded)',
                cursor: 'pointer',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Review */}
        <div className="section-head">a few words for future-you</div>
        <textarea
          className="field-textarea"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="setlist highlights, mood, who you were with…"
          style={{ minHeight: 110 }}
        />

        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          disabled={!tier}
          onClick={submit}
        >
          {tier && tierList.length > 0
            ? `Log this gig · rank vs your ${tier}`
            : tier
              ? 'Log this gig'
              : 'pick how it was'}
        </button>
      </div>
    </div>
  );
}

function ChoiceCard({
  onClick, photo, label, meta, tier, caption, rotate,
}: {
  onClick: () => void;
  photo: string;
  label: string;
  meta: string;
  tier: Tier;
  caption: string;
  rotate: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}
    >
      <Polaroid photo={photo} rotate={rotate} width="100%" tape={null} />
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--ink)', lineHeight: 1.1, marginTop: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', color: 'var(--ink-soft)' }}>
        {meta}
      </div>
      <TierChip tier={tier} size="sm" />
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 14, color: 'var(--ink-faded)' }}>
        {caption}
      </div>
    </button>
  );
}
