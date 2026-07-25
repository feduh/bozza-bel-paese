import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Headphones } from "lucide-react";
import SEO from "@/components/SEO";
import coverNomadi from "@/assets/podcast/voci-spazi-nomadi.jpg";
import coverSud from "@/assets/podcast/mappe-sonore-sud.jpg";
import coverArchivio from "@/assets/podcast/archivio-realta-scomparse.jpg";

// Esempi editoriali per prototipare la pagina episodio — nessun contenuto reale.
const episodi: Record<string, {
  title: string;
  author: string;
  duration: string;
  cover: string;
  description: string;
}> = {
  "voci-spazi-nomadi": {
    title: "Voci dagli spazi nomadi",
    author: "Il Bel Paese × partner radio",
    duration: "28'40\"",
    cover: coverNomadi,
    description:
      "Un dialogo con chi fa cultura senza una sede fissa: collettivi che occupano temporaneamente scuole, capannoni, cortili, e che ripartono ogni volta da zero. Come si costruisce comunità quando la casa cambia ogni mese? Quali strumenti restano, quali si perdono, e cosa possiamo imparare da una forma di lavoro artistico che rifiuta la stanzialità come unica misura di serietà.",
  },
  "mappe-sonore-sud": {
    title: "Mappe sonore del Sud",
    author: "Il Bel Paese × partner radio",
    duration: "41'05\"",
    cover: coverSud,
    description:
      "Un viaggio d'ascolto attraverso le scene indipendenti che tengono viva la ricerca artistica fuori dalle rotte di Milano, Torino e Bologna: residenze in Basilicata, festival in provincia di Trapani, spazi autogestiti nell'entroterra calabrese. Ci chiediamo cosa significhi \"periferia\" quando la periferia è, per numero di realtà attive, il centro reale di un'Italia culturalmente diffusa.",
  },
  "archivio-realta-scomparse": {
    title: "Archivio delle realtà scomparse",
    author: "Il Bel Paese × partner radio",
    duration: "35'22\"",
    cover: coverArchivio,
    description:
      "Una puntata dedicata alla memoria orale degli spazi che non ci sono più: gallerie chiuse, associazioni sciolte, laboratori sfrattati. Non un elenco funebre, ma un archivio vivo — voci di chi c'era, materiali salvati, tracce che continuano a produrre effetti sulla scena presente. Perché una realtà che chiude non finisce: si trasforma nelle persone che l'hanno attraversata.",
  },
};

const PodcastEpisodio = () => {
  const { slug } = useParams<{ slug: string }>();
  const ep = slug ? episodi[slug] : undefined;

  if (!ep) {
    return (
      <div className="py-20 editorial-container text-center">
        <p className="font-body text-muted-foreground mb-4">Episodio non trovato.</p>
        <Link to="/la-vostra-voce" className="text-primary hover:underline font-body text-sm">
          ← Torna al podcast
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title={`${ep.title} — Podcast`}
        description={ep.description.slice(0, 155)}
        canonicalPath={`/racconti/podcast/${slug}`}
      />
      <div className="editorial-container max-w-4xl">
        <Link
          to="/la-vostra-voce"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-body mb-8"
        >
          <ArrowLeft size={14} /> Torna al podcast
        </Link>

        <div className="brutalist-card overflow-hidden mb-8">
          <div className="relative aspect-video bg-muted border-b-2 border-foreground">
            <img
              src={ep.cover}
              alt=""
              loading="lazy"
              width={1280}
              height={720}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/15">
              <Headphones size={72} className="text-background drop-shadow-lg" aria-hidden="true" />
            </div>
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 micro-label px-2.5 py-1 brutalist-border bg-background">
              Podcast
            </span>
            <span className="absolute bottom-3 right-3 micro-label bg-foreground text-background px-2 py-0.5">
              {ep.duration}
            </span>
          </div>
        </div>

        <h1
          className="font-display text-3xl md:text-4xl mb-3 leading-tight"
          style={{ fontVariationSettings: "'wght' 700" }}
        >
          {ep.title}
        </h1>
        <p className="text-sm text-muted-foreground font-body mb-8">{ep.author}</p>

        <p className="font-body text-foreground/90 leading-relaxed text-justify hyphens-auto max-w-3xl">
          {ep.description}
        </p>

        <p className="mt-10 text-xs text-foreground/60 font-body italic">
          Esempio editoriale: la pagina definitiva ospiterà player, trascrizione e crediti reali.
        </p>
      </div>
    </div>
  );
};

export default PodcastEpisodio;
