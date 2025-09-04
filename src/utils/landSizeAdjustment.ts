/**
 * Land size diminishing factor: larger parcels tend to have lower unit price.
 * Default heuristic based on market behavior; fine-tune with local comps.
 */
export const getLandSizeFactor = (areaSqm: number): number => {
  if (!areaSqm || areaSqm <= 0) return 1;
  
  // No reduction for lots under 100 m²
  if (areaSqm < 100) return 1.0;
  
  // 1% reduction per 100 m² from 100 to 2000 m²
  if (areaSqm <= 2000) {
    const hundreds = Math.floor(areaSqm / 100);
    const reductionPercent = hundreds; // 1% per 100 m²
    return Math.max(1 - (reductionPercent * 0.01), 0.81);
  }
  
  // After 2000 m²: 0.5% reduction per 250 m² intervals
  const excess = areaSqm - 2000;
  const intervals = Math.floor(excess / 250);
  const additionalReduction = intervals * 0.005; // 0.5% per interval
  const factor = 0.81 - additionalReduction;
  
  return Math.max(factor, 0.75); // Minimum factor of 0.75
};
