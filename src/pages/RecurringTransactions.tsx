import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Edit2, RefreshCw, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  type: string;
  color: string;
}

interface RecurringItem {
  id: number;
  category_id: number;
  category?: Category;
  type: 'income' | 'expense';
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  next_run_date: string;
  end_date: string | null;
  description: string;
  is_active: boolean;
}

export const RecurringTransactions: React.FC = () => {
  const [recurringList, setRecurringList] = useState<RecurringItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null);

  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formFrequency, setFormFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchRecurring = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recurring-transactions');
      setRecurringList(res.data.data);
    } catch (err) {
      console.error('Failed to load recurring transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchRecurring();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormType('expense');
    setFormCategory(categories.find((c) => c.type === 'expense')?.id.toString() || '');
    setFormAmount('');
    setFormFrequency('monthly');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormDesc('');
    setShowModal(true);
  };

  const handleOpenEdit = (item: RecurringItem) => {
    setEditingItem(item);
    setFormType(item.type);
    const catId = item.category_id || item.category?.id || (categories[0]?.id ?? '');
    setFormCategory(catId.toString());
    setFormAmount(item.amount.toString());
    setFormFrequency(item.frequency);
    setFormStartDate(item.start_date);
    setFormEndDate(item.end_date || '');
    setFormDesc(item.description);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      type: formType,
      category_id: parseInt(formCategory),
      amount: parseFloat(formAmount),
      frequency: formFrequency,
      start_date: formStartDate,
      end_date: formEndDate || null,
      description: formDesc,
      is_active: editingItem ? editingItem.is_active : true,
    };

    try {
      if (editingItem) {
        await api.put(`/recurring-transactions/${editingItem.id}`, payload);
      } else {
        await api.post('/recurring-transactions', payload);
      }
      setShowModal(false);
      fetchRecurring();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menyimpan transaksi berulang');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (item: RecurringItem) => {
    try {
      await api.put(`/recurring-transactions/${item.id}`, {
        category_id: item.category_id,
        type: item.type,
        amount: item.amount,
        frequency: item.frequency,
        start_date: item.start_date,
        description: item.description,
        is_active: !item.is_active,
      });
      fetchRecurring();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menginstal status keaktifan');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal transaksi berulang ini?')) return;
    try {
      await api.delete(`/recurring-transactions/${id}`);
      fetchRecurring();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus jadwal');
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Jadwal Transaksi Berulang</h2>
          <p className="text-slate-500 text-sm">Otomatisasi pemrosesan transaksi berulang (Gaji, Langganan, Tagihan)</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          Buat Jadwal Baru
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Memuat jadwal transaksi berulang...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Deskripsi</th>
                  <th className="px-6 py-3.5">Tipe</th>
                  <th className="px-6 py-3.5">Kategori</th>
                  <th className="px-6 py-3.5">Frekuensi</th>
                  <th className="px-6 py-3.5">Proses Berikutnya</th>
                  <th className="px-6 py-3.5 text-right">Nominal</th>
                  <th className="px-6 py-3.5 text-center">Status Active</th>
                  <th className="px-6 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recurringList.length > 0 ? (
                  recurringList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.description}</td>
                      <td className="px-6 py-4">
                        {item.type === 'income' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Income
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                            <ArrowDownRight className="w-3.5 h-3.5" /> Expense
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs font-semibold text-white shadow-2xs"
                          style={{ backgroundColor: item.category?.color || '#059669' }}
                        >
                          {item.category?.name || 'Kategori'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium capitalize text-slate-700">{item.frequency}</td>
                      <td className="px-6 py-4 font-medium text-slate-600">{item.next_run_date}</td>
                      <td
                        className={`px-6 py-4 text-right font-bold ${
                          item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatIDR(item.amount)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            item.is_active
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {item.is_active ? 'AKTIF' : 'NON-AKTIF'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                      Belum ada jadwal transaksi berulang yang dibuat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingItem ? 'Edit Jadwal Berulang' : 'Tambah Jadwal Transaksi Berulang'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi Transaksi</label>
                <input
                  type="text"
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Misal: Langganan Netflix Bulanan"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipe Transaksi</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="expense">Pengeluaran (Expense)</option>
                  <option value="income">Pemasukan (Income)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                <select
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories
                    .filter((c) => c.type === formType)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nominal (IDR)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="186000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frekuensi Pengulangan</label>
                <select
                  value={formFrequency}
                  onChange={(e) => setFormFrequency(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 capitalize"
                >
                  <option value="daily">Harian (Daily)</option>
                  <option value="weekly">Mingguan (Weekly)</option>
                  <option value="monthly">Bulanan (Monthly)</option>
                  <option value="yearly">Tahunan (Yearly)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai Berlaku</label>
                <input
                  type="date"
                  required
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
