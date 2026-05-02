export type AvaColor = 'olive' | 'terracotta' | 'mustard' | 'plum' | 'indigo';

export type Tier = 'loved' | 'mid' | 'nah';

export type Theme = 'cream' | 'vellum' | 'kraft' | 'manila' | 'newsprint' | 'midnight';

export type User = {
  name: string;
  handle: string;
  bio: string;
  city: string;
  avaColor: AvaColor;
};

export type Comment = {
  id: number;
  user: string;
  body: string;
  ago: string;
};

export type GigScope = 'self' | 'friend' | 'stranger';

export type Gig = {
  id: number;
  user: string;
  artist: string;
  artistSlug: string;
  tour?: string;
  venue: string;
  venueSlug: string;
  city: string;
  date: string;
  dateISO: string;
  tier: Tier;
  note?: string;
  review: string;
  tags: string[];
  photo: string;
  likes: number;
  comments: Comment[];
  liked: boolean;
  scope: GigScope;
};

export type Rankings = Record<Tier, number[]>;

export type Friend = {
  handle: string;
  name: string;
  avaColor: AvaColor;
  following: boolean;
  city?: string;
  bio?: string;
};

export type UpcomingShow = {
  id: number;
  artist: string;
  artistSlug: string;
  venue: string;
  venueSlug: string;
  city: string;
  date: string;
  dateISO: string;
  score: number;
  sold: boolean;
  genre: string;
};

export type LocalArtist = {
  artist: string;
  artistSlug: string;
  genre: string;
  score: number;
  gigs: number;
};

export type VenueStatus = 'visited' | 'upcoming' | 'wishlist';

export type Venue = {
  id: number;
  name: string;
  slug: string;
  city: string;
  status: VenueStatus;
  x: number;
  y: number;
};

export type NotificationKind = 'like' | 'comment' | 'follow' | 'upcoming';

export type AppNotification = {
  id: number;
  kind: NotificationKind;
  actor?: string;
  gigId?: number;
  body: string;
  ago: string;
  read: boolean;
};
