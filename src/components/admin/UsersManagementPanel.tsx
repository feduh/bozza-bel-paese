import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, KeyRound, Ban, Trash2, RefreshCw, Search, Pencil } from "lucide-react";
import { PASSWORD_RULES, passwordSchema, passwordStrength } from "@/lib/passwordPolicy";

type AppRole = "admin" | "coordinatore" | "author";
const ALL_ROLES: AppRole[] = ["admin", "coordinatore", "author"];
const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Admin",
  coordinatore: "Coordinatore",
  author: "Autore",
};

type ManagedUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  profile: {
    display_name: string;
    avatar_url: string | null;
    member_type: string | null;
    reality_id: string | null;
    affiliation: string | null;
    public_email: string | null;
  } | null;
  roles: AppRole[];
};

const UsersManagementPanel = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [meId, setMeId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<AppRole | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // Reset password panel state (per user)
  const [pwd, setPwd] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id ?? null));
    void fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("manage-user", {
      body: { op: "list_users" },
    });
    setLoading(false);
    if (error) return setFeedback({ kind: "err", text: error.message });
    if (data?.error) return setFeedback({ kind: "err", text: data.error });
    setUsers(data?.users ?? []);
  };

  const call = async (body: Record<string, unknown>, successMsg: string) => {
    setBusyId((body.user_id as string) ?? "global");
    setFeedback(null);
    const { data, error } = await supabase.functions.invoke("manage-user", { body });
    setBusyId(null);
    if (error || data?.error) {
      setFeedback({ kind: "err", text: error?.message ?? data?.error });
      return false;
    }
    setFeedback({ kind: "ok", text: successMsg });
    await fetchUsers();
    return true;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && !u.roles.includes(roleFilter)) return false;
      if (!q) return true;
      return (
        u.email?.toLowerCase().includes(q) ||
        u.profile?.display_name?.toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const isBanned = (u: ManagedUser) =>
    !!u.banned_until && new Date(u.banned_until).getTime() > Date.now();

  const toggleRole = async (u: ManagedUser, role: AppRole) => {
    const next = u.roles.includes(role) ? u.roles.filter((r) => r !== role) : [...u.roles, role];
    await call(
      { op: "update_roles", user_id: u.id, roles: next },
      `Ruoli aggiornati per ${u.profile?.display_name ?? u.email}`,
    );
  };

  const resetPwd = async (u: ManagedUser) => {
    const parsed = passwordSchema.safeParse(pwd);
    if (!parsed.success) {
      setFeedback({ kind: "err", text: parsed.error.errors[0]?.message ?? "Password non valida" });
      return;
    }
    const ok = await call(
      { op: "reset_password", user_id: u.id, new_password: pwd },
      `Password aggiornata. Comunica all'utente: ${pwd}`,
    );
    if (ok) setPwd("");
  };

  const toggleBan = async (u: ManagedUser) => {
    await call(
      { op: "set_banned", user_id: u.id, banned: !isBanned(u) },
      isBanned(u) ? "Account riattivato" : "Account sospeso",
    );
  };

  const deleteUser = async (u: ManagedUser) => {
    if (!confirm(`Eliminare definitivamente ${u.profile?.display_name ?? u.email}?\nIl profilo verrà anonimizzato e l'utente non potrà più accedere. Gli articoli scritti restano nel magazine.`)) return;
    await call({ op: "delete_user", user_id: u.id }, "Account eliminato");
  };

  return (
    <div className="p-8 rounded-lg bg-card border border-border mb-12">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Users size={20} /> Gestione utenti
        </h2>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 text-sm font-body px-3 py-2 rounded-md border border-input hover:bg-muted"
        >
          <RefreshCw size={14} /> Aggiorna
        </button>
      </div>

      {feedback && (
        <div
          role={feedback.kind === "err" ? "alert" : "status"}
          className={`p-3 mb-4 rounded-md text-sm font-body ${
            feedback.kind === "err"
              ? "bg-destructive/10 text-destructive"
              : "bg-secondary/10 border border-secondary/20"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome o email…"
            className="w-full pl-9 pr-3 py-2 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as AppRole | "all")}
          className="px-3 py-2 rounded-md border border-input bg-background font-body text-sm"
        >
          <option value="all">Tutti i ruoli</option>
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground font-body">Caricamento…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground font-body">Nessun utente.</div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((u) => {
            const banned = isBanned(u);
            const self = u.id === meId;
            const open = openId === u.id;
            return (
              <div key={u.id} className="rounded-lg border border-border bg-background">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm overflow-hidden">
                    {u.profile?.avatar_url ? (
                      <img src={u.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      (u.profile?.display_name ?? u.email ?? "?").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-semibold text-sm truncate">
                        {u.profile?.display_name || "(senza nome)"}
                        {self && <span className="ml-2 text-[10px] uppercase tracking-wider text-primary">tu</span>}
                      </p>
                      {banned && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">sospeso</span>
                      )}
                    </div>
                    <p className="font-body text-xs text-muted-foreground truncate">{u.email}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {u.roles.length === 0 ? (
                        <span className="text-[11px] font-body text-muted-foreground italic">nessun ruolo</span>
                      ) : (
                        u.roles.map((r) => (
                          <span key={r} className="text-[11px] font-body px-2 py-0.5 rounded-full bg-muted">
                            {ROLE_LABEL[r]}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { setOpenId(open ? null : u.id); setPwd(""); }}
                    className="text-sm font-body px-3 py-2 rounded-md border border-input hover:bg-muted"
                  >
                    {open ? "Chiudi" : "Gestisci"}
                  </button>
                </div>

                {open && (
                  <div className="border-t border-border p-4 space-y-5 bg-muted/30">
                    {/* Ruoli */}
                    <div>
                      <h3 className="text-xs font-body font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Shield size={12} /> Ruoli
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {ALL_ROLES.map((r) => {
                          const active = u.roles.includes(r);
                          const lockSelf = self && r === "admin" && active;
                          return (
                            <button
                              key={r}
                              type="button"
                              disabled={busyId === u.id || lockSelf}
                              onClick={() => toggleRole(u, r)}
                              title={lockSelf ? "Non puoi rimuovere il tuo ruolo admin" : undefined}
                              className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${
                                active
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "border-input hover:border-primary/40"
                              } ${lockSelf ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                              {ROLE_LABEL[r]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reset password */}
                    <div>
                      <h3 className="text-xs font-body font-semibold uppercase tracking-wider mb-2 flex items-center gap-1">
                        <KeyRound size={12} /> Reimposta password
                      </h3>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={pwd}
                          onChange={(e) => setPwd(e.target.value)}
                          placeholder="Nuova password temporanea"
                          className="flex-1 px-3 py-2 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          type="button"
                          disabled={busyId === u.id || passwordStrength(pwd) < PASSWORD_RULES.length}
                          onClick={() => resetPwd(u)}
                          className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-body text-sm hover:opacity-90 disabled:opacity-50"
                        >
                          Aggiorna
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-body mt-1">
                        Min. 10 caratteri, 1 maiuscola, 1 minuscola, 1 numero, 1 simbolo. Comunica la password all'utente che potrà cambiarla dall'area personale.
                      </p>
                    </div>

                    {/* Azioni distruttive */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                      <button
                        type="button"
                        disabled={busyId === u.id || self}
                        onClick={() => toggleBan(u)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input font-body text-sm hover:bg-muted disabled:opacity-50"
                      >
                        <Ban size={14} /> {banned ? "Riattiva account" : "Sospendi account"}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === u.id || self}
                        onClick={() => deleteUser(u)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-destructive/40 text-destructive font-body text-sm hover:bg-destructive/10 disabled:opacity-50"
                      >
                        <Trash2 size={14} /> Elimina account
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UsersManagementPanel;
