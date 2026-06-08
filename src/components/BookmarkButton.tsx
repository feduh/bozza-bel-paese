import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Props = {
  realityId: string;
  variant?: "default" | "compact";
  className?: string;
};

/**
 * Bottone "Salva tra i preferiti" per una realtà.
 * - Visibile solo agli utenti autenticati (gli ospiti vedono CTA al login).
 * - Toggle ottimistico con rollback in caso di errore.
 */
const BookmarkButton = ({ realityId, variant = "default", className }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setSaved(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("reality_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("reality_id", realityId)
        .maybeSingle();
      if (!cancelled) {
        setSaved(!!data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, realityId]);

  const toggle = async () => {
    if (!user) {
      toast({ title: "Accedi per salvare", description: "Entra nell'area membri per salvare i tuoi preferiti." });
      return;
    }
    if (pending) return;
    setPending(true);
    const prev = saved;
    setSaved(!prev);
    try {
      if (prev) {
        const { error } = await supabase
          .from("reality_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("reality_id", realityId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reality_bookmarks")
          .insert({ user_id: user.id, reality_id: realityId });
        if (error) throw error;
      }
    } catch (e) {
      setSaved(prev);
      toast({
        title: "Operazione non riuscita",
        description: "Impossibile aggiornare i preferiti, riprova.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const Icon = pending ? Loader2 : saved ? BookmarkCheck : Bookmark;
  const label = saved ? "Salvata" : "Salva";

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={loading || pending}
        aria-pressed={saved}
        aria-label={saved ? "Rimuovi dai preferiti" : "Salva tra i preferiti"}
        className={cn(
          "inline-flex items-center justify-center h-9 w-9 rounded-full border transition-colors",
          saved
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background/80 border-border hover:bg-accent",
          className,
        )}
      >
        <Icon size={16} className={pending ? "animate-spin" : ""} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading || pending}
      aria-pressed={saved}
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full border transition-colors",
        saved
          ? "bg-primary text-primary-foreground border-primary"
          : "border-primary/30 text-primary hover:bg-primary/10",
        className,
      )}
    >
      <Icon size={12} className={pending ? "animate-spin" : ""} />
      {label}
    </button>
  );
};

export default BookmarkButton;
