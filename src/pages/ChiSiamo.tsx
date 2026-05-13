import SEO from "@/components/SEO";

const ChiSiamo = () => (
  <div className="py-20">
    <SEO
      title="Chi siamo"
      description="Il Bel Paese: la prima piattaforma di mappatura, promozione e ricerca che legittima le realtà artistiche indipendenti italiane."
      canonicalPath="/chi-siamo"
    />
    <div className="editorial-container max-w-3xl">
      <h1 className="editorial-heading mb-8">
        Chi <span className="italic text-primary">Siamo</span>
      </h1>

      <div className="space-y-6 editorial-body text-muted-foreground">
        <p>
          <strong className="text-foreground">Il Bel Paese</strong> è la prima piattaforma di mappatura, promozione e ricerca che <strong className="text-foreground">legittima le realtà artistiche e progettuali indipendenti italiane</strong>.
        </p>
        <p>
          Attraverso una vetrina dinamica e un archivio storico, il progetto mette a sistema queste esperienze per favorire la creazione di reti e <strong className="text-foreground">ridurre la distanza tra la scena indipendente e il sistema istituzionale</strong>.
        </p>
        <p>
          Crediamo che le realtà indipendenti — gli spazi fisici, quelli senza sede, e quelli che non esistono più — siano un patrimonio culturale collettivo che merita riconoscimento, memoria e strumenti per dialogare con il resto del sistema dell'arte.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-lg bg-card border border-border">
          <h3 className="font-display text-xl font-semibold mb-3">Mission</h3>
          <p className="font-body text-muted-foreground">
            Legittimare, mettere in rete e dare voce alle realtà artistiche indipendenti italiane attraverso mappatura, promozione e ricerca.
          </p>
        </div>
        <div className="p-8 rounded-lg bg-card border border-border">
          <h3 className="font-display text-xl font-semibold mb-3">Visione</h3>
          <p className="font-body text-muted-foreground">
            Un ecosistema in cui scena indipendente e mondo istituzionale dialogano alla pari, riconoscendosi come parti dello stesso paesaggio culturale.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="editorial-subheading mb-8">
          Per <span className="italic text-primary">chi</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Realtà indipendenti", desc: "Spazi, collettivi, progetti itineranti e archivi che cercano visibilità e connessioni." },
            { title: "Ricercatori e curatori", desc: "Studiosi, critici e operatori culturali che hanno bisogno di dati e contesto." },
            { title: "Istituzioni e partner", desc: "Enti, accademie e organizzazioni che vogliono dialogare con la scena indipendente." },
          ].map((p) => (
            <div key={p.title} className="p-6 rounded-lg bg-card border border-border">
              <h4 className="font-display text-lg font-semibold mb-2">{p.title}</h4>
              <p className="font-body text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default ChiSiamo;
