import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";

export type ScheduledKind = "editoriale" | "podcast" | "magazine";

export type ScheduledItem = {
  id: string;
  title: string;
  scheduled_for: string;
  author_name?: string;
  isMine?: boolean;
  kind?: ScheduledKind;
  category?: string | null;
};

type Props = {
  items: ScheduledItem[];
  showAuthor?: boolean;
};

const ScheduledTimeline = ({ items, showAuthor = false }: Props) => {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-body italic">
        Nessun articolo programmato.
      </p>
    );
  }

  // Group by YYYY-MM-DD
  const groups = new Map<string, ScheduledItem[]>();
  const sorted = [...items].sort(
    (a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime(),
  );
  for (const it of sorted) {
    const d = new Date(it.scheduled_for);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const arr = groups.get(key) ?? [];
    arr.push(it);
    groups.set(key, arr);
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([day, dayItems]) => {
        const dateLabel = new Date(day).toLocaleDateString("it-IT", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        return (
          <div key={day} className="relative pl-6 border-l-2 border-sky-500/30">
            <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-sky-500" />
            <p className="font-display text-sm font-semibold text-sky-700 capitalize mb-3">
              {dateLabel}
            </p>
            <div className="space-y-2">
              {dayItems.map((it) => {
                const time = new Date(it.scheduled_for).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <div
                    key={it.id}
                    className={`p-3 rounded-md border bg-background flex items-start justify-between gap-3 flex-wrap ${
                      it.isMine ? "border-sky-500/40" : "border-border"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs font-body text-sky-600 mb-0.5">
                        <CalendarClock size={12} /> {time}
                        {it.isMine && (
                          <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30">
                            tuo
                          </span>
                        )}
                      </div>
                      <p className="font-display font-semibold text-sm truncate">{it.title}</p>
                      {showAuthor && it.author_name && (
                        <p className="text-xs font-body text-muted-foreground mt-0.5">
                          di {it.author_name}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/area-personale/articolo/${it.id}/modifica`}
                      className="text-xs font-body px-3 py-1.5 rounded-md border border-border hover:border-primary/40 transition-colors"
                    >
                      Apri
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduledTimeline;
