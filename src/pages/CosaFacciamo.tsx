import { MapPin, Compass, Archive, Megaphone } from "lucide-react";

const activities = [
  { icon: MapPin, title: "Mappatura territoriale", desc: "Identifichiamo e cataloghiamo le realtà artistiche su tutto il territorio nazionale, creando un database consultabile e sempre aggiornato." },
  { icon: Compass, title: "Ricerca sul campo", desc: "Visitiamo gli spazi, interventiamo gli artisti e documentiamo le attività attraverso reportage fotografici e video." },
  { icon: Archive, title: "Archivio storico", desc: "Recuperiamo la memoria delle realtà scomparse attraverso testimonianze, documenti d'archivio e collaborazioni con storici dell'arte." },
  { icon: Megaphone, title: "Divulgazione", desc: "Pubblichiamo articoli, organizziamo eventi e creiamo contenuti per sensibilizzare il pubblico sul valore delle realtà artistiche indipendenti." },
];

const CosaFacciamo = () => (
  <div className="py-20">
    <div className="editorial-container">
      <div className="max-w-3xl mb-16">
        <h1 className="editorial-heading mb-6">
          Cosa <span className="italic text-primary">Facciamo</span>
        </h1>
        <p className="editorial-body text-muted-foreground">
          La nostra attività si articola in quattro aree principali, tutte orientate a costruire una conoscenza condivisa del panorama artistico italiano.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {activities.map((a) => (
          <div key={a.title} className="p-8 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors">
            <a.icon className="text-primary mb-4" size={28} />
            <h3 className="font-display text-xl font-semibold mb-3">{a.title}</h3>
            <p className="font-body text-muted-foreground leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 rounded-lg bg-secondary/10 border border-secondary/20 text-center">
        <h3 className="font-display text-2xl font-semibold mb-4">Vuoi contribuire?</h3>
        <p className="font-body text-muted-foreground max-w-xl mx-auto mb-6">
          Se conosci una realtà artistica che non è ancora nella nostra mappa, o vuoi condividere la tua storia, contattaci.
        </p>
        <a
          href="mailto:info@artivive.it"
          className="inline-flex px-6 py-3 bg-secondary text-secondary-foreground rounded-md font-body font-medium hover:opacity-90 transition-opacity"
        >
          Scrivici
        </a>
      </div>
    </div>
  </div>
);

export default CosaFacciamo;
