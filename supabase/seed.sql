-- ============================================================
-- GIGLY · seed data
--
-- Run this AFTER the migration. Idempotent (ON CONFLICT DO NOTHING),
-- so re-running it is safe.
--
-- Seeds: artists, venues, upcoming shows. NO fake users or gigs —
-- real users will populate those.
-- ============================================================

-- ------------------------------------------------------------
-- Artists we know about
-- ------------------------------------------------------------
insert into public.artists (slug, name, genre, is_local, local_city) values
  ('metallica',              'Metallica',              'Metal',     false, null),
  ('xg',                     'XG',                     'K-pop',     false, null),
  ('phoebe-bridgers',        'Phoebe Bridgers',        'Indie',     false, null),
  ('beabadoobee',            'beabadoobee',            'Indie',     false, null),
  ('fontaines-dc',           'Fontaines D.C.',         'Post-punk', false, null),
  ('clairo',                 'Clairo',                 'Indie',     false, null),
  ('idles',                  'IDLES',                  'Post-punk', false, null),
  ('mitski',                 'Mitski',                 'Indie',     false, null),
  ('big-thief',              'Big Thief',              'Indie',     false, null),
  ('geese',                  'Geese',                  'Rock',      false, null),
  ('black-country-new-road', 'Black Country, New Road','Rock',      false, null),
  ('wednesday',              'Wednesday',              'Rock',      false, null),
  ('aphex-twin',             'Aphex Twin',             'Electronic',false, null),
  -- Local up-and-coming
  ('tan-sober-gentlemen',    'Tan & Sober Gentlemen',  'Folk',      true,  'NYC'),
  ('cool-greenhouse',        'The Cool Greenhouse',    'Post-punk', true,  'NYC'),
  ('wednesday-pain',         'Wednesday Pain',         'Shoegaze',  true,  'NYC'),
  ('ducks-ltd',              'Ducks Ltd.',             'Jangle',    true,  'NYC'),
  ('crumb',                  'Crumb',                  'Psych',     true,  'NYC')
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Venues we know about
-- ------------------------------------------------------------
insert into public.venues (slug, name, city, x, y) values
  ('brooklyn-steel',         'Brooklyn Steel',         'NYC',  38, 38),
  ('bowery-ballroom',        'Bowery Ballroom',        'NYC',  30, 50),
  ('madison-square-gdn',     'Madison Square Gdn',     'NYC',  48, 30),
  ('forest-hills-stadium',   'Forest Hills Stadium',   'NYC',  64, 44),
  ('webster-hall',           'Webster Hall',           'NYC',  42, 58),
  ('radio-city',             'Radio City',             'NYC',  56, 22),
  ('knockdown-center',       'Knockdown Center',       'NYC',  70, 60),
  ('foro-sol',               'Foro Sol',               'CDMX', 22, 78),
  ('kia-forum',              'Kia Forum',              'LA',   12, 42),
  ('palau-sant-jordi',       'Palau Sant Jordi',       'BCN',  84, 30),
  ('mercury-lounge',         'Mercury Lounge',         'NYC',  44, 52),
  ('trans-pecos',            'Trans-Pecos',            'NYC',  72, 48),
  ('babys-all-right',        "Baby's All Right",       'NYC',  34, 64),
  ('terminal-5',             'Terminal 5',             'NYC',  52, 26),
  ('the-wiltern',            'The Wiltern',            'LA',   10, 46),
  ('greek-theatre',          'Greek Theatre',          'LA',   8,  38),
  ('metlife-stadium',        'MetLife Stadium',        'NYC',  60, 18)
on conflict (slug) do nothing;

-- ------------------------------------------------------------
-- Upcoming shows — dates relative to NOW so they always look fresh.
-- ------------------------------------------------------------
insert into public.upcoming_shows (artist_slug, venue_slug, date, sold_out, genre) values
  ('mitski',                 'radio-city',           now() + interval '12 days', true,  'Indie'),
  ('big-thief',              'brooklyn-steel',       now() + interval '17 days', false, 'Indie'),
  ('geese',                  'bowery-ballroom',      now() + interval '25 days', false, 'Rock'),
  ('black-country-new-road', 'webster-hall',         now() + interval '40 days', false, 'Rock'),
  ('wednesday',              'knockdown-center',     now() + interval '54 days', false, 'Rock'),
  ('aphex-twin',             'forest-hills-stadium', now() + interval '85 days', true,  'Electronic');
