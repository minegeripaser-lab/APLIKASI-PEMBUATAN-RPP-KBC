import React, { useState } from 'react';
import { Layers, Heart, Sparkles, BookOpen, CheckCircle2, Copy } from 'lucide-react';
import type { PancaCintaItem } from '../types/index.ts';

interface RubricGuideProps {
  pancaCinta: PancaCintaItem[];
}

export const RubricGuide: React.FC<RubricGuideProps> = ({ pancaCinta }) => {
  const [selectedPilar, setSelectedPilar] = useState(pancaCinta[0]?.id || 'pc_1');
  const activeItem = pancaCinta.find(p => p.id === selectedPilar) || pancaCinta[0];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            BANK RUBRIK & PANDUAN KARAKTER CINTA KBC
          </h1>
          <p className="text-xs text-slate-500">
            Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Berbasis Empati dan Kasih Sayang
          </p>
        </div>
      </div>

      {/* Pilar Selector */}
      <div className="flex flex-wrap gap-2">
        {pancaCinta.map(pc => (
          <button
            key={pc.id}
            type="button"
            onClick={() => setSelectedPilar(pc.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-2 ${
              selectedPilar === pc.id
                ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${selectedPilar === pc.id ? 'fill-rose-600 text-rose-600' : 'text-slate-400'}`} />
            <span>{pc.nama}</span>
          </button>
        ))}
      </div>

      {/* Active Pilar Detail & 4-Level Rubric */}
      {activeItem && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">{activeItem.nama}</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activeItem.deskripsi}</p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Indikator Perilaku Autentik Murid:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {activeItem.indikator.map((ind, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-emerald-800 block mb-0.5">Indikator {i + 1}</span>
                  {ind}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Rubrik Penilaian 4 Skala (KKTP):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/50">
                <span className="font-bold text-emerald-900 block mb-1">Level 4: Sangat Mahir</span>
                <p className="text-slate-700">
                  Konsisten menunjukkan karakter cinta secara mandiri dan menginspirasi teman sekelas dengan sukacita.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-sky-300 bg-sky-50/50">
                <span className="font-bold text-sky-900 block mb-1">Level 3: Berkembang Baik</span>
                <p className="text-slate-700">
                  Mampu menunjukkan sikap empati dan keterlibatan aktif saat pembelajaran berlangsung dengan stabil.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/50">
                <span className="font-bold text-amber-900 block mb-1">Level 2: Mulai Berkembang</span>
                <p className="text-slate-700">
                  Kadang-kadang menunjukkan sikap empati, masih memerlukan sesekali pengingat ramah dari guru.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-rose-300 bg-rose-50/50">
                <span className="font-bold text-rose-900 block mb-1">Level 1: Perlu Bimbingan</span>
                <p className="text-slate-700">
                  Memerlukan pendampingan personal penuh kesabaran dan keteladanan intensif dari guru pembimbing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
