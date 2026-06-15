import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

// Source IT fields (canonical), and their EN counterparts.
const FIELD_MAP: Record<string, { it: string; en: string }[]> = {
  blog_posts: [
    { it: 'title', en: 'title_en' },
    { it: 'excerpt', en: 'excerpt_en' },
    { it: 'content', en: 'content_en' },
  ],
  realities: [
    { it: 'name', en: 'name_en' },
    { it: 'description', en: 'description_en' },
    { it: 'history', en: 'history_en' },
  ],
};

async function callAi(system: string, user: string): Promise<string> {
  if (!user || !user.trim()) return '';
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? '';
}

async function detectLanguage(samples: string[]): Promise<'it' | 'en'> {
  const sample = samples
    .filter(Boolean)
    .map((s) => s.replace(/\s+/g, ' ').slice(0, 400))
    .join('\n---\n')
    .slice(0, 1200);
  if (!sample.trim()) return 'it';
  const out = await callAi(
    'You are a language detector. Answer with exactly one token: "it" if the text is primarily Italian, "en" if primarily English. No punctuation, no explanation.',
    sample,
  );
  const norm = out.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2);
  return norm === 'en' ? 'en' : 'it';
}

const SYS_IT_TO_EN =
  'You are a professional Italian→English translator for an editorial cultural-mapping website (artists, art spaces, independent realities). Translate the user message into natural, fluent, editorial English. Preserve markdown, links, line breaks, and proper nouns (names of places, people, organizations). Do NOT add commentary or quotes — return only the translated text.';
const SYS_EN_TO_IT =
  'You are a professional English→Italian translator for an editorial cultural-mapping website (artists, art spaces, independent realities). Translate the user message into natural, fluent, editorial Italian. Preserve markdown, links, line breaks, and proper nouns (names of places, people, organizations). Do NOT add commentary or quotes — return only the translated text.';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { table, id } = await req.json();
    const fields = FIELD_MAP[table];
    if (!fields || !id) {
      return new Response(JSON.stringify({ error: 'invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: row, error } = await admin
      .from(table)
      .select(fields.map((f) => f.it).join(','))
      .eq('id', id)
      .maybeSingle();
    if (error || !row) throw new Error(error?.message ?? 'row not found');

    const itValues = fields.map((f) => (row as Record<string, string | null>)[f.it] ?? '');
    const sourceLang = await detectLanguage(itValues);

    const update: Record<string, unknown> = { translated_at: new Date().toISOString() };

    if (sourceLang === 'it') {
      // Standard path: IT canonical → fill EN
      for (let i = 0; i < fields.length; i++) {
        const text = itValues[i];
        update[fields[i].en] = text ? await callAi(SYS_IT_TO_EN, text) : null;
      }
    } else {
      // Author wrote in English → translate to IT, save EN as the original, IT field becomes the translation
      for (let i = 0; i < fields.length; i++) {
        const text = itValues[i];
        if (!text) {
          update[fields[i].it] = null;
          update[fields[i].en] = null;
          continue;
        }
        const it = await callAi(SYS_EN_TO_IT, text);
        update[fields[i].en] = text; // preserve original English
        update[fields[i].it] = it;   // replace IT field with Italian translation
      }
    }

    const { error: upErr } = await admin.rpc('apply_translation', {
      _table: table,
      _id: id,
      _fields: update,
    });
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ ok: true, sourceLang }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('auto-translate error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
