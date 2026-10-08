import React, { useState } from 'react';
import { Sparkles, Heart, BookOpen, Layers, CheckCircle2, Copy } from 'lucide-react';
import { SubjectDropdown } from './SubjectDropdown.tsx';
import type { Subject, PancaCintaItem } from '../types/index.ts';

interface TPGeneratorProps {
  subjects: Subject[];
  pancaCinta: PancaCintaItem[];
  onUseTP?: (tpList: string[], subjectId: string, fase: string) => void;
}

export const TPGenerator: React.FC<TPGeneratorProps> = ({
  subjects,
  pancaCinta,
  onUseTP,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [fase, setFase] = useState<'A' | 'B' | 'C'>('C');
  const [kelas, setKelas] = useState<'V' | 'VI'>('VI');
  const [materi, setMateri] = useState('');
  const [selectedPilar, setSelectedPilar] = useState<string[]>(['Cinta Allah SWT & Rasulullah SAW']);
  const [generatedTP, setGeneratedTP] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  const handleGenerate = () => {
    const subjectName = selectedSubject?.nama || 'Mata Pelajaran';
    const topic = materi.trim() || 'konsep dasar';

    const results = [
      `Memahami konsep esensial ${topic} pada mata pelajaran ${subjectName} dengan penalaran kritis dan santun.`,
      `Menunjukkan sikap empati, kerja sama penuh kasih sayang, dan saling menghormati pendapat kawan saat berdiskusi tentang ${topic}.`,
      `Mengaitkan materi ${topic} dengan bukti cinta kepada Allah SWT dan rasa syukur atas nikmat ilmu pengetahuan.`,
      `Menerapkan pemahaman ${topic} dalam kehidupan sehari-hari di madrasah MIN 1 Paser sebagai cerminan akhlak karimah.`,
    ];

    setGeneratedTP(results);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(generatedTP.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            GENERATOR TUJUAN PEMBELAJARAN (TP) KBC
          </h1>
          <p className="text-xs text-slate-500">
            Perumusan Tujuan Pembelajaran Berkarakter Cinta & Berpusat pada Peserta Didik MI
          </p>
        </div>
      </div>

      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Fase Kurikulum</label>
            <div className="grid grid-cols-3 gap-1">
              {(['A', 'B', 'C'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFase(f)}
                  className={`py-1.5 text-xs font-bold rounded-lg border ${
                    fase === f
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Fase {f}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <SubjectDropdown
              subjects={subjects}
              selectedSubjectId={selectedSubjectId}
              onSelect={s => setSelectedSubjectId(s?.id || '')}
              faseFilter={fase}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Topik / Materi Pokok
          </label>
          <input
            type="text"
            value={materi}
            onChange={e => setMateri(e.target.value)}
            placeholder="Contoh: Rantai Makanan Hutan Paser / Hadis Menyayangi Yatim / Pecahan Desimal"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pilar Panca Cinta yang Diintegrasikan
          </label>
          <div className="flex flex-wrap gap-2">
            {pancaCinta.map(pc => {
              const active = selectedPilar.includes(pc.nama);
              return (
                <button
                  key={pc.id}
                  type="button"
                  onClick={() =>
                    setSelectedPilar(prev =>
                      prev.includes(pc.nama) ? prev.filter(x => x !== pc.nama) : [...prev, pc.nama]
                    )
                  }
                  className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${active ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
                  <span>{pc.nama}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Rumuskan Tujuan Pembelajaran KBC</span>
          </button>
        </div>
      </div>

      {/* Result Box */}
      {generatedTP.length > 0 && (
        <div className="p-5 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Hasil Rumusan TP Berbasis Cinta ({generatedTP.length} Butir)
            </span>
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded border border-slate-200"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Tersalin!' : 'Salin Semua TP'}</span>
            </button>
          </div>

          <div className="space-y-2">
            {generatedTP.map((tp, idx) => (
              <div key={idx} className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="flex-1 leading-relaxed">{tp}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
