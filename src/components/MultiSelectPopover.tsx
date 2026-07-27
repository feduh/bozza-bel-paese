import { useMemo, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  label: string;
  placeholder: string;
  options: string[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  className?: string;
};

/**
 * Popover multi-select con checkbox e ricerca interna.
 * Trigger a piena larghezza, stile brutalist coerente con gli altri filtri.
 */
const MultiSelectPopover = ({ label, placeholder, options, selected, onChange, className }: Props) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return options;
    return options.filter((o) => o.toLowerCase().includes(term));
  }, [options, q]);

  const toggle = (val: string) => {
    const next = new Set(selected);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    onChange(next);
  };

  const count = selected.size;
  const buttonLabel =
    count === 0
      ? placeholder
      : count === 1
      ? [...selected][0]
      : `${label} · ${count}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={`inline-flex items-center justify-between gap-2 min-h-[44px] px-4 py-2.5 brutalist-border bg-background text-sm focus:outline-none focus:border-primary ${
            count > 0 ? "border-primary" : ""
          } ${className ?? "w-full"}`}
        >
          <span className={`truncate ${count === 0 ? "text-foreground/60" : "text-foreground"}`}>
            {buttonLabel}
          </span>
          <span className="inline-flex items-center gap-1 shrink-0">
            {count > 0 && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onChange(new Set()); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(new Set());
                  }
                }}
                aria-label="Rimuovi selezione"
                className="p-0.5 rounded hover:bg-muted cursor-pointer"
              >
                <X size={13} />
              </span>
            )}
            <ChevronDown size={14} className="text-foreground/60" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(320px,90vw)] p-0 brutalist-border bg-background z-[1000]"
      >
        <div className="p-2 border-b-2 border-foreground">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Filtra ${label.toLowerCase()}…`}
            className="w-full px-2 py-1.5 bg-background text-sm focus:outline-none border border-foreground/20 focus:border-primary"
          />
        </div>
        <div className="max-h-72 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-3 py-4 text-xs text-foreground/60 text-center">Nessuna opzione</p>
          )}
          {filtered.map((opt) => {
            const checked = selected.has(opt);
            return (
              <label
                key={opt}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-foreground/5"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => toggle(opt)}
                  aria-label={opt}
                />
                <span className="flex-1 truncate">{opt}</span>
              </label>
            );
          })}
        </div>
        {count > 0 && (
          <div className="p-2 border-t-2 border-foreground flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-[0.12em] font-bold text-foreground/70">
              {count} selezionati
            </span>
            <button
              type="button"
              onClick={() => onChange(new Set())}
              className="text-[11px] uppercase tracking-[0.12em] font-bold text-destructive hover:underline"
            >
              Pulisci
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectPopover;
