import React, { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  Menu, 
  X, 
  ShieldCheck, 
  User, 
  Sparkles, 
  BookOpen, 
  Plus, 
  CheckCircle, 
  Bell, 
  HelpCircle,
  LogOut,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api, authStorage } from './services/api.ts';
import { LoginModal } from './components/LoginModal.tsx';
import { Sidebar, type NavigationMenu } from './components/Sidebar.tsx';
import { AdminDashboard, GuestDashboard } from './components/Dashboards.tsx';
import { UserManagement } from './components/UserManagement.tsx';
import { MasterDataManagement } from './components/MasterDataManagement.tsx';
import { RPPList } from './components/RPPList.tsx';
import { RPPEditor } from './components/RPPEditor.tsx';
import { RPPPreview } from './components/RPPPreview.tsx';
import { TPGenerator } from './components/TPGenerator.tsx';
import { RubricGuide } from './components/RubricGuide.tsx';
import { AuditLogView } from './components/AuditLogView.tsx';
import { BackupRestore } from './components/BackupRestore.tsx';
import { ExportCenter } from './components/ExportCenter.tsx';
import { MateriAjarManager } from './components/MateriAjarManager.tsx';
import type { 
  User as UserType, 
  Subject, 
  SchoolIdentity, 
  RPPDocument, 
  UserStats, 
  PhaseMaster, 
  PancaCintaItem, 
  DimensiProfilItem, 
  ModelPembelajaranItem, 
  MetodePembelajaranItem, 
  JenisAsesmenItem 
} from './types/index.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // App Data State
  const [schoolIdentity, setSchoolIdentity] = useState<SchoolIdentity>({
    namaMadrasah: 'MIN 1 Paser',
    alamat: 'Jalan Padat Karya 69 Tanah Grogot, Kabupaten Paser, Kalimantan Timur',
    tahunPelajaran: '2026/2027',
    namaKepalaMadrasah: "H. Mas'ud, S.Ag., M.Pd.I.",
    nipKepalaMadrasah: '197508122003121002',
    namaGuruDefault: 'Siti Rahmah, S.Pd.I.',
    nipGuruDefault: '198804152011012015',
    tagline: 'Merancang Pembelajaran dengan Cinta',
    namaAplikasi: 'RPP KBC GENERATOR 2026',
    kabupaten: 'Kabupaten Paser',
    provinsi: 'Kalimantan Timur',
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [masterData, setMasterData] = useState<{
    phases: PhaseMaster[];
    pancaCinta: PancaCintaItem[];
    dimensiProfil: DimensiProfilItem[];
    models: ModelPembelajaranItem[];
    metode: MetodePembelajaranItem[];
    asesmen: JenisAsesmenItem[];
  }>({
    phases: [],
    pancaCinta: [],
    dimensiProfil: [],
    models: [],
    metode: [],
    asesmen: [],
  });

  const [rpps, setRpps] = useState<RPPDocument[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Active Navigation & View
  const [currentMenu, setCurrentMenu] = useState<NavigationMenu>('guest_dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Editing / Viewing RPP
  const [editingRPP, setEditingRPP] = useState<RPPDocument | null>(null);
  const [previewingRPP, setPreviewingRPP] = useState<RPPDocument | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Initial Auth Check
  useEffect(() => {
    async function checkAuth() {
      const token = authStorage.getToken();
      if (!token) {
        setAuthChecking(false);
        return;
      }

      try {
        const res = await api.getMe();
        setCurrentUser(res.user);
        if (res.user.role === 'SUPER_ADMIN') {
          setCurrentMenu('admin_dashboard');
        } else {
          setCurrentMenu('guest_dashboard');
        }
      } catch (err) {
        authStorage.clearToken();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  // Load Main System Data
  const loadSystemData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [idRes, subRes, masterRes, rppRes] = await Promise.all([
        api.getSchoolIdentity(),
        api.getSubjects(),
        api.getMasterData(),
        api.getRPPs(),
      ]);

      setSchoolIdentity(idRes);
      setSubjects(subRes);
      setMasterData({
        phases: masterRes.phases,
        pancaCinta: masterRes.pancaCinta,
        dimensiProfil: masterRes.dimensiProfil,
        models: masterRes.models,
        metode: masterRes.metode,
        asesmen: masterRes.asesmen,
      });
      setRpps(rppRes);

      if (currentUser.role === 'SUPER_ADMIN') {
        const statsRes = await api.getUserStats();
        setUserStats(statsRes);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadSystemData();
    }
  }, [currentUser, loadSystemData]);

  // Login Handler
  const handleLoginSuccess = (user: UserType) => {
    setCurrentUser(user);
    if (user.role === 'SUPER_ADMIN') {
      setCurrentMenu('admin_dashboard');
    } else {
      setCurrentMenu('guest_dashboard');
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    } finally {
      authStorage.clearToken();
      setCurrentUser(null);
      setEditingRPP(null);
      setPreviewingRPP(null);
      setIsCreatingNew(false);
    }
  };

  // Quick switch between Admin and Guest for evaluator demo convenience
  const handleSwitchAccount = async (targetRole: 'SUPER_ADMIN' | 'GUEST') => {
    try {
      const u = targetRole === 'SUPER_ADMIN' ? 'admin' : 'guest';
      const p = targetRole === 'SUPER_ADMIN' ? 'AdminKbc2026!' : 'Guest2026!';
      const res = await api.login(u, p);
      authStorage.setToken(res.token);
      setCurrentUser(res.user);
      setEditingRPP(null);
      setPreviewingRPP(null);
      setIsCreatingNew(false);

      if (targetRole === 'SUPER_ADMIN') {
        setCurrentMenu('admin_dashboard');
      } else {
        setCurrentMenu('guest_dashboard');
      }
    } catch (err: any) {
      alert(err.message || 'Gagal beralih akun.');
    }
  };

  // Navigation Click Handler
  const handleNavigate = (menu: NavigationMenu) => {
    setEditingRPP(null);
    setPreviewingRPP(null);
    if (menu === 'buat_rpp') {
      setIsCreatingNew(true);
    } else {
      setIsCreatingNew(false);
    }
    setCurrentMenu(menu);
    setMobileMenuOpen(false);
  };

  // RPP Handlers
  const handleAddNewRPP = () => {
    setEditingRPP(null);
    setPreviewingRPP(null);
    setIsCreatingNew(true);
    setCurrentMenu('buat_rpp');
  };

  const handleEditRPP = (rpp: RPPDocument) => {
    setEditingRPP(rpp);
    setPreviewingRPP(null);
    setIsCreatingNew(false);
    setCurrentMenu('buat_rpp');
  };

  const handleViewRPP = (rpp: RPPDocument) => {
    setPreviewingRPP(rpp);
    setIsCreatingNew(false);
  };

  const handleSaveRPPSuccess = (saved: RPPDocument) => {
    setIsCreatingNew(false);
    setEditingRPP(null);
    setPreviewingRPP(saved);
    loadSystemData();
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400">
        <div className="text-center space-y-3">
          <Heart className="w-8 h-8 fill-emerald-500 animate-pulse mx-auto" />
          <div className="font-bold text-sm tracking-wide">Memuat RPP KBC GENERATOR 2026...</div>
          <div className="text-xs text-slate-500">MIN 1 Paser · Kalimantan Timur</div>
        </div>
      </div>
    );
  }

  // If not logged in, show Login
  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white shadow-xs">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                  RPP KBC GENERATOR 2026
                </span>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {schoolIdentity.namaMadrasah}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block italic">
                "{schoolIdentity.tagline}" · TP {schoolIdentity.tahunPelajaran}
              </p>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {/* Quick RBAC indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs">
            <span className="text-slate-500 font-medium">Peran Aktif:</span>
            <span
              className={`font-bold ${
                currentUser.role === 'SUPER_ADMIN' ? 'text-purple-700' : 'text-emerald-700'
              }`}
            >
              {currentUser.role}
            </span>
          </div>

          {/* Evaluation Quick Role Switcher Button */}
          <button
            type="button"
            onClick={() =>
              handleSwitchAccount(currentUser.role === 'SUPER_ADMIN' ? 'GUEST' : 'SUPER_ADMIN')
            }
            title="Klik untuk beralih perspektif RBAC antara Super Admin dan Guest"
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <span>Ubah ke: {currentUser.role === 'SUPER_ADMIN' ? 'Guru (Guest)' : 'Admin Super'}</span>
          </button>

          <button
            type="button"
            onClick={loadSystemData}
            title="Segarkan Data"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Keluar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Body Layout with Sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            currentUser={currentUser}
            currentMenu={currentMenu}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onSwitchAccount={handleSwitchAccount}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-64 bg-slate-900 h-full">
              <Sidebar
                currentUser={currentUser}
                currentMenu={currentMenu}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                onSwitchAccount={handleSwitchAccount}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* If Previewing RPP Document */}
          {previewingRPP ? (
            <RPPPreview
              rpp={previewingRPP}
              schoolIdentity={schoolIdentity}
              onBack={() => setPreviewingRPP(null)}
            />
          ) : currentMenu === 'buat_rpp' || isCreatingNew || editingRPP ? (
            /* RPPEditor (Create or Edit) */
            <RPPEditor
              initialRPP={editingRPP}
              currentUser={currentUser}
              subjects={subjects}
              masterData={masterData}
              onSaveSuccess={handleSaveRPPSuccess}
              onCancel={() => {
                setEditingRPP(null);
                setIsCreatingNew(false);
                setCurrentMenu(currentUser.role === 'SUPER_ADMIN' ? 'admin_dashboard' : 'guest_dashboard');
              }}
              onOpenMasterData={() => {
                if (currentUser.role === 'SUPER_ADMIN') {
                  setCurrentMenu('master_data');
                }
              }}
            />
          ) : currentMenu === 'admin_dashboard' && currentUser.role === 'SUPER_ADMIN' ? (
            /* Admin Dashboard */
            <AdminDashboard
              stats={userStats}
              subjects={subjects}
              rpps={rpps}
              schoolIdentity={schoolIdentity}
              onNavigate={handleNavigate}
              onViewRPP={handleViewRPP}
            />
          ) : currentMenu === 'guest_dashboard' ? (
            /* Guest Dashboard */
            <GuestDashboard
              currentUser={currentUser}
              myRpps={rpps.filter(r => r.createdBy === currentUser.id)}
              subjects={subjects}
              schoolIdentity={schoolIdentity}
              onNavigate={handleNavigate}
              onViewRPP={handleViewRPP}
            />
          ) : currentMenu === 'user_management' && currentUser.role === 'SUPER_ADMIN' ? (
            /* User Management (Super Admin Only) */
            <UserManagement currentUser={currentUser} />
          ) : currentMenu === 'master_data' && currentUser.role === 'SUPER_ADMIN' ? (
            /* Master Data Management (Super Admin Only) */
            <MasterDataManagement
              subjects={subjects}
              schoolIdentity={schoolIdentity}
              masterData={masterData}
              onReload={loadSystemData}
            />
          ) : currentMenu === 'all_rpp' && currentUser.role === 'SUPER_ADMIN' ? (
            /* All RPPs (Super Admin Only) */
            <RPPList
              currentUser={currentUser}
              subjects={subjects}
              rpps={rpps}
              schoolIdentity={schoolIdentity}
              onAddNew={handleAddNewRPP}
              onEdit={handleEditRPP}
              onView={handleViewRPP}
              onReload={loadSystemData}
              mode="ALL_RPP"
            />
          ) : currentMenu === 'rpp_saya' ? (
            /* My RPPs (Data Isolation) */
            <RPPList
              currentUser={currentUser}
              subjects={subjects}
              rpps={rpps}
              schoolIdentity={schoolIdentity}
              onAddNew={handleAddNewRPP}
              onEdit={handleEditRPP}
              onView={handleViewRPP}
              onReload={loadSystemData}
              mode="MY_RPP"
            />
          ) : currentMenu === 'materi_ajar' ? (
            /* Materi Ajar (Input Manual atau Generate AI) */
            <MateriAjarManager
              currentUser={currentUser}
              subjects={subjects}
              schoolIdentity={schoolIdentity}
              pancaCintaList={masterData.pancaCinta}
            />
          ) : currentMenu === 'preview_rpp' || currentMenu === 'export_rpp' ? (
            /* Pusat Cetak, Word, dan Ekspor PDF */
            <ExportCenter
              rpps={currentUser.role === 'SUPER_ADMIN' ? rpps : rpps.filter(r => r.createdBy === currentUser.id)}
              schoolIdentity={schoolIdentity}
            />
          ) : currentMenu === 'generator_tp' ? (
            /* Generator TP */
            <TPGenerator
              subjects={subjects}
              pancaCinta={masterData.pancaCinta}
            />
          ) : currentMenu === 'generator_asesmen' || currentMenu === 'rubrik' ? (
            /* Rubrik & Asesmen Guide */
            <RubricGuide pancaCinta={masterData.pancaCinta} />
          ) : currentMenu === 'audit_log' && currentUser.role === 'SUPER_ADMIN' ? (
            /* Audit Log (Super Admin Only) */
            <AuditLogView />
          ) : currentMenu === 'backup_restore' && currentUser.role === 'SUPER_ADMIN' ? (
            /* Backup & Restore (Super Admin Only) */
            <BackupRestore onReload={loadSystemData} />
          ) : currentMenu === 'template_rpp' ? (
            /* Template RPP Guide */
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 max-w-4xl">
              <h2 className="text-lg font-bold text-slate-900">Format Template Modul Ajar KBC 2026</h2>
              <p className="text-xs text-slate-600">
                Template RPP Kurikulum Berbasis Cinta (KBC) MIN 1 Paser memuat 6 komponen utama:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-emerald-900">A. Identitas Pembelajaran:</strong> Satuan pendidikan, mata pelajaran MI, fase, kelas, alokasi waktu.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-emerald-900">B. Capaian & Tujuan Pembelajaran:</strong> Perumusan TP yang bermakna dan terukur.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-rose-900">C. Pilar Panca Cinta:</strong> Internalisasi nilai cinta Allah, diri, ilmu, lingkungan, dan tanah air.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-emerald-900">D. Desain & Model Pembelajaran:</strong> PBL, PjBL, Inquiry, TaRL dengan sentuhan kasih sayang.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-emerald-900">E. Langkah Pembelajaran:</strong> Apersepsi cinta, eksplorasi kasih, kolaborasi empati, dan refleksi hikmah.
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-emerald-900">F. Asesmen, Evaluasi & Rubrik:</strong> Asesmen awal, formatif observasi kasih, dan sumatif unjuk kerja.
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddNewRPP}
                className="mt-3 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Gunakan Template Ini untuk Buat RPP
              </button>
            </div>
          ) : currentMenu === 'bantuan' ? (
            /* Bantuan & Panduan */
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 max-w-4xl text-xs text-slate-700 leading-relaxed">
              <h2 className="text-lg font-bold text-slate-900">Panduan Aplikasi RPP KBC GENERATOR 2026</h2>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h4 className="font-bold text-emerald-900 text-sm mb-1">Dukungan Seluruh Mata Pelajaran MI</h4>
                  <p>
                    Aplikasi ini telah memuat master lengkap mata pelajaran Madrasah Ibtidaiyah:
                    Al-Qur'an Hadis, Akidah Akhlak, Fikih, SKI, Bahasa Arab, Pendidikan Pancasila, Bahasa Indonesia, Matematika, IPAS, PJOK, Seni Budaya (Rupa, Musik, Tari, Teater), Bahasa Inggris, Muatan Lokal Bahasa Paser, dan Tahfidz Madrasah.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Dropdown Berfitur Lengkap</h4>
                  <p>
                    Guru dapat memilih mata pelajaran melalui dropdown yang dilengkapi pencarian (search), filter kelompok (Kelompok A Keagamaan, Kelompok B Umum, Kelompok C Kekhasan), tombol bersihkan (clear), dan filter otomatis sesuai fase terpilih.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-sm mb-1">Role-Based Access Control (RBAC) & Isolasi Data</h4>
                  <p>
                    Pengguna Tamu (GUEST) hanya dapat melihat dan mengedit dokumen RPP miliknya sendiri. Admin Super (SUPER_ADMIN) memiliki akses penuh ke seluruh RPP, manajemen pengguna, master mata pelajaran, audit log, dan backup/restore.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              Menu sedang dipersiapkan.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
