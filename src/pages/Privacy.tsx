import SEO from "@/components/SEO";

const Privacy = () => {
  const updated = "Maggio 2026";
  return (
    <div className="py-20">
      <SEO
        title="Privacy Policy — Il Bel Paese"
        description="Informativa privacy del collettivo Il Bel Paese: dati raccolti, finalità, diritti dell'utente e modalità di contatto."
        canonicalPath="/privacy"
      />
      <article className="editorial-container max-w-3xl">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Aggiornata: {updated}</p>
          <h1 className="editorial-heading mb-4">
            <span className="italic text-primary">Privacy</span> Policy
          </h1>
          <p className="editorial-body text-muted-foreground">
            Questa informativa descrive come Il Bel Paese tratta i dati personali raccolti tramite il sito,
            il modulo contatti, la registrazione collaboratori e la mappatura delle realtà artistiche.
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none font-body space-y-8">
          <section>
            <h2 className="font-display text-xl font-semibold mb-3">1. Titolare del trattamento</h2>
            <p>
              Il titolare del trattamento è il collettivo <strong>Il Bel Paese</strong>. Per qualsiasi richiesta
              relativa ai dati personali puoi scriverci a <a href="mailto:info@artivive.it" className="text-primary hover:underline">info@artivive.it</a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">2. Dati raccolti</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Modulo contatti</strong>: nome, email, oggetto e messaggio che invii volontariamente.</li>
              <li><strong>Account collaboratori/autori</strong> (su invito): email, nome visualizzato, biografia, foto profilo, ruoli e dati professionali che decidi di condividere.</li>
              <li><strong>Segnalazione realtà</strong>: dati della realtà segnalata ed eventuali tuoi recapiti se forniti.</li>
              <li><strong>Dati tecnici minimi</strong>: log di accesso al backend strettamente necessari alla sicurezza del servizio.</li>
            </ul>
            <p className="mt-3">Non utilizziamo cookie di profilazione né strumenti di tracciamento pubblicitario di terze parti.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">3. Finalità del trattamento</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Rispondere alle tue richieste inviate tramite il modulo contatti.</li>
              <li>Gestire gli account dei membri del collettivo e degli autori.</li>
              <li>Pubblicare contenuti editoriali e profili pubblici solo dopo tuo consenso esplicito.</li>
              <li>Mantenere e migliorare la mappatura pubblica delle realtà artistiche italiane.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">4. Base giuridica</h2>
            <p>
              Il trattamento si fonda sul tuo consenso (Art. 6.1.a GDPR) per la visibilità pubblica del profilo e
              sull'esecuzione di un rapporto di collaborazione (Art. 6.1.b GDPR) per la gestione dell'account.
              Per le richieste inviate tramite il modulo contatti la base giuridica è il legittimo interesse a
              rispondere alle comunicazioni ricevute (Art. 6.1.f GDPR).
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">5. Conservazione dei dati</h2>
            <p>
              I messaggi del modulo contatti vengono conservati per il tempo necessario a gestire la richiesta e,
              al massimo, per 24 mesi. I dati degli account vengono conservati finché l'account è attivo; alla
              cancellazione vengono rimossi entro 30 giorni, salvo obblighi di legge.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">6. Condivisione con terzi</h2>
            <p>
              I dati sono ospitati su infrastruttura cloud europea fornita da Lovable Cloud, utilizzata per
              database, autenticazione e storage. Non vendiamo né cediamo i tuoi dati a terzi per finalità di
              marketing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">7. I tuoi diritti</h2>
            <p>
              In qualsiasi momento puoi richiedere accesso, rettifica, cancellazione, limitazione o portabilità
              dei tuoi dati, oltre a revocare il consenso prestato. Scrivici a
              <a href="mailto:info@artivive.it" className="text-primary hover:underline"> info@artivive.it</a> e
              risponderemo entro 30 giorni.
            </p>
            <p>Puoi inoltre proporre reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-primary hover:underline">garanteprivacy.it</a>).</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold mb-3">8. Modifiche</h2>
            <p>
              Eventuali aggiornamenti a questa policy saranno pubblicati su questa pagina indicandone la data
              di aggiornamento.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
};

export default Privacy;
