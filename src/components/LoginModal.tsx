import React, { useState } from 'react';
import { Lock, User, LogIn, Heart, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { api, authStorage } from '../services/api.ts';
import type { User as UserType } from '../types/index.ts';

interface LoginModalProps {
  onLoginSuccess: (user: UserType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      const res = await api.login(usernameOrEmail, password);
      authStorage.setToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userRole: 'admin' | 'guest') => {
    setError(null);
    const u = userRole === 'admin' ? 'admin' : 'guest';
    const p = userRole === 'admin' ? 'AdminKbc2026!' : 'Guest2026!';
    setUsernameOrEmail(u);
    setPassword(p);

    try {
      setLoading(true);
      const res = await api.login(u, p);
      authStorage.setToken(res.token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 p-6 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Heart className="w-6 h-6 text-rose-300 fill-rose-300" />
          </div>
          <h2 className="text-xl font-black tracking-tight">RPP KBC GENERATOR 2026</h2>
          <p className="text-xs text-emerald-200 mt-1 font-medium">
            MIN 1 Paser · Tanah Grogot, Kalimantan Timur
          </p>
          <p className="text-[11px] text-emerald-300/80 italic mt-0.5">
            "Merancang Pembelajaran dengan Cinta"
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username atau Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin atau guest"
                  value={usernameOrEmail}
                  onChange={e => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center mb-2">
              Pilihan Akun Demo (1-Klik Masuk)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-950 text-xs font-semibold text-left transition-colors flex flex-col"
              >
                <span className="flex items-center gap-1 text-[11px] text-purple-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>SUPER_ADMIN</span>
                </span>
                <span className="text-xs font-bold mt-0.5">Admin Super</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('guest')}
                className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-semibold text-left transition-colors flex flex-col"
              >
                <span className="flex items-center gap-1 text-[11px] text-emerald-700">
                  <User className="w-3.5 h-3.5" />
                  <span>GUEST</span>
                </span>
                <span className="text-xs font-bold mt-0.5">Guru Tamu</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Sistem Terlindungi Keamanan RBAC & Password Hashing
        </div>
      </div>
    </div>
  );
};
