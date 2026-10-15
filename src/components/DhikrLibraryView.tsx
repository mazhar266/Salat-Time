import React, { useState } from 'react';
import { Search, Plus, Play, Check, BookOpen } from 'lucide-react';
import { DhikrItem } from '../utils/dhikrData';

interface DhikrLibraryViewProps {
  library: DhikrItem[];
  onStartTasbeeh: (dhikr: DhikrItem) => void;
  onAddToPostPrayer: (dhikr: DhikrItem) => void;
  postPrayerIds: string[];
  onOpenCreateCustom: () => void;
}

export const DhikrLibraryView: React.FC<DhikrLibraryViewProps> = ({
  library,
  onStartTasbeeh,
  onAddToPostPrayer,
  postPrayerIds,
  onOpenCreateCustom
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Adhkar' },
    { id: 'after_prayer', label: 'After Prayer (Sunnah)' },
    { id: 'morning', label: 'Morning Adhkar' },
    { id: 'evening', label: 'Evening Adhkar' },
    { id: 'daily', label: 'Daily Remembrance' },
    { id: 'quranic', label: 'Quranic Duas' },
    { id: 'hardship', label: 'Relief & Hardship' }
  ];

  const filteredItems = library.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.transliteration.toLowerCase().includes(query) ||
      item.translation.toLowerCase().includes(query) ||
      item.arabic.includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Add Custom */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search dhikr by title, translation, or Arabic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <button
          onClick={onOpenCreateCustom}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Dhikr</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Dhikr Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isInPostPrayer = postPrayerIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5 hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{item.reference}</span>
                      <span aria-hidden="true">·</span>
                      <span>Target: <strong className="text-amber-300 font-mono">{item.targetCount}x</strong></span>
                    </div>
                  </div>
                  {item.isCustom && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 border border-emerald-800/60 bg-emerald-950/40 px-2 py-0.5 rounded">
                      Custom
                    </span>
                  )}
                </div>

                <div
                  className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-right font-serif text-lg sm:text-xl font-bold leading-loose text-amber-100"
                  dir="rtl"
                >
                  {item.arabic}
                </div>

                <div className="text-xs italic text-slate-300 leading-relaxed">
                  "{item.transliteration}"
                </div>

                <div className="text-xs text-slate-400 leading-relaxed">
                  {item.translation}
                </div>

                {item.benefit && (
                  <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/30 p-2.5 text-[11px] text-emerald-300/90 leading-relaxed">
                    <strong className="font-semibold text-emerald-200">Virtue: </strong>
                    {item.benefit}
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => onAddToPostPrayer(item)}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                    isInPostPrayer
                      ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {isInPostPrayer ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In Routine</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Routine</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onStartTasbeeh(item)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Reciting ({item.targetCount}x)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-12 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-300">No Dhikr Found</h4>
          <p className="text-xs text-slate-500">
            No entries matched your search query. Try another keyword or create a custom dhikr.
          </p>
        </div>
      )}
    </div>
  );
};
