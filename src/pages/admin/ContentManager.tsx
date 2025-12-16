import { useEffect, useState } from 'react';
import { Save, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompanyInfo {
  id: string;
  company_name: string;
  street: string;
  postal_code: string;
  city: string;
  phone: string;
  mobile: string;
  email: string;
  opening_hours: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  google_maps_url: string;
}

export default function ContentManager() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    const { data, error } = await supabase
      .from('company_info')
      .select('*')
      .maybeSingle();

    if (!error && data) {
      setCompanyInfo(data);
    }
    setLoading(false);
  };

  const handleChange = (field: keyof CompanyInfo, value: string) => {
    if (!companyInfo) return;
    setCompanyInfo({ ...companyInfo, [field]: value });
  };

  const handleSave = async () => {
    if (!companyInfo) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('company_info')
      .update({
        company_name: companyInfo.company_name,
        street: companyInfo.street,
        postal_code: companyInfo.postal_code,
        city: companyInfo.city,
        phone: companyInfo.phone,
        mobile: companyInfo.mobile,
        email: companyInfo.email,
        opening_hours: companyInfo.opening_hours,
        whatsapp: companyInfo.whatsapp,
        instagram: companyInfo.instagram,
        facebook: companyInfo.facebook,
        google_maps_url: companyInfo.google_maps_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', companyInfo.id);

    setSaving(false);

    if (error) {
      setMessage('Fehler beim Speichern');
    } else {
      setMessage('Erfolgreich gespeichert');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!companyInfo) {
    return <div className="text-center py-8">Keine Firmendaten gefunden</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">MNW Daten</h1>
        <p className="text-gray-600 mt-2">Verwalten Sie die Kontaktdaten Ihres Unternehmens</p>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firmenname
            </label>
            <input
              type="text"
              value={companyInfo.company_name}
              onChange={(e) => handleChange('company_name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Straße & Hausnummer
              </label>
              <input
                type="text"
                value={companyInfo.street}
                onChange={(e) => handleChange('street', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PLZ
                </label>
                <input
                  type="text"
                  value={companyInfo.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stadt
                </label>
                <input
                  type="text"
                  value={companyInfo.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefon
              </label>
              <input
                type="text"
                value={companyInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobilnummer
              </label>
              <input
                type="text"
                value={companyInfo.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Mail
            </label>
            <input
              type="email"
              value={companyInfo.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öffnungszeiten
            </label>
            <textarea
              value={companyInfo.opening_hours}
              onChange={(e) => handleChange('opening_hours', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp
              </label>
              <input
                type="text"
                value={companyInfo.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="text"
                value={companyInfo.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook URL
            </label>
            <input
              type="text"
              value={companyInfo.facebook}
              onChange={(e) => handleChange('facebook', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Maps URL
            </label>
            <input
              type="text"
              value={companyInfo.google_maps_url}
              onChange={(e) => handleChange('google_maps_url', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Speichern...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Speichern</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
