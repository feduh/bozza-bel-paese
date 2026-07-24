## Obiettivo
Il razzo mobile diventa un vero "sopralluogo" della mappatura: visita le realtà confermate reali (12 attualmente), rallenta su ognuna, mostra un label discreto col nome della realtà quando la sorvola.

## 1. Proiezione lat/lng → viewBox (nuovo helper)

In `src/components/home/europePath.ts` esportare la stessa proiezione Mercator già usata per disegnare i confini, così `DroneHero` può convertire coordinate geografiche reali negli stessi coord del viewBox (e poi normalizzarle a 0–1).

```ts
export function projectLatLng(lat: number, lng: number): { x: number; y: number } {
  const [px, py] = projection([lng, lat]) ?? [EUROPE_VB.W / 2, EUROPE_VB.H / 2];
  return { x: px / EUROPE_VB.W, y: py / EUROPE_VB.H };
}
```

Estraendo `projection` come `const` module-level. Zero cambi al path esistente.

## 2. Fetch delle realtà nell'hero

In `DroneHero.tsx`:
- `useQuery(['drone-waypoints'])` che chiama `supabase.from('realities').select('id, name, lat, lng, city').eq('confirmed_status', 'confermato')`, `staleTime: 10min`.
- Se `data` è vuoto o `loading`, fallback alla lista curata attuale (Torino, Milano, Roma, ecc.) così l'hero non è mai muto.
- Mappare ciascuna realtà con `projectLatLng` → `Waypoint { x, y, name, city }`.
- Deduplicare per città vicine (< 0.005 in normalizzato ≈ ~10 km): se due realtà cadono quasi sullo stesso punto, tenere la prima ma unire i nomi in un unico label ("Nome A · Nome B") per non far sovrapporre marker.

## 3. Ordinamento non-lineare

Invece di visitare in ordine casuale (sfarfallio) o alfabetico (noioso), usare **nearest-neighbor con randomizzazione leggera** partendo da un waypoint casuale: parti da un punto qualsiasi, poi ogni prossimo waypoint = uno dei 3 più vicini non ancora visitati, scelto random. Quando tutti visitati, ricomincia da capo con nuovo random start. Risultato: percorso che ha senso spaziale (evita salti Torino→Palermo→Milano) ma non è mai identico tra sessioni.

## 4. Ritmo: micro-pausa senza rotazione

Reintrodurre una fase `dwell` breve, ma corretta:
- `travel` easing cubic, durata proporzionale alla distanza + jitter (attuale ok, ma **rallentato**: base `2200 + dist * 6800` invece di `1200 + dist * 4600`, così ogni leg dura 2.5–5 sec circa).
- `dwell` di 900–1400ms (jitter) su ogni waypoint: il target resta bloccato esattamente sulla realtà, la mappa si stabilizza.
- Durante `dwell` la rotazione del razzo è **congelata** (bug precedente risolto): riusare `phaseRef.current` come nel primo tentativo, il ramo touch aggiorna l'angolo solo se `phaseRef.current === "travel"`.
- Durante `dwell` il razzo mantiene la sua micro-oscillazione (già presente `Math.sin(t*0.9)*6`) → sembra fermo che osserva, non congelato.

## 5. Label realtà sulla mappa

Dentro `<g ref={mapGroupRef}>` renderizzare, dopo il path Europa:

```tsx
{waypoints.map((w, i) => (
  <g key={w.id} transform={`translate(${w.x * VB_W} ${w.y * VB_H})`}>
    <circle r={2 / scale0} fill="hsl(var(--secondary))" opacity={activeIdx === i ? 1 : 0.35} />
    <text
      x={4 / scale0} y={-4 / scale0}
      fontSize={8 / scale0}
      fill="hsl(var(--background))"
      opacity={activeIdx === i ? 1 : 0}
      style={{ fontFamily: 'monospace', letterSpacing: '0.05em', transition: 'opacity 400ms' }}
    >
      {w.name.toUpperCase()}
    </text>
  </g>
))}
```

- `activeIdx` è uno **stato React** aggiornato SOLO al cambio di waypoint (una volta ogni ~4 sec), non per frame → nessuna regressione performance.
- Con `vectorEffect="non-scaling-stroke"` non applicabile a `text`, i valori sono divisi per `scale0` così il testo resta leggibile a qualunque zoom.
- Sui pallini non attivi label invisibile (`opacity: 0`), transizione morbida in entrata/uscita.
- Non attivi hanno pallino tenue (0.35) → si intuisce che ci sono altre tappe senza rumore.

## 6. Non toccare

- Comportamento desktop (cursor-driven) invariato — waypoints e label restano visibili ma senza autoplay: `activeIdx` resta a `-1` su desktop, label sempre nascosti, pallini a `opacity: 0.15` come decorazione discreta. **Da confermare**: preferisci label visibili anche su desktop passando col mouse sopra? Per ora piano prevede solo mobile.
- `ROTATING_WORDS` intatto (gestito su GitHub).
- `ZOOM_MOBILE` resta 9.5 come impostato.

## Sequenza implementazione
1. Aggiornare `europePath.ts` per esportare `projection` e `projectLatLng`.
2. Modificare `DroneHero.tsx`: fetch waypoints, nearest-neighbor sort, render pallini+label, reintrodurre `dwell` senza rotazione, rallentare `travelDur`, gestire `activeIdx`.
3. Test manuale: mobile viewport, verificare che (a) il razzo rallenti visibilmente, (b) i nomi appaiano sopra le realtà giuste, (c) il razzo non ruoti su se stesso in sosta.

## Rischi
- Al momento ci sono solo **12 realtà confermate**: il giro completo dura ~40–60 secondi e poi ricomincia. Va bene, con l'ordinamento randomizzato per sessione sembra diverso ogni volta.
- Se le realtà crescono a 50+, il ciclo diventerà molto lungo (positivo).
- Latenza fetch: la query gira in parallelo alle stats già presenti in `Index.tsx`, cache 10min. Nel frattempo fallback curato.
