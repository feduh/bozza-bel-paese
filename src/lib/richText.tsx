import { useRef } from "react";
import { Bold, CornerDownLeft } from "lucide-react";

/**
 * Renderer minimale per testo con **grassetto** e a-capo, giustificato per lettura.
 * Nessuna sintassi complessa: parsing riga per riga, `**...**` diventa <strong>.
 */
export const renderRichText = (raw: string | null | undefined) => {
  if (!raw) return null;
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = escape(raw).replace(
    /\*\*([^*\n]+)\*\*/g,
    '<strong class="font-semibold text-foreground">$1</strong>',
  );
  return (
    <div
      className="whitespace-pre-wrap text-justify hyphens-auto leading-relaxed"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

type ToolbarProps = {
  value: string;
  onChange: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
};

/**
 * Toolbar minima per grassetto + a-capo. Modifica direttamente lo stato del textarea.
 */
export const RichToolbar = ({ value, onChange, textareaRef }: ToolbarProps) => {
  const wrapSelection = (before: string, after: string = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const sel = value.slice(start, end) || "testo";
    const next = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(next);
    // ripristina il focus e la selezione dopo il rerender
    requestAnimationFrame(() => {
      el.focus();
      const newStart = start + before.length;
      el.setSelectionRange(newStart, newStart + sel.length);
    });
  };

  const insertNewline = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const next = value.slice(0, start) + "\n" + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + 1;
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="flex items-center gap-1 mb-2">
      <button
        type="button"
        onClick={() => wrapSelection("**")}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-body font-medium rounded border border-input bg-background hover:bg-muted transition-colors"
        title="Grassetto (avvolge con **)"
        aria-label="Grassetto"
      >
        <Bold size={12} />
      </button>
      <button
        type="button"
        onClick={insertNewline}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-body font-medium rounded border border-input bg-background hover:bg-muted transition-colors"
        title="Inserisci a-capo"
        aria-label="A capo"
      >
        <CornerDownLeft size={12} />
      </button>
      <span className="ml-2 text-[10px] text-muted-foreground font-body">
        Usa <code>**testo**</code> per il grassetto. Gli a-capo sono rispettati.
      </span>
    </div>
  );
};
