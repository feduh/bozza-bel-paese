import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Admin from "@/pages/Admin";

const mockNavigate = vi.fn();
let mockUser: any = null;
let mockAuthLoading = false;
const mockRpc = vi.fn();
const mockSelect = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockAuthLoading,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...args: any[]) => mockRpc(...args),
    from: () => ({
      select: () => ({
        order: () => mockSelect(),
      }),
    }),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe("Admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockAuthLoading = false;
  });

  const renderAdmin = () =>
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

  it("shows loading state while checking auth", () => {
    mockAuthLoading = true;
    renderAdmin();
    expect(screen.getByText("Verifica permessi...")).toBeInTheDocument();
  });

  it("redirects to /login when no user", () => {
    mockUser = null;
    renderAdmin();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("redirects to / when user is not admin", async () => {
    mockUser = { id: "user-1" };
    mockRpc.mockResolvedValue({ data: false });

    renderAdmin();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("renders admin panel when user is admin", async () => {
    mockUser = { id: "admin-1" };
    mockRpc.mockResolvedValue({ data: true });
    mockSelect.mockResolvedValue({ data: [] });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("Pannello Admin")).toBeInTheDocument();
    });
    expect(screen.getByText("Invita collaboratore")).toBeInTheDocument();
    expect(screen.getByText("Collaboratori")).toBeInTheDocument();
  });

  it("shows empty state when no profiles", async () => {
    mockUser = { id: "admin-1" };
    mockRpc.mockResolvedValue({ data: true });
    mockSelect.mockResolvedValue({ data: [] });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText(/Nessun collaboratore/)).toBeInTheDocument();
    });
  });

  it("displays profiles list", async () => {
    mockUser = { id: "admin-1" };
    mockRpc.mockResolvedValue({ data: true });
    mockSelect.mockResolvedValue({
      data: [
        {
          id: "p1",
          user_id: "u1",
          display_name: "Mario Rossi",
          bio: "Artista",
          avatar_url: null,
          website: null,
          social_instagram: null,
          social_twitter: null,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
    });

    renderAdmin();

    await waitFor(() => {
      expect(screen.getByText("Mario Rossi")).toBeInTheDocument();
      expect(screen.getByText("Artista")).toBeInTheDocument();
    });
  });
});
