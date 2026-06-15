import SEO from "@/components/SEO";
import { useTranslation } from "react-i18next";

const PrivacyIt = () => (
  <>
    <header className="mb-12">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Aggiornata: Maggio 2026</p>
      <h1 className="editorial-heading mb-4"><span className="italic text-primary">Privacy</span> Policy</h1>
      <p className="editorial-body text-muted-foreground">
        Questa informativa descrive come Il Bel Paese tratta i dati personali raccolti tramite il sito, il modulo
        contatti, la registrazione coordinatori e la mappatura delle realtà artistiche.
      </p>
    </header>
    <div className="prose prose-neutral dark:prose-invert max-w-none font-body space-y-8">
      <section><h2 className="font-display text-xl font-semibold mb-3">1. Titolare del trattamento</h2>
        <p>Il titolare del trattamento è il collettivo <strong>Il Bel Paese</strong>. Per qualsiasi richiesta relativa ai dati personali puoi scriverci a <a href="mailto:info.ilbelpaese@gmail.com" className="text-primary hover:underline">info.ilbelpaese@gmail.com</a>.</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">2. Dati raccolti</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Modulo contatti</strong>: nome, email, oggetto e messaggio che invii volontariamente.</li>
          <li><strong>Account coordinatori/autori</strong> (su invito): email, nome visualizzato, biografia, foto profilo, ruoli e dati professionali che decidi di condividere.</li>
          <li><strong>Segnalazione realtà</strong>: dati della realtà segnalata ed eventuali tuoi recapiti se forniti.</li>
          <li><strong>Dati tecnici minimi</strong>: log di accesso al backend strettamente necessari alla sicurezza del servizio.</li>
        </ul>
        <p className="mt-3">Non utilizziamo cookie di profilazione né strumenti di tracciamento pubblicitario di terze parti.</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">3. Finalità del trattamento</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Rispondere alle tue richieste inviate tramite il modulo contatti.</li>
          <li>Gestire gli account dei membri del collettivo e degli autori.</li>
          <li>Pubblicare contenuti editoriali e profili pubblici solo dopo tuo consenso esplicito.</li>
          <li>Mantenere e migliorare la mappatura pubblica delle realtà artistiche italiane.</li>
        </ul>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">4. Base giuridica</h2>
        <p>Il trattamento si fonda sul tuo consenso (Art. 6.1.a GDPR) per la visibilità pubblica del profilo e sull'esecuzione di un rapporto di collaborazione (Art. 6.1.b GDPR) per la gestione dell'account. Per le richieste inviate tramite il modulo contatti la base giuridica è il legittimo interesse a rispondere alle comunicazioni ricevute (Art. 6.1.f GDPR).</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">5. Conservazione dei dati</h2>
        <p>I messaggi del modulo contatti vengono conservati per il tempo necessario a gestire la richiesta e, al massimo, per 24 mesi. I dati degli account vengono conservati finché l'account è attivo; alla cancellazione vengono rimossi entro 30 giorni, salvo obblighi di legge.</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">6. Condivisione con terzi</h2>
        <p>I dati sono ospitati su infrastruttura cloud europea fornita da Lovable Cloud, utilizzata per database, autenticazione e storage. Non vendiamo né cediamo i tuoi dati a terzi per finalità di marketing.</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">7. I tuoi diritti</h2>
        <p>In qualsiasi momento puoi richiedere accesso, rettifica, cancellazione, limitazione o portabilità dei tuoi dati, oltre a revocare il consenso prestato. Scrivici a <a href="mailto:info.ilbelpaese@gmail.com" className="text-primary hover:underline"> info.ilbelpaese@gmail.com</a> e risponderemo entro 30 giorni.</p>
        <p>Puoi inoltre proporre reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-primary hover:underline">garanteprivacy.it</a>).</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">8. Modifiche</h2>
        <p>Eventuali aggiornamenti a questa policy saranno pubblicati su questa pagina indicandone la data di aggiornamento.</p>
      </section>
    </div>
  </>
);

const PrivacyEn = () => (
  <>
    <header className="mb-12">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Updated: May 2026</p>
      <h1 className="editorial-heading mb-4"><span className="italic text-primary">Privacy</span> Policy</h1>
      <p className="editorial-body text-muted-foreground">
        This notice describes how Il Bel Paese processes personal data collected through the website, the contact form,
        coordinator registration and the mapping of artistic realities.
      </p>
    </header>
    <div className="prose prose-neutral dark:prose-invert max-w-none font-body space-y-8">
      <section><h2 className="font-display text-xl font-semibold mb-3">1. Data controller</h2>
        <p>The data controller is the <strong>Il Bel Paese</strong> collective. For any request concerning personal data, write to <a href="mailto:info.ilbelpaese@gmail.com" className="text-primary hover:underline">info.ilbelpaese@gmail.com</a>.</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">2. Data we collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Contact form</strong>: name, email, subject and the message you voluntarily send.</li>
          <li><strong>Coordinator/author accounts</strong> (invite-only): email, display name, bio, profile picture, roles and any professional data you choose to share.</li>
          <li><strong>Reality reports</strong>: data about the reported reality and any contact details you provide.</li>
          <li><strong>Minimal technical data</strong>: backend access logs strictly required for service security.</li>
        </ul>
        <p className="mt-3">We do not use profiling cookies or third-party advertising trackers.</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">3. Purposes of processing</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Reply to enquiries sent through the contact form.</li>
          <li>Manage collective member and author accounts.</li>
          <li>Publish editorial content and public profiles only after your explicit consent.</li>
          <li>Maintain and improve the public mapping of Italian artistic realities.</li>
        </ul>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">4. Legal basis</h2>
        <p>Processing is based on your consent (Art. 6.1.a GDPR) for public profile visibility and on the performance of a collaboration agreement (Art. 6.1.b GDPR) for account management. For contact-form enquiries the basis is the legitimate interest in responding to received communications (Art. 6.1.f GDPR).</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">5. Data retention</h2>
        <p>Contact-form messages are kept for as long as needed to handle the request and for no more than 24 months. Account data is kept while the account is active; on deletion it is removed within 30 days, subject to legal obligations.</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">6. Third-party sharing</h2>
        <p>Data is hosted on European cloud infrastructure provided by Lovable Cloud, used for database, authentication and storage. We do not sell or share your data with third parties for marketing purposes.</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">7. Your rights</h2>
        <p>You can at any time request access, rectification, erasure, restriction or portability of your data, as well as withdraw consent. Write to <a href="mailto:info.ilbelpaese@gmail.com" className="text-primary hover:underline"> info.ilbelpaese@gmail.com</a> and we will reply within 30 days.</p>
        <p>You may also lodge a complaint with the Italian Data Protection Authority (<a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-primary hover:underline">garanteprivacy.it</a>).</p>
      </section>
      <section><h2 className="font-display text-xl font-semibold mb-3">8. Changes</h2>
        <p>Any updates to this policy will be published on this page with the new update date.</p>
      </section>
    </div>
  </>
);

const Privacy = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  return (
    <div className="py-20">
      <SEO
        title={isEn ? "Privacy Policy — Il Bel Paese" : "Privacy Policy — Il Bel Paese"}
        description={isEn
          ? "Privacy notice of Il Bel Paese collective: data collected, purposes, user rights and contact details."
          : "Informativa privacy del collettivo Il Bel Paese: dati raccolti, finalità, diritti dell'utente e modalità di contatto."}
        canonicalPath="/privacy"
      />
      <article className="editorial-container max-w-3xl">
        {isEn ? <PrivacyEn /> : <PrivacyIt />}
      </article>
    </div>
  );
};

export default Privacy;
