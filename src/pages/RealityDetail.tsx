import { useState, useEffect, lazy, Suspense } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, ArrowLeft, Globe, Mail, Phone, Instagram, Facebook, Linkedin, Video, ImagePlus, Users } from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
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
import { escapeHtml } from "@/lib/utils";

const LazyMap = lazy(() => import("@/components/LazyMap"));

const RealityDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [reality, setReality] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [members, setMembers] = useState<Array<{ user_id: string; display_name: string; avatar_url: string | null; role_collective: string | null; member_type: string | null }>>([]);
  const [loading, setLoading] = useState(true);
  const [canEditGallery, setCanEditGallery] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("realities").select("*").eq("id", id!).single();
      if (data) {
        setReality(data);
        const { data: tagsData } = await supabase.from("reality_tags").select("tag").eq("reality_id", id!);
        setTags(tagsData?.map((t) => t.tag) ?? []);

        const { data: membersData } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url, role_collective, member_type")
          .eq("reality_id", id!)
          .eq("consent_public", true)
          .order("member_type", { ascending: true });
        setMembers(membersData ?? []);

        if (user) {
          const { data: rolesData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);
          const roles = (rolesData ?? []).map((r) => r.role as string);
          const isStaff = roles.includes("admin") || roles.includes("moderator");
          const isOwnerPending =
            roles.includes("coordinatore") &&
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
    <div className="bg-background py-16 md:py-20">
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
            <div className="ml-auto flex items-center gap-2">
              <BookmarkButton realityId={reality.id} />
              {canEditGallery && (
                <Link
                  to={`/admin/realta/${reality.id}/galleria`}
                  className="inline-flex items-center gap-1.5 text-xs font-body font-medium px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                >
                  <ImagePlus size={12} /> Modifica galleria
                </Link>
              )}
            </div>
          </div>
          <h1 className="font-display uppercase tracking-tight leading-[0.95] text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 break-words hyphens-auto" style={{ fontVariationSettings: "'wght' 700" }}>{reality.name}</h1>
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
              <div className="overflow-hidden h-[400px]">
                <Suspense fallback={<MapFallback height="400px" />}>
                  <LazyMap
                    center={[reality.lat, reality.lng]}
                    zoom={14}
                    cluster={false}
                  markers={[
                    (() => {
                      const addr = [reality.address, reality.city, reality.region].filter(Boolean).join(", ");
                      const locLine = reality.type === "nomade"
                        ? "Realtà itinerante — senza sede fissa"
                        : (addr || "Sede non specificata");
                      return {
                        id: reality.id,
                        lat: reality.lat,
                        lng: reality.lng,
                        name: reality.name,
                        popupContent: `<strong style="font-family:var(--font-display,serif)">${escapeHtml(reality.name)}</strong><br/><span style="font-size:12px;opacity:.8">${escapeHtml(locLine)}</span>`,
                        color: config.markerColor,
                        outline: config.outline,
                      };
                    })(),
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
              </dl>
            </div>


            <div className="p-6 rounded-lg bg-card border border-border">
              <h3 className="font-display text-lg font-semibold mb-4">Contatti</h3>
              {(() => {
                const items: { icon: any; label: string; href: string; text: string }[] = [];
                if (reality.contact_email) items.push({ icon: Mail, label: "Email", href: `mailto:${reality.contact_email}`, text: reality.contact_email });
                if (reality.contact_phone) items.push({ icon: Phone, label: "Telefono", href: `tel:${String(reality.contact_phone).replace(/\s+/g, "")}`, text: reality.contact_phone });
                if (reality.ig_link) items.push({ icon: Instagram, label: "Instagram", href: reality.ig_link, text: reality.ig_link.replace(/^https?:\/\/(www\.)?/, "") });
                if (reality.fb_link) items.push({ icon: Facebook, label: "Facebook", href: reality.fb_link, text: reality.fb_link.replace(/^https?:\/\/(www\.)?/, "") });
                if (reality.linkedin_link) items.push({ icon: Linkedin, label: "LinkedIn", href: reality.linkedin_link, text: reality.linkedin_link.replace(/^https?:\/\/(www\.)?/, "") });
                if (reality.social_vimeo) items.push({ icon: Video, label: "Vimeo", href: reality.social_vimeo, text: reality.social_vimeo.replace(/^https?:\/\/(www\.)?/, "") });
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
                          target={href.startsWith("mailto:") || href.startsWith("tel:") ? undefined : "_blank"}
                          rel={href.startsWith("mailto:") || href.startsWith("tel:") ? undefined : "noopener noreferrer"}
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
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={16} className="text-primary" /> Membri di riferimento
              </h3>
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground font-body">Nessun membro collegato pubblicamente.</p>
              ) : (
                <ul className="space-y-3">
                  {members.map((m) => (
                    <li key={m.user_id}>
                      <Link
                        to={`/autori/${m.user_id}`}
                        className="flex items-center gap-3 group"
                      >
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt={m.display_name} className="w-10 h-10 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-display font-semibold text-sm">
                            {m.display_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-body font-medium text-sm group-hover:text-primary transition-colors truncate">
                            {m.display_name}
                          </div>
                          {(m.role_collective || m.member_type) && (
                            <div className="text-xs text-muted-foreground font-body truncate">
                              {m.role_collective || (m.member_type === "coordinatore" ? "Coordinatore" : "Autore")}
                            </div>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
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
