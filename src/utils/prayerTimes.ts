/**
 * Precision Islamic Prayer Times Calculation Engine
 * Includes High-Latitude & Arctic / Polar adjustments for Finland & North Pole
 * Based on astronomical algorithms and Islamic Fiqh standards (MWL, ECFR, Islamic Cultural Centre of Finland)
 */

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  qiyam: Date; // Last third of the night
  midnight: Date;
  isExtremeLatitude: boolean;
  extremeCondition?: 'white_nights' | 'polar_day' | 'polar_night' | 'abnormal_twilight';
  appliedHighLatitudeRule: HighLatitudeRule;
  solarNoon: Date;
}

export type CalculationMethod =
  | 'MWL' // Muslim World League (Fajr 18, Isha 17)
  | 'ECFR' // European Council for Fatwa and Research (Fajr 18, Isha 17 with 45° rule)
  | 'FINLAND' // Islamic Cultural Centre of Finland / Scandinavian (Fajr 15-18 with 45°/1/7th blend)
  | 'ISNA' // Islamic Society of North America (Fajr 15, Isha 15)
  | 'MAKKAH' // Umm al-Qura University, Makkah (Fajr 18.5, Isha +90 min)
  | 'EGYPT' // Egyptian General Authority (Fajr 19.5, Isha 17.5)
  | 'KARACHI'; // Univ of Islamic Sciences, Karachi (Fajr 18, Isha 18)

export type HighLatitudeRule =
  | 'NEAREST_LATITUDE' // 45° or 48.5° rule (Recommended for Finland & Northern Europe)
  | 'ONE_SEVENTH' // 1/7th of the night
  | 'MIDDLE_OF_NIGHT' // Half of the night
  | 'ANGLE_BASED' // Angle / 60 of the night
  | 'MECCA_INTERVALS'; // Makkah time proportion (Essential for Polar Day/Night at North Pole)

export type AsrJuristic = 'STANDARD' | 'HANAFI'; // Standard (Shafi'i/Maliki/Hanbali) = 1, Hanafi = 2

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  timezone?: string;
  elevation?: number;
}

export const PRESET_LOCATIONS: LocationCoordinates[] = [
  { name: 'Helsinki', country: 'Finland', latitude: 60.1699, longitude: 24.9384 },
  { name: 'Tampere', country: 'Finland', latitude: 61.4978, longitude: 23.7610 },
  { name: 'Oulu', country: 'Finland', latitude: 65.0121, longitude: 25.4651 },
  { name: 'Rovaniemi (Lapland)', country: 'Finland', latitude: 66.5039, longitude: 25.7294 },
  { name: 'Utsjoki (Arctic Circle)', country: 'Finland', latitude: 69.9086, longitude: 27.0284 },
  { name: 'North Pole', country: 'Arctic', latitude: 90.0, longitude: 0.0 },
  { name: 'Longyearbyen', country: 'Svalbard', latitude: 78.2232, longitude: 15.6267 },
  { name: 'Mecca', country: 'Saudi Arabia', latitude: 21.4225, longitude: 39.8262 },
  { name: 'Medina', country: 'Saudi Arabia', latitude: 24.5247, longitude: 39.5692 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.006 },
  { name: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.139, longitude: 101.6869 }
];

// Calculation Method Angles
interface MethodAngles {
  fajrAngle: number;
  ishaAngle: number;
  ishaIntervalMinutes?: number;
}

export function getMethodAngles(method: CalculationMethod): MethodAngles {
  switch (method) {
    case 'MWL':
      return { fajrAngle: 18.0, ishaAngle: 17.0 };
    case 'ECFR':
      return { fajrAngle: 18.0, ishaAngle: 17.0 };
    case 'FINLAND':
      return { fajrAngle: 15.0, ishaAngle: 15.0 };
    case 'ISNA':
      return { fajrAngle: 15.0, ishaAngle: 15.0 };
    case 'MAKKAH':
      return { fajrAngle: 18.5, ishaAngle: 0, ishaIntervalMinutes: 90 };
    case 'EGYPT':
      return { fajrAngle: 19.5, ishaAngle: 17.5 };
    case 'KARACHI':
      return { fajrAngle: 18.0, ishaAngle: 18.0 };
    default:
      return { fajrAngle: 18.0, ishaAngle: 17.0 };
  }
}

// Math conversions
const d2r = (d: number) => (d * Math.PI) / 180.0;
const r2d = (r: number) => (r * 180.0) / Math.PI;

function normalizeHours(h: number): number {
  let val = h % 24;
  if (val < 0) val += 24;
  return val;
}

/**
 * Calculates solar position for Julian Day
 */
function getSunPosition(jd: number) {
  const d = jd - 2451545.0;
  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;
  const L = q + 1.915 * Math.sin(d2r(g)) + 0.02 * Math.sin(d2r(2 * g));

  const e = 23.439 - 0.00000036 * d;
  const RA = r2d(Math.atan2(Math.cos(d2r(e)) * Math.sin(d2r(L)), Math.cos(d2r(L)))) / 15.0;
  const D = r2d(Math.asin(Math.sin(d2r(e)) * Math.sin(d2r(L)))); // Declination
  const EqT = q / 15.0 - normalizeHours(RA); // Equation of Time (hours)

  return { declination: D, equationOfTime: EqT };
}

function getJulianDay(date: Date): number {
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  const day = date.getDate();

  let y = year;
  let m = month;
  if (month <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    B -
    1524.5
  );
}

/**
 * Calculates the hour angle for a given zenith or elevation angle
 */
function getHourAngle(lat: number, dec: number, angleAboveHorizon: number): number | null {
  const sinAngle = Math.sin(d2r(angleAboveHorizon));
  const sinLat = Math.sin(d2r(lat));
  const cosLat = Math.cos(d2r(lat));
  const sinDec = Math.sin(d2r(dec));
  const cosDec = Math.cos(d2r(dec));

  const cosH = (sinAngle - sinLat * sinDec) / (cosLat * cosDec);
  if (cosH > 1.0 || cosH < -1.0) {
    return null; // Sun never reaches this elevation (polar day, polar night, or white night)
  }
  return r2d(Math.acos(cosH)) / 15.0; // Hours
}

/**
 * Asr hour angle given juristic shadow factor
 */
function getAsrHourAngle(lat: number, dec: number, factor: number): number | null {
  const shadowLength = factor + Math.tan(d2r(Math.abs(lat - dec)));
  const asrAlt = r2d(Math.atan(1.0 / shadowLength));
  return getHourAngle(lat, dec, asrAlt);
}

/**
 * Core prayer times computation function
 */
export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  options: {
    method?: CalculationMethod;
    highLatitudeRule?: HighLatitudeRule;
    asrJuristic?: AsrJuristic;
  } = {}
): PrayerTimesResult {
  const method = options.method || (latitude >= 55 ? 'FINLAND' : 'MWL');
  const highLatitudeRule = options.highLatitudeRule || 'NEAREST_LATITUDE';
  const asrJuristic = options.asrJuristic || 'STANDARD';
  const asrFactor = asrJuristic === 'HANAFI' ? 2 : 1;

  const methodAngles = getMethodAngles(method);

  // Timezone offset in hours
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60.0;

  // Clamped latitude for astronomical computations at the extreme poles
  const clampedLat = Math.max(-89.99, Math.min(89.99, latitude));

  const jd = getJulianDay(date);
  const sun = getSunPosition(jd);

  // Solar Noon (transit time) in local hours
  const noonHour = normalizeHours(12 + timezoneOffsetHours - longitude / 15.0 - sun.equationOfTime);

  // Sun elevation angles:
  // Sunrise/Sunset: standard atmospheric refraction + solar radius = -0.833°
  const sunsetAngle = -0.833;
  const fajrAngle = -methodAngles.fajrAngle;
  const ishaAngle = -methodAngles.ishaAngle;

  const sunriseH = getHourAngle(clampedLat, sun.declination, sunsetAngle);
  const fajrH = getHourAngle(clampedLat, sun.declination, fajrAngle);
  const asrH = getAsrHourAngle(clampedLat, sun.declination, asrFactor);
  const ishaH = methodAngles.ishaIntervalMinutes ? null : getHourAngle(clampedLat, sun.declination, ishaAngle);

  let isExtreme = false;
  let extremeCondition: PrayerTimesResult['extremeCondition'];

  // Check for polar night or polar day (sunriseH is null)
  const isPolarDay = sunriseH === null && clampedLat * sun.declination > 0;
  const isPolarNight = sunriseH === null && clampedLat * sun.declination <= 0;

  if (isPolarDay) {
    isExtreme = true;
    extremeCondition = 'polar_day';
  } else if (isPolarNight) {
    isExtreme = true;
    extremeCondition = 'polar_night';
  } else if (fajrH === null || (!methodAngles.ishaIntervalMinutes && ishaH === null)) {
    isExtreme = true;
    extremeCondition = 'white_nights';
  } else if (Math.abs(latitude) >= 50) {
    // High latitude check - even if math passes, verify twilight is not unnaturally short
    isExtreme = true;
    extremeCondition = 'abnormal_twilight';
  }

  // Calculate standard times in hours from midnight
  let dhuhrTime = noonHour + 2 / 60; // Sun passes zenith by 2-3 minutes for Dhuhr
  let sunriseTime: number;
  let sunsetTime: number;
  let fajrTime: number;
  let asrTime: number;
  let ishaTime: number;

  if (isPolarDay || isPolarNight) {
    // Continuous daylight or continuous night (Arctic Circle / North Pole in winter or summer)
    // Islamic Fiqh resolution (ECFR / MWL): Anchor to Mecca (Makkah) schedule intervals or nearest 45° latitude
    const proxyLat = 45.0 * (latitude >= 0 ? 1 : -1);
    const proxySunriseH = getHourAngle(proxyLat, sun.declination, sunsetAngle) || 6.0;
    const proxyFajrH = getHourAngle(proxyLat, sun.declination, fajrAngle) || 7.5;
    const proxyAsrH = getAsrHourAngle(proxyLat, sun.declination, asrFactor) || 3.5;
    const proxyIshaH = getHourAngle(proxyLat, sun.declination, ishaAngle) || 7.5;

    sunriseTime = normalizeHours(dhuhrTime - proxySunriseH);
    sunsetTime = normalizeHours(dhuhrTime + proxySunriseH);
    fajrTime = normalizeHours(dhuhrTime - proxyFajrH);
    asrTime = normalizeHours(dhuhrTime + proxyAsrH);
    ishaTime = methodAngles.ishaIntervalMinutes
      ? normalizeHours(sunsetTime + methodAngles.ishaIntervalMinutes / 60)
      : normalizeHours(dhuhrTime + proxyIshaH);
  } else {
    // Standard Sunrise and Sunset exist
    const halfDay = sunriseH as number;
    sunriseTime = normalizeHours(dhuhrTime - halfDay);
    sunsetTime = normalizeHours(dhuhrTime + halfDay);

    // Asr
    if (asrH !== null) {
      asrTime = normalizeHours(dhuhrTime + asrH);
    } else {
      // Fallback for extreme cases
      asrTime = normalizeHours(dhuhrTime + halfDay * 0.55);
    }

    // Length of night (hours between sunset and next sunrise)
    const nightDuration = 24 - halfDay * 2;

    // Fajr & Isha calculation with High-Latitude Fallbacks
    if (fajrH !== null && ishaH !== null && !extremeCondition) {
      // Normal astronomical twilight
      fajrTime = normalizeHours(dhuhrTime - fajrH);
      ishaTime = methodAngles.ishaIntervalMinutes
        ? normalizeHours(sunsetTime + methodAngles.ishaIntervalMinutes / 60)
        : normalizeHours(dhuhrTime + ishaH);
    } else {
      // High-latitude adjustment needed (Finland summers / White Nights)
      isExtreme = true;
      if (!extremeCondition) extremeCondition = 'white_nights';

      if (highLatitudeRule === 'NEAREST_LATITUDE') {
        // Shari'ah / 45° latitude standard approved by European Council for Fatwa and Research
        const proxyLat = 45.0 * (latitude >= 0 ? 1 : -1);
        const proxySunH = getHourAngle(proxyLat, sun.declination, sunsetAngle) || 6.0;
        const proxyFajrH = getHourAngle(proxyLat, sun.declination, fajrAngle) || 7.5;
        const proxyIshaH = getHourAngle(proxyLat, sun.declination, ishaAngle) || 7.5;

        const proxyFajrDiff = proxyFajrH - proxySunH; // Duration between Fajr and Sunrise at 45°
        const proxyIshaDiff = proxyIshaH - proxySunH; // Duration between Sunset and Isha at 45°

        fajrTime = normalizeHours(sunriseTime - proxyFajrDiff);
        ishaTime = methodAngles.ishaIntervalMinutes
          ? normalizeHours(sunsetTime + methodAngles.ishaIntervalMinutes / 60)
          : normalizeHours(sunsetTime + proxyIshaDiff);
      } else if (highLatitudeRule === 'ONE_SEVENTH') {
        // 1/7th of the night rule
        const portion = nightDuration / 7.0;
        fajrTime = normalizeHours(sunriseTime - portion);
        ishaTime = methodAngles.ishaIntervalMinutes
          ? normalizeHours(sunsetTime + methodAngles.ishaIntervalMinutes / 60)
          : normalizeHours(sunsetTime + portion);
      } else if (highLatitudeRule === 'MIDDLE_OF_NIGHT') {
        // Half of the night rule
        const portion = nightDuration / 2.0;
        fajrTime = normalizeHours(sunriseTime - portion);
        ishaTime = normalizeHours(sunsetTime + portion);
      } else {
        // Angle-based rule: portion = (angle / 60) * nightDuration
        const fajrPortion = (methodAngles.fajrAngle / 60.0) * nightDuration;
        const ishaPortion = (methodAngles.ishaAngle / 60.0) * nightDuration;
        fajrTime = normalizeHours(sunriseTime - fajrPortion);
        ishaTime = normalizeHours(sunsetTime + ishaPortion);
      }
    }
  }

  const toDate = (hours: number): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const ms = hours * 3600 * 1000;
    return new Date(d.getTime() + ms);
  };

  const fajrDate = toDate(fajrTime);
  const sunriseDate = toDate(sunriseTime);
  const dhuhrDate = toDate(dhuhrTime);
  const asrDate = toDate(asrTime);
  const maghribDate = toDate(sunsetTime);
  const ishaDate = toDate(ishaTime);

  // Midnight (halfway between sunset and next sunrise)
  let midnightMs = maghribDate.getTime() + ((sunriseDate.getTime() + 24 * 3600 * 1000 - maghribDate.getTime()) % (24 * 3600 * 1000)) / 2;
  const midnightDate = new Date(midnightMs);

  // Qiyam (last third of the night)
  const fullNightMs = ((sunriseDate.getTime() + 24 * 3600 * 1000 - maghribDate.getTime()) % (24 * 3600 * 1000));
  const qiyamDate = new Date(sunriseDate.getTime() - fullNightMs / 3);

  const solarNoonDate = toDate(noonHour);

  return {
    fajr: fajrDate,
    sunrise: sunriseDate,
    dhuhr: dhuhrDate,
    asr: asrDate,
    maghrib: maghribDate,
    isha: ishaDate,
    qiyam: qiyamDate,
    midnight: midnightDate,
    isExtremeLatitude: isExtreme,
    extremeCondition,
    appliedHighLatitudeRule: highLatitudeRule,
    solarNoon: solarNoonDate
  };
}

/**
 * Determines current prayer and time remaining until next prayer
 */
export function getNextPrayer(prayerTimes: PrayerTimesResult, now: Date = new Date()): {
  currentPrayer: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  nextPrayer: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  nextPrayerTime: Date;
  timeRemainingSeconds: number;
  progressPercent: number; // 0 to 100
} {
  const prayers: Array<{ name: 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'; time: Date }> = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Sunrise', time: prayerTimes.sunrise },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha }
  ];

  const nowMs = now.getTime();

  for (let i = 0; i < prayers.length; i++) {
    const current = prayers[i];
    const next = prayers[(i + 1) % prayers.length];

    let nextTimeMs = next.time.getTime();
    if (nextTimeMs <= current.time.getTime() && i === prayers.length - 1) {
      // Wraps to next day Fajr
      nextTimeMs += 24 * 3600 * 1000;
    }

    if (nowMs >= current.time.getTime() && (i === prayers.length - 1 || nowMs < prayers[i + 1].time.getTime())) {
      const remainingSeconds = Math.max(0, Math.floor((nextTimeMs - nowMs) / 1000));
      const intervalMs = nextTimeMs - current.time.getTime();
      const elapsedMs = nowMs - current.time.getTime();
      const progressPercent = Math.min(100, Math.max(0, (elapsedMs / intervalMs) * 100));

      return {
        currentPrayer: current.name,
        nextPrayer: next.name,
        nextPrayerTime: new Date(nextTimeMs),
        timeRemainingSeconds: remainingSeconds,
        progressPercent
      };
    }
  }

  // If before Fajr today
  const fajrMs = prayerTimes.fajr.getTime();
  const remainingSeconds = Math.max(0, Math.floor((fajrMs - nowMs) / 1000));
  return {
    currentPrayer: 'Isha',
    nextPrayer: 'Fajr',
    nextPrayerTime: prayerTimes.fajr,
    timeRemainingSeconds: remainingSeconds,
    progressPercent: 0
  };
}
