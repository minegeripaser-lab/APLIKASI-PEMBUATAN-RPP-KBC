import React from 'react';
import { 
  Users, 
  FileText, 
  BookOpen, 
  Heart, 
  Plus, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  Clock, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import type { User, UserStats, Subject, RPPDocument, SchoolIdentity } from '../types/index.ts';

interface AdminDashboardProps {
  stats: UserStats | null;
  subjects: Subject[];
  rpps: RPPDocument[];
  schoolIdentity: SchoolIdentity;
  onNavigate: (menu: any) => void;
  onViewRPP: (rpp: RPPDocument) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  subjects,
  rpps,
  schoolIdentity,
  onNavigate,
  onViewRPP,
}) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-800/60 text-emerald-200 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SUPER ADMINISTRATOR · {schoolIdentity.namaMadrasah}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Dashboard Administrasi RPP KBC 2026
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
              Pusat kendali master data mata pelajaran MI, tata kelola akun pengguna RBAC, dan supervisi dokumen modul ajar Kurikulum Berbasis Cinta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('buat_rpp')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat RPP</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('materi_ajar')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>Materi Ajar (AI/Manual)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('export_rpp')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Cetak / Word / PDF</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('user_management')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Kelola Pengguna</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Total Pengguna</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.totalUsers}</span>
            <span className="text-[11px] text-emerald-700 font-medium mt-1 block">{stats.activeUsers} Akun Aktif</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Dokumen RPP</span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">{rpps.length}</span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">Seluruh Guru MI</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Mata Pelajaran MI</span>
            <span className="text-2xl font-bold text-slate-900 mt-1 block">{subjects.length}</span>
            <span className="text-[11px] text-sky-700 font-medium mt-1 block">Kelompok A, B & C</span>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold uppercase block">Login Hari Ini</span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">{stats.loginToday}</span>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">Aktivitas Terverifikasi</span>
          </div>
        </div>
      )}

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent RPPs */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-sm text-slate-900">Dokumen RPP Terbaru di Madrasah</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('all_rpp')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {rpps.slice(0, 4).map(rpp => (
              <div
                key={rpp.id}
                onClick={() => onViewRPP(rpp)}
                className="py-3 hover:bg-slate-50 rounded-lg px-2 cursor-pointer transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {rpp.nomorRpp}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {rpp.judul}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {rpp.mataPelajaranNama} · Fase {rpp.fase} (Kls {rpp.kelas}) · Oleh <strong>{rpp.creatorName}</strong>
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">
                  {new Date(rpp.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Master Data MI Overview */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BookOpen className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">Struktur Mapel MI (MIN 1 Paser)</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
              <span className="font-bold text-emerald-900 block">KELOMPOK A (Keagamaan)</span>
              <p className="text-slate-600 mt-0.5">
                Al-Qur'an Hadis, Akidah Akhlak, Fikih, SKI, Bahasa Arab ({subjects.filter(s => s.kelompok === 'KELOMPOK A').length} Mapel)
              </p>
            </div>

            <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200">
              <span className="font-bold text-sky-900 block">KELOMPOK B (Umum)</span>
              <p className="text-slate-600 mt-0.5">
                Pendidikan Pancasila, Bhs. Indonesia, Matematika, IPAS, PJOK, Seni Budaya ({subjects.filter(s => s.kelompok === 'KELOMPOK B').length} Mapel)
              </p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200">
              <span className="font-bold text-amber-900 block">KELOMPOK C (Muatan/Kekhasan)</span>
              <p className="text-slate-600 mt-0.5">
                Bahasa & Budaya Paser, Tahfidz Al-Qur'an ({subjects.filter(s => s.kelompok === 'KELOMPOK C').length} Mapel)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('master_data')}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            Kelola Master Data Mapel
          </button>
        </div>
      </div>
    </div>
  );
};

interface GuestDashboardProps {
  currentUser: User;
  myRpps: RPPDocument[];
  subjects: Subject[];
  schoolIdentity: SchoolIdentity;
  onNavigate: (menu: any) => void;
  onViewRPP: (rpp: RPPDocument) => void;
}

export const GuestDashboard: React.FC<GuestDashboardProps> = ({
  currentUser,
  myRpps,
  subjects,
  schoolIdentity,
  onNavigate,
  onViewRPP,
}) => {
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-emerald-200 text-xs font-bold mb-2">
              <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
              <span>Selamat Datang, {currentUser.name}!</span>
            </div>
            <h1 className="text-2xl font-black">
              Merancang Pembelajaran dengan Cinta
            </h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              MIN 1 Paser · Generator RPP KBC 2026. Lengkap dengan dropdown seluruh mata pelajaran MI, cascading Fase A/B/C, dan integrasi pilar Panca Cinta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('buat_rpp')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat RPP</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('materi_ajar')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm transition-colors"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Materi Ajar (AI/Manual)</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('export_rpp')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Cetak / Ekspor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-800">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">RPP Saya</span>
            <span className="text-xl font-bold text-slate-900">{myRpps.length} Dokumen</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-100 rounded-lg text-rose-800">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Pilar Panca Cinta</span>
            <span className="text-xl font-bold text-rose-800">5 Pilar KBC</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-sky-100 rounded-lg text-sky-800">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Mata Pelajaran MI</span>
            <span className="text-xl font-bold text-sky-800">{subjects.length} Mapel Siap</span>
          </div>
        </div>
      </div>

      {/* My RPPs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">Dokumen RPP yang Telah Anda Rancang</h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('rpp_saya')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Buka RPP Saya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {myRpps.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 space-y-2">
            <p>Anda belum memiliki dokumen RPP tersimpan.</p>
            <button
              type="button"
              onClick={() => onNavigate('buat_rpp')}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat RPP Pertama Anda</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myRpps.map(rpp => (
              <div
                key={rpp.id}
                onClick={() => onViewRPP(rpp)}
                className="py-3 hover:bg-slate-50 rounded-lg px-2 cursor-pointer transition-colors flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900">{rpp.judul}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {rpp.mataPelajaranNama} · Fase {rpp.fase} (Kls {rpp.kelas}) · {rpp.semester}
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {rpp.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
