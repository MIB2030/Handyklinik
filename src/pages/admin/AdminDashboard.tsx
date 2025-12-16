import { useEffect, useState } from 'react';
import { FileText, DollarSign, HelpCircle, Star, Wrench } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    prices: 0,
    services: 0,
    faqs: 0,
    testimonials: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [pricesData, servicesData, faqsData, testimonialsData] = await Promise.all([
      supabase.from('repair_prices').select('id', { count: 'exact', head: true }),
      supabase.from('service_items').select('id', { count: 'exact', head: true }),
      supabase.from('faq_items').select('id', { count: 'exact', head: true }),
      supabase.from('testimonials').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      prices: pricesData.count || 0,
      services: servicesData.count || 0,
      faqs: faqsData.count || 0,
      testimonials: testimonialsData.count || 0,
    });
  };

  const statCards = [
    { label: 'Preise', value: stats.prices, icon: DollarSign, color: 'bg-blue-500' },
    { label: 'Dienstleistungen', value: stats.services, icon: Wrench, color: 'bg-green-500' },
    { label: 'FAQ Einträge', value: stats.faqs, icon: HelpCircle, color: 'bg-yellow-500' },
    { label: 'Bewertungen', value: stats.testimonials, icon: Star, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Übersicht über Ihre Website-Inhalte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/content"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FileText className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Inhalte bearbeiten</h3>
              <p className="text-sm text-gray-600">Texte und Beschreibungen ändern</p>
            </div>
          </a>
          <a
            href="/admin/prices"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <DollarSign className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Preise verwalten</h3>
              <p className="text-sm text-gray-600">Preisliste bearbeiten und Excel importieren</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
