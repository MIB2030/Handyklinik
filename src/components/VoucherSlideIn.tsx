import { useState, useEffect } from 'react';
import { Gift, X } from 'lucide-react';

export default function VoucherSlideIn() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenSlideIn = sessionStorage.getItem('hasSeenVoucherSlideIn');

    if (!hasSeenSlideIn) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenVoucherSlideIn', 'true');
  };

  const handleClick = () => {
    handleClose();
    const preisrechner = document.getElementById('preisrechner');
    if (preisrechner) {
      preisrechner.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 animate-slide-in-right">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-2xl max-w-sm overflow-hidden">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <button
            onClick={handleClick}
            className="w-full text-left p-4 hover:bg-blue-700/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <Gift className="h-8 w-8" />
              </div>

              <div>
                <h3 className="font-bold text-lg mb-1">
                  Sichere dir deinen 10€ Gutschein!
                </h3>
                <p className="text-sm text-white/90">
                  Klicke hier und erhalte 10€ Rabatt auf deine nächste Reparatur.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
