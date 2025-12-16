import { useState, useEffect } from 'react';
import { Clock, Shield, Database, CheckCircle, Award, TrendingUp, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PageTexts {
  [key: string]: string;
}

const defaultFeatures = [
  {
    icon: Clock,
    titleKey: 'express_title',
    descriptionKey: 'express_description',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    icon: Shield,
    titleKey: 'warranty_title',
    descriptionKey: 'warranty_description',
    color: 'bg-green-100 text-green-600'
  },
  {
    icon: Database,
    titleKey: 'data_title',
    descriptionKey: 'data_description',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    icon: CheckCircle,
    titleKey: 'parts_title',
    descriptionKey: 'parts_description',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    icon: Award,
    titleKey: 'price_title',
    descriptionKey: 'price_description',
    color: 'bg-red-100 text-red-600'
  },
  {
    icon: TrendingUp,
    titleKey: 'experience_title',
    descriptionKey: 'experience_description',
    color: 'bg-indigo-100 text-indigo-600'
  }
];

export default function WhyUs() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [texts, setTexts] = useState<PageTexts>({});

  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    const { data } = await supabase
      .from('page_texts')
      .select('key, value')
      .in('section', ['why_us', 'why_us_features', 'why_us_card']);

    if (data) {
      const textsMap: PageTexts = {};
      data.forEach((item) => {
        textsMap[item.key] = item.value;
      });
      setTexts(textsMap);
    }
  };

  const getText = (key: string, defaultValue: string = '') => {
    return texts[key] || defaultValue;
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-12">
          {getText('main_title', 'Warum Handyklinik Ottobrunn?')}
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {defaultFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-full flex items-center justify-center mb-4`}>
                  <Icon className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {getText(feature.titleKey, '')}
                </h4>
                <p className="text-gray-600 text-sm">
                  {getText(feature.descriptionKey, '')}
                </p>
              </div>
            );
          })}
        </div>

        {/* Flip Card for detailed info */}
        <div className="perspective-1000 mt-8">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="relative w-full cursor-pointer preserve-3d transition-all duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: isFlipped ? '600px' : '120px'
            }}
          >
            {/* Front */}
            <div
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 border-2 border-blue-800 shadow-xl backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex items-center justify-center space-x-4">
                <Shield className="w-10 h-10 text-white" />
                <h3 className="text-2xl font-bold text-white">
                  {getText('front_title', 'Mehr über uns - MNW Mobilfunk erfahren')}
                </h3>
                <ChevronRight className={`w-6 h-6 text-white transition-transform ${isFlipped ? 'rotate-90' : ''}`} />
              </div>
              <p className="text-blue-100 text-center mt-2">
                {getText('front_subtitle', 'Klicken Sie hier für Details')}
              </p>
            </div>

            {/* Back */}
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border-2 border-blue-200 shadow-xl backface-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="max-h-[550px] overflow-y-auto pr-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-8 h-8 text-blue-600 mr-3" />
                  {getText('back_title', 'Ihr Vorteil seit über 20 Jahren')}
                </h3>

                <div className="space-y-6 text-gray-700">
                  <p className="leading-relaxed">
                    {getText('back_intro', '')}
                  </p>

                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      {getText('section1_title', 'Unabhängige Beratung')}
                    </h4>
                    <p className="leading-relaxed">
                      {getText('section1_text', '')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      {getText('section2_title', 'Rundum‑Service für Ihr Smartphone')}
                    </h4>
                    <p className="leading-relaxed">
                      {getText('section2_text', '')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      {getText('section3_title', 'Komplettlösungen für Zuhause und das Büro')}
                    </h4>
                    <p className="leading-relaxed">
                      {getText('section3_text', '')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      {getText('section4_title', 'Persönlicher Ansprechpartner im Isarcenter')}
                    </h4>
                    <p className="leading-relaxed">
                      {getText('section4_text', '')}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-center font-bold text-xl text-blue-600">
                      {getText('footer_text', 'MNW Mobilfunk – Wir verbinden Ottobrunn.')}
                    </p>
                  </div>
                </div>

                <p className="text-blue-600 text-center mt-6 text-sm font-medium">
                  {getText('back_subtitle', 'Klicken Sie erneut, um zurückzukehren')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
