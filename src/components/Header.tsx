import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import ContactModal from './ContactModal';

export default function Header() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <>
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="w-full pl-0 pr-3 sm:pr-4">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center ml-4 sm:ml-8">
            <Link to="/" className="flex-shrink-0">
              <img
                src="/handyklinik_logo.png"
                alt="Handyklinik Logo"
                className="w-auto object-contain h-14 sm:h-[72px]"
                style={{
                  width: 'auto',
                  display: 'block',
                  imageRendering: '-webkit-optimize-contrast',
                  WebkitFontSmoothing: 'antialiased',
                  backfaceVisibility: 'hidden'
                } as React.CSSProperties}
                fetchPriority="high"
              />
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
            <a
              href="tel:08963286944"
              className="hidden sm:flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-semibold px-3 md:px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              <Phone className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm lg:text-base">089 / 63 28 69 44</span>
            </a>
            <a
              href="https://wa.me/4989632869444"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 sm:space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              aria-label="WhatsApp kontaktieren"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-bold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Kontakt
            </button>
          </div>
        </div>
      </div>
    </header>

    <ContactModal
      isOpen={isContactModalOpen}
      onClose={() => setIsContactModalOpen(false)}
    />
    </>
  );
}
