import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "@/pages/Login";

const mockSignIn = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    signIn: mockSignIn,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

  it("renders login form with email and password fields", () => {
    renderLogin();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Accedi");
    expect(screen.getByPlaceholderText("tu@esempio.it")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("shows error message on failed login", async () => {
    mockSignIn.mockResolvedValue({ error: { message: "Credenziali non valide" } });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("tu@esempio.it"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Accedi" }));

    await waitFor(() => {
      expect(screen.getByText("Credenziali non valide")).toBeInTheDocument();
    });
  });

  it("navigates to /blog on successful login", async () => {
    mockSignIn.mockResolvedValue({ error: null });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("tu@esempio.it"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "goodpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Accedi" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/blog");
    });
  });

  it("disables button while loading", async () => {
    mockSignIn.mockImplementation(() => new Promise(() => {})); // never resolves

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText("tu@esempio.it"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "pass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Accedi" }));

    await waitFor(() => {
      expect(screen.getByText("Caricamento...")).toBeInTheDocument();
    });
  });
});
