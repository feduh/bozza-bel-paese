# Interventi richiesti

Raggruppo le modifiche per area. Due punti richiedono una tua decisione prima di procedere (vedi § Domande in fondo): fusione descrizione/storia e comportamento responsive fuori fullscreen.

## 1. Form realtà (RealityForm)

- **Email di contatto obbligatoria** per chi crea/modifica una realtà (coordinatori e admin). Aggiungo validazione client + messaggio errore in italiano. Nota: a livello DB `contact_email` resta `nullable` per non rompere i record legacy; l'obbligo è sulla UI di inserimento/modifica.
- **Nuovi campi opzionali**:
  - `contact_phone` (telefono) — con formato libero, hint "+39 …"
  - `social_vimeo` — URL Vimeo, validato come `https://vimeo.com/…`
- Richiede una **migrazione** che aggiunge `contact_phone text` e `social_vimeo text` alla tabella `realities` (entrambi nullable, senza default).

## 2. Pagina singola realtà (RealityDetail)

- **Rimuovo dalla card "Informazioni" la voce "Sito web"** (resta in "Contatti").
- **Aggiungo telefono e Vimeo** nella card "Contatti" quando presenti.
- **Rimuovo l'etichetta "Drone · IT · Live"** dalla mappa: elimino l'HUD `hudLabel` da `LazyMap` (default e uso ovunque). "Drone" scompare dall'intero prodotto lato utente (resta solo il nome interno del componente `DroneHero.tsx`, non visibile).
- **Popup pin sulla mappa della singola realtà**: sostituisco il popup attuale con indirizzo. Logica:
  - se `address` presente → mostra indirizzo completo (`address, city, region`)
  - altrimenti → messaggio "Spazio nomade — nessuna sede fisica" (copy da rifinire)

## 3. Mappa realtà (`/mappatura`)

Cambio filtri → auto-focus mappa:

- Quando si seleziona una **regione**, la mappa fa `fitBounds` sui marker filtrati (con `padding` e `maxZoom` sensato ~10). Se 0 risultati, resta sulla vista Italia.
- Stessa cosa per cambio **categoria**, **disciplina**, **sezione**, **ricerca testuale**, **anno**: la mappa riadatta i bounds al set filtrato.
- Se un solo risultato, `setView([lat,lng], 12)`.
- Implementazione: dentro `LazyMap` un nuovo effetto che ricalcola bounds quando cambia l'array `markers` (usando `L.latLngBounds`). Skippato quando l'utente ha appena mosso manualmente la mappa entro 500ms (per evitare jitter).

## 4. Pagina "La Rete"

- **Card coordinatori**: rimuovo l'indicatore `01 // Coordinatore`, `02 // Coordinatore` ecc. La numerazione resta solo nell'ordine di lettura DB, non mostrata in UI. Sostituisco con label semplice `Coordinatore`.

## 5. Homepage — banner/striscia dinamica

- Il marquee usa `-mx-6 md:-mx-10` dentro `editorial-container` → non arriva ai bordi ai viewport più larghi (dove il container ha padding maggiore o max-width).
- Lo sposto **fuori** da `editorial-container` come sezione full-bleed (`w-screen` con `left: 50%; margin-left: -50vw` oppure semplicemente estratto al livello top del wrapper come già fatto per l'hero) allineandolo al comportamento di navbar/footer che coprono l'intera larghezza viewport.
- Mantengo contenuto e stile invariati (Marquee attuale, palette avorio/ink).

## 6. Profili utente — bio lunga

- Alzo il limite `maxLength` della bio da **500 → 1500** in `PanelProfilo.tsx` (tutti i ruoli: autori, coordinatori, admin).
- Nessuna migrazione: la colonna `profiles.bio` è già `text` senza vincolo di lunghezza.
- Aggiungo un contatore caratteri sotto la textarea (`n / 1500`).

## 7. "Drone" — pulizia globale

Ricerca `rg -i drone` nel sorgente utente-visibile e rimozione. Ad oggi le uniche stringhe visibili sono:
- `LazyMap.tsx` HUD `"Drone · IT · Live"` → rimosso (punto 2)
Il file `DroneHero.tsx` resta col suo nome interno (non user-facing).

## Migrazione DB

```sql
ALTER TABLE public.realities
  ADD COLUMN contact_phone text,
  ADD COLUMN social_vimeo  text;
```
(Nessun GRANT nuovo: la tabella esiste già con permessi corretti.)

## File toccati (previsione)

- `src/components/RealityForm.tsx` — email obbligatoria, campi telefono/Vimeo
- `src/pages/RealityDetail.tsx` — rimozione "Sito web" da info, aggiunta telefono/Vimeo in contatti, popup mappa
- `src/components/LazyMap.tsx` — rimozione HUD "Drone", auto-fit bounds su cambio markers
- `src/pages/Mappatura.tsx` — nessuna modifica se il fit viene fatto in LazyMap
- `src/pages/LaRete.tsx` — rimozione `0{i+1} //`
- `src/pages/Index.tsx` — marquee full-bleed
- `src/components/area/PanelProfilo.tsx` — bio 1500 char + counter
- `src/integrations/supabase/types.ts` — rigenerato dopo migrazione

## Domande aperte (rispondi prima di implementare)

1. **Descrizione + Storia**: preferisci
   - (a) **fondere** i due campi in un unico "Descrizione" (mostrando in UI il vecchio `history` accodato per i record esistenti), oppure
   - (b) **lasciare due campi separati** ma rendere `storia` opzionale e più leggero (placeholder che chiarisce "opzionale — solo se distinta dalla descrizione"), oppure
   - (c) tenerli entrambi obbligatori come ora?

2. **Responsive fuori fullscreen**: attualmente il layout usa breakpoint Tailwind standard (sm/md/lg/xl). Una finestra "a metà schermo" su desktop viene trattata come un viewport più piccolo e passa già al layout tablet/mobile ai breakpoint corrispondenti. Cosa noti che non funziona? Possibili opzioni:
   - (a) va bene così, era solo una domanda
   - (b) vuoi che il layout desktop rimanga anche in finestre strette (minor adattività, più scroll orizzontale) — sconsigliato
   - (c) c'è una pagina specifica che si rompe: dimmi quale e la sistemo puntualmente

Appena confermi (1) e (2) procedo con l'implementazione completa.
