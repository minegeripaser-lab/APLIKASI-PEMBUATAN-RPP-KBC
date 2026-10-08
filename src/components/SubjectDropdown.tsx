import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Check, BookOpen, Sparkles, Plus, AlertCircle } from 'lucide-react';
import type { Subject, SubjectKelompok } from '../types/index.ts';

interface SubjectDropdownProps {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelect: (subject: Subject | null) => void;
  faseFilter?: 'A' | 'B' | 'C';
  onOpenMasterData?: () => void;
  isSuperAdmin?: boolean;
  disabled?: boolean;
  error?: string;
}

export const SubjectDropdown: React.FC<SubjectDropdownProps> = ({
  subjects,
  selectedSubjectId,
  onSelect,
  faseFilter,
  onOpenMasterData,
  isSuperAdmin = false,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKelompokTab, setActiveKelompokTab] = useState<'ALL' | SubjectKelompok>('ALL');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  // Filtered subjects based on status, search, and kelompok tab
  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      // Must be active (unless it's the currently selected one)
      if (subject.status !== 'AKTIF' && subject.id !== selectedSubjectId) {
        return false;
      }

      // Fase filter if specified
      if (faseFilter && !subject.fase.includes(faseFilter)) {
        return false;
      }

      // Kelompok tab filter
      if (activeKelompokTab !== 'ALL' && subject.kelompok !== activeKelompokTab) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = subject.nama.toLowerCase().includes(q);
        const matchesKode = subject.kode.toLowerCase().includes(q);
        const matchesDesc = subject.deskripsi.toLowerCase().includes(q);
        return matchesName || matchesKode || matchesDesc;
      }

      return true;
    });
  }, [subjects, selectedSubjectId, faseFilter, activeKelompokTab, searchQuery]);

  // Group into Kelompok A, Kelompok B, Kelompok C
  const groupedSubjects = useMemo(() => {
    const kelompokA = filteredSubjects.filter(s => s.kelompok === 'KELOMPOK A');
    const kelompokB = filteredSubjects.filter(s => s.kelompok === 'KELOMPOK B');
    const kelompokC = filteredSubjects.filter(s => s.kelompok === 'KELOMPOK C');

    return [
      {
        id: 'KELOMPOK A',
        title: 'KELOMPOK A',
        subtitle: 'Mata Pelajaran Keagamaan MI',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        items: kelompokA,
      },
      {
        id: 'KELOMPOK B',
        title: 'KELOMPOK B',
        subtitle: 'Mata Pelajaran Umum MI',
        badgeColor: 'text-sky-700 bg-sky-50 border-sky-200',
        items: kelompokB,
      },
      {
        id: 'KELOMPOK C',
        title: 'KELOMPOK C',
        subtitle: 'Muatan & Kekhasan Madrasah',
        badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
        items: kelompokC,
      },
    ];
  }, [filteredSubjects]);

  const handleSelect = (subject: Subject) => {
    onSelect(subject);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Mata Pelajaran</span>
          <span className="text-red-500 font-bold">*</span>
        </span>
        {faseFilter && (
          <span className="text-xs font-normal text-slate-500">
            Disesuaikan untuk <strong className="text-emerald-700 font-semibold">Fase {faseFilter}</strong>
          </span>
        )}
      </label>

      {/* Main Select Button Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-3.5 py-2.5 rounded-lg border transition-all flex items-center justify-between gap-2 bg-white ${
          error
            ? 'border-red-400 ring-2 ring-red-100'
            : isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-100 shadow-sm'
            : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
      >
        <div className="flex-1 min-w-0">
          {selectedSubject ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                {selectedSubject.kode}
              </span>
              <span className="font-medium text-slate-900 truncate">
                {selectedSubject.nama}
              </span>
              <span className="text-xs text-slate-400 shrink-0">
                · {selectedSubject.kelompok}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 font-normal">
              Pilih Mata Pelajaran MI ▼
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedSubject && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              title="Bersihkan Pilihan (Clear)"
              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </div>
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}

      {/* Dropdown Menu Container */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari mata pelajaran (nama, kode, topik)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Kelompok Filter Tabs */}
            <div className="flex items-center gap-1 mt-2.5 pt-1 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setActiveKelompokTab('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  activeKelompokTab === 'ALL'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Semua ({subjects.filter(s => s.status === 'AKTIF').length})
              </button>
              <button
                type="button"
                onClick={() => setActiveKelompokTab('KELOMPOK A')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  activeKelompokTab === 'KELOMPOK A'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Kelompok A (Keagamaan)
              </button>
              <button
                type="button"
                onClick={() => setActiveKelompokTab('KELOMPOK B')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  activeKelompokTab === 'KELOMPOK B'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Kelompok B (Umum)
              </button>
              <button
                type="button"
                onClick={() => setActiveKelompokTab('KELOMPOK C')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  activeKelompokTab === 'KELOMPOK C'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Kelompok C (Kekhasan)
              </button>
            </div>
          </div>

          {/* Grouped Subject List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
            {groupedSubjects.every(g => g.items.length === 0) ? (
              <div className="py-8 text-center px-4">
                <p className="text-sm font-medium text-slate-700 mb-1">Mata pelajaran tidak ditemukan</p>
                <p className="text-xs text-slate-500">
                  Coba kata kunci pencarian lain atau pilih tab kelompok yang berbeda.
                </p>
                {isSuperAdmin && onOpenMasterData && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenMasterData();
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Melalui Master Data
                  </button>
                )}
              </div>
            ) : (
              groupedSubjects.map(
                group =>
                  group.items.length > 0 && (
                    <div key={group.id} className="py-2">
                      <div className="px-3 py-1 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 tracking-wider">
                          {group.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {group.subtitle}
                        </span>
                      </div>

                      <div className="mt-1 space-y-0.5">
                        {group.items.map(subject => {
                          const isSelected = selectedSubject?.id === subject.id;
                          return (
                            <button
                              key={subject.id}
                              type="button"
                              onClick={() => handleSelect(subject)}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-950 font-medium'
                                  : 'hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                                    {subject.kode}
                                  </span>
                                  <span className="text-sm font-semibold truncate">
                                    {subject.nama}
                                  </span>
                                  {subject.fase && (
                                    <span className="text-[11px] text-slate-400 font-normal">
                                      Fase {subject.fase.join(', ')}
                                    </span>
                                  )}
                                </div>
                                {subject.deskripsi && (
                                  <p className="text-xs text-slate-500 truncate mt-0.5 pl-0.5">
                                    {subject.deskripsi}
                                  </p>
                                )}
                              </div>

                              <div className="shrink-0 flex items-center">
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )
              )
            )}
          </div>

          {/* Footer of Dropdown */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Tersedia <strong>{subjects.filter(s => s.status === 'AKTIF').length}</strong> mapel MI terstandar KBC
            </span>
            {isSuperAdmin && onOpenMasterData && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenMasterData();
                }}
                className="font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Kelola Master Data</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
