import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { DhikrItem } from '../utils/dhikrData';

interface CreateCustomDhikrModalProps {
  onClose: () => void;
  onSave: (newItem: DhikrItem) => void;
}

export const CreateCustomDhikrModal: React.FC<CreateCustomDhikrModalProps> = ({
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [arabic, setArabic] = useState('');
  const [transliteration, setTransliteration] = useState('');
  const [translation, setTranslation] = useState('');
  const [benefit, setBenefit] = useState('');
  const [targetCount, setTargetCount] = useState<number>(33);
  const [category, setCategory] = useState<DhikrItem['category']>('after_prayer');
  const [assignedPrayer, setAssignedPrayer] = useState<'all' | 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !arabic.trim()) return;

    const newItem: DhikrItem = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      arabic: arabic.trim(),
      transliteration: transliteration.trim() || title.trim(),
      translation: translation.trim() || 'Custom supplication.',
      benefit: benefit.trim() || undefined,
      reference: 'Personal Routine',
      targetCount: Math.max(1, targetCount),
      category,
      assignedPrayers: [assignedPrayer],
      isCustom: true
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Add Custom Dhikr / Dua</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dua for Parents"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Arabic Text <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              dir="rtl"
              placeholder="رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ..."
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 font-serif text-base text-amber-200 placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Transliteration
            </label>
            <input
              type="text"
              placeholder="e.g. Rabbighfir li wa li-walidayya..."
              value={transliteration}
              onChange={(e) => setTransliteration(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">
              English Translation & Meaning
            </label>
            <textarea
              rows={2}
              placeholder="e.g. My Lord, forgive me and my parents..."
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Target Recitation Count
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">
                Assign to Prayer
              </label>
              <select
                value={assignedPrayer}
                onChange={(e) => setAssignedPrayer(e.target.value as any)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">All Prayers</option>
                <option value="fajr">Fajr</option>
                <option value="dhuhr">Dhuhr</option>
                <option value="asr">Asr</option>
                <option value="maghrib">Maghrib</option>
                <option value="isha">Isha</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Dhikr</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
