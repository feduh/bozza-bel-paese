import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff } from "lucide-react";
import { FIGURE_CATEGORIES, MEMBER_TYPES } from "@/lib/categories";
import FieldError from "@/components/FieldError";
import { inviteSchema, fieldErrors, type FieldErrors } from "@/lib/validation";

type RealityRef = { id: string; name: string; city: string };

type InviteRole = "author" | "coordinatore";

type Props = {
  /** Ruoli che il chiamante può assegnare. L'admin può entrambi, i coordinatori solo "author". */
  allowedRoles: InviteRole[];
};

const InviteMemberForm = ({ allowedRoles }: Props) => {
  const { t } = useTranslation();
  const [realities, setRealities] = useState<RealityRef[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<InviteRole>(allowedRoles[0] ?? "author");
  const [authorType, setAuthorType] = useState<"reality" | "external" | "none">("reality");
  const [realityId, setRealityId] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [memberType, setMemberType] = useState<"" | "coordinatore" | "autore">("");
  const [figureCategory, setFigureCategory] = useState("");
  const [roleRealLife, setRoleRealLife] = useState("");
  const [roleCollective, setRoleCollective] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errs, setErrs] = useState<FieldErrors>({});

  useEffect(() => {
    supabase
      .from("realities")
      .select("id, name, city")
      .order("name", { ascending: true })
      .then(({ data }) => setRealities((data as RealityRef[]) ?? []));
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
      memberType: role === "coordinatore" ? (memberType || undefined) : undefined,
      figureCategory: figureCategory || undefined,
      roleRealLife: roleRealLife || undefined,
      roleCollective: role === "coordinatore" ? (roleCollective || undefined) : undefined,
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
        member_type: parsed.data.memberType ?? null,
        figure_category: parsed.data.figureCategory ?? null,
        role_real_life: parsed.data.roleRealLife ?? null,
        role_collective: parsed.data.roleCollective ?? null,
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
      setRole(allowedRoles[0] ?? "author");
      setAuthorType("reality");
      setRealityId("");
      setAffiliation("");
      setMemberType("");
      setFigureCategory("");
      setRoleRealLife("");
      setRoleCollective("");
    }

    setSubmitting(false);
  };

  return (
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
            placeholder="autore@esempio.it"
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
          {allowedRoles.length > 1 ? (
            <select
              value={role}
              onChange={(e) => {
                const v = e.target.value as InviteRole;
                setRole(v);
                if (v !== "author") {
                  setRealityId("");
                  setAffiliation("");
                }
              }}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="author">Autore (scrive sul Magazine)</option>
              <option value="coordinatore">Coordinatore (collettivo)</option>
            </select>
          ) : (
            <div className="w-full px-4 py-3 rounded-md border border-input bg-muted/40 font-body text-sm text-muted-foreground">
              Autore (scrive sul Magazine)
            </div>
          )}
          <p className="text-xs text-muted-foreground font-body mt-1">
            {role === "author"
              ? "Può scrivere articoli (con moderazione) e gestire il proprio profilo."
              : "Può proporre realtà sulla mappa, pubblicare direttamente sul Magazine e moderare i contenuti degli autori."}
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

      <div className="pt-2 border-t border-border/60">
        <p className="text-xs text-muted-foreground font-body mb-3">
          Dati profilo (opzionali, modificabili poi dall'area personale).
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-body font-medium mb-2">Ruolo Lavorativo</label>
            <input
              value={roleRealLife}
              onChange={(e) => setRoleRealLife(e.target.value)}
              placeholder="es. curatrice indipendente"
              maxLength={120}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-body font-medium mb-2">Categoria figura</label>
            <select
              value={figureCategory}
              onChange={(e) => setFigureCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— non specificata —</option>
              {FIGURE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        {role === "coordinatore" && (
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-body font-medium mb-2">Tipo membro nel collettivo</label>
              <select
                value={memberType}
                onChange={(e) => setMemberType(e.target.value as typeof memberType)}
                className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— non specificato —</option>
                {MEMBER_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-body font-medium mb-2">Ruolo dentro il collettivo</label>
              <input
                value={roleCollective}
                onChange={(e) => setRoleCollective(e.target.value)}
                placeholder="es. coordinamento editoriale"
                maxLength={120}
                className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? "Creazione..." : "Crea account"}
      </button>
    </form>
  );
};

export default InviteMemberForm;
