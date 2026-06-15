---
name: Visual Identity — Editorial Brutalist
description: Locked palette, typography, font asset, component patterns for Il Bel Paese restyle
type: design
---
# Editorial Brutalist (v2) — locked

## Palette (HSL tokens in src/index.css)
- Avorio  #F4EFE6  → --background (light)
- Ink     #0E0B14  → --foreground (light) / --background (dark)
- Bianco  #FFFFFF  → --card (light)
- Viola deep     #5B2BD9 → --primary (light)
- Viola electric #8B5CFF → --primary (dark)
- Acqua saturo   #2FD4C4 → --secondary + --accent (both modes)

Only accent color beyond purple/B&W is acqua #2FD4C4 (user-chosen "saturo pop"). NEVER reintroduce gold/teal/lavender from old palette.

## Typography
- Stack Sans Notch (variable woff2, weights 200–700) used EVERYWHERE: display, body, UI, micro-labels.
- Asset CDN: /__l5e/assets-v1/a5728466-7662-4fe2-8669-5267dda0698a/StackSansNotch-Variable.woff2
- Pointer: src/assets/fonts/StackSansNotch-Variable.woff2.asset.json
- @font-face declared in src/index.css. Tailwind families font-display/body/mono/notch all map to Stack.
- Headings uppercase, letter-spacing -0.02em, wght 700 via font-variation-settings.
- Micro-UI tags: uppercase tracking-[0.2em] wght 700 — use .micro-label utility.
- NEVER use Playfair Display, Source Sans, or any serif. Pensioned.

## Style rules
- --radius: 0 (no rounded corners). Brutalist 2px borders, hard offset shadows (no blur).
- Utility classes in src/index.css: .brutalist-border, .brutalist-card, .btn-brutalist, .btn-brutalist-outline, .ink-highlight, .micro-label, .editorial-heading/subheading/body.
- Shadows: shadow-brutalist (4px 4px 0 ink), shadow-brutalist-lg, shadow-brutalist-aqua (hover state).
- Cards on hover: translate(-2px, -2px) + shadow swaps to acqua.

## Home composition (Index.tsx — v2 reference)
Hero asymmetric grid 7/5: left = micro-tag badge, huge uppercase H1 with primary-colored mid-word + acqua highlight on last word, lead, 2 CTAs (brutalist filled + outline). Right = bordered black image box with scanline overlay and acqua badge floating corner.
Features = 3 cards, middle inverted (viola fill).
Stats = border-y-2 strip, mono numerals.
Footer wordmark strip ILBELPAESE / metadata.

## Not yet restyled (to do in later passes)
Mappatura, LaRete, Magazine, Blog, AreaPersonale, Admin, Login, RealityDetail, etc. They inherit new tokens/font automatically but need explicit brutalist treatment per page.
