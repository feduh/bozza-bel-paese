import { Link } from "react-router-dom";
import {
  FileText,
  CalendarClock,
  BookOpen,
  MapPin,
  Clock,
  Mail,
  Flag,
  Edit3,
  Plus,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import type { AreaPost, AreaPendingReality } from "./types";
import type { AreaTabValue } from "./AreaSidebar";

type Props = {
  displayName: string;
  posts: AreaPost[];
  scheduledCount: number;
  moderationCount: number;
  pendingRealities: AreaPendingReality[];
  isStaff: boolean;
  isAdmin: boolean;
  isCurator: boolean;
  canProposeRealities: boolean;
  editorialCounts?: { pending: number; accepted: number };
  curatelaPending?: number;
  adminCounts?: { messages: number; reports: number };
  goTo: (t: AreaTabValue) => void;
};

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-5 rounded-lg border border-border bg-card ${className}`}>{children}</div>
);

const Stat = ({ n, label }: { n: number; label: string }) => (
  <div>
    <div className="font-display text-3xl font-bold leading-none">{n}</div>
    <div className="text-xs font-body text-muted-foreground uppercase tracking-widest mt-1">
      {label}
    </div>
  </div>
);

const PanelPanoramica = ({
  displayName,
  posts,
  scheduledCount,
  moderationCount,
  pendingRealities,
  isStaff,
  isAdmin,
  isCurator,
  canProposeRealities,
  editorialCounts,
  curatelaPending,
  adminCounts,
  goTo,
}: Props) => {
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const lastDraft = [...posts]
    .filter((p) => p.status === "draft")
    .sort(
      (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
    )[0];

  return (
    <section className="space-y-6">
      {/* Hero */}
      <div className="p-8 rounded-lg bg-gradient-to-br from-primary/10 via-card to-card border border-border">
        <p className="font-body text-sm text-muted-foreground uppercase tracking-widest mb-2">
          Bentornato
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Ciao <span className="text-primary italic">{displayName}</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => goTo("profilo")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background text-sm font-body font-medium hover:border-primary/40 transition-colors"
          >
            <Edit3 size={14} /> Modifica profilo
          </button>
          <Link
            to="/area-personale/articolo/nuovo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-body font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} /> Nuovo articolo
          </Link>
          {isStaff && (
            <Link
              to="/area-personale/podcast/nuovo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background text-sm font-body font-medium hover:border-primary/40 transition-colors"
            >
              <Plus size={14} /> Nuovo podcast
            </Link>
          )}
        </div>
      </div>

      {/* Le tue produzioni */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <FileText size={18} /> I tuoi contenuti
          </h3>
          <button
            onClick={() => goTo("articoli")}
            className="text-xs font-body text-primary hover:underline inline-flex items-center gap-1"
          >
            Vai agli articoli <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Stat n={draftCount} label="Bozze" />
          <Stat n={scheduledCount} label="Programmati" />
          <Stat n={moderationCount} label={isStaff ? "Da moderare" : "In revisione"} />
          <Stat n={publishedCount} label="Pubblicati" />
        </div>
        {lastDraft && (
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-xs font-body text-muted-foreground uppercase tracking-widest mb-2">
              Continua l'ultima bozza
            </p>
            <Link
              to={`/area-personale/articolo/${lastDraft.id}/modifica`}
              className="group inline-flex items-center gap-2 font-body text-sm hover:text-primary transition-colors"
            >
              <Edit3 size={14} />
              <span className="font-medium">{lastDraft.title || "Senza titolo"}</span>
              <ArrowRight
                size={14}
                className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              />
            </Link>
          </div>
        )}
      </Card>

      {/* Grid role-specific */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Editorial */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold flex items-center gap-2">
              <BookOpen size={18} /> Editoriale
            </h3>
            <button
              onClick={() => goTo("editoriale")}
              className="text-xs font-body text-primary hover:underline inline-flex items-center gap-1"
            >
              Apri <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Stat n={editorialCounts?.pending ?? 0} label="In attesa" />
            <Stat n={editorialCounts?.accepted ?? 0} label="Accettate" />
          </div>
          <p className="text-xs font-body text-muted-foreground mt-4">
            Candida un pitch quando le candidature sono aperte.
          </p>
        </Card>

        {isCurator && (
          <Card className="bg-primary/5 border-primary/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <BookOpen size={18} /> Curatela
              </h3>
              <button
                onClick={() => goTo("editoriale-curatela")}
                className="text-xs font-body text-primary hover:underline inline-flex items-center gap-1"
              >
                Gestisci <ArrowRight size={12} />
              </button>
            </div>
            <Stat n={curatelaPending ?? 0} label="Pitch da valutare" />
            <p className="text-xs font-body text-muted-foreground mt-4">
              Sei curatore dell'edizione in corso.
            </p>
          </Card>
        )}

        {canProposeRealities && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <MapPin size={18} /> Realtà proposte
              </h3>
              <button
                onClick={() => goTo("realta")}
                className="text-xs font-body text-primary hover:underline inline-flex items-center gap-1"
              >
                Apri <ArrowRight size={12} />
              </button>
            </div>
            <Stat n={pendingRealities.length} label="In attesa di conferma" />
            {pendingRealities[0] && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-body text-muted-foreground mb-1">Ultima proposta</p>
                <p className="font-body text-sm font-medium truncate">
                  {pendingRealities[0].name}
                </p>
                {pendingRealities[0].auto_confirm_at && (
                  <p className="text-[11px] font-body text-muted-foreground mt-1">
                    Auto-conferma:{" "}
                    {new Date(pendingRealities[0].auto_confirm_at).toLocaleString("it-IT", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                )}
              </div>
            )}
          </Card>
        )}

        {isStaff && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Clock size={18} /> Moderazione
              </h3>
              <button
                onClick={() => goTo("moderazione")}
                className="text-xs font-body text-primary hover:underline inline-flex items-center gap-1"
              >
                Apri <ArrowRight size={12} />
              </button>
            </div>
            <Stat n={moderationCount} label="Articoli da revisionare" />
          </Card>
        )}

        {isAdmin && (
          <Card className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <ShieldCheck size={18} /> Sistema
              </h3>
              <button
                onClick={() => goTo("admin")}
                className="text-xs font-body text-primary hover:underline inline-flex items-center gap-1"
              >
                Pannello admin <ArrowRight size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-muted-foreground mt-1" />
                <Stat n={adminCounts?.messages ?? 0} label="Messaggi nuovi" />
              </div>
              <div className="flex items-start gap-3">
                <Flag size={16} className="text-muted-foreground mt-1" />
                <Stat n={adminCounts?.reports ?? 0} label="Segnalazioni" />
              </div>
              <div className="flex items-start gap-3">
                <CalendarClock size={16} className="text-muted-foreground mt-1" />
                <Stat n={scheduledCount} label="Programmati" />
              </div>
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-muted-foreground mt-1" />
                <Stat n={moderationCount} label="Da moderare" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
};

export default PanelPanoramica;
