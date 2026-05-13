import { MapPin, Megaphone, Search, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

const pillars = [
  {
    icon: MapPin,
    title: "Mappatura",
    desc: "Identifichiamo e categorizziamo le realtà artistiche indipendenti italiane in tre famiglie: Spazi (con sede fisica), Spazi senza spazi (itineranti, digitali, nomadi) e Spazi che furono (archivio storico delle esperienze concluse).",
  },
  {
    icon: Megaphone,
    title: "Promozione",
    desc: "Diamo visibilità alle realtà mappate attraverso una vetrina dinamica, un magazine editoriale e la sezione Point / Counter Point, dove voci diverse si confrontano sui temi della scena indipendente.",
  },
  {
    icon: Search,
    title: "Ricerca",
    desc: "Costruiamo conoscenza condivisa attraverso indagini sul campo, dati aggregati e collaborazioni con accademie e centri di ricerca, per restituire una lettura aggiornata del tessuto artistico nazionale.",
  },
];

const how = [
  { title: "Vetrina dinamica", desc: "Schede aggiornate, filtri per regione, media e tipologia, segnalazioni dal basso." },
  { title: "Archivio storico", desc: "Memoria delle realtà concluse, recuperata attraverso testimonianze e documenti." },
  { title: "Magazine editoriale", desc: "Articoli, interviste e il format Point / Counter Point con editor in chief come garanzia scientifica." },
  { title: "Aggiorniamoci", desc: "Verifica annuale dello stato delle realtà mappate per mantenere il dato vivo." },
];

const CosaFacciamo = () => (
  <div className="py-20">
    <div className="editorial-container">
      <div className="max-w-3xl mb-16">
        <h1 className="editorial-heading mb-6">
          Cosa <span className="italic text-primary">Facciamo</span>
        </h1>
        <p className="editorial-body text-muted-foreground">
          Il nostro impegno si articola attraverso tre pilastri — <strong className="text-foreground">mappatura</strong>, <strong className="text-foreground">promozione</strong> e <strong className="text-foreground">ricerca</strong> — pensati per legittimare la scena indipendente e metterla in dialogo con il sistema istituzionale.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {pillars.map((p) => (
          <div key={p.title} className="p-8 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
            <p.icon className="text-primary mb-4" size={28} />
            <h3 className="font-display text-xl font-semibold mb-3">{p.title}</h3>
            <p className="font-body text-muted-foreground leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-20">
        <h2 className="editorial-subheading mb-8">
          <span className="italic text-primary">Come</span> lo facciamo
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {how.map((h) => (
            <div key={h.title} className="p-6 rounded-lg bg-card border border-border">
              <h4 className="font-display text-lg font-semibold mb-2">{h.title}</h4>
              <p className="font-body text-sm text-muted-foreground">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-20">
        <h2 className="editorial-subheading mb-8">
          <span className="italic text-primary">Perché</span>
        </h2>
        <div className="p-8 rounded-lg bg-secondary/10 border border-secondary/20">
          <p className="font-body text-muted-foreground leading-relaxed">
            Perché le realtà indipendenti spesso restano fuori dai radar istituzionali, dalle banche dati ufficiali e dai percorsi di finanziamento. Documentarle, raccontarle e metterle in rete significa restituire loro la legittimazione che meritano e arricchire il patrimonio culturale del paese.
          </p>
        </div>
      </div>

      <div className="p-10 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
        <h3 className="font-display text-2xl font-semibold mb-4">Vuoi contribuire?</h3>
        <p className="font-body text-muted-foreground max-w-xl mx-auto mb-6">
          Se rappresenti una realtà artistica indipendente, sei un ricercatore o un partner istituzionale, scrivici per entrare nella mappa o nel magazine.
        </p>
        <a
          href="mailto:info@ilbelpaese.it"
          className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-body font-medium hover:opacity-90 transition-opacity"
        >
          Scrivici <ArrowRight size={18} />
        </a>
      </div>
    </div>
  </div>
);

export default CosaFacciamo;
