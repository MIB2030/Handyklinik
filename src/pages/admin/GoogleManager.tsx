import { useState } from 'react';
import { Star, MessageCircle, Settings } from 'lucide-react';
import TestimonialManager from './TestimonialManager';
import GoogleReviewsManager from './GoogleReviewsManager';
import GoogleSettingsManager from './GoogleSettingsManager';

type TabType = 'testimonials' | 'reviews' | 'settings';

export default function GoogleManager() {
  const [activeTab, setActiveTab] = useState<TabType>('testimonials');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Google Bewertungen</h1>
        <p className="text-gray-600">Verwalten Sie Kundenbewertungen und Google Reviews</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'testimonials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Star className="w-5 h-5" />
            <span>Bewertungen</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <MessageCircle className="w-5 h-5" />
            <span>Google Reviews</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`
              flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Settings className="w-5 h-5" />
            <span>Einstellungen</span>
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'testimonials' && <TestimonialManager />}
        {activeTab === 'reviews' && <GoogleReviewsManager />}
        {activeTab === 'settings' && <GoogleSettingsManager />}
      </div>
    </div>
  );
}
