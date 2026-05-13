import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { UserPlus, Users, Shield, Eye, EyeOff, MapPinPlus } from "lucide-react";
import RealityForm from "@/components/RealityForm";

type Profile = {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  website: string | null;
  social_instagram: string | null;
  social_twitter: string | null;
  created_at: string;
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Invite form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"user" | "moderator">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }

    const checkAdmin = async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (!data) { navigate("/"); return; }
      setIsAdmin(true);
      setChecking(false);
    };
    checkAdmin();
  }, [user, authLoading, navigate]);

  const fetchProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles((data as Profile[]) ?? []);
    setLoadingProfiles(false);
  };

  useEffect(() => {
    if (isAdmin) fetchProfiles();
  }, [isAdmin]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const { data, error: fnError } = await supabase.functions.invoke("invite-collaborator", {
      body: { email, password, display_name: displayName, role },
    });

    if (fnError) {
      setError(fnError.message);
    } else if (data?.error) {
      setError(data.error);
    } else {
      setMessage(`✅ ${data.message}. Credenziali: ${email} / ${password}`);
      setEmail("");
      setPassword("");
      setDisplayName("");
      setRole("user");
      fetchProfiles();
    }
    setSubmitting(false);
  };

  if (authLoading || checking) {
    return <div className="py-20 text-center text-muted-foreground font-body">Verifica permessi...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="py-20">
      <div className="editorial-container max-w-4xl">
        <h1 className="editorial-heading mb-4">
          <span className="italic text-primary">Pannello Admin</span>
        </h1>
        <p className="editorial-body text-muted-foreground mb-12">
          Gestisci i collaboratori del blog e del sito.
        </p>

        {/* Invite form */}
        <div className="p-8 rounded-lg bg-card border border-border mb-12">
          <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
            <UserPlus size={20} /> Invita collaboratore
          </h2>
          <form onSubmit={handleInvite} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body">{error}</div>
            )}
            {message && (
              <div className="p-4 rounded-md bg-secondary/10 text-foreground text-sm font-body border border-secondary/20">{message}</div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body font-medium mb-2">Nome visualizzato *</label>
                <input
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Mario Rossi"
                  className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-body font-medium mb-2">Email *</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="collaboratore@esempio.it"
                  className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-body font-medium mb-2">Password *</label>
                <div className="relative">
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-body font-medium mb-2">Ruolo</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "user" | "moderator")}
                  className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="user">Collaboratore</option>
                  <option value="moderator">Moderatore</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "Creazione..." : "Crea account"}
            </button>
          </form>
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

        {/* Collaborators list */}
        <div>
          <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
            <Users size={20} /> Collaboratori
          </h2>
          {loadingProfiles ? (
            <div className="text-center py-8 text-muted-foreground font-body">Caricamento...</div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground font-body">
              Nessun collaboratore ancora. Usa il form sopra per invitarne uno.
            </div>
          ) : (
            <div className="grid gap-4">
              {profiles.map((profile) => (
                <div key={profile.id} className="flex items-center gap-4 p-5 rounded-lg bg-card border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-display font-bold text-sm">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-sm">{profile.display_name}</p>
                    <p className="font-body text-xs text-muted-foreground truncate">{profile.bio || "Nessuna bio"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-body text-muted-foreground">
                    <Shield size={12} />
                    <span>{new Date(profile.created_at).toLocaleDateString("it-IT")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
