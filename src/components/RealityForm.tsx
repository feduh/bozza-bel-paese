import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Loader2, Check } from "lucide-react";

type RealityType = "con-sede" | "nomade" | "scomparsa";
type ConfirmedStatus = "pendente" | "confermato" | "storico";

const inputCls =
  "w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring";

const RealityForm = ({ onCreated }: { onCreated?: () => void }) => {
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
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!lat || !lng) {
      setError("Coordinate mancanti: avvia la geocodifica o inseriscile manualmente.");
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from("realities").insert({
      name,
      type,
      country,
      city,
      address,
      zip_code: zipCode || null,
      region,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      year_founded: parseInt(yearFounded, 10),
      year_closed: yearClosed ? parseInt(yearClosed, 10) : null,
      website: website || null,
      contact_email: contactEmail || null,
      description,
      history,
      ig_link: ig || null,
      fb_link: fb || null,
      linkedin_link: linkedin || null,
      confirmed_status: confirmedStatus,
      status: confirmedStatus === "storico" ? "archiviato" : "attivo",
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(`✅ Realtà "${name}" salvata.`);
      setName(""); setAddress(""); setCity(""); setZipCode(""); setRegion("");
      setLat(""); setLng(""); setYearFounded(""); setYearClosed("");
      setWebsite(""); setContactEmail(""); setDescription(""); setHistory("");
      setIg(""); setFb(""); setLinkedin(""); setGeocoded(false);
      onCreated?.();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}
      {success && <div className="p-3 rounded-md bg-secondary/10 text-foreground text-sm border border-secondary/20">{success}</div>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Nome *</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Tipo *</label>
          <select value={type} onChange={(e) => setType(e.target.value as RealityType)} className={inputCls}>
            <option value="con-sede">Spazio (con sede)</option>
            <option value="nomade">Spazio senza spazio (itinerante)</option>
            <option value="scomparsa">Spazio che fu</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Paese</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Città *</label>
          <input required value={city} onChange={(e) => setCity(e.target.value)} onBlur={runGeocode} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Indirizzo *</label>
          <input required value={address} onChange={(e) => setAddress(e.target.value)} onBlur={runGeocode} className={inputCls} />
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
            <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Regione</label>
            <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Lat</label>
            <input value={lat} onChange={(e) => setLat(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Lng</label>
            <input value={lng} onChange={(e) => setLng(e.target.value)} className={inputCls} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Anno di fondazione *</label>
          <input required type="number" value={yearFounded} onChange={(e) => setYearFounded(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Anno di chiusura</label>
          <input type="number" value={yearClosed} onChange={(e) => setYearClosed(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Descrizione</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Storia</label>
        <textarea value={history} onChange={(e) => setHistory(e.target.value)} rows={3} className={inputCls} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Sito web</label>
          <input value={website} onChange={(e) => setWebsite(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email di contatto</label>
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Instagram</label>
          <input value={ig} onChange={(e) => setIg(e.target.value)} placeholder="https://instagram.com/..." className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Facebook</label>
          <input value={fb} onChange={(e) => setFb(e.target.value)} placeholder="https://facebook.com/..." className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">LinkedIn</label>
          <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/..." className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Stato di conferma</label>
        <select value={confirmedStatus} onChange={(e) => setConfirmedStatus(e.target.value as ConfirmedStatus)} className={inputCls}>
          <option value="pendente">Pendente</option>
          <option value="confermato">Confermato</option>
          <option value="storico">Storico</option>
        </select>
      </div>

      <button type="submit" disabled={submitting} className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
        {submitting ? "Salvataggio..." : "Salva realtà"}
      </button>
    </form>
  );
};

export default RealityForm;
