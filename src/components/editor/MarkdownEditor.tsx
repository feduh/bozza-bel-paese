import { useState, useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Code,
  Eye,
  Pencil,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  invalid?: boolean;
};

const wordsPerMinute = 200;

const MarkdownEditor = ({ value, onChange, maxLength = 50000, invalid }: Props) => {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const ref = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => {
    const text = value.replace(/[#>*_`\-\[\]()!]/g, "").trim();
    const words = text ? text.split(/\s+/).length : 0;
    const minutes = Math.max(1, Math.round(words / wordsPerMinute));
    return { chars: value.length, words, minutes };
  }, [value]);

  const wrap = (before: string, after = before, placeholder = "testo") => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const sel = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + sel.length);
    });
  };

  const prefix = (token: string) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const next = value.slice(0, lineStart) + token + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const insertLink = () => {
    const url = window.prompt("URL del link:", "https://");
    if (!url) return;
    wrap("[", `](${url})`, "testo del link");
  };

  return (
    <div className={`rounded-md border ${invalid ? "border-destructive" : "border-input"} bg-background overflow-hidden`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-muted/30 flex-wrap">
        <button type="button" onClick={() => wrap("**")} aria-label="Grassetto" className="p-1.5 rounded hover:bg-background transition-colors"><Bold size={14} /></button>
        <button type="button" onClick={() => wrap("*")} aria-label="Corsivo" className="p-1.5 rounded hover:bg-background transition-colors"><Italic size={14} /></button>
        <span className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => prefix("## ")} aria-label="Titolo 2" className="p-1.5 rounded hover:bg-background transition-colors"><Heading2 size={14} /></button>
        <button type="button" onClick={() => prefix("### ")} aria-label="Titolo 3" className="p-1.5 rounded hover:bg-background transition-colors"><Heading3 size={14} /></button>
        <span className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={() => prefix("- ")} aria-label="Elenco puntato" className="p-1.5 rounded hover:bg-background transition-colors"><List size={14} /></button>
        <button type="button" onClick={() => prefix("1. ")} aria-label="Elenco numerato" className="p-1.5 rounded hover:bg-background transition-colors"><ListOrdered size={14} /></button>
        <button type="button" onClick={() => prefix("> ")} aria-label="Citazione" className="p-1.5 rounded hover:bg-background transition-colors"><Quote size={14} /></button>
        <span className="w-px h-4 bg-border mx-1" />
        <button type="button" onClick={insertLink} aria-label="Link" className="p-1.5 rounded hover:bg-background transition-colors"><LinkIcon size={14} /></button>
        <button type="button" onClick={() => wrap("`")} aria-label="Codice" className="p-1.5 rounded hover:bg-background transition-colors"><Code size={14} /></button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-body ${tab === "write" ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}
          >
            <Pencil size={12} /> Scrivi
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-body ${tab === "preview" ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}
          >
            <Eye size={12} /> Anteprima
          </button>
        </div>
      </div>

      {/* Body */}
      {tab === "write" ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          rows={18}
          placeholder="Scrivi qui il tuo articolo. Supporta Markdown: **grassetto**, *corsivo*, ## titoli, - elenchi, > citazioni, [link](url)…"
          className="w-full px-4 py-3 font-mono text-sm bg-background focus:outline-none resize-y min-h-[400px]"
        />
      ) : (
        <div className="px-4 py-3 min-h-[400px] prose prose-sm max-w-none dark:prose-invert font-body">
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Niente da mostrare. Scrivi qualcosa nella tab “Scrivi”.</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-border bg-muted/20 text-xs text-muted-foreground font-body">
        <span>
          {stats.words} parole · ~{stats.minutes} min di lettura
        </span>
        <span className={stats.chars > maxLength * 0.9 ? "text-destructive" : ""}>
          {stats.chars.toLocaleString("it-IT")} / {maxLength.toLocaleString("it-IT")}
        </span>
      </div>
    </div>
  );
};

export default MarkdownEditor;
