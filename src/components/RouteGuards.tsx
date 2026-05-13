import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const Loading = () => (
  <div
    className="py-20 text-center text-muted-foreground font-body"
    role="status"
    aria-live="polite"
  >
    Verifica permessi…
  </div>
);

/**
 * Gate a route behind authentication.
 * Redirects to /login preserving the original location for post-login bounce.
 */
export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
};

/**
 * Gate a route behind a specific role (default: "admin").
 * Non-authenticated users are sent to /login; authenticated-but-unauthorised
 * users are sent to the homepage.
 */
export const RequireRole = ({
  role = "admin",
  children,
}: {
  role?: AppRole;
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setAllowed(null);
      return;
    }
    supabase
      .rpc("has_role", { _user_id: user.id, _role: role })
      .then(({ data }) => {
        if (!cancelled) setAllowed(!!data);
      });
    return () => {
      cancelled = true;
    };
  }, [user, role]);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowed === null) return <Loading />;
  if (!allowed) return <Navigate to="/" replace />;
  return <>{children}</>;
};
