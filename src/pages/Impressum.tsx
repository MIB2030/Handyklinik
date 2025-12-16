import LegalPage from '../components/LegalPage';

const ImpressumFallback = () => (
  <>
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">MNW Mobilfunk GmbH</h2>
      <p className="text-gray-700 leading-relaxed">
        Unterhachinger Straße 28<br />
        85521 Ottobrunn
      </p>
      <p className="text-gray-700 leading-relaxed mt-4">
        Telefon: 089 / 63 28 69 44
      </p>
      <p className="text-gray-700 leading-relaxed">
        E-Mail: info@mnw-mobilfunk.de
      </p>
    </div>

    <div className="mb-8">
      <p className="text-gray-700 leading-relaxed">
        Geschäftsführer: Marc Wink<br />
        Amtsgericht München HRB 149254<br />
        Sitz der Gesellschaft: Ottobrunn
      </p>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-3">Haftung für eigene Inhalte</h3>
      <p className="text-gray-700 leading-relaxed">
        Wir sind für die eigenen Inhalte, die wir zur Nutzung bereithalten, nach den allgemeinen Gesetzen verantwortlich. Eine Gewähr oder Verantwortung für Vollständigkeit, Fehler redaktioneller und technischer Art, Auslassungen usw. sowie die Richtigkeit der auf diesem Internetangebot befindlichen Information übernehmen wir nicht.
      </p>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-3">Haftung für Inhalte auf Internetangeboten Dritter</h3>
      <p className="text-gray-700 leading-relaxed">
        Verweise durch Links auf Inhalte von Internetseiten Dritter dienen lediglich Ihrer Information. Die Verantwortlichkeit für diese fremden Inhalte liegt alleine bei dem Anbieter, der diese Inhalte auf der verlinkten Internetseite bereithält. Die Internetangebote Dritter sind vor dem Einrichten des entsprechenden Verweises überprüft worden. Wir übernehmen aber keine Gewähr für die Vollständigkeit und Richtigkeit von Informationen, die hinter einem Verweis oder Link liegen; insbesondere kann der Inhalt dieser Internetangebote jederzeit ohne unser Wissen geändert werden. Werden Rechtsverletzungen bekannt, die sich auf Seiten befinden, auf die wir auf unserer Webseite einen Link gesetzt haben, werden wir diesen Link unverzüglich entfernen.
      </p>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-3">Änderung der bereitgestellten Informationen</h3>
      <p className="text-gray-700 leading-relaxed">
        Wir behalten uns das Recht vor, ohne vorherige Ankündigung die bereitgestellten Informationen zu ändern, zu ergänzen oder zu entfernen.
      </p>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-3">Urheberrecht</h3>
      <p className="text-gray-700 leading-relaxed">
        Die Gestaltung des Angebots sowie die inhaltlichen Beiträge sind urheberrechtlich geschützt. Dies gilt insbesondere für Texte, Bilder, Grafiken, Ton-, Video-, oder Animationsdateien einschließlich deren Anordnung auf den einzelnen Internet-Seiten. Der Nachdruck und die Auswertung von Pressemitteilungen ist mit Quellenangabe gestattet. Im Übrigen darf die Veröffentlichung (auch im Internet), Verarbeitung oder gewerbliche Nutzung aller Inhalte (oder Teilen davon) nur nach vorheriger schriftlicher Genehmigung durch uns erfolgen.
      </p>
    </div>

    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-3">Online-Streitbeilegung</h3>
      <p className="text-gray-700 leading-relaxed mb-4">
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit. Diese finden Sie unter:
      </p>
      <p className="text-gray-700 leading-relaxed mb-4">
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 underline font-semibold"
        >
          https://ec.europa.eu/consumers/odr
        </a>
      </p>
      <p className="text-gray-700 leading-relaxed">
        Wir weisen darauf hin, dass wir weder verpflichtet, noch bereit dazu sind, an einem Schlichtungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    </div>

    <div className="mb-8">
      <p className="text-gray-700 leading-relaxed">
        Fotoquelle: MNW Mobilfunk GmbH, Fotolia, Pixabay
      </p>
    </div>
  </>
);

export default function Impressum() {
  return (
    <LegalPage
      type="impressum"
      title="Impressum"
      fallbackContent={<ImpressumFallback />}
    />
  );
}
