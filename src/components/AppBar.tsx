import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBack } from './icons';

type Props = {
  title?: string;
  display?: boolean;     // render title as DM Serif Display
  back?: boolean;        // show a back button on the left
  onBack?: () => void;   // override default browser back
  right?: ReactNode;     // right-side actions
  small?: boolean;       // for nested pages
};

export function AppBar({ title, display = true, back, onBack, right, small }: Props) {
  const navigate = useNavigate();
  const handleBack = () => (onBack ? onBack() : navigate(-1));

  return (
    <div className="app-bar" style={small ? { padding: '8px 12px 4px' } : undefined}>
      {back ? (
        <button className="icon-btn" onClick={handleBack} aria-label="Back">
          <IconBack />
        </button>
      ) : (
        <span style={{ width: 36 }} />
      )}
      <div
        style={{
          fontFamily: display ? 'var(--font-display)' : 'var(--font-serif)',
          fontSize: small ? 18 : 22,
          color: 'var(--ink)',
          fontStyle: title === 'gigly' ? 'italic' : 'normal',
        }}
      >
        {title ?? ''}
      </div>
      <div className="actions">{right ?? <span style={{ width: 36 }} />}</div>
    </div>
  );
}
