import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  order_index: number;
  is_active: boolean;
}

export default function ServiceManager() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceItem>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    const { data } = await supabase
      .from('service_items')
      .select('*')
      .order('order_index');

    if (data) setServices(data);
  };

  const startEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setEditForm(service);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from('service_items')
      .update(editForm)
      .eq('id', editingId);

    if (!error) {
      setMessage('Erfolgreich gespeichert');
      loadServices();
      cancelEdit();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const addService = async () => {
    const { error } = await supabase
      .from('service_items')
      .insert([{
        ...editForm,
        order_index: services.length,
        is_active: true,
      }]);

    if (!error) {
      setMessage('Service hinzugefügt');
      loadServices();
      setShowAddForm(false);
      setEditForm({});
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm('Möchten Sie diesen Service wirklich löschen?')) return;

    const { error } = await supabase
      .from('service_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setMessage('Erfolgreich gelöscht');
      loadServices();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dienstleistungen</h1>
          <p className="text-gray-600 mt-2">Verwalten Sie Ihre Dienstleistungen</p>
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
          <h2 className="text-xl font-semibold mb-4">Neuen Service hinzufügen</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Titel"
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <textarea
              placeholder="Beschreibung"
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Icon Name (z.B. Smartphone, Wrench)"
              value={editForm.icon_name || ''}
              onChange={(e) => setEditForm({ ...editForm, icon_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            <div className="flex space-x-2">
              <button
                onClick={addService}
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
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-lg shadow p-6">
            {editingId === service.id ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={editForm.icon_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, icon_name: e.target.value })}
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
                    <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-gray-600 mt-2">{service.description}</p>
                    <p className="text-sm text-gray-500 mt-2">Icon: {service.icon_name}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(service)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteService(service.id)}
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
