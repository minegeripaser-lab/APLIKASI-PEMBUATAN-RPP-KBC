import React, { useEffect } from 'react';
import { Layers, GraduationCap, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { SubjectDropdown } from './SubjectDropdown.tsx';
import type { Subject } from '../types/index.ts';

interface CascadingSelectorProps {
  jenjang: 'MI';
  fase: 'A' | 'B' | 'C';
  kelas: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  semester: '1 (Ganjil)' | '2 (Genap)';
  selectedSubjectId: string;
  subjects: Subject[];
  capaianPembelajaran: string;
  materiPokok: string;
  onFaseChange: (fase: 'A' | 'B' | 'C') => void;
  onKelasChange: (kelas: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI') => void;
  onSemesterChange: (semester: '1 (Ganjil)' | '2 (Genap)') => void;
  onSubjectSelect: (subject: Subject | null) => void;
  onCPChange: (cp: string) => void;
  onMateriChange: (materi: string) => void;
  onOpenMasterData?: () => void;
  isSuperAdmin?: boolean;
}

// Recommended CP by Subject Code & Phase for Madrasah Ibtidaiyah
const CP_RECOMMENDATIONS: Record<string, Record<string, string>> = {
  'QH-MI': {
    A: "Pada Fase A, peserta didik mampu mengenal huruf hijaiyah berharakat, membaca dan menghafal surah pendek (Al-Fatihah, An-Nas, Al-Falaq, Al-Ikhlas) dengan tartil dan penuh keceriaan serta membiasakan sikap santun berlandaskan kecintaan pada Al-Qur'an.",
    B: "Pada Fase B, peserta didik mampu membaca, menghafal, dan memahami makna surah-surah pendek pilihan dan hadis tentang persaudaraan, kebersihan, dan menyayangi sesama dengan makhraj yang benar sebagai wujud kecintaan kepada Rasulullah SAW.",
    C: "Pada Fase C, peserta didik mampu menganalisis pesan pokok surah-surah pendek dan hadis tentang amal saleh, kejujuran, dan kepedulian sosial, serta mengamalkannya dalam kehidupan sehari-hari dengan penuh tanggung jawab dan kasih sayang.",
  },
  'AA-MI': {
    A: "Pada Fase A, peserta didik mampu mengenal rukun iman, kalimat thoyyibah (Basmalah, Hamdalah, Ta'awwudz), Asmaul Husna dasar, serta membiasakan adab hormat kepada orang tua dan guru dengan hati yang tulus.",
    B: "Pada Fase B, peserta didik memahami sifat-sifat wajib dan mustahil bagi Allah, mengimani malaikat dan kitab-kitab Allah, serta menampilkan akhlak terpuji seperti jujur, amanah, sabar, dan tolong-menolong tanpa membeda-bedakan.",
    C: "Pada Fase C, peserta didik memahami makna Asmaul Husna secara mendalam, beriman kepada hari akhir dan qadha-qadar, menghindari akhlak tercela, serta mempraktikkan toleransi dan moderasi beragama dalam kebinekaan.",
  },
  'FIQ-MI': {
    A: "Pada Fase A, peserta didik mampu mempraktikkan tata cara bersuci (thaharah), wudhu, dan gerakan shalat fardhu dengan tertib serta menumbuhkan rasa syukur dan cinta kepada Allah dalam beribadah.",
    B: "Pada Fase B, peserta didik memahami ketentuan azan, iqamah, shalat berjamaah, shalat sunnah rawatib, serta puasa Ramadhan dengan kesadaran hati yang ikhlas dan disiplin.",
    C: "Pada Fase C, peserta didik memahami ketentuan shalat Jumat, shalat dhuha, shalat tarawih, zakat fitrah, infak, sedekah, dan makanan halal-haram sebagai wujud kepedulian sosial dan kepatuhan syariat.",
  },
  'SKI-MI': {
    B: "Pada Fase B, peserta didik mampu menceritakan kondisi masyarakat Arab pra-Islam, masa kanak-kanak dan kerasulan Nabi Muhammad SAW, serta meneladani sifat kasih sayang, kejujuran, dan ketabahan beliau dalam berdakwah.",
    C: "Pada Fase C, peserta didik mampu menganalisis peristiwa hijrah Nabi ke Madinah, kepemimpinan Khulafaur Rasyidin, dan peran Walisongo dalam menyebarkan Islam di nusantara dengan jalan damai dan kearifan lokal.",
  },
  'ARB-MI': {
    A: "Pada Fase A, peserta didik mampu merespons bunyi ujaran kosakata sederhana mengenai perkenalan diri, anggota tubuh, peralatan sekolah, dan warna dalam bahasa Arab dengan intonasi yang ramah.",
    B: "Pada Fase B, peserta didik mampu memahami instruksi lisan sederhana, memperkenalkan anggota keluarga, aktivitas di madrasah, dan profesi dengan tata bahasa santun.",
    C: "Pada Fase C, peserta didik mampu membaca teks narasi pendek bahasa Arab, melakukan percakapan tematik (jam, hobi, pemandangan alam), dan menulis kalimat sederhana secara komunikatif.",
  },
  'PP-MI': {
    A: "Pada Fase A, peserta didik mampu mengenal simbol dan sila Pancasila, menghormati aturan di rumah dan madrasah, serta menunjukkan sikap peduli kepada teman sebaya.",
    B: "Pada Fase B, peserta didik memahami makna sila-sila Pancasila, membedakan hak dan kewajiban anak, serta bergotong royong dalam keragaman suku dan budaya di lingkungan madrasah.",
    C: "Pada Fase C, peserta didik menganalisis penerapan nilai-nilai Pancasila dalam kehidupan berbangsa, norma hukum, musyawarah mufakat, serta keutuhan NKRI dengan semangat persatuan.",
  },
  'BIND-MI': {
    A: "Pada Fase A, peserta didik memiliki kemampuan berbahasa untuk berkomunikasi santun, menyimak cerita, melafalkan bunyi huruf, dan membaca kata-kata bermakna dengan perasaan senang.",
    B: "Pada Fase B, peserta didik mampu memahami ide pokok teks narasi dan eksposisi, berbicara santun dalam diskusi kelas, serta menulis kalimat terstruktur yang menggambarkan pengalaman nyata.",
    C: "Pada Fase C, peserta didik mampu mengevaluasi informasi dari berbagai teks sastra dan non-sastra, menyampaikan gagasan kritis secara santun, dan memproduksi tulisan kreatif yang menginspirasi.",
  },
  'MAT-MI': {
    A: "Pada Fase A, peserta didik menunjukkan pemahaman bilangan cacah sampai 100, operasi penjumlahan dan pengurangan ramah anak, serta mengenal bangun datar sederhana.",
    B: "Pada Fase B, peserta didik menguasai operasi perkalian dan pembagian bilangan cacah sampai 10.000, pecahan senilai, keliling dan luas bangun datar secara kontekstual.",
    C: "Pada Fase C, peserta didik memahami pecahan desimal, rasio, operasi hitung campuran, bangun ruang (kubus, balok), dan pengolahan data sederhana dengan penalaran logis.",
  },
  'IPAS-MI': {
    B: "Pada Fase B, peserta didik mengidentifikasi kebutuhan makhluk hidup, wujud zat dan perubahannya, gaya dan gerak, serta peta lingkungan tempat tinggal dengan kesadaran menjaga alam ciptaan Allah.",
    C: "Pada Fase C, peserta didik menganalisis sistem organ manusia, interaksi makhluk hidup dalam ekosistem, energi terbarukan, serta kearifan lokal dan dinamika sosial masyarakat Paser dan Indonesia.",
  },
};

export const CascadingSelector: React.FC<CascadingSelectorProps> = ({
  jenjang,
  fase,
  kelas,
  semester,
  selectedSubjectId,
  subjects,
  capaianPembelajaran,
  materiPokok,
  onFaseChange,
  onKelasChange,
  onSemesterChange,
  onSubjectSelect,
  onCPChange,
  onMateriChange,
  onOpenMasterData,
  isSuperAdmin = false,
}) => {
  // Available classes per fase
  const classesForFase: Record<'A' | 'B' | 'C', ('I' | 'II' | 'III' | 'IV' | 'V' | 'VI')[]> = {
    A: ['I', 'II'],
    B: ['III', 'IV'],
    C: ['V', 'VI'],
  };

  // If currently selected class is not in the active fase, automatically auto-select the first valid class
  useEffect(() => {
    const validClasses = classesForFase[fase];
    if (!validClasses.includes(kelas)) {
      onKelasChange(validClasses[0]);
    }
  }, [fase, kelas, onKelasChange]);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  // Suggested CP
  const suggestedCP = selectedSubject && CP_RECOMMENDATIONS[selectedSubject.kode]?.[fase];

  const handleApplySuggestedCP = () => {
    if (suggestedCP) {
      onCPChange(suggestedCP);
    }
  };

  return (
    <div className="space-y-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            A
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              A. Identitas Pembelajaran Madrasah (Cascading)
            </h3>
            <p className="text-xs text-slate-500">
              Jenjang MI → Fase → Kelas → Mata Pelajaran → Capaian Pembelajaran (CP) → Materi
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
          MIN 1 Paser · KBC 2026
        </span>
      </div>

      {/* Grid Cascading 1: Jenjang, Fase, Kelas, Semester */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Jenjang: MI (Fixed/Selected) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Jenjang Satuan Pendidikan</span>
          </label>
          <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-emerald-900 flex items-center justify-between">
            <span>Madrasah Ibtidaiyah (MI)</span>
            <span className="text-[11px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              {jenjang}
            </span>
          </div>
        </div>

        {/* Fase: A, B, C */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fase Kurikulum</span>
            <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['A', 'B', 'C'] as const).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => onFaseChange(f)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  fase === f
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Fase {f}
                <span className="block text-[10px] font-normal opacity-90">
                  {f === 'A' ? 'Kelas 1-2' : f === 'B' ? 'Kelas 3-4' : 'Kelas 5-6'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Kelas (Cascaded based on Fase) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kelas MI</span>
              <span className="text-red-500">*</span>
            </span>
            <span className="text-[11px] text-slate-400">
              Tergantung Fase {fase}
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {classesForFase[fase].map(k => (
              <button
                key={k}
                type="button"
                onClick={() => onKelasChange(k)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  kelas === k
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Kelas {k}
              </button>
            ))}
          </div>
        </div>

        {/* Semester */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Semester</span>
            <span className="text-red-500">*</span>
          </label>
          <select
            value={semester}
            onChange={e => onSemesterChange(e.target.value as '1 (Ganjil)' | '2 (Genap)')}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          >
            <option value="1 (Ganjil)">Semester 1 (Ganjil)</option>
            <option value="2 (Genap)">Semester 2 (Genap)</option>
          </select>
        </div>
      </div>

      {/* Row 2: DROPDOWN MATA PELAJARAN MI (Search, Filter, Grouped, Clear) */}
      <div>
        <SubjectDropdown
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSelect={onSubjectSelect}
          faseFilter={fase}
          onOpenMasterData={onOpenMasterData}
          isSuperAdmin={isSuperAdmin}
        />
      </div>

      {/* Row 3: Capaian Pembelajaran (CP) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Capaian Pembelajaran (CP) <span className="text-red-500">*</span>
          </label>
          {suggestedCP && (
            <button
              type="button"
              onClick={handleApplySuggestedCP}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Gunakan Rekomendasi CP Standar Fase {fase}</span>
            </button>
          )}
        </div>
        <textarea
          rows={3}
          value={capaianPembelajaran}
          onChange={e => onCPChange(e.target.value)}
          placeholder={`Masukkan Capaian Pembelajaran (CP) untuk ${selectedSubject?.nama || 'mata pelajaran'} Fase ${fase}... (Dapat diketik manual atau gunakan rekomendasi standar di atas)`}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-800 placeholder:text-slate-400"
        />
        <p className="mt-1 text-[11px] text-slate-500">
          Guru dapat menyesuaikan narasi CP sesuai modul ajar satuan pendidikan MIN 1 Paser.
        </p>
      </div>

      {/* Row 4: Materi Pokok */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Materi Pokok / Lingkup Materi <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={materiPokok}
          onChange={e => onMateriChange(e.target.value)}
          placeholder="Contoh: Rantai Makanan & Keseimbangan Ekosistem Hutan Tropis Berbasis Cinta Lingkungan"
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        />
      </div>
    </div>
  );
};
