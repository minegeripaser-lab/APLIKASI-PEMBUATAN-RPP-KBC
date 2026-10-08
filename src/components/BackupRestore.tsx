import React, { useState } from 'react';
import { Download, Upload, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';
import { authStorage, api } from '../services/api.ts';

interface BackupRestoreProps {
  onReload: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({ onReload }) => {
  const [restoring, setRestoring] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDownloadBackup = () => {
    const token = authStorage.getToken();
    fetch('/api/backup', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-kbc-min1paser-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setNotice({ type: 'success', message: 'Berkas cadangan berhasil diunduh.' });
      })
      .catch(err => {
        setNotice({ type: 'error', message: 'Gagal mengunduh cadangan: ' + err.message });
      });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        setRestoring(true);
        const json = JSON.parse(event.target?.result as string);
        await api.restoreBackup(json);
        setNotice({ type: 'success', message: 'Sistem berhasil dipulihkan dari berkas cadangan.' });
        onReload();
      } catch (err: any) {
        setNotice({ type: 'error', message: 'Gagal memulihkan cadangan: ' + err.message });
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            BACKUP & RESTORE SISTEM KBC
          </h1>
          <p className="text-xs text-slate-500">
            Pencadangan dan pemulihan data master mata pelajaran, modul RPP, dan audit log MIN 1 Paser
          </p>
        </div>
      </div>

      {notice && (
        <div
          className={`p-3.5 rounded-lg border flex items-center gap-2 text-xs ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{notice.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Backup Card */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Unduh Cadangan Lengkap</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ekspor seluruh basis data aplikasi (Mata Pelajaran MI, RPP, Master Data KBC, Pengguna, dan Audit Log) ke berkas JSON terenkripsi.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas JSON Backup</span>
            </button>
          </div>
        </div>

        {/* Restore Card */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Upload className="w-4 h-4 text-amber-700" />
            <span>Pulihkan dari Cadangan</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pulihkan data sistem dari berkas cadangan JSON yang sebelumnya pernah diunduh.
          </p>
          <div className="pt-2">
            <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{restoring ? 'Memulihkan...' : 'Pilih Berkas JSON Restore'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={restoring}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
