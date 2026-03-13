const ChiSiamo = () => (
  <div className="py-20">
    <div className="editorial-container max-w-3xl">
      <h1 className="editorial-heading mb-8">
        Chi <span className="italic text-primary">Siamo</span>
      </h1>
      <div className="space-y-6 editorial-body text-muted-foreground">
        <p>
          <strong className="text-foreground">Il Bel Paese</strong> nasce dalla volontà di creare un archivio dinamico delle realtà artistiche italiane — dai collettivi nomadi che attraversano le piazze, agli spazi culturali radicati nei quartieri, fino alle esperienze ormai scomparse ma fondamentali per la storia culturale del paese.
        </p>
        <p>
          Siamo un gruppo di ricercatori, artisti e appassionati di cultura che crede nel valore della documentazione e della memoria collettiva. Il nostro progetto è partecipativo: chiunque può contribuire segnalando realtà, condividendo storie e arricchendo la mappa.
        </p>
        <p>
          Il progetto è nato nel 2024 come iniziativa indipendente e si è rapidamente trasformato in una piattaforma di riferimento per chi vuole conoscere, esplorare e preservare il tessuto artistico italiano.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-2 gap-8">
        <div className="p-8 rounded-lg bg-card border border-border">
          <h3 className="font-display text-xl font-semibold mb-3">La nostra missione</h3>
          <p className="font-body text-muted-foreground">
            Rendere visibile e accessibile la ricchezza delle esperienze artistiche italiane, costruendo ponti tra passato e presente.
          </p>
        </div>
        <div className="p-8 rounded-lg bg-card border border-border">
          <h3 className="font-display text-xl font-semibold mb-3">La nostra visione</h3>
          <p className="font-body text-muted-foreground">
            Un'Italia in cui ogni realtà artistica, grande o piccola, viene riconosciuta e raccontata come parte del patrimonio culturale collettivo.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default ChiSiamo;
