import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "@/components/Navbar";

let mockUser: any = null;
const mockSignOut = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut,
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: false }),
  },
}));

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  const renderNavbar = () =>
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

  it("renders brand name and nav links", () => {
    renderNavbar();
    expect(screen.getByText("Il Bel Paese")).toBeInTheDocument();
    expect(screen.getAllByText("Home").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Blog").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Mappatura").length).toBeGreaterThan(0);
  });

  it("shows Accedi button when not logged in", () => {
    renderNavbar();
    const loginLinks = screen.getAllByText("Accedi");
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it("shows Esci button when logged in", () => {
    mockUser = { id: "user-1", email: "test@test.com" };
    renderNavbar();
    const logoutButtons = screen.getAllByText("Esci");
    expect(logoutButtons.length).toBeGreaterThan(0);
  });

  it("calls signOut when Esci is clicked", () => {
    mockUser = { id: "user-1", email: "test@test.com" };
    renderNavbar();
    // Click the desktop Esci button
    const logoutButtons = screen.getAllByText("Esci");
    fireEvent.click(logoutButtons[0]);
    expect(mockSignOut).toHaveBeenCalled();
  });
});
