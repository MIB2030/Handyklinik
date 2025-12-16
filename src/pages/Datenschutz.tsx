import LegalPage from '../components/LegalPage';

const DatenschutzFallback = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Datenschutz auf einen Blick</h2>
      <p className="text-gray-700 leading-relaxed">
        Der Schutz Ihrer personenbezogenen Daten bei der Nutzung unserer Webseite ist uns wichtig. Wir erheben und verwenden Ihre Daten ausschließlich im Rahmen der gesetzlichen Bestimmungen (DSGVO, TMG).
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Verantwortliche Stelle</h2>
      <div className="text-gray-700 leading-relaxed space-y-2">
        <p className="font-semibold">MNW Mobilfunk GmbH</p>
        <p>Unterhachinger Straße 28, 85521 Ottobrunn</p>
        <p>E-Mail: <a href="mailto:info@mnw-mobilfunk.de" className="text-blue-600 hover:underline">info@mnw-mobilfunk.de</a></p>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Datenerfassung auf unserer Website</h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Server-Log-Dateien</h3>
          <p className="text-gray-700 leading-relaxed">
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt (z. B. Browsertyp, Uhrzeit). Diese Daten sind nicht bestimmten Personen zuordenbar.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Kontaktformular</h3>
          <p className="text-gray-700 leading-relaxed">
            Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
          </p>
        </div>
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Ihre Rechte</h2>
      <p className="text-gray-700 leading-relaxed mb-4">
        Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten. Sie haben außerdem ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Kontaktaufnahme über WhatsApp</h2>
      <div className="text-gray-700 leading-relaxed space-y-4">
        <p>
          Wir bieten Ihnen die Möglichkeit, uns über den Instant-Messaging-Dienst WhatsApp (WhatsApp Ireland Limited, 4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland) zu kontaktieren.
        </p>
        <p>
          Wenn Sie den WhatsApp-Button auf unserer Webseite anklicken oder uns eine Nachricht schreiben, werden Ihre Telefonnummer sowie die Inhalte Ihrer Nachricht an uns übermittelt. Wir nutzen diese Daten ausschließlich zur Bearbeitung Ihrer Anfrage.
        </p>
        <p>
          <span className="font-semibold">Hinweis zur Datenübermittlung:</span> Durch die Nutzung von WhatsApp werden Daten an die Server von Meta Platforms Inc. (auch in die USA) übertragen. Wir haben keinen Einfluss auf die Art und den Umfang der durch WhatsApp verarbeiteten Daten. Bitte nutzen Sie WhatsApp nur, wenn Sie mit den Nutzungsbedingungen und Datenschutzhinweisen von WhatsApp einverstanden sind. Alternativ können Sie uns jederzeit per E-Mail oder Telefon kontaktieren.
        </p>
        <p>
          Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) oder unser berechtigtes Interesse an einer schnellen Kommunikation (Art. 6 Abs. 1 lit. f DSGVO).
        </p>
      </div>
    </section>
  </div>
);

export default function Datenschutz() {
  return (
    <LegalPage
      type="datenschutz"
      title="Datenschutzerklärung"
      fallbackContent={<DatenschutzFallback />}
    />
  );
}
