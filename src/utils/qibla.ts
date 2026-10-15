/**
 * Qibla Direction and Great-Circle Geodesic Utility
 * Kaaba coordinates: 21.422487° N, 39.826206° E
 */

export const KAABA_LATITUDE = 21.422487;
export const KAABA_LONGITUDE = 39.826206;

export interface QiblaInfo {
  bearingDegrees: number; // 0 - 360 clockwise from true North
  distanceKm: number;
  compassCardinal: string;
  relativeBearing?: number; // relative to device compass heading (-180 to 180 or 0 to 360)
  isAligned: boolean; // within +/- 3 degrees
}

const d2r = (deg: number) => (deg * Math.PI) / 180.0;
const r2d = (rad: number) => (rad * 180.0) / Math.PI;

/**
 * Calculates Great-Circle forward azimuth (bearing) to Kaaba in Mecca
 */
export function calculateQiblaBearing(latitude: number, longitude: number): number {
  if (latitude >= 89.99) {
    // At North Pole, reference grid South is 180°. Towards East longitude (Mecca at 39.826°E):
    let poleBearing = (180 - (KAABA_LONGITUDE - longitude) + 360) % 360;
    return poleBearing;
  }

  if (latitude <= -89.99) {
    let poleBearing = (KAABA_LONGITUDE - longitude) % 360;
    if (poleBearing < 0) poleBearing += 360;
    return poleBearing;
  }

  const phi1 = d2r(latitude);
  const phi2 = d2r(KAABA_LATITUDE);
  const deltaLambda = d2r(KAABA_LONGITUDE - longitude);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let q = r2d(Math.atan2(y, x));
  q = (q + 360) % 360;

  return q;
}

/**
 * Calculates Great-Circle distance to Kaaba using Haversine formula
 */
export function calculateDistanceToKaaba(latitude: number, longitude: number): number {
  const R = 6371; // Earth radius in km
  const phi1 = d2r(latitude);
  const phi2 = d2r(KAABA_LATITUDE);
  const deltaPhi = d2r(KAABA_LATITUDE - latitude);
  const deltaLambda = d2r(KAABA_LONGITUDE - longitude);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Returns cardinal compass point for a bearing (e.g. N, NNE, SE, SSW)
 */
export function getCompassCardinal(bearing: number): string {
  const cardinals = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return cardinals[index];
}

/**
 * Full Qibla analysis given user coordinates and optional current device heading
 */
export function getQiblaInfo(
  latitude: number,
  longitude: number,
  deviceHeading: number | null = null
): QiblaInfo {
  const bearing = calculateQiblaBearing(latitude, longitude);
  const distance = calculateDistanceToKaaba(latitude, longitude);
  const cardinal = getCompassCardinal(bearing);

  let isAligned = false;
  let relativeBearing = undefined;

  if (deviceHeading !== null && !isNaN(deviceHeading)) {
    let diff = (bearing - deviceHeading) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    relativeBearing = diff;
    isAligned = Math.abs(diff) <= 3.0; // Within 3° of target
  }

  return {
    bearingDegrees: Math.round(bearing * 10) / 10,
    distanceKm: distance,
    compassCardinal: cardinal,
    relativeBearing,
    isAligned
  };
}
