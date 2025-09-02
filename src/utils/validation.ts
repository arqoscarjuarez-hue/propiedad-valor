/**
 * Utilidades de validación para el sistema de valuación
 */

export interface PropertyData {
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  tipoPropiedad: string;
  recamaras: number;
  salas: number;
  comedor: number;
  cocina: number;
  bodega: number;
  areaServicio: number;
  cochera: number;
  banos: number;
  otros: number;
  antiguedad: number;
  ubicacion: string;
  estadoGeneral: string;
  tipoAcceso: string;
  latitud: number;
  longitud: number;
  direccionCompleta: string;
  servicios: {
    [key: string]: boolean;
  };
  topografia?: string;
  tipoValoracion?: string;
}

/**
 * Valida las coordenadas geográficas
 */
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && lat !== 0 && lng !== 0;
};

/**
 * Valida que el área sea un número positivo válido
 */
export const validateArea = (area: number): boolean => {
  return !isNaN(area) && area > 0 && area < 999999; // Límite razonable
};

/**
 * Valida completitud del paso 1: Ubicación
 */
export const validateStep1 = (propertyData: PropertyData): boolean => {
  return validateCoordinates(propertyData.latitud, propertyData.longitud);
};

/**
 * Valida completitud del paso 2: Tipo de propiedad
 */
export const validateStep2 = (propertyData: PropertyData): boolean => {
  const validTypes = ['casa', 'departamento', 'terreno', 'comercial', 'bodega'];
  return propertyData.tipoPropiedad && validTypes.includes(propertyData.tipoPropiedad);
};

/**
 * Valida completitud del paso 3: Áreas
 */
export const validateStep3 = (propertyData: PropertyData): boolean => {
  const hasValidLandArea = validateArea(propertyData.areaTerreno);
  
  let hasValidBuiltArea = true;
  if (propertyData.tipoPropiedad !== 'terreno') {
    const totalBuiltArea = (
      (propertyData.areaSotano || 0) +
      (propertyData.areaPrimerNivel || 0) +
      (propertyData.areaSegundoNivel || 0) +
      (propertyData.areaTercerNivel || 0) +
      (propertyData.areaCuartoNivel || 0)
    );
    hasValidBuiltArea = totalBuiltArea > 0;
  }
  
  return hasValidLandArea && hasValidBuiltArea;
};

/**
 * Valida completitud del paso 4: Espacios
 */
export const validateStep4 = (propertyData: PropertyData): boolean => {
  if (propertyData.tipoPropiedad === 'terreno') {
    return true; // Los terrenos no requieren espacios
  }
  
  // Para propiedades construidas, debe tener al menos un espacio básico
  return (
    propertyData.recamaras > 0 || 
    propertyData.banos > 0 || 
    propertyData.cocina > 0 ||
    propertyData.salas > 0
  );
};

/**
 * Valida completitud del paso 5: Características
 */
export const validateStep5 = (propertyData: PropertyData): boolean => {
  const hasValidLocation = propertyData.ubicacion && propertyData.ubicacion.trim() !== '';
  const hasValidCondition = propertyData.estadoGeneral && propertyData.estadoGeneral.trim() !== '';
  
  return hasValidLocation && hasValidCondition;
};

/**
 * Valida completitud del paso 6: Valuación
 */
export const validateStep6 = (valuation: number | null): boolean => {
  return valuation !== null && valuation > 0;
};

/**
 * Obtiene el estado de completitud de todos los pasos
 */
export const getStepCompletion = (propertyData: PropertyData, valuation: number | null) => {
  const step1 = validateStep1(propertyData);
  const step2 = validateStep2(propertyData) && step1;
  const step3 = validateStep3(propertyData) && step2;
  const step4 = validateStep4(propertyData) && step3;
  const step5 = validateStep5(propertyData) && step4;
  const step6 = validateStep6(valuation) && step5;
  
  return {
    step1,
    step2,
    step3,
    step4,
    step5,
    step6,
    allComplete: step6
  };
};

/**
 * Sanitiza input numérico para prevenir valores inválidos
 */
export const sanitizeNumericInput = (value: string | number): number => {
  if (typeof value === 'string') {
    const numValue = parseFloat(value);
    return isNaN(numValue) ? 0 : Math.max(0, numValue);
  } else if (typeof value === 'number') {
    return isNaN(value) ? 0 : Math.max(0, value);
  }
  return 0;
};

/**
 * Valida email básico
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida teléfono básico (números, espacios, guiones, paréntesis)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.length >= 10;
};