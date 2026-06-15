import SEO from "@/components/SEO";

const CookiePolicy = () => (
  <>
    <SEO title="Cookie Policy — Il Bel Paese" description="Informativa sull'uso dei cookie da parte di Il Bel Paese." canonicalPath="/cookie-policy" />
    <article className="editorial-container py-12 prose prose-neutral max-w-3xl">
      <h1>Cookie Policy</h1>
      <p>Questo sito utilizza cookie tecnici necessari al funzionamento e cookie analitici per misurare in forma aggregata l'utilizzo del sito.</p>
      <h2>Cookie tecnici</h2>
      <p>Indispensabili per l'autenticazione, le preferenze di lingua e tema. Non richiedono consenso.</p>
      <h2>Cookie di terze parti</h2>
      <ul>
        <li><strong>Lovable Cloud / Supabase</strong> — sessione utente.</li>
        <li><strong>OpenStreetMap</strong> — tiles della mappa.</li>
      </ul>
      <h2>Gestione</h2>
      <p>Puoi disabilitare i cookie dalle impostazioni del tuo browser. La disattivazione dei cookie tecnici può compromettere il funzionamento del sito.</p>
      <p>Per dettagli sul trattamento dei dati, consulta la <a href="/privacy">Privacy Policy</a>.</p>
      <p className="text-sm text-muted-foreground">Aggiornata: Giugno 2026</p>
    </article>
  </>
);

export default CookiePolicy;
