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
  try {
    const r = await fetch(`${endpoint}?url=${encodeURIComponent(target)}&format=json`, {
      headers: { 'User-Agent': 'IlBelPaeseBot/1.0' },
    });
    if (!r.ok) return null;
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
  try {
    const r = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IlBelPaeseBot/1.0)' },
      redirect: 'follow',
    });
    if (!r.ok) return null;
    const html = await r.text();
    const pick = (re: RegExp) => html.match(re)?.[1] ?? null;
    const cover =
      pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      pick(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const title =
      pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      pick(/<title>([^<]+)<\/title>/i);
    return { cover_url: cover, title };
  } catch {
    return null;
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') return json({ error: 'URL mancante' }, 400);

    let host = '';
    try {
      host = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return json({ error: 'URL non valido' }, 400);
    }

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

    // Spotify
    if (host.includes('spotify.com')) {
      const oe = await fetchOembed('https://open.spotify.com/oembed', url);
      if (oe) return json({ ...oe, kind: 'audio' });
    }

    // Spreaker
    if (host.includes('spreaker.com')) {
      const oe = await fetchOembed('https://api.spreaker.com/oembed', url);
      if (oe) return json({ ...oe, kind: 'audio' });
    }

    // SoundCloud
    if (host.includes('soundcloud.com')) {
      const oe = await fetchOembed('https://soundcloud.com/oembed', url);
      if (oe) return json({ ...oe, kind: 'audio' });
    }

    // Vimeo
    if (host.includes('vimeo.com')) {
      const oe = await fetchOembed('https://vimeo.com/api/oembed.json', url);
      if (oe) return json({ ...oe, kind: 'video' });
    }

    // Fallback: og:image scrape (Apple Podcasts, generic hosts)
    const og = await fetchOgImage(url);
    if (og?.cover_url) {
      const kind: 'audio' | 'video' =
        host.includes('podcast') || host.includes('apple.com') || host.includes('spreaker') ? 'audio' : 'audio';
      return json({ ...og, kind });
    }

    return json({ error: 'Impossibile estrarre la copertina da questo URL.' }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Errore ignoto' }, 500);
  }
});
