import React, { useState } from 'react';
import { BarChart3, Flame, Target, Trophy, Play, RotateCcw } from 'lucide-react';
import { DhikrItem, DailyRecitationRecord } from '../utils/dhikrData';

interface DailyTrackerViewProps {
  library: DhikrItem[];
  todayRecord: DailyRecitationRecord;
  dailyGoal: number;
  onUpdateDailyGoal: (newGoal: number) => void;
  streakDays: number;
  onStartTasbeeh: (dhikr: DhikrItem) => void;
  onResetToday: () => void;
}

export const DailyTrackerView: React.FC<DailyTrackerViewProps> = ({
  library,
  todayRecord,
  dailyGoal,
  onUpdateDailyGoal,
  streakDays,
  onStartTasbeeh,
  onResetToday
}) => {
  const [editingGoal, setEditingGoal] = useState<boolean>(false);
  const [goalInput, setGoalInput] = useState<number>(dailyGoal);

  const goalPercent = Math.min(100, Math.round((todayRecord.totalRecitations / dailyGoal) * 100));

  const handleSaveGoal = () => {
    if (goalInput > 0) {
      onUpdateDailyGoal(goalInput);
    }
    setEditingGoal(false);
  };

  const activeDhikrs = Object.entries(todayRecord.dhikrCounts)
    .filter(([_, count]) => count > 0)
    .map(([id, count]) => {
      const item = library.find((d) => d.id === id);
      return {
        item,
        id,
        count
      };
    })
    .filter((entry): entry is { item: DhikrItem; id: string; count: number } => Boolean(entry.item));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div>
          <h2 className="text-base font-bold text-white sm:text-lg">
            Daily Recitation & Adhkar Tracker
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor your daily spiritual remembrances, habit consistency, and prayer sessions.
          </p>
        </div>

        <button
          onClick={onResetToday}
          className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Today</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Recitations</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
            {todayRecord.totalRecitations}
          </div>
          <div className="text-[11px] text-slate-400">
            {goalPercent}% of daily target ({dailyGoal})
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Goal</span>
            <button
              onClick={() => setEditingGoal(!editingGoal)}
              className="text-[11px] text-emerald-400 hover:underline"
            >
              {editingGoal ? 'Cancel' : 'Edit Target'}
            </button>
          </div>

          {editingGoal ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="10"
                max="10000"
                value={goalInput}
                onChange={(e) => setGoalInput(Number(e.target.value))}
                className="w-24 rounded border border-emerald-500 bg-slate-800 px-2 py-1 text-sm font-mono text-white focus:outline-none"
              />
              <button
                onClick={handleSaveGoal}
                className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tabular-nums">
              {dailyGoal}
            </div>
          )}

          <div className="text-[11px] text-slate-400">
            Recommended: 300 - 500 daily
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Habit Streak</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-1 text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
            <span>{streakDays}</span>
            <span className="text-xs font-normal text-slate-400">days active</span>
          </div>
          <div className="text-[11px] text-emerald-400">
            Keep steadfast after every prayer
          </div>
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="rounded-2xl border border-emerald-900/50 bg-slate-900/70 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Today's Spiritual Goal Completion
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400 tabular-nums">
            {goalPercent}%
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-500"
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>0 recitations</span>
          <span>{todayRecord.totalRecitations} recited</span>
          <span>{dailyGoal} target</span>
        </div>
      </div>

      {/* Sessions Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">
            Session Progress by Dhikr
          </h3>
          <span className="text-xs text-slate-400">
            {activeDhikrs.length} active sessions today
          </span>
        </div>

        <div className="space-y-2.5">
          {activeDhikrs.map(({ item, count }) => {
            const itemTarget = item.targetCount || 33;
            const itemPercent = Math.min(100, Math.round((count / itemTarget) * 100));

            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="text-[11px] text-slate-400">{item.transliteration}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-amber-300 tabular-nums">
                        {count}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {' '}/ {itemTarget}
                      </span>
                    </div>

                    <button
                      onClick={() => onStartTasbeeh(item)}
                      title="Continue reciting"
                      className="p-1.5 rounded-lg bg-emerald-600/80 text-white hover:bg-emerald-500 transition"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${itemPercent}%` }}
                  />
                </div>
              </div>
            );
          })}

          {activeDhikrs.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center space-y-2">
              <BarChart3 className="w-6 h-6 text-slate-600 mx-auto" />
              <h4 className="text-xs font-semibold text-slate-300">No Recitations Recorded Today</h4>
              <p className="text-[11px] text-slate-500">
                Start a post-prayer session or pick a dhikr from the library to begin recording your progress.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
