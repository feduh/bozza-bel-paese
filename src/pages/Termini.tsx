import SEO from "@/components/SEO";

const Termini = () => (
  <>
    <SEO
      title="Termini e Condizioni — Il Bel Paese"
      description="Termini e condizioni d'uso della piattaforma editoriale Il Bel Paese: accesso su invito, contenuti degli autori, responsabilità e diritto applicabile."
      canonicalPath="/termini"
    />
    <article className="editorial-container py-12 prose prose-neutral dark:prose-invert max-w-3xl font-body">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Aggiornata: Giugno 2026</p>
      <h1 className="font-display">Termini e Condizioni</h1>
      <p>
        I presenti termini regolano l'accesso e l'utilizzo del sito <strong>Il Bel Paese</strong>
        (di seguito "la Piattaforma"), gestito dall'omonimo collettivo editoriale con sede operativa
        in Italia. L'accesso alla Piattaforma implica l'integrale accettazione delle clausole che seguono.
      </p>

      <h2>1. Oggetto</h2>
      <p>
        Il Bel Paese è un archivio editoriale collaborativo dedicato alla mappatura delle realtà
        artistiche indipendenti italiane. La Piattaforma offre contenuti editoriali pubblici,
        una mappa delle realtà confermate e un'area riservata per coordinatori e autori invitati.
      </p>

      <h2>2. Accesso e account</h2>
      <ul>
        <li>L'accesso all'area riservata avviene <strong>esclusivamente su invito</strong> di un amministratore o moderatore del collettivo.</li>
        <li>L'utente si impegna a fornire dati veritieri e a mantenere riservate le credenziali di accesso.</li>
        <li>È vietato cedere, condividere o trasferire l'account a terzi.</li>
        <li>Il collettivo si riserva il diritto di sospendere o revocare l'accesso in caso di violazione dei presenti termini o di comportamenti contrari alla finalità del progetto.</li>
      </ul>

      <h2>3. Contenuti degli autori</h2>
      <p>
        Gli autori restano titolari dei diritti di proprietà intellettuale sui contenuti che pubblicano
        (testi, fotografie, materiali audio/video). Pubblicando sulla Piattaforma, l'autore concede a
        Il Bel Paese una licenza non esclusiva, gratuita e revocabile per la pubblicazione, l'archiviazione
        e la promozione editoriale dei contenuti nell'ambito del progetto.
      </p>
      <p>
        L'autore garantisce l'originalità del materiale o di disporre di tutti i diritti necessari alla
        pubblicazione, manlevando il collettivo da ogni pretesa di terzi.
      </p>

      <h2>4. Realtà mappate</h2>
      <p>
        Le realtà artistiche presenti sulla mappa pubblica sono inserite a scopo informativo e culturale.
        Le realtà segnalate dagli utenti vengono pubblicate dopo verifica editoriale o, in assenza di
        contestazione, decorse 24 ore dall'inserimento. Il collettivo può rimuovere o modificare schede
        inesatte, obsolete o non conformi alla linea editoriale.
      </p>

      <h2>5. Condotta degli utenti</h2>
      <p>L'utente si impegna a non:</p>
      <ul>
        <li>pubblicare contenuti illeciti, diffamatori, discriminatori o lesivi della dignità altrui;</li>
        <li>caricare materiali coperti da diritti di terzi senza autorizzazione;</li>
        <li>tentare di accedere ad aree riservate, eludere le misure di sicurezza o compromettere l'integrità della Piattaforma;</li>
        <li>utilizzare la Piattaforma per finalità commerciali non concordate con il collettivo.</li>
      </ul>

      <h2>6. Proprietà intellettuale della Piattaforma</h2>
      <p>
        Logo, identità visiva, struttura editoriale e codice della Piattaforma sono di titolarità del
        collettivo Il Bel Paese. Ne è vietata la riproduzione, anche parziale, senza autorizzazione scritta.
      </p>

      <h2>7. Limitazione di responsabilità</h2>
      <p>
        Il servizio è fornito "così com'è", senza garanzie di continuità o assenza di errori. Il Bel Paese
        non risponde di interruzioni tecniche, perdite di dati, malfunzionamenti dei servizi di terze parti
        utilizzati (hosting, mappa, autenticazione) né di danni indiretti derivanti dall'uso della Piattaforma.
      </p>

      <h2>8. Modifiche ai termini</h2>
      <p>
        Il collettivo può aggiornare in qualsiasi momento i presenti termini, dandone evidenza in questa
        pagina con la nuova data di aggiornamento. L'uso continuato del servizio dopo la pubblicazione
        delle modifiche ne costituisce accettazione.
      </p>

      <h2>9. Legge applicabile e foro competente</h2>
      <p>
        I presenti termini sono regolati dalla legge italiana. Per ogni controversia è competente in via
        esclusiva il Foro del consumatore, ove applicabile, o il Foro della sede del collettivo.
      </p>

      <h2>10. Contatti</h2>
      <p>
        Per richieste relative ai presenti termini scrivici a{" "}
        <a href="mailto:info.ilbelpaese@gmail.com">info.ilbelpaese@gmail.com</a>. Per il trattamento dei
        dati personali consulta la <a href="/privacy">Privacy Policy</a>; per l'uso dei cookie la{" "}
        <a href="/cookie-policy">Cookie Policy</a>.
      </p>
    </article>
  </>
);

export default Termini;
