# Editoriale curato annualmente

Aggiungiamo un livello editoriale sopra alla categoria "Editoriali" già esistente: ogni anno un'**edizione** con un **curatore in carica** (admin/coordinatore promosso ad hoc), che riceve **pitch dai membri registrati** e decide cosa pubblicare. La pagina `/editoriale` diventa vetrina dell'edizione corrente, con archivio delle passate.

## 1. Modello dati (nuove tabelle)

`**editorial_editions**`

- `year` (unique), `title` (es. "Edizione 2026 — Geografie minori"), `theme_description`, `curator_user_id` → profiles, `status` (`draft` / `open_submissions` / `closed_submissions` / `published` / `archived`), `submissions_open_at`, `submissions_close_at`, `cover_image_url`

`**editorial_submissions**` (pitch dei membri)

- `edition_id`, `author_user_id`, `title`, `abstract`, `outline` (opzionale), `references` (opzionale), `status` (`pending` / `accepted` / `rejected` / `withdrawn` / `converted`), `curator_notes`, `converted_post_id` → blog_posts

`**blog_posts**`: aggiungere `editorial_edition_id` (nullable). Un articolo appartiene a un'edizione solo se effettivamente pubblicato nell'Editoriale.

## 2. Permessi (senza nuovo ruolo)

Il **curatore è un  coordinatore** con `curator_user_id` sull'edizione attiva. Le RLS controllano quel campo, non un ruolo aggiuntivo.

- Admin: vede tutto.
- Coordinatore-curatore (dell'edizione in `open_submissions`/`closed_submissions`): vede tutte le submission dell'edizione, cambia status, promuove una submission a bozza articolo (categoria "Editoriali", `editorial_edition_id` popolato), può programmare/pubblicare quegli articoli.
- Membri (autori/coordinatori): vedono e gestiscono **solo le proprie** submission.
- Pubblico: legge solo articoli già `published` con `editorial_edition_id`.

## 3. Flussi utente

**Membro (Area Personale → nuova tab "Editoriale")**

- Se c'è un'edizione in `open_submissions`: form di candidatura (titolo, abstract 800 char, outline opzionale, bio-editoriale opzionale che pre-compila da `author_bio`).
- Lista dei propri pitch con stato e note del curatore. Può ritirare finché è `pending`.
- Se il pitch è `accepted`: bottone "Sviluppa articolo" → crea bozza in `blog_posts` collegata all'edizione, apre l'editor esistente.

**Curatore (Area Personale → tab "Editoriale — curatela", visibile solo se `curator_user_id = me`)**

- Dashboard edizione: candidature per stato (pending / accepted / rejected), filtri, note interne.
- Azioni: accetta / rifiuta / rimetti in pending / promuovi a bozza articolo.
- Programmazione pubblicazioni dell'edizione (riusa `scheduled_for` esistente).
- Impostazioni edizione: tema, date submission, cover.

**Admin (pannello Admin → "Edizioni editoriali")**

- Crea edizione, assegna curatore, apre/chiude submission, archivia.
- Storico curatori.

## 4. Pagine pubbliche

- `**/editoriale**` (rifatta): hero con "Curato da [Curatore], Edizione [Anno]", tema, cover, link a pagina bio del curatore. Sotto: articoli dell'edizione corrente (lead + griglia, come già impostato). CTA "Candida un pitch" se `open_submissions` e utente loggato (o login prompt).
- `**/editoriale/:year**`: pagina di ogni edizione passata (stesso layout, archiviata).
- `**/editoriale/archivio**`: elenco cronologico edizioni.
- `**/editoriale/curatore/:userId**`: bio estesa del curatore in carica (riusa profile + `author_bio`, sezione "Edizioni curate").

## 5. Modifiche a pagine esistenti

- `/magazine` continua a escludere gli articoli con categoria "Editoriali" (già fatto).
- `MagazinePost.tsx`: se l'articolo ha `editorial_edition_id`, mostrare badge "Edizione [Anno] — a cura di [Curatore]" con link.
- Navbar dropdown "Racconti": nessuna modifica strutturale (Editoriale già presente).

## 6. Notifiche

Riuso della tabella `notifications`:

- Submission ricevuta → notifica curatore.
- Submission accettata/rifiutata → notifica autore.
- Apertura call annuale → notifica broadcast a tutti i membri.

## 7. Dettagli tecnici

- Nuova enum `editorial_edition_status` e `editorial_submission_status`.
- Trigger `updated_at` sulle due nuove tabelle.
- Funzione security-definer `is_curator_of_edition(_edition_id uuid)` per RLS pulite (evita ricorsione tra `blog_posts` ↔ `editorial_editions`).
- GRANT `SELECT` a `anon` su `editorial_editions` (per la pagina pubblica) e su `blog_posts` già esistente; tutto il resto solo `authenticated`.
- Vincolo: massimo un'edizione con `status` diverso da `archived` per anno.
- Un articolo può appartenere a una sola edizione (`editorial_edition_id` scalar, non array).

## 8. Fuori scope (per ora)

- Peer review pubblica delle candidature.
- Compensi/contratti autori.
- Versioning delle bozze durante la revisione (si usa l'editor esistente).

## Ordine di implementazione

1. Migrazione DB (tabelle, enum, RLS, funzione helper, GRANT).
2. Admin: pannello edizioni + assegnazione curatore.
3. Membro: form pitch + lista candidature in Area Personale.
4. Curatore: dashboard curatela.
5. Promozione submission → `blog_posts` (riuso editor esistente).
6. Pagine pubbliche `/editoriale` e archivio.
7. Notifiche + badge sui post.

Ti va di procedere così, o vuoi che qualche passaggio salti/cambi ordine prima di partire?