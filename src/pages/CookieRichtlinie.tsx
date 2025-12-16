import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Footer from '../components/Footer';

export default function CookieRichtlinie() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Zurück zur Startseite
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie-Richtlinie (EU)</h1>

        <p className="text-sm text-gray-600 italic mb-8">
          Diese Cookie-Richtlinie wurde zuletzt am 6. Dezember 2025 aktualisiert und gilt für Bürger und Einwohner mit ständigem Wohnsitz im Europäischen Wirtschaftsraum und der Schweiz.
        </p>

        <div className="prose prose-lg max-w-none space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Einführung</h2>
            <p className="text-gray-700 leading-relaxed">
              Unsere Website, <a href="https://handyklinikottobrunn.de" className="text-blue-600 hover:underline">https://handyklinikottobrunn.de</a> (im folgenden: „Die Website") verwendet ausschließlich technisch notwendige Cookies und ähnliche Technologien. In dem unten stehenden Dokument informieren wir Sie über die Verwendung auf unserer Website.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Was sind Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Ein Cookie ist eine einfache kleine Datei, die gemeinsam mit den Seiten einer Internetadresse versendet und vom Webbrowser auf dem PC oder einem anderen Gerät gespeichert werden kann. Die darin gespeicherten Informationen können während folgender Besuche zu unseren Servern gesendet werden.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Welche Cookies verwenden wir?</h2>

            <h3 className="text-xl font-bold text-gray-900 mb-3 mt-6">3.1 Technisch notwendige Cookies</h3>
            <p className="text-gray-700 leading-relaxed">
              Wir verwenden ausschließlich technisch notwendige Cookies, die sicherstellen, dass unsere Website richtig funktioniert. Diese Cookies speichern beispielsweise Ihre Sitzungsinformationen, wenn Sie mit unserem Kontaktformular interagieren oder sich im Admin-Bereich anmelden. Diese Cookies werden automatisch platziert und sind für den Betrieb der Website erforderlich.
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mt-4">
              <p className="text-gray-700 leading-relaxed font-semibold">
                Wichtiger Hinweis: Wir verwenden KEINE Marketing-, Tracking- oder Analyse-Cookies. Es werden keine Daten über Ihr Nutzerverhalten gesammelt oder an Dritte weitergegeben.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Verwendete Technologien</h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Supabase (Backend-Dienste)</h3>
              <p className="text-sm text-gray-600 mb-2">Technisch notwendig</p>
              <p className="text-gray-700 leading-relaxed mb-2">
                <span className="font-semibold">Nutzung:</span> Wir verwenden Supabase für die Verwaltung von Datenbanken und Authentifizierung. Diese Cookies sind für Login-Funktionen und Datenverwaltung erforderlich.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">Weitergabe von Daten:</span> Daten werden auf sicheren Servern innerhalb der EU gespeichert. Für weitere Informationen lesen Sie bitte die <a href="https://supabase.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Supabase Datenschutzerklärung</a>.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lokale Schriftarten</h3>
              <p className="text-sm text-gray-600 mb-2">Technisch notwendig</p>
              <p className="text-gray-700 leading-relaxed">
                <span className="font-semibold">Nutzung:</span> Alle Schriftarten werden lokal von unseren Servern geladen. Es erfolgt keine Verbindung zu externen Diensten wie Google Fonts.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Zustimmung</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Da wir ausschließlich technisch notwendige Cookies verwenden, ist keine Einwilligung erforderlich. Diese Cookies sind für den Betrieb der Website unerlässlich und können nicht deaktiviert werden, ohne die Funktionalität der Website zu beeinträchtigen.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Verwaltung von Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Sie können Ihren Internetbrowser verwenden, um automatisch oder manuell Cookies zu löschen. Sie können außerdem spezifizieren, ob spezielle Cookies nicht platziert werden sollen. Für weitere Informationen über diese Möglichkeiten beachten Sie die Anweisungen in der Hilfesektion Ihres Browsers.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Bitte beachten Sie, dass unsere Website möglicherweise nicht richtig funktioniert, wenn alle Cookies deaktiviert sind, da einige Funktionen auf technisch notwendige Cookies angewiesen sind.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Ihre Rechte in Bezug auf persönliche Daten</h2>
            <p className="text-gray-700 leading-relaxed">
              Sie haben in Bezug auf Ihre persönlichen Daten die folgenden Rechte: Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Um diese Rechte auszuüben, kontaktieren Sie uns bitte. Bitte beziehen Sie sich auf die Kontaktdaten am Ende dieser Cookie-Erklärung. Wenn Sie eine Beschwerde darüber haben, wie wir Ihre Daten behandeln, würden wir diese gerne hören, aber Sie haben auch das Recht, diese an die Aufsichtsbehörde (Datenschutzbehörde) zu richten.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Kontaktdaten</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Für Fragen und/oder Kommentare über unsere Cookie-Richtlinien kontaktieren Sie uns bitte mittels der folgenden Kontaktdaten:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg text-gray-700">
              <p className="font-semibold">MNW Mobilfunk GmbH</p>
              <p>Unterhachinger Straße 28</p>
              <p>85521 Ottobrunn</p>
              <p>Deutschland</p>
              <p className="mt-4">
                Website: <a href="https://handyklinikottobrunn.de" className="text-blue-600 hover:underline">https://handyklinikottobrunn.de</a>
              </p>
              <p>
                E-Mail: <a href="mailto:info@mnw-mobilfunk.de" className="text-blue-600 hover:underline">info@mnw-mobilfunk.de</a>
              </p>
              <p>Telefonnummer: 089 / 63 28 69 44</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
