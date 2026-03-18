import { Skeleton } from "@/components/ui/skeleton";
import { Map } from "lucide-react";

const MapFallback = ({ height = "400px" }: { height?: string }) => (
  <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30" style={{ height }}>
    <Map className="text-muted-foreground mb-2 animate-pulse" size={32} />
    <p className="text-sm text-muted-foreground font-body">Caricamento mappa…</p>
  </div>
);

export default MapFallback;
