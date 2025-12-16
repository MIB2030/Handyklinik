import { MapPin, Clock, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

interface CompanyInfo {
  company_name: string;
  street: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  opening_hours: string;
}

export default function Kontakt() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    company_name: 'MNW Mobilfunk GmbH',
    street: 'Unterhachinger Straße 28',
    postal_code: '85521',
    city: 'Ottobrunn',
    phone: '089 / 63 28 69 44',
    email: 'info@mnw-mobilfunk.de',
    opening_hours: 'Montag bis Samstag\n09:00 – 20:00 Uhr',
  });

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    const { data } = await supabase
      .from('company_info')
      .select('company_name, street, postal_code, city, phone, email, opening_hours')
      .maybeSingle();

    if (data) {
      setCompanyInfo(data);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Kontakt</h1>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Stellen Sie jetzt eine kostenlose Anfrage!
            </h2>
            <p className="text-gray-700 leading-relaxed mb-8">
              Füllen Sie das Kontaktformular aus und klicken Sie auf <em>Anfrage senden</em>. Unser Team wird sich so schnell wie möglich mit einem Reparatur- und oder Terminvorschlag bei Ihnen melden. Sollten Sie einfach grundlegende Informationen benötigen, stehen wir Ihnen natürlich auch gerne zur Seite und beraten Sie individuell.
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Adresse
                </h3>
                <div className="text-gray-700 leading-relaxed ml-7">
                  <p className="font-semibold">{companyInfo.company_name}</p>
                  <p>{companyInfo.street}</p>
                  <p>{companyInfo.postal_code} {companyInfo.city}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-600" />
                  Öffnungszeiten
                </h3>
                <div className="text-gray-700 leading-relaxed ml-7 whitespace-pre-line">
                  {companyInfo.opening_hours}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-blue-600" />
                  Kontakt
                </h3>
                <div className="text-gray-700 leading-relaxed ml-7 space-y-2">
                  <p>
                    <span className="font-semibold">Telefon:</span>{' '}
                    <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="text-blue-600 hover:underline">
                      {companyInfo.phone}
                    </a>
                  </p>
                  <p>
                    <span className="font-semibold">E-Mail:</span>{' '}
                    <a href={`mailto:${companyInfo.email}`} className="text-blue-600 hover:underline">
                      {companyInfo.email}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Kontaktformular</h3>
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nachricht *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Anfrage senden
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
