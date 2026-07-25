import SEO from "@/components/SEO";

const Privacy = () => {
  return (
    <div className="py-20">
      <SEO
        title="Privacy Policy — Il Bel Paese"
        description="Informativa privacy del collettivo Il Bel Paese: dati raccolti, finalità, diritti dell'utente e modalità di contatto."
        canonicalPath="/privacy"
      />
      <article className="editorial-container max-w-3xl">
        <header className="mb-12">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Aggiornata: Luglio 2026</p>
          <h1 className="editorial-heading mb-4"><span className="italic text-primary">Privacy</span> Policy</h1>
          <p className="editorial-body text-muted-foreground">
            Questa informativa descrive come Il Bel Paese tratta i dati personali raccolti tramite il sito,
            il modulo contatti, la registrazione coordinatori e la mappatura delle realtà artistiche, ai sensi
            del Regolamento (UE) 2016/679 (GDPR) e del D.lgs. 196/2003 e ss.mm.ii.
          </p>
        </header>
        <div className="prose prose-neutral max-w-none font-body space-y-8">
          <section><h2 className="font-display text-xl font-semibold mb-3">1. Titolare del trattamento</h2>
            <p>Il titolare del trattamento è il collettivo <strong>Il Bel Paese</strong>. Per qualsiasi richiesta relativa ai dati personali puoi scriverci a <a href="mailto:info.ilbelpaese@gmail.com" className="text-primary hover:underline">info.ilbelpaese@gmail.com</a>.</p>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">2. Dati raccolti</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Modulo contatti</strong>: nome, email, oggetto e messaggio che invii volontariamente.</li>
              <li><strong>Account coordinatori/autori</strong> (su invito): email, nome visualizzato, biografia, foto profilo, ruoli, social, città e dati professionali che decidi di condividere.</li>
              <li><strong>Segnalazione realtà</strong>: dati della realtà segnalata, indirizzo, coordinate, descrizione ed eventuali tuoi recapiti se forniti.</li>
              <li><strong>Contenuti editoriali</strong>: testi, immagini e metadati degli articoli che pubblichi come autore.</li>
              
              <li><strong>Dati tecnici minimi</strong>: log di accesso al backend e audit log delle azioni amministrative, strettamente necessari alla sicurezza del servizio.</li>
            </ul>
            <p className="mt-3">Non utilizziamo cookie di profilazione né strumenti di tracciamento pubblicitario di terze parti. Il sito è disponibile esclusivamente in lingua italiana.</p>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">3. Finalità del trattamento</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Rispondere alle richieste inviate tramite il modulo contatti.</li>
              <li>Gestire gli account dei membri del collettivo e degli autori delle realtà mappate.</li>
              <li>Pubblicare contenuti editoriali e profili pubblici solo dopo consenso esplicito (campo <em>consent_public</em>).</li>
              <li>Mantenere e migliorare la mappatura pubblica delle realtà artistiche italiane.</li>
              
              <li>Garantire la sicurezza del servizio e prevenire abusi.</li>
            </ul>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">4. Base giuridica</h2>
            <p>Il trattamento si fonda su: consenso esplicito (Art. 6.1.a GDPR) per la visibilità pubblica del profilo e per l'iscrizione alla newsletter; esecuzione di un rapporto di collaborazione (Art. 6.1.b GDPR) per la gestione degli account dei membri; legittimo interesse (Art. 6.1.f GDPR) per rispondere alle richieste del modulo contatti e per la sicurezza del servizio.</p>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">5. Conservazione dei dati</h2>
            <p>I messaggi del modulo contatti vengono conservati per il tempo necessario a gestire la richiesta e, al massimo, per 24 mesi. I dati degli account vengono conservati finché l'account è attivo; alla cancellazione vengono rimossi entro 30 giorni, salvo obblighi di legge. Gli audit log delle azioni amministrative sono conservati per 12 mesi a fini di sicurezza.</p>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">6. Condivisione con terzi</h2>
            <p>I dati sono ospitati su infrastruttura cloud europea fornita da <strong>Lovable Cloud</strong> (database, autenticazione, storage ed edge functions). Per la mappa utilizziamo i tile cartografici di <strong>OpenStreetMap</strong> e <strong>CARTO</strong>, che possono raccogliere log tecnici (IP, user-agent) per finalità di sicurezza. Per l'autocompletamento degli indirizzi utilizziamo il servizio <strong>Photon</strong> (Komoot, basato su OpenStreetMap). Non vendiamo né cediamo i dati a terzi per finalità di marketing.</p>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">7. Trasferimento extra-UE</h2>
            <p>I dati sono trattati all'interno dello Spazio Economico Europeo. Eventuali trasferimenti verso paesi terzi avvengono solo sulla base di garanzie adeguate (clausole contrattuali standard approvate dalla Commissione Europea).</p>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">8. I tuoi diritti</h2>
            <p>In qualsiasi momento puoi richiedere accesso, rettifica, cancellazione, limitazione o portabilità dei tuoi dati, oltre a revocare il consenso prestato e a opporti al trattamento. Scrivici a <a href="mailto:info.ilbelpaese@gmail.com" className="text-primary hover:underline">info.ilbelpaese@gmail.com</a> e risponderemo entro 30 giorni.</p>
            <p>Puoi inoltre proporre reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-primary hover:underline">garanteprivacy.it</a>).</p>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">9. Sicurezza</h2>
            <p>Adottiamo misure tecniche e organizzative adeguate: cifratura TLS, autenticazione con password robuste, policy Row-Level Security sul database, accesso al backend limitato a ruoli autorizzati (admin, moderatore, coordinatore, autore) e audit log delle operazioni sensibili.</p>
          </section>
          <section><h2 className="font-display text-xl font-semibold mb-3">10. Modifiche</h2>
            <p>Eventuali aggiornamenti a questa policy saranno pubblicati su questa pagina indicandone la data di aggiornamento.</p>
          </section>
        </div>
      </article>
    </div>
  );
};

export default Privacy;
