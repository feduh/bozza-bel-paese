# Mappatura Realtà Artistiche Italiane

Piattaforma web per mappare, documentare e raccontare le realtà artistiche e culturali italiane: spazi con sede, collettivi nomadi e luoghi storici scomparsi. L'applicazione fornisce una mappa interattiva, schede di dettaglio, un blog editoriale e un'area amministrativa per la gestione collaborativa dei contenuti.

---

## Indice

- [Funzionalità](#funzionalità)
- [Stack tecnologico](#stack-tecnologico)
- [Architettura](#architettura)
- [Setup locale](#setup-locale)
- [Script disponibili](#script-disponibili)
- [Struttura del progetto](#struttura-del-progetto)
- [Database & API](#database--api)
- [Autenticazione & ruoli](#autenticazione--ruoli)
- [Edge Functions](#edge-functions)
- [Testing](#testing)
- [Convenzioni di sviluppo](#convenzioni-di-sviluppo)
- [Deploy](#deploy)

---

## Funzionalità

- 🗺️ **Mappa interattiva** delle realtà artistiche (Leaflet + OpenStreetMap) con lazy loading
- 🏛️ **Schede di dettaglio** per ogni realtà con storia, contatti, tag e collegamenti
- ✍️ **Blog editoriale** con articoli categorizzati
- 🔐 **Autenticazione email/password** tramite Lovable Cloud
- 👥 **Gestione collaboratori** con ruoli `admin`, `moderator`, `user`
- 🛡️ **RLS policies** per il controllo degli accessi a livello di riga
- ⚡ **Performance** ottimizzate: code splitting, lazy loading immagini e mappa

---

## Stack tecnologico

| Layer        | Tecnologia                                  |
|--------------|---------------------------------------------|
| Frontend     | React 18 + TypeScript + Vite 5              |
| Styling      | Tailwind CSS v3 + shadcn/ui                 |
| Routing      | React Router v6                             |
| State/Data   | TanStack Query                              |
| Mappe        | Leaflet + React-Leaflet (lazy loaded)       |
| Backend      | Lovable Cloud (Supabase: Postgres + Auth + Edge Functions) |
| Validazione  | Zod                                         |
| Testing      | Vitest + Testing Library + jsdom            |

---

## Architettura

```text
┌─────────────────────────────────────────────────────┐
│                  Browser (React SPA)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  Pages   │→ │  Hooks   │→ │ Supabase Client  │   │
│  │ (Routes) │  │ (useAuth)│  │  (@/integrations)│   │
│  └──────────┘  └──────────┘  └────────┬─────────┘   │
└──────────────────────────────────────────┼──────────┘
                                           │ HTTPS
                            ┌──────────────▼──────────────┐
                            │       Lovable Cloud         │
                            │  ┌───────────────────────┐  │
                            │  │ PostgreSQL + RLS      │  │
                            │  │ - realities           │  │
                            │  │ - reality_tags        │  │
                            │  │ - profiles            │  │
                            │  │ - user_roles          │  │
                            │  │ - blog_posts          │  │
                            │  └───────────────────────┘  │
                            │  ┌───────────────────────┐  │
                            │  │ Auth (email/password) │  │
                            │  └───────────────────────┘  │
                            │  ┌───────────────────────┐  │
                            │  │ Edge Functions (Deno) │  │
                            │  │ - invite-collaborator │  │
                            │  └───────────────────────┘  │
                            └─────────────────────────────┘
```

**Principi:**
- **SPA client-side**: tutta la logica di presentazione è React; il backend è esposto solo via Supabase SDK ed Edge Functions.
- **Sicurezza data-layer**: i ruoli sono in una tabella dedicata `user_roles` e validati lato DB tramite la funzione `has_role()` (SECURITY DEFINER) usata nelle policy RLS.
- **Separazione ambiente**: variabili pubbliche in `.env` (auto-generato), secrets server-side gestiti da Lovable Cloud.

---

## Setup locale

**Requisiti:** Node.js ≥ 20, npm (oppure bun).

```bash
git clone <REPO_URL>
cd <PROJECT>
npm install
npm run dev
```

Il server parte su `http://localhost:8080`.

> Il file `.env` con le chiavi pubbliche di Lovable Cloud è generato automaticamente e non va modificato manualmente.

---

## Script disponibili

| Comando            | Descrizione                                  |
|--------------------|----------------------------------------------|
| `npm run dev`      | Avvia Vite in modalità sviluppo (porta 8080) |
| `npm run build`    | Build di produzione in `dist/`               |
| `npm run preview`  | Serve la build di produzione localmente      |
| `npm run lint`     | Lint del codice con ESLint                   |
| `npx vitest run`   | Esegue la suite di test una volta            |
| `npx vitest`       | Test in watch mode                           |

---

## Struttura del progetto

```
src/
├── components/        # Componenti riutilizzabili (Navbar, Footer, LazyMap, ui/)
├── hooks/             # Custom hooks (useAuth, use-toast, use-mobile)
├── integrations/
│   └── supabase/      # Client e tipi auto-generati (NON modificare)
├── pages/             # Route principali (Index, Mappatura, Admin, Login, ...)
├── data/              # Mock data e costanti
├── lib/               # Utility (cn, helpers)
├── test/              # Setup Vitest
└── index.css          # Design tokens (HSL semantic colors)

supabase/
├── config.toml        # Config Edge Functions
└── functions/
    └── invite-collaborator/index.ts
```

---

## Database & API

L'accesso ai dati avviene **esclusivamente** via `supabase` client:

```ts
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase
  .from("realities")
  .select("*, reality_tags(tag)")
  .order("name");
```

### Tabelle principali

| Tabella         | Scopo                                              |
|-----------------|----------------------------------------------------|
| `realities`     | Realtà artistiche (nome, città, lat/lng, tipo, storia) |
| `reality_tags`  | Tag associati (relazione N:1 con `realities`)      |
| `blog_posts`    | Articoli del blog                                  |
| `profiles`      | Dati pubblici utente (display_name, bio, social)   |
| `user_roles`    | Ruoli (`admin` \| `moderator` \| `user`)           |

### Enums

- `reality_type`: `nomade` | `con-sede` | `scomparsa`
- `app_role`: `admin` | `moderator` | `user`

### Funzioni DB

- `has_role(_user_id uuid, _role app_role) → boolean` — usata nelle RLS policy.

---

## Autenticazione & ruoli

L'autenticazione usa email/password. La sessione è esposta tramite il context `useAuth`:

```tsx
import { useAuth } from "@/hooks/useAuth";

const { user, session, loading, signIn, signUp, signOut } = useAuth();
```

**Controllo ruoli (lato client, solo per UX):**

```ts
const { data: isAdmin } = await supabase.rpc("has_role", {
  _user_id: user.id,
  _role: "admin",
});
```

> Il controllo autorizzativo reale è applicato dalle policy RLS lato database e dalle Edge Functions.

---

## Edge Functions

### `invite-collaborator`

Permette a un admin di creare un nuovo utente con ruolo assegnato.

**Endpoint:** `POST {SUPABASE_URL}/functions/v1/invite-collaborator`

**Headers:** `Authorization: Bearer <user_jwt>`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Passw0rd!",
  "display_name": "Nome Utente",
  "role": "moderator"
}
```

**Validazioni (Zod):**
- email valida, max 255 caratteri
- password 8–72 caratteri, almeno 1 maiuscola e 1 numero
- display_name 2–100 caratteri
- role: `user` | `moderator`

**Sicurezza:**
- Verifica JWT chiamante e ruolo `admin` via `has_role`
- Rate limiting in-memory: 5 richieste/minuto per admin
- Service role key usata solo server-side

**Risposte:**
- `200` `{ success, user, message }`
- `400` errori di validazione | `401` non autenticato | `403` non admin | `429` rate limit

---

## Testing

Suite con **Vitest + Testing Library**:

```bash
npx vitest run
```

Copertura attuale:
- `useAuth` (gestione sessione, signIn/signUp/signOut, cleanup)
- `Login` (form, errori, navigazione)
- `Admin` (permessi, caricamento collaboratori)
- `Navbar` (link, stato auth)

**Pattern di mock:** il client Supabase è mockato per isolare i componenti (vedi `src/test/setup.ts` e i singoli `__tests__/`).

---

## Convenzioni di sviluppo

- **Design system**: usa SOLO i token semantici definiti in `src/index.css` e `tailwind.config.ts`. Niente colori hardcoded (`text-white`, `bg-black`).
- **Componenti shadcn**: estendi tramite varianti (`cva`), non duplicare.
- **Tipi DB**: importa da `@/integrations/supabase/types` — il file è auto-generato.
- **Path alias**: usa `@/` per `src/`.
- **Validazione input**: Zod per Edge Functions e form critici.
- **Lazy loading**: componenti pesanti (es. mappa) caricati con `React.lazy()` + `Suspense`.

---

## Deploy

Il deploy è gestito da Lovable: apri il progetto su [lovable.dev](https://lovable.dev) e clicca **Share → Publish**.

Per un dominio personalizzato: **Project → Settings → Domains → Connect Domain**.

---

## Licenza

Progetto privato. Tutti i diritti riservati.
