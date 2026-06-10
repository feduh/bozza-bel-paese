import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Admin from "@/pages/Admin";

// L'autenticazione/autorizzazione è gestita da RouteGuards (RequireRole),
// quindi qui testiamo solo la composizione della pagina admin.

vi.mock("@/components/InviteMemberForm", () => ({
  default: ({ allowedRoles }: { allowedRoles: string[] }) => (
    <div data-testid="invite-member-form">{allowedRoles.join(",")}</div>
  ),
}));
vi.mock("@/components/RealityForm", () => ({ default: () => <div data-testid="reality-form" /> }));
vi.mock("@/components/admin/AuditLogPanel", () => ({ default: () => <div data-testid="audit-log" /> }));
vi.mock("@/components/admin/RealityReportsPanel", () => ({ default: () => <div data-testid="reality-reports" /> }));
vi.mock("@/components/admin/ContactMessagesPanel", () => ({ default: () => <div data-testid="contact-messages" /> }));
vi.mock("@/components/admin/UsersManagementPanel", () => ({ default: () => <div data-testid="users-management" /> }));
vi.mock("@/components/admin/SystemStatusPanel", () => ({ default: () => <div data-testid="system-status" /> }));
vi.mock("@/components/admin/AnalyticsDashboardPanel", () => ({ default: () => <div data-testid="analytics-dashboard" /> }));

describe("Admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAdmin = () =>
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

  it("renders the admin panel heading", () => {
    renderAdmin();
    expect(screen.getByText("Pannello Admin")).toBeInTheDocument();
  });

  it("renders the invite member section with both roles for admin", () => {
    renderAdmin();
    expect(screen.getByText("Invita membro")).toBeInTheDocument();
    expect(screen.getByTestId("invite-member-form")).toHaveTextContent("author,coordinatore");
  });

  it("renders all admin panels", () => {
    renderAdmin();
    expect(screen.getByTestId("system-status")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-dashboard")).toBeInTheDocument();
    expect(screen.getByTestId("users-management")).toBeInTheDocument();
    expect(screen.getByTestId("contact-messages")).toBeInTheDocument();
    expect(screen.getByTestId("reality-reports")).toBeInTheDocument();
    expect(screen.getByTestId("audit-log")).toBeInTheDocument();
    expect(screen.getByTestId("reality-form")).toBeInTheDocument();
  });

  it("renders the add reality section", () => {
    renderAdmin();
    expect(screen.getByText("Aggiungi realtà")).toBeInTheDocument();
  });
});
