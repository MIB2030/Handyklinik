import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { supabase } from '../lib/supabase';

interface CompanyInfo {
  company_name: string;
  phone: string;
  email: string;
}

export default function Footer() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    company_name: 'Handyklinik Ottobrunn',
    phone: '089 / 63 28 69 44',
    email: 'info@mnw-mobilfunk.de',
  });

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    const { data } = await supabase
      .from('company_info')
      .select('company_name, phone, email')
      .maybeSingle();

    if (data) {
      setCompanyInfo(data);
    }
  };

  const scrollToContact = () => {
    const contactSection = document.querySelector('section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#1a1f2e] text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-12 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">{companyInfo.company_name}</h3>
            <p className="text-sm leading-relaxed">
              Ihre Experten für Smartphone- und Tablet-Reparaturen
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li>
                Telefon: <a href={`tel:${companyInfo.phone.replace(/\s/g, '')}`} className="hover:text-gray-300 transition-colors">{companyInfo.phone}</a>
              </li>
              <li>
                E-Mail: <a href={`mailto:${companyInfo.email}`} className="hover:text-gray-300 transition-colors">{companyInfo.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/impressum" className="hover:text-gray-300 transition-colors">Impressum</Link></li>
              <li><Link to="/datenschutz" className="hover:text-gray-300 transition-colors">Datenschutz</Link></li>
              <li><Link to="/cookie-richtlinie" className="hover:text-gray-300 transition-colors">Cookie Richtlinien</Link></li>
              <li><Link to="/kontakt" className="hover:text-gray-300 transition-colors">Kontakt</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © 2025 Handyklinik Ottobrunn – Ein Service der MNW Mobilfunk GmbH
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
            >
              v2.0
            </button>
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </footer>
  );
}
