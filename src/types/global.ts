/**
 * Global type definitions for the Property Valuation System
 */

// Language types
export type Language = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt';

// Property types
export interface PropertyData {
  // Areas
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  
  // Property type
  tipoPropiedad: string;
  
  // Characteristics
  ubicacion: string;
  estadoGeneral: string;
  
  // Land-specific characteristics
  topografia?: string;
  tipoValoracion?: string;
  
  // Geographic location
  latitud?: number;
  longitud?: number;
  direccionCompleta?: string;
  
  // Rental method
  alquiler?: number;
}

// Comparative property interface
export interface ComparativeProperty {
  id: string;
  address: string;
  areaConstruida: number;
  areaTerreno: number;
  tipoPropiedad: string;
  ubicacion: string;
  estadoGeneral: string;
  precio: number;
  distancia?: number;
  descripcion?: string;
  url?: string;
  latitud?: number;
  longitud?: number;
  lat?: number;
  lng?: number;
  isReal?: boolean;
  rating?: number;
  topografia?: string;
  tipoValoracion?: string;
}

// Currency interface
export interface Currency {
  code: string;
  name: string;
  rate: number;
  symbol: string;
}

// Geographic coordinate interface
export interface Coordinates {
  lat: number;
  lng: number;
}

// API response types
export interface APIResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Step completion interface
export interface StepCompletion {
  step1: boolean;
  step2: boolean;
  step3: boolean;
  step4: boolean;
  step5: boolean;
  allComplete: boolean;
}

// Map-related types
export interface MapInstance {
  center: Coordinates;
  zoom: number;
  markers?: MarkerData[];
}

export interface MarkerData {
  id: string;
  position: Coordinates;
  title?: string;
  description?: string;
}

// Error types
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};