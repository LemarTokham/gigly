import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IconHome, IconSearch, IconPlus, IconMap, IconUser } from './icons';

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const cls = (path: string) => `tab ${isActive(path) ? 'active' : ''}`;

  return (
    <div className="tab-bar">
      <NavLink to="/feed" className={() => cls('/feed')}>
        <IconHome />
        <span>feed</span>
      </NavLink>
      <NavLink to="/discover" className={() => cls('/discover')}>
        <IconSearch />
        <span>discover</span>
      </NavLink>
      <button className="tab fab" onClick={() => navigate('/log')}>
        <IconPlus size={20} sw={2.4} />
        <span style={{ marginTop: 4 }}>log</span>
      </button>
      <NavLink to="/map" className={() => cls('/map')}>
        <IconMap />
        <span>map</span>
      </NavLink>
      <NavLink to="/profile" className={() => cls('/profile')}>
        <IconUser />
        <span>you</span>
      </NavLink>
    </div>
  );
}
