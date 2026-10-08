/**
 * Document Export Utility for RPP KBC GENERATOR 2026 - MIN 1 Paser
 * Supports:
 * 1. Microsoft Word (.doc) with official formatting and Kop Surat
 * 2. PDF (.pdf) using html2canvas & jsPDF
 * 3. Direct Browser Print
 */
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { RPPDocument, SchoolIdentity } from '../types/index.ts';

/**
 * Generates and downloads an editable Microsoft Word (.doc) file
 * with official kop surat, structured tables, and signature blocks.
 */
export function exportToWord(rpp: RPPDocument, schoolIdentity: SchoolIdentity) {
  const sanitizeFilename = (name: string) =>
    name.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);

  const fileName = `RPP_KBC_${sanitizeFilename(rpp.mataPelajaranNama)}_${sanitizeFilename(
    rpp.kelas
  )}_${sanitizeFilename(rpp.nomorRpp || 'Doc')}.doc`;

  const tpItemsHtml = (rpp.tujuanPembelajaran || [])
    .map((tp, idx) => `<tr><td style="width:25px; vertical-align:top;">${idx + 1}.</td><td>${tp}</td></tr>`)
    .join('');

  const pancaCintaHtml = (rpp.pancaCinta || [])
    .map(pc => `<span style="display:inline-block; margin-right:8px; font-weight:bold; color:#be123c;">❤ ${pc}</span>`)
    .join('&nbsp;&nbsp;|&nbsp;&nbsp;');

  const dimensiProfilHtml = (rpp.dimensiProfilLulusan || [])
    .map(dp => `<span style="display:inline-block; margin-right:8px; color:#065f46;">✓ ${dp}</span>`)
    .join('&nbsp;&nbsp;|&nbsp;&nbsp;');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${rpp.judul}</title>
      <style>
        @page WordSection1 {
          size: 210mm 297mm;
          margin: 20mm 20mm 20mm 20mm;
          mso-header-margin: 10mm;
          mso-footer-margin: 10mm;
          mso-paper-source: 0;
        }
        div.WordSection1 {
          page: WordSection1;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.35;
          color: #000000;
        }
        .kop {
          text-align: center;
          margin-bottom: 12px;
          border-bottom: 3px double #000000;
          padding-bottom: 8px;
        }
        .kop-instansi {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0;
        }
        .kop-kemenag {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0;
        }
        .kop-nama {
          font-size: 15pt;
          font-weight: bold;
          text-transform: uppercase;
          color: #064e3b;
          margin: 3px 0;
        }
        .kop-alamat {
          font-size: 9pt;
          margin: 0;
        }
        .kop-tagline {
          font-size: 9pt;
          font-style: italic;
          margin-top: 2px;
        }
        h2.doc-title {
          text-align: center;
          font-size: 13pt;
          font-weight: bold;
          text-transform: uppercase;
          margin: 10px 0 2px 0;
        }
        .doc-badge {
          text-align: center;
          font-size: 11pt;
          font-weight: bold;
          color: #047857;
          margin-bottom: 2px;
        }
        .doc-nomor {
          text-align: center;
          font-size: 10pt;
          font-family: monospace;
          margin-bottom: 16px;
        }
        h3.section-header {
          font-size: 11pt;
          font-weight: bold;
          text-transform: uppercase;
          background-color: #f1f5f9;
          padding: 4px 6px;
          margin-top: 14px;
          margin-bottom: 6px;
          border-left: 4px solid #047857;
        }
        table.meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
          font-size: 10.5pt;
        }
        table.meta-table td {
          padding: 2px 4px;
          vertical-align: top;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 6px 0;
          font-size: 10pt;
        }
        table.data-table th, table.data-table td {
          border: 1px solid #94a3b8;
          padding: 6px 8px;
          vertical-align: top;
        }
        table.data-table th {
          background-color: #e2e8f0;
          font-weight: bold;
        }
        ul, ol {
          margin: 2px 0 6px 18px;
          padding: 0;
        }
        li {
          margin-bottom: 3px;
        }
        .signature-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 24px;
          page-break-inside: avoid;
        }
        .signature-table td {
          text-align: center;
          vertical-align: top;
          width: 50%;
        }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        <!-- KOP SURAT RESMI -->
        <div class="kop">
          <div class="kop-instansi">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
          <div class="kop-kemenag">KANTOR KEMENTERIAN AGAMA KABUPATEN PASER</div>
          <div class="kop-nama">${schoolIdentity.namaMadrasah}</div>
          <div class="kop-alamat">${schoolIdentity.alamat}</div>
          <div class="kop-tagline">Tahun Pelajaran ${schoolIdentity.tahunPelajaran} · "${schoolIdentity.tagline}"</div>
        </div>

        <!-- JUDUL MODUL / RPP -->
        <h2 class="doc-title">RENCANA PELAKSANAAN PEMBELAJARAN (RPP) / MODUL AJAR</h2>
        <div class="doc-badge">KURIKULUM BERBASIS CINTA (KBC) 2026</div>
        <div class="doc-nomor">Nomor Dokumen: ${rpp.nomorRpp}</div>

        <!-- A. IDENTITAS PEMBELAJARAN -->
        <h3 class="section-header">A. Identitas Pembelajaran</h3>
        <table class="meta-table">
          <tr>
            <td style="width: 25%;"><strong>Satuan Pendidikan</strong></td>
            <td style="width: 2%;">:</td>
            <td style="width: 38%;">${schoolIdentity.namaMadrasah}</td>
            <td style="width: 18%;"><strong>Jenjang</strong></td>
            <td style="width: 2%;">:</td>
            <td>${rpp.jenjang}</td>
          </tr>
          <tr>
            <td><strong>Mata Pelajaran</strong></td>
            <td>:</td>
            <td><strong>${rpp.mataPelajaranNama}</strong> (${rpp.mataPelajaranKelompok})</td>
            <td><strong>Fase / Kelas</strong></td>
            <td>:</td>
            <td><strong>Fase ${rpp.fase} / Kelas ${rpp.kelas}</strong></td>
          </tr>
          <tr>
            <td><strong>Semester</strong></td>
            <td>:</td>
            <td>${rpp.semester}</td>
            <td><strong>Alokasi Waktu</strong></td>
            <td>:</td>
            <td>${rpp.alokasiWaktu}</td>
          </tr>
          <tr>
            <td><strong>Materi Pokok</strong></td>
            <td>:</td>
            <td colspan="4"><strong>${rpp.materiPokok}</strong></td>
          </tr>
        </table>

        <!-- B. CAPAIAN & TUJUAN PEMBELAJARAN -->
        <h3 class="section-header">B. Capaian & Tujuan Pembelajaran</h3>
        <p><strong>1. Capaian Pembelajaran (CP):</strong></p>
        <p style="font-style: italic; background-color: #f8fafc; padding: 6px; border: 1px solid #cbd5e1;">
          "${rpp.capaianPembelajaran}"
        </p>

        <p><strong>2. Tujuan Pembelajaran (TP):</strong></p>
        <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
          ${tpItemsHtml}
        </table>

        <!-- C. PILAR KURIKULUM BERBASIS CINTA (KBC) -->
        <h3 class="section-header">C. Pilar Kurikulum Berbasis Cinta (KBC)</h3>
        <p><strong>Pilar Panca Cinta Terpilih:</strong></p>
        <p>${pancaCintaHtml}</p>

        <p><strong>Dimensi Profil Lulusan:</strong></p>
        <p>${dimensiProfilHtml}</p>

        ${
          rpp.targetKarakterCinta
            ? `<p><strong>Target Karakter Kasih Sayang:</strong></p><p>${rpp.targetKarakterCinta}</p>`
            : ''
        }

        <!-- D. DESAIN PEMBELAJARAN -->
        <h3 class="section-header">D. Desain & Model Pembelajaran</h3>
        <table class="meta-table">
          <tr>
            <td style="width:25%;"><strong>Model Pembelajaran</strong></td>
            <td style="width:2%;">:</td>
            <td>${rpp.modelPembelajaran}</td>
          </tr>
          <tr>
            <td><strong>Metode Pembelajaran</strong></td>
            <td>:</td>
            <td>${(rpp.metodePembelajaran || []).join(', ')}</td>
          </tr>
        </table>

        <!-- E. LANGKAH-LANGKAH PEMBELAJARAN -->
        <h3 class="section-header">E. Langkah-Langkah Pembelajaran Berbasis Cinta</h3>
        
        <table class="data-table">
          <tr>
            <th style="width: 30%;">Tahap Pembelajaran</th>
            <th>Uraian Kegiatan Berbasis Kasih Sayang</th>
            <th style="width: 15%;">Waktu</th>
          </tr>
          <tr>
            <td><strong>1. Kegiatan Awal</strong></td>
            <td>
              <p>• <strong>Salam & Doa:</strong> ${rpp.kegiatanAwal?.salamDanDoa || '-'}</p>
              <p>• <strong>Apersepsi Kasih Sayang:</strong> ${rpp.kegiatanAwal?.apersepsiCinta || '-'}</p>
              <p>• <strong>Tujuan & Motivasi:</strong> ${rpp.kegiatanAwal?.tujuanDanMotivasi || '-'}</p>
            </td>
            <td style="text-align:center;">${rpp.kegiatanAwal?.durasi || '10 Menit'}</td>
          </tr>
          <tr>
            <td><strong>2. Kegiatan Inti</strong></td>
            <td>
              <p>• <strong>Eksplorasi Kasih:</strong> ${rpp.kegiatanInti?.eksplorasiKasih || '-'}</p>
              <p>• <strong>Kolaborasi Empati:</strong> ${rpp.kegiatanInti?.kolaborasiEmpati || '-'}</p>
              <p>• <strong>Internalisasi Nilai:</strong> ${rpp.kegiatanInti?.internalisasiNilai || '-'}</p>
              ${
                rpp.kegiatanInti?.sintaksDetail
                  ? `<p>• <strong>Sintaks Pembelajaran:</strong> ${rpp.kegiatanInti.sintaksDetail}</p>`
                  : ''
              }
            </td>
            <td style="text-align:center;">${rpp.kegiatanInti?.durasi || '50 Menit'}</td>
          </tr>
          <tr>
            <td><strong>3. Kegiatan Penutup</strong></td>
            <td>
              <p>• <strong>Refleksi Cinta:</strong> ${rpp.kegiatanPenutup?.refleksiCinta || '-'}</p>
              <p>• <strong>Umpan Balik Apresiatif:</strong> ${rpp.kegiatanPenutup?.umpanBalikApresiatif || '-'}</p>
              <p>• <strong>Doa Penutup:</strong> ${rpp.kegiatanPenutup?.doaDanTindakLanjut || '-'}</p>
            </td>
            <td style="text-align:center;">${rpp.kegiatanPenutup?.durasi || '10 Menit'}</td>
          </tr>
        </table>

        <!-- F. ASESMEN & EVALUASI -->
        <h3 class="section-header">F. Asesmen, Evaluasi & Rubrik</h3>
        <p><strong>1. Asesmen Awal:</strong> ${rpp.asesmenAwal || '-'}</p>
        <p><strong>2. Asesmen Formatif:</strong> ${rpp.asesmenFormatif || '-'}</p>
        <p><strong>3. Asesmen Sumatif:</strong> ${rpp.asesmenSumatif || '-'}</p>
        ${rpp.rubrikPenilaian ? `<p><strong>4. Rubrik Penilaian:</strong> ${rpp.rubrikPenilaian}</p>` : ''}
        ${rpp.remedialPengayaan ? `<p><strong>5. Remedial & Pengayaan:</strong> ${rpp.remedialPengayaan}</p>` : ''}

        <!-- PENGESAHAN DOKUMEN RESMI -->
        <table class="signature-table">
          <tr>
            <td>
              <p>Mengetahui,</p>
              <p><strong>Kepala Madrasah ${schoolIdentity.namaMadrasah}</strong></p>
              <br><br><br>
              <p><u><strong>${schoolIdentity.namaKepalaMadrasah}</strong></u></p>
              <p>NIP. ${schoolIdentity.nipKepalaMadrasah}</p>
            </td>
            <td>
              <p>Tanah Grogot, ${new Date(rpp.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}</p>
              <p><strong>Guru Mata Pelajaran</strong></p>
              <br><br><br>
              <p><u><strong>${rpp.creatorName}</strong></u></p>
              <p>NIP. ${schoolIdentity.nipGuruDefault}</p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads an editable Microsoft Word (.doc) file for Materi Ajar
 */
export function exportMateriToWord(item: import('../types/index.ts').MateriAjar, schoolIdentity: SchoolIdentity) {
  const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
  const fileName = `Materi_Ajar_${sanitize(item.mataPelajaranNama)}_Kls${item.kelas}_${sanitize(item.topikUtama)}.doc`;

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${item.judul}</title>
      <style>
        @page WordSection1 { size: 210mm 297mm; margin: 20mm; }
        div.WordSection1 { page: WordSection1; }
        body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.4; color: #000; }
        .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 6px; margin-bottom: 12px; }
        .kop h4 { margin: 0; text-transform: uppercase; font-size: 11pt; }
        .kop h2 { margin: 2px 0; text-transform: uppercase; font-size: 14pt; color: #064e3b; }
        .kop p { margin: 0; font-size: 9pt; }
        .title { text-align: center; font-size: 13pt; font-weight: bold; text-transform: uppercase; margin: 12px 0 2px 0; }
        .subtitle { text-align: center; font-size: 11pt; font-weight: bold; color: #047857; margin-bottom: 14px; }
        .meta-box { background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 10pt; margin-bottom: 14px; }
        h3 { font-size: 11.5pt; text-transform: uppercase; background: #e2e8f0; padding: 4px 6px; margin-top: 14px; border-left: 4px solid #047857; }
        p { margin: 4px 0 8px 0; text-align: justify; }
        .panca-box { border: 1px solid #fda4af; background: #fff1f2; padding: 8px 10px; font-size: 10pt; margin: 8px 0; }
        .signature-table { width: 100%; border-collapse: collapse; margin-top: 24px; page-break-inside: avoid; }
        .signature-table td { text-align: center; vertical-align: top; width: 50%; }
      </style>
    </head>
    <body>
      <div class="WordSection1">
        <div class="kop">
          <h4>Kementerian Agama Republik Indonesia · Kantor Kemenag Kabupaten Paser</h4>
          <h2>${schoolIdentity.namaMadrasah}</h2>
          <p>${schoolIdentity.alamat}</p>
          <p>Tahun Pelajaran ${schoolIdentity.tahunPelajaran} · "${schoolIdentity.tagline}"</p>
        </div>

        <div class="title">MODUL / MATERI AJAR SISWA</div>
        <div class="subtitle">KURIKULUM BERBASIS CINTA (KBC) 2026</div>

        <div class="meta-box">
          <strong>Mata Pelajaran:</strong> ${item.mataPelajaranNama} (${item.mataPelajaranKelompok}) &nbsp;|&nbsp;
          <strong>Fase:</strong> ${item.fase} &nbsp;|&nbsp;
          <strong>Kelas:</strong> ${item.kelas} &nbsp;|&nbsp;
          <strong>Semester:</strong> ${item.semester}<br>
          <strong>Topik Utama:</strong> ${item.topikUtama} &nbsp;|&nbsp;
          <strong>Penyusun:</strong> ${item.creatorName}
        </div>

        <div class="panca-box">
          <strong>Pilar Karakter Kasih Sayang yang Ditanamkan:</strong><br>
          ${(item.pancaCinta || []).map(p => `❤ ${p}`).join('&nbsp;&nbsp;|&nbsp;&nbsp;')}
        </div>

        <h2 style="font-size: 13pt; color: #064e3b; margin-top: 14px; margin-bottom: 8px;">${item.judul}</h2>

        <h3>1. Pengantar Penuh Kasih (Kisah Pemantik)</h3>
        <p>${(item.pengantarStimulus || '-').replace(/\n/g, '<br>')}</p>

        <h3>2. Uraian Materi Pokok</h3>
        <p>${(item.uraianMateri || '-').replace(/\n/g, '<br>')}</p>

        <h3>3. Aktivitas Kolaboratif Sahabat Cinta</h3>
        <p>${(item.aktivitasSiswa || '-').replace(/\n/g, '<br>')}</p>

        <h3>4. Hikmah Kasih Sayang & Penerapan Sehari-Hari</h3>
        <p>${(item.hikmahCinta || '-').replace(/\n/g, '<br>')}</p>

        <h3>5. Latihan Mandiri & Pertanyaan Pemantik</h3>
        <p>${(item.latihanSoal || '-').replace(/\n/g, '<br>')}</p>

        ${
          item.glosarium
            ? `<h3>6. Glosarium Kosakata Kunci</h3><p>${item.glosarium.replace(/\n/g, '<br>')}</p>`
            : ''
        }

        <table class="signature-table">
          <tr>
            <td>
              <p>Mengetahui,</p>
              <p><strong>Kepala Madrasah ${schoolIdentity.namaMadrasah}</strong></p>
              <br><br><br>
              <p><u><strong>${schoolIdentity.namaKepalaMadrasah}</strong></u></p>
              <p>NIP. ${schoolIdentity.nipKepalaMadrasah}</p>
            </td>
            <td>
              <p>Tanah Grogot, ${new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>Guru Pengampu Mata Pelajaran</strong></p>
              <br><br><br>
              <p><u><strong>${item.creatorName}</strong></u></p>
              <p>NIP. ${schoolIdentity.nipGuruDefault}</p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Exports the specified HTML element directly into a multi-page PDF document
 */
export async function exportElementToPDF(
  elementId: string,
  fileName: string = 'Dokumen_RPP_KBC_2026.pdf',
  onProgress?: (progress: number) => void
) {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element dengan ID "${elementId}" tidak ditemukan.`);
  }

  if (onProgress) onProgress(20);

  // Render high resolution canvas
  const canvas = await html2canvas(element, {
    scale: 2, // 2x for sharp printing quality
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  if (onProgress) onProgress(60);

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10; // 10mm margin
  const contentWidth = pdfWidth - margin * 2;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;

  let heightLeft = contentHeight;
  let position = margin;
  let page = 1;

  // Add first page
  pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, '', 'FAST');
  heightLeft -= pdfHeight - margin * 2;

  // Add additional pages if content spans multiple pages
  while (heightLeft > 0) {
    position = -(page * (pdfHeight - margin * 2) - margin);
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight, '', 'FAST');
    page++;
    heightLeft -= pdfHeight - margin * 2;
  }

  if (onProgress) onProgress(90);

  pdf.save(fileName);

  if (onProgress) onProgress(100);
}
