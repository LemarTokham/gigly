import type { ReactNode } from 'react';
import { useStore } from '../store';

export function AppShell({ children }: { children: ReactNode }) {
  const theme = useStore((s) => s.theme);
  return (
    <div className={`gigly-stage theme-${theme}`}>
      {children}
    </div>
  );
}
