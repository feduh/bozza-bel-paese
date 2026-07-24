# Editor dedicato per i podcast

Attualmente il pulsante "Nuovo podcast" nel tab Podcast dell'area personale apre lo stesso editor degli articoli (`/area-personale/articolo/nuovo?category=Podcast`), con tutti i campi copyright obbligatori. Serve un editor più snello, riservato a coordinatori/admin, che permetta di collegare un episodio ospitato da un partner (Spotify, YouTube, Spreaker, ecc.) ed estrarre automaticamente la copertina dall'URL.

## Cosa costruire

### 1. Nuova pagina `/area-personale/podcast/nuovo` e `/area-personale/podcast/:id/modifica`
Componente `src/pages/PodcastEditor.tsx`, ispirato ad `ArticoloEditor` ma ridotto ai campi utili:

- **Titolo** (obbligatorio)
- **Estratto / descrizione breve** (obbligatorio, max ~300 caratteri)
- **URL dell'episodio host** (obbligatorio) — Spotify, YouTube, Spreaker, Apple Podcasts, SoundCloud…
- **Tipo** (podcast audio / video) — dedotto dall'URL, override manuale
- **Copertina** — pulsante "Estrai da URL" che chiama l'edge function (vedi §3) + fallback upload manuale con `CoverImageUpload`
- **Ospite / autore mostrato** (testo libero, default = display name del coordinatore)
- **Durata** opzionale (es. `34'12"`)
- **Contenuto lungo** opzionale in Markdown (note episodio / trascrizione) — `MarkdownEditor` senza obbligo
- **Programmazione** identica all'editor articoli: pulsante "Programma" con date+time picker su slot da 30 minuti, integrata nel calendario di `PanelCalendario`
- **Pulsanti**: Salva bozza · Pubblica ora · Programma · Anteprima

Niente sezione copyright, niente flusso "invia a revisione": i coordinatori pubblicano direttamente (o programmano). Autorizzazione: pagina accessibile solo a `admin` / `coordinatore`, altrimenti redirect.

### 2. Storage: continuiamo su `blog_posts`
Riusiamo la tabella `blog_posts` con `category = "Podcast"` per non spezzare il calendario, i feed e il conteggio esistente. Aggiungiamo tre colonne opzionali (migrazione):

- `podcast_url text` — URL host
- `podcast_kind text` — `"audio" | "video"`
- `podcast_duration text`

Il trigger `validate_blog_post_copyright` va aggiornato per **saltare la verifica quando `category` contiene `Podcast`** (già scritto in italiano nella funzione), così un podcast può essere `published`/`scheduled` senza `copyright_declaration`. Il trigger `validate_blog_post_schedule` resta invariato (stesso flusso di slot da 30 min).

### 3. Edge function `extract-podcast-cover`
Nuova edge function che riceve `{ url }` e restituisce `{ cover_url, kind, title?, duration? }`:

- YouTube → `https://i.ytimg.com/vi/{id}/maxresdefault.jpg`, `kind = "video"` (id estratto da watch/shorts/youtu.be)
- Spotify → oEmbed `https://open.spotify.com/oembed?url=…` → `thumbnail_url`
- Spreaker → oEmbed `https://api.spreaker.com/oembed?url=…`
- SoundCloud → oEmbed `https://soundcloud.com/oembed?format=json&url=…`
- Apple Podcasts → HTML scrape del meta `og:image`
- Fallback generico: fetch della pagina e lettura di `og:image` / `twitter:image`

Nessuna dipendenza esterna, solo `fetch`. Errori restituiscono `{ error }` e il form ripiega sull'upload manuale.

### 4. Aggancio nel pannello
`PanelArticoli` con `presetCategory="Podcast"` passa `newHref="/area-personale/podcast/nuovo"` e il link "Modifica" delle card podcast punta a `/area-personale/podcast/:id/modifica` (aggiungo una prop `editHrefBuilder`). La lista, i badge di stato e i filtri restano identici.

### 5. Rendering pubblico
`PodcastEpisodio.tsx` (attualmente placeholder statico) viene collegato al DB: cerca in `blog_posts` per slug con `category ILIKE '%Podcast%'` e mostra copertina, embed dell'host quando riconosciuto (iframe YouTube/Spotify/Spreaker) e le note in Markdown. Questa parte è opzionale ma la includo per chiudere il flusso.

## Dettagli tecnici

- **Route**: aggiunte in `src/App.tsx` accanto a quelle di `ArticoloEditor`.
- **Guardia ruoli**: check client-side `has_role admin || coordinatore`; la sicurezza reale resta sulle policy `blog_posts` esistenti.
- **Migrazione SQL** (structure only):

```text
ALTER TABLE public.blog_posts
  ADD COLUMN podcast_url text,
  ADD COLUMN podcast_kind text,
  ADD COLUMN podcast_duration text;

-- update validate_blog_post_copyright: bypass quando category contiene 'Podcast'
```

- **Edge function**: `supabase/functions/extract-podcast-cover/index.ts` con CORS e `Deno.env` per un eventuale `LOVABLE_API_KEY` (non richiesto qui).
- **Calendario**: `PanelCalendario` legge già tutti i post `scheduled` dell'utente, quindi i podcast programmati compaiono automaticamente. Aggiungo un badge "Podcast" quando la categoria coincide.
- **Anteprima**: dialog analogo a quello dell'ArticoloEditor, con player embed se URL riconosciuto.

## File toccati / creati

- `src/pages/PodcastEditor.tsx` (nuovo)
- `src/App.tsx` (rotte)
- `src/components/area/PanelArticoli.tsx` (prop opzionale per editHref/newHref custom)
- `src/pages/AreaPersonale.tsx` (passa le nuove props per il tab Podcast)
- `src/pages/PodcastEpisodio.tsx` (lettura reale da DB)
- `src/components/ScheduledTimeline.tsx` / `PanelCalendario.tsx` (badge tipo)
- `supabase/functions/extract-podcast-cover/index.ts` (nuova)
- Migrazione SQL per le 3 colonne + aggiornamento trigger copyright
