## Obiettivo
Sulla versione mobile: sfruttare lo spazio vuoto in alto nella mappa dell'hero per mostrare il nome della realtà attualmente visitata dal razzo, e togliere lo striscione nero scorrevole sotto la mappa (che duplica la stessa informazione). Desktop invariato.

## Cambiamenti

### 1. `src/components/home/DroneHero.tsx`
- Rimuovere il `<text>` SVG che appare accanto al pallino attivo **solo su mobile** (touch device). Su desktop resta com'è.
- Aggiungere un overlay HTML in alto al centro del contenitore hero, visibile solo su mobile e solo quando `activeIdx >= 0`, che mostra:
  - Nome della realtà attiva (uppercase, stessa tipografia usata attualmente per il label SVG)
  - Riga secondaria piccola con `city · region` se disponibili (recuperando `region` nella query — attualmente carichiamo solo `city`; aggiungo `region` alla `select`)
- Transizione morbida (fade + micro-slide) al cambio di `activeIdx` per evitare scatti.
- Posizionamento: `absolute top-4 left-1/2 -translate-x-1/2`, `pointer-events-none`, contenuto centrato, larghezza max ~80% del viewport per andare a capo su nomi lunghi. Nessuna interferenza con la CTA "Naviga la mappa" più in basso.

### 2. `src/pages/Index.tsx`
- Nascondere la sezione marquee su mobile: aggiungere `hidden md:block` alla `<section>` che contiene `<Marquee>`. Su tablet/desktop resta identica.

## Cosa NON cambia
- Rotta, ritmo, marker/pallini sulla mappa, comportamento desktop del label sopra il pallino, footer, `ROTATING_WORDS`.
- Il marquee su desktop resta pari-pari.
