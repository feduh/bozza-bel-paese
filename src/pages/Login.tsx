import { useState } from "react";
import { Lock, Mail } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder — will integrate with Lovable Cloud
    alert("Login non ancora attivo. Attiva Lovable Cloud per l'autenticazione.");
  };

  return (
    <div className="py-20 min-h-[70vh] flex items-center">
      <div className="editorial-container max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <h1 className="editorial-heading mb-4">
            <span className="italic text-primary">Accedi</span>
          </h1>
          <p className="font-body text-muted-foreground">
            Area riservata ai collaboratori per la pubblicazione di articoli.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
                className="w-full pl-10 pr-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity"
          >
            Accedi
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Non hai un account? Contatta l'amministratore del progetto.
        </p>
      </div>
    </div>
  );
};

export default Login;
