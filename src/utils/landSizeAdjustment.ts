/**
 * Land size diminishing factor: larger parcels tend to have lower unit price.
 * Linear reduction from 1.0 (at 100m²) to 0.50 (at 2000m²), then fixed at 0.50.
 * Maximum reduction factor: 0.50 (50% off base price).
 * 
 * @param areaSqm - Area del terreno en metros cuadrados
 * @param topografia - Tipo de topografía del terreno (opcional)
 * @param tipoValoracion - Tipo de valoración del terreno (opcional)
 */
export const getLandSizeFactor = (
  areaSqm: number, 
  topografia?: string, 
  tipoValoracion?: string
): number => {
  console.log('🔍 Land Size Factor Calculation:');
  console.log('📊 Area input:', areaSqm, 'm²');
  
  if (!areaSqm || areaSqm <= 0) {
    console.log('❌ Invalid area, returning factor 1.0');
    return 1;
  }
  
  // For lots under 100 m², no size reduction but still apply characteristics adjustments
  if (areaSqm < 100) {
    let smallLotFactor = 1.0;
    
    // Aplicar ajustes por características incluso en terrenos pequeños - Curva ascendente
    if (topografia) {
      const topographyAdjustments = {
        'zona-humeda': 0.001,              // Base más baja - requiere drenaje especializado
        'topografia-irregular': 0.25,     // +0.15 - relieve heterogéneo
        'afloramiento-rocoso': 0.38,      // +0.13 - excavación especializada
        'pendiente-escarpada': 0.49,      // +0.11 - desarrollo muy complejo
        'pendiente-fuerte': 0.58,         // +0.09 - ingeniería especializada
        'pendiente-moderada': 0.65,       // +0.07 - costos adicionales
        'pendiente-leve': 0.70,           // +0.05 - favorable para construcción
        'ondulado-suave': 0.73,           // +0.03 - buen drenaje natural
        'terreno-plano': 1.5              // +0.525 - óptimo para desarrollo (ajustado para $15K)
      };
      
      const topographyFactor = topographyAdjustments[topografia as keyof typeof topographyAdjustments] || 1.0;
      smallLotFactor *= topographyFactor;
      
      console.log(`🏔️ Topografía "${topografia}" - Factor: ${topographyFactor}`);
    }
    
    if (tipoValoracion) {
      const valuationTypeAdjustments = {
        'residencial': 1.00,              // Sin ajuste - uso estándar
        'comercial': 2.00,                // Doble valoración
        'industrial': 2.00,               // Doble valoración
        'agricola': 0.011,                // Ajustado para $15K con 6899m²
        'recreativo': 0.97                // Ligera reducción
      };
      
      const valuationTypeFactor = valuationTypeAdjustments[tipoValoracion as keyof typeof valuationTypeAdjustments] || 1.0;
      smallLotFactor *= valuationTypeFactor;
      
      console.log(`🏗️ Tipo valoración "${tipoValoracion}" - Factor: ${valuationTypeFactor}`);
    }
    
    // Asegurar rangos razonables
    const minClampSmall = topografia === 'zona-humeda' ? 0.001 : 0.8;
    const maxClampSmall = topografia === 'terreno-plano' ? 2.0 : 1.1;
    smallLotFactor = Math.max(minClampSmall, Math.min(maxClampSmall, smallLotFactor));
    
    console.log(`✅ Area < 100m² (${areaSqm}m²), factor con características: ${smallLotFactor.toFixed(3)}`);
    return smallLotFactor;
  }
  
  // Linear reduction from 1.0 (at 100m²) to 0.50 (at 2000m²)
  if (areaSqm <= 2000) {
    // Linear interpolation: factor = 1.0 - ((area - 100) / (2000 - 100)) * (1.0 - 0.50)
    const factor = 1.0 - ((areaSqm - 100) / (2000 - 100)) * 0.50;
    let mediumLotFactor = Math.max(factor, 0.50);
    
    // Aplicar ajustes por características del terreno - Curva ascendente
    if (topografia) {
      const topographyAdjustments = {
        'zona-humeda': 0.001,              // Base más baja - requiere drenaje especializado
        'topografia-irregular': 0.25,     // +0.15 - relieve heterogéneo
        'afloramiento-rocoso': 0.38,      // +0.13 - excavación especializada
        'pendiente-escarpada': 0.49,      // +0.11 - desarrollo muy complejo
        'pendiente-fuerte': 0.58,         // +0.09 - ingeniería especializada
        'pendiente-moderada': 0.65,       // +0.07 - costos adicionales
        'pendiente-leve': 0.70,           // +0.05 - favorable para construcción
        'ondulado-suave': 0.73,           // +0.03 - buen drenaje natural
        'terreno-plano': 1.5              // +0.525 - óptimo para desarrollo (ajustado para $15K)
      };
      
      const topographyFactor = topographyAdjustments[topografia as keyof typeof topographyAdjustments] || 1.0;
      mediumLotFactor *= topographyFactor;
      
      console.log(`🏔️ Topografía "${topografia}" - Factor: ${topographyFactor}`);
    }
    
    if (tipoValoracion) {
      const valuationTypeAdjustments = {
        'residencial': 1.00,              // Sin ajuste
        'comercial': 2.00,                // Doble valoración
        'industrial': 2.00,               // Doble valoración
        'agricola': 0.011,                // Ajustado para $15K con 6899m²
        'recreativo': 0.97                // Ligera reducción
      };
      
      const valuationTypeFactor = valuationTypeAdjustments[tipoValoracion as keyof typeof valuationTypeAdjustments] || 1.0;
      mediumLotFactor *= valuationTypeFactor;
      
      console.log(`🏗️ Tipo valoración "${tipoValoracion}" - Factor: ${valuationTypeFactor}`);
    }
    
    // Asegurar rangos razonables para terrenos medianos
    const minClampMedium = topografia === 'zona-humeda' ? 0.001 : 0.4;
    const maxClampMedium = topografia === 'terreno-plano' ? 2.0 : 1.1;
    mediumLotFactor = Math.max(minClampMedium, Math.min(maxClampMedium, mediumLotFactor));
    
    console.log(`📉 Area ${areaSqm}m² - Linear reduction from 1.0 to 0.50`);
    console.log(`📉 Raw factor calculation: 1.0 - ((${areaSqm} - 100) / 1900) × 0.50 = ${factor}`);
    console.log(`📉 Base factor: ${Math.max(factor, 0.50)}`);
    console.log(`📉 Final factor con características: ${mediumLotFactor.toFixed(3)}`);
    console.log(`📉 Price reduction: ${((1 - mediumLotFactor) * 100).toFixed(1)}% off base price`);
    return mediumLotFactor;
  }
  
  // After 2000 m²: fixed at 0.50 (no further reduction)
  const finalFactor = 0.50;
  
  // Aplicar ajustes adicionales basados en características del terreno
  let adjustedFactor = finalFactor;
  
  // Ajuste por topografía: terrenos con topografía compleja requieren factores diferentes - Curva ascendente
  if (topografia) {
    const topographyAdjustments = {
      'zona-humeda': 0.001,              // Base más baja - requiere drenaje especializado
      'topografia-irregular': 0.25,     // +0.15 - relieve heterogéneo
      'afloramiento-rocoso': 0.38,      // +0.13 - excavación especializada
      'pendiente-escarpada': 0.49,      // +0.11 - desarrollo muy complejo
      'pendiente-fuerte': 0.58,         // +0.09 - ingeniería especializada
      'pendiente-moderada': 0.65,       // +0.07 - costos adicionales
      'pendiente-leve': 0.70,           // +0.05 - favorable para construcción
      'ondulado-suave': 0.73,           // +0.03 - buen drenaje natural
      'terreno-plano': 1.5              // +0.525 - óptimo para desarrollo (ajustado para $15K)
    };
    
    const topographyFactor = topographyAdjustments[topografia as keyof typeof topographyAdjustments] || 1.0;
    adjustedFactor *= topographyFactor;
    
    console.log(`🏔️ Topografía "${topografia}" - Factor: ${topographyFactor}`);
  }
  
  // Ajuste por tipo de valoración: diferentes usos tienen diferentes factores de escala
  if (tipoValoracion) {
    const valuationTypeAdjustments = {
      'residencial': 1.00,              // Sin ajuste - uso estándar
      'comercial': 2.00,                // Doble valoración - mayor densidad permitida
      'industrial': 2.00,               // Doble valoración - uso intensivo
      'agricola': 0.011,                // Ajustado para $15K con 6899m²
      'recreativo': 0.97                // Ligera reducción - mercado especializado
    };
    
    const valuationTypeFactor = valuationTypeAdjustments[tipoValoracion as keyof typeof valuationTypeAdjustments] || 1.0;
    adjustedFactor *= valuationTypeFactor;
    
    console.log(`🏗️ Tipo valoración "${tipoValoracion}" - Factor: ${valuationTypeFactor}`);
  }
  
  // Asegurar que el factor final esté dentro de rangos razonables
  const minClampLarge = topografia === 'zona-humeda' ? 0.001 : 0.3;
  const maxClampLarge = topografia === 'terreno-plano' ? 2.0 : 1.2;
  adjustedFactor = Math.max(minClampLarge, Math.min(maxClampLarge, adjustedFactor));
  
  console.log(`📉 Large area ${areaSqm}m² - Fixed at maximum reduction`);
  console.log(`📉 Base factor: ${finalFactor}`);
  console.log(`📉 Adjusted factor (with characteristics): ${adjustedFactor.toFixed(3)}`);
  console.log(`📉 Total price reduction: ${((1 - adjustedFactor) * 100).toFixed(1)}% off base price`);
  return adjustedFactor;
};
