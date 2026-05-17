import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff } from "lucide-react";
import { PASSWORD_RULES, passwordSchema, passwordStrength } from "@/lib/passwordPolicy";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the recovery link is opened.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setReady(true);
      }
    });
    // Already in a recovery session?
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Password non valida");
      return;
    }
    if (password !== confirm) {
      setError("Le password non coincidono");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    await supabase.auth.signOut();
    navigate("/login", { replace: true, state: { message: "Password aggiornata, accedi con la nuova password." } });
  };

  const strength = passwordStrength(password);

  return (
    <div className="py-20 min-h-[70vh] flex items-center">
      <div className="editorial-container max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <h1 className="editorial-heading mb-4">
            <span className="italic text-primary">Nuova password</span>
          </h1>
          <p className="font-body text-muted-foreground">
            Scegli una password robusta. Verrà richiesto di accedere di nuovo.
          </p>
        </div>

        {!ready ? (
          <div className="p-4 rounded-md bg-muted text-sm font-body text-center">
            Apri questo link dall'email di recupero per continuare.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {error && (
              <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body">{error}</div>
            )}

            <div>
              <label className="block text-sm font-body font-medium mb-2" htmlFor="np">Nuova password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="np"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? "Nascondi password" : "Mostra password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="mt-2 h-1.5 w-full rounded bg-muted overflow-hidden" aria-hidden>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(strength / PASSWORD_RULES.length) * 100}%`,
                    background:
                      strength <= 2 ? "hsl(var(--destructive))" : strength <= 4 ? "hsl(var(--primary) / 0.6)" : "hsl(var(--primary))",
                  }}
                />
              </div>
              <ul className="mt-2 grid grid-cols-2 gap-x-3 text-[11px] font-body">
                {PASSWORD_RULES.map((r) => {
                  const ok = r.test(password);
                  return (
                    <li key={r.label} className={ok ? "text-primary" : "text-muted-foreground"}>
                      {ok ? "✓" : "○"} {r.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-body font-medium mb-2" htmlFor="np2">Conferma password</label>
              <input
                id="np2"
                type={show ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <button
              type="submit"
              disabled={loading || strength < PASSWORD_RULES.length}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Salvataggio..." : "Imposta nuova password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
