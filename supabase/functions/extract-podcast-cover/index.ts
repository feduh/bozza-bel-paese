import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

type Result = {
  cover_url?: string | null;
  kind?: 'audio' | 'video';
  title?: string | null;
  author?: string | null;
  duration?: string | null;
  error?: string;
};

const json = (body: Result, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

// Allow-list of known podcast/video providers (suffix match on hostname)
const ALLOWED_HOST_SUFFIXES = [
  'youtube.com',
  'youtu.be',
  'ytimg.com',
  'spotify.com',
  'spreaker.com',
  'soundcloud.com',
  'vimeo.com',
  'apple.com',
  'applepodcasts.com',
  'podcasts.apple.com',
  'anchor.fm',
  'buzzsprout.com',
  'podbean.com',
  'simplecast.com',
  'transistor.fm',
  'castbox.fm',
  'megaphone.fm',
  'acast.com',
  'redcircle.com',
  'rss.com',
];

const isHostAllowed = (host: string): boolean => {
  const h = host.toLowerCase().replace(/^www\./, '');
  return ALLOWED_HOST_SUFFIXES.some((s) => h === s || h.endsWith('.' + s));
};

const isPrivateIp = (host: string): boolean => {
  // Block IP literals pointing at private / loopback / link-local / metadata ranges.
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const [a, b] = [parseInt(ipv4[1], 10), parseInt(ipv4[2], 10)];
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true; // link-local + AWS/GCP metadata 169.254.169.254
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true; // multicast / reserved
    return false;
  }
  if (host.includes(':')) return true; // reject raw IPv6 literals conservatively
  if (host === 'localhost') return true;
  return false;
};

const validateUrl = (raw: string): { ok: true; url: URL } | { ok: false; error: string } => {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { ok: false, error: 'URL non valido' };
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    return { ok: false, error: 'Protocollo non consentito' };
  }
  const host = u.hostname;
  if (isPrivateIp(host)) return { ok: false, error: 'Host non consentito' };
  if (!isHostAllowed(host)) return { ok: false, error: 'Dominio non supportato' };
  return { ok: true, url: u };
};

const FETCH_TIMEOUT_MS = 8000;
const MAX_BYTES = 512 * 1024; // 512 KB cap on scraped HTML

const safeFetch = async (target: string, init: RequestInit = {}): Promise<Response | null> => {
  const v = validateUrl(target);
  if (!v.ok) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    // NOTE: redirect: 'manual' — we don't want the server to follow redirects
    // into disallowed hosts (SSRF via redirect).
    return await fetch(v.url.toString(), { ...init, redirect: 'manual', signal: ctrl.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
};

const readCapped = async (r: Response): Promise<string> => {
  const reader = r.body?.getReader();
  if (!reader) return await r.text();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > MAX_BYTES) break;
      chunks.push(value);
    }
  }
  const buf = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    buf.set(c, off);
    off += c.byteLength;
  }
  return new TextDecoder().decode(buf);
};

const youtubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/watch')) return u.searchParams.get('v');
      const m = u.pathname.match(/\/(shorts|embed|live)\/([\w-]+)/);
      if (m) return m[2];
    }
  } catch {
    /* noop */
  }
  return null;
};

const fetchOembed = async (endpoint: string, target: string): Promise<Result | null> => {
  const r = await safeFetch(`${endpoint}?url=${encodeURIComponent(target)}&format=json`, {
    headers: { 'User-Agent': 'IlBelPaeseBot/1.0' },
  });
  if (!r || !r.ok) return null;
  try {
    const d = await r.json();
    return {
      cover_url: d.thumbnail_url ?? null,
      title: d.title ?? null,
      author: d.author_name ?? null,
    };
  } catch {
    return null;
  }
};

const fetchOgImage = async (target: string): Promise<Result | null> => {
  const r = await safeFetch(target, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IlBelPaeseBot/1.0)' },
  });
  if (!r || !r.ok) return null;
  const html = await readCapped(r);
  const pick = (re: RegExp) => html.match(re)?.[1] ?? null;
  const cover =
    pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  const title =
    pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    pick(/<title>([^<]+)<\/title>/i);
  return { cover_url: cover, title };
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Require an authenticated user — this function is only used by staff
    // (coordinators/admin) in the podcast editor.
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401);
    }
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authErr } = await authClient.auth.getUser();
    if (authErr || !user) return json({ error: 'Unauthorized' }, 401);

    const { url } = await req.json();
    if (!url || typeof url !== 'string') return json({ error: 'URL mancante' }, 400);

    const v = validateUrl(url);
    if (!v.ok) return json({ error: v.error }, 400);
    const host = v.url.hostname.replace(/^www\./, '');

    // YouTube
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const id = youtubeId(url);
      if (id) {
        return json({
          cover_url: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
          kind: 'video',
        });
      }
    }

    if (host.includes('spotify.com')) {
      const oe = await fetchOembed('https://open.spotify.com/oembed', url);
      if (oe) return json({ ...oe, kind: 'audio' });
    }

    if (host.includes('spreaker.com')) {
      const oe = await fetchOembed('https://api.spreaker.com/oembed', url);
      if (oe) return json({ ...oe, kind: 'audio' });
    }

    if (host.includes('soundcloud.com')) {
      const oe = await fetchOembed('https://soundcloud.com/oembed', url);
      if (oe) return json({ ...oe, kind: 'audio' });
    }

    if (host.includes('vimeo.com')) {
      const oe = await fetchOembed('https://vimeo.com/api/oembed.json', url);
      if (oe) return json({ ...oe, kind: 'video' });
    }

    // Fallback: og:image scrape (Apple Podcasts, allow-listed hosts)
    const og = await fetchOgImage(url);
    if (og?.cover_url) {
      return json({ ...og, kind: 'audio' });
    }

    return json({ error: 'Impossibile estrarre la copertina da questo URL.' }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Errore ignoto' }, 500);
  }
});
