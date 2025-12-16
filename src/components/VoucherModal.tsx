import { useState, useEffect, useRef } from 'react';
import { X, Gift, Check, Printer } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VoucherModal({ isOpen, onClose }: VoucherModalProps) {
  const [step, setStep] = useState(1);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherId, setVoucherId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDate, setGeneratedDate] = useState('');
  const voucherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const generateVoucherCode = () => {
    const prefix = 'HK';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
  };

  const handleGenerateVoucher = async () => {
    setIsGenerating(true);

    const code = generateVoucherCode();
    const date = new Date().toLocaleDateString('de-DE');

    try {
      const { data, error } = await supabase
        .from('vouchers')
        .insert([
          {
            code,
            amount: 10,
            status: 'active',
            generated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setVoucherId(data.id);
      setVoucherCode(code);
      setGeneratedDate(date);
      setStep(4);
    } catch (error) {
      console.error('Error creating voucher:', error);
      alert('Fehler beim Erstellen des Gutscheins. Bitte versuchen Sie es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      const { data: currentVoucher } = await supabase
        .from('vouchers')
        .select('print_count')
        .eq('id', voucherId)
        .single();

      const newPrintCount = (currentVoucher?.print_count || 0) + 1;

      await supabase
        .from('vouchers')
        .update({
          printed_at: new Date().toISOString(),
          print_count: newPrintCount
        })
        .eq('id', voucherId);
    } catch (error) {
      console.error('Error tracking print:', error);
    }

    // Iframe-basiertes Drucken
    if (!voucherRef.current) return;

    // Hole alle Stylesheets der Seite
    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // External stylesheets können wegen CORS nicht gelesen werden
          // Verwende stattdessen den Link-Tag
          const linkElement = styleSheet.ownerNode as HTMLLinkElement;
          if (linkElement && linkElement.href) {
            return `<link rel="stylesheet" href="${linkElement.href}">`;
          }
          return '';
        }
      })
      .join('\n');

    // Erstelle HTML für das Iframe
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Gutschein drucken</title>
          <style>
            @page {
              size: A4;
              margin: 1.5cm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            ${styles}
          </style>
        </head>
        <body>
          ${voucherRef.current.innerHTML}
        </body>
      </html>
    `;

    // Erstelle unsichtbares Iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Schreibe Inhalt ins Iframe
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();

      // Warte bis Styles geladen sind, dann drucke
      iframe.contentWindow?.focus();
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Entferne Iframe nach dem Drucken
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 100);
      }, 250);
    }
  };

  const handleClose = () => {
    setStep(1);
    setVoucherCode('');
    setVoucherId('');
    setGeneratedDate('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 modal-backdrop"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 1 && (
          <div className="p-8">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-8 text-gray-900">
              <div className="flex items-center space-x-2 mb-6">
                <Gift className="w-8 h-8 text-yellow-600" />
                <h2 className="text-2xl font-bold">Gutschein-Bedingungen</h2>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Mindestauftragswert: 90€</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Gültig: Mo-Fr 14-18 Uhr</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Nicht gegen Bargeld einlösbar</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Vor Bezahlung angeben</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Der Rechtsweg ist ausgeschlossen</strong></span>
                </li>
              </ul>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-xl transition-colors"
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 mb-4">
                <Gift className="w-8 h-8 text-yellow-600" />
                <h2 className="text-3xl font-bold text-gray-900">10€ Reparatur-Gutschein</h2>
              </div>
              <p className="text-gray-600">
                Sichere dir jetzt deinen 10€ Rabatt auf deine nächste Handy-Reparatur!
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
              <div className="flex items-start space-x-2 mb-4">
                <Gift className="w-5 h-5 text-yellow-700 mt-1" />
                <h3 className="font-bold text-gray-900">Gutschein-Details:</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Wert:</strong> 10€ Rabatt auf Ihre Reparatur</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Mindestauftragswert:</strong> 90€</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>Gültig:</strong> Montag bis Freitag, 14:00-18:00 Uhr</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-2 mb-4">
                <Gift className="w-5 h-5 text-blue-700 mt-1" />
                <h3 className="font-bold text-gray-900">Einlösebedingungen:</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Mindestauftragswert: 90€</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Gültig: Montag bis Freitag, 14:00-18:00 Uhr</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Nicht gegen Bargeld einlösbar</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Nur einmalig einlösbar</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Nicht mit anderen Aktionen kombinierbar</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className="text-red-600"><strong>Der Gutschein muss vor der Bezahlung angegeben werden.</strong> Eine nachträgliche Gutschrift ist nicht möglich.</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Der Rechtsweg ist ausgeschlossen</strong></span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-4 px-6 rounded-xl transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Gift className="w-5 h-5" />
              <span>Gutschein jetzt generieren</span>
            </button>

            <p className="text-center text-xs text-gray-500 mt-4">
              Klicken Sie hier, um Ihren persönlichen Gutschein-Code zu erstellen
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Gutschein generieren</h2>
              <p className="text-gray-600">
                Erstellen Sie Ihren 10€ Reparatur-Gutschein mit einem Klick
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Gutschein-Details:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Wert:</strong> 10€ Rabatt auf Ihre Reparatur</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Mindestauftragswert:</strong> 90€</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Gültig:</strong> Mo-Fr 14:00-18:00 Uhr</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Nicht gegen Bargeld einlösbar</strong></span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleGenerateVoucher}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors inline-flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Gift className="w-5 h-5" />
              <span>{isGenerating ? 'Wird generiert...' : 'Gutschein jetzt generieren'}</span>
            </button>
          </div>
        )}

        {step === 4 && (
          <>
            <div className="no-print p-8">
              <div ref={voucherRef} className="voucher-content max-w-3xl mx-auto bg-white rounded-lg shadow-lg">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold mb-1">MNW Mobilfunk</h1>
                      <p className="text-sm text-blue-100">Handy Reparatur Ottobrunn</p>
                    </div>
                    <Gift className="w-12 h-12 text-blue-100" />
                  </div>
                </div>

                {/* Gutschein Content */}
                <div className="p-6">
                  {/* Wert */}
                  <div className="text-center mb-6 pb-6 border-b-2 border-gray-200">
                    <div className="text-6xl font-black text-blue-600 mb-2">10€</div>
                    <div className="text-xl font-bold text-gray-700">REPARATUR-GUTSCHEIN</div>
                  </div>

                  {/* Code */}
                  <div className="bg-gray-900 text-white rounded-lg p-5 mb-6 text-center">
                    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Gutschein-Code</div>
                    <div className="text-2xl font-mono font-bold tracking-widest">{voucherCode}</div>
                    <div className="text-xs text-gray-400 mt-2">Ausgestellt am: {generatedDate}</div>
                  </div>

                  {/* Bedingungen kompakt */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-xs font-bold text-blue-900 mb-2">GÜLTIGKEIT</div>
                      <div className="text-sm space-y-1">
                        <div className="font-semibold">Min. 90€</div>
                        <div className="text-gray-700">Mo-Fr, 14-18 Uhr</div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="text-xs font-bold text-gray-900 mb-2">HINWEISE</div>
                      <div className="text-sm space-y-1">
                        <div className="text-gray-700">Einmalig einlösbar</div>
                        <div className="text-gray-700">Nicht kombinierbar</div>
                      </div>
                    </div>
                  </div>

                  {/* Wichtiger Hinweis */}
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-900 font-semibold">
                      ⚠ Vor Bezahlung angeben! Nachträgliche Gutschrift nicht möglich.
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-4 border-t border-gray-200">
                    <div className="font-bold text-gray-900 mb-2">MNW Mobilfunk</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Unterhachinger Str. 28, 85521 Ottobrunn</div>
                      <div>Tel: 089 / 63 28 69 44</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-4 mt-6 max-w-3xl mx-auto">
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center space-x-2"
                >
                  <Printer className="w-5 h-5" />
                  <span>Gutschein drucken</span>
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Schließen
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
