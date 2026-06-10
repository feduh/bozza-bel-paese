import { UserPlus, MapPinPlus } from "lucide-react";
import RealityForm from "@/components/RealityForm";
import InviteMemberForm from "@/components/InviteMemberForm";
import AuditLogPanel from "@/components/admin/AuditLogPanel";
import RealityReportsPanel from "@/components/admin/RealityReportsPanel";
import ContactMessagesPanel from "@/components/admin/ContactMessagesPanel";
import UsersManagementPanel from "@/components/admin/UsersManagementPanel";
import SystemStatusPanel from "@/components/admin/SystemStatusPanel";
import AnalyticsDashboardPanel from "@/components/admin/AnalyticsDashboardPanel";

const Admin = () => {
  return (
    <div className="py-20">
      <div className="editorial-container max-w-4xl">
        <h1 className="editorial-heading mb-4">
          <span className="italic text-primary">Pannello Admin</span>
        </h1>
        <p className="editorial-body text-muted-foreground mb-12">
          Gestisci i membri del blog e del sito.
        </p>

        {/* System status */}
        <SystemStatusPanel />

        {/* Analytics dashboard */}
        <AnalyticsDashboardPanel />

        {/* Invite form */}
        <div className="p-8 rounded-lg bg-card border border-border mb-12">
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <UserPlus size={20} /> Invita membro
          </h2>
          <p className="text-sm text-muted-foreground font-body mb-6">
            Crea un account per un nuovo autore o coordinatore. Solo l'admin può creare coordinatori.
          </p>
          <InviteMemberForm allowedRoles={["author", "coordinatore"]} />
        </div>

        {/* Add reality */}
        <div className="p-8 rounded-lg bg-card border border-border mb-12">
          <h2 className="font-display text-xl font-semibold mb-2 flex items-center gap-2">
            <MapPinPlus size={20} /> Aggiungi realtà
          </h2>
          <p className="text-sm text-muted-foreground font-body mb-6">
            CAP, regione e coordinate vengono ricavati automaticamente da indirizzo + città (geocodifica OpenStreetMap).
          </p>
          <RealityForm />
        </div>

        {/* Users management */}
        <UsersManagementPanel />

        {/* Contact messages */}
        <ContactMessagesPanel />

        {/* Reality reports */}
        <RealityReportsPanel />

        {/* Audit log */}
        <AuditLogPanel />
      </div>
    </div>
  );
};

export default Admin;
