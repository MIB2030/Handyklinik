import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Service {
  id: string;
  title: string;
  description: string;
  icon_name: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Unsere Reparatur-Services');

  useEffect(() => {
    loadServices();
    loadSectionTitle();
  }, []);

  const loadSectionTitle = async () => {
    const { data } = await supabase
      .from('page_texts')
      .select('value')
      .eq('section', 'services')
      .eq('key', 'main_title')
      .maybeSingle();

    if (data) {
      setSectionTitle(data.value);
    }
  };

  const loadServices = async () => {
    const { data } = await supabase
      .from('service_items')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (data && data.length > 0) {
      setServices(data);
    } else {
      setServices([
        {
          id: '1',
          title: 'Display-Reparatur',
          description: 'Risse, schwarze Flecken oder defekter Touchscreen? Wir ersetzen das komplette Display-Modul professionell.',
          icon_name: 'Smartphone'
        },
        {
          id: '2',
          title: 'Akku-Wechsel',
          description: 'Nachlassende Laufzeit oder plötzliche Neustarts? Wir tauschen Ihren Akku gegen einen hochwertigen Ersatzakku.',
          icon_name: 'Battery'
        },
        {
          id: '3',
          title: 'Weitere Reparaturen',
          description: 'Kamera, Ladebuchse, Lautsprecher und mehr – wir reparieren nahezu alle Schäden.',
          icon_name: 'Wrench'
        }
      ]);
    }
  };
  return (
    <section id="services" className="py-16 bg-gradient-to-b from-blue-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {sectionTitle}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => {
            const IconComponent = (Icons as any)[service.icon_name] || Icons.Wrench;
            const colors = ['bg-blue-100 text-blue-600', 'bg-green-100 text-green-600', 'bg-gray-100 text-gray-600'];
            const colorClass = colors[index % colors.length];

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className={`w-16 h-16 ${colorClass} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                  <IconComponent className="w-8 h-8" strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed text-center">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
