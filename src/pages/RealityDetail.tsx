import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, ArrowLeft, Globe, Mail, Instagram, Facebook, Linkedin, ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import MapFallback from "@/components/MapFallback";
import SEO from "@/components/SEO";
import RealityGallery from "@/components/RealityGallery";
import { RealityDetailSkeleton } from "@/components/skeletons";
import {
  type DbRealityType,
  type RealityStatus,
  getCategory,
  categoryConfig,
} from "@/lib/realityCategory";

const LazyMap = lazy(() => import("@/components/LazyMap"));

const RealityDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [reality, setReality] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEditGallery, setCanEditGallery] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("realities").select("*").eq("id", id!).single();
      if (data) {
        setReality(data);
        const { data: tagsData } = await supabase.from("reality_tags").select("tag").eq("reality_id", id!);
        setTags(tagsData?.map((t) => t.tag) ?? []);

        if (user) {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          const roles = (rolesData ?? []).map((r) => r.role as string);
          const isStaff = roles.includes("admin") || roles.includes("moderator");
          const isOwnerPending =
            roles.includes("collaborator") &&
            data.created_by === user.id &&
            data.confirmed_status === "pendente";
          setCanEditGallery(isStaff || isOwnerPending);
        }
      }
      setLoading(false);
    };
    fetch();
  }, [id, user]);

  if (loading) {
    return <RealityDetailSkeleton />;
  }

  if (!reality) {
    return (
      <div className="py-20 text-center editorial-container">
        <h1 className="editorial-heading mb-4">{t("reality.notFound")}</h1>
        <Link to="/mappatura" className="text-primary hover:underline">{t("reality.back")}</Link>
      </div>
    );
  }

  const status = (reality.status ?? "attivo") as RealityStatus;
  const category = getCategory(reality.type as DbRealityType, status);
  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className="py-12">
      <SEO
        title={`${reality.name} — ${reality.city}`}
        description={reality.description}
        type="profile"
        canonicalPath={`/realta/${reality.id}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: reality.name,
          description: reality.description,
          url: reality.website ?? undefined,
          foundingDate: reality.year_founded ? String(reality.year_founded) : undefined,
          dissolutionDate: reality.year_closed ? String(reality.year_closed) : undefined,
          address: {
            "@type": "PostalAddress",
            addressLocality: reality.city,
            addressRegion: reality.region,
            addressCountry: "IT",
          },
          geo:
            reality.lat && reality.lng
              ? { "@type": "GeoCoordinates", latitude: reality.lat, longitude: reality.lng }
              : undefined,
        }}
      />
      <div className="editorial-container">
        <Link to="/mappatura" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft size={16} /> {t("reality.back")}
        </Link>

        <div className="mb-10">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full border ${config.badgeClass}`}>
              <Icon size={12} /> {config.label}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin size={13} /> {reality.city}, {reality.region}
            </span>
            {canEditGallery && (
              <Link
                to={`/admin/realta/${reality.id}/galleria`}
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              >
                <ImagePlus size={12} /> Modifica galleria
              </Link>
            )}
          </div>
          <h1 className="editorial-heading mb-4">{reality.name}</h1>
          <p className="editorial-body text-muted-foreground max-w-3xl">{reality.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">{t("reality.history")}</h2>
              <p className="font-body text-muted-foreground leading-relaxed">{reality.history}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">{t("reality.location")}</h2>
              <div className="rounded-lg overflow-hidden border border-border h-[400px]">
                <Suspense fallback={<MapFallback height="400px" />}>
                  <LazyMap
                    center={[reality.lat, reality.lng]}
                    zoom={14}
                    cluster={false}
                    markers={[
                      {
                        id: reality.id,
                        lat: reality.lat,
                        lng: reality.lng,
                        name: reality.name,
                        popupContent: `<strong>${reality.name}</strong><br/><span style="font-size:12px;opacity:.7">${reality.city}</span>`,
                        color: config.markerColor,
                        outline: config.outline,
                      },
                    ]}
                  />
                </Suspense>
              </div>
            </section>

            <RealityGallery realityId={reality.id} />
          </div>

          <aside className="space-y-6">
            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">{t("reality.info")}</h3>
              <dl className="space-y-3 text-sm font-body">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("reality.founded")}</dt>
                  <dd className="font-medium">{reality.year_founded}</dd>
                </div>
                {reality.year_closed && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t("reality.closed")}</dt>
                    <dd className="font-medium">{reality.year_closed}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("reality.status")}</dt>
                  <dd className="font-medium">{status === "archiviato" ? t("reality.archived") : t("reality.active")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("reality.city")}</dt>
                  <dd className="font-medium">{reality.city}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("reality.region")}</dt>
                  <dd className="font-medium">{reality.region}</dd>
                </div>
                {reality.website && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{t("reality.website")}</dt>
                    <dd>
                      <a href={reality.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                        <Globe size={12} /> {t("reality.visit")}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Contatti</h3>
              {(() => {
                const items: { icon: any; label: string; href: string; text: string }[] = [];
                if (reality.contact_email) items.push({ icon: Mail, label: "Email", href: `mailto:${reality.contact_email}`, text: reality.contact_email });
                if (reality.ig_link) items.push({ icon: Instagram, label: "Instagram", href: reality.ig_link, text: reality.ig_link.replace(/^https?:\/\/(www\.)?/, "") });
                if (reality.fb_link) items.push({ icon: Facebook, label: "Facebook", href: reality.fb_link, text: reality.fb_link.replace(/^https?:\/\/(www\.)?/, "") });
                if (reality.linkedin_link) items.push({ icon: Linkedin, label: "LinkedIn", href: reality.linkedin_link, text: reality.linkedin_link.replace(/^https?:\/\/(www\.)?/, "") });
                if (reality.website) items.push({ icon: Globe, label: "Sito web", href: reality.website, text: reality.website.replace(/^https?:\/\/(www\.)?/, "") });
                if (items.length === 0) {
                  return <p className="text-sm text-muted-foreground font-body">Nessun contatto disponibile.</p>;
                }
                return (
                  <ul className="space-y-3 text-sm font-body">
                    {items.map(({ icon: Icon, label, href, text }) => (
                      <li key={label} className="flex items-start gap-3">
                        <Icon size={16} className="mt-0.5 text-primary shrink-0" />
                        <a
                          href={href}
                          target={href.startsWith("mailto:") ? undefined : "_blank"}
                          rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                          className="text-foreground hover:text-primary hover:underline break-all"
                        >
                          {text}
                        </a>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>

            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">{t("reality.disciplines")}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((d) => (
                  <span key={d} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RealityDetail;
