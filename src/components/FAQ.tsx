import { useState, useEffect } from 'react';
import { ChevronDown, MessageCircle, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    const { data } = await supabase
      .from('faq_items')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (data && data.length > 0) {
      setFaqs(data);
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Häufige Fragen & Antworten
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-[800px]' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </div>
                {faq.question.includes('Post') && openIndex === index && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                      <div className="flex items-center justify-center mb-4">
                        <MessageCircle className="w-6 h-6 text-green-600 mr-2" />
                        <h4 className="text-lg font-bold text-gray-900">Jetzt Reparatur anfragen</h4>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a
                          href="https://wa.me/4908963286944?text=Hallo%20Team,%0A%0Aich%20m%C3%B6chte%20mein%20Ger%C3%A4t%20per%20Post%20zur%20Reparatur%20einsenden.%0A%0AMein%20Ger%C3%A4t:%0A[z.B.%20iPhone%2014,%20Samsung%20Galaxy%20S23]%0A%0AProblem/Defekt:%0A[z.B.%20Display%20defekt,%20Akku%20tauschen]%0A%0AMeine%20Kontaktdaten:%0AName:%0ATelefon:%0AAdresse:%0A%0AVielen%20Dank!"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>WhatsApp Anfrage</span>
                        </a>
                        <a
                          href="mailto:info@mnw-mobilfunk.de?subject=Reparaturanfrage%20per%20Post&body=Hallo%20Team,%0A%0Aich%20m%C3%B6chte%20mein%20Ger%C3%A4t%20per%20Post%20zur%20Reparatur%20einsenden.%0A%0AMein%20Ger%C3%A4t:%0A[z.B.%20iPhone%2014,%20Samsung%20Galaxy%20S23]%0A%0AProblem/Defekt:%0A[z.B.%20Display%20defekt,%20Akku%20tauschen]%0A%0AMeine%20Kontaktdaten:%0AName:%0ATelefon:%0AAdresse:%0A%0AVielen%20Dank!"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                        >
                          <Mail className="w-5 h-5" />
                          <span>E-Mail Anfrage</span>
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
