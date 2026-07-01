## Obiettivo
Su mobile lo scroll verticale deve funzionare sempre. L'interazione col razzo diventa opt-in tramite un bottone "Gioca con il razzo" visibile solo su touch device.

## Modifiche a `src/components/home/DroneHero.tsx`

1. **Rilevare touch device**: `useState` + `useEffect` con `window.matchMedia('(hover: none) and (pointer: coarse)').matches` → `isTouchDevice`.

2. **Nuovo stato `playMode`** (`boolean`, default `false`).
   - Su desktop (non-touch): sempre `true` — comportamento attuale invariato.
   - Su touch: `false` finché l'utente non tocca il bottone.

3. **Container hero**:
   - `touch-none` applicato **solo** quando `playMode === true`.
   - Handler `onTouchStart/Move/End` registrati solo se `playMode === true` (o resi no-op).

4. **Bottone "Gioca con il razzo"** (visibile solo se `isTouchDevice && !playMode`):
   - Posizionato in basso a destra dentro l'hero, stile brutalist coerente con gli altri CTA (bordo, font mono, uppercase, tracking).
   - Etichetta: `Gioca con il razzo 🚀` (o senza emoji, solo testo).
   - Al tap → `setPlayMode(true)`.

5. **Bottone "Chiudi" / "Esci dal gioco"** (visibile solo se `isTouchDevice && playMode`):
   - Stessa posizione, stile inverso (sfondo pieno secondary).
   - Al tap → `setPlayMode(false)` + reset target su Piemonte + `setHovering(false)`.

6. **Hint testuale opzionale** sotto il bottone d'attivazione: micro-copy mono uppercase `"Muovi il dito sulla mappa"` per rendere chiaro cosa succede dopo il tap.

## Fuori scope
Desktop resta identico. Nessuna modifica a stile, colori, copy del manifesto, o logica parallax.
