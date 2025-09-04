/**
 * Land size diminishing factor: larger parcels tend to have lower unit price.
 * 3% reduction per 100 m² from 100 to 2000 m², then 0.5% per 250 m².
 * Minimum floor factor of 0.75.
 */
export const getLandSizeFactor = (areaSqm: number): number => {
  if (!areaSqm || areaSqm <= 0) return 1;
  
  // No reduction for lots under 100 m²
  if (areaSqm < 100) return 1.0;
  
  // 3% reduction per 100 m² from 100 to 2000 m²
  if (areaSqm <= 2000) {
    const hundreds = Math.floor(areaSqm / 100);
    const factor = 1 - (hundreds * 0.03);
    return Math.max(factor, 0.75);
  }
  
  // After 2000 m²: 0.5% reduction per 250 m² intervals (with floor 0.75)
  const excess = areaSqm - 2000;
  const intervals = Math.floor(excess / 250);
  const factorAt2000 = Math.max(1 - (Math.floor(2000 / 100) * 0.03), 0.75); // floor applied
  const factor = factorAt2000 - (intervals * 0.005);
  
  return Math.max(factor, 0.75);
};
