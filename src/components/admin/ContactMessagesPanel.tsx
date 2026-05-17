import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, Archive, CheckCircle2, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "nuovo" | "in_lavorazione" | "risposto" | "archiviato";
  admin_notes: string | null;
  created_at: string;
};

const STATUS_LABEL: Record<ContactMessage["status"], string> = {
  nuovo: "Nuovo",
  in_lavorazione: "In lavorazione",
  risposto: "Risposto",
  archiviato: "Archiviato",
};

const STATUS_STYLES: Record<ContactMessage["status"], string> = {
  nuovo: "bg-primary/15 text-primary border-primary/30",
  in_lavorazione: "bg-secondary/15 text-secondary border-secondary/30",
  risposto: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  archiviato: "bg-muted text-muted-foreground border-border",
};

const ContactMessagesPanel = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | ContactMessage["status"]>("all");

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Errore", description: "Impossibile caricare i messaggi.", variant: "destructive" });
    } else {
      setMessages((data ?? []) as ContactMessage[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const updateStatus = async (id: string, status: ContactMessage["status"]) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Errore", description: "Impossibile aggiornare lo stato.", variant: "destructive" });
      return;
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const filtered = filter === "all" ? messages : messages.filter((m) => m.status === filter);
  const countNew = messages.filter((m) => m.status === "nuovo").length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground font-body text-sm py-8">
        <Loader2 size={16} className="animate-spin" /> Caricamento messaggi…
      </div>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold flex items-center gap-2">
            <Mail size={20} className="text-primary" /> Messaggi di contatto
            {countNew > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                {countNew}
              </span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Messaggi inviati dalla pagina contatti pubblica.
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-2 rounded-lg border border-input bg-background font-body text-sm"
          aria-label="Filtra per stato"
        >
          <option value="all">Tutti ({messages.length})</option>
          <option value="nuovo">Nuovi</option>
          <option value="in_lavorazione">In lavorazione</option>
          <option value="risposto">Risposti</option>
          <option value="archiviato">Archiviati</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body py-8 text-center">Nessun messaggio.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((m) => (
            <li key={m.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-display font-semibold text-base">
                    {m.subject || "(nessun oggetto)"}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body">
                    Da <strong>{m.name}</strong> · <a href={`mailto:${m.email}`} className="text-primary hover:underline">{m.email}</a>
                    {" · "}
                    {new Date(m.created_at).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className={`text-xs font-body font-medium px-3 py-1 rounded-full border ${STATUS_STYLES[m.status]}`}>
                  {STATUS_LABEL[m.status]}
                </span>
              </div>
              <p className="font-body text-sm whitespace-pre-wrap leading-relaxed mb-4 bg-background rounded-md p-3 border border-border/60">
                {m.message}
              </p>
              <div className="flex flex-wrap gap-2">
                {m.status !== "in_lavorazione" && (
                  <button onClick={() => updateStatus(m.id, "in_lavorazione")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input text-xs font-body hover:bg-muted">
                    <Clock size={13} /> Prendi in carico
                  </button>
                )}
                {m.status !== "risposto" && (
                  <button onClick={() => updateStatus(m.id, "risposto")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input text-xs font-body hover:bg-muted">
                    <CheckCircle2 size={13} /> Segna come risposto
                  </button>
                )}
                {m.status !== "archiviato" && (
                  <button onClick={() => updateStatus(m.id, "archiviato")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input text-xs font-body hover:bg-muted">
                    <Archive size={13} /> Archivia
                  </button>
                )}
                <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Il tuo messaggio")}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-body hover:bg-primary/90">
                  <Mail size={13} /> Rispondi
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ContactMessagesPanel;
