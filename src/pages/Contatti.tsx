import { useState } from "react";
import { Mail, MapPin, Send, Loader2, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { toast } from "@/hooks/use-toast";
import { useAntiSpam } from "@/lib/antiSpam";

const Contatti = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const antiSpam = useAntiSpam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Campi mancanti", description: "Nome, email e messaggio sono obbligatori.", variant: "destructive" });
      return;
    }
    if (!antiSpam.passes()) {
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Errore", description: "Non è stato possibile inviare il messaggio. Riprova.", variant: "destructive" });
      return;
    }
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    toast({ title: "Messaggio inviato", description: "Ti risponderemo al più presto." });
  };

  const inputClass =
    "w-full px-4 py-3 brutalist-border bg-background text-sm focus:outline-none focus:ring-0 focus:border-primary";

  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title="Contatti — Il Bel Paese"
        description="Scrivi al collettivo Il Bel Paese: collaborazioni, segnalazioni, stampa e proposte editoriali."
        canonicalPath="/contatti"
      />
      <div className="editorial-container space-y-12 md:space-y-16">
        {/* Header */}
        <header className="border-b-2 border-foreground pb-10">
          <h1 className="editorial-heading mb-6 uppercase">
            <span className="text-primary">SCRIVICI</span>&nbsp;<br className="md:hidden" />
            DUE RIGHE
          </h1>
          <p className="editorial-body text-foreground/80">
            Per collaborazioni, proposte editoriali, segnalazioni o semplicemente per scambiare due parole:
            accogliamo ogni tipo di messaggio.
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
          {/* Info colonna sx */}
          <aside className="brutalist-card p-8 self-start">
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="micro-label mb-1">Email</p>
                  <a href="mailto:info@ilbelpaese.it" className="text-sm hover:text-primary transition-colors">
                    info@ilbelpaese.it
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Instagram size={18} className="text-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="micro-label mb-1">Instagram</p>
                  <a href="https://instagram.com/ilbelpaese" target="_blank" rel="noreferrer" className="text-sm hover:text-primary transition-colors">
                    @ilbelpaese
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-foreground mt-0.5" aria-hidden="true" />
                <div>
                  <p className="micro-label mb-1">Dove siamo</p>
                  <p className="text-sm text-foreground/80">Italia, ovunque ci sia una realtà da mappare.</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Form */}
          <form onSubmit={handleSubmit} className="brutalist-card p-8 space-y-5">
            {sent && (
              <div role="status" className="brutalist-border bg-secondary/20 p-4 text-sm">
                Grazie! Abbiamo ricevuto il tuo messaggio. Ti scriviamo presto.
              </div>
            )}
            <input {...antiSpam.honeypotProps} />
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="micro-label mb-2 block">Nome *</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="micro-label mb-2 block">Email *</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="block">
              <span className="micro-label mb-2 block">Oggetto</span>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Collaborazione, segnalazione, stampa…"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="micro-label mb-2 block">Messaggio *</span>
              <textarea
                required
                rows={7}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={`${inputClass} resize-y`}
              />
            </label>
            <p className="text-xs text-foreground/70">
              Inviando il messaggio accetti la nostra <a href="/privacy" className="text-primary hover:underline">privacy policy</a>.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="btn-brutalist disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? "Invio in corso…" : "Invia messaggio"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contatti;
