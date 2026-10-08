import React, { useState } from 'react';
import { 
  Database, 
  Layers, 
  Heart, 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  Building, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';
import { api } from '../services/api.ts';
import { SubjectManagement } from './SubjectManagement.tsx';
import type { 
  Subject, 
  SchoolIdentity, 
  PancaCintaItem, 
  DimensiProfilItem, 
  ModelPembelajaranItem, 
  MetodePembelajaranItem, 
  JenisAsesmenItem,
  PhaseMaster
} from '../types/index.ts';

interface MasterDataManagementProps {
  subjects: Subject[];
  schoolIdentity: SchoolIdentity;
  masterData: {
    phases: PhaseMaster[];
    pancaCinta: PancaCintaItem[];
    dimensiProfil: DimensiProfilItem[];
    models: ModelPembelajaranItem[];
    metode: MetodePembelajaranItem[];
    asesmen: JenisAsesmenItem[];
  };
  onReload: () => void;
}

export const MasterDataManagement: React.FC<MasterDataManagementProps> = ({
  subjects,
  schoolIdentity,
  masterData,
  onReload,
}) => {
  const [activeTab, setActiveTab] = useState<
    'mapel' | 'pancaCinta' | 'dimensiProfil' | 'models' | 'metode' | 'asesmen' | 'identitas'
  >('mapel');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit identity state
  const [identityForm, setIdentityForm] = useState<SchoolIdentity>({ ...schoolIdentity });
  const [savingIdentity, setSavingIdentity] = useState(false);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingIdentity(true);
      await api.updateSchoolIdentity(identityForm);
      showNotice('success', 'Identitas Madrasah MIN 1 Paser berhasil diperbarui.');
      onReload();
    } catch (err: any) {
      showNotice('error', err.message || 'Gagal menyimpan identitas.');
    } finally {
      setSavingIdentity(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              MASTER DATA & KONFIGURASI SISTEM
            </h1>
            <p className="text-xs text-slate-500">
              Pengaturan Mata Pelajaran MI, Panca Cinta, Model, Asesmen, dan Profil Madrasah
            </p>
          </div>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-lg border flex items-center justify-between text-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button type="button" onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-2 rounded-t-xl overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('mapel')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'mapel'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Mata Pelajaran MI ({subjects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pancaCinta')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'pancaCinta'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Panca Cinta KBC ({masterData.pancaCinta.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dimensiProfil')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'dimensiProfil'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Dimensi Profil ({masterData.dimensiProfil.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('models')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'models'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Model Pembelajaran ({masterData.models.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('identitas')}
          className={`px-3.5 py-2.5 font-bold rounded-t-lg transition-colors border-b-2 shrink-0 flex items-center gap-1.5 ${
            activeTab === 'identitas'
              ? 'text-emerald-800 border-emerald-700 bg-emerald-50/50'
              : 'text-slate-500 border-transparent hover:text-slate-800'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Identitas Madrasah</span>
        </button>
      </div>

      {/* Tab 1: Mata Pelajaran */}
      {activeTab === 'mapel' && (
        <SubjectManagement subjects={subjects} onReload={onReload} />
      )}

      {/* Tab 2: Panca Cinta KBC */}
      {activeTab === 'pancaCinta' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Pilar Panca Cinta Kurikulum Berbasis Cinta (KBC)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Pondasi spiritual dan afektif yang melandasi proses belajar mengajar di MIN 1 Paser.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masterData.pancaCinta.map((pc, idx) => (
              <div key={pc.id} className="p-4 rounded-xl border border-slate-200 bg-rose-50/30 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">{pc.nama}</h4>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{pc.deskripsi}</p>
                <div className="pt-2 border-t border-rose-100">
                  <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider block mb-1">
                    Indikator Perilaku Murid:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-slate-600">
                    {pc.indikator.map((ind, i) => (
                      <li key={i}>{ind}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dimensi Profil */}
      {activeTab === 'dimensiProfil' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Dimensi Profil Lulusan / Pelajar Rahmatan lil Alamin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {masterData.dimensiProfil.map(dp => (
              <div key={dp.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <h4 className="font-bold text-emerald-900 text-xs mb-1">{dp.nama}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{dp.deskripsi}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Model Pembelajaran */}
      {activeTab === 'models' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Model Pembelajaran Bernuansa Kasih Sayang
          </h3>
          <div className="space-y-3">
            {masterData.models.map(m => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/40">
                <h4 className="font-bold text-slate-900 text-sm">{m.nama}</h4>
                <p className="text-xs text-slate-600 mt-0.5">{m.deskripsi}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.sintaks.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                      {idx + 1}. {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: CK. Identitas Default Madrasah */}
      {activeTab === 'identitas' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs max-w-2xl">
          <div className="mb-4 pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Identitas Resmi Madrasah</h3>
            <p className="text-xs text-slate-500">
              Konfigurasi kop surat, penandatangan RPP, dan informasi satuan pendidikan.
            </p>
          </div>

          <form onSubmit={handleSaveIdentity} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Madrasah</label>
              <input
                type="text"
                value={identityForm.namaMadrasah}
                onChange={e => setIdentityForm({ ...identityForm, namaMadrasah: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={identityForm.alamat}
                onChange={e => setIdentityForm({ ...identityForm, alamat: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kabupaten</label>
                <input
                  type="text"
                  value={identityForm.kabupaten}
                  onChange={e => setIdentityForm({ ...identityForm, kabupaten: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
                <input
                  type="text"
                  value={identityForm.provinsi}
                  onChange={e => setIdentityForm({ ...identityForm, provinsi: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  value={identityForm.tahunPelajaran}
                  onChange={e => setIdentityForm({ ...identityForm, tahunPelajaran: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline Aplikasi</label>
                <input
                  type="text"
                  value={identityForm.tagline}
                  onChange={e => setIdentityForm({ ...identityForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Madrasah</label>
                <input
                  type="text"
                  value={identityForm.namaKepalaMadrasah}
                  onChange={e => setIdentityForm({ ...identityForm, namaKepalaMadrasah: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Madrasah</label>
                <input
                  type="text"
                  value={identityForm.nipKepalaMadrasah}
                  onChange={e => setIdentityForm({ ...identityForm, nipKepalaMadrasah: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={savingIdentity}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{savingIdentity ? 'Menyimpan...' : 'Simpan Identitas'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
