## Obiettivo
Rendere il volo mobile del razzo un viaggio continuo e naturale sull'Italia, senza soste rigide, più immersivo grazie a uno zoom maggiore.

## Modifiche a `src/components/home/DroneHero.tsx`

### 1. Zoom mobile più stretto sull'Italia
- `ZOOM_MOBILE` da `6.6` → `~9.5` per dare la sensazione di sorvolo ravvicinato.
- Nessuna modifica al desktop.

### 2. Nuova rotta italiana non-lineare
Sostituire `AUTOPLAY_ROUTE` con ~14 tappe che coprono tutta la penisola in ordine **non geografico** (salti nord/sud/isole/centro), così il viaggio sembra esplorativo e non un percorso lineare da nord a sud.

Esempi di città da includere (coordinate normalizzate sul viewBox Europa): Torino, Bari, Milano, Palermo, Firenze, Cagliari, Venezia, Napoli, Bologna, Roma, Trieste, Catania, Genova, Perugia, Ancona. Ordine mescolato per creare zig-zag.

### 3. Movimento continuo senza soste
- Rimuovere il concetto di fase `dwell`: il razzo non si ferma mai su una tappa.
- Il loop autoplay diventa una **spline continua**: appena raggiunta (o quasi raggiunta) una tappa, si passa immediatamente alla successiva, senza `dwell` timer.
- Per evitare "scatti" sui waypoint, usare un target che avanza costantemente lungo la rotta: durata di ogni leg proporzionale alla distanza, easing `easeInOutCubic` mantenuto ma il passaggio da leg a leg avviene senza pausa (t=1 → immediatamente nextLeg).
- Rimuovere il campo `dwell` dal tipo `Waypoint` e dai dati.
- `phaseRef` non serve più: il razzo è sempre in "travel", quindi la rotazione segue sempre la velocità (naturale). Semplificare il ramo touch del rAF loop rimuovendo il check `phaseRef.current === "travel"`.

### 4. Velocità variabile per naturalezza
Mantenere il jitter già presente (`0.85 + Math.random() * 0.3`) sulla durata del leg, così alcune tratte sono più veloci e altre più lente, dando ritmo al viaggio.

## Non toccare
- `ROTATING_WORDS` (già gestito dall'utente su GitHub).
- Comportamento desktop (cursore-driven).
- Footer e altre pagine.

## Note tecniche
- Le coordinate x/y sono normalizzate sul viewBox europeo (`EUROPE_VB`); l'Italia occupa circa `x: 0.47–0.57`, `y: 0.63–0.86`. Le nuove tappe restano dentro questo range.
- Con `ZOOM_MOBILE ~9.5` e `PIEMONTE` come centro iniziale, verificare che la mappa non mostri bordi vuoti; se accade, alzare/abbassare leggermente lo zoom.
