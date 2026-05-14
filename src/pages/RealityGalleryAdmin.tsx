import { useEffect, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import RealityGalleryEditor from "@/components/admin/RealityGalleryEditor";
import SEO from "@/components/SEO";

type RealityRef = {
  id: string;
  name: string;
  city: string;
  region: string;
  created_by: string | null;
  confirmed_status: string;
};

export default function RealityGalleryAdmin() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [reality, setReality] = useState<RealityRef | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    Promise.all([
      supabase
        .from("realities")
        .select("id, name, city, region, created_by, confirmed_status")
        .eq("id", id)
        .single(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]).then(([realityRes, rolesRes]) => {
      setReality(realityRes.data);
      setRoles((rolesRes.data ?? []).map((r) => r.role as string));
      setLoading(false);
    });
  }, [id, user]);

  if (authLoading || loading) {
    return <div className="py-20 text-center editorial-container text-muted-foreground">Caricamento…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!reality) {
    return (
      <div className="py-20 text-center editorial-container">
        <h1 className="editorial-heading mb-4">Realtà non trovata</h1>
        <Link to="/area-personale" className="text-primary hover:underline">Torna all'area personale</Link>
      </div>
    );
  }

  const isStaff = roles.includes("admin") || roles.includes("moderator");
  const isOwnerPending =
    roles.includes("collaborator") &&
    reality.created_by === user.id &&
    reality.confirmed_status === "pendente";

  if (!isStaff && !isOwnerPending) {
    return (
      <div className="py-20 text-center editorial-container">
        <h1 className="editorial-heading mb-4">Accesso negato</h1>
        <p className="text-muted-foreground font-body">
          Non hai i permessi per modificare la galleria di questa realtà.
        </p>
      </div>
    );
  }

  return (
    <div className="py-12">
      <SEO title={`Galleria — ${reality.name}`} description="Gestisci le immagini della realtà" />
      <div className="editorial-container max-w-4xl">
        <Link
          to={`/realta/${reality.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Torna alla scheda
        </Link>
        <h1 className="editorial-heading mb-2">{reality.name}</h1>
        <p className="text-sm text-muted-foreground font-body mb-8">
          {reality.city}, {reality.region}
        </p>
        <RealityGalleryEditor realityId={reality.id} />
      </div>
    </div>
  );
}
