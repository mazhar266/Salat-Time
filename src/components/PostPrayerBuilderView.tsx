import React, { useState } from 'react';
import {
  ListOrdered,
  Plus,
  Play,
  Trash2,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Check,
  Edit2
} from 'lucide-react';
import { DhikrItem } from '../utils/dhikrData';

interface PostPrayerBuilderViewProps {
  library: DhikrItem[];
  routineMap: Record<string, string[]>;
  onUpdateRoutine: (prayerName: string, dhikrIds: string[]) => void;
  onUpdateDhikrTarget: (dhikrId: string, newTarget: number) => void;
  onStartRoutineSession: (prayerName: string) => void;
  onOpenCreateCustom: () => void;
  onResetToDefault: () => void;
}

export const PostPrayerBuilderView: React.FC<PostPrayerBuilderViewProps> = ({
  library,
  routineMap,
  onUpdateRoutine,
  onUpdateDhikrTarget,
  onStartRoutineSession,
  onOpenCreateCustom,
  onResetToDefault
}) => {
  const [activePrayer, setActivePrayer] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingTargetId, setEditingTargetId] = useState<string | null>(null);
  const [targetInputValue, setTargetInputValue] = useState<number>(33);

  const prayers = [
    { id: 'all', label: 'All Prayers (Standard)' },
    { id: 'fajr', label: 'Fajr' },
    { id: 'dhuhr', label: 'Dhuhr' },
    { id: 'asr', label: 'Asr' },
    { id: 'maghrib', label: 'Maghrib' },
    { id: 'isha', label: 'Isha' }
  ];

  const currentRoutineIds = routineMap[activePrayer] || routineMap['all'] || [];
  const routineItems: DhikrItem[] = currentRoutineIds
    .map((id) => library.find((item) => item.id === id))
    .filter((item): item is DhikrItem => Boolean(item));

  const availableItems = library.filter((item) => !currentRoutineIds.includes(item.id));

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newIds = [...currentRoutineIds];
    const temp = newIds[index - 1];
    newIds[index - 1] = newIds[index];
    newIds[index] = temp;
    onUpdateRoutine(activePrayer, newIds);
  };

  const handleMoveDown = (index: number) => {
    if (index >= currentRoutineIds.length - 1) return;
    const newIds = [...currentRoutineIds];
    const temp = newIds[index + 1];
    newIds[index + 1] = newIds[index];
    newIds[index] = temp;
    onUpdateRoutine(activePrayer, newIds);
  };

  const handleRemove = (id: string) => {
    const newIds = currentRoutineIds.filter((item) => item !== id);
    onUpdateRoutine(activePrayer, newIds);
  };

  const handleAddDhikr = (id: string) => {
    const newIds = [...currentRoutineIds, id];
    onUpdateRoutine(activePrayer, newIds);
  };

  const handleSaveTarget = (id: string) => {
    if (targetInputValue > 0) {
      onUpdateDhikrTarget(id, targetInputValue);
    }
    setEditingTargetId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg">
            Personalized Post-Prayer Adhkar
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize the sequential dhikr playlist recited after completing each prayer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetToDefault}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={() => onStartRoutineSession(activePrayer)}
            disabled={routineItems.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow-sm disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Routine</span>
          </button>
        </div>
      </div>

      {/* Prayer Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {prayers.map((prayer) => (
          <button
            key={prayer.id}
            onClick={() => setActivePrayer(prayer.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition whitespace-nowrap shrink-0 ${
              activePrayer === prayer.id
                ? 'bg-emerald-900/70 text-emerald-300 border border-emerald-700/60'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
            }`}
          >
            {prayer.label}
          </button>
        ))}
      </div>

      {/* Active Playlist Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{routineItems.length} Adhkar in sequence for {activePrayer.toUpperCase()}</span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Dhikr to this Prayer</span>
          </button>
        </div>

        <div className="space-y-2">
          {routineItems.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-400 font-mono">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <span className="text-[11px] text-slate-500 font-serif" dir="rtl">
                      {item.arabic.slice(0, 24)}...
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {item.transliteration}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {editingTargetId === item.id ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={targetInputValue}
                      onChange={(e) => setTargetInputValue(Number(e.target.value))}
                      className="w-16 rounded border border-emerald-500 bg-slate-800 px-2 py-0.5 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveTarget(item.id)}
                      className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTargetId(item.id);
                      setTargetInputValue(item.targetCount);
                    }}
                    title="Edit target count"
                    className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-850 px-2.5 py-1 text-xs font-mono font-bold text-amber-300 hover:border-amber-500/50 transition"
                  >
                    <span>{item.targetCount}x</span>
                    <Edit2 className="w-2.5 h-2.5 opacity-60" />
                  </button>
                )}

                <div className="flex flex-col">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-0.5 text-slate-500 hover:text-slate-300 disabled:opacity-20"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === routineItems.length - 1}
                    className="p-0.5 text-slate-500 hover:text-slate-300 disabled:opacity-20"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  title="Remove from routine"
                  className="p-1.5 text-slate-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {routineItems.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-slate-600 mx-auto" />
              <h4 className="text-xs font-semibold text-slate-300">Playlist is empty for {activePrayer}</h4>
              <p className="text-[11px] text-slate-500">
                Add adhkar from your library below or reset to Sunnah defaults.
              </p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Dhikr to {activePrayer.toUpperCase()} Routine</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700"
                >
                  <div>
                    <h5 className="text-xs font-bold text-white">{item.title}</h5>
                    <div className="text-[11px] text-slate-400">{item.transliteration}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleAddDhikr(item.id);
                      setShowAddModal(false);
                    }}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              ))}

              {availableItems.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">
                  All available adhkar are already in this playlist.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  onOpenCreateCustom();
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                + Create new custom dhikr
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
