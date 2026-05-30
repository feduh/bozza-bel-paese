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
      // Silent reject for bots; show generic feedback so we don't tip them off.
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

  return (
    <div className="py-20">
      <SEO
        title="Contatti — Il Bel Paese"
        description="Scrivi al collettivo Il Bel Paese: collaborazioni, segnalazioni, stampa e proposte editoriali."
        canonicalPath="/contatti"
      />
      <div className="editorial-container">
        <div className="max-w-3xl mb-12">
          <h1 className="editorial-heading mb-6">
            <span className="italic text-primary">Scrivici</span> due righe
          </h1>
          <p className="editorial-body text-muted-foreground">
            Per collaborazioni, proposte editoriali, segnalazioni o semplicemente per dirci che esistete:
            ci fa piacere ricevere ogni messaggio.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_2fr] gap-12">
          {/* Info colonna sx */}
          <aside className="space-y-8">
            <div>
              <h2 className="font-display text-lg font-semibold mb-3 text-primary">In due parole</h2>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Per partecipare attivamente al progetto serve un invito da un membro del collettivo.
                Per tutto il resto, basta una mail.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-body text-sm font-semibold">Email</p>
                  <a href="mailto:info@artivive.it" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
                    info@artivive.it
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Instagram size={18} className="text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-body text-sm font-semibold">Instagram</p>
                  <a href="https://instagram.com/ilbelpaese" target="_blank" rel="noreferrer" className="font-body text-sm text-muted-foreground hover:text-primary transition-colors">
                    @ilbelpaese
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-primary mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-body text-sm font-semibold">Dove siamo</p>
                  <p className="font-body text-sm text-muted-foreground">Italia, ovunque ci sia una realtà da mappare.</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-lg p-8">
            {sent && (
              <div role="status" className="rounded-lg border border-secondary/40 bg-secondary/10 p-4 text-sm font-body text-secondary-foreground">
                Grazie! Abbiamo ricevuto il tuo messaggio. Ti scriviamo presto.
              </div>
            )}
            {/* honeypot anti-spam */}
            <input {...antiSpam.honeypotProps} />
            <div className="grid sm:grid-cols-2 gap-5">
              <label className="block">
                <span className="font-body text-sm font-medium mb-1.5 block">Nome *</span>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
              <label className="block">
                <span className="font-body text-sm font-medium mb-1.5 block">Email *</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </label>
            </div>
            <label className="block">
              <span className="font-body text-sm font-medium mb-1.5 block">Oggetto</span>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Collaborazione, segnalazione, stampa…"
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block">
              <span className="font-body text-sm font-medium mb-1.5 block">Messaggio *</span>
              <textarea
                required
                rows={7}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              />
            </label>
            <p className="text-xs text-muted-foreground font-body">
              Inviando il messaggio accetti la nostra <a href="/privacy" className="text-primary hover:underline">privacy policy</a>.
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-body font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
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
