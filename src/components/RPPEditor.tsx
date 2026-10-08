import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Save, 
  FileText, 
  Layers, 
  BookOpen, 
  GraduationCap, 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  HelpCircle,
  ShieldCheck,
  Compass,
  ArrowRight
} from 'lucide-react';
import { CascadingSelector } from './CascadingSelector.tsx';
import { api } from '../services/api.ts';
import type { 
  Subject, 
  RPPDocument, 
  User, 
  PancaCintaItem, 
  DimensiProfilItem, 
  ModelPembelajaranItem, 
  MetodePembelajaranItem, 
  JenisAsesmenItem 
} from '../types/index.ts';

interface RPPEditorProps {
  initialRPP?: RPPDocument | null;
  currentUser: User;
  subjects: Subject[];
  masterData: {
    pancaCinta: PancaCintaItem[];
    dimensiProfil: DimensiProfilItem[];
    models: ModelPembelajaranItem[];
    metode: MetodePembelajaranItem[];
    asesmen: JenisAsesmenItem[];
  };
  onSaveSuccess: (rpp: RPPDocument) => void;
  onCancel: () => void;
  onOpenMasterData?: () => void;
}

export const RPPEditor: React.FC<RPPEditorProps> = ({
  initialRPP,
  currentUser,
  subjects,
  masterData,
  onSaveSuccess,
  onCancel,
  onOpenMasterData,
}) => {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'identitas' | 'kbc' | 'langkah' | 'asesmen'>('identitas');

  // Form State
  const [formData, setFormData] = useState<Partial<RPPDocument>>(() => {
    if (initialRPP) return { ...initialRPP };
    return {
      judul: '',
      jenjang: 'MI',
      fase: 'C',
      kelas: 'VI',
      semester: '1 (Ganjil)',
      mataPelajaranId: subjects.length > 0 ? subjects[0].id : '',
      mataPelajaranNama: subjects.length > 0 ? subjects[0].nama : '',
      mataPelajaranKelompok: subjects.length > 0 ? subjects[0].kelompok : 'KELOMPOK B',
      alokasiWaktu: '2 x 35 Menit (1 Pertemuan)',
      tahunPelajaran: '2026/2027',
      pertemuanKe: 1,

      capaianPembelajaran: '',
      tujuanPembelajaran: [
        'Memahami konsep materi pokok dengan penuh antusias dan rasa syukur.',
        'Membiasakan sikap empati, kerja sama, dan saling menghormati saat berdiskusi.',
      ],
      materiPokok: '',
      kataKunci: ['MIN 1 Paser', 'KBC 2026'],

      pancaCinta: ['Cinta Allah SWT & Rasulullah SAW', 'Cinta Diri Sendiri & Sesama Manusia'],
      dimensiProfilLulusan: [
        'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia',
        'Bergotong Royong & Empati',
      ],
      targetKarakterCinta: 'Menghadirkan kelembutan hati dan ketulusan dalam mencari ilmu untuk mendekatkan diri kepada Allah SWT.',

      modelPembelajaran: masterData.models[0]?.nama || 'Problem Based Learning (PBL) Berbasis Cinta',
      metodePembelajaran: ['Dialog & Tanya Jawab Kasih Sayang', 'Diskusi Kelompok Kecil Saling Menghargai'],
      mediaSumberBelajar: ['Lembar Kerja Siswa Berbasis Kasih', 'Buku Siswa & Guru Kemenag RI 2026', 'Media Visual / Proyektor'],

      kegiatanAwal: {
        durasi: '10 Menit',
        salamDanDoa: 'Guru menyapa siswa dengan senyum hangat, salam Islami penuh doa rahmat, lalu berdoa thalabul ilmi dengan khusyuk.',
        apersepsiCinta: 'Guru menanyakan kabar perasaan siswa hari ini ("Bagaimana suasana hati Ananda hari ini?") dan mengaitkan materi dengan kasih sayang Allah.',
        tujuanDanMotivasi: 'Menyampaikan tujuan belajar dengan bahasa santun dan memotivasi murid bahwa menuntut ilmu adalah ibadah mulia.',
      },
      kegiatanInti: {
        durasi: '50 Menit',
        eksplorasiKasih: 'Eksplorasi materi pelajaran yang dihubungkan dengan kebesaran ciptaan Allah SWT dan bukti cinta-Nya kepada makhluk.',
        kolaborasiEmpati: 'Kerja kelompok damai beranggotakan 4-5 anak. Murid saling membantu teman yang belum paham tanpa kata merendahkan.',
        internalisasiNilai: 'Diskusi hikmah materi: menghubungkan temuan pelajaran dengan sikap kepedulian di keluarga dan madrasah.',
        sintaksDetail: 'Fase orientasi masalah penuh empati -> Pengorganisasian tim gotong royong -> Penyelidikan bersama -> Penyajian hasil saling apresiasi -> Refleksi.',
      },
      kegiatanPenutup: {
        durasi: '10 Menit',
        refleksiCinta: 'Murid merefleksikan: "Kebaikan apa yang aku dapatkan hari ini yang bisa kuamalkan kepada orang tua dan teman?"',
        umpanBalikApresiatif: 'Guru memberikan apresiasi spesifik atas usaha, kerja sama santun, dan ketertiban seluruh murid.',
        doaDanTindakLanjut: 'Doa penutup majelis dan salam perpisahan penuh kesantunan.',
      },

      asesmenAwal: 'Sapaan emosional di awal pembelajaran dan pertanyaan pemantik ringan untuk mengecek kesiapan belajar.',
      asesmenFormatif: 'Observasi sikap gotong royong, empati, dan kesantunan berbahasa menggunakan Lembar Karakter Cinta KBC.',
      asesmenSumatif: 'Unjuk kerja pemahaman bermakna melalui presentasi kelompok atau Lembar Kerja Kasih Mandiri.',
      rubrikPenilaian: 'Level 4 (Sangat Baik): Menguasai materi & konsisten berakhlak mulia. Level 3 (Baik): Menguasai materi & kooperatif. Level 2 (Cukup): Cukup menguasai. Level 1 (Bimbingan): Dibimbing dengan penuh kasih sayang.',
      remedialPengayaan: 'Remedial: Pendampingan personal dengan penuh kesabaran. Pengayaan: Eksplorasi kontekstual lanjutan di lingkungan madrasah.',
      status: 'SELESAI',
    };
  });

  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    score: number;
    grade: string;
    issues: string[];
    strengths: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subject selection handling
  const handleSubjectSelect = (sub: Subject | null) => {
    if (sub) {
      setFormData(prev => ({
        ...prev,
        mataPelajaranId: sub.id,
        mataPelajaranNama: sub.nama,
        mataPelajaranKelompok: sub.kelompok,
        judul: prev.judul || `Pembelajaran ${sub.nama} - Kelas ${prev.kelas}`,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        mataPelajaranId: '',
        mataPelajaranNama: '',
      }));
    }
  };

  // Helper for array fields
  const toggleCheckboxItem = (field: 'pancaCinta' | 'dimensiProfilLulusan' | 'metodePembelajaran', item: string) => {
    setFormData(prev => {
      const currentList = (prev[field] as string[]) || [];
      if (currentList.includes(item)) {
        return { ...prev, [field]: currentList.filter(x => x !== item) };
      } else {
        return { ...prev, [field]: [...currentList, item] };
      }
    });
  };

  // Dynamic TP item handlers
  const handleAddTP = () => {
    setFormData(prev => ({
      ...prev,
      tujuanPembelajaran: [...(prev.tujuanPembelajaran || []), ''],
    }));
  };

  const handleUpdateTP = (index: number, val: string) => {
    setFormData(prev => {
      const list = [...(prev.tujuanPembelajaran || [])];
      list[index] = val;
      return { ...prev, text: list, tujuanPembelajaran: list };
    });
  };

  const handleRemoveTP = (index: number) => {
    setFormData(prev => {
      const list = (prev.tujuanPembelajaran || []).filter((_, i) => i !== index);
      return { ...prev, tujuanPembelajaran: list };
    });
  };

  // Run KBC Validation
  const handleValidate = async () => {
    try {
      const res = await api.validateRPP(formData);
      setValidationResult(res);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // AI & Curated KBC Generator
  const handleGenerateKBC = async () => {
    if (!formData.mataPelajaranId || !formData.materiPokok) {
      alert('Pilih Mata Pelajaran dan masukkan Materi Pokok terlebih dahulu sebelum generate otomatis.');
      return;
    }

    try {
      setGenerating(true);
      const res = await api.generateKbcContent({
        mataPelajaranNama: formData.mataPelajaranNama || 'Mata Pelajaran MI',
        fase: formData.fase || 'C',
        kelas: formData.kelas || 'VI',
        materiPokok: formData.materiPokok || '',
        pancaCintaPilihan: formData.pancaCinta || [],
        modelPembelajaran: formData.modelPembelajaran,
      });

      const gen = res.data;
      setFormData(prev => ({
        ...prev,
        capaianPembelajaran: gen.capaianPembelajaran,
        tujuanPembelajaran: gen.tujuanPembelajaran,
        targetKarakterCinta: gen.targetKarakterCinta,
        kegiatanAwal: gen.kegiatanAwal,
        kegiatanInti: gen.kegiatanInti,
        kegiatanPenutup: gen.kegiatanPenutup,
        asesmenFormatif: gen.asesmenFormatif,
        asesmenSumatif: gen.asesmenSumatif,
        rubrikPenilaian: gen.rubrikPenilaian,
      }));

      // Validate immediately after generating
      setTimeout(handleValidate, 300);
    } catch (err: any) {
      alert(err.message || 'Gagal merancang otomatis KBC.');
    } finally {
      setGenerating(false);
    }
  };

  // Save RPP
  const handleSave = async (status: 'DRAFT' | 'SELESAI') => {
    setErrorMessage(null);
    if (!formData.judul || !formData.mataPelajaranId || !formData.materiPokok) {
      setErrorMessage('Judul RPP, Mata Pelajaran, dan Materi Pokok wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        status,
      };

      let result: RPPDocument;
      if (initialRPP?.id) {
        const res = await api.updateRPP(initialRPP.id, payload);
        result = res.data;
      } else {
        const res = await api.createRPP(payload);
        result = res.data;
      }

      onSaveSuccess(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan RPP.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-rose-300 fill-rose-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              Kurikulum Berbasis Cinta (KBC) 2026 · MIN 1 Paser
            </span>
          </div>
          <h1 className="text-2xl font-black">
            {initialRPP ? 'Edit Dokumen RPP KBC' : 'Rancang Modul / RPP Berbasis Cinta'}
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xl">
            "Merancang Pembelajaran dengan Cinta" · Terintegrasi seluruh mata pelajaran Madrasah Ibtidaiyah, Fase A/B/C, dan pilar Panca Cinta.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick AI & Curated Engine Trigger */}
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerateKBC}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-800" />
            <span>{generating ? 'Merancang KBC...' : '✨ Auto-Design KBC 2026'}</span>
          </button>

          <button
            type="button"
            onClick={handleValidate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700/80 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg border border-emerald-600 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cek Standar KBC</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave('DRAFT')}
            disabled={saving}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Simpan Draf
          </button>

          <button
            type="button"
            onClick={() => handleSave('SELESAI')}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4 text-emerald-700" />
            <span>{saving ? 'Menyimpan...' : 'Simpan RPP Selesai'}</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {/* Validation Result Box */}
      {validationResult && (
        <div className={`p-4 rounded-xl border text-xs ${
          validationResult.valid ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-sm">Hasil Validasi Kepatuhan KBC 2026: {validationResult.grade}</span>
            </div>
            <span className="font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
              Skor: {validationResult.score} / 100
            </span>
          </div>

          {validationResult.issues.length > 0 && (
            <div className="mt-2 space-y-1">
              <span className="font-semibold text-red-700 block">Perlu Dilengkapi:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                {validationResult.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
            </div>
          )}

          {validationResult.strengths.length > 0 && (
            <div className="mt-2 space-y-1">
              <span className="font-semibold text-emerald-700 block">Kekuatan Dokumen:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1">
                {validationResult.strengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Document Title & Meta Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Judul Modul / Dokumen RPP <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.judul || ''}
            onChange={e => setFormData({ ...formData, judul: e.target.value })}
            placeholder="Contoh: Pembelajaran IPAS Fase C Kelas VI - Menjaga Keseimbangan Ekosistem Hutan Paser Berbasis Cinta Lingkungan"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-semibold text-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-600 mb-1">Alokasi Waktu</label>
            <input
              type="text"
              value={formData.alokasiWaktu || ''}
              onChange={e => setFormData({ ...formData, alokasiWaktu: e.target.value })}
              placeholder="Contoh: 2 x 35 Menit (Pertemuan 1)"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Pertemuan Ke-</label>
            <input
              type="number"
              value={formData.pertemuanKe || 1}
              onChange={e => setFormData({ ...formData, pertemuanKe: Number(e.target.value) })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-600 mb-1">Tahun Pelajaran</label>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700">
              {formData.tahunPelajaran}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-2 rounded-t-xl overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('identitas')}
          className={`px-4 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'identitas'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>A. Identitas & Cascading MI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kbc')}
          className={`px-4 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'kbc'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>B & C. Capaian & Pilar Panca Cinta</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('langkah')}
          className={`px-4 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'langkah'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>D & E. Desain & Langkah Kasih Sayang</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('asesmen')}
          className={`px-4 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'asesmen'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>F. Asesmen Empati & Rubrik</span>
        </button>
      </div>

      {/* TAB CONTENT 1: A. Identitas Pembelajaran (Cascading) */}
      {activeTab === 'identitas' && (
        <div className="space-y-4">
          <CascadingSelector
            jenjang="MI"
            fase={formData.fase || 'C'}
            kelas={formData.kelas || 'VI'}
            semester={formData.semester || '1 (Ganjil)'}
            selectedSubjectId={formData.mataPelajaranId || ''}
            subjects={subjects}
            capaianPembelajaran={formData.capaianPembelajaran || ''}
            materiPokok={formData.materiPokok || ''}
            onFaseChange={f => setFormData({ ...formData, fase: f })}
            onKelasChange={k => setFormData({ ...formData, kelas: k })}
            onSemesterChange={s => setFormData({ ...formData, semester: s })}
            onSubjectSelect={handleSubjectSelect}
            onCPChange={cp => setFormData({ ...formData, capaianPembelajaran: cp })}
            onMateriChange={m => setFormData({ ...formData, materiPokok: m })}
            onOpenMasterData={onOpenMasterData}
            isSuperAdmin={currentUser.role === 'SUPER_ADMIN'}
          />

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('kbc')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <span>Lanjut ke Pilar Panca Cinta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: B & C. Capaian, Tujuan, Pilar Panca Cinta & Profil */}
      {activeTab === 'kbc' && (
        <div className="space-y-6 bg-white p-5 rounded-xl border border-slate-200">
          {/* Tujuan Pembelajaran Dinamis */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-800">
                Tujuan Pembelajaran (TP) Berbasis KBC <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddTP}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Butir TP</span>
              </button>
            </div>

            <div className="space-y-2">
              {(formData.tujuanPembelajaran || []).map((tp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={tp}
                    onChange={e => handleUpdateTP(idx, e.target.value)}
                    placeholder="Rumuskan tujuan pembelajaran yang menumbuhkan pemahaman dan karakter cinta..."
                    className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                  />
                  {(formData.tujuanPembelajaran || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTP(idx)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* PILAR PANCA CINTA (KBC) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Pilar Panca Cinta (Pilih Pilar Relevan)</span>
                <span className="text-red-500">*</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Karakteristik khas Kurikulum Berbasis Cinta MIN 1 Paser yang diinternalisasikan ke dalam materi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {masterData.pancaCinta.map(pc => {
                const isSelected = (formData.pancaCinta || []).includes(pc.nama);
                return (
                  <label
                    key={pc.id}
                    className={`p-3 rounded-xl border text-xs cursor-pointer select-none transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-300 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckboxItem('pancaCinta', pc.nama)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-slate-900">{pc.nama}</div>
                      <p className="text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {pc.deskripsi}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* DIMENSI PROFIL LULUSAN */}
          <div className="pt-4 border-t border-slate-200">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>Dimensi Profil Lulusan / Pelajar Pancasila & Rahmatan lil Alamin</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {masterData.dimensiProfil.map(dp => {
                const isSelected = (formData.dimensiProfilLulusan || []).includes(dp.nama);
                return (
                  <label
                    key={dp.id}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckboxItem('dimensiProfilLulusan', dp.nama)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <span className="line-clamp-1">{dp.nama}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* TARGET KARAKTER CINTA */}
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Target Karakter Kasih Sayang yang Diharapkan
            </label>
            <textarea
              rows={2}
              value={formData.targetKarakterCinta || ''}
              onChange={e => setFormData({ ...formData, targetKarakterCinta: e.target.value })}
              placeholder="Contoh: Menumbuhkan kelembutan hati siswa dalam memelihara alam sekitar dan empati saling menolong saat belajar..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('identitas')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('langkah')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <span>Lanjut ke Langkah Kasih Sayang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: D & E. Desain & Langkah Pembelajaran Berbasis Cinta */}
      {activeTab === 'langkah' && (
        <div className="space-y-6 bg-white p-5 rounded-xl border border-slate-200">
          {/* Model & Metode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Model Pembelajaran KBC
              </label>
              <select
                value={formData.modelPembelajaran || ''}
                onChange={e => setFormData({ ...formData, modelPembelajaran: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              >
                {masterData.models.map(m => (
                  <option key={m.id} value={m.nama}>
                    {m.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Metode Pembelajaran (Pilih yang Digunakan)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 border border-slate-200 rounded-lg bg-slate-50">
                {masterData.metode.map(met => {
                  const isSelected = (formData.metodePembelajaran || []).includes(met.nama);
                  return (
                    <button
                      key={met.id}
                      type="button"
                      onClick={() => toggleCheckboxItem('metodePembelajaran', met.nama)}
                      className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-emerald-700 text-white font-medium'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {met.nama}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* E. LANGKAH PEMBELAJARAN BERBASIS CINTA */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              E. Langkah-Langkah Pembelajaran Berbasis Cinta
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Struktur pembelajaran yang mengintegrasikan salam hangat, apersepsi hati, eksplorasi penuh kasih, kolaborasi empati, dan refleksi hikmah.
            </p>

            {/* 1. KEGIATAN AWAL */}
            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                  1. Kegiatan Awal (Pendahuluan)
                </span>
                <input
                  type="text"
                  value={formData.kegiatanAwal?.durasi || '10 Menit'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanAwal: { ...formData.kegiatanAwal!, durasi: e.target.value },
                    })
                  }
                  className="w-24 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Salam Islami & Doa Thalabul Ilmi</label>
                <textarea
                  rows={2}
                  value={formData.kegiatanAwal?.salamDanDoa || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanAwal: { ...formData.kegiatanAwal!, salamDanDoa: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Apersepsi Kasih Sayang & Refleksi Hati Murid <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.kegiatanAwal?.apersepsiCinta || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanAwal: { ...formData.kegiatanAwal!, apersepsiCinta: e.target.value },
                    })
                  }
                  placeholder="Sapaan empati perasaan murid, mengaitkan materi dengan rasa syukur..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 2. KEGIATAN INTI */}
            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                  2. Kegiatan Inti Pembelajaran KBC
                </span>
                <input
                  type="text"
                  value={formData.kegiatanInti?.durasi || '50 Menit'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanInti: { ...formData.kegiatanInti!, durasi: e.target.value },
                    })
                  }
                  className="w-24 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Eksplorasi Kasih (Mengaitkan Materi dengan Kebesaran Allah & Kepedulian)
                </label>
                <textarea
                  rows={2}
                  value={formData.kegiatanInti?.eksplorasiKasih || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanInti: { ...formData.kegiatanInti!, eksplorasiKasih: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Kolaborasi Empati (Kerja Kelompok Saling Membantu Tanpa Bullying)
                </label>
                <textarea
                  rows={2}
                  value={formData.kegiatanInti?.kolaborasiEmpati || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanInti: { ...formData.kegiatanInti!, kolaborasiEmpati: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Internalisasi Nilai & Sintaks Detail Model Pembelajaran
                </label>
                <textarea
                  rows={2}
                  value={formData.kegiatanInti?.sintaksDetail || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanInti: { ...formData.kegiatanInti!, sintaksDetail: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 3. KEGIATAN PENUTUP */}
            <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                  3. Kegiatan Penutup
                </span>
                <input
                  type="text"
                  value={formData.kegiatanPenutup?.durasi || '10 Menit'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanPenutup: { ...formData.kegiatanPenutup!, durasi: e.target.value },
                    })
                  }
                  className="w-24 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Refleksi Hikmah Cinta (Apa Makna Kasih Sayang yang Dipelajari?)
                </label>
                <textarea
                  rows={2}
                  value={formData.kegiatanPenutup?.refleksiCinta || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanPenutup: { ...formData.kegiatanPenutup!, refleksiCinta: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Umpan Balik Apresiatif Guru & Doa Bersama
                </label>
                <textarea
                  rows={2}
                  value={formData.kegiatanPenutup?.umpanBalikApresiatif || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      kegiatanPenutup: { ...formData.kegiatanPenutup!, umpanBalikApresiatif: e.target.value },
                    })
                  }
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('kbc')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('asesmen')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition-colors"
            >
              <span>Lanjut ke Asesmen & Rubrik</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: F. Asesmen & Rubrik Penilaian */}
      {activeTab === 'asesmen' && (
        <div className="space-y-6 bg-white p-5 rounded-xl border border-slate-200">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              F. Asesmen & Evaluasi Berbasis Cinta
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Trilogi penilaian autentik yang ramah, memotivasi, dan tidak menghakimi murid.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Asesmen Awal (Diagnostik Emosi & Kesiapan)
                </label>
                <textarea
                  rows={2}
                  value={formData.asesmenAwal || ''}
                  onChange={e => setFormData({ ...formData, asesmenAwal: e.target.value })}
                  placeholder="Contoh: Pemetaan perasaan murid melalui emotikon dan pertanyaan pemantik santun..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Asesmen Formatif (Observasi Karakter Kasih & Penilaian Diri)
                </label>
                <textarea
                  rows={2}
                  value={formData.asesmenFormatif || ''}
                  onChange={e => setFormData({ ...formData, asesmenFormatif: e.target.value })}
                  placeholder="Contoh: Lembar observasi gotong royong, kesantunan bertutur kata saat diskusi..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Asesmen Sumatif (Unjuk Kerja & Portofolio Karya Kasih)
                </label>
                <textarea
                  rows={2}
                  value={formData.asesmenSumatif || ''}
                  onChange={e => setFormData({ ...formData, asesmenSumatif: e.target.value })}
                  placeholder="Contoh: Presentasi karya kelompok dan tes tertulis penalaran bermakna..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  4. Rubrik Penilaian & Kriteria Ketercapaian
                </label>
                <textarea
                  rows={3}
                  value={formData.rubrikPenilaian || ''}
                  onChange={e => setFormData({ ...formData, rubrikPenilaian: e.target.value })}
                  placeholder="Level 4 (Sangat Baik), Level 3 (Baik), Level 2 (Cukup), Level 1 (Perlu Bimbingan Penuh Kasih)..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  5. Program Remedial & Pengayaan
                </label>
                <textarea
                  rows={2}
                  value={formData.remedialPengayaan || ''}
                  onChange={e => setFormData({ ...formData, remedialPengayaan: e.target.value })}
                  placeholder="Pendampingan khusus dengan kasih sayang bagi murid yang membutuhkan..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('langkah')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Kembali
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSave('DRAFT')}
                disabled={saving}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Simpan Draf
              </button>
              <button
                type="button"
                onClick={() => handleSave('SELESAI')}
                disabled={saving}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs"
              >
                {saving ? 'Menyimpan...' : 'Selesai & Simpan Dokumen RPP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
