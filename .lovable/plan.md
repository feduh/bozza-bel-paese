## Obiettivo
1. Far funzionare l'apertura del menu dell'area personale sui tablet (768–1023px).
2. Rendere visivamente distinguibile il trigger dell'area personale dall'hamburger globale della navbar.

## Analisi del bug
- `useIsMobile` (`src/hooks/use-mobile.tsx`) usa breakpoint `< 768px`. A partire da 768px `isMobile=false`, quindi `toggleSidebar` non apre lo `Sheet` mobile ma agisce sulla sidebar desktop.
- In `src/pages/AreaPersonale.tsx` il `SidebarTrigger` ha `className="md:hidden"`, quindi da 768px in su il pulsante scompare del tutto. Risultato: su tablet non c'è modo di aprire il menu.
- Il trigger usa `<PanelLeft />`, un'icona simile all'hamburger globale → nessuna distinzione visiva.

## Modifiche

### 1. `src/pages/AreaPersonale.tsx`
- Cambiare la classe del `SidebarTrigger` da `md:hidden` a `lg:hidden` così resta visibile su mobile e tablet.
- Nascondere `AreaSidebar` (desktop) fino a `lg`: rendere il contenitore `hidden lg:block` (o equivalente). Su tablet il menu verrà mostrato solo tramite `Sheet`.
- Stilizzare il pulsante trigger come pill riconoscibile: bordo/background `bg-sidebar-accent`, padding aumentato, gap con label testuale "Menu area" accanto all'icona.

### 2. `src/components/area/AreaSidebar.tsx` (o override locale nel trigger in AreaPersonale)
- Sostituire l'icona di default del `SidebarTrigger`: passare children personalizzati (es. `<LayoutDashboard />` + testo "Menu area") invece di affidarsi al `PanelLeft` di default. Se `SidebarTrigger` non accetta children, wrappare in un `Button` custom che invoca `useSidebar().toggleSidebar()`.

### 3. Breakpoint sidebar Sheet
- Approccio scelto: **non** modificare `useIsMobile` globale (usato altrove). In `src/components/ui/sidebar.tsx` la logica `if (isMobile)` renderizza lo `Sheet`. Per estenderla ai tablet nell'area personale senza toccare l'hook globale, opzioni valutate durante l'implementazione:
  - (a) Portare il breakpoint a 1024 solo se una verifica rapida degli altri usi non evidenzia regressioni;
  - (b) In alternativa, forzare l'apertura via `openMobile` controllato dal componente di pagina, oppure introdurre un secondo hook `useIsBelowLg` usato dal solo layout area personale.
- La scelta finale sarà (b) se (a) rischia regressioni; verrà decisa leggendo gli usi di `useIsMobile` prima di scrivere la modifica.

## Cosa NON tocco
- Navbar globale del sito, `DroneHero.tsx`, `ROTATING_WORDS`, footer.
- Comportamento desktop (≥1024px): resta invariato con sidebar fissa laterale.

## Verifica
- Preview a 768px e 1024px: il pulsante "Menu area" è visibile su tablet, apre lo `Sheet` correttamente e si chiude cliccando fuori.
- Icona + label chiaramente distinta dall'hamburger della navbar globale.
