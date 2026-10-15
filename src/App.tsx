/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalculationMethod,
  HighLatitudeRule,
  AsrJuristic,
  LocationCoordinates,
  PRESET_LOCATIONS,
  calculatePrayerTimes
} from './utils/prayerTimes';
import {
  Clock,
  Compass,
  ListOrdered,
  BookOpen,
  BarChart3
} from 'lucide-react';
import {
  DhikrItem,
  DailyRecitationRecord,
  INITIAL_DHIKR_LIBRARY,
  STORAGE_KEYS,
  getTodayDateString
} from './utils/dhikrData';
import {
  soundEngine,
  requestNotificationPermission,
  sendPrayerNotification
} from './utils/audioAlerts';
import { Header, ActiveTab } from './components/Header';
import { PrayerTimerView } from './components/PrayerTimerView';
import { QiblaCompassView } from './components/QiblaCompassView';
import { DhikrLibraryView } from './components/DhikrLibraryView';
import { PostPrayerBuilderView } from './components/PostPrayerBuilderView';
import { DailyTrackerView } from './components/DailyTrackerView';
import { TasbeehCounterModal } from './components/TasbeehCounterModal';
import { CreateCustomDhikrModal } from './components/CreateCustomDhikrModal';
import { PWAInstallGuideModal } from './components/PWAInstallGuideModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('prayers');

  const [location, setLocation] = useState<LocationCoordinates>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('noorsalat_location');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return PRESET_LOCATIONS[0]; // Helsinki, Finland default
  });

  const [method, setMethod] = useState<CalculationMethod>('FINLAND');
  const [highLatRule, setHighLatRule] = useState<HighLatitudeRule>('NEAREST_LATITUDE');
  const [asrJuristic, setAsrJuristic] = useState<AsrJuristic>('STANDARD');

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isAdhanPlaying, setIsAdhanPlaying] = useState<boolean>(false);
  const [stopAdhanFn, setStopAdhanFn] = useState<(() => void) | null>(null);

  const [library, setLibrary] = useState<DhikrItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.DHIKR_LIBRARY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return INITIAL_DHIKR_LIBRARY;
  });

  const [routineMap, setRoutineMap] = useState<Record<string, string[]>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.POST_PRAYER_PLAYLIST);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      all: [
        'post-istighfar',
        'post-salam',
        'post-ayat-kursi',
        'post-subhanallah',
        'post-alhamdulillah',
        'post-allahu-akbar',
        'post-tahlil-complete'
      ],
      fajr: [
        'post-istighfar',
        'post-salam',
        'post-fajr-protection',
        'post-fajr-knowledge',
        'post-ayat-kursi',
        'post-subhanallah',
        'post-alhamdulillah',
        'post-allahu-akbar',
        'post-tahlil-complete',
        'post-muawwidhat'
      ],
      maghrib: [
        'post-istighfar',
        'post-salam',
        'post-fajr-protection',
        'post-ayat-kursi',
        'post-subhanallah',
        'post-alhamdulillah',
        'post-allahu-akbar',
        'post-tahlil-complete',
        'post-muawwidhat'
      ]
    };
  });

  const todayDateStr = getTodayDateString();
  const [dailyGoal, setDailyGoal] = useState<number>(300);
  const [streakDays] = useState<number>(3);
  const [todayRecord, setTodayRecord] = useState<DailyRecitationRecord>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEYS.DAILY_RECORDS}_${todayDateStr}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {
      date: todayDateStr,
      totalRecitations: 0,
      completedDhikrsCount: 0,
      dhikrCounts: {}
    };
  });

  const [activeSessionPlaylist, setActiveSessionPlaylist] = useState<DhikrItem[] | null>(null);
  const [showCreateCustomModal, setShowCreateCustomModal] = useState<boolean>(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState<boolean>(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('noorsalat_location', JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.DHIKR_LIBRARY, JSON.stringify(library));
  }, [library]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.POST_PRAYER_PLAYLIST, JSON.stringify(routineMap));
  }, [routineMap]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEYS.DAILY_RECORDS}_${todayDateStr}`, JSON.stringify(todayRecord));
  }, [todayRecord, todayDateStr]);

  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(new Date(), location.latitude, location.longitude, {
      method,
      highLatitudeRule: highLatRule,
      asrJuristic
    });
  }, [location, method, highLatRule, asrJuristic]);

  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const prayersToCheck = [
        { name: 'Fajr', time: prayerTimes.fajr },
        { name: 'Dhuhr', time: prayerTimes.dhuhr },
        { name: 'Asr', time: prayerTimes.asr },
        { name: 'Maghrib', time: prayerTimes.maghrib },
        { name: 'Isha', time: prayerTimes.isha }
      ];

      for (const p of prayersToCheck) {
        const pMinutes = p.time.getHours() * 60 + p.time.getMinutes();
        if (currentMinutes === pMinutes && now.getSeconds() < 15) {
          sendPrayerNotification(p.name, location.name);
          break;
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [notificationsEnabled, prayerTimes, location]);

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const perm = await requestNotificationPermission();
      if (perm === 'granted') {
        setNotificationsEnabled(true);
      } else {
        alert('Please allow notification permission in your browser or device settings to receive Adhan reminders.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleTestAdhan = () => {
    if (isAdhanPlaying) {
      if (stopAdhanFn) stopAdhanFn();
      setIsAdhanPlaying(false);
      setStopAdhanFn(null);
    } else {
      setIsAdhanPlaying(true);
      const stop = soundEngine.playAdhanSample();
      setStopAdhanFn(() => stop);
      setTimeout(() => {
        setIsAdhanPlaying(false);
        setStopAdhanFn(null);
      }, 10000);
    }
  };

  const handleStartTasbeehSingle = (dhikr: DhikrItem) => {
    setActiveSessionPlaylist([dhikr]);
  };

  const handleStartPostPrayerRoutine = (prayerName: string) => {
    const key = prayerName.toLowerCase();
    const ids = routineMap[key] || routineMap['all'] || [];
    const items = ids
      .map((id) => library.find((d) => d.id === id))
      .filter((d): d is DhikrItem => Boolean(d));

    if (items.length > 0) {
      setActiveSessionPlaylist(items);
    } else {
      const fallback = library.filter((d) => d.category === 'after_prayer');
      setActiveSessionPlaylist(fallback);
    }
  };

  const handleRecordRecitation = (dhikrId: string, countDelta: number) => {
    setTodayRecord((prev) => {
      const currentCount = prev.dhikrCounts[dhikrId] || 0;
      const updatedCounts = {
        ...prev.dhikrCounts,
        [dhikrId]: currentCount + countDelta
      };
      return {
        ...prev,
        totalRecitations: prev.totalRecitations + countDelta,
        dhikrCounts: updatedCounts
      };
    });
  };

  const handleAddToPostPrayer = (dhikr: DhikrItem) => {
    setRoutineMap((prev) => {
      const current = prev['all'] || [];
      if (current.includes(dhikr.id)) return prev;
      return {
        ...prev,
        all: [...current, dhikr.id]
      };
    });
  };

  const handleSaveCustomDhikr = (newItem: DhikrItem) => {
    setLibrary((prev) => [newItem, ...prev]);
    const assigned = newItem.assignedPrayers || ['all'];
    assigned.forEach((prayer) => {
      setRoutineMap((prev) => {
        const list = prev[prayer] || [];
        return {
          ...prev,
          [prayer]: [...list, newItem.id]
        };
      });
    });
  };

  const handleUpdateRoutine = (prayerName: string, dhikrIds: string[]) => {
    setRoutineMap((prev) => ({
      ...prev,
      [prayerName]: dhikrIds
    }));
  };

  const handleUpdateDhikrTarget = (dhikrId: string, newTarget: number) => {
    setLibrary((prev) =>
      prev.map((item) => (item.id === dhikrId ? { ...item, targetCount: newTarget } : item))
    );
  };

  const handleResetRoutine = () => {
    setRoutineMap({
      all: [
        'post-istighfar',
        'post-salam',
        'post-ayat-kursi',
        'post-subhanallah',
        'post-alhamdulillah',
        'post-allahu-akbar',
        'post-tahlil-complete'
      ],
      fajr: [
        'post-istighfar',
        'post-salam',
        'post-fajr-protection',
        'post-fajr-knowledge',
        'post-ayat-kursi',
        'post-subhanallah',
        'post-alhamdulillah',
        'post-allahu-akbar',
        'post-tahlil-complete',
        'post-muawwidhat'
      ],
      maghrib: [
        'post-istighfar',
        'post-salam',
        'post-fajr-protection',
        'post-ayat-kursi',
        'post-subhanallah',
        'post-alhamdulillah',
        'post-allahu-akbar',
        'post-tahlil-complete',
        'post-muawwidhat'
      ]
    });
  };

  const handleResetTodayStats = () => {
    setTodayRecord({
      date: todayDateStr,
      totalRecitations: 0,
      completedDhikrsCount: 0,
      dhikrCounts: {}
    });
  };

  const postPrayerIds = routineMap['all'] || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
        onTestAdhan={handleTestAdhan}
        isAdhanPlaying={isAdhanPlaying}
        onOpenInstallGuide={() => setShowInstallGuideModal(true)}
        isInstallable={Boolean(deferredPrompt)}
      />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 pb-24 md:pb-8">
        {activeTab === 'prayers' && (
          <PrayerTimerView
            location={location}
            setLocation={setLocation}
            method={method}
            setMethod={setMethod}
            highLatRule={highLatRule}
            setHighLatRule={setHighLatRule}
            asrJuristic={asrJuristic}
            setAsrJuristic={setAsrJuristic}
            prayerTimes={prayerTimes}
            onStartPostPrayerRoutine={handleStartPostPrayerRoutine}
            onPlayAdhan={handleTestAdhan}
            isAdhanPlaying={isAdhanPlaying}
          />
        )}

        {activeTab === 'qibla' && (
          <QiblaCompassView location={location} />
        )}

        {activeTab === 'routine' && (
          <PostPrayerBuilderView
            library={library}
            routineMap={routineMap}
            onUpdateRoutine={handleUpdateRoutine}
            onUpdateDhikrTarget={handleUpdateDhikrTarget}
            onStartRoutineSession={handleStartPostPrayerRoutine}
            onOpenCreateCustom={() => setShowCreateCustomModal(true)}
            onResetToDefault={handleResetRoutine}
          />
        )}

        {activeTab === 'dhikr' && (
          <DhikrLibraryView
            library={library}
            onStartTasbeeh={handleStartTasbeehSingle}
            onAddToPostPrayer={handleAddToPostPrayer}
            postPrayerIds={postPrayerIds}
            onOpenCreateCustom={() => setShowCreateCustomModal(true)}
          />
        )}

        {activeTab === 'tracker' && (
          <DailyTrackerView
            library={library}
            todayRecord={todayRecord}
            dailyGoal={dailyGoal}
            onUpdateDailyGoal={setDailyGoal}
            streakDays={streakDays}
            onStartTasbeeh={handleStartTasbeehSingle}
            onResetToday={handleResetTodayStats}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-slate-800/90 bg-slate-950/95 py-2 px-1 backdrop-blur-lg">
        <button
          onClick={() => setActiveTab('prayers')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'prayers' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>Prayers</span>
        </button>

        <button
          onClick={() => setActiveTab('qibla')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'qibla' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Qibla</span>
        </button>

        <button
          onClick={() => setActiveTab('routine')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'routine' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span>Routine</span>
        </button>

        <button
          onClick={() => setActiveTab('dhikr')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'dhikr' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Dhikr</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] font-semibold transition ${
            activeTab === 'tracker' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>Tracker</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">NoorSalat</span>
            <span aria-hidden="true">·</span>
            <span>Designed for Finland, Arctic, and Global Muslim Communities</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>ECFR 45° Rule</span>
            <span aria-hidden="true">·</span>
            <span>Geodesic Qibla</span>
            <span aria-hidden="true">·</span>
            <span>Web Audio Adhan</span>
          </div>
        </div>
      </footer>

      {activeSessionPlaylist && (
        <TasbeehCounterModal
          sessionPlaylist={activeSessionPlaylist}
          onClose={() => setActiveSessionPlaylist(null)}
          onRecordRecitation={handleRecordRecitation}
        />
      )}

      {showCreateCustomModal && (
        <CreateCustomDhikrModal
          onClose={() => setShowCreateCustomModal(false)}
          onSave={handleSaveCustomDhikr}
        />
      )}

      {showInstallGuideModal && (
        <PWAInstallGuideModal
          onClose={() => setShowInstallGuideModal(false)}
          onInstallPrompt={() => {
            if (deferredPrompt) {
              deferredPrompt.prompt();
              deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
            }
          }}
          isInstallable={Boolean(deferredPrompt)}
          isIOS={isIOS}
        />
      )}
    </div>
  );
}
