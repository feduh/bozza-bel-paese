## Correzioni richieste

### 1. Mappatura — filtri + legenda

- Ridurre la barra di ricerca: max-width ~`max-w-sm`(non più`flex-1`), allineata a sinistra accanto al toggle Mappa/Elenco.
- **Unire legenda + chip di sezione**: i quattro pulsanti "Tutte / Spazi / Spazi senza spazi / Spazi che furono" mostreranno il pallino colore corrispondente (marker) a sinistra della label — così i chip fanno anche da legenda e la riga separata "Legend" viene rimossa.
- Layout a 3 righe come richiesto in precedenza:
  - Riga 1: toggle Mappa/Elenco · barra ricerca corta · pulsante "Vicino a me"
  - Riga 2: chip multi-sezione con colore integrato
  - Riga 3: Regione · Discipline · Ordine · Anno min–max · Reset

### 2. Mappa — recuperare personalità mantenendo etichette in italiano

- Tornare a tile con più carattere (CartoDB **Voyager**) e sovrapporre un layer trasparente di sole etichette OSM Standard (in Italia i `name` sono già in italiano). Risultato: colori/tratto della versione precedente + toponimi italiani.
- In alternativa (fallback se Voyager non convince): OSM Standard con filtro CSS `saturate/contrast` per riportare il tono editoriale.

### 3. Pagina singola realtà — colonne indipendenti

- Spostare `descrizione` dentro la colonna sinistra (sopra "Storia" + "Location") così che **Descrizione + Storia** siano una colonna e **Informazioni + Contatti + Membri + Discipline** un'altra, davvero indipendenti nell'altezza.
- La colonna destra resta `aside` sticky opzionale.

### 4. Tag colorati sulle card delle realtà (lista Mappatura)

- I  tag "spazio","spazio senza spazio","spazio che fu", sulle card assumono il colore del bucket (spazi = primary, spazi senza spazi = secondary, spazi che furono = variante outline), usando `categoryConfig[cat].badgeClass`.

### 5. Navbar — dropdown "Racconti" allineato allo stile area personale

- Rinominare "Racconto" → **"Racconti"** ovunque (navbar desktop + mobile + link interni).
- Aggiungere `sideOffset={12}` e `align="end"` (o wrapper con padding come il bottone rotondo dell'utente) al `DropdownMenuContent` così il pannello si stacca visivamente dalla navbar come quello dell'avatar.

### 6. Homepage — card "Racconti" verso pagina hub

- Nuova rotta `/racconti` (`src/pages/Racconti.tsx`): pagina hub con tre card grandi (Editoriale · Magazine libero · Podcast / La vostra voce) e breve descrizione ciascuna.
- La feature card della home punta a `/racconti` invece che direttamente a `/magazine`. Aggiornare anche i18n (`home.features.stories`).

### 7. Podcast — card cliccabili con pagina dedicata

- Ogni esempio diventa `<Link>` a una pagina placeholder `/racconti/podcast/:slug` (nuova rotta) con: cover grande, titolo, autore, durata, breve descrizione lorem-ipsum, CTA "torna alla sezione". Nessun contenuto reale, solo prototipo navigabile.

### 8. Bio autori/coordinatori — riorganizzazione componente

- Riprogettare `AutoreProfilo`:
  - Header a due colonne compatto (avatar + nome + ruoli + affiliazione + azioni social) senza bio.
  - Nuova **card dedicata "Biografia"** (stile identico alle card "Contatti"/"Informazioni" della realtà) full-width sotto l'header, con titolo, filetto e testo giustificato. Nasconde tutta la card se `bio` è vuota.
  - Griglia successiva: sinistra = Articoli pubblicati, destra = eventuali metadati (categoria figura pubblica, link realtà). Così profili con bio corta o assente non hanno "buchi" e quelli lunghi restano leggibili (caso Federica).

## Dettagli tecnici

**File toccati:**

- `src/pages/Mappatura.tsx` — riorganizzazione filtri, chip con pallini, rimozione legenda separata, colorazione tag sulle card
- `src/components/LazyMap.tsx` — tile Voyager + overlay etichette OSM
- `src/pages/RealityDetail.tsx` — descrizione spostata dentro colonna sinistra
- `src/components/Navbar.tsx` — rename "Racconti", `sideOffset` sul dropdown
- `src/pages/Racconti.tsx` (nuovo) + rotta in `src/App.tsx`
- `src/pages/PodcastEpisodio.tsx` (nuovo, placeholder) + rotta `/racconti/podcast/:slug`
- `src/pages/LaVostraVoce.tsx` — card cliccabili con `Link` reali
- `src/pages/AutoreProfilo.tsx` — nuova sezione "Biografia" a card
- `src/pages/Index.tsx` + `src/i18n/locales/it.json` — link della feature stories → `/racconti`, rename "Racconto"→"Racconti"

**Fuori scopo (rinviato):** editor rich-text per grassetto, timeout sessione, thumbnail extraction avanzata da URL — restano nel backlog.