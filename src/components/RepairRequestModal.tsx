import { useState, useEffect } from 'react';
import { Mail, X, Sun } from 'lucide-react';
import TurnstileWidget from './TurnstileWidget';
import { supabase } from '../lib/supabase';

interface RepairRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturer: string;
  model: string;
  repair: string;
  price: number;
}

interface VacationMode {
  is_active: boolean;
  start_date: string;
  end_date: string;
  message: string;
}

export default function RepairRequestModal({
  isOpen,
  onClose,
  manufacturer,
  model,
  repair,
  price
}: RepairRequestModalProps) {
  const [formData, setFormData] = useState({
    salutation: '',
    vorname: '',
    nachname: '',
    phone: '',
    email: '',
    street: '',
    postalCode: '',
    city: '',
    preferredDate: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [vacationMode, setVacationMode] = useState<VacationMode | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadVacationMode();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadVacationMode = async () => {
    try {
      const { data } = await supabase
        .from('vacation_mode')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setVacationMode(data);
    } catch (error) {
      console.error('Error loading vacation mode:', error);
    }
  };

  if (!isOpen) return null;

  const isBackcoverRepair = repair.toLowerCase().includes('backcover');
  const priceText = isBackcoverRepair ? `ab ${price.toFixed(2).replace('.', ',')} €` : `${price.toFixed(2).replace('.', ',')} €`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const emailBody = `
Neue Handy Reparatur Anfrage

Gerät: ${manufacturer} ${model}
Reparatur: ${repair}
Preis: ${priceText}

Kundendaten:
${formData.salutation ? `Anrede: ${formData.salutation}` : ''}
Vorname: ${formData.vorname}
Nachname: ${formData.nachname}
Telefon: ${formData.phone}
E-Mail: ${formData.email}

Rechnungsadresse:
${formData.street}
${formData.postalCode} ${formData.city}

${formData.preferredDate ? `Gewünschter Termin: ${formData.preferredDate}` : ''}

${formData.message ? `Nachricht:\n${formData.message}` : ''}
    `.trim();

    const mailtoLink = `mailto:info@mnw-mobilfunk.de?subject=${encodeURIComponent(`Handy Reparatur Anfrage - ${manufacturer} ${model} - ${repair}`)}&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailtoLink;

    setSubmitSuccess(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(false);
      setAcceptedPrivacy(false);
      setTurnstileToken(null);
      onClose();
      setFormData({
        salutation: '',
        vorname: '',
        nachname: '',
        phone: '',
        email: '',
        street: '',
        postalCode: '',
        city: '',
        preferredDate: '',
        message: ''
      });
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900">Email-Anfrage</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Ihre Auswahl:</h4>
            <p className="text-gray-700">
              <span className="font-medium">{manufacturer} {model}</span> - {repair}
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {priceText}
            </p>
            <p className="text-sm text-gray-500">inkl. 19% MwSt.</p>
          </div>

          {vacationMode && (
            <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Sun className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-900 mb-1">Urlaubshinweis</p>
                  <p className="text-sm text-orange-800">
                    {vacationMode.message}
                  </p>
                  <p className="text-xs text-orange-700 mt-2">
                    Sie können Ihre Anfrage trotzdem senden. Wir bearbeiten sie nach unserem Urlaub!
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 text-lg font-semibold mb-2">
                Email-Client wird geöffnet...
              </div>
              <p className="text-gray-600">
                Bitte senden Sie die vorausgefüllte Email ab.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anrede
                  </label>
                  <select
                    name="salutation"
                    value={formData.salutation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Herr">Herr</option>
                    <option value="Frau">Frau</option>
                    <option value="Herr Dr.">Herr Dr.</option>
                    <option value="Frau Dr.">Frau Dr.</option>
                    <option value="Divers">Divers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vorname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vorname"
                    required
                    value={formData.vorname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Max"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nachname <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nachname"
                    required
                    value={formData.nachname}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Mustermann"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0123 456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-Mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="max@beispiel.de"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Rechnungsadresse</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Straße und Hausnummer <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="street"
                      required
                      value={formData.street}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Musterstraße 123"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PLZ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        value={formData.postalCode}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="12345"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stadt <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Musterstadt"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gewünschter Termin
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zusätzliche Nachricht
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Weitere Informationen oder Fragen..."
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 leading-relaxed">
                    Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen gespeichert werden. Ich kann diese Einwilligung jederzeit per E-Mail widerrufen. Meine Daten werden nicht an Dritte weitergegeben. Weitere Infos in der <a href="/datenschutz" target="_blank" className="text-blue-600 hover:underline">Datenschutzerklärung</a>.
                  </span>
                </label>
              </div>

              <TurnstileWidget
                onVerify={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
              />

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !acceptedPrivacy || !turnstileToken}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Wird geöffnet...' : 'Email senden'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
