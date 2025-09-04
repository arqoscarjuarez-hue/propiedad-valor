/**
 * Land size diminishing factor: larger parcels tend to have lower unit price.
 * Linear reduction from 1.0 (at 100m²) to 0.50 (at 2000m²), then fixed at 0.50.
 * Maximum reduction factor: 0.50 (50% off base price).
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
  
  // Linear reduction from 1.0 (at 100m²) to 0.50 (at 2000m²)
  if (areaSqm <= 2000) {
    // Linear interpolation: factor = 1.0 - ((area - 100) / (2000 - 100)) * (1.0 - 0.50)
    const factor = 1.0 - ((areaSqm - 100) / (2000 - 100)) * 0.50;
    const finalFactor = Math.max(factor, 0.50);
    console.log(`📉 Area ${areaSqm}m² - Linear reduction from 1.0 to 0.50`);
    console.log(`📉 Raw factor calculation: 1.0 - ((${areaSqm} - 100) / 1900) × 0.50 = ${factor}`);
    console.log(`📉 Final factor: ${finalFactor}`);
    console.log(`📉 Price reduction: ${((1 - finalFactor) * 100).toFixed(1)}% off base price`);
    return finalFactor;
  }
  
  // After 2000 m²: fixed at 0.50 (no further reduction)
  const finalFactor = 0.50;
  
  console.log(`📉 Large area ${areaSqm}m² - Fixed at maximum reduction`);
  console.log(`📉 Final factor: ${finalFactor}`);
  console.log(`📉 Total price reduction: ${((1 - finalFactor) * 100).toFixed(1)}% off base price`);
  return finalFactor;
};
