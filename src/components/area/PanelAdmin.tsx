import { useSearchParams } from "react-router-dom";
import { Activity, BarChart3, Users, BookOpen, Mail, Flag, ScrollText } from "lucide-react";
import SystemStatusPanel from "@/components/admin/SystemStatusPanel";
import AnalyticsDashboardPanel from "@/components/admin/AnalyticsDashboardPanel";
import UsersManagementPanel from "@/components/admin/UsersManagementPanel";
import EditorialEditionsPanel from "@/components/admin/EditorialEditionsPanel";
import ContactMessagesPanel from "@/components/admin/ContactMessagesPanel";
import RealityReportsPanel from "@/components/admin/RealityReportsPanel";
import AuditLogPanel from "@/components/admin/AuditLogPanel";

type Section = {
  value: string;
  label: string;
  icon: typeof Activity;
  render: () => JSX.Element;
  badge?: number;
};

type Props = {
  messageCount?: number;
  reportCount?: number;
};

const PanelAdmin = ({ messageCount, reportCount }: Props) => {
  const [params, setParams] = useSearchParams();
  const current = params.get("section") || "sistema";

  const sections: Section[] = [
    { value: "sistema", label: "Stato & Analytics", icon: Activity, render: () => (
      <div className="space-y-8">
        <SystemStatusPanel />
        <AnalyticsDashboardPanel />
      </div>
    )},
    { value: "utenti", label: "Utenti & Ruoli", icon: Users, render: () => <UsersManagementPanel /> },
    { value: "editoriale", label: "Edizioni editoriali", icon: BookOpen, render: () => <EditorialEditionsPanel /> },
    { value: "messaggi", label: "Messaggi", icon: Mail, render: () => <ContactMessagesPanel />, badge: messageCount },
    { value: "segnalazioni", label: "Segnalazioni", icon: Flag, render: () => <RealityReportsPanel />, badge: reportCount },
    { value: "audit", label: "Audit log", icon: ScrollText, render: () => <AuditLogPanel /> },
  ];

  const setSection = (v: string) => {
    const next = new URLSearchParams(params);
    next.set("tab", "admin");
    next.set("section", v);
    setParams(next, { replace: true });
  };

  const active = sections.find((s) => s.value === current) ?? sections[0];

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-card">
        {sections.map((s) => {
          const Icon = s.icon;
          const isActive = s.value === active.value;
          return (
            <button
              key={s.value}
              onClick={() => setSection(s.value)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-body font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent hover:bg-muted text-foreground"
              }`}
            >
              <Icon size={14} />
              <span>{s.label}</span>
              {s.badge ? (
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-primary-foreground/20" : "bg-primary/15 text-primary"
                  }`}
                >
                  {s.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div>{active.render()}</div>
    </section>
  );
};

export default PanelAdmin;
