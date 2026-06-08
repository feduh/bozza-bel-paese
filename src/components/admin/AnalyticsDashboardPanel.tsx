import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Users,
  MapPin,
  FileText,
  Mail,
  Bookmark,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Kpi = {
  realitiesTotal: number;
  realitiesConfirmed: number;
  realitiesPending: number;
  postsTotal: number;
  postsPublished: number;
  postsPending: number;
  profilesTotal: number;
  contactsNew: number;
  bookmarksTotal: number;
  notificationsUnread: number;
};

type TopReality = { id: string; name: string; city: string; bookmarks: number };
type RecentSignup = { user_id: string; display_name: string; created_at: string };
type CategoryRow = { category: string; total: number };

const fmt = (n: number) => new Intl.NumberFormat("it-IT").format(n);

const AnalyticsDashboardPanel = () => {
  const [loading, setLoading] = useState(true);
  const [kpi, setKpi] = useState<Kpi | null>(null);
  const [topRealities, setTopRealities] = useState<TopReality[]>([]);
  const [recentSignups, setRecentSignups] = useState<RecentSignup[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const count = async (
        table: "realities" | "blog_posts" | "profiles" | "contact_messages" | "reality_bookmarks" | "notifications",
        build?: (q: ReturnType<typeof supabase.from>) => unknown,
      ): Promise<number> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let q: any = supabase.from(table).select("*", { count: "exact", head: true });
        if (build) q = build(q);
        const { count: c } = await q;
        return c ?? 0;
      };

      const [
        realitiesTotal,
        realitiesConfirmed,
        realitiesPending,
        postsTotal,
        postsPublished,
        postsPending,
        profilesTotal,
        contactsNew,
        bookmarksTotal,
        notificationsUnread,
      ] = await Promise.all([
        count("realities"),
        count("realities", (q) => q.eq("confirmed_status", "confermato")),
        count("realities", (q) => q.eq("confirmed_status", "pendente")),
        count("blog_posts"),
        count("blog_posts", (q) => q.eq("status", "published")),
        count("blog_posts", (q) => q.eq("status", "pending")),
        count("profiles"),
        count("contact_messages", (q) => q.eq("status", "nuovo")),
        count("reality_bookmarks"),
        count("notifications", (q) => q.is("read_at", null)),
      ]);

      setKpi({
        realitiesTotal,
        realitiesConfirmed,
        realitiesPending,
        postsTotal,
        postsPublished,
        postsPending,
        profilesTotal,
        contactsNew,
        bookmarksTotal,
        notificationsUnread,
      });

      // Top realities by bookmarks (aggregate in JS, dataset is small).
      const { data: bm } = await supabase
        .from("reality_bookmarks")
        .select("reality_id");
      const counts = new Map<string, number>();
      (bm ?? []).forEach((row: { reality_id: string }) => {
        counts.set(row.reality_id, (counts.get(row.reality_id) ?? 0) + 1);
      });
      const topIds = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);
      if (topIds.length > 0) {
        const { data: rs } = await supabase
          .from("realities")
          .select("id, name, city")
          .in("id", topIds);
        const list: TopReality[] = (rs ?? [])
          .map((r: { id: string; name: string; city: string }) => ({
            ...r,
            bookmarks: counts.get(r.id) ?? 0,
          }))
          .sort((a, b) => b.bookmarks - a.bookmarks);
        setTopRealities(list);
      } else {
        setTopRealities([]);
      }

      // Recent signups
      const { data: signups } = await supabase
        .from("profiles")
        .select("user_id, display_name, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      setRecentSignups((signups as RecentSignup[]) ?? []);

      // Top reality categories
      const { data: cats } = await supabase
        .from("realities")
        .select("category")
        .eq("confirmed_status", "confermato");
      const catMap = new Map<string, number>();
      (cats ?? []).forEach((r: { category: string | null }) => {
        const k = r.category ?? "Senza categoria";
        catMap.set(k, (catMap.get(k) ?? 0) + 1);
      });
      const catRows = Array.from(catMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([category, total]) => ({ category, total }));
      setTopCategories(catRows);

      setLoading(false);
    };
    load();
  }, []);

  if (loading || !kpi) {
    return (
      <section className="p-6 sm:p-8 rounded-lg bg-card border border-border mb-12">
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={20} /> Panoramica
        </h2>
        <div className="py-10 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={16} /> Carico le metriche…
        </div>
      </section>
    );
  }

  const kpiCards = [
    {
      label: "Realtà sulla mappa",
      value: kpi.realitiesConfirmed,
      sub: `${fmt(kpi.realitiesPending)} in attesa · ${fmt(kpi.realitiesTotal)} totali`,
      icon: MapPin,
    },
    {
      label: "Articoli pubblicati",
      value: kpi.postsPublished,
      sub: `${fmt(kpi.postsPending)} da revisionare · ${fmt(kpi.postsTotal)} totali`,
      icon: FileText,
    },
    {
      label: "Membri registrati",
      value: kpi.profilesTotal,
      sub: "Profili attivi nella community",
      icon: Users,
    },
    {
      label: "Contatti nuovi",
      value: kpi.contactsNew,
      sub: "Messaggi non ancora lavorati",
      icon: Mail,
    },
    {
      label: "Preferiti salvati",
      value: kpi.bookmarksTotal,
      sub: "Bookmark dei membri",
      icon: Bookmark,
    },
    {
      label: "Notifiche da leggere",
      value: kpi.notificationsUnread,
      sub: "In coda agli utenti",
      icon: Clock,
    },
  ];

  const maxCat = topCategories[0]?.total ?? 1;

  return (
    <section className="p-6 sm:p-8 rounded-lg bg-card border border-border mb-12">
      <h2 className="font-display text-xl font-semibold mb-1 flex items-center gap-2">
        <BarChart3 size={20} /> Panoramica
      </h2>
      <p className="text-sm text-muted-foreground font-body mb-6">
        Indicatori chiave aggiornati in tempo reale.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpiCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="rounded-md border border-border bg-background p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-body">
                  {c.label}
                </span>
                <Icon size={16} className="text-primary" />
              </div>
              <div className="font-display text-3xl font-semibold">{fmt(c.value)}</div>
              <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-md border border-border bg-background p-4">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Realtà più salvate
          </h3>
          {topRealities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun preferito ancora.</p>
          ) : (
            <ul className="space-y-2">
              {topRealities.map((r, i) => (
                <li key={r.id} className="flex items-center justify-between text-sm">
                  <Link to={`/realta/${r.id}`} className="flex items-center gap-2 hover:text-primary">
                    <span className="text-muted-foreground w-5 text-xs">{i + 1}.</span>
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground">· {r.city}</span>
                  </Link>
                  <span className="text-xs font-mono text-muted-foreground">
                    {fmt(r.bookmarks)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-md border border-border bg-background p-4">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-primary" /> Categorie principali
          </h3>
          {topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna realtà confermata.</p>
          ) : (
            <ul className="space-y-2">
              {topCategories.map((c) => (
                <li key={c.category} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body">{c.category}</span>
                    <span className="text-xs text-muted-foreground font-mono">{fmt(c.total)}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(c.total / maxCat) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-md border border-border bg-background p-4 lg:col-span-2">
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Users size={16} className="text-primary" /> Ultimi membri
          </h3>
          {recentSignups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun membro registrato.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recentSignups.map((s) => (
                <li key={s.user_id} className="py-2 flex items-center justify-between text-sm">
                  <span className="font-body">{s.display_name || "Senza nome"}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default AnalyticsDashboardPanel;
