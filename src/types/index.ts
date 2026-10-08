/**
 * Type definitions for RPP KBC GENERATOR 2026 - MIN 1 Paser
 */

export type UserRole = 'SUPER_ADMIN' | 'GUEST';
export type UserStatus = 'AKTIF' | 'NONAKTIF';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SubjectKelompok = 'KELOMPOK A' | 'KELOMPOK B' | 'KELOMPOK C';

export interface Subject {
  id: string;
  kode: string;
  nama: string;
  kelompok: SubjectKelompok;
  kelompokLabel: string;
  jenjang: 'MI';
  fase: ('A' | 'B' | 'C')[];
  status: 'AKTIF' | 'NONAKTIF';
  urutan: number;
  deskripsi: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolIdentity {
  namaMadrasah: string;
  alamat: string;
  tahunPelajaran: string;
  namaKepalaMadrasah: string;
  nipKepalaMadrasah: string;
  namaGuruDefault: string;
  nipGuruDefault: string;
  tagline: string;
  namaAplikasi: string;
  logoUrl?: string;
  kabupaten: string;
  provinsi: string;
}

export interface PhaseMaster {
  id: 'A' | 'B' | 'C';
  nama: string;
  kelas: string[];
  deskripsi: string;
}

export interface PancaCintaItem {
  id: string;
  nama: string;
  deskripsi: string;
  indikator: string[];
}

export interface DimensiProfilItem {
  id: string;
  nama: string;
  deskripsi: string;
}

export interface ModelPembelajaranItem {
  id: string;
  nama: string;
  sintaks: string[];
  deskripsi: string;
}

export interface MetodePembelajaranItem {
  id: string;
  nama: string;
  deskripsi: string;
}

export interface JenisAsesmenItem {
  id: string;
  nama: string;
  teknik: string[];
  deskripsi: string;
}

export interface RPPDocument {
  id: string;
  nomorRpp: string;
  judul: string;
  
  // A. Identitas Pembelajaran
  jenjang: 'MI';
  fase: 'A' | 'B' | 'C';
  kelas: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  semester: '1 (Ganjil)' | '2 (Genap)';
  mataPelajaranId: string;
  mataPelajaranNama: string;
  mataPelajaranKelompok: SubjectKelompok;
  alokasiWaktu: string;
  tahunPelajaran: string;
  pertemuanKe: number;

  // B. Capaian & Tujuan Pembelajaran
  capaianPembelajaran: string;
  tujuanPembelajaran: string[];
  materiPokok: string;
  kataKunci: string[];

  // C. Pilar Kurikulum Berbasis Cinta (KBC)
  pancaCinta: string[];
  dimensiProfilLulusan: string[];
  targetKarakterCinta: string;

  // D. Desain & Model Pembelajaran KBC
  modelPembelajaran: string;
  metodePembelajaran: string[];
  mediaSumberBelajar: string[];

  // E. Langkah Pembelajaran Berbasis Cinta (KBC)
  kegiatanAwal: {
    durasi: string;
    salamDanDoa: string;
    apersepsiCinta: string;
    tujuanDanMotivasi: string;
  };
  kegiatanInti: {
    durasi: string;
    eksplorasiKasih: string;
    kolaborasiEmpati: string;
    internalisasiNilai: string;
    sintaksDetail: string;
  };
  kegiatanPenutup: {
    durasi: string;
    refleksiCinta: string;
    umpanBalikApresiatif: string;
    doaDanTindakLanjut: string;
  };

  // F. Asesmen & Evaluasi
  asesmenAwal: string;
  asesmenFormatif: string;
  asesmenSumatif: string;
  rubrikPenilaian: string;
  remedialPengayaan: string;

  // Metadata & Ownership
  createdBy: string;
  creatorName: string;
  creatorRole: UserRole;
  status: 'DRAFT' | 'SELESAI' | 'TERVERIFIKASI';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  status: 'SUKSES' | 'GAGAL';
  detail: string;
  ip: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalSuperAdmin: number;
  totalGuest: number;
  loginToday: number;
  rppCreatedToday: number;
  totalRpps: number;
}

export interface MateriAjar {
  id: string;
  judul: string;
  mataPelajaranId: string;
  mataPelajaranNama: string;
  mataPelajaranKelompok: SubjectKelompok;
  fase: 'A' | 'B' | 'C';
  kelas: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  semester: '1 (Ganjil)' | '2 (Genap)';
  topikUtama: string;
  pancaCinta: string[];
  
  // Konten Bahan Ajar
  pengantarStimulus: string; // Kisah pemantik / stimulus bernuansa kasih
  uraianMateri: string; // Konsep inti dan penjelasan kontekstual
  aktivitasSiswa: string; // Aktivitas kolaboratif / eksperimen empati
  hikmahCinta: string; // Refleksi makna kasih sayang & penerapan harian
  latihanSoal: string; // Pertanyaan pengasah pemikiran
  glosarium?: string; // Istilah penting

  createdBy: string;
  creatorName: string;
  creatorRole: UserRole;
  createdAt: string;
  updatedAt: string;
}

