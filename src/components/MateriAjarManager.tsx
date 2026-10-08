import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Sparkles, 
  Search, 
  FileText, 
  FileDown, 
  Printer, 
  Edit3, 
  Trash2, 
  Eye, 
  Heart, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  RefreshCw,
  Layers,
  GraduationCap,
  Calendar,
  Compass,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api.ts';
import { SubjectDropdown } from './SubjectDropdown.tsx';
import { exportMateriToWord, exportElementToPDF } from '../utils/documentExporter.ts';
import type { 
  MateriAjar, 
  Subject, 
  User, 
  SchoolIdentity, 
  PancaCintaItem 
} from '../types/index.ts';

interface MateriAjarManagerProps {
  currentUser: User;
  subjects: Subject[];
  schoolIdentity: SchoolIdentity;
  pancaCintaList: PancaCintaItem[];
}

export const MateriAjarManager: React.FC<MateriAjarManagerProps> = ({
  currentUser,
  subjects,
  schoolIdentity,
  pancaCintaList,
}) => {
  const [materiList, setMateriList] = useState<MateriAjar[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [faseFilter, setFaseFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [kelasFilter, setKelasFilter] = useState<'ALL' | string>('ALL');
  const [mapelFilter, setMapelFilter] = useState<'ALL' | string>('ALL');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'manual' | 'ai'>('manual');
  const [editingItem, setEditingItem] = useState<MateriAjar | null>(null);

  // Preview Modal State
  const [previewingItem, setPreviewingItem] = useState<MateriAjar | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MateriAjar | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // AI Generation State
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiPromptTopic, setAiPromptTopic] = useState('');
  const [aiStyle, setAiStyle] = useState('Bercerita Hangat, Berhikmah, Ramah Anak MI');

  // Form State
  const [formData, setFormData] = useState<Partial<MateriAjar>>({
    judul: '',
    mataPelajaranId: subjects[0]?.id || '',
    mataPelajaranNama: subjects[0]?.nama || '',
    mataPelajaranKelompok: subjects[0]?.kelompok || 'KELOMPOK B',
    fase: 'C',
    kelas: 'VI',
    semester: '1 (Ganjil)',
    topikUtama: '',
    pancaCinta: ['Cinta Allah SWT & Rasulullah SAW', 'Cinta Diri Sendiri & Sesama Manusia'],
    pengantarStimulus: '',
    uraianMateri: '',
    aktivitasSiswa: '',
    hikmahCinta: '',
    latihanSoal: '',
    glosarium: '',
  });

  const loadMateri = async () => {
    try {
      setLoading(true);
      const res = await api.getMateriAjar();
      setMateriList(res);
    } catch (err: any) {
      console.error('Failed to load materi ajar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateri();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredList = useMemo(() => {
    return materiList.filter(item => {
      if (faseFilter !== 'ALL' && item.fase !== faseFilter) return false;
      if (kelasFilter !== 'ALL' && item.kelas !== kelasFilter) return false;
      if (mapelFilter !== 'ALL' && item.mataPelajaranId !== mapelFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.judul.toLowerCase().includes(q) ||
          item.topikUtama.toLowerCase().includes(q) ||
          item.mataPelajaranNama.toLowerCase().includes(q) ||
          item.uraianMateri.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [materiList, faseFilter, kelasFilter, mapelFilter, search]);

  const handleOpenAdd = (mode: 'manual' | 'ai' = 'manual') => {
    setEditingItem(null);
    setEditorMode(mode);
    setFormData({
      judul: '',
      mataPelajaranId: subjects[0]?.id || '',
      mataPelajaranNama: subjects[0]?.nama || '',
      mataPelajaranKelompok: subjects[0]?.kelompok || 'KELOMPOK B',
      fase: 'C',
      kelas: 'VI',
      semester: '1 (Ganjil)',
      topikUtama: '',
      pancaCinta: ['Cinta Allah SWT & Rasulullah SAW', 'Cinta Diri Sendiri & Sesama Manusia'],
      pengantarStimulus: '',
      uraianMateri: '',
      aktivitasSiswa: '',
      hikmahCinta: '',
      latihanSoal: '',
      glosarium: '',
    });
    setAiPromptTopic('');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (item: MateriAjar) => {
    setEditingItem(item);
    setEditorMode('manual');
    setFormData({ ...item });
    setIsEditorOpen(true);
  };

  // Trigger AI Generator
  const handleGenerateAI = async () => {
    if (!formData.mataPelajaranId || !aiPromptTopic.trim()) {
      alert('Pilih Mata Pelajaran dan masukkan Topik Bahasan terlebih dahulu!');
      return;
    }

    const currentSub = subjects.find(s => s.id === formData.mataPelajaranId);

    try {
      setGeneratingAI(true);
      const res = await api.generateMateriAjarAI({
        mataPelajaranNama: currentSub?.nama || 'Mata Pelajaran MI',
        fase: formData.fase || 'C',
        kelas: formData.kelas || 'VI',
        topikUtama: aiPromptTopic.trim(),
        pancaCintaPilihan: formData.pancaCinta || [],
        gayaPenyampaian: aiStyle,
      });

      const gen = res.data;
      setFormData(prev => ({
        ...prev,
        judul: gen.judul,
        topikUtama: aiPromptTopic.trim(),
        pengantarStimulus: gen.pengantarStimulus,
        uraianMateri: gen.uraianMateri,
        aktivitasSiswa: gen.aktivitasSiswa,
        hikmahCinta: gen.hikmahCinta,
        latihanSoal: gen.latihanSoal,
        glosarium: gen.glosarium,
      }));

      // Switch to manual view so user can review and edit
      setEditorMode('manual');
      showNotice('success', 'Materi ajar berhasil dibuat dengan AI! Silakan tinjau dan simpan.');
    } catch (err: any) {
      alert(err.message || 'Gagal membuat materi ajar dengan AI.');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Save Materi Ajar
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul || !formData.mataPelajaranId || !formData.topikUtama) {
      alert('Judul, mata pelajaran, dan topik utama wajib diisi!');
      return;
    }

    try {
      if (editingItem) {
        await api.updateMateriAjar(editingItem.id, formData);
        showNotice('success', `Materi ajar "${formData.judul}" berhasil diperbarui.`);
      } else {
        await api.createMateriAjar(formData);
        showNotice('success', `Materi ajar "${formData.judul}" berhasil disimpan.`);
      }
      setIsEditorOpen(false);
      loadMateri();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan materi ajar.');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await api.deleteMateriAjar(deleteConfirmItem.id);
      showNotice('success', `Materi ajar "${deleteConfirmItem.judul}" berhasil dihapus.`);
      setDeleteConfirmItem(null);
      loadMateri();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus materi ajar.');
    }
  };

  // 1. Export Materi Ajar to Word (.doc)
  const handleExportMateriWord = (item: MateriAjar) => {
    try {
      exportMateriToWord(item, schoolIdentity);
      showNotice('success', `Berkas Word (.doc) untuk materi "${item.judul}" berhasil diunduh!`);
    } catch (err: any) {
      alert('Gagal mengunduh berkas Word: ' + err.message);
    }
  };

  // 2. Export Materi Ajar to PDF (.pdf)
  const handleExportMateriPDF = async (item: MateriAjar) => {
    try {
      setExportingPdf(true);
      setPdfProgress(15);
      const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
      const fileName = `Materi_Ajar_${sanitize(item.mataPelajaranNama)}_Kls${item.kelas}_${sanitize(item.topikUtama)}.pdf`;

      if (previewingItem?.id === item.id) {
        await exportElementToPDF('materi-printable-document', fileName, p => setPdfProgress(p));
        showNotice('success', `Berkas PDF untuk "${item.judul}" berhasil diekspor!`);
      } else {
        setPreviewingItem(item);
        setTimeout(async () => {
          try {
            await exportElementToPDF('materi-printable-document', fileName, p => setPdfProgress(p));
            showNotice('success', `Berkas PDF untuk "${item.judul}" berhasil diekspor!`);
          } catch (e: any) {
            alert('Gagal mengekspor PDF: ' + e.message);
          } finally {
            setExportingPdf(false);
            setPdfProgress(0);
          }
        }, 250);
        return;
      }
    } catch (err: any) {
      alert('Gagal mengekspor PDF: ' + err.message);
    } finally {
      setExportingPdf(false);
      setPdfProgress(0);
    }
  };

  // 3. Print Materi Ajar
  const handlePrintMateri = (item: MateriAjar) => {
    if (previewingItem?.id !== item.id) {
      setPreviewingItem(item);
      setTimeout(() => {
        window.print();
      }, 250);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                MATERI AJAR KURIKULUM BERBASIS CINTA (KBC)
              </h1>
              <p className="text-xs text-slate-500">
                Penyusunan modul dan bahan ajar ramah anak MI · Tersedia Input Manual dan Generate Otomatis AI
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenAdd('ai')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>✨ Generate Materi AI</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdd('manual')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Materi Manual</span>
          </button>
        </div>
      </div>

      {/* Notice */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between text-xs font-semibold ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul materi, topik bahasan, atau mapel..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
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

            <button
              type="button"
              onClick={loadMateri}
              title="Segarkan Data"
              className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List of Materi Cards */}
        <div className="p-4 sm:p-5">
          {filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Belum ada materi ajar yang ditemukan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Mulai menyusun bahan ajar baru dengan input manual atau buat otomatis dengan AI.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenAdd('ai')}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs rounded-lg"
                >
                  ✨ Generate dengan AI
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAdd('manual')}
                  className="px-3.5 py-1.5 bg-emerald-700 text-white font-bold text-xs rounded-lg"
                >
                  + Input Manual
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredList.map(item => {
                const canModify = currentUser.role === 'SUPER_ADMIN' || item.createdBy === currentUser.id;
                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.mataPelajaranNama}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Fase {item.fase} · Kelas {item.kelas} · {item.semester}
                        </span>
                      </div>

                      <h3
                        onClick={() => setPreviewingItem(item)}
                        className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-2 transition-colors"
                      >
                        {item.judul}
                      </h3>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        <strong>Topik:</strong> {item.topikUtama}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(item.pancaCinta || []).map((pc, idx) => (
                          <span key={idx} className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            ❤ {pc}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Metadata & Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Oleh: <strong>{item.creatorName}</strong>
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPreviewingItem(item)}
                          title="Baca & Pratinjau Materi"
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportMateriWord(item)}
                          title="Unduh Berkas Word (.doc)"
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleExportMateriPDF(item)}
                          title="Ekspor Berkas PDF (.pdf)"
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintMateri(item)}
                          title="Cetak Materi Ajar"
                          className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {canModify && (
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Materi Ajar"
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {canModify && (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem(item)}
                            title="Hapus Materi Ajar"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">
                  {editingItem ? 'Edit Materi Ajar' : 'Susun Materi Ajar KBC Baru'}
                </h3>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2">
                {!editingItem && (
                  <div className="flex items-center bg-emerald-900/80 p-0.5 rounded-lg border border-emerald-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setEditorMode('manual')}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        editorMode === 'manual' ? 'bg-white text-emerald-900' : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      Input Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('ai')}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                        editorMode === 'ai' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-emerald-200 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate AI</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-emerald-200 hover:text-white ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-800">
              {/* IF AI GENERATE TAB ACTIVE */}
              {editorMode === 'ai' && !editingItem ? (
                <div className="p-5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-4">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Perancang Materi Ajar Otomatis (Gemini AI KBC)</span>
                  </div>
                  <p className="text-slate-600">
                    Masukkan topik yang ingin diajarkan. Sistem AI akan merumuskan bahan ajar yang ramah anak MI, memuat kisah stimulus yang menggetarkan hati, materi kontekstual di Paser, aktivitas empati, dan hikmah kasih sayang.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <SubjectDropdown
                        subjects={subjects}
                        selectedSubjectId={formData.mataPelajaranId || ''}
                        onSelect={s => {
                          if (s) {
                            setFormData(prev => ({
                              ...prev,
                              mataPelajaranId: s.id,
                              mataPelajaranNama: s.nama,
                              mataPelajaranKelompok: s.kelompok,
                            }));
                          }
                        }}
                        faseFilter={formData.fase}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Fase / Kelas</label>
                      <div className="flex gap-2">
                        <select
                          value={formData.fase}
                          onChange={e => setFormData({ ...formData, fase: e.target.value as any })}
                          className="w-1/2 px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        >
                          <option value="A">Fase A</option>
                          <option value="B">Fase B</option>
                          <option value="C">Fase C</option>
                        </select>
                        <select
                          value={formData.kelas}
                          onChange={e => setFormData({ ...formData, kelas: e.target.value as any })}
                          className="w-1/2 px-2 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        >
                          {formData.fase === 'A' && (
                            <>
                              <option value="I">Kls I</option>
                              <option value="II">Kls II</option>
                            </>
                          )}
                          {formData.fase === 'B' && (
                            <>
                              <option value="III">Kls III</option>
                              <option value="IV">Kls IV</option>
                            </>
                          )}
                          {formData.fase === 'C' && (
                            <>
                              <option value="V">Kls V</option>
                              <option value="VI">Kls VI</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Topik Bahasan / Konsep yang Ingin Dijelaskan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={aiPromptTopic}
                      onChange={e => setAiPromptTopic(e.target.value)}
                      placeholder="Contoh: Rantai Makanan & Menjaga Hutan Paser / Adab Menghormati Guru / Pecahan Senilai"
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Gaya Penyampaian Bahasa
                    </label>
                    <select
                      value={aiStyle}
                      onChange={e => setAiStyle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="Bercerita Hangat, Berhikmah, Ramah Anak MI">
                        Bercerita Hangat, Berhikmah & Ramah Anak MI (Direkomendasikan)
                      </option>
                      <option value="Eksplorasi & Petualangan Sains Kasih Sayang">
                        Eksplorasi & Petualangan Sains Kasih Sayang
                      </option>
                      <option value="Kisah Keteladanan Islami & Akhlak Karakter">
                        Kisah Keteladanan Islami & Akhlak Karakter
                      </option>
                      <option value="Dialog Santun Interaktif & Tanya Jawab Empatis">
                        Dialog Santun Interaktif & Tanya Jawab Empatis
                      </option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={generatingAI}
                      onClick={handleGenerateAI}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-50"
                    >
                      {generatingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Menyusun Materi Ajar KBC dengan AI...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-800" />
                          <span>✨ Buat Materi Ajar AI Sekarang</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* FORM FIELDS (MANUAL EDITING / REVIEWING AI RESULTS) */}
              <form onSubmit={handleSave} className="space-y-4">
                {/* Row 1: Cascading & Identitas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Fase & Kelas MI <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.fase}
                        onChange={e => setFormData({ ...formData, fase: e.target.value as any })}
                        className="w-1/2 px-2 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        <option value="A">Fase A</option>
                        <option value="B">Fase B</option>
                        <option value="C">Fase C</option>
                      </select>
                      <select
                        value={formData.kelas}
                        onChange={e => setFormData({ ...formData, kelas: e.target.value as any })}
                        className="w-1/2 px-2 py-2 bg-white border border-slate-300 rounded-lg"
                      >
                        {formData.fase === 'A' && (
                          <>
                            <option value="I">Kelas I</option>
                            <option value="II">Kelas II</option>
                          </>
                        )}
                        {formData.fase === 'B' && (
                          <>
                            <option value="III">Kelas III</option>
                            <option value="IV">Kelas IV</option>
                          </>
                        )}
                        {formData.fase === 'C' && (
                          <>
                            <option value="V">Kelas V</option>
                            <option value="VI">Kelas VI</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <SubjectDropdown
                      subjects={subjects}
                      selectedSubjectId={formData.mataPelajaranId || ''}
                      onSelect={s => {
                        if (s) {
                          setFormData(prev => ({
                            ...prev,
                            mataPelajaranId: s.id,
                            mataPelajaranNama: s.nama,
                            mataPelajaranKelompok: s.kelompok,
                          }));
                        }
                      }}
                      faseFilter={formData.fase}
                    />
                  </div>
                </div>

                {/* Row 2: Topik Utama & Semester */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Topik Pokok Bahasan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.topikUtama || ''}
                      onChange={e => setFormData({ ...formData, topikUtama: e.target.value })}
                      placeholder="Contoh: Rantai Makanan & Ekosistem Hutan Hujan Tropis"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                    <select
                      value={formData.semester}
                      onChange={e => setFormData({ ...formData, semester: e.target.value as any })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="1 (Ganjil)">1 (Ganjil)</option>
                      <option value="2 (Genap)">2 (Genap)</option>
                    </select>
                  </div>
                </div>

                {/* Judul Materi Ajar */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Modul / Bahan Ajar <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.judul || ''}
                    onChange={e => setFormData({ ...formData, judul: e.target.value })}
                    placeholder="Contoh: Harmoni Ekosistem Hutan Paser: Rantai Makanan & Wujud Syukur Kepada Sang Pencipta"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-semibold"
                  />
                </div>

                {/* Pilar Panca Cinta Checkboxes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Pilar Panca Cinta yang Diintegrasikan:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {pancaCintaList.map(pc => {
                      const isChecked = (formData.pancaCinta || []).includes(pc.nama);
                      return (
                        <button
                          key={pc.id}
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const list = prev.pancaCinta || [];
                              return {
                                ...prev,
                                pancaCinta: list.includes(pc.nama)
                                  ? list.filter(x => x !== pc.nama)
                                  : [...list, pc.nama],
                              };
                            });
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                            isChecked
                              ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isChecked ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                          <span>{pc.nama}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 1. Pengantar Stimulus */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    1. Pengantar Penuh Kasih (Kisah Pemantik / Stimulus)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.pengantarStimulus || ''}
                    onChange={e => setFormData({ ...formData, pengantarStimulus: e.target.value })}
                    placeholder="Kisah pembuka yang menyentuh hati dan mengaitkan materi dengan ciptaan Allah SWT..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* 2. Uraian Materi Pokok */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    2. Uraian Materi Pokok (Konsep Utama) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.uraianMateri || ''}
                    onChange={e => setFormData({ ...formData, uraianMateri: e.target.value })}
                    placeholder="Penjelasan materi secara runtut, terstruktur, ramah anak, dan kontekstual..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* 3. Aktivitas Siswa */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    3. Aktivitas Kolaboratif Sahabat Cinta (Kegiatan Belajar Kelompok)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.aktivitasSiswa || ''}
                    onChange={e => setFormData({ ...formData, aktivitasSiswa: e.target.value })}
                    placeholder="Instruksi kegiatan kelompok yang melatih empati dan gotong royong..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* 4. Hikmah Kasih Sayang */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    4. Hikmah Kasih Sayang & Penerapan Sehari-Hari
                  </label>
                  <textarea
                    rows={2}
                    value={formData.hikmahCinta || ''}
                    onChange={e => setFormData({ ...formData, hikmahCinta: e.target.value })}
                    placeholder="Refleksi nilai cinta yang dapat diamalkan murid di rumah dan madrasah..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* 5. Latihan Soal */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    5. Latihan Mandiri & Pertanyaan Pemantik Berpikir Kritis
                  </label>
                  <textarea
                    rows={3}
                    value={formData.latihanSoal || ''}
                    onChange={e => setFormData({ ...formData, latihanSoal: e.target.value })}
                    placeholder="1. Pertanyaan pemahaman konsep...&#10;2. Pertanyaan penalaran...&#10;3. Pertanyaan aksi kebaikan..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* 6. Glosarium */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    6. Glosarium (Kosakata Kunci)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.glosarium || ''}
                    onChange={e => setFormData({ ...formData, glosarium: e.target.value })}
                    placeholder="• Istilah 1: Makna...&#10;• Istilah 2: Makna..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs"
                  >
                    {editingItem ? 'Simpan Perubahan' : 'Simpan Materi Ajar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Top Bar */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
                <h3 className="font-bold text-sm truncate">{previewingItem.judul}</h3>
              </div>
              <div className="flex items-center gap-2">
                {/* 1. Unduh Word */}
                <button
                  type="button"
                  onClick={() => handleExportMateriWord(previewingItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  title="Unduh berkas Word (.doc)"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh Word (.doc)</span>
                </button>

                {/* 2. Ekspor PDF */}
                <button
                  type="button"
                  disabled={exportingPdf}
                  onClick={() => handleExportMateriPDF(previewingItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
                  title="Ekspor berkas PDF (.pdf)"
                >
                  {exportingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>PDF ({pdfProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ekspor PDF (.pdf)</span>
                    </>
                  )}
                </button>

                {/* 3. Cetak Dokumen */}
                <button
                  type="button"
                  onClick={() => handlePrintMateri(previewingItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
                  title="Cetak Dokumen"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Dokumen</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewingItem(null)}
                  className="text-slate-400 hover:text-white ml-2 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Printable Document Container */}
            <div className="p-6 overflow-y-auto bg-slate-100">
              <div 
                id="materi-printable-document" 
                className="bg-white p-8 sm:p-12 rounded-xl border border-slate-300 shadow-xs max-w-3xl mx-auto text-slate-900 leading-relaxed font-sans"
              >
                {/* KOP RESMI MADRASAH */}
                <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center">
                  <div className="text-xs font-bold tracking-widest text-slate-700 uppercase">
                    Kementerian Agama Republik Indonesia
                  </div>
                  <div className="text-xs font-bold tracking-wider text-slate-800 uppercase mt-0.5">
                    Kantor Kementerian Agama Kabupaten Paser
                  </div>
                  <div className="text-xl font-black text-emerald-950 uppercase tracking-tight mt-1">
                    {schoolIdentity.namaMadrasah}
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {schoolIdentity.alamat}
                  </div>
                  <div className="text-[11px] font-medium text-emerald-800 italic mt-1">
                    Tahun Pelajaran {schoolIdentity.tahunPelajaran} · "{schoolIdentity.tagline}"
                  </div>
                </div>

                {/* JUDUL DOKUMEN */}
                <div className="text-center mb-6">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
                    MODUL / MATERI AJAR SISWA
                  </h2>
                  <div className="text-xs font-extrabold text-emerald-800 mt-0.5 uppercase tracking-wider">
                    KURIKULUM BERBASIS CINTA (KBC) 2026
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Topik Pembelajaran: <strong className="text-slate-800">{previewingItem.topikUtama}</strong>
                  </div>
                </div>

                {/* IDENTITAS MATERI */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs text-slate-800">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Mata Pelajaran:</span>
                      <strong className="text-slate-900">{previewingItem.mataPelajaranNama}</strong>
                      <span className="text-slate-500 block text-[10px]">({previewingItem.mataPelajaranKelompok})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Fase & Kelas:</span>
                      <strong className="text-slate-900">Fase {previewingItem.fase} · Kelas {previewingItem.kelas}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Semester:</span>
                      <strong className="text-slate-900">{previewingItem.semester}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Penyusun:</span>
                      <strong className="text-slate-900">{previewingItem.creatorName}</strong>
                    </div>
                  </div>
                </div>

                {/* PILAR KASIH SAYANG */}
                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg mb-6">
                  <div className="text-[11px] font-bold text-rose-900 uppercase tracking-wide mb-1.5">
                    Pilar Karakter Kasih Sayang yang Ditanamkan:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(previewingItem.pancaCinta || []).map((pc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white text-rose-800 border border-rose-200 font-bold text-[11px] shadow-2xs">
                        ❤ {pc}
                      </span>
                    ))}
                  </div>
                </div>

                {/* JUDUL MATERI UTAMA */}
                <h3 className="text-base font-extrabold text-emerald-950 pb-2 mb-4 border-b-2 border-emerald-800">
                  {previewingItem.judul}
                </h3>

                {/* 1. Pengantar Penuh Kasih */}
                <div className="mb-6 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded border-l-4 border-emerald-700">
                    1. Pengantar Penuh Kasih (Kisah Pemantik)
                  </h4>
                  <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100 text-xs italic text-slate-800 whitespace-pre-line leading-relaxed">
                    {previewingItem.pengantarStimulus || '-'}
                  </div>
                </div>

                {/* 2. Uraian Materi Pokok */}
                <div className="mb-6 space-y-1.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded border-l-4 border-emerald-700">
                    2. Uraian Materi Pokok
                  </h4>
                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                    {previewingItem.uraianMateri}
                  </div>
                </div>

                {/* 3. Aktivitas Siswa */}
                {previewingItem.aktivitasSiswa && (
                  <div className="mb-6 space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded border-l-4 border-emerald-700">
                      3. Aktivitas Kolaboratif Sahabat Cinta
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      {previewingItem.aktivitasSiswa}
                    </div>
                  </div>
                )}

                {/* 4. Hikmah Kasih Sayang */}
                {previewingItem.hikmahCinta && (
                  <div className="mb-6 space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900 bg-rose-50 p-2 rounded border-l-4 border-rose-600">
                      4. Hikmah Kasih Sayang & Penerapan Sehari-Hari
                    </h4>
                    <div className="p-3 bg-rose-50/30 rounded-lg border border-rose-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      {previewingItem.hikmahCinta}
                    </div>
                  </div>
                )}

                {/* 5. Latihan Mandiri */}
                {previewingItem.latihanSoal && (
                  <div className="mb-6 space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded border-l-4 border-emerald-700">
                      5. Latihan Mandiri & Pertanyaan Pemantik
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                      {previewingItem.latihanSoal}
                    </div>
                  </div>
                )}

                {/* 6. Glosarium */}
                {previewingItem.glosarium && (
                  <div className="mb-6 space-y-1.5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 bg-slate-100 p-2 rounded border-l-4 border-slate-500">
                      6. Glosarium Kosakata Kunci
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {previewingItem.glosarium}
                    </div>
                  </div>
                )}

                {/* PENGESAHAN RESMI */}
                <div className="mt-10 pt-6 border-t border-slate-200 grid grid-cols-2 text-center text-xs">
                  <div>
                    <p className="text-slate-600">Mengetahui,</p>
                    <p className="font-bold text-slate-900">Kepala Madrasah {schoolIdentity.namaMadrasah}</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-slate-900">{schoolIdentity.namaKepalaMadrasah}</p>
                    <p className="text-slate-600">NIP. {schoolIdentity.nipKepalaMadrasah}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">
                      Tanah Grogot, {new Date(previewingItem.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="font-bold text-slate-900">Guru Pengampu Mata Pelajaran</p>
                    <div className="h-16" />
                    <p className="font-bold underline text-slate-900">{previewingItem.creatorName}</p>
                    <p className="text-slate-600">NIP. {schoolIdentity.nipGuruDefault}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 mb-1">
              Hapus Materi Ajar?
            </h3>
            <p className="text-xs text-center text-slate-600 mb-6">
              Materi ajar <strong>"{deleteConfirmItem.judul}"</strong> akan dihapus dari sistem.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
