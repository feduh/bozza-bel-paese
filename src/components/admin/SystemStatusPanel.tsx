import { useEffect, useState } from "react";
import { Activity, Users, FileText, MapPin, Clock, Mail, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Counts = {
  usersByRole: Record<string, number>;
  postsByStatus: Record<string, number>;
  realitiesByStatus: Record<string, number>;
  pendingExpiring24h: number;
  contactNew: number;
  reportsNew: number;
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderatori (legacy)",
  coordinatore: "Coordinatori",
  author: "Autori",
};

const POST_STATUS_LABEL: Record<string, string> = {
  draft: "Bozze",
  pending: "In moderazione",
  scheduled: "Programmati",
  published: "Pubblicati",
};

const REALITY_STATUS_LABEL: Record<string, string> = {
  pendente: "In attesa",
  confermato: "Confermate",
  storico: "Storiche",
};

const SystemStatusPanel = () => {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const in24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const [
        rolesRes,
        postsRes,
        realitiesRes,
        pendingExpRes,
        contactRes,
        reportsRes,
      ] = await Promise.all([
        supabase.from("user_roles").select("role"),
        supabase.from("blog_posts").select("status"),
        supabase.from("realities").select("confirmed_status"),
        supabase
          .from("realities")
          .select("id", { count: "exact", head: true })
          .eq("confirmed_status", "pendente")
          .not("auto_confirm_at", "is", null)
          .lte("auto_confirm_at", in24h),
        supabase
          .from("contact_messages")
          .select("id", { count: "exact", head: true })
          .eq("status", "nuovo"),
        supabase
          .from("reality_reports")
          .select("id", { count: "exact", head: true })
          .eq("status", "nuova"),
      ]);

      if (rolesRes.error) throw rolesRes.error;
      if (postsRes.error) throw postsRes.error;
      if (realitiesRes.error) throw realitiesRes.error;

      const usersByRole: Record<string, number> = {};
      (rolesRes.data ?? []).forEach((r: { role: string }) => {
        usersByRole[r.role] = (usersByRole[r.role] ?? 0) + 1;
      });

      const postsByStatus: Record<string, number> = {};
      (postsRes.data ?? []).forEach((p: { status: string }) => {
        postsByStatus[p.status] = (postsByStatus[p.status] ?? 0) + 1;
      });

      const realitiesByStatus: Record<string, number> = {};
      (realitiesRes.data ?? []).forEach((r: { confirmed_status: string }) => {
        realitiesByStatus[r.confirmed_status] =
          (realitiesByStatus[r.confirmed_status] ?? 0) + 1;
      });

      setCounts({
        usersByRole,
        postsByStatus,
        realitiesByStatus,
        pendingExpiring24h: pendingExpRes.count ?? 0,
        contactNew: contactRes.count ?? 0,
        reportsNew: reportsRes.count ?? 0,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Errore nel caricamento";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-8 rounded-lg bg-card border border-border mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Activity size={20} /> Stato sistema
        </h2>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs font-body px-3 py-1.5 rounded-md border border-input hover:border-primary/40 disabled:opacity-50"
        >
          {loading ? "Aggiornamento…" : "Aggiorna"}
        </button>
      </div>

      {error && (
        <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body mb-4">
          {error}
        </div>
      )}

      {loading && !counts ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-md bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : counts ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            icon={<Users size={16} />}
            title="Utenti per ruolo"
            entries={Object.entries(counts.usersByRole).map(([k, v]) => [
              ROLE_LABEL[k] ?? k,
              v,
            ])}
          />
          <StatCard
            icon={<FileText size={16} />}
            title="Articoli per stato"
            entries={Object.entries(counts.postsByStatus).map(([k, v]) => [
              POST_STATUS_LABEL[k] ?? k,
              v,
            ])}
          />
          <StatCard
            icon={<MapPin size={16} />}
            title="Realtà per stato"
            entries={Object.entries(counts.realitiesByStatus).map(([k, v]) => [
              REALITY_STATUS_LABEL[k] ?? k,
              v,
            ])}
          />
          <StatCard
            icon={<Clock size={16} />}
            title="Realtà pending in scadenza"
            highlight={counts.pendingExpiring24h > 0}
            entries={[["Auto-conferma entro 24h", counts.pendingExpiring24h]]}
          />
          <StatCard
            icon={<Mail size={16} />}
            title="Messaggi di contatto"
            highlight={counts.contactNew > 0}
            entries={[["Nuovi da leggere", counts.contactNew]]}
          />
          <StatCard
            icon={<Flag size={16} />}
            title="Segnalazioni realtà"
            highlight={counts.reportsNew > 0}
            entries={[["Nuove da valutare", counts.reportsNew]]}
          />
        </div>
      ) : null}
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  entries,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  entries: Array<[string, number]>;
  highlight?: boolean;
}) => (
  <div
    className={`p-4 rounded-md border ${
      highlight ? "border-primary/40 bg-primary/5" : "border-border bg-background"
    }`}
  >
    <div className="flex items-center gap-2 text-xs font-body text-muted-foreground uppercase tracking-wide mb-3">
      {icon}
      {title}
    </div>
    {entries.length === 0 ? (
      <p className="text-sm font-body text-muted-foreground italic">Nessun dato</p>
    ) : (
      <ul className="space-y-1.5">
        {entries.map(([label, value]) => (
          <li key={label} className="flex items-center justify-between text-sm font-body">
            <span className="text-foreground">{label}</span>
            <span className="font-display text-lg font-semibold tabular-nums">{value}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default SystemStatusPanel;
