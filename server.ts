import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type { 
  User, 
  Subject, 
  SchoolIdentity, 
  RPPDocument, 
  AuditLog, 
  UserStats,
  PhaseMaster,
  PancaCintaItem,
  DimensiProfilItem,
  ModelPembelajaranItem,
  MetodePembelajaranItem,
  JenisAsesmenItem,
  MateriAjar
} from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'store.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// -------------------------------------------------------------
// Security & Password Helpers
// -------------------------------------------------------------
const HASH_SALT = 'min1paser-kbc-2026-salt';

function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, HASH_SALT, 1000, 64, 'sha512').toString('hex');
}

// In-memory active tokens (token -> userId, expires)
const activeSessions = new Map<string, { userId: string; expires: number }>();

function generateToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  // Token expires in 24 hours
  activeSessions.set(token, {
    userId,
    expires: Date.now() + 24 * 60 * 60 * 1000,
  });
  return token;
}

// -------------------------------------------------------------
// Initial Seed Data
// -------------------------------------------------------------
const DEFAULT_SCHOOL_IDENTITY: SchoolIdentity = {
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
};

const DEFAULT_SUBJECTS: Subject[] = [
  // Kelompok A: Mata Pelajaran Keagamaan
  {
    id: 'sub_qh',
    kode: 'QH-MI',
    nama: "Al-Qur'an Hadis",
    kelompok: 'KELOMPOK A',
    kelompokLabel: 'Mata Pelajaran Keagamaan',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 1,
    deskripsi: "Pembelajaran membaca, menghafal, memahami pesan kasih sayang Al-Qur'an dan Hadis Nabi SAW.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_aa',
    kode: 'AA-MI',
    nama: 'Akidah Akhlak',
    kelompok: 'KELOMPOK A',
    kelompokLabel: 'Mata Pelajaran Keagamaan',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 2,
    deskripsi: 'Penanaman keimanan berbasis cinta Allah SWT dan peneladanan akhlak mulia karimah.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_fiq',
    kode: 'FIQ-MI',
    nama: 'Fikih',
    kelompok: 'KELOMPOK A',
    kelompokLabel: 'Mata Pelajaran Keagamaan',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 3,
    deskripsi: 'Ketentuan ibadah praktis, thaharah, shalat, dan muamalah dengan kesadaran cinta dan keikhlasan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_ski',
    kode: 'SKI-MI',
    nama: 'Sejarah Kebudayaan Islam (SKI)',
    kelompok: 'KELOMPOK A',
    kelompokLabel: 'Mata Pelajaran Keagamaan',
    jenjang: 'MI',
    fase: ['B', 'C'],
    status: 'AKTIF',
    urutan: 4,
    deskripsi: 'Kisah dakwah Rasulullah SAW dan peradaban Islam yang penuh hikmah kasih dan keteladanan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_arb',
    kode: 'ARB-MI',
    nama: 'Bahasa Arab',
    kelompok: 'KELOMPOK A',
    kelompokLabel: 'Mata Pelajaran Keagamaan',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 5,
    deskripsi: 'Keterampilan menyimak, berbicara, membaca, dan menulis kosakata bahasa Al-Qur’an secara menyenangkan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Kelompok B: Mata Pelajaran Umum
  {
    id: 'sub_pp',
    kode: 'PP-MI',
    nama: 'Pendidikan Pancasila',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 6,
    deskripsi: 'Pemahaman nilai-nilai luhur Pancasila, konstitusi, norma, gotong royong, dan cinta NKRI.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_bind',
    kode: 'BIND-MI',
    nama: 'Bahasa Indonesia',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 7,
    deskripsi: 'Pengembangan kemampuan literasi, komunikasi santun, apresiasi sastra, dan berpikir kritis.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_mat',
    kode: 'MAT-MI',
    nama: 'Matematika',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 8,
    deskripsi: 'Konsep bilangan, geometri, pengukuran, analisis data dengan pendekatan pemecahan masalah yang ramah anak.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_ipas',
    kode: 'IPAS-MI',
    nama: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['B', 'C'],
    status: 'AKTIF',
    urutan: 9,
    deskripsi: 'Eksplorasi fenomena alam, lingkungan hidup ciptaan Allah, interaksi sosial budaya, dan kepedulian ekologis.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_pjok',
    kode: 'PJOK-MI',
    nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 10,
    deskripsi: 'Aktivitas gerak jasmani, sportivitas, pola hidup sehat, kebersihan diri sebagai wujud cinta diri.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_sbr',
    kode: 'SB-RUP',
    nama: 'Seni dan Budaya (Seni Rupa)',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 11,
    deskripsi: 'Ekspresi visual estetika, menggambar, melukis, dan membuat kriya kreatif bernuansa Islami.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_sbm',
    kode: 'SB-MUS',
    nama: 'Seni dan Budaya (Seni Musik)',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 12,
    deskripsi: 'Apresiasi nada, irama, melodi shalawat, lagu nasional, dan ekspresi bunyi yang santun.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_sbt',
    kode: 'SB-TAR',
    nama: 'Seni dan Budaya (Seni Tari)',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 13,
    deskripsi: 'Gerak ritmis ekspresif, kesantunan gerak nusantara dan kearifan lokal.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_sbte',
    kode: 'SB-TEA',
    nama: 'Seni dan Budaya (Seni Teater)',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 14,
    deskripsi: 'Bermain peran, pantomim, dramatisasi cerita hikmah, dan percaya diri tampil di depan umum.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_bing',
    kode: 'BING-MI',
    nama: 'Bahasa Inggris',
    kelompok: 'KELOMPOK B',
    kelompokLabel: 'Mata Pelajaran Umum',
    jenjang: 'MI',
    fase: ['B', 'C'],
    status: 'AKTIF',
    urutan: 15,
    deskripsi: 'Pengenalan bahasa internasional komunikasi dasar dan kosakata interaktif.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Kelompok C: Muatan / Kekhasan Madrasah
  {
    id: 'sub_psr',
    kode: 'ML-PSR',
    nama: 'Muatan Lokal: Bahasa Paser & Budaya Lokal',
    kelompok: 'KELOMPOK C',
    kelompokLabel: 'Muatan/Kekhasan Madrasah',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 16,
    deskripsi: 'Pelestarian bahasa daerah Paser, adat istiadat, dan kearifan lokal Kabupaten Paser Kalimantan Timur.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub_thf',
    kode: 'TH-MI',
    nama: 'Tahfidz & Pendalaman Al-Qur’an Madrasah',
    kelompok: 'KELOMPOK C',
    kelompokLabel: 'Muatan/Kekhasan Madrasah',
    jenjang: 'MI',
    fase: ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: 17,
    deskripsi: 'Program unggulan tahfidz juz 30 dan adab penghafal Al-Qur’an khas MIN 1 Paser.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PHASES: PhaseMaster[] = [
  { id: 'A', nama: 'Fase A (Kelas I & II)', kelas: ['I', 'II'], deskripsi: 'Pondasi awal literasi, numerasi, dan pembiasaan adab kasih sayang.' },
  { id: 'B', nama: 'Fase B (Kelas III & IV)', kelas: ['III', 'IV'], deskripsi: 'Pengembangan kemandirian belajar dan pemahaman konsep terpadu.' },
  { id: 'C', nama: 'Fase C (Kelas V & VI)', kelas: ['V', 'VI'], deskripsi: 'Penguatan penalaran kritis, kolaborasi empati, dan kesiapan transisi MTs.' },
];

const DEFAULT_PANCA_CINTA: PancaCintaItem[] = [
  {
    id: 'pc_1',
    nama: 'Cinta Allah SWT & Rasulullah SAW',
    deskripsi: 'Menghadirkan kesadaran tauhid dalam setiap fenomena pembelajaran, menjalankan ibadah dengan penuh kerinduan dan cinta, serta meneladani akhlak mulia Nabi Muhammad SAW.',
    indikator: [
      'Memulai dan mengakhiri kegiatan dengan doa penuh penghayatan',
      'Mengaitkan konsep pelajaran dengan keagungan ciptaan Allah',
      'Meneladani sifat shiddiq, amanah, fathanah, dan tabligh',
    ],
  },
  {
    id: 'pc_2',
    nama: 'Cinta Diri Sendiri & Sesama Manusia',
    deskripsi: 'Menghargai martabat diri sendiri sebagai amanah illahi, menjaga kesehatan lahir batin, serta menebarkan empati, toleransi, dan sikap tolong-menolong kepada teman.',
    indikator: [
      'Menjaga kebersihan diri dan berpakaian rapi',
      'Berbicara santun dan tidak mencela sesama',
      'Membantu teman yang mengalami kesulitan belajar tanpa membedakan',
    ],
  },
  {
    id: 'pc_3',
    nama: 'Cinta Ilmu Pengetahuan & Kebenaran',
    deskripsi: 'Menumbuhkan rasa ingin tahu yang membahagiakan, kegemaran membaca, kesungguhan menuntut ilmu, dan kejujuran dalam mencari kebenaran ilmiah.',
    indikator: [
      'Antusias bertanya dan mengeksplorasi ide baru',
      'Tekun menyelesaikan tugas dengan penuh rasa tanggung jawab',
      'Menghargai pendapat ilmiah orang lain secara terbuka',
    ],
  },
  {
    id: 'pc_4',
    nama: 'Cinta Lingkungan & Alam Sekitar',
    deskripsi: 'Merawat madrasah dan bumi sebagai wujud syukur atas nikmat ciptaan Allah, mengamalkan pola hidup hemat, memilah sampah, dan menolak perusakan alam.',
    indikator: [
      'Membuang sampah pada tempatnya dan merawat tanaman madrasah',
      'Hemat menggunakan air, kertas, dan energi listrik',
      'Peduli kelestarian ekosistem lingkungan Paser',
    ],
  },
  {
    id: 'pc_5',
    nama: 'Cinta Tanah Air & Bangsa Indonesia',
    deskripsi: 'Menumbuhkan kebanggaan berbangsa Indonesia, menjunjung tinggi nilai persatuan dalam keragaman suku, bahasa, dan budaya, serta komitmen bela negara.',
    indikator: [
      'Menghormati simbol negara dan menyanyikan lagu nasional dengan khidmat',
      'Menghargai keragaman tradisi lokal Paser dan nusantara',
      'Menjaga kerukunan dan persaudaraan antar warga madrasah',
    ],
  },
];

const DEFAULT_DIMENSI_PROFIL: DimensiProfilItem[] = [
  { id: 'dp_1', nama: 'Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia', deskripsi: 'Pribadi berakhlak dalam beragama, berakhlak pribadi, kepada sesama, dan alam.' },
  { id: 'dp_2', nama: 'Berkebhinekaan Global & Moderasi Beragama', deskripsi: 'Mengenal dan menghargai budaya, moderat dalam beragama, serta berkomunikasi interkultural.' },
  { id: 'dp_3', nama: 'Bergotong Royong & Empati', deskripsi: 'Kemampuan berkolaborasi, kepedulian berbagi, dan tolong menolong demi kebaikan bersama.' },
  { id: 'dp_4', nama: 'Mandiri & Tangguh', deskripsi: 'Prakarsa atas pengembangan dirinya yang tercermin dalam kemampuan regulasi diri dan tekun belajar.' },
  { id: 'dp_5', nama: 'Bernalar Kritis & Reflektif', deskripsi: 'Mampu memproses informasi, menganalisis, mengevaluasi penalaran, dan merefleksikan pemikiran.' },
  { id: 'dp_6', nama: 'Kreatif & Solutif', deskripsi: 'Mampu memodifikasi dan menghasilkan sesuatu yang orisinal, bermakna, bermanfaat, dan berdampak.' },
];

const DEFAULT_MODELS: ModelPembelajaranItem[] = [
  {
    id: 'mod_pbl',
    nama: 'Problem Based Learning (PBL) Berbasis Cinta',
    sintaks: [
      'Orientasi Masalah Penuh Empati',
      'Organisasi Belajar dengan Kasih Sayang',
      'Penyelidikan Kolaboratif Menghargai Keragaman',
      'Pengembangan & Penyajian Karya Apresiatif',
      'Refleksi & Evaluasi Berhikmah',
    ],
    deskripsi: 'Pembelajaran berbasis pemecahan masalah autentik yang disikapi dengan empati dan kepedulian sosial.',
  },
  {
    id: 'mod_pjbl',
    nama: 'Project Based Learning (PjBL) Bernuansa Kasih Sayang',
    sintaks: [
      'Menentukan Pertanyaan Mendasar Berorientasi Kebaikan',
      'Mendesain Perencanaan Proyek Gotong Royong',
      'Menyusun Jadwal Bersama yang Realistis',
      'Memonitor Kemajuan dengan Bimbingan Ramah',
      'Menguji Hasil & Asesmen Apresiatif',
      'Mengevaluasi Pengalaman & Rasa Syukur',
    ],
    deskripsi: 'Pembelajaran berbasis proyek nyata yang melatih siswa menghasilkan karya kebermanfaatan bagi sesama.',
  },
  {
    id: 'mod_inquiry',
    nama: 'Inquiry / Discovery Learning Reflektif',
    sintaks: [
      'Stimulasi & Keajaiban Ciptaan Allah',
      'Identifikasi Masalah & Rasa Ingin Tahu',
      'Pengumpulan Data dengan Kejujuran',
      'Pengolahan Data & Diskusi Empatis',
      'Pembuktian & Penemuan Makna',
      'Menarik Kesimpulan & Hikmah',
    ],
    deskripsi: 'Menumbuhkan rasa cinta ilmu pengetahuan melalui penemuan konsep secara mandiri dan menggembirakan.',
  },
  {
    id: 'mod_coop',
    nama: 'Cooperative Learning Empatik',
    sintaks: [
      'Menyampaikan Tujuan & Motivasi Cinta Belajar',
      'Menyajikan Informasi Pokok',
      'Mengorganisasikan Kelompok Saling Menguatkan',
      'Membimbing Tim dalam Kerja Sama Damai',
      'Evaluasi & Apresiasi Seluruh Anggota',
      'Pemberian Penghargaan Berbasis Kemajuan',
    ],
    deskripsi: 'Pembelajaran kelompok terstruktur yang mengutamakan saling bantu dan tidak ada siswa tertinggal.',
  },
  {
    id: 'mod_tarl',
    nama: 'Teaching at The Right Level (TaRL) Penuh Perhatian',
    sintaks: [
      'Asesmen Diagnostik Awal Kesiapan Belajar',
      'Pengelompokan Fleksibel Sesuai Kebutuhan Anak',
      'Intervensi Pembelajaran Berdiferensiasi Lembut',
      'Asesmen Formatif Berkelanjutan',
      'Pendampingan Khusus Penuh Kesabaran',
    ],
    deskripsi: 'Menyesuaikan pembelajaran dengan tingkat capaian murid sebenarnya tanpa labeling negatif.',
  },
];

const DEFAULT_METODE: MetodePembelajaranItem[] = [
  { id: 'met_1', nama: 'Dialog & Tanya Jawab Kasih Sayang', deskripsi: 'Komunikasi interaktif guru-murid yang menghargai setiap respons murid.' },
  { id: 'met_2', nama: 'Kisah Inspiratif & Keteladanan Islami', deskripsi: 'Penyampaian sirah nabawiyah, kisah sahabat, dan tokoh teladan yang menggetarkan hati.' },
  { id: 'met_3', nama: 'Eksplorasi & Percobaan Ramah Anak', deskripsi: 'Praktik langsung mengamati fenomena alam sekitar madrasah.' },
  { id: 'met_4', nama: 'Bermain Peran (Role Playing) Empatik', deskripsi: 'Memerankan situasi sosial untuk melatih kepekaan rasa dan empati.' },
  { id: 'met_5', nama: 'Praktik Ibadah & Pembiasaan Beradab', deskripsi: 'Latihan thaharah, wudhu, shalat, dan adab harian dengan bimbingan penuh kasih.' },
  { id: 'met_6', nama: 'Diskusi Kelompok Kecil Saling Menghargai', deskripsi: 'Saling bertukar ide dengan aturan tidak boleh memotong atau meremehkan pendapat kawan.' },
  { id: 'met_7', nama: 'Mind Mapping & Visualisasi Kreatif', deskripsi: 'Menggambar peta konsep materi secara visual dan menyenangkan.' },
];

const DEFAULT_ASESMEN: JenisAsesmenItem[] = [
  {
    id: 'as_1',
    nama: 'Asesmen Awal (Diagnostik Emosi & Kesiapan)',
    teknik: ['Pertanyaan Pemantik Ramah', 'Emoticon Perasaan Hari Ini', 'Kuis Ringan Menyenangkan'],
    deskripsi: 'Memetakan kondisi emosional dan kesiapan materi sebelum memulai pembelajaran.',
  },
  {
    id: 'as_2',
    nama: 'Asesmen Formatif (Observasi Kasih & Penilaian Diri)',
    teknik: ['Lembar Observasi Empati', 'Penilaian Antar Teman Apresiatif', 'Catatan Anekdot Positif Guru'],
    deskripsi: 'Asesmen selama proses belajar untuk memberikan umpan balik memotivasi tanpa menghakimi.',
  },
  {
    id: 'as_3',
    nama: 'Asesmen Sumatif (Unjuk Kerja & Portofolio Karya)',
    teknik: ['Presentasi Karya Penuh Percaya Diri', 'Portofolio Lembar Kerja Kasih', 'Tes Tertulis Berpikir Kritis'],
    deskripsi: 'Penilaian akhir materi yang membuktikan pemahaman bermakna dan keterampilan nyata.',
  },
];

// Sample Initial Users
const initialSuperAdmin: User = {
  id: 'usr_superadmin',
  name: 'Super Administrator MIN 1 Paser',
  username: 'admin',
  email: 'minegeripaser@gmail.com',
  role: 'SUPER_ADMIN',
  status: 'AKTIF',
  lastLogin: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const initialGuest: User = {
  id: 'usr_guest',
  name: 'Guru Tamu / Pendidik MI',
  username: 'guest',
  email: 'tamu@min1paser.sch.id',
  role: 'GUEST',
  status: 'AKTIF',
  lastLogin: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Initial Sample RPPs
const initialRpp1: RPPDocument = {
  id: 'rpp_ipas_fase_c_01',
  nomorRpp: 'RPP-KBC/MIN1PSR/IPAS-VI/2026/001',
  judul: 'Keanekaragaman Hayati Ciptaan Allah dan Ekosistem Hutan Paser',
  jenjang: 'MI',
  fase: 'C',
  kelas: 'VI',
  semester: '1 (Ganjil)',
  mataPelajaranId: 'sub_ipas',
  mataPelajaranNama: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
  mataPelajaranKelompok: 'KELOMPOK B',
  alokasiWaktu: '2 x 35 Menit (Pertemuan 1)',
  tahunPelajaran: '2026/2027',
  pertemuanKe: 1,

  capaianPembelajaran: 'Pada Fase C, peserta didik memahami sistem organ tubuh manusia dan hubungannya dengan cara memelihara kesehatan; memahami keterkaitan ekosistem dan upaya pelestarian lingkungan hidup ciptaan Allah SWT secara arif dan bijaksana.',
  tujuanPembelajaran: [
    'Menjelaskan komponen rantai makanan dan jaring-jaring makanan pada ekosistem hutan tropis Kalimantan Timur dengan benar.',
    'Menunjukkan rasa syukur dan cinta atas kekayaan alam ciptaan Allah SWT melalui tindakan merawat tanaman di sekitar madrasah.',
    'Bekerja sama dalam kelompok kecil secara empati untuk memecahkan masalah keseimbangan ekosistem.',
  ],
  materiPokok: 'Hubungan Antarmakhluk Hidup dalam Ekosistem dan Kepedulian Ekologis Berbasis Kasih',
  kataKunci: ['Ekosistem', 'Jaring Makanan', 'Cinta Lingkungan', 'Hutan Paser', 'Rasa Syukur'],

  pancaCinta: ['Cinta Allah SWT & Rasulullah SAW', 'Cinta Lingkungan & Alam Sekitar', 'Cinta Diri Sendiri & Sesama Manusia'],
  dimensiProfilLulusan: ['Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia', 'Bergotong Royong & Empati', 'Bernalar Kritis & Reflektif'],
  targetKarakterCinta: 'Tumbuhnya kesadaran spiritual bahwa setiap makhluk hidup di bumi diciptakan Allah dengan keterikatan kasih, sehingga wajib dijaga kelestariannya.',

  modelPembelajaran: 'Problem Based Learning (PBL) Berbasis Cinta',
  metodePembelajaran: ['Eksplorasi & Percobaan Ramah Anak', 'Diskusi Kelompok Kecil Saling Menghargai', 'Dialog & Tanya Jawab Kasih Sayang'],
  mediaSumberBelajar: [
    'Gambar & Video Ekosistem Hutan Hujan Tropis Paser Kaltim',
    'Lembar Kerja Kasih (LKK) Berwarna',
    'Taman Belajar Ramah Anak MIN 1 Paser',
    'Buku Guru & Siswa IPAS Kelas VI Kurikulum Merdeka KBC 2026',
  ],

  kegiatanAwal: {
    durasi: '10 Menit',
    salamDanDoa: 'Guru menyapa peserta didik dengan senyuman hangat, salam Islami penuh doa rahmat, lalu berdoa bersama memohon ilmu bermanfaat.',
    apersepsiCinta: 'Guru menanyakan kabar emosi murid hari ini ("Siapa yang pagi ini merasa bahagia?"). Mengaitkan udara sejuk pagi di Tanah Grogot dengan nikmat oksigen dari pepohonan ciptaan Allah.',
    tujuanDanMotivasi: 'Menyampaikan tujuan pembelajaran dan memotivasi murid bahwa menjaga bumi adalah wujud cinta seorang mukmin sejati.',
  },
  kegiatanInti: {
    durasi: '50 Menit',
    eksplorasiKasih: 'Murid menyimak cuplikan video keindahan hutan Paser. Guru membimbing murid merenungi betapa harmonisnya hewan dan tumbuhan saling berbagi dalam kasih sayang Sang Pencipta.',
    kolaborasiEmpati: 'Siswa dibagi menjadi kelompok beranggotakan 4-5 anak. Masing-masing kelompok menyusun rantai makanan. Siswa saling menghargai pendapat dan berbagi tugas tanpa ada yang mendominasi.',
    internalisasiNilai: 'Diskusi reflektif mengenai dampak jika satu makhluk hidup punah akibat perburuan liar atau pencemaran. Siswa menyimpulkan pentingnya sikap tidak serakah.',
    sintaksDetail: 'Fase 1: Orientasi masalah berkurangnya populasi burung enggang di hutan. Fase 2: Pembagian peran tim. Fase 3: Analisis jaring makanan pada LKK. Fase 4: Presentasi kelompok dengan saling memberi apresiasi bintang cinta. Fase 5: Evaluasi dan konfirmasi konsep oleh guru.',
  },
  kegiatanPenutup: {
    durasi: '10 Menit',
    refleksiCinta: 'Murid menuliskan satu kalimat refleksi: "Hikmah cinta apa yang kudapatkan hari ini untuk menjaga alam ciptaan Allah?"',
    umpanBalikApresiatif: 'Guru memberikan apresiasi spesifik kepada semua kelompok atas kekompakan, kerja sama empati, dan kesantunan mereka.',
    doaDanTindakLanjut: 'Tindak lanjut: Menanam satu bibit pohon mini atau merawat tanaman madrasah bersama. Menutup dengan doa kafaratul majelis dan salam perpisahan santun.',
  },

  asesmenAwal: 'Tanya jawab santun tentang rantai makanan yang pernah dilihat di sekitar rumah dan cek kartu suasana hati murid.',
  asesmenFormatif: 'Observasi sikap gotong royong dan empati saat kerja kelompok menggunakan Lembar Observasi Karakter Cinta KBC.',
  asesmenSumatif: 'Karya poster/jaring-jaring makanan ekosistem hutan lokal dengan rubrik kebenaran konsep, estetika, dan pesan cinta lingkungan.',
  rubrikPenilaian: 'Kriteria Sangat Baik (4): Memenuhi 4 indikator rantai makanan lengkap, narasi cinta alam jelas, kerja sama harmonis. Baik (3): Memenuhi 3 indikator. Cukup (2): Memenuhi 2 indikator. Perlu Bimbingan (1): Dibimbing dengan penuh kesabaran.',
  remedialPengayaan: 'Remedial: Pendampingan personal terbimbing dengan media kartu gambar berantai. Pengayaan: Meneliti ekosistem mangrove di perairan Paser.',

  createdBy: 'usr_superadmin',
  creatorName: 'Super Administrator MIN 1 Paser',
  creatorRole: 'SUPER_ADMIN',
  status: 'SELESAI',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const initialRpp2: RPPDocument = {
  id: 'rpp_qh_fase_b_01',
  nomorRpp: 'RPP-KBC/MIN1PSR/QH-IV/2026/002',
  judul: 'Menebar Cinta Kasih Melalui Hadis Menyayangi Anak Yatim',
  jenjang: 'MI',
  fase: 'B',
  kelas: 'IV',
  semester: '1 (Ganjil)',
  mataPelajaranId: 'sub_qh',
  mataPelajaranNama: "Al-Qur'an Hadis",
  mataPelajaranKelompok: 'KELOMPOK A',
  alokasiWaktu: '2 x 35 Menit (Pertemuan 1)',
  tahunPelajaran: '2026/2027',
  pertemuanKe: 1,

  capaianPembelajaran: "Pada Fase B, peserta didik mampu membaca, menghafal, memahami makna dan hikmah surat-surat pendek serta hadis tentang menyayangi sesama dan mengamalkannya dalam kehidupan sehari-hari sebagai bukti ketaatan kepada Allah dan Rasul-Nya.",
  tujuanPembelajaran: [
    'Membaca teks hadis tentang menyayangi anak yatim dengan makharijul huruf yang baik dan benar.',
    'Menerjemahkan dan memahami pesan kasih sayang Rasulullah SAW kepada anak yatim.',
    'Menunjukkan perilaku peduli, ramah, dan tidak membeda-bedakan kawan dalam interaksi di madrasah.',
  ],
  materiPokok: 'Hadis Menyayangi Anak Yatim dan Pengamalan Kasih Sayang Antar Sesama',
  kataKunci: ['Hadis', 'Anak Yatim', 'Kasih Sayang', 'Ketauladanan Rasulullah', 'MIN 1 Paser'],

  pancaCinta: ['Cinta Allah SWT & Rasulullah SAW', 'Cinta Diri Sendiri & Sesama Manusia'],
  dimensiProfilLulusan: ['Beriman, Bertakwa kepada Tuhan YME, dan Berakhlak Mulia', 'Bergotong Royong & Empati'],
  targetKarakterCinta: 'Menghadirkan kelembutan hati peserta didik dalam memuliakan anak yatim dan teman sebaya sebagaimana ajaran Rasulullah SAW.',

  modelPembelajaran: 'Discovery / Inquiry Learning Reflektif',
  metodePembelajaran: ['Kisah Inspiratif & Keteladanan Islami', 'Dialog & Tanya Jawab Kasih Sayang', 'Bermain Peran (Role Playing) Empatik'],
  mediaSumberBelajar: [
    'Kartu Potongan Teks Hadis Bergambar',
    'Audio Pelafalan Hadis Merdu',
    'Buku Al-Quran Hadis MI Kelas IV Kemenag RI 2026',
  ],

  kegiatanAwal: {
    durasi: '10 Menit',
    salamDanDoa: 'Menyapa siswa dengan penuh kehangatan, membaca basmalah dan doa thalabul ilmi dengan khusyuk.',
    apersepsiCinta: 'Menampilkan gambar Rasulullah SAW bersama anak yatim di hari raya. Guru mengajak murid merasakan getaran kasih sayang kenabian.',
    tujuanDanMotivasi: 'Menyampaikan betapa dekatnya kedudukan orang yang menyayangi anak yatim dengan Rasulullah di surga bagaikan dua jari berdampingan.',
  },
  kegiatanInti: {
    durasi: '50 Menit',
    eksplorasiKasih: 'Siswa mendengarkan lafal hadis, membaca bergantian dengan bimbingan lembut guru, dan menemukan makna kosakata kunci.',
    kolaborasiEmpati: 'Murid menyusun puzzle potongan teks hadis dan maknanya bersama teman sebangku dengan saling membantu.',
    internalisasiNilai: 'Diskusi tentang cara nyata menyayangi sesama di lingkungan madrasah MIN 1 Paser (berbagi bekal, tidak mengejek, bersikap ramah).',
    sintaksDetail: 'Stimulasi audio hadis -> Identifikasi potongan kata -> Penggabungan arti -> Presentasi berpasangan -> Refleksi keteladanan.',
  },
  kegiatanPenutup: {
    durasi: '10 Menit',
    refleksiCinta: 'Setiap anak merenungkan: "Kebaikan apa yang akan kupersembahkan untuk kawanku hari ini?"',
    umpanBalikApresiatif: 'Guru memuji kesungguhan dan pelafalan setiap murid, memberikan motivasi bahwa setiap huruf Al-Quran & Hadis bernilai pahala.',
    doaDanTindakLanjut: 'Membaca doa penutup majelis dan saling berjabat tangan dengan santun.',
  },

  asesmenAwal: 'Pengecekan kemampuan membaca ayat/hadis pendek dan keterbukaan hati siswa.',
  asesmenFormatif: 'Observasi kesantunan membaca dan kekompakan bekerja sama dengan teman.',
  asesmenSumatif: 'Uji hafalan hadis beserta terjemah dan lembar komitmen kasih sayang harian.',
  rubrikPenilaian: 'Kategori Mahir: Bacaan tartil, terjemah tepat, komitmen perilaku terisi. Berkembang: Bacaan lancar, terjemah cukup tepat.',
  remedialPengayaan: 'Remedial: Bimbingan tahsin berulang secara privat dengan penuh kasih sayang. Pengayaan: Menghafal asbabun nuzul/wurud hadis.',

  createdBy: 'usr_guest',
  creatorName: 'Guru Tamu / Pendidik MI',
  creatorRole: 'GUEST',
  status: 'SELESAI',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface StoreData {
  users: (User & { passwordHash: string })[];
  subjects: Subject[];
  schoolIdentity: SchoolIdentity;
  phases: PhaseMaster[];
  pancaCinta: PancaCintaItem[];
  dimensiProfil: DimensiProfilItem[];
  models: ModelPembelajaranItem[];
  metode: MetodePembelajaranItem[];
  asesmen: JenisAsesmenItem[];
  rpps: RPPDocument[];
  materiAjar: MateriAjar[];
  auditLogs: AuditLog[];
}

const initialMateri1: MateriAjar = {
  id: 'mat_ipas_01',
  judul: 'Harmoni Ekosistem Hutan Paser: Rantai Makanan & Wujud Kasih Sayang Lingkungan',
  mataPelajaranId: 'sub_ipas',
  mataPelajaranNama: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)',
  mataPelajaranKelompok: 'KELOMPOK B',
  fase: 'C',
  kelas: 'VI',
  semester: '1 (Ganjil)',
  topikUtama: 'Rantai Makanan & Keseimbangan Ekosistem Hutan Tropis',
  pancaCinta: ['Cinta Allah SWT & Rasulullah SAW', 'Cinta Lingkungan & Alam Sekitar', 'Cinta Diri Sendiri & Sesama Manusia'],
  pengantarStimulus: 'Pernahkah Ananda menghirup segarnya udara pagi di Tanah Grogot? Udara sejuk itu adalah bukti kasih sayang Allah SWT melalui rimbunnya dedaunan hutan Kabupaten Paser. Setiap helai daun dengan penuh kepatuhan menyerap karbon dioksida dan melepaskan oksigen bersih bagi manusia dan hewan.',
  uraianMateri: 'Ekosistem adalah hubungan timbal balik yang harmonis antara makhluk hidup dengan lingkungannya. Dalam rantai makanan, setiap ciptaan Allah memiliki peran mulia:\n1. Produsen: Tumbuhan hijau yang menghasilkan makanan sendiri dengan bantuan sinar matahari.\n2. Konsumen Tingkat I: Hewan herbivora (pemakan tumbuhan) seperti kancil, kijang, dan burung pemakan biji.\n3. Konsumen Tingkat II & III: Pemangsa yang menjaga agar populasi hewan tidak berlebihan.\n4. Pengurai (Dekomposer): Jamur dan bakteri yang mengurai sisa makhluk hidup menjadi humus penyubur tanah.\nKeterikatan ini mengajarkan kita tentang tolong-menolong dan tidak boleh ada sifat serakah yang merusak tatanan alam.',
  aktivitasSiswa: 'Aktivitas Kolaboratif Cinta: Bentuklah kelompok beranggotakan 4 siswa di kelas. Susunlah kartu gambar makhluk hidup hutan Paser menjadi jaring-jaring makanan. Berdiskusilah secara santun tanpa mencela pendapat kawan!',
  hikmahCinta: 'Hikmah Kasih Sayang: Menjaga kelestarian hutan dan kebersihan madrasah MIN 1 Paser adalah wujud syukur kepada Allah SWT dan bentuk cinta kasih kepada generasi masa depan.',
  latihanSoal: '1. Mengapa tumbuhan hijau disebut produsen dalam rantai makanan?\n2. Apa akibatnya jika populasi burung elang di hutan punah karena perburuan liar?\n3. Tuliskan dua tindakan nyata kasih sayang yang dapat Ananda lakukan untuk merawat tanaman di sekitar rumah atau madrasah!',
  glosarium: '• Ekosistem: Sistem hubungan timbal balik antarmakhluk hidup dan lingkungannya.\n• Produsen: Organisme yang mampu menghasilkan makanan sendiri melalui fotosintesis.\n• Dekomposer: Organisme pengurai zat organik dari bangkai makhluk hidup.',
  createdBy: 'usr_superadmin',
  creatorName: 'Super Administrator MIN 1 Paser',
  creatorRole: 'SUPER_ADMIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function loadStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (!Array.isArray(data.materiAjar)) {
        data.materiAjar = [initialMateri1];
      }
      return data;
    }
  } catch (err) {
    console.error('Error loading store, using defaults:', err);
  }

  // Create initial store
  const initialStore: StoreData = {
    users: [
      {
        ...initialSuperAdmin,
        passwordHash: hashPassword('AdminKbc2026!'),
      },
      {
        ...initialGuest,
        passwordHash: hashPassword('Guest2026!'),
      },
    ],
    subjects: DEFAULT_SUBJECTS,
    schoolIdentity: DEFAULT_SCHOOL_IDENTITY,
    phases: DEFAULT_PHASES,
    pancaCinta: DEFAULT_PANCA_CINTA,
    dimensiProfil: DEFAULT_DIMENSI_PROFIL,
    models: DEFAULT_MODELS,
    metode: DEFAULT_METODE,
    asesmen: DEFAULT_ASESMEN,
    rpps: [initialRpp1, initialRpp2],
    materiAjar: [initialMateri1],
    auditLogs: [
      {
        id: 'log_init',
        timestamp: new Date().toISOString(),
        userId: 'usr_superadmin',
        userName: 'Super Administrator MIN 1 Paser',
        userRole: 'SUPER_ADMIN',
        action: 'Inisialisasi Sistem RPP KBC 2026 MIN 1 Paser',
        status: 'SUKSES',
        detail: 'Sistem RPP KBC 2026 berhasil dimuat dengan data master lengkap jenjang MI.',
        ip: '127.0.0.1',
      },
    ],
  };

  saveStore(initialStore);
  return initialStore;
}

function saveStore(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store:', err);
  }
}

let store = loadStore();

function logAudit(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  status: 'SUKSES' | 'GAGAL',
  detail: string,
  ip = '127.0.0.1'
) {
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole,
    action,
    status,
    detail,
    ip,
  };
  store.auditLogs.unshift(newLog);
  // Keep last 500 audit logs
  if (store.auditLogs.length > 500) {
    store.auditLogs = store.auditLogs.slice(0, 500);
  }
  saveStore(store);
}

// -------------------------------------------------------------
// Authentication & RBAC Middleware
// -------------------------------------------------------------
interface AuthenticatedRequest extends Request {
  user?: User;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Akses ditolak. Token autentikasi tidak ditemukan.' });
  }

  const token = authHeader.substring(7).trim();
  const session = activeSessions.get(token);

  if (!session || session.expires < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Sesi telah berakhir atau tidak valid. Silakan login kembali.' });
  }

  const foundUser = store.users.find(u => u.id === session.userId);
  if (!foundUser) {
    return res.status(401).json({ error: 'Pengguna tidak ditemukan.' });
  }

  if (foundUser.status === 'NONAKTIF') {
    return res.status(403).json({ error: 'Pengguna ini telah dinonaktifkan oleh Admin Super.' });
  }

  const { passwordHash: _, ...safeUser } = foundUser;
  req.user = safeUser;
  next();
}

function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Akses ditolak. Fitur ini hanya dapat diakses oleh SUPER_ADMIN.' });
  }
  next();
}

// -------------------------------------------------------------
// Authentication Routes
// -------------------------------------------------------------
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { usernameOrEmail, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username/Email dan kata sandi wajib diisi.' });
  }

  const query = usernameOrEmail.toLowerCase().trim();
  const user = store.users.find(
    u => u.username.toLowerCase() === query || u.email.toLowerCase() === query
  );

  if (!user) {
    logAudit('unknown', usernameOrEmail, 'UNKNOWN', 'Login Pengguna', 'GAGAL', `Upaya login dengan akun '${usernameOrEmail}' gagal: pengguna tidak ditemukan`, ip);
    return res.status(401).json({ error: 'Username atau kata sandi tidak valid.' });
  }

  if (user.status === 'NONAKTIF') {
    logAudit(user.id, user.name, user.role, 'Login Pengguna', 'GAGAL', 'Pengguna dinonaktifkan mencoba login', ip);
    return res.status(403).json({ error: 'Pengguna ini telah dinonaktifkan oleh Admin Super.' });
  }

  const hashed = hashPassword(password);
  if (user.passwordHash !== hashed) {
    logAudit(user.id, user.name, user.role, 'Login Pengguna', 'GAGAL', 'Kata sandi salah', ip);
    return res.status(401).json({ error: 'Username atau kata sandi tidak valid.' });
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  saveStore(store);

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;

  logAudit(user.id, user.name, user.role, 'Login Pengguna', 'SUKSES', `Login berhasil sebagai ${user.role}`, ip);

  res.json({
    token,
    user: safeUser,
    message: `Selamat datang di RPP KBC GENERATOR 2026, ${user.name}!`,
  });
});

app.post('/api/auth/logout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const token = req.headers.authorization?.substring(7).trim();
  if (token) {
    activeSessions.delete(token);
  }
  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Logout Pengguna', 'SUKSES', 'Pengguna logout dari sistem');
  }
  res.json({ success: true, message: 'Berhasil logout.' });
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// -------------------------------------------------------------
// School Identity Routes
// -------------------------------------------------------------
app.get('/api/school-identity', (req: Request, res: Response) => {
  res.json(store.schoolIdentity);
});

app.put('/api/school-identity', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const updated = { ...store.schoolIdentity, ...req.body };
  store.schoolIdentity = updated;
  saveStore(store);
  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Perbarui Identitas Madrasah', 'SUKSES', 'Data identitas MIN 1 Paser berhasil diperbarui');
  }
  res.json({ success: true, data: store.schoolIdentity });
});

// -------------------------------------------------------------
// User Management Routes (Super Admin Only)
// -------------------------------------------------------------
app.get('/api/users/stats', authMiddleware, requireSuperAdmin, (req: Request, res: Response) => {
  const today = new Date().toISOString().slice(0, 10);
  const totalUsers = store.users.length;
  const activeUsers = store.users.filter(u => u.status === 'AKTIF').length;
  const inactiveUsers = store.users.filter(u => u.status === 'NONAKTIF').length;
  const totalSuperAdmin = store.users.filter(u => u.role === 'SUPER_ADMIN').length;
  const totalGuest = store.users.filter(u => u.role === 'GUEST').length;
  
  const loginToday = store.auditLogs.filter(
    l => l.action === 'Login Pengguna' && l.status === 'SUKSES' && l.timestamp.startsWith(today)
  ).length;

  const rppCreatedToday = store.rpps.filter(r => r.createdAt.startsWith(today)).length;

  const stats: UserStats = {
    totalUsers,
    activeUsers,
    inactiveUsers,
    totalSuperAdmin,
    totalGuest,
    loginToday,
    rppCreatedToday,
    totalRpps: store.rpps.length,
  };

  res.json(stats);
});

app.get('/api/users', authMiddleware, requireSuperAdmin, (req: Request, res: Response) => {
  const { search, role, status } = req.query;
  let results = store.users.map(({ passwordHash: _, ...u }) => u);

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    results = results.filter(
      u => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  if (role && typeof role === 'string' && role !== 'ALL') {
    results = results.filter(u => u.role === role);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    results = results.filter(u => u.status === status);
  }

  res.json(results);
});

app.post('/api/users', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { name, username, email, password, confirmPassword, role, status } = req.body;

  if (!name || !username || !email || !password || !confirmPassword || !role || !status) {
    return res.status(400).json({ error: 'Semua field wajib diisi.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Konfirmasi password tidak sesuai.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }

  const normUsername = username.toLowerCase().trim();
  const normEmail = email.toLowerCase().trim();

  if (store.users.some(u => u.username.toLowerCase() === normUsername)) {
    return res.status(400).json({ error: 'Username sudah digunakan.' });
  }

  if (store.users.some(u => u.email.toLowerCase() === normEmail)) {
    return res.status(400).json({ error: 'Email sudah digunakan.' });
  }

  const newUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    username: normUsername,
    email: normEmail,
    passwordHash: hashPassword(password),
    role: role as 'SUPER_ADMIN' | 'GUEST',
    status: status as 'AKTIF' | 'NONAKTIF',
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.users.push(newUser);
  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Membuat Pengguna', 'SUKSES', `Menambahkan pengguna baru: ${newUser.username} (${newUser.role})`);
  }

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json({ success: true, data: safeUser });
});

app.put('/api/users/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, username, email, role, status } = req.body;

  const user = store.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  const normUsername = username ? username.toLowerCase().trim() : user.username;
  const normEmail = email ? email.toLowerCase().trim() : user.email;

  if (normUsername !== user.username && store.users.some(u => u.id !== id && u.username.toLowerCase() === normUsername)) {
    return res.status(400).json({ error: 'Username sudah digunakan.' });
  }

  if (normEmail !== user.email && store.users.some(u => u.id !== id && u.email.toLowerCase() === normEmail)) {
    return res.status(400).json({ error: 'Email sudah digunakan.' });
  }

  // Prevent superadmin from locking out all admins
  if (user.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
    const adminCount = store.users.filter(u => u.role === 'SUPER_ADMIN' && u.status === 'AKTIF').length;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Tidak dapat mengubah peran admin terakhir yang aktif.' });
    }
  }

  user.name = name ? name.trim() : user.name;
  user.username = normUsername;
  user.email = normEmail;
  if (role) user.role = role;
  if (status) user.status = status;
  user.updatedAt = new Date().toISOString();

  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Mengedit Pengguna', 'SUKSES', `Mengubah profil pengguna ${user.username}`);
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

app.post('/api/users/:id/reset-password', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = store.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  // Generate safe temporary password
  const tempPassword = `KbcPaser${Math.floor(1000 + Math.random() * 9000)}!`;
  user.passwordHash = hashPassword(tempPassword);
  user.updatedAt = new Date().toISOString();
  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Reset Password', 'SUKSES', `Mereset kata sandi untuk pengguna ${user.username}`);
  }

  res.json({
    success: true,
    message: 'Kata sandi berhasil direset.',
    temporaryPassword: tempPassword,
    username: user.username,
  });
});

app.patch('/api/users/:id/status', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = store.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  if (user.id === req.user?.id) {
    return res.status(400).json({ error: 'Anda tidak dapat menonaktifkan akun sendiri.' });
  }

  const newStatus = user.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
  user.status = newStatus;
  user.updatedAt = new Date().toISOString();

  // If set to NONAKTIF, invalidate active sessions
  if (newStatus === 'NONAKTIF') {
    for (const [token, session] of activeSessions.entries()) {
      if (session.userId === user.id) {
        activeSessions.delete(token);
      }
    }
  }

  saveStore(store);

  if (req.user) {
    const actionName = newStatus === 'AKTIF' ? 'Mengaktifkan Pengguna' : 'Menonaktifkan Pengguna';
    logAudit(req.user.id, req.user.name, req.user.role, actionName, 'SUKSES', `Status pengguna ${user.username} diubah menjadi ${newStatus}`);
  }

  const { passwordHash: _, ...safeUser } = user;
  res.json({ success: true, data: safeUser });
});

app.delete('/api/users/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const userIndex = store.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  const targetUser = store.users[userIndex];
  if (targetUser.id === req.user?.id) {
    return res.status(400).json({ error: 'Anda tidak dapat menghapus akun sendiri.' });
  }

  // Check if user has RPP documents
  const userRpps = store.rpps.filter(r => r.createdBy === id);
  if (userRpps.length > 0) {
    return res.status(400).json({
      error: 'Pengguna memiliki dokumen RPP. Nonaktifkan pengguna atau arsipkan datanya terlebih dahulu.',
      rppCount: userRpps.length,
    });
  }

  store.users.splice(userIndex, 1);
  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Menghapus Pengguna', 'SUKSES', `Menghapus akun pengguna ${targetUser.username}`);
  }

  res.json({ success: true, message: 'Pengguna berhasil dihapus secara permanen.' });
});

// -------------------------------------------------------------
// Subject (Mata Pelajaran) Management Routes
// -------------------------------------------------------------
app.get('/api/subjects', (req: Request, res: Response) => {
  const { search, kelompok, fase, status } = req.query;
  let list = [...store.subjects];

  if (status && typeof status === 'string' && status !== 'ALL') {
    list = list.filter(s => s.status === status);
  }

  if (kelompok && typeof kelompok === 'string' && kelompok !== 'ALL') {
    list = list.filter(s => s.kelompok === kelompok);
  }

  if (fase && typeof fase === 'string' && fase !== 'ALL') {
    list = list.filter(s => s.fase.includes(fase as 'A' | 'B' | 'C'));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      s => s.nama.toLowerCase().includes(q) || s.kode.toLowerCase().includes(q) || s.deskripsi.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => a.urutan - b.urutan);
  res.json(list);
});

app.post('/api/subjects', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { kode, nama, kelompok, fase, deskripsi, urutan } = req.body;

  if (!kode || !nama || !kelompok) {
    return res.status(400).json({ error: 'Kode, nama mata pelajaran, dan kelompok wajib diisi.' });
  }

  const normKode = kode.trim().toUpperCase();
  if (store.subjects.some(s => s.kode.toUpperCase() === normKode)) {
    return res.status(400).json({ error: `Kode mapel ${normKode} sudah digunakan.` });
  }

  let kelompokLabel = 'Mata Pelajaran Umum';
  if (kelompok === 'KELOMPOK A') kelompokLabel = 'Mata Pelajaran Keagamaan';
  else if (kelompok === 'KELOMPOK C') kelompokLabel = 'Muatan/Kekhasan Madrasah';

  const newSubject: Subject = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    kode: normKode,
    nama: nama.trim(),
    kelompok,
    kelompokLabel,
    jenjang: 'MI',
    fase: Array.isArray(fase) && fase.length > 0 ? fase : ['A', 'B', 'C'],
    status: 'AKTIF',
    urutan: Number(urutan) || (store.subjects.length + 1),
    deskripsi: deskripsi?.trim() || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.subjects.push(newSubject);
  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Tambah Mata Pelajaran', 'SUKSES', `Menambahkan mapel ${newSubject.nama} (${newSubject.kode})`);
  }

  res.status(201).json({ success: true, data: newSubject });
});

app.put('/api/subjects/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { kode, nama, kelompok, fase, status, deskripsi, urutan } = req.body;

  const subject = store.subjects.find(s => s.id === id);
  if (!subject) {
    return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan.' });
  }

  const normKode = kode ? kode.trim().toUpperCase() : subject.kode;
  if (normKode !== subject.kode && store.subjects.some(s => s.id !== id && s.kode.toUpperCase() === normKode)) {
    return res.status(400).json({ error: `Kode mapel ${normKode} sudah digunakan oleh mata pelajaran lain.` });
  }

  if (nama) subject.nama = nama.trim();
  subject.kode = normKode;
  if (kelompok) {
    subject.kelompok = kelompok;
    if (kelompok === 'KELOMPOK A') subject.kelompokLabel = 'Mata Pelajaran Keagamaan';
    else if (kelompok === 'KELOMPOK B') subject.kelompokLabel = 'Mata Pelajaran Umum';
    else subject.kelompokLabel = 'Muatan/Kekhasan Madrasah';
  }
  if (Array.isArray(fase)) subject.fase = fase;
  if (status) subject.status = status;
  if (deskripsi !== undefined) subject.deskripsi = deskripsi.trim();
  if (urutan !== undefined) subject.urutan = Number(urutan);
  subject.updatedAt = new Date().toISOString();

  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Edit Mata Pelajaran', 'SUKSES', `Memperbarui data mapel ${subject.nama}`);
  }

  res.json({ success: true, data: subject });
});

app.patch('/api/subjects/:id/status', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const subject = store.subjects.find(s => s.id === id);
  if (!subject) {
    return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan.' });
  }

  const newStatus = subject.status === 'AKTIF' ? 'NONAKTIF' : 'AKTIF';
  subject.status = newStatus;
  subject.updatedAt = new Date().toISOString();
  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Ubah Status Mapel', 'SUKSES', `Status mapel ${subject.nama} diubah menjadi ${newStatus}`);
  }

  res.json({ success: true, data: subject });
});

app.delete('/api/subjects/:id', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const subjectIndex = store.subjects.findIndex(s => s.id === id);
  if (subjectIndex === -1) {
    return res.status(404).json({ error: 'Mata pelajaran tidak ditemukan.' });
  }

  const targetSubject = store.subjects[subjectIndex];

  // Validation: Jangan menghapus mapel yang sudah digunakan oleh RPP!
  const isUsedInRpp = store.rpps.some(
    r => r.mataPelajaranId === id || r.mataPelajaranNama.toLowerCase() === targetSubject.nama.toLowerCase()
  );

  if (isUsedInRpp) {
    return res.status(400).json({
      error: 'Mapel tidak dapat dihapus karena telah digunakan pada dokumen RPP. Silakan nonaktifkan.',
      canDeactivate: true,
      subjectId: id,
    });
  }

  store.subjects.splice(subjectIndex, 1);
  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Hapus Mata Pelajaran', 'SUKSES', `Mata pelajaran ${targetSubject.nama} dihapus`);
  }

  res.json({ success: true, message: 'Mata pelajaran berhasil dihapus.' });
});

// -------------------------------------------------------------
// Master Data Routes (Dynamic Master Data)
// -------------------------------------------------------------
app.get('/api/master-data', (req: Request, res: Response) => {
  res.json({
    phases: store.phases,
    pancaCinta: store.pancaCinta,
    dimensiProfil: store.dimensiProfil,
    models: store.models,
    metode: store.metode,
    asesmen: store.asesmen,
    schoolIdentity: store.schoolIdentity,
  });
});

app.put('/api/master-data/:category', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { category } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items harus berupa array.' });
  }

  if (category === 'pancaCinta') store.pancaCinta = items;
  else if (category === 'dimensiProfil') store.dimensiProfil = items;
  else if (category === 'models') store.models = items;
  else if (category === 'metode') store.metode = items;
  else if (category === 'asesmen') store.asesmen = items;
  else if (category === 'phases') store.phases = items;
  else {
    return res.status(400).json({ error: 'Kategori master data tidak valid.' });
  }

  saveStore(store);
  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Perbarui Master Data', 'SUKSES', `Memperbarui master data untuk kategori ${category}`);
  }

  res.json({ success: true, message: `Master data ${category} berhasil diperbarui.` });
});

// -------------------------------------------------------------
// RPP Document Routes (Data Isolation RBAC)
// -------------------------------------------------------------
app.get('/api/rpps', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { search, fase, kelas, mapelId, status } = req.query;
  const user = req.user!;

  let list = [...store.rpps];

  // DATA ISOLATION:
  // GUEST can ONLY see their own RPPs
  // SUPER_ADMIN can see ALL RPPs
  if (user.role === 'GUEST') {
    list = list.filter(r => r.createdBy === user.id);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    list = list.filter(r => r.status === status);
  }

  if (fase && typeof fase === 'string' && fase !== 'ALL') {
    list = list.filter(r => r.fase === fase);
  }

  if (kelas && typeof kelas === 'string' && kelas !== 'ALL') {
    list = list.filter(r => r.kelas === kelas);
  }

  if (mapelId && typeof mapelId === 'string' && mapelId !== 'ALL') {
    list = list.filter(r => r.mataPelajaranId === mapelId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      r =>
        r.judul.toLowerCase().includes(q) ||
        r.nomorRpp.toLowerCase().includes(q) ||
        r.mataPelajaranNama.toLowerCase().includes(q) ||
        r.materiPokok.toLowerCase().includes(q) ||
        r.creatorName.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

app.get('/api/rpps/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const rpp = store.rpps.find(r => r.id === id);

  if (!rpp) {
    return res.status(404).json({ error: 'Dokumen RPP tidak ditemukan.' });
  }

  // Data isolation check: Guest cannot view others' RPP
  if (user.role === 'GUEST' && rpp.createdBy !== user.id) {
    return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki izin untuk melihat dokumen RPP ini.' });
  }

  res.json(rpp);
});

app.post('/api/rpps', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const payload = req.body;

  if (!payload.mataPelajaranId || !payload.judul || !payload.fase || !payload.kelas) {
    return res.status(400).json({ error: 'Mata pelajaran, judul RPP, fase, dan kelas wajib dipilih.' });
  }

  const subject = store.subjects.find(s => s.id === payload.mataPelajaranId);
  const mataPelajaranNama = subject ? subject.nama : (payload.mataPelajaranNama || 'Mata Pelajaran MI');
  const mataPelajaranKelompok = subject ? subject.kelompok : (payload.mataPelajaranKelompok || 'KELOMPOK B');

  const count = store.rpps.length + 1;
  const pad = String(count).padStart(3, '0');
  const nomorRpp = payload.nomorRpp || `RPP-KBC/MIN1PSR/${payload.kelas}-${subject?.kode || 'MI'}/2026/${pad}`;

  const newRpp: RPPDocument = {
    id: `rpp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    nomorRpp,
    judul: payload.judul.trim(),
    jenjang: 'MI',
    fase: payload.fase,
    kelas: payload.kelas,
    semester: payload.semester || '1 (Ganjil)',
    mataPelajaranId: payload.mataPelajaranId,
    mataPelajaranNama,
    mataPelajaranKelompok,
    alokasiWaktu: payload.alokasiWaktu || '2 x 35 Menit (Pertemuan 1)',
    tahunPelajaran: store.schoolIdentity.tahunPelajaran,
    pertemuanKe: Number(payload.pertemuanKe) || 1,

    capaianPembelajaran: payload.capaianPembelajaran || '',
    tujuanPembelajaran: Array.isArray(payload.tujuanPembelajaran) ? payload.tujuanPembelajaran : [],
    materiPokok: payload.materiPokok || '',
    kataKunci: Array.isArray(payload.kataKunci) ? payload.kataKunci : [],

    pancaCinta: Array.isArray(payload.pancaCinta) ? payload.pancaCinta : [],
    dimensiProfilLulusan: Array.isArray(payload.dimensiProfilLulusan) ? payload.dimensiProfilLulusan : [],
    targetKarakterCinta: payload.targetKarakterCinta || '',

    modelPembelajaran: payload.modelPembelajaran || 'Problem Based Learning (PBL) Berbasis Cinta',
    metodePembelajaran: Array.isArray(payload.metodePembelajaran) ? payload.metodePembelajaran : [],
    mediaSumberBelajar: Array.isArray(payload.mediaSumberBelajar) ? payload.mediaSumberBelajar : [],

    kegiatanAwal: payload.kegiatanAwal || {
      durasi: '10 Menit',
      salamDanDoa: 'Menyapa siswa dengan salam Islami hangat, memimpin doa belajar thalabul ilmi dengan khusyuk.',
      apersepsiCinta: 'Menanyakan kabar hati dan perasaan murid, mengaitkan materi dengan kasih sayang Allah SWT.',
      tujuanDanMotivasi: 'Menyampaikan tujuan pembelajaran dan memotivasi murid bersemangat dalam kebaikan.',
    },
    kegiatanInti: payload.kegiatanInti || {
      durasi: '50 Menit',
      eksplorasiKasih: 'Eksplorasi materi pelajaran yang dihubungkan dengan kebesaran ciptaan Allah SWT.',
      kolaborasiEmpati: 'Kerja kelompok damai dan tolong-menolong tanpa membeda-bedakan.',
      internalisasiNilai: 'Menemukan hikmah kasih sayang dan penerapan nilai dalam kehidupan sehari-hari.',
      sintaksDetail: 'Langkah pembelajaran sesuai sintaks model KBC.',
    },
    kegiatanPenutup: payload.kegiatanPenutup || {
      durasi: '10 Menit',
      refleksiCinta: 'Refleksi pesan cinta dan hikmah yang dipelajari murid hari ini.',
      umpanBalikApresiatif: 'Memberikan pujian dan apresiasi penuh kasih atas kesungguhan belajar siswa.',
      doaDanTindakLanjut: 'Doa penutup majelis dan salam perpisahan penuh kesantunan.',
    },

    asesmenAwal: payload.asesmenAwal || 'Observasi kesiapan belajar dan sapaan emosi.',
    asesmenFormatif: payload.asesmenFormatif || 'Observasi sikap gotong royong dan keaktifan santun saat belajar.',
    asesmenSumatif: payload.asesmenSumatif || 'Evaluasi pemahaman materi dan rubrik unjuk kerja.',
    rubrikPenilaian: payload.rubrikPenilaian || 'Rubrik penilaian 4 skala (Sangat Baik, Baik, Cukup, Perlu Bimbingan).',
    remedialPengayaan: payload.remedialPengayaan || 'Bimbingan personal penuh kesabaran untuk remedial, pengayaan mandiri.',

    createdBy: user.id,
    creatorName: user.name,
    creatorRole: user.role,
    status: payload.status || 'SELESAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.rpps.unshift(newRpp);
  saveStore(store);

  logAudit(user.id, user.name, user.role, 'Membuat RPP', 'SUKSES', `Membuat dokumen RPP ${newRpp.nomorRpp} - ${newRpp.judul}`);

  res.status(201).json({ success: true, data: newRpp });
});

app.put('/api/rpps/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const rpp = store.rpps.find(r => r.id === id);

  if (!rpp) {
    return res.status(404).json({ error: 'Dokumen RPP tidak ditemukan.' });
  }

  // Permission check
  if (user.role === 'GUEST' && rpp.createdBy !== user.id) {
    return res.status(403).json({ error: 'Akses ditolak. Anda hanya dapat mengubah RPP milik Anda sendiri.' });
  }

  const payload = req.body;
  if (payload.mataPelajaranId && payload.mataPelajaranId !== rpp.mataPelajaranId) {
    const subject = store.subjects.find(s => s.id === payload.mataPelajaranId);
    if (subject) {
      rpp.mataPelajaranId = subject.id;
      rpp.mataPelajaranNama = subject.nama;
      rpp.mataPelajaranKelompok = subject.kelompok;
    }
  }

  Object.assign(rpp, payload, {
    id: rpp.id,
    createdBy: rpp.createdBy,
    creatorName: rpp.creatorName,
    creatorRole: rpp.creatorRole,
    updatedAt: new Date().toISOString(),
  });

  saveStore(store);

  logAudit(user.id, user.name, user.role, 'Mengedit RPP', 'SUKSES', `Memperbarui dokumen RPP ${rpp.nomorRpp}`);

  res.json({ success: true, data: rpp });
});

app.delete('/api/rpps/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const rppIndex = store.rpps.findIndex(r => r.id === id);

  if (rppIndex === -1) {
    return res.status(404).json({ error: 'Dokumen RPP tidak ditemukan.' });
  }

  const rpp = store.rpps[rppIndex];
  if (user.role === 'GUEST' && rpp.createdBy !== user.id) {
    return res.status(403).json({ error: 'Akses ditolak. Anda hanya dapat menghapus RPP milik Anda sendiri.' });
  }

  store.rpps.splice(rppIndex, 1);
  saveStore(store);

  logAudit(user.id, user.name, user.role, 'Menghapus RPP', 'SUKSES', `Menghapus dokumen RPP ${rpp.nomorRpp} - ${rpp.judul}`);

  res.json({ success: true, message: 'Dokumen RPP berhasil dihapus.' });
});

// -------------------------------------------------------------
// Materi Ajar Routes (Input Manual & AI Generator)
// -------------------------------------------------------------
app.get('/api/materi-ajar', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { search, fase, kelas, mapelId } = req.query;
  const user = req.user!;
  let list = [...(store.materiAjar || [])];

  // RBAC data isolation
  if (user.role === 'GUEST') {
    list = list.filter(m => m.createdBy === user.id);
  }

  if (fase && typeof fase === 'string' && fase !== 'ALL') {
    list = list.filter(m => m.fase === fase);
  }

  if (kelas && typeof kelas === 'string' && kelas !== 'ALL') {
    list = list.filter(m => m.kelas === kelas);
  }

  if (mapelId && typeof mapelId === 'string' && mapelId !== 'ALL') {
    list = list.filter(m => m.mataPelajaranId === mapelId);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      m =>
        m.judul.toLowerCase().includes(q) ||
        m.topikUtama.toLowerCase().includes(q) ||
        m.mataPelajaranNama.toLowerCase().includes(q) ||
        m.uraianMateri.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(list);
});

app.get('/api/materi-ajar/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const materi = (store.materiAjar || []).find(m => m.id === id);

  if (!materi) {
    return res.status(404).json({ error: 'Materi ajar tidak ditemukan.' });
  }

  if (user.role === 'GUEST' && materi.createdBy !== user.id) {
    return res.status(403).json({ error: 'Akses ditolak. Anda tidak memiliki izin melihat materi ajar ini.' });
  }

  res.json(materi);
});

app.post('/api/materi-ajar', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const payload = req.body;

  if (!payload.judul || !payload.mataPelajaranId || !payload.topikUtama) {
    return res.status(400).json({ error: 'Judul materi, mata pelajaran, dan topik utama wajib diisi.' });
  }

  const subject = store.subjects.find(s => s.id === payload.mataPelajaranId);
  const mataPelajaranNama = subject ? subject.nama : (payload.mataPelajaranNama || 'Mata Pelajaran MI');
  const mataPelajaranKelompok = subject ? subject.kelompok : (payload.mataPelajaranKelompok || 'KELOMPOK B');

  const newMateri: MateriAjar = {
    id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    judul: payload.judul.trim(),
    mataPelajaranId: payload.mataPelajaranId,
    mataPelajaranNama,
    mataPelajaranKelompok,
    fase: payload.fase || 'C',
    kelas: payload.kelas || 'VI',
    semester: payload.semester || '1 (Ganjil)',
    topikUtama: payload.topikUtama.trim(),
    pancaCinta: Array.isArray(payload.pancaCinta) ? payload.pancaCinta : ['Cinta Allah SWT & Rasulullah SAW'],
    pengantarStimulus: payload.pengantarStimulus || '',
    uraianMateri: payload.uraianMateri || '',
    aktivitasSiswa: payload.aktivitasSiswa || '',
    hikmahCinta: payload.hikmahCinta || '',
    latihanSoal: payload.latihanSoal || '',
    glosarium: payload.glosarium || '',
    createdBy: user.id,
    creatorName: user.name,
    creatorRole: user.role,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!Array.isArray(store.materiAjar)) store.materiAjar = [];
  store.materiAjar.unshift(newMateri);
  saveStore(store);

  logAudit(user.id, user.name, user.role, 'Membuat Materi Ajar', 'SUKSES', `Menyusun materi ajar: ${newMateri.judul}`);

  res.status(201).json({ success: true, data: newMateri });
});

app.put('/api/materi-ajar/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const materi = (store.materiAjar || []).find(m => m.id === id);

  if (!materi) {
    return res.status(404).json({ error: 'Materi ajar tidak ditemukan.' });
  }

  if (user.role === 'GUEST' && materi.createdBy !== user.id) {
    return res.status(403).json({ error: 'Akses ditolak. Anda hanya dapat mengubah materi ajar milik sendiri.' });
  }

  const payload = req.body;
  if (payload.mataPelajaranId && payload.mataPelajaranId !== materi.mataPelajaranId) {
    const subject = store.subjects.find(s => s.id === payload.mataPelajaranId);
    if (subject) {
      materi.mataPelajaranId = subject.id;
      materi.mataPelajaranNama = subject.nama;
      materi.mataPelajaranKelompok = subject.kelompok;
    }
  }

  Object.assign(materi, payload, {
    id: materi.id,
    createdBy: materi.createdBy,
    creatorName: materi.creatorName,
    creatorRole: materi.creatorRole,
    updatedAt: new Date().toISOString(),
  });

  saveStore(store);
  logAudit(user.id, user.name, user.role, 'Mengedit Materi Ajar', 'SUKSES', `Memperbarui materi ajar: ${materi.judul}`);

  res.json({ success: true, data: materi });
});

app.delete('/api/materi-ajar/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const idx = (store.materiAjar || []).findIndex(m => m.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Materi ajar tidak ditemukan.' });
  }

  const materi = store.materiAjar[idx];
  if (user.role === 'GUEST' && materi.createdBy !== user.id) {
    return res.status(403).json({ error: 'Akses ditolak. Anda hanya dapat menghapus materi ajar milik sendiri.' });
  }

  store.materiAjar.splice(idx, 1);
  saveStore(store);
  logAudit(user.id, user.name, user.role, 'Menghapus Materi Ajar', 'SUKSES', `Menghapus materi ajar: ${materi.judul}`);

  res.json({ success: true, message: 'Materi ajar berhasil dihapus.' });
});

app.post('/api/ai/generate-materi-ajar', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { mataPelajaranNama, fase, kelas, topikUtama, pancaCintaPilihan, gayaPenyampaian } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah ahli pengembang bahan ajar Kurikulum Berbasis Cinta (KBC) 2026 untuk Madrasah Ibtidaiyah (MI) MIN 1 Paser Kalimantan Timur.
Susunlah MATERI AJAR lengkap, mendalam, ramah anak, dan menggetarkan hati untuk siswa MI dengan spesifikasi:
- Madrasah: MIN 1 Paser (Tanah Grogot, Kab. Paser, Kaltim)
- Mata Pelajaran: ${mataPelajaranNama || 'Mata Pelajaran MI'}
- Jenjang: Madrasah Ibtidaiyah (MI)
- Fase: ${fase || 'C'}
- Kelas: ${kelas || 'VI'}
- Topik Utama: ${topikUtama || 'Materi Inti'}
- Gaya Penyampaian: ${gayaPenyampaian || 'Bercerita, Menyenangkan, Berhikmah, Penuh Kasih'}
- Pilar Panca Cinta yang Ditumbuhkan: ${Array.isArray(pancaCintaPilihan) ? pancaCintaPilihan.join(', ') : 'Cinta Allah SWT & Rasulullah SAW, Cinta Diri & Sesama'}

Format output harus berupa JSON valid tanpa markdown codeblocks dengan kunci:
{
  "judul": "Judul Menarik & Edukatif Bernuansa Cinta",
  "pengantarStimulus": "Kisah pemantik inspiratif atau stimulus kontekstual alam/budaya Paser (1-2 paragraf) yang membuka hati murid",
  "uraianMateri": "Penjelasan konsep secara jelas, terstruktur dalam 3-4 sub-bagian bernomor, dilengkapi contoh nyata kontekstual dan pesan syukur atas keagungan ciptaan Allah SWT",
  "aktivitasSiswa": "Aktivitas belajar kelompok/eksplorasi yang melatih kolaborasi empati, gotong royong, dan kesantunan bertutur kata",
  "hikmahCinta": "Refleksi nilai kasih sayang dan tindakan nyata yang dapat diamalkan di madrasah dan keluarga",
  "latihanSoal": "3 butir pertanyaan pemantik berpikir kritis dan aplikatif",
  "glosarium": "3-4 kosakata kunci beserta definisi mudah dipahami anak MI"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return res.json({ success: true, source: 'gemini-ai', data: parsed });
    } catch (aiErr) {
      console.warn('Gemini AI generate-materi-ajar fallback triggered:', aiErr);
    }
  }

  // Curated Fallback Engine for MIN 1 Paser
  const fallbackData = {
    judul: `${topikUtama || 'Pembelajaran Bermakna'}: Harmoni Ilmu dan Kasih Sayang Allah`,
    pengantarStimulus: `Pernahkah Ananda merenungkan bagaimana alam semesta dan ilmu pengetahuan diciptakan Allah SWT dengan begitu sempurna? Di bumi Paser yang asri, pepohonan rindang dan kicauan burung menyambut mentari pagi dengan rasa syukur. Melalui pembelajaran ${mataPelajaranNama || 'hari ini'}, kita diajak membuka mata dan hati untuk menemukan bukti kasih sayang Sang Maha Pengasih.`,
    uraianMateri: `1. Memahami Konsep ${topikUtama || 'Dasar'}\nSetiap konsep dalam ${mataPelajaranNama || 'pelajaran ini'} memiliki keteraturan yang luar biasa. Allah SWT tidak menciptakan sesuatu secara kebetulan, melainkan dengan ukuran dan hikmah yang tepat.\n\n2. Keterkaitan dengan Kehidupan Nyata di Madrasah\nKetika kita mempelajari ${topikUtama || 'materi ini'}, kita belajar untuk bersikap teliti, sabar, dan jujur. Ilmu yang bermanfaat adalah ilmu yang mendatangkan ketenangan hati dan kebaikan bagi orang lain di sekitar kita.\n\n3. Meneladani Akhlak Mulia\nRasulullah SAW mengajarkan kita untuk menuntut ilmu dengan niat ikhlas dan mengajarkannya dengan kelembutan. Tidak boleh ada rasa sombong ketika kita menguasai pelajaran.`,
    aktivitasSiswa: `Aktivitas Belajar Sahabat Cinta: Duduklah bersama teman sebangku. Pilihlah satu pertanyaan menarik tentang ${topikUtama || 'materi ini'}, lalu diskusikan jawabannya secara bergantian. Berikan senyuman dan ucapan terima kasih atas kerja sama kawanmu!`,
    hikmahCinta: `Hikmah KBC: "Barangsiapa menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan menuju surga." Mengamalkan ilmu ${topikUtama || 'hari ini'} dengan membantu kawan yang belum paham adalah wujud nyata pilar Cinta Sesama Manusia.`,
    latihanSoal: `1. Jelaskan kembali dengan bahasamu sendiri apa yang dimaksud dengan ${topikUtama || 'materi ini'}!\n2. Mengapa kita perlu bersikap santun dan saling membantu saat mempelajari materi ini di kelas?\n3. Tuliskan satu rencana kebaikan yang akan Ananda lakukan setelah memahami pelajaran ini!`,
    glosarium: `• Ikhlas: Melakukan amal dan menuntut ilmu semata-mata mengharap ridha Allah SWT.\n• Empati: Kemampuan memahami dan merasakan perasaan orang lain dengan penuh kelembutan.\n• Khidmah: Sikap berbakti dan melayani kebaikan di lingkungan madrasah.`,
  };

  res.json({ success: true, source: 'kbc-curated-engine', data: fallbackData });
});

// -------------------------------------------------------------
// Validation Engine for KBC 2026 Compliance
// -------------------------------------------------------------
app.post('/api/rpps/validate', authMiddleware, (req: Request, res: Response) => {
  const rpp = req.body;
  const issues: string[] = [];
  const strengths: string[] = [];

  if (!rpp.mataPelajaranId) issues.push('Mata Pelajaran belum dipilih.');
  if (!rpp.fase) issues.push('Fase belum ditentukan (Fase A, B, atau C).');
  if (!rpp.kelas) issues.push('Kelas belum dipilih.');
  if (!rpp.judul || rpp.judul.trim().length < 5) issues.push('Judul RPP belum memadai (minimal 5 karakter).');
  if (!rpp.capaianPembelajaran || rpp.capaianPembelajaran.trim().length < 10) issues.push('Capaian Pembelajaran (CP) belum diisi.');
  if (!rpp.materiPokok || rpp.materiPokok.trim().length < 3) issues.push('Materi pokok belum diisi.');

  if (!Array.isArray(rpp.tujuanPembelajaran) || rpp.tujuanPembelajaran.length === 0) {
    issues.push('Tujuan Pembelajaran belum dirumuskan (minimal 1 TP).');
  }

  if (!Array.isArray(rpp.pancaCinta) || rpp.pancaCinta.length === 0) {
    issues.push('Pilar Panca Cinta belum dipilih (KBC mewajibkan minimal 1 pilar cinta).');
  } else {
    strengths.push(`Telah mengintegrasikan ${rpp.pancaCinta.length} pilar Panca Cinta.`);
  }

  if (!Array.isArray(rpp.dimensiProfilLulusan) || rpp.dimensiProfilLulusan.length === 0) {
    issues.push('Dimensi Profil Lulusan belum diintegrasikan.');
  }

  if (!rpp.kegiatanAwal?.apersepsiCinta || rpp.kegiatanAwal?.apersepsiCinta.trim().length < 10) {
    issues.push('Apersepsi bernuansa Kasih Sayang pada Kegiatan Awal belum dirancang.');
  }

  if (!rpp.kegiatanInti?.eksplorasiKasih || rpp.kegiatanInti?.eksplorasiKasih.trim().length < 10) {
    issues.push('Eksplorasi materi bernuansa Kasih pada Kegiatan Inti belum lengkap.');
  }

  if (!rpp.kegiatanPenutup?.refleksiCinta || rpp.kegiatanPenutup?.refleksiCinta.trim().length < 10) {
    issues.push('Refleksi Hikmah Cinta pada Kegiatan Penutup belum dirancang.');
  }

  if (!rpp.asesmenAwal || !rpp.asesmenFormatif || !rpp.asesmenSumatif) {
    issues.push('Kelengkapan Asesmen (Awal, Formatif, Sumatif) belum komprehensif.');
  } else {
    strengths.push('Trilogi Asesmen (Awal, Formatif, Sumatif) telah dirancang.');
  }

  const isValid = issues.length === 0;
  const score = Math.max(20, Math.round(100 - (issues.length * 10)));

  res.json({
    valid: isValid,
    score,
    grade: score >= 90 ? 'A (Sangat Sesuai Standar KBC)' : score >= 75 ? 'B (Baik & Layak Diterapkan)' : 'C (Perlu Penyempurnaan)',
    issues,
    strengths,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Audit Logs & System Backup Routes (Super Admin Only)
// -------------------------------------------------------------
app.get('/api/audit-logs', authMiddleware, requireSuperAdmin, (req: Request, res: Response) => {
  const { search, status, action } = req.query;
  let logs = [...store.auditLogs];

  if (status && typeof status === 'string' && status !== 'ALL') {
    logs = logs.filter(l => l.status === status);
  }

  if (action && typeof action === 'string' && action !== 'ALL') {
    logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    logs = logs.filter(
      l =>
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.detail.toLowerCase().includes(q) ||
        l.ip.includes(q)
    );
  }

  res.json(logs);
});

app.get('/api/backup', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const backupData = {
    exportDate: new Date().toISOString(),
    exportedBy: req.user?.username,
    ...store,
    users: store.users.map(({ passwordHash: _, ...u }) => u), // Exclude password hashes from export
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="backup-kbc-min1paser-${Date.now()}.json"`);
  res.json(backupData);
});

app.post('/api/restore', authMiddleware, requireSuperAdmin, (req: AuthenticatedRequest, res: Response) => {
  const restorePayload = req.body;
  if (!restorePayload || !Array.isArray(restorePayload.subjects) || !Array.isArray(restorePayload.rpps)) {
    return res.status(400).json({ error: 'Format berkas backup tidak valid.' });
  }

  // Keep admin user credentials intact
  const currentAdmins = store.users.filter(u => u.role === 'SUPER_ADMIN');

  store.subjects = restorePayload.subjects;
  store.rpps = restorePayload.rpps;
  if (restorePayload.schoolIdentity) store.schoolIdentity = restorePayload.schoolIdentity;
  if (restorePayload.pancaCinta) store.pancaCinta = restorePayload.pancaCinta;
  if (restorePayload.models) store.models = restorePayload.models;
  if (restorePayload.metode) store.metode = restorePayload.metode;
  if (restorePayload.asesmen) store.asesmen = restorePayload.asesmen;

  // Merge users safely
  if (Array.isArray(restorePayload.users)) {
    for (const restoredUser of restorePayload.users) {
      if (!store.users.some(u => u.id === restoredUser.id || u.username === restoredUser.username)) {
        store.users.push({
          ...restoredUser,
          passwordHash: hashPassword('KbcPaser2026!'), // assign standard password
        });
      }
    }
  }

  saveStore(store);

  if (req.user) {
    logAudit(req.user.id, req.user.name, req.user.role, 'Restore Data', 'SUKSES', 'Sistem berhasil dipulihkan dari cadangan');
  }

  res.json({ success: true, message: 'Data cadangan berhasil dipulihkan.' });
});

// -------------------------------------------------------------
// AI Generator Route (Gemini Integration + Algorithmic Fallback)
// -------------------------------------------------------------
app.post('/api/ai/generate-kbc', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { mataPelajaranNama, fase, kelas, materiPokok, pancaCintaPilihan, modelPembelajaran } = req.body;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah konsultan ahli Kurikulum Berbasis Cinta (KBC) 2026 untuk Madrasah Ibtidaiyah (MI) MIN 1 Paser Kalimantan Timur.
Rancang konten pembelajaran inovatif, hangat, dan berakhlak mulia untuk:
- Madrasah: MIN 1 Paser
- Mata Pelajaran: ${mataPelajaranNama}
- Jenjang: MI
- Fase: ${fase}
- Kelas: ${kelas}
- Materi Pokok: ${materiPokok || 'Materi Inti'}
- Pilar Panca Cinta yang diusung: ${Array.isArray(pancaCintaPilihan) ? pancaCintaPilihan.join(', ') : 'Cinta Allah & Cinta Sesama'}
- Model Pembelajaran: ${modelPembelajaran || 'Problem Based Learning Berbasis Cinta'}

Format output harus berupa JSON valid tanpa markdown formatting dengan struktur:
{
  "capaianPembelajaran": "teks narasi CP yang relevan dengan fase ${fase} dan nilai cinta",
  "tujuanPembelajaran": ["TP 1 (Kognitif/Pemahaman)", "TP 2 (Afektif Kasih Sayang)", "TP 3 (Psikomotorik/Aplikatif)"],
  "targetKarakterCinta": "Deskripsi target karakter kasih sayang",
  "kegiatanAwal": {
    "durasi": "10 Menit",
    "salamDanDoa": "Teks pembuka salam dan doa penuh berkah",
    "apersepsiCinta": "Apersepsi yang menyentuh hati dan memotivasi murid",
    "tujuanDanMotivasi": "Penyampaian tujuan yang menggembirakan"
  },
  "kegiatanInti": {
    "durasi": "50 Menit",
    "eksplorasiKasih": "Eksplorasi konsep dihubungkan dengan kebesaran Allah",
    "kolaborasiEmpati": "Aktivitas kelompok saling menghargai tanpa perundungan",
    "internalisasiNilai": "Menemukan hikmah dan solusi berkeadilan",
    "sintaksDetail": "Tahapan model pembelajaran"
  },
  "kegiatanPenutup": {
    "durasi": "10 Menit",
    "refleksiCinta": "Pertanyaan refleksi hikmah cinta murid",
    "umpanBalikApresiatif": "Apresiasi guru kepada murid",
    "doaDanTindakLanjut": "Doa penutup dan pembiasaan adab baik di rumah"
  },
  "asesmenFormatif": "Teknik observasi karakter empati",
  "asesmenSumatif": "Tugas unjuk kerja/tes bermakna",
  "rubrikPenilaian": "Deskripsi rubrik 4 level"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text);
      return res.json({ success: true, source: 'gemini-ai', data: parsed });
    } catch (aiErr) {
      console.warn('Gemini AI generation fallback triggered:', aiErr);
    }
  }

  // High-fidelity curated generator tailored for MIN 1 Paser KBC 2026
  const curatedData = {
    capaianPembelajaran: `Pada Fase ${fase}, peserta didik menunjukkan pemahaman mendalam tentang konsep ${materiPokok || 'materi'}, mampu mengaitkan ilmu pengetahuan dengan keagungan ciptaan Allah SWT, serta mengamalkan perilaku terpuji, empati, dan peduli sesama di madrasah dan lingkungan sekitar.`,
    tujuanPembelajaran: [
      `Memahami konsep esensial ${materiPokok || 'materi pokok'} dengan penalaran kritis dan santun.`,
      `Menunjukkan sikap empati, kerja sama penuh cinta kasih, dan saling menghargai pendapat kawan saat berdiskusi.`,
      `Menerapkan pemahaman materi dalam bentuk karya nyata atau pembiasaan adab baik di lingkungan MIN 1 Paser.`,
    ],
    targetKarakterCinta: `Menumbuhkan kelembutan hati dan integritas moral peserta didik agar setiap ilmu yang dipelajari bermuara pada cinta kepada Allah, sesama makhluk, dan tanah air.`,
    kegiatanAwal: {
      durasi: '10 Menit',
      salamDanDoa: 'Guru menyapa peserta didik dengan senyum tulus, salam Islami penuh doa rahmat, lalu memimpin doa sebelum belajar.',
      apersepsiCinta: `Guru menyapa suasana hati murid ("Bagaimana perasaan Ananda hari ini?"). Mengaitkan ${materiPokok || 'pembelajaran'} dengan bukti kasih sayang Allah dalam kehidupan sehari-hari.`,
      tujuanDanMotivasi: 'Menyampaikan tujuan pembelajaran dan memotivasi murid bahwa menuntut ilmu adalah jalan cinta menuju ridha Allah.',
    },
    kegiatanInti: {
      durasi: '50 Menit',
      eksplorasiKasih: `Murid mengeksplorasi fenomena ${materiPokok || 'materi'} melalui media interaktif. Guru membimbing murid menemukan keteraturan ciptaan Ilahi.`,
      kolaborasiEmpati: 'Kerja kelompok damai beranggotakan 4-5 anak. Murid saling membantu teman yang belum paham tanpa ada kata merendahkan.',
      internalisasiNilai: 'Diskusi hikmah materi: menghubungkan temuan pelajaran dengan sikap kepedulian di keluarga dan madrasah.',
      sintaksDetail: `Penerapan sintaks ${modelPembelajaran || 'Problem Based Learning'}: Orientasi masalah -> Diskusi empati -> Presentasi karya saling apresiasi -> Konfirmasi guru.`,
    },
    kegiatanPenutup: {
      durasi: '10 Menit',
      refleksiCinta: 'Refleksi bersama: "Kebaikan apa yang aku rasakan dan ingin kuamalkan setelah belajar materi ini?"',
      umpanBalikApresiatif: 'Guru memberikan apresiasi spesifik atas usaha, ketertiban, dan kehangatan sikap seluruh murid selama belajar.',
      doaDanTindakLanjut: 'Doa penutup majelis (Subhanakallahumma wa bihamdika...) dan salam perpisahan penuh kesantunan.',
    },
    asesmenFormatif: 'Observasi sikap gotong royong, empati antarteman, dan keaktifan berpendapat dengan bahasa santun.',
    asesmenSumatif: 'Unjuk kerja berupa Lembar Portofolio Pemahaman Bermakna dan kuis pemecahan masalah kontekstual.',
    rubrikPenilaian: 'Level 4 (Sangat Baik): Menguasai konsep dan konsisten berakhlak empati. Level 3 (Baik): Menguasai konsep dan kooperatif. Level 2 (Cukup): Perlu penguatan konsep. Level 1 (Bimbingan): Didampingi secara intensif dengan penuh kesabaran.',
  };

  res.json({ success: true, source: 'kbc-curated-engine', data: curatedData });
});

// -------------------------------------------------------------
// Dev & Production Serving Setup
// -------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RPP KBC GENERATOR 2026 backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
