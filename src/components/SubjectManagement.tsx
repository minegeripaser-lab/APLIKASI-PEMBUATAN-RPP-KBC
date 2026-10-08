import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  X,
  Layers,
  Filter,
  Check
} from 'lucide-react';
import { api } from '../services/api.ts';
import type { Subject, SubjectKelompok } from '../types/index.ts';

interface SubjectManagementProps {
  subjects: Subject[];
  onReload: () => void;
}

export const SubjectManagement: React.FC<SubjectManagementProps> = ({
  subjects,
  onReload,
}) => {
  const [search, setSearch] = useState('');
  const [kelompokFilter, setKelompokFilter] = useState<'ALL' | SubjectKelompok>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AKTIF' | 'NONAKTIF'>('ALL');
  const [jenjangFilter] = useState<'MI'>('MI');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteModalSubject, setDeleteModalSubject] = useState<Subject | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kelompok: 'KELOMPOK B' as SubjectKelompok,
    fase: ['A', 'B', 'C'] as ('A' | 'B' | 'C')[],
    urutan: 10,
    deskripsi: '',
    status: 'AKTIF' as 'AKTIF' | 'NONAKTIF',
  });

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      if (kelompokFilter !== 'ALL' && subject.kelompok !== kelompokFilter) return false;
      if (statusFilter !== 'ALL' && subject.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          subject.nama.toLowerCase().includes(q) ||
          subject.kode.toLowerCase().includes(q) ||
          subject.deskripsi.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [subjects, kelompokFilter, statusFilter, search]);

  const handleOpenAdd = () => {
    setFormData({
      kode: '',
      nama: '',
      kelompok: 'KELOMPOK B',
      fase: ['A', 'B', 'C'],
      urutan: subjects.length + 1,
      deskripsi: '',
      status: 'AKTIF',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      kode: subject.kode,
      nama: subject.nama,
      kelompok: subject.kelompok,
      fase: subject.fase,
      urutan: subject.urutan,
      deskripsi: subject.deskripsi,
      status: subject.status,
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSubject(formData);
      showNotice('success', `Mata pelajaran ${formData.nama} berhasil ditambahkan.`);
      setIsAddModalOpen(false);
      onReload();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubject) return;
    try {
      await api.updateSubject(editingSubject.id, formData);
      showNotice('success', `Mata pelajaran ${formData.nama} berhasil diperbarui.`);
      setEditingSubject(null);
      onReload();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleToggleStatus = async (subject: Subject) => {
    try {
      const res = await api.toggleSubjectStatus(subject.id);
      showNotice('success', `Status ${subject.nama} berhasil diubah ke ${res.data.status}.`);
      onReload();
    } catch (err: any) {
      showNotice('error', err.message);
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteModalSubject) return;
    setDeleteErrorMessage(null);

    try {
      await api.deleteSubject(deleteModalSubject.id);
      showNotice('success', `Mata pelajaran ${deleteModalSubject.nama} berhasil dihapus.`);
      setDeleteModalSubject(null);
      onReload();
    } catch (err: any) {
      // Show exact requirement error if used in RPP
      setDeleteErrorMessage(err.message);
    }
  };

  const toggleFaseCheckbox = (f: 'A' | 'B' | 'C') => {
    setFormData(prev => {
      const exists = prev.fase.includes(f);
      if (exists) {
        if (prev.fase.length === 1) return prev; // must keep at least 1
        return { ...prev, fase: prev.fase.filter(x => x !== f) };
      } else {
        return { ...prev, fase: [...prev.fase, f].sort() as ('A' | 'B' | 'C')[] };
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              MANAJEMEN MATA PELAJARAN MI
            </h1>
            <p className="text-xs text-slate-500">
              Master Data Mata Pelajaran Madrasah Ibtidaiyah · Terintegrasi Dropdown & Fase A/B/C
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReload}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            title="Muat Ulang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ TAMBAH MATA PELAJARAN</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kode atau nama mata pelajaran..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Jenjang */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium">Jenjang:</span>
              <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-emerald-800 font-semibold">
                MI
              </span>
            </div>

            {/* Filter Kelompok */}
            <div>
              <select
                value={kelompokFilter}
                onChange={e => setKelompokFilter(e.target.value as 'ALL' | SubjectKelompok)}
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">Semua Kelompok</option>
                <option value="KELOMPOK A">Kelompok A (Keagamaan)</option>
                <option value="KELOMPOK B">Kelompok B (Umum)</option>
                <option value="KELOMPOK C">Kelompok C (Muatan/Kekhasan)</option>
              </select>
            </div>

            {/* Filter Status */}
            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'ALL' | 'AKTIF' | 'NONAKTIF')}
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Status: AKTIF</option>
                <option value="NONAKTIF">Status: NONAKTIF</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Mata Pelajaran */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100/70 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-3 w-28">Kode</th>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-3">Kelompok</th>
                <th className="py-3 px-2 text-center">Jenjang</th>
                <th className="py-3 px-3 text-center">Fase</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Tidak ada mata pelajaran yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      sub.status === 'NONAKTIF' ? 'bg-slate-50/40 opacity-75' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-center text-xs text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-bold text-slate-800">
                      {sub.kode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{sub.nama}</div>
                      {sub.deskripsi && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {sub.deskripsi}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <span className="font-semibold text-slate-700 block">
                        {sub.kelompok}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {sub.kelompokLabel}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-xs font-semibold text-emerald-800">
                      {sub.jenjang}
                    </td>
                    <td className="py-3 px-3 text-center text-xs font-mono text-slate-600">
                      {sub.fase.join(', ')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-xs font-semibold inline-flex items-center gap-1 ${
                          sub.status === 'AKTIF'
                            ? 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            sub.status === 'AKTIF' ? 'bg-emerald-600' : 'bg-rose-500'
                          }`}
                        />
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* [Edit] */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(sub)}
                          title="Edit Mata Pelajaran"
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* [Aktif/Nonaktif] */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(sub)}
                          title={sub.status === 'AKTIF' ? 'Nonaktifkan' : 'Aktifkan'}
                          className={`p-1.5 rounded transition-colors ${
                            sub.status === 'AKTIF'
                              ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                          }`}
                        >
                          {sub.status === 'AKTIF' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>

                        {/* [Hapus] */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteErrorMessage(null);
                            setDeleteModalSubject(sub);
                          }}
                          title="Hapus Mata Pelajaran"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingSubject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  {editingSubject ? `Edit Mata Pelajaran: ${editingSubject.nama}` : 'Tambah Mata Pelajaran MI Baru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSubject(null);
                }}
                className="text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingSubject ? handleSaveEdit : handleSaveAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Mapel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: FIQ-MI"
                    value={formData.kode}
                    onChange={e => setFormData({ ...formData, kode: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg uppercase focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    value={formData.urutan}
                    onChange={e => setFormData({ ...formData, urutan: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fikih Madrasah Ibtidaiyah"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kelompok <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.kelompok}
                    onChange={e => setFormData({ ...formData, kelompok: e.target.value as SubjectKelompok })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  >
                    <option value="KELOMPOK A">KELOMPOK A (Keagamaan)</option>
                    <option value="KELOMPOK B">KELOMPOK B (Umum)</option>
                    <option value="KELOMPOK C">KELOMPOK C (Muatan/Kekhasan)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as 'AKTIF' | 'NONAKTIF' })}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  >
                    <option value="AKTIF">AKTIF</option>
                    <option value="NONAKTIF">NONAKTIF</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Fase yang Didukung
                </label>
                <div className="flex items-center gap-3">
                  {(['A', 'B', 'C'] as const).map(f => {
                    const isChecked = formData.fase.includes(f);
                    return (
                      <label
                        key={f}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer select-none transition-colors ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFaseCheckbox(f)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Fase {f}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Ruang Lingkup
                </label>
                <textarea
                  rows={2}
                  value={formData.deskripsi}
                  onChange={e => setFormData({ ...formData, deskripsi: e.target.value })}
                  placeholder="Keterangan singkat ruang lingkup materi mata pelajaran..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSubject(null);
                  }}
                  className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs"
                >
                  Simpan Mata Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL (PROTECTION FOR IN-USE SUBJECTS) */}
      {deleteModalSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              Hapus Mata Pelajaran?
            </h3>
            <p className="text-xs text-center text-slate-600 mb-4">
              Anda akan menghapus mata pelajaran <strong>{deleteModalSubject.nama}</strong> ({deleteModalSubject.kode}).
            </p>

            {deleteErrorMessage ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 mb-4 space-y-1.5">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Proteksi Integritas Data RPP:</span>
                </p>
                <p>{deleteErrorMessage}</p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleToggleStatus(deleteModalSubject);
                      setDeleteModalSubject(null);
                    }}
                    className="w-full px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors shadow-xs"
                  >
                    Nonaktifkan Mata Pelajaran Ini Saja
                  </button>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalSubject(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteSubject}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
