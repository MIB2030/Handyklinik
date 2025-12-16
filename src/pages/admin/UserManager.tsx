import { useEffect, useState } from 'react';
import { Plus, Trash2, Shield, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface UserWithRole {
  id: string;
  email: string;
  role: string;
  created_at: string;
  vorname: string;
  nachname: string;
}

interface EditingUser extends UserWithRole {
  password?: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'admin', vorname: '', nachname: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    const { data: rolesData, error } = await supabase
      .from('user_roles_with_email')
      .select('id, user_id, role, created_at, email, vorname, nachname');

    if (error) {
      setError('Fehler beim Laden der Benutzer');
      return;
    }

    if (rolesData) {
      const usersWithRoles: UserWithRole[] = rolesData.map(roleData => ({
        id: roleData.user_id,
        email: roleData.email,
        role: roleData.role,
        created_at: roleData.created_at,
        vorname: roleData.vorname || '',
        nachname: roleData.nachname || ''
      }));
      setUsers(usersWithRoles);
    }
  };

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Kein Benutzer erstellt');

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: newUser.role,
        });

      if (roleError) throw roleError;

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          vorname: newUser.vorname,
          nachname: newUser.nachname,
          role: newUser.role,
        });

      if (profileError) throw profileError;

      setMessage('Benutzer erfolgreich hinzugefügt');
      setShowAddForm(false);
      setNewUser({ email: '', password: '', role: 'admin', vorname: '', nachname: '' });
      loadUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Hinzufügen des Benutzers');
    }
  };

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setError('');
    setMessage('');

    try {
      if (editingUser.vorname || editingUser.nachname) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            vorname: editingUser.vorname,
            nachname: editingUser.nachname,
            role: editingUser.role,
          })
          .eq('id', editingUser.id);

        if (profileError) throw profileError;
      }

      if (editingUser.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: editingUser.password,
        });

        if (passwordError) throw passwordError;
      }

      if (editingUser.role) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: editingUser.role })
          .eq('user_id', editingUser.id);

        if (roleError) throw roleError;
      }

      setMessage('Benutzer erfolgreich aktualisiert');
      setEditingUser(null);
      loadUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Aktualisieren des Benutzers');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Möchten Sie diesen Benutzer wirklich löschen?')) return;

    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (!roleError) {
      setMessage('Benutzer erfolgreich gelöscht');
      loadUsers();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Sie haben keine Berechtigung, diese Seite zu sehen.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benutzerverwaltung</h1>
          <p className="text-gray-600 mt-2">Admin-Benutzer verwalten</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Benutzer hinzufügen</span>
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Neuen Benutzer hinzufügen</h2>
          <form onSubmit={addUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                <input
                  type="text"
                  value={newUser.vorname}
                  onChange={(e) => setNewUser({ ...newUser, vorname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                <input
                  type="text"
                  value={newUser.nachname}
                  onChange={(e) => setNewUser({ ...newUser, nachname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Hinzufügen
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewUser({ email: '', password: '', role: 'admin', vorname: '', nachname: '' });
                  setError('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      {editingUser && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Benutzer bearbeiten</h2>
          <form onSubmit={updateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                <input
                  type="text"
                  value={editingUser.vorname}
                  onChange={(e) => setEditingUser({ ...editingUser, vorname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                <input
                  type="text"
                  value={editingUser.nachname}
                  onChange={(e) => setEditingUser({ ...editingUser, nachname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input
                type="email"
                value={editingUser.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Neues Passwort (leer lassen zum Beibehalten)</label>
              <input
                type="password"
                value={editingUser.password || ''}
                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingUser(null);
                  setError('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-Mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rolle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Erstellt am</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {user.vorname} {user.nachname}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString('de-DE')}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-2 flex justify-end">
                  <button
                    onClick={() => setEditingUser({ ...user, password: '' })}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 className="h-5 w-5 inline" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
