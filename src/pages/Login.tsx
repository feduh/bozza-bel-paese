import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    navigate("/blog");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage("Controlla la tua email per confermare la registrazione.");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
      else navigate("/blog");
    }
    setLoading(false);
  };

  return (
    <div className="py-20 min-h-[70vh] flex items-center">
      <div className="editorial-container max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <h1 className="editorial-heading mb-4">
            <span className="italic text-primary">{isSignUp ? "Registrati" : "Accedi"}</span>
          </h1>
          <p className="font-body text-muted-foreground">
            Area riservata ai collaboratori per la pubblicazione di articoli.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 rounded-md bg-secondary/20 text-secondary text-sm font-body">
              {message}
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
            {loading ? "Caricamento..." : isSignUp ? "Registrati" : "Accedi"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? "Hai già un account?" : "Non hai un account?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
            className="text-primary hover:underline font-medium"
          >
            {isSignUp ? "Accedi" : "Registrati"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
