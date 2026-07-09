import { Link, useParams } from "react-router-dom";
import { ArrowLeft, PlayCircle, Headphones } from "lucide-react";
import SEO from "@/components/SEO";

// Placeholder di prototipo — nessun contenuto reale.
const episodi: Record<string, {
  kind: "video" | "podcast";
  title: string;
  author: string;
  duration: string;
  cover: string;
  description: string;
}> = {
  "collettivo-senza-sede": {
    kind: "video",
    title: "Intervista a un collettivo che non ha una sede",
    author: "Il Bel Paese",
    duration: "12'40\"",
    cover: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    description:
      "Una conversazione con un collettivo nomade che da anni attraversa la penisola senza uno spazio fisso: come si costruisce comunità quando la casa cambia ogni mese?",
  },
  "radio-indipendenti": {
    kind: "podcast",
    title: "Radio indipendenti: geografie del suono",
    author: "Ospite: nome radio partner",
    duration: "34'12\"",
    cover:
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&auto=format&fit=crop",
    description:
      "Un viaggio attraverso le radio libere italiane che tengono viva la scena musicale e artistica indipendente, dalle antenne di quartiere agli stream notturni.",
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

  const Icon = ep.kind === "video" ? PlayCircle : Headphones;

  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title={`${ep.title} — Podcast`}
        description={ep.description}
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
              className="absolute inset-0 w-full h-full object-cover"
              onError={(ev) => {
                (ev.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <Icon size={72} className="text-background drop-shadow-lg" aria-hidden="true" />
            </div>
            <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 micro-label px-2.5 py-1 brutalist-border bg-background">
              {ep.kind === "video" ? "Video" : "Podcast"}
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
          Contenuto di prototipo: la pagina definitiva ospiterà player, trascrizione e crediti reali.
        </p>
      </div>
    </div>
  );
};

export default PodcastEpisodio;
