import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Filter,
  Activity
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { AuditLog } from '../types/index.ts';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUKSES' | 'GAGAL'>('ALL');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setLogs(res);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              AUDIT LOG AKTIVITAS SISTEM
            </h1>
            <p className="text-xs text-slate-500">
              Rekam jejak otentikasi, modifikasi master data, pembuatan dokumen RPP, dan administrasi akun
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Muat Ulang Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <form onSubmit={handleSearchSubmit} className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari aktivitas, pengguna, atau rincian..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as 'ALL' | 'SUKSES' | 'GAGAL')}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">Semua Status</option>
              <option value="SUKSES">Status: SUKSES</option>
              <option value="GAGAL">Status: GAGAL</option>
            </select>
            <button
              type="submit"
              className="px-3 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Tabel Audit Log */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-40">Waktu & Tanggal</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-4">Aktivitas</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Detail & Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Memuat catatan aktivitas...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Belum ada rekaman audit log.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {new Date(log.timestamp).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{log.userName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{log.ip}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`font-semibold ${log.userRole === 'SUPER_ADMIN' ? 'text-purple-700' : 'text-sky-700'}`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          log.status === 'SUKSES' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {log.status === 'SUKSES' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs break-words">
                      {log.detail}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
