import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Testimonial {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
  order_index: number;
  is_active: boolean;
}

export default function TestimonialManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Testimonial>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('order_index');

    if (data) setTestimonials(data);
  };

  const startEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setEditForm(testimonial);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('testimonials')
      .update(editForm)
      .eq('id', editingId);

    if (!error) {
      setMessage('Erfolgreich gespeichert');
      loadTestimonials();
      cancelEdit();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addTestimonial = async () => {
    const { error } = await supabase
      .from('testimonials')
      .insert([{
        ...editForm,
        order_index: testimonials.length,
        is_active: true,
      }]);

    if (!error) {
      setMessage('Bewertung hinzugefügt');
      loadTestimonials();
      setShowAddForm(false);
      setEditForm({});
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm('Möchten Sie diese Bewertung wirklich löschen?')) return;

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessage('Erfolgreich gelöscht');
      loadTestimonials();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bewertungen</h1>
          <p className="text-gray-600 mt-2">Kundenbewertungen verwalten</p>
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
          <h2 className="text-xl font-semibold mb-4">Neue Bewertung hinzufügen</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Kundenname"
              value={editForm.customer_name || ''}
              onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Bewertungstext"
              value={editForm.content || ''}
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bewertung</label>
              <select
                value={editForm.rating || 5}
                onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value={5}>5 Sterne</option>
                <option value={4}>4 Sterne</option>
                <option value={3}>3 Sterne</option>
                <option value={2}>2 Sterne</option>
                <option value={1}>1 Stern</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={addTestimonial}
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

      <div className="grid md:grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white rounded-lg shadow p-6">
            {editingId === testimonial.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.customer_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={editForm.content || ''}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  value={editForm.rating || 5}
                  onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={5}>5 Sterne</option>
                  <option value={4}>4 Sterne</option>
                  <option value={3}>3 Sterne</option>
                  <option value={2}>2 Sterne</option>
                  <option value={1}>1 Stern</option>
                </select>
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
                <div className="flex items-start justify-between mb-3">
                  <div className="flex">{renderStars(testimonial.rating)}</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(testimonial)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteTestimonial(testimonial.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{testimonial.content}</p>
                <p className="text-sm font-semibold text-gray-900">- {testimonial.customer_name}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
