import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/AppBar';
import { Avatar } from '../components/Avatar';
import { TierChip } from '../components/TierChip';
import { useShallow } from 'zustand/react/shallow';
import { selectByTierRanked, useStore } from '../store';
import type { AvaColor, Tier } from '../types';
import { IconChev, IconCheck } from '../components/icons';
import { THEMES } from '../lib/themes';

const palette: AvaColor[] = ['olive', 'terracotta', 'mustard', 'plum', 'indigo'];
const paletteHex: Record<AvaColor, string> = {
  olive: '#6F7A3D', terracotta: '#C8553D', mustard: '#D4A24C', plum: '#5C3A4E', indigo: '#364C6E',
};

export function SettingsScreen() {
  const navigate = useNavigate();
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);
  const resetAll = useStore((s) => s.resetAll);
  const moveRanking = useStore((s) => s.moveRanking);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  const [name, setName] = useState(user?.name ?? '');
  const [handle, setHandle] = useState(user?.handle ?? '');
  const [city, setCity] = useState(user?.city ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [color, setColor] = useState<AvaColor>(user?.avaColor ?? 'olive');
  const [confirmReset, setConfirmReset] = useState(false);
  const [activeTier, setActiveTier] = useState<Tier>('loved');

  const ranked = useStore(useShallow((s) => selectByTierRanked(s, activeTier)));

  if (!user) return null;

  const dirty =
    name !== user.name ||
    handle !== user.handle ||
    city !== user.city ||
    bio !== user.bio ||
    color !== user.avaColor;

  const validHandle = /^[a-z0-9_]{2,20}$/.test(handle);
  const canSave = dirty && name.trim().length > 1 && validHandle;

  const save = () => {
    if (!canSave) return;
    updateUser({ name: name.trim(), handle: handle.trim(), city: city.trim(), bio: bio.trim(), avaColor: color });
  };

  const reset = () => {
    resetAll();
    navigate('/welcome', { replace: true });
  };

  return (
    <div className="gigly-app">
      <AppBar title="settings" back small />
      <div className="scroll">
        <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 14px' }}>
          <Avatar name={name || user.name} color={color} size={84} />
        </div>

        <div className="section-head">profile</div>
        <div className="field">
          <div className="field-label">name</div>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <div className="field-label">handle</div>
          <input
            className="field-input"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
          />
        </div>
        <div className="field">
          <div className="field-label">city</div>
          <input className="field-input" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="field">
          <div className="field-label">bio · what's your live music year been?</div>
          <textarea
            className="field-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="seen 47 · 6 sold-out · 1 cancelled (rip)"
            style={{ minHeight: 70 }}
          />
        </div>
        <div className="field">
          <div className="field-label">avatar color</div>
          <div style={{ display: 'flex', gap: 12, padding: '4px 0' }}>
            {palette.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={c}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: paletteHex[c],
                  border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-photo)',
                }}
              />
            ))}
          </div>
        </div>

        <button className="btn btn-primary" disabled={!canSave} onClick={save}>
          {dirty ? 'save changes' : 'all saved'}
        </button>

        <div className="section-head" style={{ marginTop: 26 }}>background</div>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--ink-faded)', marginBottom: 8 }}>
          pick the paper your journal sits on.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  position: 'relative',
                  background: t.paper,
                  border: active ? `2px solid ${t.accent}` : '1px solid var(--border-soft)',
                  borderRadius: 8,
                  padding: 0,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden',
                  textAlign: 'left',
                  height: 102,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                aria-label={t.name}
                aria-pressed={active}
              >
                <div
                  style={{
                    background: t.paperWarm,
                    borderBottom: `1px solid rgba(0,0,0,0.08)`,
                    padding: '8px 10px 10px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: t.ink, lineHeight: 1 }}>
                    gigly
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 7,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        padding: '2px 4px',
                        border: `1px solid ${t.accent}`,
                        color: t.accent,
                        borderRadius: 1,
                        transform: 'rotate(-2deg)',
                      }}
                    >
                      LOVED
                    </span>
                  </div>
                </div>
                <div style={{ padding: '6px 10px 8px', background: t.paper }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: t.ink, textTransform: 'uppercase' }}>
                    {t.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-hand)', fontSize: 11, color: t.ink, opacity: 0.7, lineHeight: 1, marginTop: 2 }}>
                    {t.hand}
                  </div>
                </div>
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: t.accent,
                      color: t.paper,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-photo)',
                    }}
                  >
                    <IconCheck size={14} sw={2.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="section-head" style={{ marginTop: 26 }}>your shelf · in order</div>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 16, color: 'var(--ink-faded)', marginBottom: 8 }}>
          the top 3 of your loved gigs go on your profile.
        </div>

        <div className="segmented" style={{ padding: '0 0 8px', margin: '4px 0 12px' }}>
          {(['loved', 'mid', 'nah'] as const).map((t) => (
            <button
              key={t}
              className={`seg ${activeTier === t ? 'active' : ''}`}
              onClick={() => setActiveTier(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {ranked.length === 0 ? (
          <div className="empty">
            <div className="hand">no {activeTier} gigs yet</div>
            <div className="body">log one and rank it.</div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {ranked.map((g, i) => {
              const isTop3 = activeTier === 'loved' && i < 3;
              return (
                <div
                  key={g.id}
                  className="row"
                  style={{ padding: '12px 14px', gridTemplateColumns: 'auto 1fr auto auto' }}
                >
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      border: `1.5px solid ${isTop3 ? 'var(--terracotta)' : 'var(--border)'}`,
                      background: isTop3 ? 'var(--terracotta)' : 'transparent',
                      color: isTop3 ? 'var(--paper)' : 'var(--ink-soft)',
                      fontFamily: 'var(--font-display)', fontSize: 14,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div className="name">{g.artist}</div>
                    <div className="sub">{g.venue.toUpperCase()} · {g.date}</div>
                  </div>
                  <TierChip tier={g.tier} size="sm" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <button
                      onClick={() => moveRanking(activeTier, g.id, -1)}
                      disabled={i === 0}
                      aria-label="Move up"
                      style={{
                        background: 'transparent', border: '1px solid var(--border)',
                        borderRadius: 4, width: 28, height: 22,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        cursor: i === 0 ? 'not-allowed' : 'pointer',
                        opacity: i === 0 ? 0.3 : 1,
                        transform: 'rotate(-90deg)',
                      }}
                    >
                      <IconChev size={14} />
                    </button>
                    <button
                      onClick={() => moveRanking(activeTier, g.id, 1)}
                      disabled={i === ranked.length - 1}
                      aria-label="Move down"
                      style={{
                        background: 'transparent', border: '1px solid var(--border)',
                        borderRadius: 4, width: 28, height: 22,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        cursor: i === ranked.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: i === ranked.length - 1 ? 0.3 : 1,
                        transform: 'rotate(90deg)',
                      }}
                    >
                      <IconChev size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="section-head" style={{ marginTop: 26 }}>account</div>
        <button
          className="btn btn-danger"
          style={{ width: '100%', marginTop: 4 }}
          onClick={() => (confirmReset ? reset() : setConfirmReset(true))}
        >
          {confirmReset ? "tap again to confirm — wipes everything" : 'sign out · reset everything'}
        </button>
        {confirmReset && (
          <button
            onClick={() => setConfirmReset(false)}
            style={{
              display: 'block', margin: '10px auto 0',
              background: 'transparent', border: 'none',
              fontFamily: 'var(--font-serif)', fontSize: 13,
              color: 'var(--ink-soft)', textDecoration: 'underline', cursor: 'pointer',
            }}
          >
            never mind
          </button>
        )}

        <div style={{ textAlign: 'center', marginTop: 28, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-faded)' }}>
          GIGLY · CONCERT JOURNAL · v0.1
        </div>
      </div>
    </div>
  );
}
