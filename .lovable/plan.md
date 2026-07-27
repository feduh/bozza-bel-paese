# Mappatura — restyling filtri, feedback & mobile

Interveniamo su `src/pages/Mappatura.tsx` e, in modo minimo, su `src/components/LazyMap.tsx` e `src/components/MapFallback.tsx`. Nessuna modifica al database.

## 1. Filtri più efficaci

**Barra "filtri attivi" (chip rimovibili)**
Sotto la toolbar principale compare una riga di chip che riassume ogni filtro applicato (categoria, tipologia, regione, disciplina, anno min/max, ricerca testo, geolocalizzazione). Ogni chip ha una × per rimuovere solo quel filtro. A destra della riga resta il pulsante "Reimposta tutto".
Vantaggio: l'utente vede a colpo d'occhio cosa sta filtrando e può togliere un solo criterio senza aprire i menu.

**Contatore risultati sempre visibile**
Il conteggio "X realtà trovate" diventa più prominente (font display, non micro-label), e si aggiorna con una piccola animazione di fade quando cambia. Aggiungiamo sotto un accenno "di N totali" per dare scala.

**Ricerca migliorata**
- Debounce a 200ms sull'input di ricerca (oggi ogni tasto rifiltra sincronamente tutte le realtà).
- Icona lente dentro l'input + × per svuotare rapidamente.
- Placeholder più esplicito: "Cerca per nome, città, disciplina, tag…".

**Riorganizzazione della griglia filtri (desktop)**
Manteniamo l'ordine ma miglioriamo la coesione:
```text
[ Vista map/list ] [ Ricerca (flex-1) ] [ Vicino a me ]
[ Chip tipologia × 4 (multi-select, come oggi) ]
[ Regione ] [ Disciplina ] [ Categoria ] [ Anno da–a ] [ Ordina (solo list) ]
[ Chip filtri attivi × N ] [ Reimposta tutto ]
```

## 2. Feedback di caricamento

**Skeleton allineato al layout reale**
Sostituiamo lo skeleton attuale (2 righe + 1 blocco) con:
- barra filtri fantasma (stessa altezza reale),
- skeleton della mappa con marker fantasma pulsanti (o della griglia card se `vista=list`),
- così il layout non "salta" quando i dati arrivano.

**Overlay di refresh**
Durante `fetchRealities` in retry (dopo errore), invece di rimontare tutto mostriamo un overlay traslucido con spinner sopra la mappa/lista già rese — evita il flash di skeleton pieno.

**Stato "aggiornamento filtri"**
Quando cambia un filtro, il conteggio risultati mostra brevemente uno spinner minuscolo accanto (~200ms, coerente col debounce), così l'utente percepisce che il sistema sta rispondendo.

**Errore più utile**
La schermata di errore attuale è centrata e vuota. Aggiungiamo un'icona, un messaggio più chiaro (con dettaglio "Controlla la connessione") e mantieni il tasto Riprova, ma con lo stesso stile brutalist degli altri CTA della pagina.

## 3. Esperienza mobile più fluida

**Bottom sheet filtri**
Su mobile il pannello filtri diventa un bottom sheet (drawer che sale dal basso) invece di espandersi inline. Il pulsante "Filtri" nella toolbar mostra un badge con il numero di filtri attivi. Il sheet contiene: chip tipologia, regione, disciplina, categoria, anno, ordinamento. Con un footer sticky "Applica (X risultati)" che chiude il sheet.
Vantaggio: la mappa/lista resta sempre visibile sotto, e i filtri non spingono in basso il contenuto.

**Chip tipologia scorrevoli**
Su mobile i 4 chip (Spazi / Spazi senza spazi / Furono / Furono itineranti) diventano una riga scrollabile orizzontalmente invece che grid 1-colonna → meno scroll verticale, più veloce da cambiare.

**Altezza mappa dinamica**
Su mobile la mappa passa da `600px` fisso a `calc(100dvh - 220px)` con un minimo di `420px`. Sfrutta l'altezza reale del viewport senza tagliare i controlli inferiori.

**Toolbar sticky**
La riga con toggle vista + ricerca + Filtri diventa `sticky top-16` su mobile (sotto la navbar), così l'utente può cambiare vista o filtri senza scrollare in cima.

**Tap target**
Alziamo tutti i controlli filtro a min-height `44px` su mobile (oggi molti sono `py-2` → ~36px).

## Dettagli tecnici

File toccati:
- `src/pages/Mappatura.tsx` — riorganizzazione JSX, debounce ricerca, chip filtri attivi, bottom sheet mobile (uso `Sheet` da `@/components/ui/sheet` già presente), skeleton dedicato.
- `src/components/MapFallback.tsx` — rendering più ricco con marker pulsanti fantasma.
- `src/components/LazyMap.tsx` — nessuna modifica funzionale; solo prop opzionale `height` già presente.
- Nessuna migration, nessuna edge function, nessun cambio ai dati.

Note:
- Il debounce sulla ricerca è puramente lato client (`useDeferredValue` di React 18 o `setTimeout`); preferiamo `useDeferredValue` — zero dipendenze aggiunte.
- Il bottom sheet usa il componente `Sheet` di shadcn già installato.
- Manteniamo la sync URL ↔ stato esistente (già presente e funzionante).
- Nessun tocco al database o alle policy RLS.
