# Piano modifiche sito

Lavoro suddiviso per area. Alcune voci ambiziose (nuova sezione "Editoriale", storytelling "Cosa Facciamo") sono trattate come **prima versione visiva** che potremo rifinire insieme in un secondo giro.

---

## 1. Home

- **Scritte dinamiche (WordRotate)**: rimuovere "atelier nascosti" e "luoghi che resistono" dall'elenco (file `it.json`).
- **Card "pilastri"**: eliminare la piccola label viola (es. `Cartografia`, `Network`, `Editoria`) e lasciare solo il numero (`01 //`, `02 //`, `03 //`).
- **Riga sotto le statistiche**: rimuovere il blocco "ILBELPAESE / Scena indipendente italiana" sotto i contatori animati.

## 2. Navbar

- Nuova voce **RACCONTO** (dropdown) al posto delle attuali voci separate `Magazine` e `La vostra voce`:
  - `Editoriale` (nuova pagina — vedi sotto)
  - `Magazine libero` (attuale `/magazine`)
  - `Podcast / La vostra voce` (attuale `/la-vostra-voce`)
- Implementata con `DropdownMenu` (già in uso) sia su desktop sia nel menu mobile (accordion).
- **Nuova pagina `/editoriale**`: prima versione con hero editoriale differenziato (tipografia più grande, sfondo scuro/accent, badge "Tema dell'anno"), spazio per il tema curato e griglia articoli associati. Per adesso mostra un placeholder + eventuali `blog_posts` filtrati per tag `editoriale` (nessuna nuova tabella; useremo un tag esistente).

## 3. Cosa Facciamo

- Correggere l'incipit: togliere la parola "prima" dalla prima frase (i18n).
- Rimuovere la frase: *"Attraverso una vetrina dinamica e un archivio storico…"*.
- **Rimuovere le sezioni "I pilastri" e "Come lo facciamo"** e sostituirle con una **prima versione di storytelling scroll-based**: sequenza di blocchi editoriali alternati (numero grande + titolo + paragrafo + immagine/illustrazione), pensati per essere estesi in futuro. Sezione "prima di noi coordinatori" lasciata come blocco placeholder pronto per il contenuto che ci darete.

## 4. Mappatura

- **Filtri riorganizzati visivamente** in tre righe:
  - Riga 1: `Mappa | Elenco` · Barra di ricerca · `Vicino a me`
  - Riga 2: chip multiselezione — `Spazi | Spazi senza spazi | Spazi che furono (verdi) | Spazi che furono (viola)`
  - Riga 3: `Regioni | Discipline | Ordine predefinito` (solo in modalità elenco) `| Anno`
- Rimuovere la modalità `Magazine` dai filtri.
- Rinominare "Categorie" → "Discipline" nell'etichetta filtro.
- **Nessun risultato**: overlay al centro della mappa con messaggio ("Nessuna realtà corrisponde ai filtri impostati") + pulsante "Reimposta filtri".
- **Nomi mappa**: forzare la tile CartoDB in italiano (usare tile `light_all` con `lang=it` dove supportato, altrimenti fallback a versione internazionale, per evitare mix IT/EN).
- **Zoom touch/pinch/trackpad**: abilitare `scrollWheelZoom`, `touchZoom`, `doubleClickZoom` sul `MapContainer`.
- **Bug tag/discipline invisibili** su nuove realtà (es. Mucho Mas!, ALMARE): verificare che le tag inserite in `RealityForm` vengano salvate in `reality_tags` anche quando la realtà è ancora `pendente`, e che vengano lette anche per realtà non ancora confermate nell'anteprima admin. Verificheremo anche perché non vengono pubblicate (probabile trigger auto-confirm che non scatta per realtà proposte da coordinatori — da confermare in build mode leggendo lo stato reale delle due realtà).
- **Storia**: nascondere completamente la card "Storia" sulla scheda realtà se il campo è vuoto; **descrizione sempre obbligatoria** (già in validazione). Riorganizzare la scheda in modo che le card `Contatti` / `Informazioni` inizino alla stessa altezza della descrizione (layout 2 colonne allineate top).
- **Descrizione + bio con formattazione**: consentire a-capo e **grassetto** nella descrizione delle realtà e nella bio profilo; rendering con testo giustificato. Editor semplice (toolbar minimale: **B**, nuova riga) basato sul `MarkdownEditor` già esistente, oppure textarea che supporta `**bold**` + `\n` con render markdown lato lettura.

## 5. Sezione Racconto

- **Podcast / La vostra voce**: aggiungere 2 esempi finti (1 video + 1 podcast audio) per prototipare card, player e metadati. Card con copertina, titolo, autore, durata, embed player.
- **Estrazione copertina URL**: migliorare la funzione che estrae la thumbnail per link YouTube (usare `img.youtube.com/vi/<id>/maxresdefault.jpg`) e per siti indipendenti (parse `og:image` / `twitter:image` via edge function o fallback).

## 6. Altro

- **Occhietto password** su `/login` (toggle show/hide con icona `Eye`/`EyeOff`).
- **Timeout di sessione**: verificare che l'auto-refresh di Supabase sia attivo e valutare timeout esplicito con avviso ("La sessione sta per scadere"). Proposta: 8h di inattività, avviso a 5 minuti dal termine. **In alternativa** demandare a Cloudflare (soluzione non consigliata perché la sessione è gestita da Supabase). Attendo conferma se procedere con avviso lato app.
- **Bio profilo**: rivedere layout `AutoreProfilo` per evitare che le bio lunghe rompano l'impaginazione (es. profilo di Federica) — colonna dedicata max-w, spaziatura tra header e bio, wrapping corretto.

---

## Nota tecnica

- Nessuna nuova tabella DB necessaria. Se il filtro/rendering `disciplines` richiede una vista dedicata, useremo `reality_tags` esistente.
- I18n aggiornato per tutte le nuove label e i placeholder.
- Il changeset resta focalizzato su UI/presentazione, tranne la piccola correzione lettura tag per realtà pendenti.

## Domande aperte

1. **Timeout sessione**: preferisci implementarlo lato app con avviso (8h / avviso 5min) o lasciar gestire a Cloudflare? FACCIAMO SU SUPABASE PER ORA.
2. **Pagina "Editoriale"**: gli articoli da mostrare vanno filtrati per un tag specifico (es. `editoriale`) o ci sarà un flag dedicato in futuro? Per la v1 uso il tag. FLAG IN FUTURO (CAPIAMO COME IMPLEMENTARLO).
3. **Grassetto/formattazione descrizione**: preferisci una **toolbar visuale** (bottone B, invio) o mantenere sintassi markdown (`**testo**`) con anteprima? TOOLBAR VISUALE PER TUTTI I MEMBRI.