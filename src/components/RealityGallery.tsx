import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type RealityImage = {
  id: string;
  storage_path: string;
  caption: string | null;
  credit: string | null;
};

const BUCKET = "reality-images";
const publicUrl = (path: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export default function RealityGallery({ realityId }: { realityId: string }) {
  const [images, setImages] = useState<RealityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("reality_images")
      .select("id, storage_path, caption, credit")
      .eq("reality_id", realityId)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setImages(data ?? []);
        setLoading(false);
      });
  }, [realityId]);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null);
      else if (e.key === "ArrowRight") setOpenIdx((i) => (i === null ? null : (i + 1) % images.length));
      else if (e.key === "ArrowLeft") setOpenIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIdx, images.length]);

  if (loading || images.length === 0) return null;

  const current = openIdx !== null ? images[openIdx] : null;

  return (
    <section>
      <h2 className="font-display text-2xl font-semibold mb-4">Galleria</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpenIdx(idx)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            aria-label={`Apri immagine ${idx + 1}`}
          >
            <img
              src={publicUrl(img.storage_path)}
              alt={img.caption ?? `Immagine ${idx + 1}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white font-body line-clamp-2 text-left">
                {img.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {current && openIdx !== null && (
        <div
          className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenIdx(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Visualizzatore immagini"
        >
          <button
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            onClick={() => setOpenIdx(null)}
            aria-label="Chiudi"
          >
            <X size={20} />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
                }}
                aria-label="Precedente"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((i) => (i === null ? null : (i + 1) % images.length));
                }}
                aria-label="Successiva"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <figure
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={publicUrl(current.storage_path)}
              alt={current.caption ?? "Immagine"}
              className="max-w-full max-h-[75vh] object-contain rounded"
            />
            {(current.caption || current.credit) && (
              <figcaption className="mt-3 text-center text-white/90 font-body text-sm max-w-2xl">
                {current.caption && <p>{current.caption}</p>}
                {current.credit && (
                  <p className="text-white/60 text-xs mt-1 italic">© {current.credit}</p>
                )}
              </figcaption>
            )}
            <p className="mt-2 text-white/50 text-xs font-body">
              {openIdx + 1} / {images.length}
            </p>
          </figure>
        </div>
      )}
    </section>
  );
}
