import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type BookmarkedReality = {
  id: string;
  name: string;
  city: string;
  region: string | null;
  category: string | null;
  image_url: string | null;
  bookmarked_at: string;
};

type Props = { userId: string };

const PanelPreferiti = ({ userId }: Props) => {
  const [items, setItems] = useState<BookmarkedReality[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("reality_bookmarks")
      .select("created_at, reality:realities(id, name, city, region, category, image_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    const list: BookmarkedReality[] = (data ?? [])
      .map((row: { created_at: string; reality: BookmarkedReality | null }) =>
        row.reality ? { ...row.reality, bookmarked_at: row.created_at } : null,
      )
      .filter((x): x is BookmarkedReality => x !== null);
    setItems(list);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const remove = async (realityId: string) => {
    setItems((prev) => prev.filter((r) => r.id !== realityId));
    await supabase
      .from("reality_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("reality_id", realityId);
  };

  return (
    <section className="p-6 sm:p-8 rounded-lg bg-card border border-border">
      <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
        <Bookmark size={20} /> Realtà preferite
      </h2>
      {loading ? (
        <div className="py-10 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" size={16} /> Caricamento…
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body py-6">
          Non hai ancora salvato nessuna realtà. Apri una scheda dalla{" "}
          <Link to="/mappatura" className="text-primary hover:underline">
            mappa
          </Link>{" "}
          e tocca il segnalibro per aggiungerla qui.
        </p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {items.map((r) => (
            <li key={r.id} className="rounded-md border border-border overflow-hidden bg-background flex flex-col">
              <Link to={`/realta/${r.id}`} className="block aspect-[16/9] bg-muted overflow-hidden">
                {r.image_url ? (
                  <img
                    src={r.image_url}
                    alt={r.name}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <MapPin size={32} />
                  </div>
                )}
              </Link>
              <div className="p-3 flex-1 flex flex-col gap-2">
                <Link to={`/realta/${r.id}`} className="font-display font-semibold hover:text-primary transition-colors">
                  {r.name}
                </Link>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={11} /> {r.city}
                  {r.region ? `, ${r.region}` : ""}
                </p>
                <div className="mt-auto flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Rimuovi
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PanelPreferiti;
