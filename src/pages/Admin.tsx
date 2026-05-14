import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { UserPlus, Users, Shield, Eye, EyeOff, MapPinPlus } from "lucide-react";
import RealityForm from "@/components/RealityForm";
import FieldError from "@/components/FieldError";
import AuditLogPanel from "@/components/admin/AuditLogPanel";
import { inviteSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  website: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  created_at: string;
};

type RealityRef = { id: string; name: string; city: string };

const Admin = () => {
  const { t } = useTranslation();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [realities, setRealities] = useState<RealityRef[]>([]);

  // Invite form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"author" | "moderator">("author");
  const [authorType, setAuthorType] = useState<"reality" | "external" | "none">("reality");
  const [realityId, setRealityId] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errs, setErrs] = useState<FieldErrors>({});

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setProfiles((data as Profile[]) ?? []);
    setLoadingProfiles(false);
  };

  const fetchRealities = async () => {
    const { data } = await supabase
      .from("realities")
      .select("id, name, city")
      .order("name", { ascending: true });
    setRealities((data as RealityRef[]) ?? []);
  };

  useEffect(() => {
    fetchProfiles();
    fetchRealities();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setErrs({});

    const parsed = inviteSchema(t).safeParse({
      displayName,
      email,
      password,
      role,
      authorType: role === "author" ? authorType : undefined,
      realityId: role === "author" && authorType === "reality" ? realityId : undefined,
      affiliation: role === "author" && authorType === "external" ? affiliation : undefined,
    });
    if (!parsed.success) {
      setErrs(fieldErrors(parsed.error));
      setError(t("validation.fixErrors"));
      return;
    }

    setSubmitting(true);
    const { data, error: fnError } = await supabase.functions.invoke("invite-collaborator", {
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        display_name: parsed.data.displayName,
        role: parsed.data.role,
        reality_id: parsed.data.realityId ?? null,
        affiliation: parsed.data.affiliation ?? null,
      },
    });

    if (fnError) {
      setError(fnError.message);
    } else if (data?.error) {
      setError(data.error);
    } else {
      setMessage(`✅ ${data.message ?? "Account creato"}. Credenziali: ${parsed.data.email} / ${parsed.data.password}`);
      setEmail("");
      setPassword("");
      setDisplayName("");
      setRole("author");
      setAuthorType("reality");
      setRealityId("");
      setAffiliation("");
      fetchProfiles();
    }
    setSubmitting(false);
  };

  return (
    <div className="py-20">
      <div className="editorial-container max-w-4xl">
        <h1 className="editorial-heading mb-4">
          <span className="italic text-primary">Pannello Admin</span>
        </h1>
        <p className="editorial-body text-muted-foreground mb-12">
          Gestisci i collaboratori del blog e del sito.
        </p>

        {/* Invite form */}
        <div className="p-8 rounded-lg bg-card border border-border mb-12">
          <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
            <UserPlus size={20} /> Invita collaboratore
          </h2>
          <form onSubmit={handleInvite} noValidate className="space-y-4">
            {error && (
              <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body">{error}</div>
            )}
            {message && (
              <div role="status" className="p-4 rounded-md bg-secondary/10 text-foreground text-sm font-body border border-secondary/20">{message}</div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body font-medium mb-2" htmlFor="inv-name">Nome visualizzato *</label>
                <input
                  id="inv-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Mario Rossi"
                  aria-invalid={!!errs.displayName}
                  aria-describedby={errs.displayName ? "err-displayName" : undefined}
                  className={`w-full px-4 py-3 rounded-md border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errs.displayName ? "border-destructive" : "border-input"}`}
                />
                <FieldError id="err-displayName" message={errs.displayName} />
              </div>
              <div>
                <label className="block text-sm font-body font-medium mb-2" htmlFor="inv-email">Email *</label>
                <input
                  id="inv-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaboratore@esempio.it"
                  aria-invalid={!!errs.email}
                  aria-describedby={errs.email ? "err-email" : undefined}
                  className={`w-full px-4 py-3 rounded-md border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errs.email ? "border-destructive" : "border-input"}`}
                />
                <FieldError id="err-email" message={errs.email} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body font-medium mb-2" htmlFor="inv-pwd">Password *</label>
                <div className="relative">
                  <input
                    id="inv-pwd"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 8 caratteri"
                    aria-invalid={!!errs.password}
                    aria-describedby={errs.password ? "err-password" : undefined}
                    className={`w-full px-4 py-3 pr-12 rounded-md border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errs.password ? "border-destructive" : "border-input"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError id="err-password" message={errs.password} />
              </div>
              <div>
                <label className="block text-sm font-body font-medium mb-2">Ruolo</label>
                <select
                  value={role}
                  onChange={(e) => {
                    const v = e.target.value as "author" | "moderator";
                    setRole(v);
                    if (v !== "author") {
                      setRealityId("");
                      setAffiliation("");
                    }
                  }}
                  className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="author">Autore (scrive sul Magazine)</option>
                  <option value="moderator">Collaboratore (collettivo)</option>
                </select>
                <p className="text-xs text-muted-foreground font-body mt-1">
                  {role === "author"
                    ? "Può scrivere articoli (con moderazione) e gestire il proprio profilo."
                    : "Può editare la mappa, pubblicare direttamente sul Magazine e moderare."}
                </p>
              </div>
            </div>
            {role === "author" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-body font-medium mb-2">Tipo di autore</label>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {([
                      { v: "reality", label: "Membro di una realtà" },
                      { v: "external", label: "Ricercatore / Istituzione" },
                      { v: "none", label: "Indipendente" },
                    ] as const).map((opt) => (
                      <label
                        key={opt.v}
                        className={`cursor-pointer text-xs font-body px-3 py-2 rounded-md border text-center transition-colors ${
                          authorType === opt.v
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="authorType"
                          value={opt.v}
                          checked={authorType === opt.v}
                          onChange={() => {
                            setAuthorType(opt.v);
                            if (opt.v !== "reality") setRealityId("");
                            if (opt.v !== "external") setAffiliation("");
                          }}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {authorType === "reality" && (
                  <div>
                    <label className="block text-sm font-body font-medium mb-2">Realtà di appartenenza *</label>
                    <select
                      value={realityId}
                      onChange={(e) => setRealityId(e.target.value)}
                      aria-invalid={!!errs.realityId}
                      className={`w-full px-4 py-3 rounded-md border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errs.realityId ? "border-destructive" : "border-input"}`}
                    >
                      <option value="">— Seleziona una realtà —</option>
                      {realities.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.city})
                        </option>
                      ))}
                    </select>
                    <FieldError id="err-realityId" message={errs.realityId} />
                  </div>
                )}

                {authorType === "external" && (
                  <div>
                    <label className="block text-sm font-body font-medium mb-2">Affiliazione *</label>
                    <input
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      placeholder="es. Università di Bologna, MAXXI, ricercatrice indipendente…"
                      maxLength={120}
                      aria-invalid={!!errs.affiliation}
                      className={`w-full px-4 py-3 rounded-md border bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring ${errs.affiliation ? "border-destructive" : "border-input"}`}
                    />
                    <FieldError id="err-affiliation" message={errs.affiliation} />
                  </div>
                )}

                {authorType === "none" && (
                  <p className="text-xs text-muted-foreground font-body italic">
                    L'autore potrà aggiungere o modificare la propria affiliazione dall'area personale.
                  </p>
                )}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Creazione..." : "Crea account"}
            </button>
          </form>
        </div>

        {/* Add reality */}
        <div className="p-8 rounded-lg bg-card border border-border mb-12">
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <MapPinPlus size={20} /> Aggiungi realtà
          </h2>
          <p className="text-sm text-muted-foreground font-body mb-6">
            CAP, regione e coordinate vengono ricavati automaticamente da indirizzo + città (geocodifica OpenStreetMap).
          </p>
          <RealityForm />
        </div>

        {/* Audit log */}
        <AuditLogPanel />

        {/* Collaborators list */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
            <Users size={20} /> Collaboratori
          </h2>
          {loadingProfiles ? (
            <div className="text-center py-8 text-muted-foreground font-body">Caricamento...</div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-body">
              Nessun collaboratore ancora. Usa il form sopra per invitarne uno.
            </div>
          ) : (
            <div className="grid gap-4">
              {profiles.map((profile) => (
                <div key={profile.id} className="flex items-center gap-4 p-5 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm">{profile.display_name}</p>
                    <p className="font-body text-xs text-muted-foreground truncate">{profile.bio || "Nessuna bio"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                    <Shield size={12} />
                    <span>{new Date(profile.created_at).toLocaleDateString("it-IT")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
