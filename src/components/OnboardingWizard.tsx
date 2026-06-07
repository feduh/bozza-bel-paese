import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, UserCircle2, Map, Compass } from "lucide-react";

/**
 * Onboarding wizard mostrato al primo login dopo l'invito.
 *
 * Trigger:
 * - utente autenticato
 * - flag `onboarding_done:<user_id>` assente in localStorage
 * - profilo esistente (creato dall'edge function `invite-collaborator`)
 *
 * 3 step:
 *   1. Benvenuto
 *   2. Completa profilo (CTA → /area-membri?tab=profilo)
 *   3. Tour rapido (mappa, magazine, area membri)
 */
const STORAGE_KEY = "onboarding_done";

const OnboardingWizard = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    if (loading || !user) return;
    const key = `${STORAGE_KEY}:${user.id}`;
    if (localStorage.getItem(key) === "1") return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      // Mostra solo se il profilo esiste (utente invitato), non per sign-up generici.
      if (data) {
        setDisplayName(data.display_name || "");
        setOpen(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const finish = () => {
    if (user) localStorage.setItem(`${STORAGE_KEY}:${user.id}`, "1");
    setOpen(false);
  };

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const progress = ((step + 1) / 3) * 100;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) finish();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2 text-2xl">
            {step === 0 && <Sparkles className="h-6 w-6 text-primary" />}
            {step === 1 && <UserCircle2 className="h-6 w-6 text-primary" />}
            {step === 2 && <Compass className="h-6 w-6 text-primary" />}
            {step === 0 && `Benvenuto/a${displayName ? `, ${displayName}` : ""}!`}
            {step === 1 && "Completa il tuo profilo"}
            {step === 2 && "Cosa puoi fare qui"}
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            {step === 0 &&
              "Sei dentro Il Bel Paese, la mappa delle realtà artistiche italiane. Bastano due minuti per iniziare al meglio."}
            {step === 1 &&
              "Aggiungi una bio, una foto e i tuoi link sociali. Il profilo è visibile solo ai membri, salvo tuo esplicito consenso pubblico."}
            {step === 2 &&
              "Esplora la mappa, leggi il magazine e gestisci articoli e realtà dalla tua area personale."}
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-1.5" />

        <div className="py-2">
          {step === 0 && (
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-primary font-bold">1.</span>
                Completi il tuo profilo
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">2.</span>
                Scopri come muoverti nella piattaforma
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">3.</span>
                Inizia a contribuire
              </li>
            </ul>
          )}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Vai nella sezione <strong>Profilo</strong> della tua area personale per:
              </p>
              <ul className="space-y-2 text-sm list-disc list-inside">
                <li>Caricare la foto profilo</li>
                <li>Scrivere una breve bio</li>
                <li>Aggiungere link a Instagram, LinkedIn, sito personale</li>
                <li>Decidere se rendere il profilo pubblico</li>
              </ul>
              <Button asChild variant="outline" size="sm" className="mt-2">
                <Link to="/area-membri?tab=profilo" onClick={finish}>
                  Apri il profilo ora
                </Link>
              </Button>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/mappatura"
                onClick={finish}
                className="rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <Map className="h-5 w-5 text-primary mb-1.5" />
                <div className="font-medium text-sm">Mappa</div>
                <div className="text-xs text-muted-foreground">
                  Esplora le realtà sul territorio
                </div>
              </Link>
              <Link
                to="/magazine"
                onClick={finish}
                className="rounded-md border p-3 hover:bg-accent transition-colors"
              >
                <Sparkles className="h-5 w-5 text-primary mb-1.5" />
                <div className="font-medium text-sm">Magazine</div>
                <div className="text-xs text-muted-foreground">
                  Articoli e contributi dei membri
                </div>
              </Link>
              <Link
                to="/area-membri"
                onClick={finish}
                className="rounded-md border p-3 hover:bg-accent transition-colors sm:col-span-2"
              >
                <UserCircle2 className="h-5 w-5 text-primary mb-1.5" />
                <div className="font-medium text-sm">Area membri</div>
                <div className="text-xs text-muted-foreground">
                  Profilo, articoli, calendario e moderazione
                </div>
              </Link>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={step === 0 ? finish : prev}
          >
            {step === 0 ? "Salta" : "Indietro"}
          </Button>
          {step < 2 ? (
            <Button size="sm" onClick={next}>
              Avanti
            </Button>
          ) : (
            <Button size="sm" onClick={finish}>
              Inizia
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
