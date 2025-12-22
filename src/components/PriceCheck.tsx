import { useState } from 'react';
import { Search, MessageCircle, Mail } from 'lucide-react';
import RepairRequestModal from './RepairRequestModal';

export default function PriceCheck() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedRepair, setSelectedRepair] = useState('');
  const [showPrice, setShowPrice] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const brands = ['Samsung', 'Apple', 'Huawei', 'Xiaomi', 'OnePlus', 'Google'];
  const models = ['Galaxy A35', 'Galaxy S23', 'Galaxy S24', 'iPhone 14', 'iPhone 15'];
  const repairs = ['Display Reparatur', 'Akku Wechsel', 'Kamera Reparatur', 'Ladebuchse'];

  const handleCalculate = () => {
    if (selectedBrand && selectedModel && selectedRepair) {
      setShowPrice(true);
    }
  };

  const handleWhatsAppRequest = () => {
    const message = `Hallo, ich interessiere mich für folgende Reparatur:\n\nGerät: ${selectedBrand} ${selectedModel}\nReparatur: ${selectedRepair}\nPreis: 170,00 €\n\nBitte kontaktieren Sie mich für einen Termin.`;
    const whatsappUrl = `https://wa.me/4915226878225?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Schnell-Preischeck
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Suche nach Gerät und Reparatur (z.B. 'iPhone 13 Display')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700"
              />
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mb-6">
            Oder wählen Sie Ihr Gerät manuell:
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hersteller</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Hersteller</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modell</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Modell</option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reparatur</label>
              <select
                value={selectedRepair}
                onChange={(e) => setSelectedRepair(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Reparatur</option>
                {repairs.map(repair => (
                  <option key={repair} value={repair}>{repair}</option>
                ))}
              </select>
            </div>
          </div>

          {showPrice && selectedBrand && selectedModel && selectedRepair && (
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center mb-6 shadow-xl">
              <div className="text-white mb-2 text-sm font-medium">Reparaturpreis</div>
              <div className="text-5xl font-bold text-white mb-6">170€</div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleWhatsAppRequest}
                  className="bg-white hover:bg-green-50 text-green-600 border-2 border-green-600 font-bold py-3 px-8 rounded-xl transition-colors inline-flex items-center justify-center space-x-2 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp Anfrage</span>
                </button>
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-600 font-bold py-3 px-8 rounded-xl transition-colors inline-flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email Anfrage</span>
                </button>
              </div>
            </div>
          )}

          {!showPrice && (
            <button
              onClick={handleCalculate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors"
            >
              Preis berechnen
            </button>
          )}

          <p className="text-center text-xs text-gray-500 mt-4">
            Alle Preisangaben sind unverbindlich. Endpreis nach Diagnose. Inkl. 19% MwSt.
          </p>
        </div>
      </div>

      {showPrice && (
        <RepairRequestModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          manufacturer={selectedBrand}
          model={selectedModel}
          repair={selectedRepair}
          price={170}
        />
      )}
    </section>
  );
}
