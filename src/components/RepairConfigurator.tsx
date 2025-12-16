import { useState, useEffect } from 'react';
import { Info, ChevronRight, Euro, MessageCircle, Mail } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import QuickSearch from './QuickSearch';
import RepairRequestModal from './RepairRequestModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface RepairPrice {
  id: string;
  hersteller: string;
  modell: string;
  reparatur: string;
  preis: number;
  beschreibung: string;
}

interface SearchResult {
  id: string;
  hersteller: string;
  modell: string;
  reparatur: string;
  preis: number;
}

interface ManufacturerCardProps {
  name: string;
  count: number;
  onClick: () => void;
}

function ManufacturerCard({ name, count, onClick }: ManufacturerCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all duration-300 text-left"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
          <p className="text-sm text-gray-600">{count} Modelle verfügbar</p>
        </div>
        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}

interface RepairCardProps {
  repair: RepairPrice;
  onWhatsAppClick: () => void;
  onEmailClick: () => void;
  onInfoClick: () => void;
}

function RepairCard({ repair, onWhatsAppClick, onEmailClick, onInfoClick }: RepairCardProps) {
  const isBackcoverRepair = repair.reparatur.toLowerCase().includes('backcover');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{repair.reparatur}</h4>
          <p className="text-2xl sm:text-3xl font-bold text-blue-600 flex items-center gap-1">
            {isBackcoverRepair && <span className="text-lg sm:text-xl mr-1">ab</span>}
            {repair.preis.toFixed(2).replace('.', ',')} <Euro className="w-5 h-5 sm:w-6 sm:h-6" />
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">inkl. 19% MwSt.</p>
        </div>
        <button
          onClick={onInfoClick}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0"
          title="Mehr Informationen"
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onWhatsAppClick}
          className="flex-1 bg-white hover:bg-green-50 text-green-600 border-2 border-green-600 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">WhatsApp</span>
        </button>
        <button
          onClick={onEmailClick}
          className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-600 py-2 sm:py-3 px-2 sm:px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-base"
        >
          <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Email</span>
        </button>
      </div>
    </div>
  );
}

interface InfoModalProps {
  repair: RepairPrice | null;
  onClose: () => void;
}

function InfoModal({ repair, onClose }: InfoModalProps) {
  if (!repair) return null;

  const isBackcoverRepair = repair.reparatur.toLowerCase().includes('backcover');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">{repair.reparatur}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Für {repair.modell}</p>
          <p className="text-3xl font-bold text-blue-600 flex items-center gap-1">
            {isBackcoverRepair && <span className="text-xl mr-1">ab</span>}
            {repair.preis.toFixed(2).replace('.', ',')} <Euro className="w-6 h-6" />
          </p>
          <p className="text-sm text-gray-500">inkl. 19% MwSt.</p>
        </div>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">{repair.beschreibung}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Schließen
        </button>
      </div>
    </div>
  );
}

export default function RepairConfigurator() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [manufacturers, setManufacturers] = useState<{ name: string; count: number }[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [repairs, setRepairs] = useState<RepairPrice[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<RepairPrice | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState<{
    manufacturer: string;
    model: string;
    repair: string;
    price: number;
  } | null>(null);

  useEffect(() => {
    loadManufacturers();
  }, []);

  async function loadManufacturers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('repair_prices')
        .select('hersteller, modell');

      if (error) throw error;

      const manufacturerMap = new Map<string, Set<string>>();
      data?.forEach((item) => {
        if (!manufacturerMap.has(item.hersteller)) {
          manufacturerMap.set(item.hersteller, new Set());
        }
        manufacturerMap.get(item.hersteller)?.add(item.modell);
      });

      const manufacturerList = Array.from(manufacturerMap.entries()).map(([name, modelsSet]) => ({
        name,
        count: modelsSet.size,
      })).sort((a, b) => a.name.localeCompare(b.name));

      setManufacturers(manufacturerList);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleManufacturerSelect(manufacturer: string) {
    setSelectedManufacturer(manufacturer);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('repair_prices')
        .select('modell')
        .eq('hersteller', manufacturer);

      if (error) throw error;

      const uniqueModels = Array.from(new Set(data?.map((item) => item.modell) || [])).sort();
      setModels(uniqueModels);
      setStep(2);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleModelSelect(model: string) {
    setSelectedModel(model);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('repair_prices')
        .select('*')
        .eq('hersteller', selectedManufacturer)
        .eq('modell', model);

      if (error) throw error;

      const sortedData = (data || []).sort((a, b) => {
        const aIsDisplay = a.reparatur.toLowerCase().includes('display');
        const bIsDisplay = b.reparatur.toLowerCase().includes('display');
        const aIsAkku = a.reparatur.toLowerCase().includes('akku');
        const bIsAkku = b.reparatur.toLowerCase().includes('akku');

        if (aIsDisplay && !bIsDisplay) return -1;
        if (!aIsDisplay && bIsDisplay) return 1;
        if (aIsAkku && !bIsAkku) return -1;
        if (!aIsAkku && bIsAkku) return 1;

        return a.reparatur.localeCompare(b.reparatur);
      });

      setRepairs(sortedData);
      setStep(3);
    } catch (error) {
      console.error('Error loading repairs:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setStep(1);
    setSelectedManufacturer('');
    setSelectedModel('');
    setRepairs([]);
  }

  function handleBack() {
    if (step === 2) {
      setStep(1);
      setSelectedManufacturer('');
      setModels([]);
    } else if (step === 3) {
      setStep(2);
      setSelectedModel('');
      setRepairs([]);
    }
  }

  function handleWhatsAppRequest(repair: RepairPrice) {
    const isBackcoverRepair = repair.reparatur.toLowerCase().includes('backcover');
    const priceText = isBackcoverRepair ? `ab ${repair.preis.toFixed(2).replace('.', ',')} €` : `${repair.preis.toFixed(2).replace('.', ',')} €`;
    const message = `Hallo, ich interessiere mich für folgende Reparatur:\n\nGerät: ${selectedManufacturer} ${selectedModel}\nReparatur: ${repair.reparatur}\nPreis: ${priceText}\n\nBitte kontaktieren Sie mich für einen Termin.`;
    const whatsappUrl = `https://wa.me/4915226878225?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  function handleEmailRequest(repair: RepairPrice) {
    setEmailModalData({
      manufacturer: selectedManufacturer,
      model: selectedModel,
      repair: repair.reparatur,
      price: repair.preis
    });
    setShowEmailModal(true);
  }

  async function handleQuickSearchSelect(result: SearchResult) {
    setSelectedManufacturer(result.hersteller);
    setSelectedModel(result.modell);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('repair_prices')
        .select('*')
        .eq('hersteller', result.hersteller)
        .eq('modell', result.modell);

      if (error) throw error;

      const sortedData = (data || []).sort((a, b) => {
        const aIsDisplay = a.reparatur.toLowerCase().includes('display');
        const bIsDisplay = b.reparatur.toLowerCase().includes('display');
        const aIsAkku = a.reparatur.toLowerCase().includes('akku');
        const bIsAkku = b.reparatur.toLowerCase().includes('akku');

        if (aIsDisplay && !bIsDisplay) return -1;
        if (!aIsDisplay && bIsDisplay) return 1;
        if (aIsAkku && !bIsAkku) return -1;
        if (!aIsAkku && bIsAkku) return 1;

        return a.reparatur.localeCompare(b.reparatur);
      });

      setRepairs(sortedData);
      setStep(3);

      setTimeout(() => {
        const configuratorElement = document.getElementById('preisrechner');
        if (configuratorElement) {
          const offset = 100;
          const elementPosition = configuratorElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } catch (error) {
      console.error('Error loading repairs from search:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredModels = models;

  return (
    <div id="preisrechner" className="bg-gradient-to-br from-blue-50 to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuickSearch onSelect={handleQuickSearchSelect} />

        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
            Preis für Ihre Reparatur berechnen
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
            In nur 3 Schritten zum individuellen Angebot
          </p>
        </div>

        <div className="flex items-center justify-center mb-8 sm:mb-12">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-base sm:text-lg ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`w-8 sm:w-16 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-base sm:text-lg ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
            <div className={`w-8 sm:w-16 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-base sm:text-lg ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              3
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Lädt...</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center px-4">
                  Wählen Sie Ihren Hersteller
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {manufacturers.map((manufacturer) => (
                    <ManufacturerCard
                      key={manufacturer.name}
                      name={manufacturer.name}
                      count={manufacturer.count}
                      onClick={() => handleManufacturerSelect(manufacturer.name)}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="mb-6 px-4">
                  <button
                    onClick={handleBack}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 text-sm sm:text-base"
                  >
                    ← Zurück
                  </button>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center px-4">
                  Wählen Sie Ihr Modell
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-8 text-center px-4">{selectedManufacturer}</p>
                <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 max-h-96 overflow-y-auto px-4">
                  {filteredModels.map((model) => (
                    <button
                      key={model}
                      onClick={() => handleModelSelect(model)}
                      className="bg-white border-2 border-gray-200 rounded-lg p-3 sm:p-4 hover:border-blue-500 hover:shadow-md transition-all text-left font-semibold text-gray-900 text-sm sm:text-base"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="mb-6 flex items-center justify-between px-4">
                  <button
                    onClick={handleBack}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 text-sm sm:text-base"
                  >
                    ← Zurück
                  </button>
                  <button
                    onClick={handleReset}
                    className="text-gray-600 hover:text-gray-700 font-semibold text-sm sm:text-base"
                  >
                    Neu starten
                  </button>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center px-4">
                  Verfügbare Reparaturen
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-8 text-center px-4">
                  {selectedManufacturer} - {selectedModel}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
                  {repairs.map((repair) => (
                    <RepairCard
                      key={repair.id}
                      repair={repair}
                      onWhatsAppClick={() => handleWhatsAppRequest(repair)}
                      onEmailClick={() => handleEmailRequest(repair)}
                      onInfoClick={() => setSelectedRepair(repair)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <InfoModal
        repair={selectedRepair}
        onClose={() => setSelectedRepair(null)}
      />

      {emailModalData && (
        <RepairRequestModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setEmailModalData(null);
          }}
          manufacturer={emailModalData.manufacturer}
          model={emailModalData.model}
          repair={emailModalData.repair}
          price={emailModalData.price}
        />
      )}
    </div>
  );
}
