import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import type { ScheduledItem } from "@/components/ScheduledTimeline";

type Props = {
  items: ScheduledItem[];
  showAuthor?: boolean;
};

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const PanelCalendario = ({ items, showAuthor = false }: Props) => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const itemsByDay = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>();
    for (const it of items) {
      const d = new Date(it.scheduled_for);
      const k = dayKey(d);
      const arr = map.get(k) ?? [];
      arr.push(it);
      map.set(k, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
    }
    return map;
  }, [items]);

  const scheduledDays = useMemo(
    () => Array.from(itemsByDay.keys()).map((k) => new Date(k + "T00:00:00")),
    [itemsByDay],
  );

  const selectedItems = selected ? itemsByDay.get(dayKey(selected)) ?? [] : [];
  const selectedLabel = selected
    ? selected.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <section className="p-8 rounded-lg bg-card border border-sky-500/30">
      <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <CalendarClock size={20} className="text-sky-600" />
          Calendario pubblicazioni
          <span className="text-base font-body text-muted-foreground">({items.length})</span>
        </h2>
      </div>
      <p className="text-sm font-body text-muted-foreground mb-6">
        Seleziona un giorno per vedere gli articoli programmati.
      </p>

      <div className="grid md:grid-cols-[auto_1fr] gap-8">
        <div className="rounded-lg border border-border bg-background p-2 self-start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={it}
            weekStartsOn={1}
            showOutsideDays
            modifiers={{ scheduled: scheduledDays }}
            modifiersClassNames={{
              scheduled: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-sky-500",
            }}
          />
        </div>

        <div>
          <p className="font-display text-sm font-semibold text-sky-700 capitalize mb-3">
            {selectedLabel || "Seleziona un giorno"}
          </p>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body italic">
              Nessun articolo programmato in questo giorno.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map((it) => {
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
                      <p className="font-display font-semibold text-sm">{it.title}</p>
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
          )}
        </div>
      </div>
    </section>
  );
};

export default PanelCalendario;
