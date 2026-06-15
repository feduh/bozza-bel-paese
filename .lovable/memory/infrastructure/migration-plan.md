---
name: Migration Plan to Independent Stack
description: End-of-project migration target — autonomous Supabase + Cloudflare R2 + Cloudflare Pages, zero recurring costs
type: feature
---

## Obiettivo finale
Indipendenza completa da Lovable a fine progetto, costi ricorrenti zero per 500-1000 utenti.

## Stack target post-migrazione
- **Database + Auth + Edge Functions**: Supabase free tier (account utente, non Lovable Cloud)
- **Storage immagini**: Cloudflare R2 (10 GB gratis, banda illimitata)
- **Frontend hosting**: Cloudflare Pages (gratis)
- **DNS/CDN**: Cloudflare

## Vincoli da rispettare durante lo sviluppo su Lovable
- Schema RLS deve restare standard Supabase (no funzioni Lovable-specific)
- Edge functions devono usare solo API Supabase standard + fetch verso connettori
- Evitare di accumulare troppi dati nello storage Lovable: migrazione immagini → R2 a fine progetto
- Tenere lo schema pulito e ben documentato per export SQL

## Tempistica stimata migrazione finale
3-4 giorni: export DB → import account Supabase utente, copia storage → R2, deploy Pages, switch DNS.

## Limiti free tier da monitorare a regime
- Supabase DB: 500 MB (sufficiente, immagini fuori)
- Supabase bandwidth: 5 GB/mese (sufficiente, immagini servite da R2)
- Supabase Edge Functions: 500k invocazioni/mese
- R2: 10 GB storage, banda illimitata
