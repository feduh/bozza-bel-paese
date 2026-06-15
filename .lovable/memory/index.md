# Project Memory

## Core
"Il Bel Paese": mapped artistic realities on Supabase & Vercel.
Vibrant palette (purple, teal, gold). Playfair Display. Error messages in Italian.
Strictly private access, invite-only via admin. Roles: admin, moderator, collaborator, author.
Public map shows only confirmed_status='confermato' realities. Pending realities auto-publish after 24h via pg_cron.
React 18 with locked Leaflet versions. Deduplicate react in Vite.
Mobile performance: lazy load map components and images.
Target finale: migrazione a Supabase autonomo + Cloudflare R2 + Pages a fine progetto. Mantenere schema RLS standard, evitare lock-in Lovable-specific.

## Memories
- [Project Identity](mem://project/identity) — Visual identity and typography for 'Il Bel Paese'
- [Mapping System](mem://features/mapping) — Core mapping functionality and artistic reality data structure
- [Authentication & Roles](mem://auth/permissions) — Roles (admin/moderator/collaborator/author), invite-only flow, and 24h reality moderation pipeline
- [Deployment Architecture](mem://infrastructure/deployment) — Frontend and backend deployment specifics
- [React Leaflet Constraints](mem://constraints/technical-compatibility) — Version locks and performance requirements for mapping components
- [Migration Plan](mem://infrastructure/migration-plan) — End-of-project migration to autonomous Supabase + Cloudflare R2 + Pages for zero recurring costs
