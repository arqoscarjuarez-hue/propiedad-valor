/**
 * Utilidades de validación para el sistema de valuación
 */

import { PropertyData, ValidationResult } from '../types/global';
import { VALIDATION_PATTERNS, VALID_PROPERTY_TYPES, LIMITS } from '../constants/appConstants';
import { handleValidationError } from './errorHandler';
import { logger } from './logging';

/**
 * Valida las coordenadas geográficas
 */
export const validateCoordinates = (lat: number, lng: number): ValidationResult => {
  const errors: string[] = [];
  
  if (isNaN(lat) || isNaN(lng)) {
    errors.push('Las coordenadas deben ser números válidos');
  }
  
  if (lat < VALIDATION_PATTERNS.COORDINATES.LAT_MIN || lat > VALIDATION_PATTERNS.COORDINATES.LAT_MAX) {
    errors.push(`La latitud debe estar entre ${VALIDATION_PATTERNS.COORDINATES.LAT_MIN} y ${VALIDATION_PATTERNS.COORDINATES.LAT_MAX} grados`);
  }
  
  if (lng < VALIDATION_PATTERNS.COORDINATES.LNG_MIN || lng > VALIDATION_PATTERNS.COORDINATES.LNG_MAX) {
    errors.push(`La longitud debe estar entre ${VALIDATION_PATTERNS.COORDINATES.LNG_MIN} y ${VALIDATION_PATTERNS.COORDINATES.LNG_MAX} grados`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida que el área sea un número positivo válido
 */
export const validateArea = (area: number): ValidationResult => {
  const errors: string[] = [];
  
  if (isNaN(area)) {
    errors.push('El área debe ser un número válido');
  } else if (area < 0) {
    errors.push('El área no puede ser negativa');
  } else if (area > LIMITS.MAX_AREA) {
    errors.push(`El área no puede ser mayor a ${LIMITS.MAX_AREA} m²`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida completitud del paso 1: Ubicación
 */
export const validateStep1 = (propertyData: PropertyData): boolean => {
  if (!propertyData.latitud || !propertyData.longitud) {
    logger.debug('Step 1 validation failed: missing coordinates');
    return false;
  }
  
  const coordinatesValidation = validateCoordinates(propertyData.latitud, propertyData.longitud);
  if (!coordinatesValidation.isValid) {
    logger.debug('Step 1 validation failed: invalid coordinates', 'VALIDATION', coordinatesValidation.errors);
    return false;
  }
  
  return true;
};

/**
 * Valida completitud del paso 2: Tipo de propiedad
 */
export const validateStep2 = (propertyData: PropertyData): boolean => {
  if (!propertyData.tipoPropiedad) {
    logger.debug('Step 2 validation failed: missing property type');
    return false;
  }
  
  const isValid = VALID_PROPERTY_TYPES.includes(propertyData.tipoPropiedad as any);
  if (!isValid) {
    logger.debug('Step 2 validation failed: invalid property type', 'VALIDATION', { type: propertyData.tipoPropiedad });
  }
  
  return isValid;
};

/**
 * Valida completitud del paso 3: Áreas
 */
export const validateStep3 = (propertyData: PropertyData): boolean => {
  // Para departamentos, no validar área de terreno
  let hasValidLandArea = true;
  if (propertyData.tipoPropiedad !== 'departamento') {
    const landValidation = validateArea(propertyData.areaTerreno);
    hasValidLandArea = landValidation.isValid;
    if (!hasValidLandArea) {
      logger.debug('Step 3 validation failed: invalid land area', 'VALIDATION', landValidation.errors);
    }
  }
  
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
    if (!hasValidBuiltArea) {
      logger.debug('Step 3 validation failed: no built area defined');
    }
  }
  
  return hasValidLandArea && hasValidBuiltArea;
};

/**
 * Valida completitud del paso 4: Características
 */
export const validateStep4 = (propertyData: PropertyData): boolean => {
  const hasValidLocation = propertyData.ubicacion && propertyData.ubicacion.trim() !== '';
  const hasValidCondition = propertyData.estadoGeneral && propertyData.estadoGeneral.trim() !== '';
  
  return hasValidLocation && hasValidCondition;
};

/**
 * Valida completitud del paso 5: Valuación
 */
export const validateStep5 = (valuation: number | null): boolean => {
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
  const step5 = validateStep5(valuation) && step4;
  
  return {
    step1,
    step2,
    step3,
    step4,
    step5,
    allComplete: step5
  };
};

/**
 * Sanitiza input numérico para prevenir valores inválidos
 */
export const sanitizeNumericInput = (value: string | number): number => {
  if (typeof value === 'string') {
    // Limpiar la cadena de caracteres no numéricos excepto el punto decimal
    const cleanedValue = value.replace(/[^\d.]/g, '');
    const numValue = parseFloat(cleanedValue);
    return isNaN(numValue) || numValue < 0 ? 0 : numValue;
  } else if (typeof value === 'number') {
    return isNaN(value) || value < 0 ? 0 : value;
  }
  return 0;
};

/**
 * Valida email básico
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('El email es requerido');
  } else if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    errors.push('El formato del email no es válido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida teléfono básico (números, espacios, guiones, paréntesis)
 */
export const validatePhone = (phone: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!phone) {
    errors.push('El teléfono es requerido');
  } else if (!VALIDATION_PATTERNS.PHONE.test(phone)) {
    errors.push('El teléfono solo puede contener números, espacios, guiones y paréntesis');
  } else if (phone.length < LIMITS.MIN_PHONE_LENGTH) {
    errors.push(`El teléfono debe tener al menos ${LIMITS.MIN_PHONE_LENGTH} caracteres`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};