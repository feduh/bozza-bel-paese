import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/blog");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    else navigate("/blog");
    setLoading(false);
  };

  return (
    <div className="py-20 min-h-[70vh] flex items-center">
      <div className="editorial-container max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <h1 className="editorial-heading mb-4">
            <span className="italic text-primary">Accedi</span>
          </h1>
          <p className="font-body text-muted-foreground">
            Area riservata ai collaboratori. Le credenziali vengono fornite dall'amministratore del sito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-body font-medium mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="tu@esempio.it"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-body font-medium mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Caricamento..." : isRegister ? "Registrati" : "Accedi"}
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="w-full py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors"
          >
            {isRegister ? "Hai già un account? Accedi" : "Crea account admin (temporaneo)"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
