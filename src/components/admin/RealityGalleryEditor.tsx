import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Upload, GripVertical, Loader2, ImagePlus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/hooks/use-toast";

type RealityImage = {
  id: string;
  reality_id: string;
  storage_path: string;
  caption: string | null;
  credit: string | null;
  sort_order: number;
};

const BUCKET = "reality-images";
const MAX_SIZE_MB = 8;

const publicUrl = (path: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

function SortableRow({
  img,
  onPersist,
  onDelete,
  saving,
}: {
  img: RealityImage;
  onPersist: (id: string, patch: Partial<RealityImage>) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.id,
  });
  const [caption, setCaption] = useState(img.caption ?? "");
  const [credit, setCredit] = useState(img.credit ?? "");

  useEffect(() => setCaption(img.caption ?? ""), [img.caption]);
  useEffect(() => setCredit(img.credit ?? ""), [img.credit]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-4 p-3 rounded-lg border border-border bg-card"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground self-start mt-2"
        aria-label="Trascina per riordinare"
      >
        <GripVertical size={18} />
      </button>
      <img
        src={publicUrl(img.storage_path)}
        alt={caption || "Immagine realtà"}
        className="w-24 h-24 rounded object-cover border border-border shrink-0"
        loading="lazy"
      />
      <div className="flex-1 grid gap-2">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => {
            if ((img.caption ?? "") !== caption) onPersist(img.id, { caption: caption || null });
          }}
          placeholder="Didascalia (opzionale)"
          maxLength={200}
          className="w-full px-3 py-2 text-sm rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="text"
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
          onBlur={() => {
            if ((img.credit ?? "") !== credit) onPersist(img.id, { credit: credit || null });
          }}
          placeholder="Crediti fotografo (opzionale)"
          maxLength={120}
          className="w-full px-3 py-2 text-sm rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={saving}
        className="self-start mt-1 p-2 rounded text-destructive hover:bg-destructive/10 disabled:opacity-50"
        aria-label="Elimina immagine"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function RealityGalleryEditor({ realityId }: { realityId: string }) {
  const [images, setImages] = useState<RealityImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reality_images")
      .select("*")
      .eq("reality_id", realityId)
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Errore caricamento galleria", description: error.message, variant: "destructive" });
    } else {
      setImages(data ?? []);
    }
    setLoading(false);
  }, [realityId, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non autenticato");
      const startOrder = images.length > 0 ? Math.max(...images.map((i) => i.sort_order)) + 1 : 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          toast({ title: `${file.name} troppo grande`, description: `Max ${MAX_SIZE_MB}MB`, variant: "destructive" });
          continue;
        }
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${realityId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) {
          toast({ title: "Upload fallito", description: upErr.message, variant: "destructive" });
          continue;
        }
        const { error: insErr } = await supabase.from("reality_images").insert({
          reality_id: realityId,
          storage_path: path,
          sort_order: startOrder + i,
          created_by: user.id,
        });
        if (insErr) {
          toast({ title: "Errore database", description: insErr.message, variant: "destructive" });
          await supabase.storage.from(BUCKET).remove([path]);
        }
      }
      await load();
      toast({ title: "Immagini caricate" });
    } finally {
      setUploading(false);
    }
  };

  const persistField = async (id: string, patch: Partial<RealityImage>) => {
    setSavingId(id);
    const { error } = await supabase.from("reality_images").update(patch).eq("id", id);
    setSavingId(null);
    if (error) {
      toast({ title: "Errore salvataggio", description: error.message, variant: "destructive" });
      load();
    } else {
      setImages((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    }
  };

  const deleteImage = async (img: RealityImage) => {
    if (!confirm("Eliminare questa immagine?")) return;
    setSavingId(img.id);
    const { error } = await supabase.from("reality_images").delete().eq("id", img.id);
    if (error) {
      toast({ title: "Errore eliminazione", description: error.message, variant: "destructive" });
    } else {
      await supabase.storage.from(BUCKET).remove([img.storage_path]);
      setImages((prev) => prev.filter((i) => i.id !== img.id));
    }
    setSavingId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = images.findIndex((i) => i.id === active.id);
    const newIdx = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIdx, newIdx).map((img, idx) => ({
      ...img,
      sort_order: idx,
    }));
    setImages(reordered);
    const updates = reordered.map((img) =>
      supabase.from("reality_images").update({ sort_order: img.sort_order }).eq("id", img.id)
    );
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed?.error) {
      toast({ title: "Errore riordino", description: failed.error.message, variant: "destructive" });
      load();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <ImagePlus size={18} /> Galleria immagini ({images.length})
        </h3>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-sm font-body font-medium">
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          Carica immagini
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              handleUpload(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground font-body">Caricamento...</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body italic">
          Nessuna immagine. Carica le prime per iniziare la galleria.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {images.map((img) => (
                <SortableRow
                  key={img.id}
                  img={img}
                  saving={savingId === img.id}
                  onPersist={persistField}
                  onDelete={() => deleteImage(img)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="text-xs text-muted-foreground font-body">
        Trascina per riordinare. Didascalia e crediti vengono salvati quando esci dal campo.
      </p>
    </div>
  );
}
