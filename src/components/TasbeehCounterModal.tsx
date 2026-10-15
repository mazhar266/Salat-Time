import React, { useState, useEffect } from 'react';
import { X, RotateCcw, ChevronRight, CheckCircle2, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DhikrItem } from '../utils/dhikrData';
import { soundEngine } from '../utils/audioAlerts';

interface TasbeehCounterModalProps {
  sessionPlaylist: DhikrItem[];
  initialIndex?: number;
  onClose: () => void;
  onRecordRecitation: (dhikrId: string, countDelta: number) => void;
}

export const TasbeehCounterModal: React.FC<TasbeehCounterModalProps> = ({
  sessionPlaylist,
  initialIndex = 0,
  onClose,
  onRecordRecitation
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [currentCount, setCurrentCount] = useState<number>(0);
  const [sessionCompletedIds, setSessionCompletedIds] = useState<string[]>([]);

  const currentItem: DhikrItem | undefined = sessionPlaylist[currentIndex];

  useEffect(() => {
    setCurrentCount(0);
  }, [currentIndex]);

  if (!currentItem) return null;

  const target = currentItem.targetCount || 33;
  const progressPercent = Math.min(100, (currentCount / target) * 100);

  const handleIncrement = () => {
    const nextCount = currentCount + 1;
    setCurrentCount(nextCount);
    soundEngine.playTasbeehTick();
    onRecordRecitation(currentItem.id, 1);

    if (nextCount === target) {
      soundEngine.playCompletionChime();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      setSessionCompletedIds((prev) => [...new Set([...prev, currentItem.id])]);
    }
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentCount(0);
  };

  const handleNextDhikr = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex < sessionPlaylist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 }
      });
    }
  };

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md">
      <div className="relative flex flex-col justify-between w-full max-w-lg min-h-[90vh] sm:min-h-[600px] rounded-3xl border border-emerald-900/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Session {currentIndex + 1} of {sessionPlaylist.length}
              </span>
              {sessionCompletedIds.includes(currentItem.id) && (
                <span className="flex items-center gap-1 text-[10px] text-amber-300 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Target Reached
                </span>
              )}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[260px]">
              {currentItem.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset current count"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="Close Tasbeeh"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Display */}
        <div className="my-auto py-4 space-y-4 text-center select-none">
          <div
            className="font-serif text-2xl sm:text-3xl font-bold leading-relaxed text-amber-200"
            dir="rtl"
          >
            {currentItem.arabic}
          </div>

          <div className="text-xs sm:text-sm text-slate-300 italic">
            "{currentItem.transliteration}"
          </div>

          <div className="text-xs text-slate-400 max-w-sm mx-auto line-clamp-2">
            {currentItem.translation}
          </div>

          {/* Interactive Counter Ring Button */}
          <div className="relative mx-auto my-6 flex items-center justify-center">
            <button
              onClick={handleIncrement}
              className="group relative flex h-56 w-56 sm:h-64 sm:w-64 items-center justify-center rounded-full bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 shadow-2xl active:scale-95 transition-transform duration-100 cursor-pointer focus:outline-none"
              aria-label={`Tap to increment recitation of ${currentItem.title}`}
            >
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 240 240">
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  stroke="rgba(30, 41, 59, 0.8)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="120"
                  cy="120"
                  r={radius}
                  stroke="url(#emeraldGradient)"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-150 ease-out"
                />
                <defs>
                  <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#facc15" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="flex flex-col items-center">
                <span className="text-5xl sm:text-6xl font-black font-mono text-white tabular-nums drop-shadow-md">
                  {currentCount}
                </span>
                <span className="text-xs font-semibold text-slate-400 font-mono mt-1">
                  of {target}
                </span>
                <span className="text-[11px] text-emerald-400/80 font-medium mt-2">
                  Tap anywhere
                </span>
              </div>
            </button>
          </div>

          {/* Linear Progress Bar for Current Session */}
          <div className="space-y-1.5 max-w-xs mx-auto">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{Math.round(progressPercent)}% Done</span>
              <span>Target: {target}x</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-200"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {currentIndex < sessionPlaylist.length - 1 ? (
              <span>Next: {sessionPlaylist[currentIndex + 1].title}</span>
            ) : (
              <span className="text-amber-300 font-medium">Final Dhikr in Routine</span>
            )}
          </div>

          {currentIndex < sessionPlaylist.length - 1 ? (
            <button
              onClick={handleNextDhikr}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                currentCount >= target
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 animate-pulse'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              <span>Next Dhikr</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-sm"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Complete Session</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
