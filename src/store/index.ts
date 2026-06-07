import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppNotification,
  Comment,
  Friend,
  Gig,
  LocalArtist,
  Rankings,
  Theme,
  Tier,
  UpcomingShow,
  User,
  Venue,
} from '../types';
import {
  seedFollowedArtists,
  seedFriends,
  seedGigs,
  seedLocalArtists,
  seedNotifications,
  seedRankings,
  seedStrangerGigs,
  seedUpcoming,
  seedUser,
  seedVenues,
} from './seed';
import { ago, ticketDate } from '../lib/dates';
import { slugify } from '../lib/slug';

type LogGigInput = {
  artist: string;
  tour?: string;
  venue: string;
  city: string;
  dateISO: string;
  tier: Tier;
  rank: number;        // position within the tier's ranking (0 = top)
  review: string;
  tags: string[];
  photo: string;
};

type StoreState = {
  // identity / state
  user: User | null;
  onboarded: boolean;
  theme: Theme;

  // domain
  gigs: Gig[];
  friends: Friend[];
  upcoming: UpcomingShow[];
  localArtists: LocalArtist[];
  venues: Venue[];
  notifications: AppNotification[];
  rankings: Rankings;
  followedArtists: string[];

  // actions
  completeOnboarding: () => void;
  signIn: (p: { name: string; handle: string; avaColor: User['avaColor']; city?: string; bio?: string }) => void;
  updateUser: (patch: Partial<User>) => void;
  setTheme: (theme: Theme) => void;
  toggleLike: (gigId: number) => void;
  toggleFollow: (handle: string) => void;
  toggleArtistFollow: (slug: string) => void;
  logGig: (input: LogGigInput) => number;
  moveRanking: (tier: Tier, gigId: number, direction: -1 | 1) => void;
  addComment: (gigId: number, body: string) => void;
  markNotificationsRead: () => void;
  addVenueIfMissing: (name: string, city: string) => Venue;
  resetAll: () => void;
};

const baseInitial = {
  user: null as User | null,
  onboarded: false,
  theme: 'cream' as Theme,
  gigs: [...seedGigs, ...seedStrangerGigs],
  friends: seedFriends,
  upcoming: seedUpcoming,
  localArtists: seedLocalArtists,
  venues: seedVenues,
  notifications: seedNotifications,
  rankings: seedRankings,
  followedArtists: seedFollowedArtists,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...baseInitial,

      completeOnboarding: () => set({ onboarded: true }),

      signIn: (p) => {
        const u: User = {
          name: p.name,
          handle: p.handle,
          avaColor: p.avaColor,
          city: p.city ?? 'NYC',
          bio: p.bio ?? `seen ${get().gigs.filter((g) => g.scope === 'self').length}`,
        };
        // Re-attribute self gigs to this handle so the profile makes sense.
        const oldHandle = get().user?.handle ?? seedUser.handle;
        if (oldHandle !== p.handle) {
          set({
            gigs: get().gigs.map((g) =>
              g.scope === 'self' ? { ...g, user: p.handle } : g
            ),
          });
        }
        set({ user: u });
      },

      updateUser: (patch) => {
        const u = get().user;
        if (!u) return;
        set({ user: { ...u, ...patch } });
      },

      setTheme: (theme) => set({ theme }),

      toggleLike: (gigId) =>
        set({
          gigs: get().gigs.map((g) =>
            g.id === gigId
              ? { ...g, liked: !g.liked, likes: g.likes + (g.liked ? -1 : 1) }
              : g
          ),
        }),

      toggleFollow: (handle) =>
        set({
          friends: get().friends.map((f) =>
            f.handle === handle ? { ...f, following: !f.following } : f
          ),
        }),

      toggleArtistFollow: (slug) =>
        set({
          followedArtists: get().followedArtists.includes(slug)
            ? get().followedArtists.filter((a) => a !== slug)
            : [...get().followedArtists, slug],
        }),

      addVenueIfMissing: (name, city) => {
        const slug = slugify(name);
        const existing = get().venues.find((v) => v.slug === slug);
        if (existing) return existing;
        const id = Math.max(0, ...get().venues.map((v) => v.id)) + 1;
        const v: Venue = {
          id,
          name,
          slug,
          city,
          status: 'visited',
          x: 25 + ((id * 13) % 50),
          y: 25 + ((id * 17) % 45),
        };
        set({ venues: [...get().venues, v] });
        return v;
      },

      logGig: (input) => {
        const id = Math.max(0, ...get().gigs.map((g) => g.id)) + 1;
        const u = get().user;
        const handle = u?.handle ?? seedUser.handle;
        const venueObj = get().addVenueIfMissing(input.venue, input.city);
        const gig: Gig = {
          id,
          user: handle,
          artist: input.artist,
          artistSlug: slugify(input.artist),
          tour: input.tour,
          venue: input.venue,
          venueSlug: venueObj.slug,
          city: input.city,
          date: ticketDate(input.dateISO),
          dateISO: input.dateISO,
          tier: input.tier,
          review: input.review,
          tags: input.tags,
          photo: input.photo,
          likes: 0,
          comments: [],
          liked: false,
          scope: 'self',
        };

        const tierList = get().rankings[input.tier];
        const clamped = Math.max(0, Math.min(input.rank, tierList.length));
        const newTierList = [...tierList.slice(0, clamped), id, ...tierList.slice(clamped)];

        set({
          gigs: [gig, ...get().gigs],
          venues: get().venues.map((v) =>
            v.slug === venueObj.slug ? { ...v, status: 'visited' } : v
          ),
          rankings: { ...get().rankings, [input.tier]: newTierList },
        });
        return id;
      },

      moveRanking: (tier, gigId, direction) => {
        const list = get().rankings[tier];
        const idx = list.indexOf(gigId);
        if (idx === -1) return;
        const target = idx + direction;
        if (target < 0 || target >= list.length) return;
        const next = [...list];
        [next[idx], next[target]] = [next[target], next[idx]];
        set({ rankings: { ...get().rankings, [tier]: next } });
      },

      addComment: (gigId, body) =>
        set({
          gigs: get().gigs.map((g) => {
            if (g.id !== gigId) return g;
            const cid = Math.max(0, ...g.comments.map((c) => c.id)) + 1;
            const handle = get().user?.handle ?? seedUser.handle;
            const c: Comment = { id: cid, user: handle, body, ago: ago(new Date().toISOString()) };
            return { ...g, comments: [...g.comments, c] };
          }),
        }),

      markNotificationsRead: () =>
        set({
          notifications: get().notifications.map((n) => ({ ...n, read: true })),
        }),

      resetAll: () => {
        try {
          localStorage.removeItem('gigly:v1');
        } catch {
          // ignore
        }
        set({ ...baseInitial });
      },
    }),
    {
      name: 'gigly:v1',
      version: 5,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown> | null;
        if (!state) return state;

        // v4 → v5: rewrite old journal photo paths (files deleted) to new concert photos.
        // Map: journal-metallica → metallica-band, others → concert-crowd.
        if (version < 5) {
          const photoMap: Record<string, string> = {
            '/assets/inspiration/journal-metallica.jpeg': '/assets/concert-photos/metallica-band.jpg',
            '/assets/inspiration/journal-xg.jpeg':        '/assets/concert-photos/concert-crowd.webp',
            '/assets/inspiration/journal-museu.jpeg':     '/assets/concert-photos/concert-crowd.webp',
          };
          const oldGigs = (state.gigs as Array<Gig & { photo?: string }>) ?? [];
          state.gigs = oldGigs.map((g) =>
            g.photo && photoMap[g.photo] ? { ...g, photo: photoMap[g.photo] } : g
          );
        }

        // v1 → v2: rating → tier + rankings
        if (version < 2) {
          const oldGigs = (state.gigs as Array<Record<string, unknown>>) ?? [];
          const tieredGigs: Gig[] = oldGigs.map((g) => {
            const rating = (g.rating as number | undefined) ?? 0;
            const tier: Tier = rating >= 4.5 ? 'loved' : rating >= 3 ? 'mid' : 'nah';
            const { rating: _drop, ...rest } = g as Record<string, unknown> & { rating?: number };
            void _drop;
            return { ...(rest as unknown as Gig), tier };
          });

          const ratingFor = (id: number): number =>
            (oldGigs.find((g) => g.id === id) as { rating?: number } | undefined)?.rating ?? 0;

          const rankings: Rankings = { loved: [], mid: [], nah: [] };
          for (const g of tieredGigs.filter((g) => g.scope === 'self')) {
            rankings[g.tier].push(g.id);
          }
          (Object.keys(rankings) as Tier[]).forEach((t) => {
            rankings[t].sort((a, b) => ratingFor(b) - ratingFor(a));
          });

          const { topGigIds: _t, ...rest } = state as Record<string, unknown> & { topGigIds?: unknown };
          void _t;

          state.gigs = tieredGigs;
          state.rankings = rankings;
          Object.assign(state, rest);
        }

        // v2 → v3 → v4: ensure strangers + followed artists are present (idempotent).
        // Bumped from v3 to v4 when we added local-artist stranger gigs (ids 108-112).
        if (version < 4) {
          const existing = (state.gigs as Gig[]) ?? [];
          const existingIds = new Set(existing.map((g) => g.id));
          const newStrangers = seedStrangerGigs.filter((g) => !existingIds.has(g.id));
          state.gigs = [...existing, ...newStrangers];
          if (!state.followedArtists) {
            state.followedArtists = seedFollowedArtists;
          }
        }

        return state;
      },
    }
  )
);

// ---------- Selectors ----------

export const selectFriendFeed = (s: StoreState): Gig[] => {
  const followed = new Set(s.friends.filter((f) => f.following).map((f) => f.handle));
  return s.gigs
    .filter((g) => g.scope === 'friend' && followed.has(g.user))
    .slice()
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
};

export const selectArtistsFeed = (s: StoreState): Gig[] => {
  const set = new Set(s.followedArtists);
  return s.gigs
    .filter((g) => g.scope !== 'self' && set.has(g.artistSlug))
    .slice()
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
};

export const selectLocalFeed = (s: StoreState): Gig[] => {
  const city = s.user?.city ?? 'NYC';
  return s.gigs
    .filter((g) => g.scope !== 'self' && g.city === city)
    .slice()
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));
};

export const selectArtistOtherLogs = (s: StoreState, slug: string): Gig[] =>
  s.gigs
    .filter((g) => g.artistSlug === slug && g.scope !== 'self')
    .slice()
    .sort((a, b) => b.dateISO.localeCompare(a.dateISO));

export const selectYouFeed = (s: StoreState): Gig[] =>
  s.gigs.filter((g) => g.scope === 'self').slice().sort((a, b) => b.dateISO.localeCompare(a.dateISO));

export const selectTopGigs = (s: StoreState): Gig[] =>
  s.rankings.loved
    .slice(0, 3)
    .map((id) => s.gigs.find((g) => g.id === id))
    .filter((g): g is Gig => Boolean(g));

export const selectLovedRanked = (s: StoreState): Gig[] =>
  s.rankings.loved
    .map((id) => s.gigs.find((g) => g.id === id))
    .filter((g): g is Gig => Boolean(g));

export const selectByTierRanked = (s: StoreState, tier: Tier): Gig[] =>
  s.rankings[tier]
    .map((id) => s.gigs.find((g) => g.id === id))
    .filter((g): g is Gig => Boolean(g));

export const selectGigsByArtist = (s: StoreState, slug: string): Gig[] =>
  s.gigs.filter((g) => g.artistSlug === slug).slice().sort((a, b) => b.dateISO.localeCompare(a.dateISO));

export const selectGigsByVenue = (s: StoreState, slug: string): Gig[] =>
  s.gigs.filter((g) => g.venueSlug === slug).slice().sort((a, b) => b.dateISO.localeCompare(a.dateISO));

export const selectVenueStats = (s: StoreState) => {
  const visited = s.venues.filter((v) => v.status === 'visited');
  const cities = new Set(visited.map((v) => v.city));
  const userGigs = s.gigs.filter((g) => g.scope === 'self');
  const lovedCount = userGigs.filter((g) => g.tier === 'loved').length;
  return {
    venues: visited.length,
    cities: cities.size,
    countries: 1 + (cities.has('CDMX') ? 1 : 0) + (cities.has('BCN') ? 1 : 0) + (cities.has('LDN') ? 1 : 0),
    gigs: userGigs.length,
    loved: lovedCount,
  };
};

export const selectUnreadCount = (s: StoreState): number =>
  s.notifications.filter((n) => !n.read).length;
