# Piano di miglioramenti — Il Bel Paese

## Stato di partenza verificato
Dall'ultima serie di modifiche il sito ha: hero con razzo autoplay su mobile, mappa con filtri multi-selezione, area personale con tab podcast/affiliazioni, editor podcast dedicato, scroll-to-top fluido, pannello admin responsive e SEO dinamico via componente `SEO.tsx`. Sono però emersi alcuni margini di ottimizzazione in UX, performance, accessibilità, robustezza e SEO che possiamo affrontare in blocchi indipendenti.

## Proposte di miglioramento, raggruppate per area

### 1. Performance e caricamento
- **Lazy-load delle realtà nella mappa**: oggi `Mappatura.tsx` scarica `select("*")` e poi filtra client-side. Con la crescita del database conviene passare a una query Supabase più snella (solo colonne necessarie) e, se necessario, a paginazione server-side + infinite scroll nella lista.
- **Posticipare il fetch del DroneHero**: la query delle realtà per il razzo parte subito, anche se l'utente ha `prefers-reduced-motion` o l'hero è fuori viewport. Si può attivare solo quando l'hero è in vista (`IntersectionObserver`) e skippare del tutto per chi preferisce meno movimento.
- **Ottimizzare asset immagini**: verificare che `SmartImage` applichi lazy loading nativo, blur-up placeholder e dimensioni responsive; estenderlo a tutte le immagini utente (avatar, copertine, gallerie).
- **Code-splitting più fine**: alcune pagine admin (analytics, audit log, gestione utenti) possono essere isolate in chunk separati invece di essere tutte dentro `AreaPersonale.tsx`.

### 2. Accessibilità (a11y)
- **Hero ridotto**: per `prefers-reduced-motion: reduce` nascondere il razzo in movimento e mostrare una mappa statica con un marker sulle realtà (già c'è un controllo, ma si può rendere esplicito a livello visivo).
- **Focus e touch target**: verificare che tutti i chip filtro, icone e pulsanti mobile abbiano almeno 44×44 CSS px e focus visibile.
- **Menu mobile**: aggiungere `aria-current` e label esplicito al sotto-menu "Racconti".
- **Conforme colori**: verificare il contrasto del testo viola (`--primary`) su sfondo avorio e del testo acqua su sfondo scuro.
- **SkipLink**: assicurarsi che il target `#main-content` esista in ogni pagina.

### 3. SEO e condivisione social
- **Lang HTML**: `index.html` ha `lang="en"`; il sito è in italiano, quindi impostare `lang="it"`.
- **Meta dinamici lato server**: il componente `SEO.tsx` aggiorna i meta in SPA, ma i crawler sociali (Facebook, LinkedIn, WhatsApp) non eseguono JavaScript. Per articoli, profili autore e schede realtà conviene generare pagine prerenderizzate o usare un edge function che restituisca i meta corretti per i bot.
- **Sitemap dinamica**: `scripts/generate-sitemap.ts` esiste, ma verificare che includa le pagine dinamiche (`/realta/:id`, `/magazine/:slug`, `/autori/:userId`).
- **URL canonici**: aggiungere canonical self-referencing anche su pagine con parametri query (filtri mappa, tab area personale) per evitare indicizzazione duplicata.

### 4. Robustezze e gestione errori
- **Mappatura**: se il fetch di `realities` fallisce, la pagina resta in loading oppure mostra una lista vuota senza messaggio. Aggiungere stato `error` con retry.
- **Area personale**: se il profilo non esiste (`loading || !profile`) l'utente vede solo "Caricamento…" all'infinito. Aggiungere un messaggio di errore o un wizard per creare il profilo mancante.
- **Moderazione**: `PanelModerazione.tsx` non mostra feedback se l'update/delete fallisce (RLS o errore rete). Aggiungere toast/errore e rollback ottimistico.
- **Inviti e gestione utenti**: `InviteMemberForm` e `UsersManagementPanel` mostrano feedback, ma alcune azioni non gestiscono stati paralleli (doppio click). Aggiungere `disabled` durante le chiamate.

### 5. UX mobile e interfaccia
- **Tab area personale**: su schermi stretti i tab vanno a capo e occupano molto spazio verticale. Proporrei una lista a scroll orizzontale con frecce di navigazione.
- **Filtri mappa**: dopo la recente riorganizzazione in 3 righe, su mobile occupano metà schermo. Aggiungere un pannello collassabile "Filtri" con contatore dei filtri attivi.
- **Condividi vista mappa**: aggiungere pulsante "Copia link" che genera una URL con i filtri attivi, per facilitare la condivisione.
- **Back-to-top flottante**: utile dopo scroll lunghi in lista realtà / magazine.
- **Tema scuro**: il design system lo supporta, ma non c'è un toggle visibile. Valutare se inserirlo in navbar o footer.

### 6. Funzionalità editoriali e social
- **Sezione "In evidenza" in homepage**: mostrare 3 ultimi articoli del magazine + 1 podcast, per dare più respiro editoriale alla landing.
- **Box autore negli articoli**: già implementato con `author_bio`; si può migliorare aggiungendo un link "Tutti gli articoli di questo autore" e un'immagine di copertina più grande.
- **Notifiche**: c'è `NotificationsBell`, ma manca un pannello notifiche con storico e mark-as-read.
- **Commenti / repliche**: il magazine supporta `reply_to_id`, ma non c'è un'indicazione visiva chiara del thread tra articolo e risposta.

### 7. Manutenibilità e qualità codice
- **Ridurre `as any` e `eslint-disable`**: in `Mappatura.tsx` e `DroneHero.tsx` ci sono diversi cast e disable hooks; passare a tipi strutturati e a funzioni helper fuori dal componente.
- **Centralizzare permessi**: la logica "is admin / coordinatore / author" è duplicata in più componenti. Creare un hook `usePermissions()` che restituisca ruoli e capability (es. `canModerate`, `canInvite`).
- **Test**: esiste `vitest` con poche pagine di test. Aggiungere test sui filtri mappa, sui permessi e sul parsing della rotta DroneHero.
- **Cookie banner**: il sito usa Supabase (cookie di autenticazione) e potrebbe usare analytics. Valutare un banner informativo minimale per la cookie policy.

### 8. Esperienza mappa
- **Clustering marker**: con molte realtà in città vicine (es. Milano, Roma) i marker si sovrappongono. Aggiungere `leaflet.markercluster` con colori per categoria.
- **Popup accessibili**: i popup Leaflet sono HTML injection; renderli chiudibili con tastiera e con un'icona chiara su touch.
- **Ricerca con geocoding**: permettere di cercare "Milano" o "Torino" e centrare la mappa sulla città, non solo filtrare per nome realtà.

## Priorità suggerita
- **Alta**: SEO lang, errori mappa, profilo mancante area personale, feedback moderazione, lazy DroneHero.
- **Media**: filtri mappa collassabili, tab area personale scrollabili, back-to-top, in evidenza homepage, refactor permessi.
- **Bassa**: tema scuro, notifiche, commenti/thread, clustering avanzato, PWA.

## Prossimi passi
1. Scegliere quali punti trattare in questa tornata (consiglio: almeno i punti "Alta" + 2-3 "Media").
2. Confermare se vuoi mantenere il footer e le `ROTATING_WORDS` di DroneHero esattamente come sono (lo farò in ogni caso, ma mi serve la conferma per evitare regressioni).
3. Confermare se il sito deve rimanere solo in italiano o prevedere un toggle lingua.

Approvando questo piano possiamo procedere con l'implementazione in blocchi separati e verificabili.