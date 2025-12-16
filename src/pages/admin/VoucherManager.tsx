import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Gift, Check, X, Calendar, Printer, Search, TrendingUp } from 'lucide-react';

interface Voucher {
  id: string;
  code: string;
  amount: number;
  status: 'active' | 'redeemed' | 'expired';
  generated_at: string;
  printed_at: string | null;
  print_count: number;
  redeemed_at: string | null;
  redeemed_by: string | null;
  notes: string | null;
}

interface VoucherStats {
  total: number;
  active: number;
  redeemed: number;
  printed: number;
  totalValue: number;
  redeemedValue: number;
}

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [filteredVouchers, setFilteredVouchers] = useState<Voucher[]>([]);
  const [stats, setStats] = useState<VoucherStats>({
    total: 0,
    active: 0,
    redeemed: 0,
    printed: 0,
    totalValue: 0,
    redeemedValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [notes, setNotes] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  useEffect(() => {
    filterVouchers();
  }, [vouchers, searchTerm, filterStatus]);

  const fetchVouchers = async () => {
    try {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('generated_at', { ascending: false });

      if (error) throw error;

      setVouchers(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (voucherList: Voucher[]) => {
    const stats: VoucherStats = {
      total: voucherList.length,
      active: voucherList.filter(v => v.status === 'active').length,
      redeemed: voucherList.filter(v => v.status === 'redeemed').length,
      printed: voucherList.filter(v => v.printed_at !== null).length,
      totalValue: voucherList.reduce((sum, v) => sum + v.amount, 0),
      redeemedValue: voucherList.filter(v => v.status === 'redeemed').reduce((sum, v) => sum + v.amount, 0),
    };
    setStats(stats);
  };

  const filterVouchers = () => {
    let filtered = [...vouchers];

    if (searchTerm) {
      filtered = filtered.filter(v =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => v.status === filterStatus);
    }

    setFilteredVouchers(filtered);
  };

  const handleRedeemVoucher = async (voucher: Voucher) => {
    try {
      const { error } = await supabase
        .from('vouchers')
        .update({
          status: 'redeemed',
          redeemed_at: new Date().toISOString(),
          redeemed_by: (await supabase.auth.getUser()).data.user?.id,
          notes: notes || voucher.notes,
        })
        .eq('id', voucher.id);

      if (error) throw error;

      await fetchVouchers();
      setIsModalOpen(false);
      setSelectedVoucher(null);
      setNotes('');
      alert('Gutschein erfolgreich eingelöst!');
    } catch (error) {
      console.error('Error redeeming voucher:', error);
      alert('Fehler beim Einlösen des Gutscheins');
    }
  };

  const handleMarkExpired = async (voucher: Voucher) => {
    if (!confirm('Möchten Sie diesen Gutschein wirklich als abgelaufen markieren?')) return;

    try {
      const { error } = await supabase
        .from('vouchers')
        .update({ status: 'expired' })
        .eq('id', voucher.id);

      if (error) throw error;

      await fetchVouchers();
    } catch (error) {
      console.error('Error marking voucher as expired:', error);
      alert('Fehler beim Aktualisieren des Gutscheins');
    }
  };

  const openRedeemModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setNotes(voucher.notes || '');
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      redeemed: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      active: 'Aktiv',
      redeemed: 'Eingelöst',
      expired: 'Abgelaufen',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Lade Gutscheine...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gutschein-Verwaltung</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt erstellt</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Gift className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktive Gutscheine</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Check className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Eingelöst</p>
              <p className="text-3xl font-bold text-blue-600">{stats.redeemed}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gedruckt</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.printed}</p>
            </div>
            <Printer className="w-12 h-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Gesamt-Wert</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalValue}€</p>
            </div>
            <Gift className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Eingelöster Wert</p>
              <p className="text-3xl font-bold text-red-600">{stats.redeemedValue}€</p>
            </div>
            <TrendingUp className="w-12 h-12 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Gutschein-Code suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle Status</option>
              <option value="active">Aktiv</option>
              <option value="redeemed">Eingelöst</option>
              <option value="expired">Abgelaufen</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wert
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Erstellt am
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gedruckt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eingelöst am
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-mono text-sm font-bold text-gray-900">{voucher.code}</div>
                    {voucher.notes && (
                      <div className="text-xs text-gray-500 mt-1">{voucher.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{voucher.amount}€</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(voucher.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(voucher.generated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {voucher.printed_at ? (
                      <div>
                        <div>{formatDate(voucher.printed_at)}</div>
                        <div className="text-xs text-gray-500">({voucher.print_count}x)</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Nicht gedruckt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(voucher.redeemed_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {voucher.status === 'active' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openRedeemModal(voucher)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          Einlösen
                        </button>
                        <button
                          onClick={() => handleMarkExpired(voucher)}
                          className="text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Ablaufen
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVouchers.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Keine Gutscheine gefunden</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedVoucher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Gutschein einlösen</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedVoucher(null);
                  setNotes('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Gutschein-Code:</div>
                <div className="font-mono text-lg font-bold text-gray-900">{selectedVoucher.code}</div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Wert:</div>
                <div className="text-2xl font-bold text-blue-600">{selectedVoucher.amount}€</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notizen (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="z.B. Rechnung XYZ, Kunde ABC..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleRedeemVoucher(selectedVoucher)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Jetzt einlösen</span>
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedVoucher(null);
                    setNotes('');
                  }}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
