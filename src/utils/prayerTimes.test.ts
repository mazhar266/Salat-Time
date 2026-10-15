import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePrayerTimes, getNextPrayer, PRESET_LOCATIONS } from './prayerTimes.ts';
import { calculateQiblaBearing, calculateDistanceToKaaba, getQiblaInfo } from './qibla.ts';

test('Calculates valid prayer times for standard location (Mecca)', () => {
  const mecca = PRESET_LOCATIONS.find((l) => l.name === 'Mecca')!;
  const testDate = new Date('2026-03-21T12:00:00Z');
  const times = calculatePrayerTimes(testDate, mecca.latitude, mecca.longitude, { method: 'MAKKAH' });

  assert.ok(times.fajr instanceof Date);
  assert.ok(times.sunrise instanceof Date);
  assert.ok(times.dhuhr instanceof Date);
  assert.ok(times.asr instanceof Date);
  assert.ok(times.maghrib instanceof Date);
  assert.ok(times.isha instanceof Date);

  assert.ok(times.sunrise.getTime() > times.fajr.getTime(), 'Sunrise should be after Fajr');
  assert.ok(times.dhuhr.getTime() > times.sunrise.getTime(), 'Dhuhr should be after Sunrise');
  assert.ok(times.asr.getTime() > times.dhuhr.getTime(), 'Asr should be after Dhuhr');
  assert.ok(times.maghrib.getTime() > times.asr.getTime(), 'Maghrib should be after Asr');
});

test('Handles Helsinki Finland summer White Nights without NaN', () => {
  const helsinki = PRESET_LOCATIONS.find((l) => l.name === 'Helsinki')!;
  const solsticeDate = new Date('2026-06-21T12:00:00Z');
  const times = calculatePrayerTimes(solsticeDate, helsinki.latitude, helsinki.longitude, {
    method: 'FINLAND',
    highLatitudeRule: 'NEAREST_LATITUDE'
  });

  assert.equal(times.isExtremeLatitude, true);
  assert.ok(!isNaN(times.fajr.getTime()), 'Fajr must be valid date');
  assert.ok(!isNaN(times.sunrise.getTime()), 'Sunrise must be valid date');
  assert.ok(!isNaN(times.dhuhr.getTime()), 'Dhuhr must be valid date');
  assert.ok(!isNaN(times.asr.getTime()), 'Asr must be valid date');
  assert.ok(!isNaN(times.maghrib.getTime()), 'Maghrib must be valid date');
  assert.ok(!isNaN(times.isha.getTime()), 'Isha must be valid date');
});

test('Handles Rovaniemi Lapland in continuous Polar Day / Night', () => {
  const rovaniemi = PRESET_LOCATIONS.find((l) => l.name.includes('Rovaniemi'))!;
  const polarDay = new Date('2026-06-21T12:00:00Z');
  const polarNight = new Date('2026-12-21T12:00:00Z');

  const summerTimes = calculatePrayerTimes(polarDay, rovaniemi.latitude, rovaniemi.longitude);
  assert.ok(!isNaN(summerTimes.fajr.getTime()));
  assert.ok(!isNaN(summerTimes.isha.getTime()));

  const winterTimes = calculatePrayerTimes(polarNight, rovaniemi.latitude, rovaniemi.longitude);
  assert.ok(!isNaN(winterTimes.fajr.getTime()));
  assert.ok(!isNaN(winterTimes.maghrib.getTime()));
});

test('Handles North Pole (90°N) extreme latitude gracefully', () => {
  const northPole = PRESET_LOCATIONS.find((l) => l.name === 'North Pole')!;
  const testDate = new Date('2026-07-01T12:00:00Z');
  const times = calculatePrayerTimes(testDate, northPole.latitude, northPole.longitude, {
    highLatitudeRule: 'NEAREST_LATITUDE'
  });

  assert.equal(times.isExtremeLatitude, true);
  assert.ok(!isNaN(times.fajr.getTime()));
  assert.ok(!isNaN(times.dhuhr.getTime()));
  assert.ok(!isNaN(times.isha.getTime()));
});

test('Calculates accurate Qibla bearings and distances', () => {
  const helsinkiBearing = calculateQiblaBearing(60.1699, 24.9384);
  assert.ok(helsinkiBearing > 150 && helsinkiBearing < 165, `Helsinki bearing should be ~158°, got ${helsinkiBearing}`);

  const londonBearing = calculateQiblaBearing(51.5074, -0.1278);
  assert.ok(londonBearing > 115 && londonBearing < 122, `London bearing should be ~118°, got ${londonBearing}`);

  const npBearing = calculateQiblaBearing(90.0, 0.0);
  assert.ok(npBearing >= 135 && npBearing <= 145, `North Pole bearing should be ~140.2°, got ${npBearing}`);

  const meccaDistance = calculateDistanceToKaaba(21.4225, 39.8262);
  assert.ok(meccaDistance < 5, 'Mecca to Kaaba distance should be < 5 km');
});

test('Qibla alignment detection works with 3 degree tolerance', () => {
  const bearing = calculateQiblaBearing(60.1699, 24.9384);
  const qiblaInfoAligned = getQiblaInfo(60.1699, 24.9384, bearing + 1.5);
  const qiblaInfoMisaligned = getQiblaInfo(60.1699, 24.9384, bearing + 25.0);

  assert.equal(typeof qiblaInfoAligned.bearingDegrees, 'number');
  assert.equal(qiblaInfoAligned.isAligned, true);
  assert.equal(qiblaInfoMisaligned.isAligned, false);
});

test('Calculates next prayer and progress accurately', () => {
  const mecca = PRESET_LOCATIONS.find((l) => l.name === 'Mecca')!;
  const times = calculatePrayerTimes(new Date(), mecca.latitude, mecca.longitude);

  const next = getNextPrayer(times, new Date());
  assert.ok(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(next.currentPrayer));
  assert.ok(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(next.nextPrayer));
  assert.ok(next.timeRemainingSeconds >= 0);
  assert.ok(next.progressPercent >= 0 && next.progressPercent <= 100);
});
