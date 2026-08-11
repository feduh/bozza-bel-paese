import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, FileText, Megaphone, ShieldCheck } from "lucide-react";
import SEO from "@/components/SEO";

const sections = [
  { id: "editoriale", label: "Editoriale" },
  { id: "special-issue", label: "Special Issue" },
  { id: "bollettino", label: "Bollettino" },
  { id: "comuni", label: "Regole comuni" },
];

const LineeGuida = () => {
  return (
    <div className="bg-background py-16 md:py-20">
      <SEO
        title="Linee guida editoriali — Il Bel Paese"
        description="Come proporre e scrivere per Il Bel Paese: linee guida di Editoriale, Special Issue e Bollettino, con criteri, formati e scadenze."
        canonicalPath="/linee-guida"
      />
      <div className="editorial-container">
        <header className="border-b-2 border-foreground pb-10 mb-10">
          <h1 className="editorial-heading mb-4">
            Linee <span className="text-primary">guida</span>
          </h1>
          <p className="editorial-body text-foreground/80 max-w-3xl">
            Tre spazi di scrittura, tre modi di partecipare. Qui trovi criteri, formati e tempi di ogni sezione:
            leggile prima di inviare una proposta.
          </p>
        </header>

        {/* Indice ancore */}
        <nav aria-label="Indice linee guida" className="flex flex-wrap gap-2 mb-14">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-xs uppercase tracking-[0.15em] font-bold px-3 py-1.5 brutalist-border bg-background hover:bg-foreground hover:text-background transition-colors"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <div className="space-y-16 max-w-3xl">
          {/* EDITORIALE */}
          <section id="editoriale" className="scroll-mt-28">
            <div className="micro-label text-secondary mb-3 flex items-center gap-2">
              <BookOpen size={13} /> Editoriale
            </div>
            <h2 className="editorial-subheading mb-4">Il tema dell'anno, curato dall'editor chief</h2>
            <div className="space-y-4 editorial-body text-foreground/80">
              <p>
                L'Editoriale è la sezione annuale: un unico tema, scelto e curato dall'<strong>editor chief</strong>
                {" "}dell'annata, che costruisce una linea di lettura coerente sulla scena indipendente.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Si partecipa tramite <strong>open call dedicata</strong>, con deadline annunciata sulla pagina Editoriale.</li>
                <li>Si invia un <strong>pitch</strong>: titolo, abstract (max 800 caratteri), scaletta e riferimenti.</li>
                <li>L'editor chief valuta, risponde con note e — se accetta — sblocca la stesura dell'articolo.</li>
                <li>Formato consigliato: 1.200–3.000 parole, con fonti verificabili e immagini di cui possiedi i diritti.</li>
                <li>Ogni testo passa una revisione editoriale e il controllo copyright prima della pubblicazione.</li>
              </ul>
            </div>
            <Link to="/editoriale" className="inline-flex items-center gap-2 mt-5 text-sm font-bold uppercase tracking-[0.15em] text-primary hover:gap-3 transition-all">
              Vai all'Editoriale <ArrowRight size={14} />
            </Link>
          </section>

          {/* SPECIAL ISSUE */}
          <section id="special-issue" className="scroll-mt-28">
            <div className="micro-label text-secondary mb-3 flex items-center gap-2">
              <Megaphone size={13} /> Special Issue
            </div>
            <h2 className="editorial-subheading mb-4">Un numero speciale affidato a un guest editor</h2>
            <div className="space-y-4 editorial-body text-foreground/80">
              <p>
                Dentro l'annata possono nascere uno o più <strong>Special Issue</strong>: numeri monografici con
                tema proprio, affidati a un <strong>guest editor</strong> selezionato dall'editor chief.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Ogni Special Issue ha una <strong>open call e una deadline separate</strong> da quelle dell'Editoriale.</li>
                <li>Il guest editor definisce il tema, valuta i pitch e cura l'editing dei contributi selezionati.</li>
                <li>Si candida allo stesso modo dell'Editoriale, scegliendo lo Special Issue come destinazione del pitch.</li>
                <li>Sono benvenuti formati ibridi: saggio breve, conversazione, portfolio commentato, cronaca situata.</li>
              </ul>
            </div>
          </section>

          {/* BOLLETTINO */}
          <section id="bollettino" className="scroll-mt-28">
            <div className="micro-label text-primary mb-3 flex items-center gap-2">
              <FileText size={13} /> Bollettino
            </div>
            <h2 className="editorial-subheading mb-4">Sezione permanente, libera e revisionata</h2>
            <div className="space-y-4 editorial-body text-foreground/80">
              <p>
                Il Bollettino è sempre aperto: nessun tema imposto, nessuna scadenza. È lo spazio della scrittura
                creativa, delle notizie dalle realtà mappate, delle recensioni e delle voci dal territorio.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Nessuna open call</strong>: si propone quando si vuole, dall'Area personale.</li>
                <li>Ogni testo è <strong>revisionato</strong> dalla redazione prima della pubblicazione.</li>
                <li>Lunghezza libera, indicativamente 400–2.000 parole. Titolo chiaro, abstract di 1–2 frasi.</li>
                <li>Sono ammessi registri sperimentali, purché leggibili e verificabili nei fatti citati.</li>
              </ul>
            </div>
            <Link to="/bollettino" className="inline-flex items-center gap-2 mt-5 text-sm font-bold uppercase tracking-[0.15em] text-primary hover:gap-3 transition-all">
              Vai al Bollettino <ArrowRight size={14} />
            </Link>
          </section>

          {/* COMUNI */}
          <section id="comuni" className="scroll-mt-28">
            <div className="micro-label mb-3 flex items-center gap-2">
              <ShieldCheck size={13} /> Regole comuni
            </div>
            <h2 className="editorial-subheading mb-4">Valide per tutte le sezioni</h2>
            <div className="space-y-4 editorial-body text-foreground/80">
              <ul className="list-disc pl-5 space-y-2">
                <li>Testi inediti. Se un contenuto è già uscito altrove, segnalalo in fase di proposta.</li>
                <li>Immagini: solo materiali di cui hai i diritti o con licenza compatibile, sempre con crediti.</li>
                <li>Citazioni sempre attribuite; l'uso di strumenti di AI va dichiarato nell'editor.</li>
                <li>Nessun contenuto discriminatorio, diffamatorio o promozionale mascherato.</li>
                <li>La redazione può richiedere modifiche, tagli o rinviare la pubblicazione in calendario.</li>
              </ul>
              <p>
                Dubbi su una proposta? Scrivici da{" "}
                <Link to="/contatti" className="text-primary underline">
                  Contatti
                </Link>
                .
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LineeGuida;
