/**
 * Application constants for the Property Valuation System
 */

// Default coordinates (Mexico City)
export const DEFAULT_COORDINATES = {
  lat: 19.4326,
  lng: -99.1332
} as const;

// Property types
export const PROPERTY_TYPES = {
  HOUSE: 'casa',
  APARTMENT: 'departamento', 
  LAND: 'terreno',
  COMMERCIAL: 'comercial',
  WAREHOUSE: 'bodega',
  OFFICE: 'oficina',
  LOCAL: 'local',
  CLINIC: 'consultorio',
  RESTAURANT: 'restaurant',
  HOTEL: 'hotel'
} as const;

// Valid property types array
export const VALID_PROPERTY_TYPES = Object.values(PROPERTY_TYPES);

// Location quality options
export const LOCATION_QUALITY = {
  EXCELLENT: 'excelente',
  GOOD: 'buena',
  MEDIUM: 'media',
  REGULAR: 'regular',
  BAD: 'mala'
} as const;

// General condition options
export const GENERAL_CONDITION = {
  NEW: 'nuevo',
  GOOD: 'bueno',
  MEDIUM: 'medio',
  REGULAR: 'regular',
  SIMPLE_REPAIRS: 'reparaciones-sencillas',
  MAJOR_REPAIRS: 'reparaciones-mayores',
  RECONSTRUCTION: 'reconstruccion'
} as const;

// Topography options for land
export const TOPOGRAPHY_OPTIONS = {
  FLAT: 'plano',
  GENTLE_SLOPE: 'pendiente-suave',
  MODERATE_SLOPE: 'pendiente-moderada',
  STEEP_SLOPE: 'pendiente-pronunciada',
  IRREGULAR: 'irregular'
} as const;

// Valuation types for land
export const VALUATION_TYPES = {
  RESIDENTIAL: 'residencial',
  COMMERCIAL: 'comercial',
  INDUSTRIAL: 'industrial',
  AGRICULTURAL: 'agricola',
  RECREATIONAL: 'recreativo'
} as const;

// API endpoints
export const API_ENDPOINTS = {
  EXCHANGE_RATES: 'https://api.exchangerate-api.com/v4/latest/USD',
  GOOGLE_MAPS_FUNCTION: 'google-maps'
} as const;

// Timeouts and limits
export const TIMEOUTS = {
  GEOLOCATION: 15000, // 15 seconds
  API_REQUEST: 8000,  // 8 seconds
  SEARCH_REQUEST: 10000 // 10 seconds
} as const;

export const LIMITS = {
  MAX_AREA: 999999,
  MIN_PHONE_LENGTH: 10,
  SEARCH_RADIUS_KM: 2,
  MAX_COMPARABLES: 10,
  DEFAULT_COMPARABLES: 3
} as const;

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\(\)\+]+$/,
  COORDINATES: {
    LAT_MIN: -90,
    LAT_MAX: 90,
    LNG_MIN: -180,
    LNG_MAX: 180
  }
} as const;

// Price factors
export const PRICE_FACTORS = {
  LAND_DEFAULT: 0.4,      // Land worth 40% of construction price by default
  LAND_COMMERCIAL: 0.6,   // Commercial land worth more
  LAND_WAREHOUSE: 0.3,    // Industrial land worth less
  DISCOUNT_DEFAULT: 0.15  // 15% discount for comparables
} as const;

// Map settings
export const MAP_SETTINGS = {
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
  MARKER_CLUSTER_DISTANCE: 100
} as const;

// File export settings
export const EXPORT_SETTINGS = {
  PDF_FORMAT: 'a4',
  WORD_MARGIN: 720, // 0.5 inch in twentieths of a point
  IMAGE_MAX_WIDTH: 600,
  IMAGE_MAX_HEIGHT: 400
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GEOLOCATION_FAILED: 'No se pudo detectar la ubicación',
  INVALID_COORDINATES: 'Coordenadas inválidas',
  CALCULATION_ERROR: 'Error en el cálculo de valuación',
  NETWORK_ERROR: 'Error de conexión',
  TIMEOUT_ERROR: 'Tiempo de espera agotado'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  LOCATION_DETECTED: 'Ubicación detectada',
  VALUATION_COMPLETED: 'Valuación completada',
  CURRENCY_CHANGED: 'Moneda cambiada',
  EXPORT_SUCCESS: 'Reporte exportado exitosamente'
} as const;