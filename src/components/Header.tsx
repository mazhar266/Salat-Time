import React from 'react';
import { Compass, Clock, BookOpen, ListOrdered, BarChart3, Volume2, Download, Bell, BellOff } from 'lucide-react';

export type ActiveTab = 'prayers' | 'qibla' | 'dhikr' | 'routine' | 'tracker';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onTestAdhan: () => void;
  isAdhanPlaying: boolean;
  onOpenInstallGuide: () => void;
  isInstallable: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notificationsEnabled,
  onToggleNotifications,
  onTestAdhan,
  isAdhanPlaying,
  onOpenInstallGuide,
  isInstallable
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-950/60 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-3.5">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-950 text-amber-300 shadow-inner">
            <span className="font-serif text-lg font-bold">ن</span>
          </div>
          <button
            onClick={() => setActiveTab('prayers')}
            className="text-left group cursor-pointer focus-visible:outline-none"
          >
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              NoorSalat
            </span>
            <span className="hidden sm:inline-block text-xs text-emerald-400/80 ml-2 font-medium">
              Arctic & Finland Ready
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop md+ screens) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('prayers')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'prayers'
                ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Prayers</span>
          </button>

          <button
            onClick={() => setActiveTab('qibla')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'qibla'
                ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Qibla</span>
          </button>

          <button
            onClick={() => setActiveTab('routine')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'routine'
                ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Post-Prayer</span>
          </button>

          <button
            onClick={() => setActiveTab('dhikr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dhikr'
                ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dhikr & Dua</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'tracker'
                ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-700/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Tracker</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Audio controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTestAdhan}
            title={isAdhanPlaying ? 'Stop Adhan' : 'Test Adhan Audio'}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              isAdhanPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAdhanPlaying ? 'Playing' : 'Adhan Test'}</span>
          </button>

          <button
            onClick={onToggleNotifications}
            title={notificationsEnabled ? 'Adhan Notifications Active' : 'Enable Adhan Notifications'}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              notificationsEnabled
                ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenInstallGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install PWA</span>
            <span className="sm:hidden">App</span>
          </button>
        </div>
      </div>
    </header>
  );
};
