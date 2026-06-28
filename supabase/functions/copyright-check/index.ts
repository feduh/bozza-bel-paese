import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

interface CheckPayload {
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  declaration: {
    imagesOrigin: string;          // 'own' | 'cc' | 'purchased' | 'public_domain' | 'mixed'
    imagesCredits: string;         // libero
    textOrigin: string;            // 'original' | 'with_citations' | 'translation'
    quotesAttributed: boolean;
    aiGenerated: boolean;
    rightsConfirmed: boolean;
  };
}

const SYSTEM_PROMPT = `Sei un revisore esperto di copyright per una rivista culturale italiana. Analizza l'articolo fornito e segnala SOLO problemi gravi e oggettivi di possibile violazione di copyright o plagio.

Considera:
- Watermark visibili (Getty, Shutterstock, Alamy, AP, Reuters, ANSA, ecc.) nelle immagini di copertina.
- Testo che appare copiato letteralmente da fonti note senza attribuzione.
- Frasi che richiamano stili giornalistici di testate con copyright (es. blocchi interi presi da quotidiani).
- Coerenza tra la dichiarazione dell'autore e il contenuto effettivo.

Rispondi SOLO tramite la function call 'report_copyright', non aggiungere testo libero.
Sii prudente: se non hai elementi oggettivi, esito = "ok". Blocca solo con evidenza concreta.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // Auth: require a valid user JWT (validated against Supabase Auth)
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authErr } = await authClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as CheckPayload;
    if (!body?.declaration || !body?.content || !body?.title) {
      return new Response(JSON.stringify({ error: 'Payload incompleto' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Hard block: declaration internal consistency
    if (!body.declaration.rightsConfirmed) {
      return new Response(JSON.stringify({
        status: 'blocked',
        notes: 'Devi confermare di avere i diritti su tutti i contenuti pubblicati.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY mancante');

    const userMessage = [
      `Titolo: ${body.title}`,
      `Estratto: ${body.excerpt}`,
      `Dichiarazione autore:`,
      `- Origine immagini: ${body.declaration.imagesOrigin}`,
      `- Crediti dichiarati: ${body.declaration.imagesCredits || '(nessuno)'}`,
      `- Origine testo: ${body.declaration.textOrigin}`,
      `- Citazioni attribuite: ${body.declaration.quotesAttributed ? 'sì' : 'no'}`,
      `- Generato con AI: ${body.declaration.aiGenerated ? 'sì' : 'no'}`,
      ``,
      `Cover image URL: ${body.coverImageUrl || '(nessuna)'}`,
      ``,
      `--- CONTENUTO ARTICOLO (markdown) ---`,
      body.content.slice(0, 12000),
    ].join('\n');

    // Use multimodal if cover image present
    const userContent: unknown =
      body.coverImageUrl
        ? [
            { type: 'text', text: userMessage },
            { type: 'image_url', image_url: { url: body.coverImageUrl } },
          ]
        : userMessage;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'report_copyright',
            description: 'Esito della verifica copyright',
            parameters: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['ok', 'blocked'] },
                reasons: { type: 'array', items: { type: 'string' } },
                summary: { type: 'string' },
              },
              required: ['status', 'reasons', 'summary'],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: 'function', function: { name: 'report_copyright' } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: 'Troppe richieste, riprova tra poco.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: 'Crediti AI esauriti.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await aiRes.text();
      console.error('AI gateway error', aiRes.status, errText);
      return new Response(JSON.stringify({ error: 'Errore servizio di verifica' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await aiRes.json();
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : null;

    if (!args) {
      // Fallback: if AI didn't follow tool, treat as ok with note
      return new Response(JSON.stringify({
        status: 'ok',
        notes: 'Verifica AI non conclusiva, dichiarazione accettata.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const notes = [args.summary, ...(args.reasons ?? [])].filter(Boolean).join(' · ');
    return new Response(JSON.stringify({
      status: args.status === 'blocked' ? 'blocked' : 'ok',
      notes,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('copyright-check error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Errore interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
