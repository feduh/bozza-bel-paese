## 1) Rimozione completa supporto EN

Frontend:
- Disinstallo `i18next`, `react-i18next`, `i18next-browser-languagedetector` e cancello `src/i18n/` + `src/components/LanguageSwitcher.tsx` + `src/lib/localized.ts`.
- Sostituisco tutti gli `useTranslation()` / `t("...")` con stringhe italiane statiche (le chiavi sono già definite in `src/i18n/locales/it.json`, le inlinerò). File toccati: `Navbar`, `Footer`, tutte le pagine `src/pages/*`, componenti che usano `t(...)`.
- In `Navbar` rimuovo l'import e l'uso di `LanguageSwitcher` (sia desktop sia mobile).
- Rimuovo i fallback `isEn && rr.name_en ? rr.name_en : rr.name` in Mappatura, RealityDetail, Blog, MagazinePost, AutoreProfilo, ecc. → uso solo i campi IT.
- Pulisco `index.html` (lang="it" fisso, niente alternate).

Backend:
- Elimino l'edge function `auto-translate` (`supabase/functions/auto-translate/`) e ogni invocazione (`ArticoloEditor`, `RealityForm`, trigger SQL se presenti).
- Migration SQL: drop colonne `*_en` e `translated_at` su `blog_posts` e `realities`; drop funzione `apply_translation` se non più usata.

Docs:
- Aggiorno `.lovable/memory/index.md`, `design/visual-identity.md`, `infrastructure/migration-plan.md`, e i due documenti tecnici (`ILBELPAESE_documentazione_tecnica.md`, `ILBELPAESE_relazione_progetto.md` in `/mnt/documents/`) rimuovendo ogni riferimento a i18n/EN.

## 2) Mappa — fix visivi

In `src/components/LazyMap.tsx`:
- Sostituisco il basemap CARTO `dark_nolabels` + `dark_only_labels` con la versione chiara `light_all` (singolo layer, etichette già incluse e nitide).
- Rimuovo overlay `ibp-map-scanlines`, `ibp-map-vignette` e l'eventuale glow CSS sui marker per togliere la sfocatura percepita sui label.
- HUD label cambia colore per leggibilità su sfondo chiaro (testo scuro, bordo sottile).

In `src/lib/realityCategory.ts` (o dove sono definiti `categoryConfig`):
- "Spazi che furono" si suddivide in due varianti basate sul tipo origine: ex-Spazi → marker viola con outline (verde acqua only when origin = nomadi). Mantengo i colori brand: viola `#8B5CFF` per ex-spazi, teal `#34D2BE` per ex-nomadi.
- Aggiorno la legenda nella pagina Mappatura per riflettere le due varianti.

## 3) Coerenza tipografica (Mappatura, Magazine, altre)

Allineo le stesse regole già applicate a "La nostra rete":
- Rimuovo `uppercase` da: nomi card, titoli scheda realtà, titoli articoli magazine, titoli sezioni interne. Maiuscolo resta solo su micro-label (`.micro-label`), badge di stato, pulsanti `btn-brutalist`, voci navbar.
- Verifico `Blog.tsx`, `MagazinePost.tsx`, `RealityDetail.tsx`, `LaVostraVoce.tsx`, `Contatti.tsx`, `CosaFacciamo.tsx`: stesso pattern brutalist (border 2px, ombra hard, micro-label numerati senza `§`, niente capslock sui titoli editoriali, intro giustificate con `.prose-justify`).

## 4) Memoria progetto

Aggiorno `mem://index.md`: rimuovo riga "Multilingua IT/EN" (se presente), aggiungo Core rule: "Sito monolingua italiano. Capslock SOLO su micro-label, badge, bottoni e navbar — mai su titoli editoriali o nomi propri."

## Note tecniche
- Le colonne `*_en` esistenti contengono dati: la migration sarà distruttiva. Confermo l'eliminazione perché il valore non è recuperabile dal browser (vale solo il testo IT, che resta intatto).
- L'edge function `auto-translate` viene eliminata via `supabase--delete_edge_functions`.
- Il Language detector salva in `localStorage` la chiave `ibp-lang`: lascio un cleanup soft (no-op) o ignoro (verrà semplicemente non letta).

Procedo?