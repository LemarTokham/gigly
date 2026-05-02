import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { useStore } from './store';
import { FeedScreen } from './screens/FeedScreen';
import { LogGigScreen } from './screens/LogGigScreen';
import { GigDetailScreen } from './screens/GigDetailScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { MapScreen } from './screens/MapScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { SignInScreen } from './screens/SignInScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { FriendsScreen } from './screens/FriendsScreen';
import { ArtistScreen } from './screens/ArtistScreen';
import { VenueScreen } from './screens/VenueScreen';
import { GalleryScreen } from './screens/GalleryScreen';
import { CommentsScreen } from './screens/CommentsScreen';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.querySelector('.scroll')?.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Root() {
  const onboarded = useStore((s) => s.onboarded);
  const user = useStore((s) => s.user);
  if (!onboarded) return <Navigate to="/welcome" replace />;
  if (!user) return <Navigate to="/signin" replace />;
  return <Navigate to="/feed" replace />;
}

function RequireAuth({ children }: { children: React.ReactElement }) {
  const onboarded = useStore((s) => s.onboarded);
  const user = useStore((s) => s.user);
  if (!onboarded) return <Navigate to="/welcome" replace />;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/signin" element={<SignInScreen />} />
          <Route path="/feed" element={<RequireAuth><FeedScreen /></RequireAuth>} />
          <Route path="/discover" element={<RequireAuth><DiscoverScreen /></RequireAuth>} />
          <Route path="/map" element={<RequireAuth><MapScreen /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfileScreen /></RequireAuth>} />
          <Route path="/log" element={<RequireAuth><LogGigScreen /></RequireAuth>} />
          <Route path="/gig/:id" element={<RequireAuth><GigDetailScreen /></RequireAuth>} />
          <Route path="/gig/:id/comments" element={<RequireAuth><CommentsScreen /></RequireAuth>} />
          <Route path="/artist/:slug" element={<RequireAuth><ArtistScreen /></RequireAuth>} />
          <Route path="/venue/:slug" element={<RequireAuth><VenueScreen /></RequireAuth>} />
          <Route path="/friends" element={<RequireAuth><FriendsScreen /></RequireAuth>} />
          <Route path="/notifications" element={<RequireAuth><NotificationsScreen /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsScreen /></RequireAuth>} />
          <Route path="/gallery" element={<RequireAuth><GalleryScreen /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
