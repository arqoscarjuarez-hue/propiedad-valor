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

// Location quality options with social stratum logic
export const LOCATION_QUALITY = {
  // Social Stratum Scale (decreasing curve - higher stratum = higher factor)
  STRATUM_1_ELITE: 'estrato-1-elite',           // Factor: 1.45 - Zona exclusiva, residencial de lujo
  STRATUM_2_HIGH: 'estrato-2-alto',             // Factor: 1.35 - Zona residencial alta, plusvalía premium  
  STRATUM_3_MEDIUM_HIGH: 'estrato-3-medio-alto', // Factor: 1.20 - Zona residencial media-alta, buena ubicación
  STRATUM_4_MEDIUM: 'estrato-4-medio',          // Factor: 1.00 - Zona residencial media, equilibrio precio-valor
  STRATUM_5_MEDIUM_LOW: 'estrato-5-medio-bajo', // Factor: 0.85 - Zona residencial media-baja, accesible
  STRATUM_6_LOW: 'estrato-6-bajo',              // Factor: 0.70 - Zona popular, vivienda social
  STRATUM_7_SOCIAL: 'estrato-7-social',         // Factor: 0.60 - Zona de interés social, vivienda subsidiada
  STRATUM_8_MARGINAL: 'estrato-8-marginal'      // Factor: 0.50 - Zona marginal, servicios limitados
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
  AGRICULTURAL: 'agricola'
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