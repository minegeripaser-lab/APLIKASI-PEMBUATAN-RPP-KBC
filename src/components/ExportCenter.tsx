import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { exportToWord, exportElementToPDF } from '../utils/documentExporter.ts';
import { RPPPreview } from './RPPPreview.tsx';
import type { RPPDocument, SchoolIdentity } from '../types/index.ts';

interface ExportCenterProps {
  rpps: RPPDocument[];
  schoolIdentity: SchoolIdentity;
  defaultRppId?: string;
}

export const ExportCenter: React.FC<ExportCenterProps> = ({
  rpps,
  schoolIdentity,
  defaultRppId,
}) => {
  const [selectedRppId, setSelectedRppId] = useState<string>(
    defaultRppId || (rpps.length > 0 ? rpps[0].id : '')
  );

  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedRpp = rpps.find(r => r.id === selectedRppId) || rpps[0];

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  // 1. Download to Word
  const handleExportWord = () => {
    if (!selectedRpp) return;
    try {
      exportToWord(selectedRpp, schoolIdentity);
      showNotice(`Berkas Word (.doc) untuk "${selectedRpp.judul}" berhasil diunduh!`);
    } catch (err: any) {
      alert('Gagal mengunduh berkas Word: ' + err.message);
    }
  };

  // 2. Export to PDF
  const handleExportPDF = async () => {
    if (!selectedRpp) return;
    try {
      setExportingPdf(true);
      setPdfProgress(15);
      const cleanName = `RPP_KBC_${selectedRpp.mataPelajaranNama.replace(/\s+/g, '_')}_Kls${selectedRpp.kelas}_${selectedRpp.nomorRpp.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      await exportElementToPDF('rpp-printable-document', cleanName, p => {
        setPdfProgress(p);
      });
      showNotice(`Dokumen PDF untuk "${selectedRpp.judul}" berhasil diekspor!`);
    } catch (err: any) {
      alert('Gagal mengekspor PDF: ' + err.message);
    } finally {
      setExportingPdf(false);
      setPdfProgress(0);
    }
  };

  // 3. Print
  const handlePrint = () => {
    window.print();
  };

  if (!selectedRpp) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800">Belum Ada Dokumen RPP</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Silakan buat dokumen RPP terlebih dahulu untuk mengekspor ke format Word atau PDF.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileDown className="w-5 h-5 text-emerald-700" />
            <span>PUSAT CETAK & EKSPOR DOKUMEN RPP</span>
          </h1>
          <p className="text-xs text-slate-500">
            Ekspor resmi dokumen RPP KBC MIN 1 Paser ke format Microsoft Word (.doc), Cetak Langsung, dan PDF (.pdf)
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Selector & Export Control Box */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pilih Dokumen RPP yang Ingin Dicetak / Diekspor:
          </label>
          <select
            value={selectedRppId}
            onChange={e => setSelectedRppId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 font-medium text-slate-900"
          >
            {rpps.map(rpp => (
              <option key={rpp.id} value={rpp.id}>
                {rpp.nomorRpp} - {rpp.judul} ({rpp.mataPelajaranNama} - Kls {rpp.kelas})
              </option>
            ))}
          </select>
        </div>

        {/* 3 Dedicated Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Action 1: Unduh Word */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 transition-colors flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                <FileDown className="w-4 h-4 text-blue-700" />
                <span>Unduh ke Word (.doc)</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Berkas Microsoft Word yang dapat diedit langsung, lengkap dengan kop madrasah, tabel materi, dan tanda tangan pengesahan.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportWord}
              className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <FileDown className="w-4 h-4" />
              <span>Unduh Berkas Word</span>
            </button>
          </div>

          {/* Action 2: Ekspor PDF */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-colors flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <FileText className="w-4 h-4 text-rose-700" />
                <span>Ekspor ke PDF (.pdf)</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Berkas PDF digital siap dibagikan ke kepala madrasah, pengawas Kemenag, atau diarsipkan di Google Drive.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={exportingPdf}
              className="w-full py-2 px-3 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {exportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuat PDF ({pdfProgress}%)...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Ekspor Berkas PDF</span>
                </>
              )}
            </button>
          </div>

          {/* Action 3: Cetak Dokumen */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 transition-colors flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>Cetak Dokumen Fisik</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Mencetak langsung ke printer fisik atau gunakan fitur Save as PDF peramban dengan layout kertas A4 terstandar.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Container that gets exported */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-bold text-slate-700 uppercase tracking-wider">
            Pratinjau Dokumen Terformat (MIN 1 Paser):
          </span>
          <span>Dokumen nomor: {selectedRpp.nomorRpp}</span>
        </div>

        <div id="export-preview-container">
          <RPPPreview
            rpp={selectedRpp}
            schoolIdentity={schoolIdentity}
            onBack={() => {}}
          />
        </div>
      </div>
    </div>
  );
};
