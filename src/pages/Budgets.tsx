import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, AlertTriangle, Trash2, Edit2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  type: string;
  color: string;
}

interface BudgetItem {
  id: number;
  category_id: number;
  category?: Category;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage: number;
  month: number;
  year: number;
  status: 'NORMAL' | 'WARNING' | 'EXCEEDED';
}

export const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories?type=expense');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/budgets', { params: { month, year } });
      setBudgets(res.data.data);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [month, year]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormCategory(categories[0]?.id.toString() || '');
    setFormAmount('');
    setShowModal(true);
  };

  const handleOpenEdit = (b: BudgetItem) => {
    setEditingItem(b);
    const catId = b.category_id || b.category?.id || (categories[0]?.id ?? '');
    setFormCategory(catId.toString());
    setFormAmount(b.amount.toString());
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      category_id: parseInt(formCategory),
      amount: parseFloat(formAmount),
      month,
      year,
    };

    try {
      if (editingItem) {
        await api.put(`/budgets/${editingItem.id}`, payload);
      } else {
        await api.post('/budgets', payload);
      }
      setShowModal(false);
      fetchBudgets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus alokasi budget ini?')) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus budget');
    }
  };

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Alokasi Budget Bulanan</h2>
          <p className="text-slate-500 text-sm">Batasi dan kendalikan pengeluaran bulanan per kategori</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Month Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs gap-3">
            <button
              onClick={() => {
                if (month === 1) {
                  setMonth(12);
                  setYear(year - 1);
                } else {
                  setMonth(month - 1);
                }
              }}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-900 min-w-[120px] text-center">
              {monthNames[month - 1]} {year}
            </span>
            <button
              onClick={() => {
                if (month === 12) {
                  setMonth(1);
                  setYear(year + 1);
                } else {
                  setMonth(month + 1);
                }
              }}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            Set Budget Kategori
          </button>
        </div>
      </div>

      {/* Budget Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500 gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Memuat alokasi budget...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.length > 0 ? (
            budgets.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="px-3 py-1 rounded-md text-xs font-bold text-white shadow-2xs"
                      style={{ backgroundColor: b.category?.color || '#059669' }}
                    >
                      {b.category?.name || 'Kategori'}
                    </span>
                    {b.status === 'EXCEEDED' ? (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-700 font-bold text-xs rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> EXCEEDED
                      </span>
                    ) : b.status === 'WARNING' ? (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> WARNING
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                        NORMAL
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 font-medium">Alokasi Limit Budget</p>
                    <p className="text-xl font-extrabold text-slate-900">{formatIDR(b.amount)}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Terpakai: {formatIDR(b.spent_amount)}</span>
                    <span className="text-slate-900 font-bold">{b.percentage}%</span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        b.status === 'EXCEEDED'
                          ? 'bg-rose-500'
                          : b.status === 'WARNING'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">
                      Sisa: <strong className="text-slate-900">{formatIDR(b.remaining_amount)}</strong>
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1 text-slate-400 hover:text-emerald-600 rounded-md"
                        title="Edit Limit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                        title="Hapus Budget"
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
              Belum ada alokasi budget untuk bulan {monthNames[month - 1]} {year}.
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingItem ? 'Edit Limit Budget' : 'Set Budget Kategori Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  disabled={!!editingItem}
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Limit Budget Bulanan (IDR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="Misal: 1500000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
