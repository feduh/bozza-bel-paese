# Nuova architettura editoriale: Editoriale + Special Issue + Bollettino

## Obiettivo

Tradurre le decisioni della call in struttura reale del sito:

1. **Editoriale** annuale curato dall'*editor chief*, con la sua open call.
2. **Special Issue** curato da un *guest editor* scelto dal chief, con open call e deadline proprie, inserito liberamente dentro l'annata.
3. **Bollettino** (ex "Magazine libero"): sezione permanente, revisionata, forma libera.
4. **Linee guida** delle due sezioni sempre accessibili.
5. **Point Counter Point** rimosso (interfaccia + dati).

## Le mie proposte sui due punti aperti

### Special Issue — numero interno all'annata (raccomandato)

Ogni edizione annuale contiene una sequenza di numeri; lo Special Issue è uno di questi numeri, in qualsiasi posizione (primo, ultimo, in mezzo). Vantaggi: resta dentro il racconto dell'annata, eredita l'archivio per anno già esistente, e ha comunque tema, guest editor e call autonomi. Una sezione parallela avrebbe frammentato la navigazione e duplicato l'archivio.

Su `/editoriale` l'annata selezionata mostrerà:

```text
EDIZIONE 2026
[ Tema dell'anno ]              [ Editor chief ]
──────────────────────────────────────────────
Indice dell'annata
01  Contributo ...
02  SPECIAL ISSUE — "Titolo"  ← blocco evidenziato, guest editor + tema proprio
03  Contributo ...
```

Lo Special Issue ha anche una pagina propria (`/editoriale/special/:slug`) con il suo tema, il guest editor e i suoi contributi.

### Linee guida — pagina dedicata + richiamo contestuale (raccomandato)

Strategia UX: le linee guida servono in due momenti diversi, quindi vivono in due forme.

- **Pagina `/linee-guida`** — riferimento completo, con ancore `#editoriale`, `#special-issue`, `#bollettino`. Linkata dal dropdown "Racconti" e dal footer.
- **Richiamo breve nel contesto** — su `/editoriale` e `/bollettino` un blocco compatto con le 3-4 regole chiave e link "Leggi le linee guida complete".
- **Nell'atto di scrivere** — link alle linee guida della sezione dentro l'editor e dentro il form di candidatura in Area Personale, dove la domanda nasce davvero.

Le call aperte mostrano sempre deadline visibile e stato (aperta / in revisione / pubblicazione in corso).

## Cosa cambia, in pratica

**Pagine pubbliche**
- `/bollettino` sostituisce `/magazine` (il vecchio indirizzo reindirizza, così i link esistenti continuano a funzionare). Titoli, dropdown navbar, footer e homepage aggiornati a "Bollettino".
- `/editoriale`: selettore annata già presente, più indice dell'annata con lo Special Issue evidenziato al suo posto e stato delle due call con relative deadline.
- `/editoriale/special/:slug`: pagina dello Special Issue (tema, guest editor, contributi).
- `/linee-guida`: nuova pagina.

**Area Personale**
- Candidature: scelta fra call "Editoriale" e call "Special Issue", visibili solo se aperte, con deadline in evidenza.
- Curatela: l'editor chief gestisce l'annata, crea gli Special Issue e nomina i guest editor; il guest editor vede e valuta solo le candidature del proprio Special Issue.
- Admin: gestione edizioni estesa con gli Special Issue (titolo, tema, guest editor, periodo call, posizione nell'annata).
- Rimossi selettore "risposta a" e badge Point Counter Point dagli editor e dai pannelli.

**Ciclo della call**
Stati espliciti per ogni call: bozza → candidature aperte → in revisione → pubblicazione → archiviata. Le date di apertura/chiusura guidano cosa è visibile al pubblico.

## Dettagli tecnici

- Migrazione: nuova tabella `editorial_special_issues` (`edition_id`, `guest_editor_user_id`, `slug`, `title`, `theme_description`, `submissions_open_at`, `submissions_close_at`, `status`, `position`, `cover_image_url`) con GRANT, RLS (lettura pubblica solo se pubblicata; scrittura ad admin/editor chief dell'annata) e trigger `updated_at`.
- `blog_posts.special_issue_id` e `editorial_submissions.special_issue_id` (nullable) per distinguere contributi/candidature dell'Editoriale da quelli dello Special Issue.
- Funzione security definer `is_guest_editor_of_special_issue(_id uuid)` sul modello di `is_curator_of_edition`, usata nelle policy delle candidature.
- Rimozione Point Counter Point: `DROP COLUMN blog_posts.reply_to_id` (con la sua FK) e pulizia in `Blog.tsx`, `MagazinePost.tsx`, `ArticoloEditor.tsx`, `AreaPersonale.tsx`, `PanelArticoli.tsx`, `PanelModerazione.tsx`, `FeaturedSection.tsx`, `area/types.ts`.
- Rename Bollettino: rotte `/bollettino` e `/bollettino/:slug` con redirect da `/magazine*`; aggiornati `Navbar.tsx`, `Footer.tsx`, `Racconti.tsx`, `Index.tsx`, SEO e `sitemap`. Categoria "Editoriali" resta per i contenuti d'annata.
- `/linee-guida`: pagina statica in codice (contenuto in un modulo dedicato, facile da modificare), con SEO e ancore per sezione; se in futuro serve, si sposta in database.
- Palette e tipografia invariate: verde acqua per Editoriale, viola per Bollettino, Special Issue distinto dal terzo accento (oro) per leggersi come numero speciale dentro l'annata.

## Ordine di lavoro

1. Migrazione database (special issues, collegamenti, rimozione point counter point).
2. Rename Bollettino con redirect.
3. Pagina Linee guida + richiami contestuali.
4. Special Issue: pagine pubbliche, pannelli curatela/admin, candidature con doppia call.
5. Pulizia Point Counter Point nell'interfaccia.
