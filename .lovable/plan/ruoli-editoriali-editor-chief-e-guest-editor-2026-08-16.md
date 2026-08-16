# Ruoli editoriali: editor chief e guest editor

Oggi chi cura l'Editoriale non ha un ruolo proprio: è solo un utente indicato come curatore su una singola annata (o come guest editor su uno Special Issue). Questo funziona per le candidature, ma non permette di riconoscere l'editor nell'interfaccia, di dargli poteri stabili né di distinguerlo da un coordinatore del collettivo.

Introduciamo due ruoli dedicati:

- **Editor chief** — cura l'annata dell'Editoriale: tema, deadline, copertina, candidature, apertura degli Special Issue.
- **Guest editor** — cura un singolo Special Issue: tema, deadline, copertina e candidature del proprio numero.

Entrambi ricevono automaticamente anche il ruolo **autore**, così possono firmare e proporre contenuti come qualsiasi altra firma. Nessuno dei due diventa coordinatore: il coordinatore resta una figura del collettivo (mappatura, inviti, redazione), l'editor è una figura editoriale a termine. Il coordinatore resta comunque un ruolo più importante dell'editor.

## Cosa può fare ciascun ruolo


| Azione                                                  | Admin | Editor chief     | Guest editor     | Coordinatore |
| ------------------------------------------------------- | ----- | ---------------- | ---------------- | ------------ |
| Nominare editor chief e guest editor                    | sì    | no               | no               | no           |
| Modificare tema/deadline/copertina della propria annata | sì    | sì               | no               | no           |
| Creare Special Issue e assegnarne il guest editor       | sì    | sì               | no               | no           |
| Modificare il proprio Special Issue                     | sì    | sì               | sì               | no           |
| Accettare/rifiutare candidature                         | sì    | annata + special | solo il proprio  | no           |
| Pubblicare/programmare gli articoli accettati           | sì    | annata + special | solo il proprio  | no           |
| Scrivere sul Bollettino                                 | sì    | sì (come autore) | sì (come autore) | sì           |


Le nomine restano **solo all'admin**, per correttezza. L'editor chief vede però l'elenco dei guest editor e degli Special Issue della propria annata in sola lettura, così ha il quadro completo dell'edizione.

## Effetti visibili sul sito

- Nella gestione utenti compaiono i due nuovi ruoli con etichette chiare ("Editor chief", "Guest editor"); assegnandoli, il ruolo autore viene aggiunto in automatico.
- Nell'area personale l'editor vede la propria dashboard di curatela con: dati dell'edizione modificabili, elenco candidature, e — per l'editor chief — creazione degli Special Issue.
- Nelle pagine pubbliche Editoriale/Special Issue l'attribuzione dell'editor resta come oggi (curatore dell'annata, guest editor del numero).

## Dettagli tecnici

1. **Enum ruoli**: aggiungere `editor_chief` e `guest_editor` a `app_role`. I ruoli restano solo in `user_roles` (mai su `profiles`).
2. **Funzioni helper**: mantenere `is_curator_of_edition` / `is_guest_editor_of_special_issue` come vincolo di appartenenza, e combinarle con `has_role` nelle policy, così il ruolo da solo non dà accesso alle edizioni di altri.
3. **RLS**:
  - `editorial_editions`: la UPDATE del curatore richiede anche `has_role(auth.uid(),'editor_chief')`; ampliare i campi modificabili a tema, deadline e copertina (già coperti dalla policy, ma verificarne la lettura in draft).
  - `editorial_special_issues`: INSERT/DELETE ad admin + editor chief dell'annata di riferimento; UPDATE ad admin, editor chief dell'annata e guest editor del numero.
  - `editorial_submissions`: SELECT/UPDATE per admin, editor chief dell'annata e guest editor del proprio special issue.
  - `blog_posts`: consentire a editor chief e guest editor l'INSERT/UPDATE (incluso `status` published/scheduled) sui post legati alla propria edizione/special issue, tramite `editorial_edition_id` / `special_issue_id`.
  - Confermare i `GRANT` esistenti; nessuna nuova tabella, quindi nessun nuovo grant richiesto.
4. **Frontend**:
  - `src/components/admin/UsersManagementPanel.tsx`: aggiungere i due ruoli all'elenco, con auto-aggiunta di `author` quando si attiva un ruolo editor.
  - `src/pages/AreaPersonale.tsx`: mostrare la tab di curatela anche a chi ha i nuovi ruoli, senza estendere i permessi da coordinatore (mappatura/inviti restano invariati).
  - `src/components/area/PanelEditorialeCuratela.tsx`: form di modifica edizione/special (tema, deadline, copertina), creazione Special Issue per l'editor chief, azione "pubblica/programma" sull'articolo derivato da una candidatura accettata.
  - `src/components/admin/EditorialEditionsPanel.tsx` e `SpecialIssuesPanel.tsx`: includere i nuovi ruoli nella lista di utenti selezionabili come curatori/guest.
  - `src/components/admin/SystemStatusPanel.tsx` e `src/lib/validation.ts`: etichette e enum aggiornati. Gli inviti restano su autore/coordinatore; i ruoli editor si assegnano dopo, dalla gestione utenti.
5. **Non toccato**: enum `member_type` dei profili, flusso inviti, permessi mappatura.