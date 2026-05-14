import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Loader2, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { realitySchema, fieldErrors, type FieldErrors } from "@/lib/validation";
import FieldError from "@/components/FieldError";

type RealityType = "con-sede" | "nomade" | "scomparsa";
type ConfirmedStatus = "pendente" | "confermato" | "storico";

const inputCls =
  "w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const inputErrCls = "border-destructive focus:ring-destructive";

type FormMode = "admin" | "collaborator";

const RealityForm = ({ onCreated, mode = "admin" }: { onCreated?: () => void; mode?: FormMode }) => {
  const { t } = useTranslation();
  const isCollaborator = mode === "collaborator";

  const [name, setName] = useState("");
  const [type, setType] = useState<RealityType>("con-sede");
  const [country, setCountry] = useState("Italia");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [region, setRegion] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [yearFounded, setYearFounded] = useState<string>("");
  const [yearClosed, setYearClosed] = useState<string>("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [history, setHistory] = useState("");
  const [ig, setIg] = useState("");
  const [fb, setFb] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [confirmedStatus, setConfirmedStatus] = useState<ConfirmedStatus>("pendente");

  const [geocoding, setGeocoding] = useState(false);
  const [geocoded, setGeocoded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errs, setErrs] = useState<FieldErrors>({});

  const cls = (k: string) => `${inputCls} ${errs[k] ? inputErrCls : ""}`;
  const aria = (k: string) =>
    errs[k] ? { "aria-invalid": true as const, "aria-describedby": `err-${k}` } : {};

  const runGeocode = async () => {
    if (!address || !city) return;
    setGeocoding(true);
    setGeocoded(false);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("geocode-address", {
        body: { address, city, country },
      });
      if (fnError || data?.error) {
        setError(data?.error || fnError?.message || "Geocodifica fallita");
        return;
      }
      if (data.zip_code) setZipCode(data.zip_code);
      if (data.region) setRegion(data.region);
      setLat(String(data.lat));
      setLng(String(data.lng));
      setGeocoded(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrs({});

    const parsed = realitySchema(t).safeParse({
      name, type, country, city, address, zipCode, region,
      lat, lng, yearFounded, yearClosed, website, contactEmail,
      description, history, ig, fb, linkedin, confirmedStatus,
    });

    if (!parsed.success) {
      setErrs(fieldErrors(parsed.error));
      setError(t("validation.fixErrors"));
      return;
    }

    setSubmitting(true);
    const v = parsed.data;
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveStatus = isCollaborator ? "pendente" : v.confirmedStatus;
    const autoConfirmAt = isCollaborator
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : null;
    const { error: insertError } = await supabase.from("realities").insert({
      name: v.name,
      type: v.type,
      country: v.country,
      city: v.city,
      address: v.address,
      zip_code: v.zipCode || null,
      region: v.region ?? "",
      lat: v.lat,
      lng: v.lng,
      year_founded: v.yearFounded,
      year_closed: v.yearClosed ?? null,
      website: v.website ?? null,
      contact_email: v.contactEmail ?? null,
      description: v.description ?? "",
      history: v.history ?? "",
      ig_link: v.ig ?? null,
      fb_link: v.fb ?? null,
      linkedin_link: v.linkedin ?? null,
      confirmed_status: effectiveStatus,
      status: effectiveStatus === "storico" ? "archiviato" : "attivo",
      created_by: user?.id ?? null,
      auto_confirm_at: autoConfirmAt,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(`✅ Realtà "${v.name}" salvata.`);
      setName(""); setAddress(""); setCity(""); setZipCode(""); setRegion("");
      setLat(""); setLng(""); setYearFounded(""); setYearClosed("");
      setWebsite(""); setContactEmail(""); setDescription(""); setHistory("");
      setIg(""); setFb(""); setLinkedin(""); setGeocoded(false);
      onCreated?.();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">{error}</div>}
      {success && <div className="p-3 rounded-md bg-secondary/10 text-foreground text-sm border border-secondary/20" role="status">{success}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={cls("name")} {...aria("name")} />
          <FieldError id="err-name" message={errs.name} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tipo *</label>
          <select value={type} onChange={(e) => setType(e.target.value as RealityType)} className={cls("type")} {...aria("type")}>
            <option value="con-sede">Spazio (con sede)</option>
            <option value="nomade">Spazio senza spazio (itinerante)</option>
            <option value="scomparsa">Spazio che fu</option>
          </select>
          <FieldError id="err-type" message={errs.type} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Paese</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} className={cls("country")} {...aria("country")} />
          <FieldError id="err-country" message={errs.country} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Città *</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} onBlur={runGeocode} className={cls("city")} {...aria("city")} />
          <FieldError id="err-city" message={errs.city} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Indirizzo *</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} onBlur={runGeocode} className={cls("address")} {...aria("address")} />
          <FieldError id="err-address" message={errs.address} />
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <MapPin size={14} /> Geocodifica automatica
            {geocoding && <Loader2 size={14} className="animate-spin" />}
            {geocoded && <Check size={14} className="text-secondary" />}
          </p>
          <button type="button" onClick={runGeocode} className="text-xs underline text-muted-foreground hover:text-foreground">
            Ricalcola
          </button>
        </div>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">CAP</label>
            <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} className={cls("zipCode")} {...aria("zipCode")} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Regione</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} className={cls("region")} {...aria("region")} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Lat *</label>
            <input value={lat} onChange={(e) => setLat(e.target.value)} className={cls("lat")} {...aria("lat")} />
            <FieldError id="err-lat" message={errs.lat} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Lng *</label>
            <input value={lng} onChange={(e) => setLng(e.target.value)} className={cls("lng")} {...aria("lng")} />
            <FieldError id="err-lng" message={errs.lng} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Anno di fondazione *</label>
          <input type="number" value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} className={cls("yearFounded")} {...aria("yearFounded")} />
          <FieldError id="err-yearFounded" message={errs.yearFounded} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Anno di chiusura</label>
          <input type="number" value={yearClosed} onChange={(e) => setYearClosed(e.target.value)} className={cls("yearClosed")} {...aria("yearClosed")} />
          <FieldError id="err-yearClosed" message={errs.yearClosed} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descrizione</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={cls("description")} {...aria("description")} />
        <FieldError id="err-description" message={errs.description} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Storia</label>
        <textarea value={history} onChange={(e) => setHistory(e.target.value)} rows={3} className={cls("history")} {...aria("history")} />
        <FieldError id="err-history" message={errs.history} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Sito web</label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className={cls("website")} {...aria("website")} />
          <FieldError id="err-website" message={errs.website} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email di contatto</label>
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={cls("contactEmail")} {...aria("contactEmail")} />
          <FieldError id="err-contactEmail" message={errs.contactEmail} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Instagram</label>
          <input value={ig} onChange={(e) => setIg(e.target.value)} placeholder="https://instagram.com/..." className={cls("ig")} {...aria("ig")} />
          <FieldError id="err-ig" message={errs.ig} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Facebook</label>
          <input value={fb} onChange={(e) => setFb(e.target.value)} placeholder="https://facebook.com/..." className={cls("fb")} {...aria("fb")} />
          <FieldError id="err-fb" message={errs.fb} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">LinkedIn</label>
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/..." className={cls("linkedin")} {...aria("linkedin")} />
          <FieldError id="err-linkedin" message={errs.linkedin} />
        </div>
      </div>

      {!isCollaborator && (
        <div>
          <label className="block text-sm font-medium mb-2">Stato di conferma</label>
          <select value={confirmedStatus} onChange={(e) => setConfirmedStatus(e.target.value as ConfirmedStatus)} className={cls("confirmedStatus")} {...aria("confirmedStatus")}>
            <option value="pendente">Pendente</option>
            <option value="confermato">Confermato</option>
            <option value="storico">Storico</option>
          </select>
        </div>
      )}

      {isCollaborator && (
        <div className="p-4 rounded-md bg-amber-500/10 border border-amber-500/30 text-sm font-body">
          ⏳ La realtà che proponi resterà <strong>in verifica per 24 ore</strong>: in questa finestra puoi correggerla o eliminarla. Trascorso il tempo verrà <strong>pubblicata automaticamente</strong> sulla mappa. Ricontrolla bene tutti i contatti prima di salvare.
        </div>
      )}

      <button type="submit" disabled={submitting} className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
        {submitting ? "Salvataggio..." : isCollaborator ? "Proponi realtà" : "Salva realtà"}
      </button>
    </form>
  );
};

export default RealityForm;
