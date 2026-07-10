## Filtri della pagina Mappatura

### 1. Chip tipologia (riga 2)
- Rimuovo il chip "Tutte".
- Passo da 3 a **4 chip corrispondenti alle 4 categorie visive già presenti sulla mappa**:
  1. **Spazi** — pallino viola pieno (primary)
  2. **Spazi senza spazi** — pallino verde/teal pieno (secondary)
  3. **Spazi che furono** — pallino viola con contorno (primary outline)
  4. **Spazi che furono itineranti** — pallino verde/teal con contorno (secondary outline) ← quello mancante
- Comportamento **multi-selezione**: click aggiunge/rimuove; nessuna selezione = mostra tutto (equivalente all'attuale "Tutte").
- Filtraggio: una realtà passa se corrisponde ad almeno una delle categorie selezionate (usando `getCategory` invece di `matchesBucket`).
- Stato passa da `bucketFilter: "all" | Bucket` a `categoryBuckets: Set<Category>` (sincronizzato in URL come lista separata da virgole, es. `?tipo=spazio,spazio-fu-spazio`).

### 2. Allineamento a tutta larghezza
Tutte le righe di filtri occupano l'intera larghezza della mappa (`w-full`), con `flex-wrap` per il responsive:
- **Riga 1**: toggle Mappa/Elenco a sinistra, barra ricerca che si espande (`flex-1`), pulsante "Vicino a me" a destra (`ml-auto` o `justify-between`).
- **Riga 2 (chip tipologia)**: `w-full flex flex-wrap gap-2` — i 4 chip si distribuiscono e vanno a capo se serve.
- **Riga 3 (Regione / Disciplina / Ordine / Anno / Reset)**: `w-full flex flex-wrap gap-3 items-center` — resta allineata a sinistra ma occupa la riga intera. Nessun cambio di layout dei singoli controlli.

### 3. Fuori scope
Nessuna modifica ai marker della mappa, alla logica di ricerca testuale, all'ordinamento o alla vista elenco.

### File toccati
- `src/pages/Mappatura.tsx` — refactor stato filtro, chip multi-select, larghezze righe.
- (nessun'altra modifica)
