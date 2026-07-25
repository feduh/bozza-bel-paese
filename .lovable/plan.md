## Obiettivo
Le pagine `/la-vostra-voce` e `/racconti/podcast/:slug` mostrano oggi due esempi placeholder con problemi di copyright:
- copertina 1 = miniatura YouTube ("dQw4w9WgXcQ", Rick Astley) — copyright altrui
- copertina 2 = foto Unsplash caricata da URL esterno — licenza permissiva ma dipendenza da CDN esterna e volto riconoscibile

Vanno sostituiti con esempi coerenti col progetto, credibili come "anteprima", e con immagini generate da noi (nessun copyright terzo, nessun hotlink).

## Cosa cambia

### 1. Nuovi esempi (3, tutti "podcast" audio)
Rimuoviamo la card "video" (non abbiamo ancora nulla di video e crea aspettative fuori scopo) e proponiamo 3 esempi audio ispirati a temi reali del sito — spazi indipendenti, geografie artistiche, realtà scomparse:

- `voci-spazi-nomadi` — "Voci dagli spazi nomadi" — dialogo con un collettivo senza sede fissa, durata `28'40"`
- `mappe-sonore-sud` — "Mappe sonore del Sud" — le scene indipendenti fuori dai grandi centri, `41'05"`
- `archivio-realta-scomparse` — "Archivio delle realtà scomparse" — memoria orale di spazi chiusi, `35'22"`

Autore mostrato: "Il Bel Paese × [partner da definire]" — chiarisce che le collaborazioni radio non sono ancora attive.

### 2. Copertine generate
Tre immagini JPG generate con `imagegen`, coerenti col linguaggio brutalist / editoriale del sito (palette carta, nero, primary), salvate in `src/assets/podcast/`:
- `voci-spazi-nomadi.jpg`
- `mappe-sonore-sud.jpg`
- `archivio-realta-scomparse.jpg`

Stile: illustrazioni tipografiche/astratte con onda sonora o simboli editoriali — nessun volto, nessun logo di terzi.

### 3. File toccati
- `src/pages/LaVostraVoce.tsx` — nuovo array `examples` (3 podcast), import delle 3 copertine, rimozione dell'icona `PlayCircle` (resta solo `Headphones`), aggiornamento della griglia a `md:grid-cols-3`, disclaimer "Esempi editoriali: contenuti non ancora prodotti".
- `src/pages/PodcastEpisodio.tsx` — nuovo dizionario `episodi` con le 3 voci sopra, `kind` sempre `"podcast"`, description più concreta (2-3 frasi), stesse copertine importate.
- (nessuna modifica al DB, al routing o all'editor podcast staff)

## Dettagli tecnici
- Import delle copertine come asset Vite (`import cover from "@/assets/podcast/..."`), così Vite le fingerprintizza e non serve `onError` fallback.
- Rimuoviamo gli URL esterni: niente `i.ytimg.com` né `images.unsplash.com`.
- Manteniamo la tipografia, i `brutalist-card`, i micro-label e la CTA "Stiamo cercando alleati" invariati.
- Il route `/racconti/podcast/:slug` continua a servire il vecchio slug `radio-indipendenti` e `collettivo-senza-sede`? No: sono placeholder senza traffico esterno, li sostituiamo integralmente coi 3 nuovi slug.
