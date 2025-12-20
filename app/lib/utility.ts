const MI_TO_KM = 1.609344;

export function milesToKm(miles?: number | null) {
  if (miles == null) return null;
  return miles * MI_TO_KM;
}

/**
 * Teslaのレンジが miles で返る前提。
 * もし km で返る環境なら、ここを切り替え（設定化）してください。
 */
export function rangeToKm(rangeMilesOrKm?: number | null) {
  if (rangeMilesOrKm == null) return null;
  return rangeMilesOrKm * MI_TO_KM;
}
