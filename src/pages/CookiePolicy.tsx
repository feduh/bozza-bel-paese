import SEO from "@/components/SEO";

const CookiePolicy = () => (
  <>
    <SEO
      title="Cookie Policy — Il Bel Paese"
      description="Informativa sull'uso dei cookie e delle tecnologie simili sul sito Il Bel Paese: cookie tecnici, analitici e di terze parti, durata e gestione."
      canonicalPath="/cookie-policy"
    />
    <article className="editorial-container py-12 prose prose-neutral dark:prose-invert max-w-3xl font-body">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Aggiornata: Giugno 2026</p>
      <h1 className="font-display">Cookie Policy</h1>
      <p>
        La presente informativa illustra l'utilizzo di cookie e tecnologie analoghe (di seguito
        complessivamente "cookie") sul sito <strong>Il Bel Paese</strong>, ai sensi del Provvedimento del
        Garante per la protezione dei dati personali del 10 giugno 2021 e degli artt. 13 GDPR e 122 del
        Codice Privacy.
      </p>

      <h2>1. Cosa sono i cookie</h2>
      <p>
        I cookie sono piccoli file di testo che i siti visitati salvano nel dispositivo dell'utente per
        memorizzare informazioni utili al funzionamento del sito o per raccogliere dati statistici. Possono
        essere installati dal sito stesso (cookie di prima parte) o da domini terzi (cookie di terze parti).
      </p>

      <h2>2. Tipologie di cookie utilizzate</h2>

      <h3>2.1 Cookie tecnici (necessari)</h3>
      <p>
        Indispensabili per il corretto funzionamento del sito e per fornire i servizi richiesti dall'utente.
        Non richiedono consenso preventivo.
      </p>
      <ul>
        <li><strong>Sessione e autenticazione</strong> — token di sessione utilizzati dal backend per mantenere l'utente connesso all'area riservata. Durata: sessione o fino al logout.</li>
        <li><strong>Preferenze interfaccia</strong> — memorizzano lingua, tema chiaro/scuro e impostazioni di visualizzazione. Durata: fino a 12 mesi.</li>
        <li><strong>Sicurezza</strong> — token anti-CSRF e protezione del modulo contatti. Durata: sessione.</li>
      </ul>

      <h3>2.2 Cookie e servizi di terze parti</h3>
      <ul>
        <li>
          <strong>Lovable Cloud (Supabase)</strong> — fornitore dell'infrastruttura di autenticazione e
          database. Imposta cookie tecnici necessari alla sessione utente. Server in area UE.
        </li>
        <li>
          <strong>OpenStreetMap / CARTO</strong> — fornitori dei tile cartografici utilizzati nella mappa
          delle realtà. Possono raccogliere log tecnici di accesso (indirizzo IP, user-agent) per finalità
          di sicurezza e prevenzione abusi.
        </li>
      </ul>
      <p>
        Non utilizziamo cookie di profilazione pubblicitaria, retargeting o social plugin con tracciamento.
      </p>

      <h2>3. Base giuridica</h2>
      <p>
        I cookie tecnici sono trattati sulla base del legittimo interesse a erogare il servizio (art. 122
        Codice Privacy). Eventuali cookie non tecnici, se introdotti in futuro, saranno attivati solo
        previo consenso esplicito dell'utente tramite apposito banner.
      </p>

      <h2>4. Gestione e disattivazione</h2>
      <p>
        L'utente può in ogni momento gestire o eliminare i cookie tramite le impostazioni del proprio
        browser:
      </p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" target="_blank" rel="noreferrer">Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer">Safari</a></li>
        <li><a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noreferrer">Microsoft Edge</a></li>
      </ul>
      <p>
        La disattivazione dei cookie tecnici può compromettere alcune funzionalità del sito, in particolare
        l'accesso all'area riservata.
      </p>

      <h2>5. Contatti</h2>
      <p>
        Per qualsiasi richiesta relativa all'uso dei cookie puoi scriverci a{" "}
        <a href="mailto:info.ilbelpaese@gmail.com">info.ilbelpaese@gmail.com</a>. Per il trattamento
        complessivo dei dati personali consulta la <a href="/privacy">Privacy Policy</a>.
      </p>
    </article>
  </>
);

export default CookiePolicy;
