/**
 * Land size diminishing factor: larger parcels tend to have lower unit price.
 * 10% reduction per 100 m² from 100 to 2000 m², then 0.5% per 250 m².
 * Minimum floor factor of 0.75.
 */
export const getLandSizeFactor = (areaSqm: number): number => {
  console.log('🔍 Land Size Factor Calculation:');
  console.log('Area input:', areaSqm, 'm²');
  
  if (!areaSqm || areaSqm <= 0) {
    console.log('Invalid area, returning factor 1.0');
    return 1;
  }
  
  // No reduction for lots under 100 m²
  if (areaSqm < 100) {
    console.log('Area < 100m², no reduction, factor: 1.0');
    return 1.0;
  }
  
  // 10% reduction per 100 m² from 100 to 2000 m²
  if (areaSqm <= 2000) {
    const hundreds = Math.floor(areaSqm / 100) - 1; // Subtract 1 because first 100m² has no reduction
    const factor = 1 - (hundreds * 0.10);
    const finalFactor = Math.max(factor, 0.75);
    console.log(`Area ${areaSqm}m² - Hundreds above 100: ${hundreds}, Raw factor: ${factor}, Final factor: ${finalFactor}`);
    return finalFactor;
  }
  
  // After 2000 m²: 0.5% reduction per 250 m² intervals (with floor 0.75)
  const excess = areaSqm - 2000;
  const intervals = Math.floor(excess / 250);
  const factorAt2000 = Math.max(1 - ((Math.floor(2000 / 100) - 1) * 0.10), 0.75); // floor applied
  const factor = factorAt2000 - (intervals * 0.005);
  const finalFactor = Math.max(factor, 0.75);
  
  console.log(`Area ${areaSqm}m² - Excess: ${excess}m², Intervals: ${intervals}, Factor at 2000: ${factorAt2000}, Final factor: ${finalFactor}`);
  return finalFactor;
};
