import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Wordmark } from '../components/Wordmark';

const cards = [
  {
    title: 'log every gig',
    body: 'rate it, write a few words, see the setlist. like a journal but for live music.',
    photo: '/assets/inspiration/journal-metallica.jpeg',
    tape: 'yellow' as const,
  },
  {
    title: 'follow your people',
    body: "see what your friends went to. tell them their pick was good. show them yours.",
    photo: '/assets/inspiration/journal-xg.jpeg',
    tape: 'pink' as const,
  },
  {
    title: 'turn it into a playlist',
    body: 'any setlist becomes a Spotify or Apple Music playlist. relive the night.',
    photo: '/assets/inspiration/journal-museu.jpeg',
    tape: 'yellow' as const,
  },
];

export function WelcomeScreen() {
  const navigate = useNavigate();
  const onboarded = useStore((s) => s.onboarded);
  const [step, setStep] = useState(0);
  const card = cards[step];
  const last = step === cards.length - 1;

  // If they're already onboarded, jump straight in.
  if (onboarded) {
    navigate('/feed', { replace: true });
    return null;
  }

  return (
    <div className="gigly-app">
      <div className="app-bar">
        <span style={{ width: 36 }} />
        <Wordmark size={108} />
        <button
          onClick={() => navigate('/signin')}
          className="icon-btn"
          style={{ width: 'auto', padding: '0 10px', fontFamily: 'var(--font-serif)', fontSize: 13 }}
        >
          skip
        </button>
      </div>

      <div className="scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 100px' }}>
        <div style={{ position: 'relative', marginBottom: 28, marginTop: 12 }}>
          <div className="polaroid" style={{ width: 240, transform: 'rotate(-3deg)' }}>
            {card.tape && (
              <div
                className="tape"
                style={{
                  left: -8,
                  top: -6,
                  background: card.tape === 'pink' ? 'var(--bg-tape-pink)' : 'var(--bg-tape)',
                }}
              />
            )}
            <div className="photo" style={{ backgroundImage: `url(${card.photo})` }} />
            <div className="cap">{card.title}</div>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--ink)', textAlign: 'center', marginBottom: 8, lineHeight: 1.05 }}>
          {card.title}
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, color: 'var(--paper-deep)', textAlign: 'center', maxWidth: 320, lineHeight: 1.45 }}>
          {card.body}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
          {cards.map((_, i) => (
            <span
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: i === step ? 'var(--terracotta)' : 'rgba(58,46,34,0.18)',
              }}
            />
          ))}
        </div>

        <button
          className="btn btn-primary"
          style={{ marginTop: 24, maxWidth: 320 }}
          onClick={() => (last ? navigate('/signin') : setStep(step + 1))}
        >
          {last ? "let's go" : 'next'}
        </button>
      </div>
    </div>
  );
}
