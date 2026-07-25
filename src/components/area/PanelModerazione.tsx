import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Trash2 } from "lucide-react";
import { resolveAuthorName } from "@/lib/authorNames";
import type { AreaModerationPost } from "./types";

type Props = {
  queue: AreaModerationPost[];
  nameMap: Record<string, string>;
  onChanged: () => void;
};

const PanelModerazione = ({ queue, nameMap, onChanged }: Props) => {
  const moderateAction = async (id: string, action: "publish" | "reject" | "delete") => {
    if (action === "delete") {
      if (!confirm("Eliminare l'articolo?")) return;
      await supabase.from("blog_posts").delete().eq("id", id);
    } else if (action === "publish") {
      await supabase
        .from("blog_posts")
        .update({ status: "published", published_at: new Date().toISOString() })
        .eq("id", id);
    } else {
      await supabase.from("blog_posts").update({ status: "draft" }).eq("id", id);
    }
    onChanged();
  };

  return (
    <section className="p-8 rounded-lg bg-card border border-amber-500/30">
      <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
        <Clock size={20} className="text-amber-600" /> Coda di moderazione
        <span className="text-base font-body text-muted-foreground">({queue.length})</span>
      </h2>
      {queue.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body italic">
          Nessun articolo in attesa di moderazione.
        </p>
      ) : (
        <div className="space-y-3">
          {queue.map((p) => (
            <div key={p.id} className="p-4 rounded-md border border-border bg-background">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold mb-1">{p.title}</p>
                  <p className="text-xs text-muted-foreground font-body mb-1">
                    di {resolveAuthorName(nameMap, p.user_id, p.author_name)} · {p.category}
                    {p.reply_to_id && " · risposta"}
                  </p>
                  <p className="text-sm font-body text-muted-foreground line-clamp-2">{p.excerpt}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/area-personale/articolo/${p.id}/modifica`}
                    className="text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40 transition-colors"
                  >
                    Apri
                  </Link>
                  <button
                    onClick={() => moderateAction(p.id, "publish")}
                    className="text-xs font-body px-3 py-1.5 rounded-md bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500/25 transition-colors"
                  >
                    Pubblica
                  </button>
                  <button
                    onClick={() => moderateAction(p.id, "reject")}
                    className="text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-amber-500/40 transition-colors"
                  >
                    Rimanda in bozza
                  </button>
                  <button
                    onClick={() => moderateAction(p.id, "delete")}
                    className="text-xs font-body px-3 py-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PanelModerazione;
