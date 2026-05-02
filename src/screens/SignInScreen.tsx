import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { Wordmark } from '../components/Wordmark';
import { useStore } from '../store';
import type { AvaColor } from '../types';

const palette: AvaColor[] = ['olive', 'terracotta', 'mustard', 'plum', 'indigo'];

export function SignInScreen() {
  const navigate = useNavigate();
  const signIn = useStore((s) => s.signIn);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const existing = useStore((s) => s.user);

  const [name, setName] = useState(existing?.name ?? '');
  const [handle, setHandle] = useState(existing?.handle ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [color, setColor] = useState<AvaColor>(existing?.avaColor ?? 'olive');

  const validHandle = /^[a-z0-9_]{2,20}$/.test(handle);
  const valid = name.trim().length > 1 && validHandle;

  const handleSubmit = () => {
    if (!valid) return;
    signIn({ name: name.trim(), handle: handle.trim(), avaColor: color, city: city.trim() || 'NYC' });
    completeOnboarding();
    navigate('/feed', { replace: true });
  };

  return (
    <div className="gigly-app">
      <div className="app-bar">
        <span style={{ width: 36 }} />
        <Wordmark />
        <span style={{ width: 36 }} />
      </div>

      <div className="scroll" style={{ padding: '20px 24px 100px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', textAlign: 'center', marginBottom: 4 }}>
          who are you?
        </div>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-faded)', textAlign: 'center', marginBottom: 20 }}>
          this is just for the demo — no email, no password.
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Avatar name={name || '?'} color={color} size={84} />
        </div>

        <div className="field">
          <div className="field-label">name</div>
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="alex chen"
            autoFocus
          />
        </div>

        <div className="field">
          <div className="field-label">handle</div>
          <input
            className="field-input"
            value={handle}
            onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="alex"
            maxLength={20}
          />
          <div className="field-help">
            {handle && !validHandle ? '2–20 chars, letters/numbers/underscore only' : 'this is your @ on gigly'}
          </div>
        </div>

        <div className="field">
          <div className="field-label">city</div>
          <input
            className="field-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="NYC"
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
                  background: ({ olive: '#6F7A3D', terracotta: '#C8553D', mustard: '#D4A24C', plum: '#5C3A4E', indigo: '#364C6E' } as Record<AvaColor, string>)[c],
                  border: color === c ? '2px solid var(--ink)' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-photo)',
                }}
              />
            ))}
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleSubmit} disabled={!valid}>
          start logging
        </button>
      </div>
    </div>
  );
}
