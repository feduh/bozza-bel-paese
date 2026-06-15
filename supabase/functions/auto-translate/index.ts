import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

const FIELD_MAP: Record<string, { src: string; dst: string }[]> = {
  blog_posts: [
    { src: 'title', dst: 'title_en' },
    { src: 'excerpt', dst: 'excerpt_en' },
    { src: 'content', dst: 'content_en' },
  ],
  realities: [
    { src: 'name', dst: 'name_en' },
    { src: 'description', dst: 'description_en' },
    { src: 'history', dst: 'history_en' },
  ],
};

async function translate(text: string): Promise<string> {
  if (!text || !text.trim()) return '';
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional Italian→English translator for an editorial cultural-mapping website (artists, art spaces, independent realities). Translate the user message into natural, fluent, editorial English. Preserve markdown, links, line breaks, and proper nouns (names of places, people, organizations). Do NOT add commentary or quotes — return only the translated text.',
        },
        { role: 'user', content: text },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI gateway ${res.status}: ${body}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? '';
}

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
      .select(fields.map((f) => f.src).join(','))
      .eq('id', id)
      .maybeSingle();
    if (error || !row) throw new Error(error?.message ?? 'row not found');

    const update: Record<string, unknown> = { translated_at: new Date().toISOString() };
    for (const { src, dst } of fields) {
      const value = (row as Record<string, string | null>)[src] ?? '';
      update[dst] = value ? await translate(value) : null;
    }

    const { error: upErr } = await admin.rpc('apply_translation', {
      _table: table,
      _id: id,
      _fields: update,
    });
    if (upErr) throw upErr;

    return new Response(JSON.stringify({ ok: true }), {
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
