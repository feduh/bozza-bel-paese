## Batch 2 — Account & Sicurezza

Due aree distinte, entrambe necessarie per chiudere il loop di gestione account.

---

### 1. Gestione utenti esistenti (pannello Admin)

Oggi `/admin` permette solo di **creare** collaboratori. Aggiungo un pannello completo per gestire quelli esistenti.

**Nuovo componente `UsersManagementPanel.tsx`** dentro `src/components/admin/`:

- **Lista utenti** unisce `profiles` + `user_roles` + email da `auth.users` (recuperata via edge function con service role)
- **Per ogni utente**:
  - Avatar / nome / email / data creazione
  - Badge ruoli correnti (admin / moderator / collaborator / author)
  - Tipo (membro/autore), realtà o affiliazione
- **Azioni**:
  - **Cambia ruolo**: aggiungi/rimuovi `admin`, `moderator`, `collaborator`, `author` (toggle multipli — un utente può avere più ruoli)
  - **Reset password**: l'admin imposta una nuova password temporanea per quell'utente
  - **Sospendi / Riattiva account**: usa `auth.users.banned_until` (sospensione = banned_until = '2099-…', riattivazione = null)
  - **Elimina account**: cancella `auth.user` + cascata su profiles/roles (con conferma dialog)
- **Filtri**: per ruolo, per realtà, ricerca testuale su nome/email
- **Self-protection**: un admin non può togliersi il ruolo admin né eliminarsi (evita lockout)

**Nuova edge function `manage-user`** (`supabase/functions/manage-user/index.ts`):
- Operazioni: `list_users`, `update_roles`, `reset_password`, `set_banned`, `delete_user`
- Usa `SUPABASE_SERVICE_ROLE_KEY` per accedere a `auth.admin.*`
- Verifica nel codice che il caller sia admin (via JWT + `has_role`)
- Logga ogni azione in `admin_audit_log` (già esistente)

---

### 2. Reset password autonomo

Per utenti che hanno perso la password — flow completo email-based.

**Pagine nuove:**
- `/password-dimenticata` (`PasswordDimenticata.tsx`): form email → `supabase.auth.resetPasswordForEmail()` con `redirectTo: /reset-password`
- `/reset-password` (`ResetPassword.tsx`): form nuova password + conferma; valida sessione di recovery e chiama `supabase.auth.updateUser({ password })`

**Regole password** (validate sia client che server tramite HIBP già attivo):
- Minimo 10 caratteri
- Almeno 1 maiuscola, 1 minuscola, 1 numero, 1 simbolo
- Non compromessa (HIBP, già attivo nella migration precedente)
- Indicatore di forza visivo durante la digitazione

**Modifiche a `Login.tsx`:**
- Link "Password dimenticata?" sotto il form

---

### Cosa NON includo in questo batch

- Sincronizzazione `author_name` negli articoli al cambio nome profilo (sposto al batch successivo perché impatta sul layout articolo)
- Notifiche email transazionali (verranno con il batch Newsletter)
- "Magic link" come alternativa alla password (richiede setup SMTP)

---

### File toccati

**Nuovi:**
- `src/components/admin/UsersManagementPanel.tsx`
- `src/pages/PasswordDimenticata.tsx`
- `src/pages/ResetPassword.tsx`
- `supabase/functions/manage-user/index.ts`
- Migration: validation triggers su operazioni audit, eventuale view `auth_users_view` se serve

**Modificati:**
- `src/pages/Admin.tsx` (aggiunge il nuovo pannello)
- `src/pages/Login.tsx` (link recupero)
- `src/App.tsx` (nuove route)
- `src/lib/validation.ts` (regole password)

---

### Domanda per te prima di partire

1. **Eliminazione account**: la voglio "hard delete" (utente + profilo + articoli vanno via) o "soft" (anonimizza profilo, mantiene articoli con autore "Utente rimosso")? Per un magazine consiglierei **soft** così la cronologia editoriale resta integra.

2. **Reset password da admin**: l'admin sceglie lui la nuova password e la comunica all'utente (come ora per la creazione), o l'admin scatena solo un'email di recovery all'utente?
