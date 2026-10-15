import React, { useState, useEffect } from 'react';
import { CheckCircle2, Info, Navigation, Sliders } from 'lucide-react';
import { LocationCoordinates } from '../utils/prayerTimes';
import { getQiblaInfo, QiblaInfo } from '../utils/qibla';

interface QiblaCompassViewProps {
  location: LocationCoordinates;
}

export const QiblaCompassView: React.FC<QiblaCompassViewProps> = ({ location }) => {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [useManual, setUseManual] = useState<boolean>(false);
  const [sensorPermission, setSensorPermission] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt');
  const [sensorMessage, setSensorMessage] = useState<string>('');

  const effectiveHeading = useManual ? manualHeading : deviceHeading;
  const qiblaInfo: QiblaInfo = getQiblaInfo(location.latitude, location.longitude, effectiveHeading);

  useEffect(() => {
    if (useManual) return;

    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setSensorPermission('unsupported');
      setSensorMessage('Device orientation sensors are not supported on this browser/desktop. Using compass calibration mode.');
      setUseManual(true);
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading: number | null = null;

      if ('webkitCompassHeading' in event && typeof (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading === 'number') {
        heading = (event as unknown as { webkitCompassHeading: number }).webkitCompassHeading;
      } else if (event.alpha !== null) {
        heading = (360 - event.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        setDeviceHeading(Math.round(heading));
        setSensorPermission('granted');
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [useManual]);

  const requestIOSPermission = async () => {
    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      'requestPermission' in DeviceOrientationEvent &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (response === 'granted') {
          setSensorPermission('granted');
        } else {
          setSensorPermission('denied');
          setUseManual(true);
        }
      } catch {
        setSensorPermission('denied');
        setUseManual(true);
      }
    } else {
      setUseManual(true);
    }
  };

  const dialRotation = effectiveHeading !== null ? -effectiveHeading : 0;
  const qiblaAngleOnDial = qiblaInfo.bearingDegrees;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white sm:text-lg">Qibla Direction</h2>
            <span className="text-xs text-emerald-400 font-semibold">Mecca Al-Mukarramah</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>From: {location.name}</span>
            <span aria-hidden="true">·</span>
            <span>Bearing: <strong className="text-amber-300 font-mono">{qiblaInfo.bearingDegrees}°</strong> ({qiblaInfo.compassCardinal})</span>
            <span aria-hidden="true">·</span>
            <span>Distance: <strong className="text-slate-200 font-mono">{qiblaInfo.distanceKm.toLocaleString()} km</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseManual(!useManual)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              useManual
                ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{useManual ? 'Manual Heading' : 'Device Sensors'}</span>
          </button>
        </div>
      </div>

      {/* Alignment status alert */}
      {qiblaInfo.isAligned ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500 bg-emerald-950/80 p-3.5 text-center text-sm font-bold text-emerald-300 shadow-lg shadow-emerald-950/50">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
          <span>ALIGNED WITH KAABA! Facing Directly Towards Mecca ({qiblaInfo.bearingDegrees}°)</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 text-center text-xs text-slate-300">
          <Navigation className="w-4 h-4 text-amber-400" />
          <span>
            Rotate your device {qiblaInfo.relativeBearing !== undefined ? `${Math.abs(Math.round(qiblaInfo.relativeBearing))}° ${qiblaInfo.relativeBearing > 0 ? 'Right' : 'Left'}` : 'to find Qibla'}{' '}
            to align with the golden Kaaba marker.
          </span>
        </div>
      )}

      {/* Arctic & North Pole Guidance Card */}
      {location.latitude >= 65 && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-900/50 bg-gradient-to-r from-blue-950/40 to-slate-900 p-4 text-xs text-blue-200">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-blue-300">
              Arctic & North Pole Great-Circle Alignment
            </div>
            <p className="text-slate-300 leading-relaxed">
              At {location.latitude.toFixed(1)}°N (Arctic Circle / North Pole), standard magnetic compasses exhibit strong declination. This compass calculates the geodesic great-circle true bearing ({qiblaInfo.bearingDegrees}° towards longitude 39.8°E in Mecca), ensuring you face the Kaaba along the shortest geodesic path on Earth.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Compass Dial */}
      <div className="relative mx-auto flex flex-col items-center justify-center py-6">
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl flex items-center justify-center select-none">
          {/* Outer ring tick marks */}
          <div
            className="absolute inset-0 rounded-full transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${dialRotation}deg)` }}
          >
            {/* Cardinal markers */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-black text-rose-500">N</div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">E</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-black text-slate-400">S</div>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">W</div>

            {/* Degree ticks */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute inset-0 flex justify-center"
                style={{ transform: `rotate(${deg}deg)` }}
              >
                <div className="h-2 w-0.5 bg-slate-700/80" />
              </div>
            ))}

            {/* Kaaba Marker on Dial */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-start"
              style={{ transform: `rotate(${qiblaAngleOnDial}deg)` }}
            >
              <div className="mt-1 flex flex-col items-center">
                <div className="h-7 w-7 rounded-lg bg-amber-400 border-2 border-amber-200 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-lg shadow-amber-500/50">
                  🕋
                </div>
                <div className="h-4 w-1 bg-amber-400 rounded-b" />
              </div>
            </div>
          </div>

          {/* Compass Needle (Points to Qibla) */}
          <div
            className="relative z-10 w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${dialRotation + qiblaAngleOnDial}deg)` }}
          >
            <div className="absolute top-0 w-3 h-24 bg-gradient-to-t from-emerald-600 to-amber-300 rounded-t-full shadow-lg" />
            <div className="absolute bottom-0 w-2 h-20 bg-slate-700/60 rounded-b-full" />
            <div className="h-8 w-8 rounded-full border-2 border-emerald-400 bg-slate-950 shadow-md flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-amber-400" />
            </div>
          </div>

          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-emerald-400 drop-shadow" />
          </div>
        </div>

        <div className="mt-6 text-center space-y-1">
          <div className="text-2xl font-black font-mono text-white tabular-nums">
            {effectiveHeading !== null ? `${effectiveHeading}°` : '---°'}
          </div>
          <div className="text-xs text-slate-400">
            Current Heading · Target Qibla: <span className="text-amber-400 font-bold">{qiblaInfo.bearingDegrees}° {qiblaInfo.compassCardinal}</span>
          </div>
        </div>
      </div>

      {useManual && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Simulate / Calibrate Device Heading</span>
            <span className="font-mono text-emerald-400">{manualHeading}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="359"
            value={manualHeading}
            onChange={(e) => setManualHeading(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0° (North)</span>
            <span>90° (East)</span>
            <span>180° (South)</span>
            <span>270° (West)</span>
          </div>
        </div>
      )}

      {!useManual && sensorPermission === 'prompt' && (
        <div className="text-center">
          <button
            onClick={requestIOSPermission}
            className="rounded-xl border border-emerald-700 bg-emerald-950/60 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900 transition"
          >
            Enable Live Motion Sensors (iOS)
          </button>
        </div>
      )}
    </div>
  );
};
