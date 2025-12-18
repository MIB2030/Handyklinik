import { useState, useEffect } from 'react';
import { Clock, Shield, Database, CheckCircle, Award, TrendingUp, ExternalLink } from 'lucide-react';
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

        {/* Call to Action - MNW Mobilfunk */}
        <div className="mt-8">
          <div className="w-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 border-2 border-blue-800 shadow-xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <Shield className="w-12 h-12 text-white" />
              <h3 className="text-2xl font-bold text-white">
                Mehr über uns - MNW Mobilfunk erfahren
              </h3>
              <p className="text-blue-100 max-w-2xl">
                Entdecken Sie unser komplettes Leistungsspektrum rund um Mobilfunk, DSL, Glasfaser und mehr auf unserer Hauptwebseite.
              </p>
              <a
                href="https://mobilfunk-service-ottobrunn.de"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Zur MNW Mobilfunk Website
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
