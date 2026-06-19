# Piano correzioni — Il Bel Paese

Prima di iniziare voglio condividere come ho prioritizzato le 12 richieste e procedere a blocchi, così puoi confermare/riordinare.

## Criteri di priorità

1. **Bloccanti funzionali** (l'utente non riesce a fare cose oggi)
2. **Sicurezza / dati** (validazioni, campi obbligatori)
3. **UX visivo** (leggibilità, etichette, font)
4. **Nice-to-have** (export logs, crediti)

---

# DA SALTARE PER ORA: BLOCCO 1 — Bloccanti funzionali (prioritario)

**1.1 Email automatica al nuovo membro invitato**
Quando admin/coordinatore invita un membro, oggi viene creato l'utente con password ma non riceve nessuna mail con istruzioni di accesso. Soluzione: scaffold email transazionale Lovable + invio mail `member-welcome` con email, password temporanea, link login e invito a cambiarla. Richiede setup infrastruttura email (dominio + queue). Ti chiederò conferma del dominio mittente.

**1.2 Upload immagini rotto (avatar profilo + galleria realtà)**
Da investigare: probabilmente policy storage o bucket. Verificherò bucket `avatars` e `reality-images`, RLS, e il codice di upload. Fix mirato.

**1.3 Modifica realtà esistenti da area personale (coord/admin)**
Aggiungere nella tab "Realtà" la lista delle realtà che il coordinatore può modificare (le sue + quelle della propria reality region), con pulsante "Modifica" che apre RealityForm in modalità edit. Aggiungere filtri base (stato: pendente/confermato/storico; ricerca per nome).

---

## BLOCCO 2 — Campi obbligatori & visibilità

**2.1 Campi obbligatori nelle bio**
Rendere obbligatori in `PanelProfilo` e in `InviteMemberForm`:

- `public_email`
- `figure_category`
- `role_collective` (solo per coordinatori)
Validazione client (zod) + validazione edge function.

**2.2 Nascondere "categoria figura" dal profilo pubblico**
In `AutoreProfilo.tsx` rimuovere il rendering di `figure_category`. Resta nel DB e nei filtri di ricerca de "La nostra rete".

---

## BLOCCO 3 — UX / visuale

**3.1 Etichetta stato pubblicazione sopra cover articoli**
In `PanelArticoli` sostituire il badge "liquid glass" con un badge a sfondo pieno semantico (es. verde=published, ambra=pending, blu=scheduled, grigio=draft), con buon contrasto sopra qualunque cover.

**3.2 Font del corpo testi e degli input**
Il font display attuale (Playfair-like complesso) viene usato anche nel body e negli input. Mantengo il display per H1-H3, e uso un sans-serif Google semplice (proposta: **Inter** o **DM Sans**) per body, H4-H6, label, input, textarea. Aggiorno `tailwind.config.ts`, `index.css` e l'import font in `index.html`.

**3.3 Giustifica i testi**
Applicare `text-align: justify` + `hyphens: auto` + `text-wrap: pretty` ai blocchi di prosa lunghi (articoli, descrizioni realtà, sezioni "Cosa facciamo", "La nostra rete"). NON ai titoli, label, navigation, card brevi (lì peggiora). Aggiungo una utility `.prose-justify` e la applico ai punti giusti.

---

## BLOCCO 4 — Admin

**4.1 Gestione utenti: ordine alfabetico di default + filtro "Recenti"**

- Default order: `display_name ASC`
- Toggle ordinamento: "Alfabetico" / "Più recenti"
- Rimuovere sezione "Ultimi membri" se presente
- Per "Più recenti" uso `profiles.created_at` (verifico esista; se manca o è disallineato con `auth.users.created_at`, propongo migration per popolarlo da `auth.users`).

**4.2 Export logs (admin audit log)**
Pulsante "Scarica CSV" in `AuditLogPanel` che esporta `admin_audit_log` filtrato. Lato pratico è utile per audit/compliance — lo implemento.

---

## BLOCCO 5 — Crediti

**5.1 Crediti a Federica Gaglianone + Lovable**
Aggiungo nel `Footer.tsx` una riga: "Sito realizzato da Federica Gaglianone con Lovable" (link a lovable.dev). Confermami se vuoi anche un link al profilo/sito di Federica.

---

## Domande di conferma prima di partire

1. **Email mittente**: per le mail di benvenuto serve un dominio email verificato. Vuoi usare il dominio attuale del sito o un dominio dedicato? (Se non hai preferenze, configuro Lovable Emails con un sottodominio del tuo dominio pubblicato.)
2. **Font body**: preferenza tra **Inter** (neutro, modernissimo) o **DM Sans** (più caldo, geometrico)?
3. **Crediti Federica**: solo testo nel footer o anche link? Quale URL?
4. **Ordine di esecuzione**: confermi BLOCCO 1 → 2 → 3 → 4 → 5, oppure vuoi anticipare qualcosa (es. font + giustificazione subito perché impatta tutto)?

Appena confermi, parto dal BLOCCO 1.