import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Compass,
  AlertTriangle,
  Settings2,
  Volume2,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  CloudSun,
  Navigation
} from 'lucide-react';
import {
  CalculationMethod,
  HighLatitudeRule,
  AsrJuristic,
  LocationCoordinates,
  PrayerTimesResult,
  PRESET_LOCATIONS,
  calculatePrayerTimes,
  getNextPrayer
} from '../utils/prayerTimes';

interface PrayerTimerViewProps {
  location: LocationCoordinates;
  setLocation: (loc: LocationCoordinates) => void;
  method: CalculationMethod;
  setMethod: (m: CalculationMethod) => void;
  highLatRule: HighLatitudeRule;
  setHighLatRule: (r: HighLatitudeRule) => void;
  asrJuristic: AsrJuristic;
  setAsrJuristic: (j: AsrJuristic) => void;
  prayerTimes: PrayerTimesResult;
  onStartPostPrayerRoutine: (prayerName: string) => void;
  onPlayAdhan: () => void;
  isAdhanPlaying: boolean;
}

export const PrayerTimerView: React.FC<PrayerTimerViewProps> = ({
  location,
  setLocation,
  method,
  setMethod,
  highLatRule,
  setHighLatRule,
  asrJuristic,
  setAsrJuristic,
  prayerTimes,
  onStartPostPrayerRoutine,
  onPlayAdhan,
  isAdhanPlaying
}) => {
  const [now, setNow] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const nextInfo = getNextPrayer(prayerTimes, now);

  const formatCountdown = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lng = Math.round(pos.coords.longitude * 10000) / 10000;
        setLocation({
          name: `Current (${lat > 0 ? lat + '°N' : -lat + '°S'})`,
          country: 'GPS Detected',
          latitude: lat,
          longitude: lng
        });
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(err.message || 'Unable to retrieve location.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const prayerCards: Array<{
    name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
    time: Date;
    arabicName: string;
    icon: React.ReactNode;
    isObligatory: boolean;
  }> = [
    { name: 'Fajr', time: prayerTimes.fajr, arabicName: 'الفجر', icon: <Sunrise className="w-5 h-5 text-indigo-400" />, isObligatory: true },
    { name: 'Sunrise', time: prayerTimes.sunrise, arabicName: 'الشروق', icon: <Sun className="w-5 h-5 text-amber-400" />, isObligatory: false },
    { name: 'Dhuhr', time: prayerTimes.dhuhr, arabicName: 'الظهر', icon: <CloudSun className="w-5 h-5 text-yellow-300" />, isObligatory: true },
    { name: 'Asr', time: prayerTimes.asr, arabicName: 'العصر', icon: <Sun className="w-5 h-5 text-orange-400" />, isObligatory: true },
    { name: 'Maghrib', time: prayerTimes.maghrib, arabicName: 'المغرب', icon: <Sunset className="w-5 h-5 text-rose-400" />, isObligatory: true },
    { name: 'Isha', time: prayerTimes.isha, arabicName: 'العشاء', icon: <Moon className="w-5 h-5 text-blue-400" />, isObligatory: true }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Location Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-800/50">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white sm:text-lg">{location.name}</h2>
              <span className="text-xs text-slate-400 font-medium">({location.country})</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{location.latitude.toFixed(2)}° N</span>
              <span aria-hidden="true">·</span>
              <span>{location.longitude.toFixed(2)}° E</span>
              {location.latitude >= 60 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400 font-medium">Nordic / High Lat</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={location.name}
            onChange={(e) => {
              const selected = PRESET_LOCATIONS.find((l) => l.name === e.target.value);
              if (selected) setLocation(selected);
            }}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <optgroup label="Finland & Arctic">
              <option value="Helsinki">Helsinki, Finland</option>
              <option value="Tampere">Tampere, Finland</option>
              <option value="Oulu">Oulu, Finland</option>
              <option value="Rovaniemi (Lapland)">Rovaniemi, Finland</option>
              <option value="Utsjoki (Arctic Circle)">Utsjoki, Finland</option>
              <option value="North Pole">North Pole (90°N)</option>
              <option value="Longyearbyen">Longyearbyen (Svalbard)</option>
            </optgroup>
            <optgroup label="International">
              <option value="Mecca">Mecca, Saudi Arabia</option>
              <option value="Medina">Medina, Saudi Arabia</option>
              <option value="London">London, UK</option>
              <option value="New York">New York, USA</option>
              <option value="Istanbul">Istanbul, Turkey</option>
            </optgroup>
          </select>

          <button
            onClick={handleUseGeolocation}
            disabled={geoLoading}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{geoLoading ? 'Locating...' : 'GPS'}</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
              showSettings
                ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Fiqh Method</span>
          </button>
        </div>
      </div>

      {geoError && (
        <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
          {geoError}
        </div>
      )}

      {/* High Latitude Notice for Finland or Arctic / North Pole */}
      {prayerTimes.isExtremeLatitude && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-900/40 bg-gradient-to-r from-amber-950/30 to-slate-900 p-4 text-xs text-amber-200/90">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-amber-300">
              High-Latitude Islamic Adjustment Active ({prayerTimes.extremeCondition?.replace('_', ' ').toUpperCase() || 'ARCTIC ZONE'})
            </div>
            <p className="text-slate-300 leading-relaxed">
              At this northern latitude ({location.latitude.toFixed(1)}°N), standard astronomical twilight does not reach standard solar depression during summer (White Nights) or winter (Polar Night). Times are calculated following European Council for Fatwa and Research (ECFR) and Islamic Cultural Centre of Finland standards using the{' '}
              <strong className="text-amber-300 font-medium">
                {prayerTimes.appliedHighLatitudeRule.replace('_', ' ')}
              </strong>{' '}
              rule.
            </p>
          </div>
        </div>
      )}

      {/* Settings Panel Drawer */}
      {showSettings && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Calculation & High-Latitude Rules</h3>
            <span className="text-xs text-emerald-400">ECFR & MWL Compliant</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Calculation Standard</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as CalculationMethod)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="FINLAND">Islamic Cultural Centre of Finland</option>
                <option value="ECFR">European Council for Fatwa & Research (ECFR)</option>
                <option value="MWL">Muslim World League (MWL)</option>
                <option value="MAKKAH">Umm al-Qura University, Makkah</option>
                <option value="ISNA">Islamic Society of North America (ISNA)</option>
                <option value="KARACHI">University of Islamic Sciences, Karachi</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">High-Latitude Adjustment</label>
              <select
                value={highLatRule}
                onChange={(e) => setHighLatRule(e.target.value as HighLatitudeRule)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="NEAREST_LATITUDE">Nearest Latitude 45° (ECFR Standard)</option>
                <option value="ONE_SEVENTH">One-Seventh of Night Rule</option>
                <option value="MIDDLE_OF_NIGHT">Middle of the Night Rule</option>
                <option value="ANGLE_BASED">Angle-Based Rule (Angle / 60)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1.5">Asr Jurisprudence (Madhhab)</label>
              <select
                value={asrJuristic}
                onChange={(e) => setAsrJuristic(e.target.value as AsrJuristic)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="STANDARD">Standard (Shafi'i, Maliki, Hanbali - Factor 1)</option>
                <option value="HANAFI">Hanafi (Factor 2)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Hero: Current Prayer & Live Countdown Card */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-900/60 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 p-6 sm:p-8 text-center shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/60 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <span>Next Prayer: {nextInfo.nextPrayer}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{formatTime(nextInfo.nextPrayerTime)}</span>
          </div>

          <div>
            <div className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono tabular-nums">
              {formatCountdown(nextInfo.timeRemainingSeconds)}
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Remaining until {nextInfo.nextPrayer} prayer in {location.name}
            </p>
          </div>

          {/* Progress Bar towards next prayer */}
          <div className="mx-auto max-w-md space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>{nextInfo.currentPrayer}</span>
              <span>{Math.round(nextInfo.progressPercent)}% elapsed</span>
              <span>{nextInfo.nextPrayer}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-1000 ease-linear"
                style={{ width: `${nextInfo.progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Action Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={onPlayAdhan}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-sm transition ${
                isAdhanPlaying
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isAdhanPlaying ? 'Playing Adhan...' : 'Play Adhan'}</span>
            </button>

            <button
              onClick={() => onStartPostPrayerRoutine(nextInfo.currentPrayer)}
              className="flex items-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/40 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Post-{nextInfo.currentPrayer} Dhikr</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Prayer Schedule Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Today's Prayer Schedule</h3>
          <span className="text-xs text-slate-400">
            {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {prayerCards.map((card) => {
            const isNext = nextInfo.nextPrayer === card.name;
            const isCurrent = nextInfo.currentPrayer === card.name;

            return (
              <div
                key={card.name}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 transition ${
                  isNext
                    ? 'border-emerald-500/80 bg-emerald-950/40 shadow-lg ring-1 ring-emerald-500/30'
                    : isCurrent
                    ? 'border-slate-700 bg-slate-900/80'
                    : 'border-slate-850 bg-slate-900/40 hover:bg-slate-900/70'
                }`}
              >
                {isNext && (
                  <span className="absolute -top-2 right-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-950">
                    Next
                  </span>
                )}

                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50">
                    {card.icon}
                  </div>
                  <span className="font-serif text-sm font-bold text-slate-400">
                    {card.arabicName}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-300">{card.name}</div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-white tabular-nums">
                    {formatTime(card.time)}
                  </div>
                </div>

                {card.isObligatory && (
                  <button
                    onClick={() => onStartPostPrayerRoutine(card.name)}
                    className="mt-3 flex items-center justify-between text-[11px] text-emerald-400 hover:text-emerald-300 font-medium pt-2 border-t border-slate-800"
                  >
                    <span>Dhikr</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Night Times: Midnight & Qiyam (Tahajjud) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div className="flex items-center gap-2 text-slate-300">
            <Moon className="w-4 h-4 text-blue-400" />
            <div>
              <div className="font-semibold text-white">Islamic Midnight</div>
              <div className="text-[11px] text-slate-400">Halfway between sunset & sunrise</div>
            </div>
          </div>
          <span className="font-mono text-sm font-bold text-slate-200 tabular-nums">
            {formatTime(prayerTimes.midnight)}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-3.5">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <div className="font-semibold text-white">Qiyam al-Layl (Tahajjud)</div>
              <div className="text-[11px] text-slate-400">Last third of the blessed night</div>
            </div>
          </div>
          <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
            {formatTime(prayerTimes.qiyam)}
          </span>
        </div>
      </div>
    </div>
  );
};
