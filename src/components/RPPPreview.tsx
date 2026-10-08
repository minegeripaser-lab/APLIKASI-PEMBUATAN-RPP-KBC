import React, { useState } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Heart, 
  CheckCircle2, 
  FileDown, 
  FileText,
  Calendar,
  Building,
  UserCheck,
  Download,
  Loader2,
  FileCode,
  Check
} from 'lucide-react';
import { exportToWord, exportElementToPDF } from '../utils/documentExporter.ts';
import type { RPPDocument, SchoolIdentity } from '../types/index.ts';

interface RPPPreviewProps {
  rpp: RPPDocument;
  schoolIdentity: SchoolIdentity;
  onBack: () => void;
}

export const RPPPreview: React.FC<RPPPreviewProps> = ({
  rpp,
  schoolIdentity,
  onBack,
}) => {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // 1. Direct Browser Print
  const handlePrint = () => {
    window.print();
  };

  // 2. Export to Word (.doc)
  const handleExportWord = () => {
    try {
      exportToWord(rpp, schoolIdentity);
      showNotification('Dokumen Microsoft Word (.doc) berhasil diunduh!');
    } catch (err: any) {
      alert('Gagal mengunduh berkas Word: ' + err.message);
    }
  };

  // 3. Export to PDF (.pdf)
  const handleExportPDF = async () => {
    try {
      setExportingPdf(true);
      setPdfProgress(10);
      const cleanName = `RPP_KBC_${rpp.mataPelajaranNama.replace(/\s+/g, '_')}_Kls${rpp.kelas}_${rpp.nomorRpp.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      await exportElementToPDF('rpp-printable-document', cleanName, p => {
        setPdfProgress(p);
      });
      showNotification('Dokumen PDF berhasil diekspor dan diunduh!');
    } catch (err: any) {
      alert('Gagal mengekspor PDF: ' + err.message);
    } finally {
      setExportingPdf(false);
      setPdfProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar</span>
          </button>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-mono font-bold text-slate-800">{rpp.nomorRpp}</span>
        </div>

        {/* Action Buttons: Cetak, Word, PDF */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unduh Word */}
          <button
            type="button"
            onClick={handleExportWord}
            title="Unduh sebagai dokumen Microsoft Word (.doc) yang dapat diedit langsung"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>Unduh ke Word (.doc)</span>
          </button>

          {/* Ekspor PDF */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exportingPdf}
            title="Ekspor dokumen langsung ke berkas PDF"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            {exportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Membuat PDF ({pdfProgress}%)...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Ekspor ke PDF (.pdf)</span>
              </>
            )}
          </button>

          {/* Cetak Langsung */}
          <button
            type="button"
            onClick={handlePrint}
            title="Buka dialog cetak peramban / Simpan PDF resolusi cetak"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Export Success Notification */}
      {exportNotice && (
        <div className="print:hidden p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* PRINTABLE OFFICIAL DOCUMENT CONTAINER */}
      <div 
        id="rpp-printable-document"
        className="bg-white p-8 sm:p-12 rounded-xl border border-slate-300 shadow-md max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 text-slate-900 leading-relaxed font-sans"
      >
        {/* KOP RESMI MADRASAH */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center">
          <div className="text-xs font-bold tracking-widest text-slate-700 uppercase">
            Kementerian Agama Republik Indonesia
          </div>
          <div className="text-xs font-bold tracking-wider text-slate-800 uppercase mt-0.5">
            Kantor Kementerian Agama Kabupaten Paser
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-tight mt-1">
            {schoolIdentity.namaMadrasah}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {schoolIdentity.alamat}
          </div>
          <div className="text-[11px] text-slate-500 italic mt-0.5">
            Tahun Pelajaran: {schoolIdentity.tahunPelajaran} · Tagline: "{schoolIdentity.tagline}"
          </div>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="text-center mb-6">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">
            Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar
          </h2>
          <div className="inline-block mt-1 px-3 py-0.5 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full border border-emerald-300 print:border-slate-800 print:bg-transparent">
            KURIKULUM BERBASIS CINTA (KBC) 2026
          </div>
          <p className="text-xs font-mono text-slate-500 mt-1">
            Nomor: {rpp.nomorRpp}
          </p>
        </div>

        {/* A. IDENTITAS PEMBELAJARAN */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider bg-slate-100 print:bg-slate-200 px-2 py-1 text-slate-900 mb-2 border-l-4 border-emerald-800">
            A. Identitas Pembelajaran
          </h3>
          <table className="w-full text-xs text-slate-800 border-collapse">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1 w-44 font-semibold text-slate-600">Satuan Pendidikan</td>
                <td className="py-1 w-4">:</td>
                <td className="py-1 font-bold text-slate-900">{schoolIdentity.namaMadrasah}</td>
                <td className="py-1 w-32 font-semibold text-slate-600">Jenjang</td>
                <td className="py-1 w-4">:</td>
                <td className="py-1 font-bold">{rpp.jenjang}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 font-semibold text-slate-600">Mata Pelajaran</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold text-emerald-900">
                  {rpp.mataPelajaranNama} ({rpp.mataPelajaranKelompok})
                </td>
                <td className="py-1 font-semibold text-slate-600">Fase / Kelas</td>
                <td className="py-1">:</td>
                <td className="py-1 font-bold">Fase {rpp.fase} / Kelas {rpp.kelas}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1 font-semibold text-slate-600">Semester</td>
                <td className="py-1">:</td>
                <td className="py-1">{rpp.semester}</td>
                <td className="py-1 font-semibold text-slate-600">Alokasi Waktu</td>
                <td className="py-1">:</td>
                <td className="py-1">{rpp.alokasiWaktu}</td>
              </tr>
              <tr>
                <td className="py-1 font-semibold text-slate-600">Materi Pokok</td>
                <td className="py-1">:</td>
                <td colSpan={4} className="py-1 font-bold text-slate-900">
                  {rpp.materiPokok}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* B. CAPAIAN & TUJUAN PEMBELAJARAN */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider bg-slate-100 print:bg-slate-200 px-2 py-1 text-slate-900 mb-2 border-l-4 border-emerald-800">
            B. Capaian & Tujuan Pembelajaran
          </h3>
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">1. Capaian Pembelajaran (CP):</span>
              <p className="text-slate-700 italic bg-slate-50 print:bg-transparent p-2 rounded border border-slate-200 print:border-none">
                "{rpp.capaianPembelajaran}"
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-800 block mb-1">2. Tujuan Pembelajaran (TP):</span>
              <ul className="list-decimal list-inside space-y-1 text-slate-800 pl-1">
                {(rpp.tujuanPembelajaran || []).map((tp, i) => (
                  <li key={i}>{tp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* C. PILAR KURIKULUM BERBASIS CINTA (KBC) */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider bg-slate-100 print:bg-slate-200 px-2 py-1 text-slate-900 mb-2 border-l-4 border-rose-700 flex items-center justify-between">
            <span>C. Pilar Kurikulum Berbasis Cinta (KBC)</span>
            <span className="text-[10px] text-rose-800 font-semibold normal-case">MIN 1 Paser</span>
          </h3>
          <div className="text-xs space-y-2">
            <div>
              <span className="font-bold text-slate-800">Pilar Panca Cinta Terpilih:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(rpp.pancaCinta || []).map((pc, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200 font-semibold text-[11px] print:border-slate-400 print:bg-transparent"
                  >
                    ❤ {pc}
                  </span>
                ))}
              </div>
            </div>

            {rpp.dimensiProfilLulusan && rpp.dimensiProfilLulusan.length > 0 && (
              <div>
                <span className="font-bold text-slate-800">Dimensi Profil Lulusan:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {rpp.dimensiProfilLulusan.map((dp, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] print:border-slate-400 print:bg-transparent"
                    >
                      ✓ {dp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {rpp.targetKarakterCinta && (
              <div>
                <span className="font-bold text-slate-800">Target Karakter Kasih Sayang:</span>
                <p className="text-slate-700 mt-0.5">
                  {rpp.targetKarakterCinta}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* D. DESAIN PEMBELAJARAN */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider bg-slate-100 print:bg-slate-200 px-2 py-1 text-slate-900 mb-2 border-l-4 border-emerald-800">
            D. Desain & Model Pembelajaran
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-800">Model Pembelajaran:</span>
              <p className="text-slate-700 mt-0.5">{rpp.modelPembelajaran}</p>
            </div>
            <div>
              <span className="font-bold text-slate-800">Metode Pembelajaran:</span>
              <p className="text-slate-700 mt-0.5">{(rpp.metodePembelajaran || []).join(', ')}</p>
            </div>
          </div>
        </div>

        {/* E. LANGKAH-LANGKAH PEMBELAJARAN BERBASIS CINTA */}
        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider bg-slate-100 print:bg-slate-200 px-2 py-1 text-slate-900 mb-2 border-l-4 border-emerald-800">
            E. Langkah-Langkah Pembelajaran Berbasis Cinta
          </h3>

          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            {/* 1. Kegiatan Awal */}
            <div className="border-b border-slate-300 p-3 bg-slate-50/50 print:bg-transparent">
              <div className="flex justify-between items-center font-bold text-emerald-900 mb-1">
                <span>1. Kegiatan Awal (Pendahuluan)</span>
                <span className="font-mono text-slate-600">{rpp.kegiatanAwal?.durasi || '10 Menit'}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-800">
                <li><strong>Salam & Doa:</strong> {rpp.kegiatanAwal?.salamDanDoa}</li>
                <li><strong>Apersepsi Kasih Sayang:</strong> {rpp.kegiatanAwal?.apersepsiCinta}</li>
                <li><strong>Tujuan & Motivasi:</strong> {rpp.kegiatanAwal?.tujuanDanMotivasi}</li>
              </ul>
            </div>

            {/* 2. Kegiatan Inti */}
            <div className="border-b border-slate-300 p-3">
              <div className="flex justify-between items-center font-bold text-emerald-900 mb-1">
                <span>2. Kegiatan Inti Pembelajaran KBC</span>
                <span className="font-mono text-slate-600">{rpp.kegiatanInti?.durasi || '50 Menit'}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-800">
                <li><strong>Eksplorasi Kasih:</strong> {rpp.kegiatanInti?.eksplorasiKasih}</li>
                <li><strong>Kolaborasi Empati:</strong> {rpp.kegiatanInti?.kolaborasiEmpati}</li>
                <li><strong>Internalisasi Nilai:</strong> {rpp.kegiatanInti?.internalisasiNilai}</li>
                {rpp.kegiatanInti?.sintaksDetail && (
                  <li><strong>Sintaks Pembelajaran:</strong> {rpp.kegiatanInti.sintaksDetail}</li>
                )}
              </ul>
            </div>

            {/* 3. Kegiatan Penutup */}
            <div className="p-3 bg-slate-50/50 print:bg-transparent">
              <div className="flex justify-between items-center font-bold text-emerald-900 mb-1">
                <span>3. Kegiatan Penutup</span>
                <span className="font-mono text-slate-600">{rpp.kegiatanPenutup?.durasi || '10 Menit'}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-800">
                <li><strong>Refleksi Hikmah Cinta:</strong> {rpp.kegiatanPenutup?.refleksiCinta}</li>
                <li><strong>Umpan Balik Apresiatif:</strong> {rpp.kegiatanPenutup?.umpanBalikApresiatif}</li>
                <li><strong>Doa & Penutup:</strong> {rpp.kegiatanPenutup?.doaDanTindakLanjut}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* F. ASESMEN & EVALUASI */}
        <div className="mb-8">
          <h3 className="text-xs font-black uppercase tracking-wider bg-slate-100 print:bg-slate-200 px-2 py-1 text-slate-900 mb-2 border-l-4 border-emerald-800">
            F. Asesmen, Evaluasi & Rubrik
          </h3>
          <div className="text-xs space-y-1.5 text-slate-800">
            <p><strong>1. Asesmen Awal:</strong> {rpp.asesmenAwal}</p>
            <p><strong>2. Asesmen Formatif:</strong> {rpp.asesmenFormatif}</p>
            <p><strong>3. Asesmen Sumatif:</strong> {rpp.asesmenSumatif}</p>
            {rpp.rubrikPenilaian && (
              <p><strong>4. Rubrik Penilaian:</strong> {rpp.rubrikPenilaian}</p>
            )}
            {rpp.remedialPengayaan && (
              <p><strong>5. Remedial & Pengayaan:</strong> {rpp.remedialPengayaan}</p>
            )}
          </div>
        </div>

        {/* LEMBAR PENGESAHAN DOKUMEN RESMI */}
        <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-center break-inside-avoid">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900">Kepala Madrasah {schoolIdentity.namaMadrasah}</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">[ Tanda Tangan & Cap ]</span>
            </div>
            <p className="font-bold text-slate-900 underline">{schoolIdentity.namaKepalaMadrasah}</p>
            <p className="text-slate-600">NIP. {schoolIdentity.nipKepalaMadrasah}</p>
          </div>

          <div>
            <p className="text-slate-600">Tanah Grogot, {new Date(rpp.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-900">Guru Mata Pelajaran</p>
            <div className="h-16 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">[ Tanda Tangan Guru ]</span>
            </div>
            <p className="font-bold text-slate-900 underline">{rpp.creatorName}</p>
            <p className="text-slate-600">NIP. {schoolIdentity.nipGuruDefault}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
