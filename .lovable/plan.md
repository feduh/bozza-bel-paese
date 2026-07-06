## Obiettivo
Su mobile eliminare completamente l'interattività touch del razzo (fonte dei bug di scroll) e sostituirla con un'animazione autonoma: il razzo vola da solo tra varie città italiane, con qualche incursione europea, a velocità variabile.

## Modifiche a `src/components/home/DroneHero.tsx`

### 1. Rimozione totale del touch interattivo su mobile
- Eliminare `playMode`, `showHint`, `lastInteraction`, `idleTimer`, `hintTimer`, `bumpActivity`.
- Rimuovere handler `onTouchStart/Move/End/Cancel` dal container.
- Rimuovere il bottone centrale "tap" e il bottone "Exit".
- Rimuovere `touch-none` dal container su mobile: lo scroll verticale torna nativo e fluido.
- `isTouchDevice` resta solo per decidere quale modalità attivare (autoplay vs cursore).

### 2. Autoplay del razzo su touch device
Nuovo comportamento quando `isTouchDevice === true`:
- Il razzo è sempre visibile (nessun tap richiesto).
- Segue un percorso predefinito di waypoint con velocità variabile e piccole pause "hovering" sopra alcune città.
- La mappa fa parallasse seguendo il razzo, esattamente come già succede col cursore desktop.

**Waypoint (coordinate normalizzate nel viewBox Europa, riuso della stessa scala di `PIEMONTE`):**
- Torino / Piemonte (start)
- Milano
- Venezia
- Bologna
- Firenze
- Roma
- Napoli
- Palermo
- Cagliari
- risalita → Marsiglia (incursione EU)
- Parigi (incursione EU breve)
- rientro → Genova
- Berlino (incursione EU)
- Vienna
- rientro → Trieste
- loop back a Torino

Ogni waypoint ha: `{ x, y, dwell }` dove `dwell` è il tempo di sosta (400–1400 ms) per simulare "hovering" sopra la scena.

**Motore d'animazione:**
- Nuovo `useEffect` attivo solo se `isTouchDevice`.
- Stato interno con `waypointIndex`, `phase: "travel" | "dwell"`, `travelStart`.
- In fase `travel`: interpolazione con easing `easeInOutCubic` tra waypoint corrente e successivo, durata proporzionale alla distanza (base 1800 ms + distanza × fattore, con leggera variazione random ±15% per non essere metronomico).
- In fase `dwell`: `target` resta fermo sul waypoint per `dwell` ms, con micro-oscillazione già presente in `hovering` idle.
- Aggiornamento di `target.current.x/y` e di `cursor.current.x/y` (posizione schermo del razzo, calcolata dal viewBox → panel).
- `hovering` forzato a `true` per mostrare il razzo.
- L'angolo del razzo continua a derivare dalla velocità smoothed esistente, quindi ruota naturalmente lungo il percorso.

### 3. Desktop invariato
Tutto il ramo non-touch resta identico: cursore razzo, parallax, hover enter/leave, ritorno a Piemonte.

### 4. Pulizie
- Rimuovere `handleTouchStart/Move/End` e `touchActive`.
- Rimuovere il blocco JSX `{isTouchDevice && (...)}` con bottoni e hint.

## Fuori scope
Nessuna modifica a copy, palette, tipografia, manifesto, CTA, o al resto della home.

## Dettagli tecnici
- La conversione waypoint → coordinate schermo del razzo usa la stessa `groupTransform` inversa: dato `target = (tx, ty)` normalizzato, il razzo va disegnato al centro del pannello (`cx, cy`) perché la mappa si muove sotto di lui — quindi `cursor.current.x/y` si può fissare a `(cx, cy)` con piccolo offset sinusoidale per dare vita.
- In alternativa, mantenere `cursor.current` sincronizzato al centro pannello semplifica: l'illusione di volo la dà la mappa che scorre, non il razzo.
- L'angolo del razzo viene calcolato dal delta di `target.current` tra frame (già smoothed via `svx/svy` se applichiamo un piccolo offset schermo derivato dal delta target).
