import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  FileText,
  FileCode,
} from 'lucide-react';

interface ReportData {
  period_info: {
    period: string;
    start_date: string;
    end_date: string;
  };
  total_income: number;
  total_expense: number;
  net_balance: number;
  transaction_count: number;
  category_breakdown: Array<{
    category_id: number;
    category_name: string;
    type: string;
    color: string;
    count: number;
    total_amount: number;
    percentage: number;
  }>;
}

interface ExportItem {
  id: number;
  format: 'pdf' | 'csv' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name: string | null;
  download_url: string | null;
  error_message: string | null;
  created_at: string;
}

export const Reports: React.FC = () => {
  const [period, setPeriod] = useState<string>('monthly');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [exports, setExports] = useState<ExportItem[]>([]);
  const [loadingReport, setLoadingReport] = useState(true);

  // Export Request State
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'xlsx'>('pdf');
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    setLoadingReport(true);
    try {
      const params: any = { period };
      if (period === 'custom') {
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
      }
      const res = await api.get('/reports/summary', { params });
      setReport(res.data.data);
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const fetchExports = async () => {
    try {
      const res = await api.get('/exports');
      setExports(res.data.data);
    } catch (err) {
      console.error('Failed to fetch exports list', err);
    }
  };

  useEffect(() => {
    fetchReport();
    fetchExports();
  }, [period]);

  const handleRequestExport = async (e: React.FormEvent) => {
    e.preventDefault();
    setExporting(true);

    try {
      const payload: any = {
        format: exportFormat,
      };
      if (period === 'custom') {
        if (startDate) payload.start_date = startDate;
        if (endDate) payload.end_date = endDate;
      }

      await api.post('/exports', payload);
      alert('Permintaan ekspor laporan berhasil dikirim ke Background Queue!');
      fetchExports();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal mengajukan ekspor laporan');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadFile = (item: ExportItem) => {
    if (!item.download_url) return;
    const token = localStorage.getItem('bukuang_token');
    
    // Download via authenticated window fetch
    fetch(item.download_url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.file_name || `report.${item.format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error('Download failed', err));
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
          <h2 className="text-2xl font-bold text-slate-900">Laporan Keuangan & Pusat Ekspor</h2>
          <p className="text-slate-500 text-sm">Analisis laporan periode dan unduh berkas laporan (PDF, CSV, XLSX)</p>
        </div>
      </div>

      {/* Period Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly', 'yearly', 'custom'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <span className="text-slate-400">s/d</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <button
              onClick={fetchReport}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
            >
              Terapkan
            </button>
          </div>
        )}
      </div>

      {/* Report Summary Cards */}
      {loadingReport ? (
        <div className="flex items-center justify-center py-12 text-slate-500 gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Mengkalkulasi laporan...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Pemasukan</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatIDR(report?.total_income || 0)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Pengeluaran</span>
            <p className="text-xl font-extrabold text-rose-600 mt-1">{formatIDR(report?.total_expense || 0)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Net Saldo Periode</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{formatIDR(report?.net_balance || 0)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Jumlah Transaksi</span>
            <p className="text-xl font-extrabold text-blue-600 mt-1">{report?.transaction_count || 0} Transaksi</p>
          </div>
        </div>
      )}

      {/* Category Breakdown & Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Breakdown Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Breakdown Pengeluaran per Kategori</h3>
            <p className="text-xs text-slate-500">
              Periode: {report?.period_info.start_date} s/d {report?.period_info.end_date}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Tipe</th>
                  <th className="px-6 py-3 text-center">Jumlah TX</th>
                  <th className="px-6 py-3 text-right">Total Nominal</th>
                  <th className="px-6 py-3 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report?.category_breakdown && report.category_breakdown.length > 0 ? (
                  report.category_breakdown.map((item) => (
                    <tr key={item.category_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        <span
                          className="px-2.5 py-1 rounded-md text-xs text-white mr-2"
                          style={{ backgroundColor: item.color || '#059669' }}
                        >
                          {item.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 capitalize font-medium text-slate-600">{item.type}</td>
                      <td className="px-6 py-3.5 text-center font-semibold text-slate-700">{item.count}</td>
                      <td className="px-6 py-3.5 text-right font-bold text-slate-900">
                        {formatIDR(item.total_amount)}
                      </td>
                      <td className="px-6 py-3.5 text-right font-bold text-emerald-600">{item.percentage}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Belum ada pengeluaran terdeteksi pada periode ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Request Center Widget */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ekspor Laporan (Queue)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Generasi berkas ekspor latar belakang</p>
          </div>

          <form onSubmit={handleRequestExport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-2">Pilih Format File</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('pdf')}
                  className={`py-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    exportFormat === 'pdf'
                      ? 'bg-rose-50 border-rose-500 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  PDF Report
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`py-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    exportFormat === 'csv'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <FileCode className="w-5 h-5" />
                  CSV Data
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('xlsx')}
                  className={`py-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-bold transition-all ${
                    exportFormat === 'xlsx'
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  XLSX Excel
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={exporting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              {exporting ? 'Mengajukan Ekspor...' : 'Request Ekspor Berkas'}
            </button>
          </form>

          {/* Export History Table */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase">Riwayat Berkas Ekspor</h4>
              <button onClick={fetchExports} className="text-xs text-emerald-600 font-semibold hover:underline">
                Refresh
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {exports.length > 0 ? (
                exports.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-900 uppercase">{item.format} File</span>
                      <p className="text-[10px] text-slate-400">{item.created_at?.split('T')[0]}</p>
                    </div>

                    {item.status === 'completed' ? (
                      <button
                        onClick={() => handleDownloadFile(item)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                        {item.status}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">Belum ada berkas ekspor.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
