// Share helper: prefers Web Share API, falls back to clipboard.
export async function shareLink(opts: {
  title?: string;
  text?: string;
  url?: string;
}): Promise<'shared' | 'copied' | 'failed'> {
  const fullUrl = opts.url ?? window.location.href;
  const data = { title: opts.title, text: opts.text, url: fullUrl };

  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch {
      // fall through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(fullUrl);
    return 'copied';
  } catch {
    return 'failed';
  }
}
