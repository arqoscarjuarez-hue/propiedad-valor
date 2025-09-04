/**
 * Land size diminishing factor: larger parcels tend to have lower unit price.
 * 10% reduction per 100 m² from 100 to 2000 m², then 0.5% per 250 m².
 * Minimum floor factor of 0.75.
 */
export const getLandSizeFactor = (areaSqm: number): number => {
  console.log('🔍 Land Size Factor Calculation:');
  console.log('📊 Area input:', areaSqm, 'm²');
  
  if (!areaSqm || areaSqm <= 0) {
    console.log('❌ Invalid area, returning factor 1.0');
    return 1;
  }
  
  // No reduction for lots under 100 m²
  if (areaSqm < 100) {
    console.log('✅ Area < 100m², no reduction, factor: 1.0');
    return 1.0;
  }
  
  // 10% reduction per 100 m² from 100 to 2000 m²
  if (areaSqm <= 2000) {
    const hundreds = Math.floor(areaSqm / 100) - 1; // Subtract 1 because first 100m² has no reduction
    const factor = 1 - (hundreds * 0.10);
    const finalFactor = Math.max(factor, 0.75);
    console.log(`📉 Area ${areaSqm}m² - Hundreds above 100: ${hundreds}`);
    console.log(`📉 Raw factor calculation: 1 - (${hundreds} × 0.10) = ${factor}`);
    console.log(`📉 Final factor (with 0.75 floor): ${finalFactor}`);
    console.log(`📉 Price reduction: ${((1 - finalFactor) * 100).toFixed(1)}% off base price`);
    return finalFactor;
  }
  
  // After 2000 m²: 0.5% reduction per 250 m² intervals (with floor 0.75)
  const excess = areaSqm - 2000;
  const intervals = Math.floor(excess / 250);
  const factorAt2000 = Math.max(1 - ((Math.floor(2000 / 100) - 1) * 0.10), 0.75); // floor applied
  const factor = factorAt2000 - (intervals * 0.005);
  const finalFactor = Math.max(factor, 0.75);
  
  console.log(`📉 Large area ${areaSqm}m² - Excess beyond 2000: ${excess}m²`);
  console.log(`📉 Additional intervals of 250m²: ${intervals}`);
  console.log(`📉 Factor at 2000m²: ${factorAt2000}`);
  console.log(`📉 Additional reduction: ${intervals} × 0.005 = ${intervals * 0.005}`);
  console.log(`📉 Final factor: ${finalFactor}`);
  console.log(`📉 Total price reduction: ${((1 - finalFactor) * 100).toFixed(1)}% off base price`);
  return finalFactor;
};
