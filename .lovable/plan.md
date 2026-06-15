## Obiettivi

1. **Login → area personale** (già fatto in questa risposta).
2. **Newsletter** estendibile (articoli, realtà, podcast futuri), a costo zero per 500-1000 iscritti.

## Provider scelto: Brevo (free)

- 0 €/mese, contatti illimitati, **300 email/giorno** sul piano gratuito.
- Per liste >300 destinatari, l'invio viene **spezzato automaticamente in batch giornalieri** da una cron Supabase.
- Connettore Brevo già supportato da Lovable → niente API key da gestire a mano una volta connesso.
- Alternativa futura: passare a Brevo Lite (~7 €/mese, 20k email/mese) cambiando solo un parametro.

## Modello dati (nuove tabelle)

- `newsletter_subscribers`: `email`, `user_id` (nullable, FK profiles), `status` (`pending|confirmed|unsubscribed|bounced`), `confirmation_token`, `unsubscribe_token`, `confirmed_at`, `source` (`public_form|member_auto`), `locale`.
- `newsletter_issues`: `title`, `subject`, `preheader`, `content_blocks` (jsonb — array di blocchi tipizzati: `editorial`, `articles_auto`, `realities_auto`, `podcast`, `custom_html`, ecc.), `status` (`draft|scheduled|sending|sent|failed`), `scheduled_for`, `sent_at`, `created_by`, `sent_count`, `failed_count`.
- `newsletter_deliveries`: `issue_id`, `subscriber_id`, `status` (`queued|sent|failed|bounced`), `sent_at`, `error`. Tabella di tracking + supporto batch giornalieri.

Il formato `content_blocks` (jsonb tipizzato) è la chiave della scalabilità: aggiungere podcast in futuro = aggiungere un nuovo tipo di blocco, niente migrazione.

RLS: subscribers solo admin/coordinatori in lettura; insert pubblico consentito al form; issues e deliveries solo admin/coordinatori.

## Iscrizione

- **Form pubblico** nel Footer + sezione homepage: email → riga `pending` + email di conferma con link doppio opt-in.
- **Membri registrati**: auto-iscritti come `confirmed` alla creazione del profilo (trigger DB). Toggle "ricevi newsletter" nell'area personale per disiscriversi.
- Endpoint pubblico `unsubscribe` con token univoco (link in fondo a ogni email).

## Composizione & invio (area personale, solo admin/coordinatori)

Nuova sezione `Newsletter` nell'area personale, stesso pattern degli articoli:

- Lista bozze/programmate/inviate.
- Editor a blocchi: editoriale (markdown), selettore articoli del magazine, selettore realtà recenti, blocco podcast (placeholder per il futuro), HTML libero.
- Anteprima desktop/mobile.
- "Salva bozza" / "Programma" (slot 30 min come gli articoli) / "Invia ora".
- Stato live durante l'invio (sent/failed counter).

## Pipeline di invio

1. Edge function `newsletter-render` → genera HTML finale dai `content_blocks`.
2. Edge function `newsletter-dispatch` (cron ogni 5 min): pesca issue `scheduled` con `scheduled_for <= now()`, crea righe `newsletter_deliveries` per ogni subscriber `confirmed`, marca issue `sending`.
3. Edge function `newsletter-send-batch` (cron ogni 5 min): legge fino a N (default 250, sotto il limite Brevo) deliveries `queued`, invia via gateway Brevo (`POST /smtp/email`), aggiorna stato. Quando le `queued` finiscono → issue `sent`.
4. Throttling automatico se Brevo restituisce 429.

## Edge functions da creare

- `newsletter-subscribe` (pubblico): valida email + zod, crea pending, invia mail di conferma.
- `newsletter-confirm` (pubblico): valida token, marca `confirmed`.
- `newsletter-unsubscribe` (pubblico): valida token, marca `unsubscribed`.
- `newsletter-render`: ritorna HTML preview per editor.
- `newsletter-dispatch` + `newsletter-send-batch`: cron.

## UI da creare/modificare

- `src/components/NewsletterSignup.tsx` (form footer + homepage).
- `src/pages/NewsletterConfirm.tsx` (`/newsletter/conferma?token=…`).
- `src/pages/NewsletterUnsubscribe.tsx` (`/newsletter/disiscriviti?token=…`).
- `src/pages/area-personale/Newsletter.tsx` (lista issue).
- `src/pages/area-personale/NewsletterEditor.tsx` (composizione blocchi).
- Toggle "ricevi newsletter" nel profilo membro.

## Costi totali stimati

- Brevo free: **0 €/mese** fino a 300 invii/giorno.
- Connettore Brevo: gratuito.
- Tutto il resto (DB, edge functions, cron): incluso in Lovable Cloud.

## Setup richiesto

Prima di scrivere codice ti chiederò di:
1. Connettere il connettore Brevo (1 click).
2. Verificare un dominio mittente su Brevo (DNS, ~5 min) — necessario per non finire in spam.

## Step di implementazione

1. Migration: tabelle + RLS + trigger auto-subscribe membri.
2. Edge functions subscribe/confirm/unsubscribe + pagine pubbliche + form footer.
3. Editor newsletter nell'area personale + render preview.
4. Cron dispatch + send-batch via Brevo.
5. Toggle preferenza nel profilo + sezione admin "iscritti".
