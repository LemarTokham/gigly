// Display + countdown helpers for the journal aesthetic.
// Ticket-style: "22·SEP·24". Long: "Sun · 22 Sep · 2024". Countdowns: "4 days · 22 hours".

const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

const MONTHS_LONG = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function ticketDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = MONTHS_SHORT[d.getMonth()];
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}·${mm}·${yy}`;
}

export function longDate(iso: string): string {
  const d = new Date(iso);
  return `${DOW[d.getDay()]} · ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} · ${d.getFullYear()}`;
}

export function ago(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  if (hr < 24) {
    if (hr < 12) return 'last night';
    return `${hr}h ago`;
  }
  if (day === 1) return 'yesterday';
  if (day < 7) return `${day} days ago`;
  if (day < 30) return `${Math.floor(day / 7)}w ago`;
  if (day < 365) return `${Math.floor(day / 30)}mo ago`;
  return `${Math.floor(day / 365)}y ago`;
}

export function countdown(iso: string, now: Date = new Date()): string {
  const diff = new Date(iso).getTime() - now.getTime();
  if (diff <= 0) return 'tonight';
  const day = Math.floor(diff / 86_400_000);
  const hr = Math.floor((diff % 86_400_000) / 3_600_000);
  if (day === 0) return `${hr} hours`;
  if (day < 30) return `${day} day${day === 1 ? '' : 's'} · ${hr} hour${hr === 1 ? '' : 's'}`;
  const months = Math.floor(day / 30);
  return `${months} month${months === 1 ? '' : 's'}`;
}

// "12d 4h" style for compact countdowns
export function countdownCompact(iso: string, now: Date = new Date()): string {
  const diff = new Date(iso).getTime() - now.getTime();
  if (diff <= 0) return 'now';
  const day = Math.floor(diff / 86_400_000);
  const hr = Math.floor((diff % 86_400_000) / 3_600_000);
  return `${day}d ${hr}h`;
}

// ISO date n days from today
export function isoDaysFromNow(days: number, hour = 20): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// ISO date n days ago
export function isoDaysAgo(days: number, hour = 22): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}
