import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const CoverImageUpload = ({ value, onChange }: Props) => {
  const { user } = useAuth();
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    if (!user) {
      setError("Devi essere autenticato.");
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Formato non supportato. Usa JPG, PNG, WEBP o GIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Immagine troppo grande (max 5 MB).");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("blog-covers")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (upErr) {
      setError(upErr.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("blog-covers").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  const remove = () => {
    onChange("");
    if (ref.current) ref.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-body font-medium">Immagine di copertina</label>
      {value ? (
        <div className="relative rounded-md overflow-hidden border border-input">
          <img src={value} alt="Anteprima copertina" className="w-full max-h-64 object-cover" />
          <button
            type="button"
            onClick={remove}
            aria-label="Rimuovi copertina"
            className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center justify-center gap-2 px-4 py-10 rounded-md border-2 border-dashed border-input hover:border-primary/40 transition-colors text-muted-foreground font-body text-sm disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Caricamento…
            </>
          ) : (
            <>
              <ImageIcon size={20} />
              <span className="flex items-center gap-1">
                <Upload size={14} /> Clicca per caricare un'immagine
              </span>
              <span className="text-xs">JPG, PNG, WEBP, GIF · max 5 MB</span>
            </>
          )}
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept={ACCEPT}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
        className="hidden"
      />
      {error && <p className="text-xs text-destructive font-body">{error}</p>}
    </div>
  );
};

export default CoverImageUpload;
