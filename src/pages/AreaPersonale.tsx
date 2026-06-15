import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  User as UserIcon,
  FileText,
  ShieldCheck,
  MapPin,
  CalendarClock,
  Clock,
  Bookmark,
  UserPlus,
} from "lucide-react";
import SEO from "@/components/SEO";
import type { ScheduledItem } from "@/components/ScheduledTimeline";
import { fetchAuthorNames, resolveAuthorName } from "@/lib/authorNames";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PanelProfilo from "@/components/area/PanelProfilo";
import PanelArticoli from "@/components/area/PanelArticoli";
import PanelCalendario from "@/components/area/PanelCalendario";
import PanelModerazione from "@/components/area/PanelModerazione";
import PanelRealta from "@/components/area/PanelRealta";
import PanelPreferiti from "@/components/area/PanelPreferiti";
import InviteMemberForm from "@/components/InviteMemberForm";
import AuditLogPanel from "@/components/admin/AuditLogPanel";
import RealityReportsPanel from "@/components/admin/RealityReportsPanel";
import ContactMessagesPanel from "@/components/admin/ContactMessagesPanel";
import UsersManagementPanel from "@/components/admin/UsersManagementPanel";
import SystemStatusPanel from "@/components/admin/SystemStatusPanel";
import AnalyticsDashboardPanel from "@/components/admin/AnalyticsDashboardPanel";
import type {
  AreaProfile,
  AreaPost,
  AreaModerationPost,
  AreaPendingReality,
  AreaRealityRef,
} from "@/components/area/types";

const AreaPersonale = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profile, setProfile] = useState<AreaProfile | null>(null);
  const [reality, setReality] = useState<AreaRealityRef | null>(null);
  const [posts, setPosts] = useState<AreaPost[]>([]);
  const [myRoles, setMyRoles] = useState<string[]>([]);
  const [moderationQueue, setModerationQueue] = useState<AreaModerationPost[]>([]);
  const [myPendingRealities, setMyPendingRealities] = useState<AreaPendingReality[]>([]);
  const [modNameMap, setModNameMap] = useState<Record<string, string>>({});
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  const isStaff = myRoles.includes("admin") || myRoles.includes("moderator") || myRoles.includes("coordinatore");
  const isAdmin = myRoles.includes("admin");
  const canProposeRealities = isAdmin || myRoles.includes("coordinatore");
  const canInviteMembers = isAdmin || myRoles.includes("coordinatore");

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);

    const { data: prof } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile(prof as AreaProfile | null);

    if (prof?.reality_id) {
      const { data: r } = await supabase
        .from("realities")
        .select("id, name")
        .eq("id", prof.reality_id)
        .maybeSingle();
      setReality((r as AreaRealityRef | null) ?? null);
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const rs = (roles ?? []).map((r: { role: string }) => r.role);
    setMyRoles(rs);

    const { data: mine } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, status, category, cover_image_url, published_at, scheduled_for, reply_to_id")
      .eq("user_id", user.id)
      .order("published_at", { ascending: false });
    setPosts((mine as AreaPost[]) ?? []);

    if (rs.includes("admin") || rs.includes("moderator") || rs.includes("coordinatore")) {
      const { data: queue } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, status, category, cover_image_url, published_at, scheduled_for, reply_to_id, author_name, user_id")
        .eq("status", "pending")
        .order("published_at", { ascending: true });
      const list = (queue as AreaModerationPost[]) ?? [];
      setModerationQueue(list);
      const names = await fetchAuthorNames(list.map((p) => p.user_id));
      setModNameMap(names);
    }

    if (rs.includes("admin") || rs.includes("coordinatore")) {
      const { data: pending } = await supabase
        .from("realities")
        .select("id, name, city, region, auto_confirm_at, created_at")
        .eq("created_by", user.id)
        .eq("confirmed_status", "pendente")
        .order("created_at", { ascending: false });
      setMyPendingRealities((pending as AreaPendingReality[]) ?? []);
    }

    const scheduled: ScheduledItem[] = [];
    const ownScheduled = ((mine as AreaPost[]) ?? []).filter(
      (p) => p.status === "scheduled" && p.scheduled_for,
    );
    for (const p of ownScheduled) {
      scheduled.push({
        id: p.id,
        title: p.title,
        scheduled_for: p.scheduled_for as string,
        isMine: true,
      });
    }
    if (rs.includes("admin")) {
      const { data: coordRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "coordinatore");
      const coordIds = (coordRoles ?? [])
        .map((r: { user_id: string }) => r.user_id)
        .filter((uid: string) => uid !== user.id);
      if (coordIds.length > 0) {
        const { data: coordScheduled } = await supabase
          .from("blog_posts")
          .select("id, title, scheduled_for, author_name, user_id")
          .eq("status", "scheduled")
          .in("user_id", coordIds);
        const names = await fetchAuthorNames(
          (coordScheduled ?? []).map((p: { user_id: string }) => p.user_id),
        );
        for (const p of (coordScheduled ?? []) as Array<{
          id: string;
          title: string;
          scheduled_for: string;
          author_name: string;
          user_id: string;
        }>) {
          if (!p.scheduled_for) continue;
          scheduled.push({
            id: p.id,
            title: p.title,
            scheduled_for: p.scheduled_for,
            author_name: resolveAuthorName(names, p.user_id, p.author_name),
            isMine: false,
          });
        }
      }
    }
    setScheduledItems(scheduled);

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Tab definitions based on role
  const tabs = useMemo(() => {
    const t: Array<{ value: string; label: string; icon: typeof UserIcon; badge?: number }> = [
      { value: "profilo", label: "Profilo", icon: UserIcon },
      { value: "calendario", label: "Calendario", icon: CalendarClock, badge: scheduledItems.length || undefined },
      { value: "articoli", label: "Articoli", icon: FileText, badge: posts.length || undefined },
      { value: "preferiti", label: "Preferiti", icon: Bookmark },
    ];
    if (canProposeRealities) {
      t.push({ value: "realta", label: "Realtà", icon: MapPin, badge: myPendingRealities.length || undefined });
    }
    if (canInviteMembers) {
      t.push({ value: "membri", label: "Membri", icon: UserPlus });
    }
    if (isStaff) {
      t.push({ value: "moderazione", label: "Moderazione", icon: Clock, badge: moderationQueue.length || undefined });
    }
    if (isAdmin) {
      t.push({ value: "admin", label: "Admin", icon: ShieldCheck });
    }
    return t;
  }, [canProposeRealities, isStaff, isAdmin, posts.length, scheduledItems.length, myPendingRealities.length, moderationQueue.length]);

  const tabFromUrl = searchParams.get("tab");
  const activeTab = tabs.some((t) => t.value === tabFromUrl) ? (tabFromUrl as string) : "profilo";

  const setActiveTab = (v: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", v);
    setSearchParams(next, { replace: true });
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="py-16">
      <SEO title="Area personale" description="Dashboard: profilo, calendario, articoli e moderazione." canonicalPath="/area-personale" />
      <div className="editorial-container max-w-5xl">
        <h1 className="editorial-heading mb-2">
          La <span className="italic text-primary">tua area</span>
        </h1>
        <p className="editorial-body text-muted-foreground mb-8">
          Dashboard personale: scegli una sezione dal menù qui sotto.
        </p>

        {loading || !profile ? (
          <div className="text-center py-20 text-muted-foreground font-body">Caricamento…</div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="sticky top-16 z-10 -mx-4 px-4 py-3 bg-background/85 backdrop-blur border-b border-border">
              <TabsList className="h-auto flex flex-wrap gap-1 bg-muted/60 p-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  return (
                    <TabsTrigger
                      key={t.value}
                      value={t.value}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 font-body"
                    >
                      <Icon size={14} />
                      <span>{t.label}</span>
                      {t.badge !== undefined && (
                        <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-background/70 text-foreground border border-border data-[state=active]:bg-primary-foreground/20">
                          {t.badge}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            <TabsContent value="profilo" className="mt-0">
              <PanelProfilo
                profile={profile}
                setProfile={setProfile}
                reality={reality}
                myRoles={myRoles}
                userId={user.id}
                saving={savingProfile}
                setSaving={setSavingProfile}
                msg={profileMsg}
                setMsg={setProfileMsg}
              />
            </TabsContent>

            <TabsContent value="calendario" className="mt-0">
              <PanelCalendario items={scheduledItems} showAuthor={isAdmin} />
            </TabsContent>

            <TabsContent value="articoli" className="mt-0">
              <PanelArticoli posts={posts} isStaff={isStaff} onChanged={loadAll} />
            </TabsContent>

            <TabsContent value="preferiti" className="mt-0">
              <PanelPreferiti userId={user.id} />
            </TabsContent>

            {canProposeRealities && (
              <TabsContent value="realta" className="mt-0">
                <PanelRealta isAdmin={isAdmin} pending={myPendingRealities} onCreated={loadAll} />
              </TabsContent>
            )}

            {canInviteMembers && (
              <TabsContent value="membri" className="mt-0">
                <section className="p-8 rounded-lg bg-card border border-border">
                  <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
                    <UserPlus size={20} /> {isAdmin ? "Invita nuovo membro" : "Invita nuovo autore"}
                  </h2>
                  <p className="font-body text-sm text-muted-foreground mb-6">
                    {isAdmin
                      ? "Crea un account per un nuovo autore o coordinatore del collettivo."
                      : "Crea un account per un nuovo autore del Magazine. Solo l'admin può invitare coordinatori."}
                  </p>
                  <InviteMemberForm allowedRoles={isAdmin ? ["author", "coordinatore"] : ["author"]} />
                </section>
              </TabsContent>
            )}

            {isStaff && (
              <TabsContent value="moderazione" className="mt-0">
                <PanelModerazione queue={moderationQueue} nameMap={modNameMap} onChanged={loadAll} />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="admin" className="mt-0 space-y-8">
                <SystemStatusPanel />
                <AnalyticsDashboardPanel />
                <UsersManagementPanel />
                <ContactMessagesPanel />
                <RealityReportsPanel />
                <AuditLogPanel />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default AreaPersonale;
