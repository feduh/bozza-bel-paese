import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import SEO from "@/components/SEO";
import { Send, CheckCircle2, MapPinPlus } from "lucide-react";

const SegnalaRealta = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterEmail, setReporterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Il nome della realtà è obbligatorio.");
      return;
    }
    setSubmitting(true);
    const { error: insErr } = await supabase.from("reality_reports").insert({
      name: name.trim(),
      city: city.trim() || null,
      region: region.trim() || null,
      description: description.trim() || null,
      website: website.trim() || null,
      contact_email: contactEmail.trim() || null,
      reporter_name: reporterName.trim() || null,
      reporter_email: reporterEmail.trim() || user?.email || null,
      reporter_user_id: user?.id ?? null,
    });
    setSubmitting(false);
    if (insErr) {
      setError("Errore durante l'invio. Riprova più tardi.");
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="py-20">
        <SEO title="Segnalazione ricevuta" canonicalPath="/segnala-realta" />
        <div className="editorial-container max-w-2xl text-center">
          <CheckCircle2 size={48} className="mx-auto text-primary mb-6" />
          <h1 className="editorial-heading mb-4">Grazie per la <span className="italic text-primary">segnalazione</span></h1>
          <p className="font-body text-muted-foreground mb-8">
            Il nostro team la valuterà e, se idonea, contatterà la realtà per inserirla nella mappa.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/mappatura" className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity">
              Esplora la mappa
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setName(""); setCity(""); setRegion(""); setDescription("");
                setWebsite(""); setContactEmail(""); setReporterName(""); setReporterEmail("");
              }}
              className="px-5 py-2.5 rounded-md border border-border font-body font-medium hover:border-primary/40 transition-colors"
            >
              Segnala un'altra realtà
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <SEO
        title="Segnala una realtà artistica"
        description="Conosci una realtà artistica italiana non ancora mappata? Segnalacela."
        canonicalPath="/segnala-realta"
      />
      <div className="editorial-container max-w-2xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-body uppercase tracking-wider mb-4">
            <MapPinPlus size={14} /> Comunità
          </div>
          <h1 className="editorial-heading mb-4">
            Segnala una <span className="italic text-primary">realtà mancante</span>
          </h1>
          <p className="font-body text-muted-foreground">
            Aiutaci a completare la mappa. Indicaci una realtà artistica italiana che meriterebbe di essere raccontata.
            Tutti i campi tranne il <strong>nome</strong> sono facoltativi.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5 p-8 rounded-lg bg-card border border-border" noValidate>
          <div>
            <label htmlFor="r-name" className="block text-sm font-body font-medium mb-1.5">
              Nome della realtà <span className="text-destructive">*</span>
            </label>
            <input
              id="r-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="r-city" className="block text-sm font-body font-medium mb-1.5">Città</label>
              <input
                id="r-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="r-region" className="block text-sm font-body font-medium mb-1.5">Regione</label>
              <input
                id="r-region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label htmlFor="r-desc" className="block text-sm font-body font-medium mb-1.5">Descrizione breve</label>
            <textarea
              id="r-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={2000}
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="r-web" className="block text-sm font-body font-medium mb-1.5">Sito web</label>
              <input
                id="r-web"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://…"
                maxLength={300}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="r-cem" className="block text-sm font-body font-medium mb-1.5">Email di contatto della realtà</label>
              <input
                id="r-cem"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                maxLength={200}
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs font-body text-muted-foreground uppercase tracking-wider mb-3">
              I tuoi contatti (facoltativi)
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="r-rn" className="block text-sm font-body font-medium mb-1.5">Il tuo nome</label>
                <input
                  id="r-rn"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  maxLength={120}
                  className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="r-re" className="block text-sm font-body font-medium mb-1.5">La tua email</label>
                <input
                  id="r-re"
                  type="email"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  placeholder={user?.email ?? ""}
                  maxLength={200}
                  className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {error && (
            <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={16} />
            {submitting ? "Invio in corso…" : "Invia segnalazione"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SegnalaRealta;
