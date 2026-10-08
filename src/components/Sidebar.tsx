import React from 'react';
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Sparkles, 
  CheckCircle, 
  Activity, 
  Database, 
  Building, 
  Sliders, 
  LogOut, 
  Plus, 
  Printer, 
  HelpCircle,
  FileCheck,
  Compass,
  Download
} from 'lucide-react';
import type { User, UserRole } from '../types/index.ts';

export type NavigationMenu =
  // Super Admin Menus
  | 'admin_dashboard'
  | 'user_management'
  | 'all_rpp'
  | 'master_data'
  | 'template_rpp'
  | 'identitas_madrasah'
  | 'pengaturan'
  | 'audit_log'
  | 'backup_restore'
  | 'materi_ajar'
  // Guest Menus
  | 'guest_dashboard'
  | 'buat_rpp'
  | 'rpp_saya'
  | 'generator_tp'
  | 'generator_asesmen'
  | 'rubrik'
  | 'validasi_rpp'
  | 'preview_rpp'
  | 'export_rpp'
  | 'bantuan';

interface SidebarProps {
  currentUser: User;
  currentMenu: NavigationMenu;
  onNavigate: (menu: NavigationMenu) => void;
  onLogout: () => void;
  onSwitchAccount: (role: 'SUPER_ADMIN' | 'GUEST') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentMenu,
  onNavigate,
  onLogout,
  onSwitchAccount,
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shrink-0">
          <Heart className="w-5 h-5 fill-white" />
        </div>
        <div className="min-w-0">
          <div className="font-extrabold text-white text-sm tracking-tight truncate">
            RPP KBC 2026
          </div>
          <div className="text-[11px] text-emerald-400 font-medium truncate">
            MIN 1 Paser
          </div>
        </div>
      </div>

      {/* User Status Bar */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
        <div className="min-w-0">
          <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
          <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${isSuperAdmin ? 'bg-purple-400' : 'bg-emerald-400'}`} />
            <span>{currentUser.role}</span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 text-xs">
        {/* CF. Menu SUPER_ADMIN */}
        {isSuperAdmin ? (
          <div>
            <div className="px-2 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              Administrasi
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => onNavigate('admin_dashboard')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'admin_dashboard'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Dashboard Admin</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('user_management')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'user_management'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Manajemen Pengguna</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('all_rpp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'all_rpp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Semua RPP</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('materi_ajar')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors ${
                  currentMenu === 'materi_ajar'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Materi Ajar (KBC)</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 shrink-0">
                  AI / Manual
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('master_data')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'master_data'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Master Data</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('buat_rpp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'buat_rpp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Buat RPP KBC</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('export_rpp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'export_rpp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Cetak / Ekspor (Word/PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('template_rpp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'template_rpp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Template RPP</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('identitas_madrasah')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'identitas_madrasah'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Identitas Madrasah</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('audit_log')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'audit_log'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Audit Log</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('backup_restore')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'backup_restore'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Backup & Restore</span>
              </button>
            </nav>
          </div>
        ) : (
          /* CF. Menu GUEST (GURU / TAMU) */
          <div>
            <div className="px-2 mb-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              Pembelajaran
            </div>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => onNavigate('guest_dashboard')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'guest_dashboard'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Dashboard Guru</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('buat_rpp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'buat_rpp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Buat RPP</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('rpp_saya')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'rpp_saya'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>RPP Saya</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('materi_ajar')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center justify-between transition-colors ${
                  currentMenu === 'materi_ajar'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">Materi Ajar (KBC)</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40 shrink-0">
                  AI / Manual
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('generator_tp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'generator_tp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Generator TP</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('generator_asesmen')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'generator_asesmen'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Generator Asesmen</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('rubrik')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'rubrik'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Rubrik</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('validasi_rpp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'validasi_rpp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Validasi RPP</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('preview_rpp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'preview_rpp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Preview</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('export_rpp')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'export_rpp'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export (Word/PDF/Cetak)</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('bantuan')}
                className={`w-full text-left px-3 py-2 rounded-lg font-medium flex items-center gap-2.5 transition-colors ${
                  currentMenu === 'bantuan'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Bantuan</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Role Switcher & Logout Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-2">
        {/* Quick RBAC Tester */}
        <div className="text-[10px] text-slate-400 px-1 font-semibold uppercase tracking-wider">
          Beralih Akun (Uji RBAC):
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => onSwitchAccount('SUPER_ADMIN')}
            className={`px-2 py-1.5 rounded font-bold transition-colors text-center ${
              isSuperAdmin ? 'bg-purple-900/60 text-purple-200 border border-purple-700' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Admin Super
          </button>
          <button
            type="button"
            onClick={() => onSwitchAccount('GUEST')}
            className={`px-2 py-1.5 rounded font-bold transition-colors text-center ${
              !isSuperAdmin ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Guru Tamu
          </button>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full text-left px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 font-semibold flex items-center gap-2 transition-colors text-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
};
