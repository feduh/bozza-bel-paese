# Riorganizzazione Area Personale

Obiettivo: rendere l'area personale ampia come il resto del sito, ordinare le tante voci in gruppi logici (non un'unica fila di 12+ tab) e dare a ciascun ruolo un punto di ingresso chiaro con qualche funzione mirata in più.

## Problemi attuali (confermati leggendo `src/pages/AreaPersonale.tsx` e `src/index.css`)

- Il contenitore forza `max-w-5xl`, mentre `.editorial-container` di default è `max-w-7xl` come il resto del sito: la pagina appare stretta.
- Fino a 12 tab in fila orizzontale scorrevole, tutti allo stesso livello: profilo, calendario, articoli, preferiti, editoriale, curatela, podcast, realtà, membri, moderazione, admin. Difficile orientarsi, soprattutto per admin.
- Il tab "Admin" è un unico contenitore con 6 pannelli impilati (system status, analytics, utenti, edizioni editoriali, messaggi, segnalazioni, audit log) — scroll infinito.
- Nessun colpo d'occhio iniziale: si atterra su "Profilo" invece che su una panoramica con lo stato delle cose che riguardano l'utente (bozze, programmati, pitch, coda moderazione, realtà in attesa).

## Nuova struttura

### Layout

- Rimuovere `max-w-5xl`, tornare al `.editorial-container` standard (`max-w-7xl`) come le altre pagine.
- Da `md` in su: **sidebar a sinistra** (larghezza fissa ~240px, sticky) con la navigazione raggruppata; contenuto a destra a piena larghezza.
- Su mobile: la sidebar diventa un `Sheet`/drawer richiamabile da un pulsante in alto; in aggiunta resta una barra tab compatta con solo i gruppi principali.
- Usiamo il pattern shadcn `Sidebar` già presente nel design system, con `collapsible="icon"` per il mini-collapse su desktop.

### Raggruppamento voci (coerente per tutti i ruoli, le voci compaiono solo se rilevanti)

- **Panoramica** (nuovo) — dashboard di atterraggio.
- **Il mio lavoro**
  - Profilo
  - Calendario
  - Articoli
  - Podcast *(staff)*
  - Preferiti
- **Editoriale**
  - Le mie candidature (attuale "Editoriale")
  - Curatela *(solo se curatore dell'edizione attiva)*
- **Community** *(coordinatore/admin)*
  - Realtà (proposta + pendenti)
  - Membri (invito + affiliazioni)
  - Moderazione
- **Amministrazione** *(admin)*, come sotto-sezioni separate invece di un unico scroll:
  - Stato & Analytics
  - Utenti & Ruoli
  - Edizioni editoriali
  - Messaggi di contatto
  - Segnalazioni realtà
  - Audit log

Ogni sotto-sezione admin diventa la sua "pagina" interna (una alla volta, non tutte impilate).

### Nuova "Panoramica" (per tutti)

Card compatte, contenuto filtrato per ruolo. Nessuna nuova query pesante: riusa i dati già caricati in `loadAll`.

- Saluto + link rapido a "Modifica profilo" e "Nuovo articolo".
- **Le tue bozze / programmati**: conteggio + lista corta con link a Articoli/Calendario.
- **Le tue candidature editoriali**: N pending / accepted / rejected, link.
- **Curatore** *(se curatore)*: N pitch pending sull'edizione, CTA "Vai alla curatela".
- **Realtà in attesa** *(coordinatore/admin)*: N in `pendente` create da te, tempo residuo prima dell'auto-conferma.
- **Da moderare** *(staff)*: N articoli `pending`, link diretto.
- **Sistema** *(admin)*: N messaggi non letti + N segnalazioni nuove.

### Funzioni aggiuntive per ruolo (piccole, coerenti con l'esistente)

- **Autore**
  - Nella panoramica: "Continua l'ultima bozza" (link diretto all'editor dell'ultimo `draft`).
  - Filtro rapido su "Articoli" per stato (draft / pending / scheduled / published), oggi assente.
- **Coordinatore**
  - Widget "Realtà create da me" con stato di auto-conferma già presente, promosso in panoramica.
  - Scorciatoia per aprire l'editor podcast direttamente dalla panoramica.
- **Admin**
  - Panoramica con conteggi live di messaggi/segnalazioni non lavorati come badge.
  - Sotto-sezione Amministrazione con menu laterale interno, invece dello scroll unico attuale.
  - "Attività recenti" (ultimi 5 record da `admin_audit_log`) come mini-widget nella panoramica.

## Cosa NON cambia

- Nessuna modifica ai singoli pannelli (`PanelProfilo`, `PanelArticoli`, `PanelCalendario`, `PanelModerazione`, `PanelRealta`, `PanelPreferiti`, `PanelEditoriale`, `PanelEditorialeCuratela`, `AuthorsAffiliationPanel`, `InviteMemberForm`, e i pannelli admin): li richiamiamo come sono dalle nuove sezioni.
- Nessuna modifica DB / RLS / edge functions.
- URL `/area-personale?tab=...` resta valido: manteniamo gli stessi valori di `tab` (`profilo`, `articoli`, `calendario`, `preferiti`, `editoriale`, `editoriale-curatela`, `podcast`, `realta`, `membri`, `moderazione`, `admin`) più il nuovo default `panoramica`, così i link esistenti nelle notifiche continuano a funzionare. Per le sotto-sezioni admin useremo un secondo parametro (es. `?tab=admin&section=utenti`).

## Dettagli tecnici

- File nuovi:
  - `src/components/area/AreaSidebar.tsx` — sidebar shadcn con gruppi condizionati dai ruoli, `NavLink` che aggiornano il query param `tab`.
  - `src/components/area/PanelPanoramica.tsx` — dashboard di atterraggio, riceve tutti i dati già in stato dal parent.
  - `src/components/area/PanelAdmin.tsx` — wrapper che gestisce il sotto-menu (`section=`) e rende un solo pannello admin alla volta.
- File modificati:
  - `src/pages/AreaPersonale.tsx` — sostituisce `Tabs` con `SidebarProvider` + routing interno via query param; rimuove `max-w-5xl`; aggiunge query mini-conteggi (`admin_audit_log`, contact_messages/reality_reports non letti) solo per admin, in parallelo agli altri fetch di `loadAll`.
  - `src/i18n/locales/it.json` — nuove label ("Panoramica", intestazioni gruppi sidebar, sotto-sezioni admin).
- Nessuna nuova dipendenza (shadcn `Sidebar` e `Sheet` già presenti).

## Ordine di implementazione

1. Sidebar + layout a due colonne, container full-width, mapping dei tab attuali senza cambi funzionali.
2. `PanelPanoramica` con widget condizionati per ruolo.
3. `PanelAdmin` con sotto-menu interno.
4. Piccole aggiunte per ruolo (filtro stato in Articoli, "Continua bozza", conteggi admin).
5. Verifica su desktop e mobile (drawer sidebar, sticky header, deep link `?tab=...&section=...`).

Va bene procedere così, o vuoi cambiare qualcosa nel raggruppamento (es. tenere Editoriale dentro "Il mio lavoro", o unire Community con Amministrazione)?