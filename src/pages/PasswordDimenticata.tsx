import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";

const PasswordDimenticata = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="py-20 min-h-[70vh] flex items-center">
      <div className="editorial-container max-w-md w-full mx-auto">
        <div className="text-center mb-10">
          <h1 className="editorial-heading mb-4">
            <span className="italic text-primary">Password dimenticata</span>
          </h1>
          <p className="font-body text-muted-foreground">
            Inserisci l'email associata all'account: ti invieremo un link per reimpostare la password.
          </p>
        </div>

        {sent ? (
          <div className="p-4 rounded-md bg-secondary/10 border border-secondary/20 text-sm font-body">
            ✅ Se l'indirizzo è valido, riceverai a breve una mail con il link per scegliere una nuova password.
            Controlla anche lo spam.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div role="alert" className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-body">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="pwd-email" className="block text-sm font-body font-medium mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="pwd-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-md border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="tu@esempio.it"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-md bg-primary text-primary-foreground font-body font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Invio in corso..." : "Invia link di recupero"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-muted-foreground font-body mt-6">
          <Link to="/login" className="underline hover:text-foreground">Torna al login</Link>
        </p>
      </div>
    </div>
  );
};

export default PasswordDimenticata;
