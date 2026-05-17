import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";
import { Linkedin, Mail, Globe } from "lucide-react";

const audiences = ["indie", "researchers", "institutions"] as const;

type Collaborator = {
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  role_collective: string | null;
  role_real_life: string | null;
  social_linkedin: string | null;
  public_email: string | null;
  website: string | null;
};

const ChiSiamo = () => {
  const { t } = useTranslation();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, bio, avatar_url, role_collective, role_real_life, social_linkedin, public_email, website")
        .eq("consent_public", true)
        .eq("member_type", "collaboratore")
        .order("display_name", { ascending: true });
      if (cancelled) return;
      setCollaborators((data as Collaborator[]) ?? []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="py-20">
      <SEO title={t("about.title") + " " + t("about.titleAccent")} description={t("about.seoDesc")} canonicalPath="/chi-siamo" />
      <div className="editorial-container max-w-5xl">
        <div className="max-w-3xl">
          <h1 className="editorial-heading mb-8">
            {t("about.title")} <span className="italic text-primary">{t("about.titleAccent")}</span>
          </h1>

          <div className="space-y-6 editorial-body text-muted-foreground">
            <p><Trans i18nKey="about.p1_html" components={{ strong: <strong className="text-foreground" /> }} /></p>
            <p><Trans i18nKey="about.p2_html" components={{ strong: <strong className="text-foreground" /> }} /></p>
            <p>{t("about.p3")}</p>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-lg bg-card border border-border">
            <h3 className="font-display text-xl font-semibold mb-3">{t("about.missionTitle")}</h3>
            <p className="font-body text-muted-foreground">{t("about.missionDesc")}</p>
          </div>
          <div className="p-8 rounded-lg bg-card border border-border">
            <h3 className="font-display text-xl font-semibold mb-3">{t("about.visionTitle")}</h3>
            <p className="font-body text-muted-foreground">{t("about.visionDesc")}</p>
          </div>
        </div>

        {/* Collaboratori del collettivo */}
        <div className="mt-20">
          <h2 className="editorial-subheading mb-3">
            Il <span className="italic text-primary">collettivo</span>
          </h2>
          <p className="font-body text-muted-foreground mb-8 max-w-2xl">
            Le persone che fanno parte del collettivo <em>Il Bel Paese</em>. Ognuna ha scelto liberamente di essere visibile per favorire connessioni e collaborazioni.
          </p>
          {loading ? (
            <p className="font-body text-muted-foreground text-sm">Caricamento…</p>
          ) : collaborators.length === 0 ? (
            <p className="font-body text-muted-foreground text-sm italic">Nessun collaboratore pubblico al momento.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborators.map((c) => (
                <Link
                  key={c.user_id}
                  to={`/autori/${c.user_id}`}
                  className="group p-6 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover bg-muted" loading="lazy" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-xl shrink-0">
                        {c.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-semibold text-base group-hover:text-primary transition-colors">
                        {c.display_name}
                      </h3>
                      {c.role_collective && (
                        <p className="text-xs text-primary font-body mt-0.5">{c.role_collective}</p>
                      )}
                      {c.role_real_life && (
                        <p className="text-xs text-muted-foreground font-body mt-0.5">{c.role_real_life}</p>
                      )}
                    </div>
                  </div>
                  {c.bio && (
                    <p className="mt-3 text-sm text-muted-foreground font-body line-clamp-3">{c.bio}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3 text-muted-foreground">
                    {c.social_linkedin && <Linkedin size={14} aria-hidden="true" />}
                    {c.public_email && <Mail size={14} aria-hidden="true" />}
                    {c.website && <Globe size={14} aria-hidden="true" />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-20">
          <h2 className="editorial-subheading mb-8">
            {t("about.forTitle")} <span className="italic text-primary">{t("about.forTitleAccent")}</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {audiences.map((a) => (
              <div key={a} className="p-6 rounded-lg bg-card border border-border">
                <h4 className="font-display text-lg font-semibold mb-2">{t(`about.audiences.${a}.title`)}</h4>
                <p className="font-body text-sm text-muted-foreground">{t(`about.audiences.${a}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChiSiamo;
