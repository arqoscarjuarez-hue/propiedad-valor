/**
 * Utilidades para cálculos de valuación inmobiliaria
 */

import { getLandSizeFactor } from './landSizeAdjustment';

interface PropertyData {
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  tipoPropiedad: string;
  ubicacion: string;
  estadoGeneral: string;
  topografia?: string;
  tipoValoracion?: string;
}

/**
 * Calcula el valor base de una propiedad usando el método de costo
 */
export const calculateBaseValue = (propertyData: PropertyData): number => {
  const areaTotal = propertyData.areaSotano + 
                   propertyData.areaPrimerNivel + 
                   propertyData.areaSegundoNivel + 
                   propertyData.areaTercerNivel + 
                   propertyData.areaCuartoNivel;

  if (propertyData.tipoPropiedad === 'terreno') {
    return calculateLandValue(propertyData);
  } else {
    return calculateConstructionValue(propertyData, areaTotal);
  }
};

/**
 * Calcula el valor de un terreno
 */
const calculateLandValue = (propertyData: PropertyData): number => {
  let basePrice = 80;
  
  // Ajustes por topografía usando estándares IVS/RICS
  const topographyFactors = {
    'terreno-plano': 1.12,     // +12%
    'pendiente-suave': 1.03,   // +3%
    'pendiente-moderada': 0.93, // -7%
    'pendiente-pronunciada': 0.80, // -20%
    'irregular': 0.75          // -25%
  };
  
  // Ajustes por tipo de valoración
  const valuationFactors = {
    'residencial': 0.65,       // -35% (valor base estándar)
    'comercial': 1.28,         // +28%
    'industrial': 1.24,        // +24%
    'agricola': 0.43           // -57%
  };
  
  const topographyFactor = topographyFactors[propertyData.topografia as keyof typeof topographyFactors] || 1;
  const valuationFactor = valuationFactors[propertyData.tipoValoracion as keyof typeof valuationFactors] || 1;
  
  basePrice = basePrice * topographyFactor * valuationFactor;
  
  return propertyData.areaTerreno * basePrice;
};

/**
 * Calcula el valor de una construcción
 */
const calculateConstructionValue = (propertyData: PropertyData, areaTotal: number): number => {
  let pricePerSqm = 800;

  // Ajustes por tipo de propiedad
  if (propertyData.tipoPropiedad === 'casa') {
    pricePerSqm = 850;
  } else if (propertyData.tipoPropiedad === 'departamento') {
    pricePerSqm = 950;
  } else if (propertyData.tipoPropiedad === 'comercial') {
    pricePerSqm = 1200;
  }

  // Ajustes por calidad de ubicación
  const locationFactors = {
    'excelente': 1.25,
    'buena': 1.10,
    'media': 1.0,
    'regular': 0.85,
    'mala': 0.70
  };

  // Ajustes por estado general
  const conditionFactors = {
    'nuevo': 1.15,
    'bueno': 1.05,
    'medio': 1.0,
    'regular': 0.90,
    'reparaciones-sencillas': 0.85,
    'reparaciones-medias': 0.75,
    'reparaciones-importantes': 0.60,
    'danos-graves': 0.40,
    'en-desecho': 0.20
  };

  const locationFactor = locationFactors[propertyData.ubicacion as keyof typeof locationFactors] || 1;
  const conditionFactor = conditionFactors[propertyData.estadoGeneral as keyof typeof conditionFactors] || 1;
  
  // Ajuste por tamaño del terreno
  const landSizeFactor = getLandSizeFactor(propertyData.areaTerreno, propertyData.topografia, propertyData.tipoPropiedad);

  const constructionValue = areaTotal * pricePerSqm * locationFactor * conditionFactor;
  const landValue = propertyData.areaTerreno * 120 * locationFactor;

  return (constructionValue + landValue) * landSizeFactor;
};