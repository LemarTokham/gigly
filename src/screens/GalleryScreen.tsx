import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from '../components/AppBar';
import { Polaroid } from '../components/Polaroid';
import { EmptyState } from '../components/EmptyState';
import { useShallow } from 'zustand/react/shallow';
import { selectYouFeed, useStore } from '../store';

type Sort = 'newest' | 'top';

const tierOrder = { loved: 0, mid: 1, nah: 2 } as const;

export function GalleryScreen() {
  const navigate = useNavigate();
  const youFeed = useStore(useShallow(selectYouFeed));
  const [sort, setSort] = useState<Sort>('newest');

  const sorted = useMemo(() => {
    if (sort === 'top') {
      return [...youFeed].sort((a, b) => {
        const t = tierOrder[a.tier] - tierOrder[b.tier];
        return t !== 0 ? t : b.dateISO.localeCompare(a.dateISO);
      });
    }
    return youFeed;
  }, [youFeed, sort]);

  return (
    <div className="gigly-app">
      <AppBar title="poster gallery" back small />
      <div className="segmented" style={{ padding: '0 16px 8px' }}>
        {(['newest', 'top'] as const).map((s) => (
          <button key={s} className={`seg ${sort === s ? 'active' : ''}`} onClick={() => setSort(s)}>
            {s}
          </button>
        ))}
      </div>
      <div className="scroll">
        {sorted.length === 0 ? (
          <EmptyState hand="nothing on your shelf" body="log a gig and it'll show up here." />
        ) : (
          <div className="gallery">
            {sorted.map((g, i) => (
              <button
                key={g.id}
                onClick={() => navigate(`/gig/${g.id}`)}
                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <Polaroid
                  photo={g.photo}
                  caption={`${g.artist} · ${g.date}`}
                  rotate={[-3, 2, -1.5, 1.5, -2.5, 2.5, -1, 1][i % 8]}
                  tape={(['yellow', 'pink', null, 'yellow'] as const)[i % 4]}
                  width="100%"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
