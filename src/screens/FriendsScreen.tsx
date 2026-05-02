import { useState, useMemo } from 'react';
import { AppBar } from '../components/AppBar';
import { Avatar } from '../components/Avatar';
import { EmptyState } from '../components/EmptyState';
import { useStore } from '../store';

export function FriendsScreen() {
  const friends = useStore((s) => s.friends);
  const toggleFollow = useStore((s) => s.toggleFollow);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!q.trim()) return friends;
    const ql = q.toLowerCase();
    return friends.filter((f) =>
      `${f.name} ${f.handle} ${f.city ?? ''} ${f.bio ?? ''}`.toLowerCase().includes(ql)
    );
  }, [friends, q]);

  const following = filtered.filter((f) => f.following);
  const suggested = filtered.filter((f) => !f.following);

  return (
    <div className="gigly-app">
      <AppBar title="friends" back small />
      <div style={{ padding: '4px 16px 8px' }}>
        <input
          className="field-input"
          placeholder="search by handle, name, city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="scroll">
        {filtered.length === 0 ? (
          <EmptyState hand="no one matches" body="try a different search." />
        ) : (
          <>
            {following.length > 0 && (
              <>
                <div className="section-head">following · {following.length}</div>
                <div className="card" style={{ padding: '0 14px' }}>
                  {following.map((f) => (
                    <FriendRow key={f.handle} friend={f} onToggle={() => toggleFollow(f.handle)} />
                  ))}
                </div>
              </>
            )}
            {suggested.length > 0 && (
              <>
                <div className="section-head" style={{ marginTop: 18 }}>suggested</div>
                <div className="card" style={{ padding: '0 14px' }}>
                  {suggested.map((f) => (
                    <FriendRow key={f.handle} friend={f} onToggle={() => toggleFollow(f.handle)} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div style={{ textAlign: 'center', padding: '24px 0 8px', fontFamily: 'var(--font-hand)', fontSize: 18, color: 'var(--ink-faded)' }}>
          tell a friend about gigly. they probably go to shows too.
        </div>
      </div>
    </div>
  );
}

type Friend = ReturnType<typeof useStore.getState>['friends'][number];

function FriendRow({ friend, onToggle }: { friend: Friend; onToggle: () => void }) {
  return (
    <div className="row" style={{ padding: '12px 0' }}>
      <Avatar name={friend.name} color={friend.avaColor} size={40} />
      <div>
        <div className="name">{friend.name}</div>
        <div className="sub">@{friend.handle}{friend.city ? ` · ${friend.city}` : ''}</div>
        {friend.bio && (
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, fontStyle: 'italic' }}>
            {friend.bio}
          </div>
        )}
      </div>
      <button
        onClick={onToggle}
        className={friend.following ? 'btn btn-ghost' : 'btn btn-primary'}
        style={{ padding: '7px 14px', fontSize: 13, width: 'auto' }}
      >
        {friend.following ? 'following' : 'follow'}
      </button>
    </div>
  );
}
