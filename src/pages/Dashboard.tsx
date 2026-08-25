import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SummaryData {
  total_balance: number;
  total_income: number;
  total_expense: number;
  total_savings: number;
  current_month_income: number;
  current_month_expense: number;
  current_month_savings: number;
  budget_usage_summary: {
    total_budget: number;
    total_spent: number;
    remaining: number;
    percentage: number;
  };
  recent_transactions: any[];
}

interface ChartData {
  income_vs_expense: Array<{
    month: string;
    label: string;
    income: number;
    expense: number;
  }>;
  expense_by_category: Array<{
    category_id: number;
    category_name: string;
    color: string;
    icon: string;
    amount: number;
    percentage: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summaryRes, chartsRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/charts'),
      ]);
      setSummary(summaryRes.data.data);
      setCharts(chartsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
        <span>Memuat data dashboard...</span>
      </div>
    );
  }

  // Prepare Line Chart Data
  const lineChartData = {
    labels: charts?.income_vs_expense.map((item) => item.label) || [],
    datasets: [
      {
        label: 'Pemasukan',
        data: charts?.income_vs_expense.map((item) => item.income) || [],
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Pengeluaran',
        data: charts?.income_vs_expense.map((item) => item.expense) || [],
        borderColor: '#E11D48',
        backgroundColor: 'rgba(225, 29, 72, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare Donut Chart Data
  const doughnutData = {
    labels: charts?.expense_by_category.map((item) => item.category_name) || [],
    datasets: [
      {
        data: charts?.expense_by_category.map((item) => item.amount) || [],
        backgroundColor:
          charts?.expense_by_category.map((item) => item.color) || ['#059669', '#3B82F6', '#F59E0B', '#E11D48'],
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Keuangan</h2>
          <p className="text-slate-500 text-sm">Ringkasan kondisi dan analisis keuangan Anda</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium shadow-xs transition-all"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Refresh
        </button>
      </div>

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Balance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Total Balance</span>
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{formatIDR(summary?.total_balance || 0)}</p>
          <p className="text-xs text-slate-500 mt-2">Saldo kumulatif bersih</p>
        </div>

        {/* Card 2: Monthly Income */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Pemasukan Bulan Ini</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{formatIDR(summary?.current_month_income || 0)}</p>
          <p className="text-xs text-slate-500 mt-2">Total masuk bulan berjalan</p>
        </div>

        {/* Card 3: Monthly Expense */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Pengeluaran Bulan Ini</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600">{formatIDR(summary?.current_month_expense || 0)}</p>
          <p className="text-xs text-slate-500 mt-2">Total keluar bulan berjalan</p>
        </div>

        {/* Card 4: Monthly Savings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Tabungan Bulan Ini</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-600">{formatIDR(summary?.current_month_savings || 0)}</p>
          <p className="text-xs text-slate-500 mt-2">Net pemasukan minus pengeluaran</p>
        </div>
      </div>

      {/* Middle Section: Line Chart & Donut Chart & Budget Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart 6 Months */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Tren Keuangan 6 Bulan Terakhir</h3>
          <p className="text-xs text-slate-500 mb-6">Perbandingan Pemasukan vs Pengeluaran</p>
          <div className="h-72">
            <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
              }}
            />
          </div>
        </div>

        {/* Donut Chart Expense Category & Budget Summary */}
        <div className="space-y-6">
          {/* Category Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Pengeluaran per Kategori</h3>
            <p className="text-xs text-slate-500 mb-4">Distribusi bulan ini</p>
            {charts?.expense_by_category && charts.expense_by_category.length > 0 ? (
              <div className="h-56 relative flex items-center justify-center">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                  }}
                />
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-12">Belum ada transaksi pengeluaran bulan ini.</p>
            )}
          </div>

          {/* Budget Overview Widget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Status Budget Bulanan</h3>
              {summary?.budget_usage_summary.percentage! >= 100 ? (
                <span className="px-2.5 py-1 bg-rose-100 text-rose-700 font-bold text-xs rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> EXCEEDED
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                  NORMAL
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-600">Terpakai ({summary?.budget_usage_summary.percentage}%)</span>
                <span className="text-slate-900 font-bold">
                  {formatIDR(summary?.budget_usage_summary.total_spent || 0)} / {formatIDR(summary?.budget_usage_summary.total_budget || 0)}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    summary?.budget_usage_summary.percentage! >= 100
                      ? 'bg-rose-500'
                      : summary?.budget_usage_summary.percentage! >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(summary?.budget_usage_summary.percentage || 0, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Sisa Anggaran: <strong className="text-slate-900">{formatIDR(summary?.budget_usage_summary.remaining || 0)}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent 5 Transactions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Transaksi Terbaru</h3>
            <p className="text-xs text-slate-500">5 transaksi terakhir yang Anda catat</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5">Tipe</th>
                <th className="px-6 py-3.5">Kategori</th>
                <th className="px-6 py-3.5">Deskripsi</th>
                <th className="px-6 py-3.5 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summary?.recent_transactions && summary.recent_transactions.length > 0 ? (
                summary.recent_transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium">{tx.transaction_date}</td>
                    <td className="px-6 py-4">
                      {tx.type === 'income' ? (
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
                        style={{ backgroundColor: tx.category?.color || '#059669' }}
                      >
                        {tx.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-900 font-medium">{tx.description || '-'}</td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'} {formatIDR(tx.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    Belum ada transaksi yang dicatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
