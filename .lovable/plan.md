## Diagnosi
Lo scroll laggy ovunque nella home su Brave iOS (mentre Safari regge) è causato dal loop rAF del `DroneHero` che fa `setState` ad ogni frame (`force((n) => (n + 1) & 1023)`). Questo forza React a ri-renderizzare tutta la sezione — inclusa la path SVG dell'Europa e la vignette a piena pagina — 60 volte al secondo, anche quando l'hero è **fuori dalla viewport**. Safari/WebKit ottimizza aggressivamente, Brave/Chromium iOS no.

Non è quindi il touch: è il costo continuo del render.

## Piano di intervento (solo `src/components/home/DroneHero.tsx`)

### 1. Rimuovere il re-render per frame
Sostituire l'aggiornamento via `setState` con manipolazione diretta del DOM tramite `ref`:
- `gRef` sul `<g>` della mappa → aggiornare `setAttribute("transform", ...)` nel rAF.
- `rocketRef` sul div del razzo → aggiornare `style.transform` / `left` / `top`.
- Rimuovere completamente lo state `force`.

React ri-renderizza solo per: cambio parola rotante, resize del pannello, `hovering`, `isTouchDevice`. Il resto è tutto imperativo via ref → costo per frame quasi zero.

### 2. Pausare rAF fuori viewport
`IntersectionObserver` sull'elemento hero:
- `isVisible = false` → `cancelAnimationFrame` e non ripartire.
- `isVisible = true` → ripartire il loop.

Vale sia per il loop di smoothing sia per l'autoplay dei waypoint.

### 3. Pausare anche quando il tab è in background
`document.visibilitychange` → stessa logica di pausa. Evita drift dei timer e batteria sprecata.

### 4. Rispettare `prefers-reduced-motion`
Se l'utente ha ridotto le animazioni: nessun rAF, nessun autoplay, mappa statica sul Piemonte, razzo nascosto su mobile. Migliora accessibilità e performance su device deboli.

### 5. Micro-ottimizzazioni
- `will-change: transform` sul `<g>` della mappa e sul razzo (già presente sul razzo).
- Ridurre da 60fps a ~45fps su mobile (`isTouchDevice`) con un piccolo throttle temporale nel tick — impercettibile visivamente, ma dimezza il lavoro di composizione.
- La `rotating word` continua a usare `setInterval` React come oggi (1 render ogni 2.6s, trascurabile).

## Fuori scope
Niente modifiche a copy, layout, palette, o altre sezioni della home. Nessun cambio all'autoplay dei waypoint o al comportamento desktop — solo il modo in cui vengono applicati i frame.

## Verifica post-implementazione
1. React DevTools Profiler: `DroneHero` non deve più comparire nei render frequenti.
2. Su Brave iOS: scroll fluido dall'hero fino al footer.
3. Su desktop: parallax del razzo invariato.
4. Su mobile: autoplay dei waypoint invariato visivamente.
