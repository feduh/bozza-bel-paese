import { MapPin, Compass, Archive, type LucideIcon } from "lucide-react";

export type DbRealityType = "nomade" | "con-sede" | "scomparsa";
export type RealityStatus = "attivo" | "archiviato";

/** Visual category derived from db type + status */
export type Category = "spazio" | "spazio-senza-spazio" | "spazio-fu-spazio" | "spazio-fu-senza";

export const getCategory = (type: DbRealityType, status: RealityStatus): Category => {
  const isSpazio = type === "con-sede";
  if (status === "archiviato") return isSpazio ? "spazio-fu-spazio" : "spazio-fu-senza";
  return isSpazio ? "spazio" : "spazio-senza-spazio";
};

export const categoryConfig: Record<
  Category,
  { label: string; icon: LucideIcon; badgeClass: string; markerColor: string; outline: boolean }
> = {
  spazio: {
    label: "Spazio",
    icon: MapPin,
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    markerColor: "hsl(var(--primary))",
    outline: false,
  },
  "spazio-senza-spazio": {
    label: "Spazio senza spazio",
    icon: Compass,
    badgeClass: "bg-secondary/10 text-secondary border-secondary/30",
    markerColor: "hsl(var(--secondary))",
    outline: false,
  },
  "spazio-fu-spazio": {
    label: "Spazio che fu",
    icon: Archive,
    badgeClass: "bg-card text-primary border-primary/40",
    markerColor: "hsl(var(--primary))",
    outline: true,
  },
  "spazio-fu-senza": {
    label: "Spazio che fu (itinerante)",
    icon: Archive,
    badgeClass: "bg-card text-secondary border-secondary/40",
    markerColor: "hsl(var(--secondary))",
    outline: true,
  },
};

/** Top-level filter buckets matching the brief's three sections */
export type Bucket = "spazi" | "spazi-senza-spazi" | "spazi-che-furono";

export const bucketLabels: Record<Bucket, string> = {
  spazi: "Spazi",
  "spazi-senza-spazi": "Spazi senza spazi",
  "spazi-che-furono": "Spazi che furono",
};

export const matchesBucket = (bucket: Bucket, type: DbRealityType, status: RealityStatus): boolean => {
  if (bucket === "spazi-che-furono") return status === "archiviato";
  if (bucket === "spazi") return status === "attivo" && type === "con-sede";
  return status === "attivo" && type === "nomade";
};
