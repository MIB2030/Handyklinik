import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
}

export default function FAQManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FAQItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    const { data } = await supabase
      .from('faq_items')
      .select('*')
      .order('order_index');

    if (data) setFaqs(data);
  };

  const startEdit = (faq: FAQItem) => {
    setEditingId(faq.id);
    setEditForm(faq);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('faq_items')
      .update(editForm)
      .eq('id', editingId);

    if (!error) {
      setMessage('Erfolgreich gespeichert');
      loadFAQs();
      cancelEdit();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addFAQ = async () => {
    const { error } = await supabase
      .from('faq_items')
      .insert([{
        ...editForm,
        order_index: faqs.length,
        is_active: true,
      }]);

    if (!error) {
      setMessage('FAQ hinzugefügt');
      loadFAQs();
      setShowAddForm(false);
      setEditForm({});
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteFAQ = async (id: string) => {
    if (!confirm('Möchten Sie diesen FAQ-Eintrag wirklich löschen?')) return;

    const { error } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessage('Erfolgreich gelöscht');
      loadFAQs();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">FAQ verwalten</h1>
          <p className="text-gray-600 mt-2">Häufig gestellte Fragen bearbeiten</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Hinzufügen</span>
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Neue FAQ hinzufügen</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Frage"
              value={editForm.question || ''}
              onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Antwort"
              value={editForm.answer || ''}
              onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex space-x-2">
              <button
                onClick={addFAQ}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditForm({});
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white rounded-lg shadow p-6">
            {editingId === faq.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.question || ''}
                  onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={editForm.answer || ''}
                  onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={saveEdit}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>Speichern</span>
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center space-x-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    <X className="h-4 w-4" />
                    <span>Abbrechen</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                    <p className="text-gray-600 mt-2">{faq.answer}</p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => startEdit(faq)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteFAQ(faq.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
