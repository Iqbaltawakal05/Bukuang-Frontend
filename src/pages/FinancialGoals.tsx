import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Target, CheckCircle, Trash2, Edit2, RefreshCw, DollarSign } from 'lucide-react';

interface Contribution {
  id: number;
  amount: number;
  contribution_date: string;
  notes: string;
}

interface FinancialGoalItem {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  remaining: number;
  percentage: number;
  target_date: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  contributions?: Contribution[];
}

export const FinancialGoals: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoalItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Goal Modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoalItem | null>(null);
  const [goalName, setGoalName] = useState('');
  const [goalTargetAmount, setGoalTargetAmount] = useState('');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState('0');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalStatus, setGoalStatus] = useState<'active' | 'completed' | 'cancelled'>('active');

  // Setor Dana Modal
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoalItem | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositNotes, setDepositNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/financial-goals');
      setGoals(res.data.data);
    } catch (err) {
      console.error('Failed to fetch financial goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleOpenCreateGoal = () => {
    setEditingGoal(null);
    setGoalName('');
    setGoalTargetAmount('');
    setGoalCurrentAmount('0');
    setGoalTargetDate('');
    setGoalDesc('');
    setGoalStatus('active');
    setShowGoalModal(true);
  };

  const handleOpenEditGoal = (g: FinancialGoalItem) => {
    setEditingGoal(g);
    setGoalName(g.name);
    setGoalTargetAmount(g.target_amount.toString());
    setGoalCurrentAmount(g.current_amount.toString());
    setGoalTargetDate(g.target_date || '');
    setGoalDesc(g.description || '');
    setGoalStatus(g.status);
    setShowGoalModal(true);
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: goalName,
      target_amount: parseFloat(goalTargetAmount),
      current_amount: parseFloat(goalCurrentAmount || '0'),
      target_date: goalTargetDate,
      description: goalDesc,
      status: goalStatus,
    };

    try {
      if (editingGoal) {
        await api.put(`/financial-goals/${editingGoal.id}`, payload);
      } else {
        await api.post('/financial-goals', payload);
      }
      setShowGoalModal(false);
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan target keuangan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeposit = (g: FinancialGoalItem) => {
    setSelectedGoal(g);
    setDepositAmount('');
    setDepositDate(new Date().toISOString().split('T')[0]);
    setDepositNotes('');
    setShowDepositModal(true);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setSubmitting(true);

    const payload = {
      amount: parseFloat(depositAmount),
      contribution_date: depositDate,
      notes: depositNotes,
    };

    try {
      await api.post(`/financial-goals/${selectedGoal.id}/contributions`, payload);
      setShowDepositModal(false);
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menambah setoran dana');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus target keuangan ini?')) return;
    try {
      await api.delete(`/financial-goals/${id}`);
      fetchGoals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus target');
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Impian & Target Keuangan</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Rencanakan dan alokasikan tabungan masa depan Anda</p>
        </div>
        <button
          onClick={handleOpenCreateGoal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          Buat Target Baru
        </button>
      </div>

      {/* Goal Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500 gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Memuat target keuangan...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length > 0 ? (
            goals.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{g.name}</h3>
                    </div>
                    {g.status === 'completed' ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-bold text-xs rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-4">{g.description || 'Tidak ada deskripsi'}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-slate-400">Target Nominal:</span>
                      <p className="font-bold text-slate-900">{formatIDR(g.target_amount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Tenggat Target:</span>
                      <p className="font-bold text-slate-900">{g.target_date || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-600">Terkumpul: {formatIDR(g.current_amount)}</span>
                    <span className="text-emerald-600 font-bold">{g.percentage}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(g.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => handleOpenDeposit(g)}
                      disabled={g.status === 'completed'}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-semibold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 mr-2"
                    >
                      <DollarSign className="w-4 h-4" />
                      + Setor Dana
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditGoal(g)}
                        className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg"
                        title="Edit Target"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(g.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                        title="Hapus Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
              Belum ada target keuangan yang dibuat.
            </div>
          )}
        </div>
      )}

      {/* Modal Create/Edit Goal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingGoal ? 'Edit Target Keuangan' : 'Buat Target Keuangan Baru'}
            </h3>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Target Impian</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Misal: Beli Laptop Baru"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Nominal (IDR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={goalTargetAmount}
                  onChange={(e) => setGoalTargetAmount(e.target.value)}
                  placeholder="Misal: 15000000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dana Terkumpul Awal (IDR)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={goalCurrentAmount}
                  onChange={(e) => setGoalCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Tenggat Target</label>
                <input
                  type="date"
                  required
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (Opsional)</label>
                <textarea
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="Keterangan..."
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Setor Dana (+ Contribution) */}
      {showDepositModal && selectedGoal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Setor Dana Tabungan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Target: <strong className="text-slate-900">{selectedGoal.name}</strong> ({formatIDR(selectedGoal.target_amount)})
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nominal Setoran (IDR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Misal: 500000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Setoran</label>
                <input
                  type="date"
                  required
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Setoran (Opsional)</label>
                <input
                  type="text"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  placeholder="Misal: Setoran dari bonus kerja"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Memproses...' : 'Konfirmasi Setoran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
