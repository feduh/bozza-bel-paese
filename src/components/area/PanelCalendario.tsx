import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, BookOpen, Mic, Newspaper, ChevronRight, Filter } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import type { ScheduledItem, ScheduledKind } from "@/components/ScheduledTimeline";

type Props = {
  items: ScheduledItem[];
  showAuthor?: boolean;
};

type KindConfig = {
  key: ScheduledKind;
  label: string;
  icon: typeof BookOpen;
  dot: string; // bg utility
  text: string;
  chipBg: string;
  chipBorder: string;
  rail: string;
};

const KIND_CONFIG: Record<ScheduledKind, KindConfig> = {
  editoriale: {
    key: "editoriale",
    label: "Editoriale",
    icon: BookOpen,
    dot: "bg-primary",
    text: "text-primary",
    chipBg: "bg-primary/10",
    chipBorder: "border-primary/30",
    rail: "before:bg-primary",
  },
  podcast: {
    key: "podcast",
    label: "Podcast",
    icon: Mic,
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-500",
    chipBg: "bg-amber-500/10",
    chipBorder: "border-amber-500/30",
    rail: "before:bg-amber-500",
  },
  magazine: {
    key: "magazine",
    label: "Magazine",
    icon: Newspaper,
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-400",
    chipBg: "bg-sky-500/10",
    chipBorder: "border-sky-500/30",
    rail: "before:bg-sky-500",
  },
};

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const PanelCalendario = ({ items, showAuthor = false }: Props) => {
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [activeKinds, setActiveKinds] = useState<Set<ScheduledKind>>(
    new Set(["editoriale", "podcast", "magazine"]),
  );

  const toggleKind = (k: ScheduledKind) => {
    setActiveKinds((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        if (next.size > 1) next.delete(k);
      } else {
        next.add(k);
      }
      return next;
    });
  };

  const filtered = useMemo(
    () => items.filter((i) => activeKinds.has(i.kind ?? "magazine")),
    [items, activeKinds],
  );

  const itemsByDay = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>();
    for (const it of filtered) {
      const d = new Date(it.scheduled_for);
      const k = dayKey(d);
      const arr = map.get(k) ?? [];
      arr.push(it);
      map.set(k, arr);
    }
    for (const arr of map.values()) {
      arr.sort(
        (a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime(),
      );
    }
    return map;
  }, [filtered]);

  const daysByKind = useMemo(() => {
    const editoriale: Date[] = [];
    const podcast: Date[] = [];
    const magazine: Date[] = [];
    for (const [k, arr] of itemsByDay) {
      const kinds = new Set(arr.map((a) => a.kind ?? "magazine"));
      const d = new Date(k + "T00:00:00");
      if (kinds.has("editoriale")) editoriale.push(d);
      if (kinds.has("podcast")) podcast.push(d);
      if (kinds.has("magazine")) magazine.push(d);
    }
    return { editoriale, podcast, magazine };
  }, [itemsByDay]);

  const selectedItems = selected ? itemsByDay.get(dayKey(selected)) ?? [] : [];
  const selectedLabel = selected
    ? selected.toLocaleDateString("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const counts = useMemo(() => {
    const c = { editoriale: 0, podcast: 0, magazine: 0 } as Record<ScheduledKind, number>;
    for (const it of items) c[it.kind ?? "magazine"]++;
    return c;
  }, [items]);

  return (
    <section className="rounded-xl bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 md:px-8 pt-6 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-body uppercase tracking-widest text-muted-foreground">
              Agenda editoriale
            </p>
            <h2 className="font-display text-xl md:text-2xl font-semibold flex items-center gap-2 mt-1">
              <CalendarClock size={22} className="text-primary" />
              Calendario pubblicazioni
              <span className="text-base font-body text-muted-foreground font-normal">
                ({items.length})
              </span>
            </h2>
          </div>

          {/* Legenda / filtri */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={14} className="text-muted-foreground mr-1" />
            {(Object.keys(KIND_CONFIG) as ScheduledKind[]).map((k) => {
              const cfg = KIND_CONFIG[k];
              const Icon = cfg.icon;
              const active = activeKinds.has(k);
              return (
                <button
                  key={k}
                  onClick={() => toggleKind(k)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-body font-medium border transition-all ${
                    active
                      ? `${cfg.chipBg} ${cfg.chipBorder} ${cfg.text}`
                      : "bg-muted/40 border-border text-muted-foreground opacity-60 hover:opacity-100"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <Icon size={11} />
                  {cfg.label}
                  <span className="text-[10px] opacity-70">{counts[k]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid lg:grid-cols-[auto_1fr] gap-0">
        {/* Calendar */}
        <div className="p-4 md:p-6 lg:border-r lg:border-border bg-muted/20">
          <div className="rounded-lg border border-border bg-background p-2 max-w-full">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              locale={it}
              weekStartsOn={1}
              showOutsideDays
              modifiers={{
                hasEditoriale: daysByKind.editoriale,
                hasPodcast: daysByKind.podcast,
                hasMagazine: daysByKind.magazine,
              }}
              modifiersClassNames={{
                hasEditoriale:
                  "relative after:absolute after:bottom-1 after:left-[calc(50%-8px)] after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary",
                hasPodcast:
                  "relative before:absolute before:bottom-1 before:left-[calc(50%-1px)] before:w-1.5 before:h-1.5 before:rounded-full before:bg-amber-500 before:z-[1]",
                hasMagazine:
                  "[&>*]:relative [&>*]:after:content-[''] [&>*]:after:absolute [&>*]:after:bottom-1 [&>*]:after:left-[calc(50%+6px)] [&>*]:after:w-1.5 [&>*]:after:h-1.5 [&>*]:after:rounded-full [&>*]:after:bg-sky-500",
              }}
            />
          </div>
        </div>

        {/* Agenda giorno */}
        <div className="p-5 md:p-8 min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
            <p className="font-display text-base md:text-lg font-semibold capitalize">
              {selectedLabel || "Seleziona un giorno"}
            </p>
            <span className="text-xs font-body text-muted-foreground">
              {selectedItems.length === 0
                ? "0 pubblicazioni"
                : `${selectedItems.length} ${selectedItems.length === 1 ? "pubblicazione" : "pubblicazioni"}`}
            </span>
          </div>

          {selectedItems.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-border rounded-lg bg-muted/20">
              <CalendarClock className="mx-auto mb-2 text-muted-foreground opacity-50" size={28} />
              <p className="text-sm text-muted-foreground font-body italic">
                Nessuna pubblicazione programmata in questo giorno.
              </p>
            </div>
          ) : (
            <ol className="relative space-y-3">
              {selectedItems.map((it) => {
                const kind = it.kind ?? "magazine";
                const cfg = KIND_CONFIG[kind];
                const Icon = cfg.icon;
                const time = new Date(it.scheduled_for).toLocaleTimeString("it-IT", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return (
                  <li
                    key={it.id}
                    className={`group relative pl-4 pr-3 py-3 rounded-lg border bg-background flex items-start gap-3 transition-all hover:shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r ${cfg.rail} ${cfg.chipBorder}`}
                  >
                    {/* time column */}
                    <div className="flex flex-col items-center justify-center min-w-14 py-1 px-2 rounded-md bg-muted/40 border border-border">
                      <span className={`font-display text-sm font-bold tabular-nums ${cfg.text}`}>
                        {time}
                      </span>
                      <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">
                        ora
                      </span>
                    </div>

                    {/* content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-body font-semibold uppercase tracking-wider border ${cfg.chipBg} ${cfg.chipBorder} ${cfg.text}`}
                        >
                          <Icon size={10} />
                          {cfg.label}
                        </span>
                        {it.isMine && (
                          <span className="text-[10px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary">
                            tuo
                          </span>
                        )}
                      </div>
                      <p className="font-display font-semibold text-sm md:text-base leading-snug line-clamp-2">
                        {it.title}
                      </p>
                      {showAuthor && it.author_name && (
                        <p className="text-xs font-body text-muted-foreground mt-1">
                          di {it.author_name}
                        </p>
                      )}
                    </div>

                    <Link
                      to={`/area-personale/articolo/${it.id}/modifica`}
                      className="self-center inline-flex items-center gap-1 text-xs font-body font-medium px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted hover:border-primary/40 transition-colors"
                      aria-label={`Apri ${it.title}`}
                    >
                      Apri
                      <ChevronRight size={12} className="opacity-70 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
};

export default PanelCalendario;
