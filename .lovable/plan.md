# Magazine partecipativo: author, risposte, moderazione

## Obiettivo
- I membri delle realtà ottengono un account `author` e un'area personale dedicata al solo Magazine.
- Gli articoli `author` passano per una coda di moderazione prima di essere pubblicati.
- Sotto ogni articolo, un membro loggato può scrivere un articolo di **risposta** che resta linkato all'originale (sostituisce il vecchio formato Point/Counter Point).
- Il pubblico non loggato continua a vedere solo articoli pubblicati.

## 1. Database (un'unica migrazione)

**Enum ruoli**
- Aggiungo `'author'` a `app_role`.

**Tabella `blog_posts`**
- Aggiungo `status text not null default 'draft'` con valori validi `draft | pending | published`.
- Aggiungo `reply_to_id uuid references blog_posts(id) on delete set null`.
- Aggiungo `published_at timestamptz null` (separato da `created_at`).
- **Rimuovo** `is_point_counterpoint`, `stance`, `counterpart_id` (nessun PCP pubblicato).
- Aggiorno il trigger `validate_blog_pcp` rimuovendolo.
- Backfill: i 3 articoli esistenti vanno in `status='published'` con `published_at = created_at`.

**Tabella `profiles`**
- Aggiungo `reality_id uuid references realities(id) on delete set null` per legare l'autore alla sua realtà di provenienza (sola visualizzazione, nessun permesso sulla mappa).

**RLS aggiornate su `blog_posts`**
- SELECT pubblico: solo `status='published'`.
- SELECT autenticati: i propri post anche se `draft/pending`; admin e collaborator vedono tutto.
- INSERT autenticati: chiunque loggato; `author` può inserire SOLO con `status in ('draft','pending')`; admin/collaborator possono inserire direttamente `published`.
- UPDATE: l'autore può modificare i propri post solo se non ancora `published`; admin e collaborator possono modificare/pubblicare qualsiasi post.
- DELETE: autore i propri non pubblicati; admin/collaborator tutti.

**RLS `user_roles`**
- Aggiungo policy SELECT per admin (serve per la coda di moderazione e gestione utenti).

## 2. Frontend

**Nuova pagina `/area-personale`**
- Route protetta (qualsiasi utente loggato).
- Header: nome, avatar, badge ruolo, edit profilo (display_name, bio, avatar_url, social, website).
- Tab/sezione **"I miei articoli"**: lista dei propri post con stato (`draft`, `in moderazione`, `pubblicato`), pulsanti edit/elimina dove permesso.
- Pulsante **"Nuovo articolo"** → editor.
- Se ruolo è `collaborator` o `admin`, link aggiuntivo a `/admin`.
- Se ruolo è `admin` o `collaborator`, sezione **"Coda moderazione"** con post `status='pending'` di tutti, e azioni "Pubblica" / "Rimanda in bozza" / "Elimina".

**Editor articolo (`/area-personale/articolo/nuovo` e `/articolo/:id/modifica`)**
- Form con titolo, slug (auto), excerpt, cover image (URL per ora), categoria, contenuto (textarea markdown semplice come oggi).
- Validazione zod (titoli/excerpt con limiti lunghezza, slug unico).
- Bottoni: "Salva bozza" (`draft`) e "Invia per pubblicazione" (`pending` per author, `published` diretto per admin/collaborator).
- Se l'articolo è una risposta, mostra in alto un riquadro "Stai rispondendo a: [titolo originale]" (read-only).

**Pagina articolo (`/magazine/:slug`)**
- Sotto al contenuto: pulsante **"Scrivi una risposta"** visibile solo a utenti loggati → apre l'editor con `reply_to_id` precompilato.
- Sezione **"Risposte"** in fondo: lista dei post pubblicati con `reply_to_id` = id corrente, ordinati cronologicamente, con autore + data + excerpt + link.
- Se l'articolo corrente è una risposta, mostra in alto "↰ In risposta a: [titolo originale]".

**Pagina elenco Magazine (`/magazine`)**
- Mostra solo articoli `status='published'` (già di fatto, rinforzato da RLS).
- Rimuovo qualsiasi UI legata al PCP.

**Pannello admin (`/admin`)**
- Nel form invito aggiungo dropdown ruolo: `collaborator` | `author`.
- Se `author`, dropdown realtà di appartenenza (popolata da `realities`).
- L'edge function `invite-collaborator` viene rinominata logicamente: accetta `role` e `reality_id` opzionale, crea utente, assegna ruolo, e (per author) imposta `profiles.reality_id`.

## 3. File toccati

**Nuovi**
- `src/pages/AreaPersonale.tsx`
- `src/pages/ArticoloEditor.tsx`
- `src/components/magazine/RepliesSection.tsx`
- `src/components/magazine/ReplyButton.tsx`
- `src/components/admin/ModerationQueue.tsx`
- `src/lib/schemas/articleSchema.ts` (zod)

**Modificati**
- `src/App.tsx` (nuove route protette)
- `src/pages/MagazinePost.tsx` (riquadro "in risposta a", sezione risposte, pulsante rispondi)
- `src/pages/Blog.tsx` (rimozione UI PCP)
- `src/pages/Admin.tsx` (dropdown ruolo + realtà nell'invito, link a moderazione)
- `supabase/functions/invite-collaborator/index.ts` (parametri role + reality_id)
- `src/components/Navbar.tsx` (link "Area personale" se loggato)

**Eliminati**
- Riferimenti `is_point_counterpoint`, `stance`, `counterpart_id` ovunque.

## 4. Sicurezza
- RLS è la difesa primaria: un `author` non può mai pubblicare direttamente, anche bypassando il client.
- Validazione zod sia client che (implicita via RLS + check constraint) server.
- HIBP password check già attivabile, lo lascio così com'è (non lo tocco in questa migrazione).
- Nessun input HTML raw: il contenuto resta testo/markdown semplice come oggi.

## 5. Ordine di esecuzione
1. Migrazione DB (schema + RLS + backfill + drop trigger PCP).
2. Aggiornamento types Supabase (automatico).
3. Edge function `invite-collaborator` con nuovi parametri.
4. Pagine area personale + editor.
5. Risposte e moderazione su MagazinePost + Admin.
6. Pulizia UI PCP da Blog e i18n.

## Note
- Email transazionali per invito e per "il tuo articolo è stato pubblicato/rifiutato": le **rimando** a un'iterazione successiva (richiedono Resend e dominio email configurato).
- Niente notifiche in-app per ora: l'autore vede lo stato nei "I miei articoli".
