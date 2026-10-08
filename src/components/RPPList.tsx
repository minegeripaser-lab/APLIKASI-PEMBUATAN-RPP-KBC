import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  Trash2, 
  Printer, 
  Lock, 
  BookOpen, 
  Layers, 
  Heart,
  Calendar,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { api } from '../services/api.ts';
import { exportToWord } from '../utils/documentExporter.ts';
import type { RPPDocument, User, Subject, SchoolIdentity } from '../types/index.ts';

interface RPPListProps {
  currentUser: User;
  subjects: Subject[];
  rpps: RPPDocument[];
  schoolIdentity: SchoolIdentity;
  onAddNew: () => void;
  onEdit: (rpp: RPPDocument) => void;
  onView: (rpp: RPPDocument) => void;
  onReload: () => void;
  mode: 'MY_RPP' | 'ALL_RPP';
}

export const RPPList: React.FC<RPPListProps> = ({
  currentUser,
  subjects,
  rpps,
  schoolIdentity,
  onAddNew,
  onEdit,
  onView,
  onReload,
  mode,
}) => {
  const [search, setSearch] = useState('');
  const [faseFilter, setFaseFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [kelasFilter, setKelasFilter] = useState<'ALL' | string>('ALL');
  const [mapelFilter, setMapelFilter] = useState<'ALL' | string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | string>('ALL');
  const [deleteConfirmRPP, setDeleteConfirmRPP] = useState<RPPDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filtered RPPs
  const filteredRPPs = useMemo(() => {
    return rpps.filter(rpp => {
      // Data isolation check: If GUEST, can only see their own RPPs
      if (currentUser.role === 'GUEST' && rpp.createdBy !== currentUser.id) {
        return false;
      }

      if (faseFilter !== 'ALL' && rpp.fase !== faseFilter) return false;
      if (kelasFilter !== 'ALL' && rpp.kelas !== kelasFilter) return false;
      if (mapelFilter !== 'ALL' && rpp.mataPelajaranId !== mapelFilter) return false;
      if (statusFilter !== 'ALL' && rpp.status !== statusFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          rpp.judul.toLowerCase().includes(q) ||
          rpp.nomorRpp.toLowerCase().includes(q) ||
          rpp.mataPelajaranNama.toLowerCase().includes(q) ||
          rpp.materiPokok.toLowerCase().includes(q) ||
          rpp.creatorName.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [rpps, currentUser, faseFilter, kelasFilter, mapelFilter, statusFilter, search]);

  const handleDelete = async () => {
    if (!deleteConfirmRPP) return;
    try {
      setDeleting(true);
      await api.deleteRPP(deleteConfirmRPP.id);
      setDeleteConfirmRPP(null);
      onReload();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus RPP.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {mode === 'ALL_RPP' ? 'SEMUA DOKUMEN RPP (ADMIN)' : 'RPP SAYA'}
              </h1>
              <p className="text-xs text-slate-500">
                {mode === 'ALL_RPP'
                  ? 'Pengawasan seluruh dokumen RPP guru se-madrasah MIN 1 Paser'
                  : 'Dokumen RPP yang Anda rancang berbasis Kurikulum Berbasis Cinta'}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ BUAT RPP BARU</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul materi, nomor RPP, mapel, atau guru..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Mapel */}
            <select
              value={mapelFilter}
              onChange={e => setMapelFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">Semua Mapel</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.kode} - {s.nama}
                </option>
              ))}
            </select>

            {/* Filter Fase */}
            <select
              value={faseFilter}
              onChange={e => setFaseFilter(e.target.value as 'ALL' | 'A' | 'B' | 'C')}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">Semua Fase</option>
              <option value="A">Fase A (Kls 1-2)</option>
              <option value="B">Fase B (Kls 3-4)</option>
              <option value="C">Fase C (Kls 5-6)</option>
            </select>

            {/* Filter Kelas */}
            <select
              value={kelasFilter}
              onChange={e => setKelasFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">Semua Kelas</option>
              <option value="I">Kelas I</option>
              <option value="II">Kelas II</option>
              <option value="III">Kelas III</option>
              <option value="IV">Kelas IV</option>
              <option value="V">Kelas V</option>
              <option value="VI">Kelas VI</option>
            </select>

            {/* Filter Status */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
            >
              <option value="ALL">Semua Status</option>
              <option value="SELESAI">Selesai</option>
              <option value="DRAFT">Draf</option>
            </select>
          </div>
        </div>

        {/* List of RPP Documents */}
        <div className="divide-y divide-slate-100">
          {filteredRPPs.length === 0 ? (
            <div className="py-14 text-center px-4">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum ada dokumen RPP yang sesuai</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Silakan ubah filter pencarian atau buat dokumen RPP KBC baru melalui tombol di atas.
              </p>
            </div>
          ) : (
            filteredRPPs.map(rpp => {
              const canModify = currentUser.role === 'SUPER_ADMIN' || rpp.createdBy === currentUser.id;
              return (
                <div
                  key={rpp.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {rpp.nomorRpp}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {rpp.mataPelajaranNama}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        Fase {rpp.fase} · Kelas {rpp.kelas} · {rpp.semester}
                      </span>
                    </div>

                    <h3
                      onClick={() => onView(rpp)}
                      className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {rpp.judul}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      <strong>Materi Pokok:</strong> {rpp.materiPokok}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                      {mode === 'ALL_RPP' && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Penyusun: <strong>{rpp.creatorName}</strong></span>
                        </span>
                      )}
                      <span>
                        Dibuat: {new Date(rpp.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-rose-700">
                        <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                        <span>{rpp.pancaCinta?.length || 0} Pilar Cinta</span>
                      </span>
                      <span>·</span>
                      <span className={`font-semibold ${rpp.status === 'SELESAI' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        Status: {rpp.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => onView(rpp)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                      title="Lihat RPP & Cetak / Ekspor PDF"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Cetak / PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => exportToWord(rpp, schoolIdentity)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-slate-300 rounded-lg transition-colors"
                      title="Unduh langsung berkas Word (.doc)"
                    >
                      <FileDown className="w-3.5 h-3.5 text-blue-600" />
                      <span>Word</span>
                    </button>

                    {canModify && (
                      <button
                        type="button"
                        onClick={() => onEdit(rpp)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-emerald-50 hover:text-emerald-800 border border-slate-300 rounded-lg transition-colors"
                        title="Edit Dokumen RPP"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit</span>
                      </button>
                    )}

                    {canModify && (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmRPP(rpp)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus RPP"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmRPP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              Hapus Dokumen RPP?
            </h3>
            <p className="text-xs text-center text-slate-600 mb-6">
              Dokumen <strong>{deleteConfirmRPP.judul}</strong> ({deleteConfirmRPP.nomorRpp}) akan dihapus secara permanen.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmRPP(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                {deleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
