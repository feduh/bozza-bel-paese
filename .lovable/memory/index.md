# Project Memory

## Core
"Il Bel Paese": mapped artistic realities. Currently on Lovable Cloud (Supabase) + Lovable hosting; migration target = Supabase self-hosted + Cloudflare R2 + Cloudflare Pages at project end.
Visual identity: Editorial Brutalist. Palette avorio/ink/viola/acqua only (no gold/teal/lavender). Stack Sans Notch ONLY (no serifs, no Playfair). --radius: 0, brutalist borders + offset shadows.
Error messages in Italian.
Strictly private access, invite-only via admin. Roles: admin, moderator, collaborator, author.
Public map shows only confirmed_status='confermato' realities. Pending auto-publish after 24h via pg_cron.
React 18 with locked Leaflet versions. Deduplicate react in Vite.
Mobile performance: lazy load map components and images.

## Memories
- [Visual Identity](mem://design/visual-identity) — Editorial Brutalist palette, Stack Sans Notch font asset, utility classes, home composition reference
- [Migration Plan](mem://infrastructure/migration-plan) — End-of-project migration to Supabase self-hosted + Cloudflare R2 + Pages
- [Project Identity](mem://project/identity) — Mission and concept (separate from visual identity)
- [Mapping System](mem://features/mapping) — Core mapping functionality and artistic reality data structure
- [Authentication & Roles](mem://auth/permissions) — Roles, invite-only flow, 24h moderation pipeline
- [Deployment Architecture](mem://infrastructure/deployment) — Current frontend and backend deployment
- [React Leaflet Constraints](mem://constraints/technical-compatibility) — Version locks and performance requirements
