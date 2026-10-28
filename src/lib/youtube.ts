/** Accepts a YouTube watch/youtu.be/shorts/embed URL or a bare 11-character ID. */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1, 12) || null;
    if (u.hostname.endsWith('youtube.com') || u.hostname.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v');
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]{11})/);
      return m ? m[1] : null;
    }
  } catch { /* not a URL */ }
  return null;
}
