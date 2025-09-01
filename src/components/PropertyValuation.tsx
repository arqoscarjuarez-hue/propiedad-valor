import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, HelpCircle, CheckCircle, Shuffle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FreeLocationMap from '@/components/FreeLocationMap';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ValuationWalkthrough } from '@/components/ValuationWalkthrough';

// Interfaces y tipos
interface Translation {
  propertyType: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  age: string;
  conservationState: string;
  location: string;
  neighborhood: string;
  address: string;
  description: string;
  calculate: string;
  result: string;
  estimatedValue: string;
  comparables: string;
  noComparables: string;
  loading: string;
  errors: {
    fillRequired: string;
    selectPropertyType: string;
    enterArea: string;
    enterLocation: string;
  };
  propertyTypes: {
    casa: string;
    apartamento: string;
    terreno: string;
    comercial: string;
  };
  conservationStates: {
    excelente: string;
    bueno: string;
    regular: string;
    malo: string;
  };
}

interface Translations {
  [key: string]: Translation;
}

interface PropertyData {
  tipoPropiedad: string;
  area: number;
  construction_area: number;
  habitaciones: number;
  banos: number;
  parqueaderos: number;
  antiguedad: number;
  estadoConservacion: string;
  latitud: number;
  longitud: number;
  direccionCompleta: string;
  barrio: string;
  descripcion: string;
  estratoSocial: EstratoSocial;
}

interface Comparable {
  id?: string;
  property_type: string;
  total_area: number;
  price_per_sqm_usd: number;
  price_usd: number;
  bedrooms?: number;
  bathrooms?: number;
  address: string;
  sale_date?: string;
  distance?: number;
  estrato_social: any; // Usando any para compatibilidad con DB
}

// Tipos de estrato social - solo los que existen en la DB
export type EstratoSocial = 
  | 'bajo_bajo' | 'bajo_medio' | 'bajo_alto'
  | 'medio_bajo' | 'medio_medio' | 'medio_alto' 
  | 'alto_medio' | 'alto_alto';

// Etiquetas para estratos sociales
export const estratoSocialLabels: Record<EstratoSocial, string> = {
  // Barrios Pobres
  'bajo_bajo': 'Barrio Muy Pobre - Sin casi servicios',
  'bajo_medio': 'Barrio Pobre - Pocos servicios',
  'bajo_alto': 'Barrio Humilde - Servicios básicos',
  
  // Barrios Normales
  'medio_bajo': 'Barrio Trabajador - Buenos servicios',
  'medio_medio': 'Barrio Clase Media - Muy buenos servicios',
  'medio_alto': 'Barrio Acomodado - Excelentes servicios',
  
  // Barrios Ricos
  'alto_medio': 'Barrio Rico - Zona exclusiva',
  'alto_alto': 'Barrio Muy Rico - Zona de lujo'
};

// Mapeo de estratos a clases sociales simplificadas
export const estratoToClassMap: Record<EstratoSocial, string> = {
  // Clase Popular/Baja
  'bajo_bajo': 'popular',
  'bajo_medio': 'popular',
  'bajo_alto': 'popular',
  
  // Clase Media
  'medio_bajo': 'media',
  'medio_medio': 'media',
  'medio_alto': 'media',
  
  // Clase Alta
  'alto_medio': 'alta',
  'alto_alto': 'alta'
};

// Mapeo inverso: clases a estratos (solo los que existen en la DB)
export const classToEstratos: Record<string, EstratoSocial[]> = {
  'popular': ['bajo_bajo', 'bajo_medio', 'bajo_alto'],
  'media': ['medio_bajo', 'medio_medio', 'medio_alto'],
  'alta': ['alto_medio', 'alto_alto'],
  'premium': []
};

// Multiplicadores de valor según estrato social
export const estratoMultipliers: Record<EstratoSocial, number> = {
  // Nivel Bajo (0.6-0.9)
  'bajo_bajo': 0.6,
  'bajo_medio': 0.8,
  'bajo_alto': 0.9,
  
  // Nivel Medio (0.95-1.2)
  'medio_bajo': 0.95,
  'medio_medio': 1.1,
  'medio_alto': 1.2,
  
  // Nivel Alto (1.6-1.8)
  'alto_medio': 1.6,
  'alto_alto': 1.8
};

// Factores de depreciación por estado de conservación (TODOS LOS FACTORES)
const conservationFactors: Record<string, number> = {
  'NUEVO': 1.0000,
  'BUENO': 0.9968,
  'MEDIO': 0.9748,
  'REGULAR': 0.9191,
  'REPARACIONES SENCILLAS': 0.8190,
  'REPARACIONES MEDIAS': 0.6680,
  'REPARACIONES IMPORTANTES': 0.4740,
  'DAÑOS GRAVES': 0.2480,
  'EN DESECHO': 0.1350
};

// Estados de conservación para el dropdown - MOVIDO DENTRO DEL COMPONENTE

// Multiplicadores por clase social
export const classMultipliers: Record<string, number> = {
  'popular': 0.75,
  'media': 1.0,
  'alta': 1.35,
  'premium': 2.8
};

// Traducciones
const translations: Translations = {
  es: {
    propertyType: "Tipo de Propiedad",
    area: "Área (m²)",
    bedrooms: "Habitaciones",
    bathrooms: "Baños",
    parkingSpaces: "Parqueaderos",
    age: "Antigüedad (años)",
    conservationState: "Estado de Conservación",
    location: "Ubicación",
    neighborhood: "Barrio",
    address: "Dirección",
    description: "Descripción",
    calculate: "Calcular Valuación",
    result: "Resultado de la Valuación",
    estimatedValue: "Valor Estimado",
    comparables: "Propiedades Comparables",
    noComparables: "No se encontraron propiedades comparables",
    loading: "Calculando valuación...",
    errors: {
      fillRequired: "Complete todos los campos requeridos",
      selectPropertyType: "Seleccione el tipo de propiedad",
      enterArea: "Ingrese el área de la propiedad",
      enterLocation: "Seleccione la ubicación en el mapa"
    },
    propertyTypes: {
      casa: "Casa",
      apartamento: "Apartamento",
      terreno: "Terreno",
      comercial: "Comercial"
    },
    conservationStates: {
      excelente: "Excelente",
      bueno: "Bueno",
      regular: "Regular",
      malo: "Malo"
    }
  },
  en: {
    propertyType: "Property Type",
    area: "Area (m²)",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    parkingSpaces: "Parking Spaces",
    age: "Age (years)",
    conservationState: "Conservation State",
    location: "Location",
    neighborhood: "Neighborhood",
    address: "Address",
    description: "Description",
    calculate: "Calculate Valuation",
    result: "Valuation Result",
    estimatedValue: "Estimated Value",
    comparables: "Comparable Properties",
    noComparables: "No comparable properties found",
    loading: "Calculating valuation...",
    errors: {
      fillRequired: "Fill in all required fields",
      selectPropertyType: "Select property type",
      enterArea: "Enter property area",
      enterLocation: "Select location on map"
    },
    propertyTypes: {
      casa: "House",
      apartamento: "Apartment",
      terreno: "Land",
      comercial: "Commercial"
    },
    conservationStates: {
      excelente: "Excellent",
      bueno: "Good",
      regular: "Regular",
      malo: "Poor"
    }
  }
};

const PropertyValuation = () => {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    tipoPropiedad: '',
    area: 0,
    construction_area: 0,
    habitaciones: 0,
    banos: 0,
    parqueaderos: 0,
    antiguedad: 0,
    estadoConservacion: '',
    latitud: 0,
    longitud: 0,
    direccionCompleta: '',
    barrio: '',
    descripcion: '',
    estratoSocial: 'medio_bajo' as EstratoSocial
  });

  // Estados para idioma y moneda
  const [selectedLanguage, setSelectedLanguage] = useState('es'); // Español por defecto
  const [selectedCountry, setSelectedCountry] = useState('salvador'); // El Salvador por defecto
  const [selectedCurrency, setSelectedCurrency] = useState('USD'); // USD por defecto (moneda de El Salvador)

  // Configuración de países y monedas del mundo
  const countriesConfig = {
    // América del Norte
    'usa': { 
      name: 'Estados Unidos', 
      currency: 'USD', 
      symbol: '$', 
      flag: '🇺🇸',
      basePricePerM2USD: 2500,
      economicFactor: 2.8,
      exchangeRate: 1.0
    },
    'canada': { 
      name: 'Canadá', 
      currency: 'CAD', 
      symbol: '$', 
      flag: '🇨🇦',
      basePricePerM2USD: 2200,
      economicFactor: 2.5,
      exchangeRate: 1.35
    },
    'mexico': { 
      name: 'México', 
      currency: 'MXN', 
      symbol: '$', 
      flag: '🇲🇽',
      basePricePerM2USD: 800,
      economicFactor: 1.2,
      exchangeRate: 17.0
    },
    
    // América Central
    'guatemala': { 
      name: 'Guatemala', 
      currency: 'GTQ', 
      symbol: 'Q', 
      flag: '🇬🇹',
      basePricePerM2USD: 600,
      economicFactor: 0.9,
      exchangeRate: 7.8
    },
    'belize': { 
      name: 'Belice', 
      currency: 'BZD', 
      symbol: '$', 
      flag: '🇧🇿',
      basePricePerM2USD: 850,
      economicFactor: 1.1,
      exchangeRate: 2.0
    },
    'honduras': { 
      name: 'Honduras', 
      currency: 'HNL', 
      symbol: 'L', 
      flag: '🇭🇳',
      basePricePerM2USD: 550,
      economicFactor: 0.8,
      exchangeRate: 24.7
    },
    'salvador': { 
      name: 'El Salvador', 
      currency: 'USD', 
      symbol: '$', 
      flag: '🇸🇻',
      basePricePerM2USD: 750,
      economicFactor: 1.0,
      exchangeRate: 1.0
    },
    'nicaragua': { 
      name: 'Nicaragua', 
      currency: 'NIO', 
      symbol: 'C$', 
      flag: '🇳🇮',
      basePricePerM2USD: 500,
      economicFactor: 0.7,
      exchangeRate: 36.8
    },
    'costarica': { 
      name: 'Costa Rica', 
      currency: 'CRC', 
      symbol: '₡', 
      flag: '🇨🇷',
      basePricePerM2USD: 950,
      economicFactor: 1.3,
      exchangeRate: 510.0
    },
    'panama': { 
      name: 'Panamá', 
      currency: 'PAB', 
      symbol: 'B/.', 
      flag: '🇵🇦',
      basePricePerM2USD: 1200,
      economicFactor: 1.5,
      exchangeRate: 1.0
    },
    
    // América del Sur
    'colombia': { 
      name: 'Colombia', 
      currency: 'COP', 
      symbol: '$', 
      flag: '🇨🇴',
      basePricePerM2USD: 900,
      economicFactor: 1.1,
      exchangeRate: 4200.0
    },
    'venezuela': { name: 'Venezuela', currency: 'VES', symbol: 'Bs.', flag: '🇻🇪' },
    'guyana': { name: 'Guyana', currency: 'GYD', symbol: '$', flag: '🇬🇾' },
    'suriname': { name: 'Suriname', currency: 'SRD', symbol: '$', flag: '🇸🇷' },
    'brazil': { name: 'Brasil', currency: 'BRL', symbol: 'R$', flag: '🇧🇷' },
    'ecuador': { name: 'Ecuador', currency: 'USD', symbol: '$', flag: '🇪🇨' },
    'peru': { name: 'Perú', currency: 'PEN', symbol: 'S/', flag: '🇵🇪' },
    'bolivia': { name: 'Bolivia', currency: 'BOB', symbol: 'Bs.', flag: '🇧🇴' },
    'chile': { name: 'Chile', currency: 'CLP', symbol: '$', flag: '🇨🇱' },
    'argentina': { name: 'Argentina', currency: 'ARS', symbol: '$', flag: '🇦🇷' },
    'uruguay': { name: 'Uruguay', currency: 'UYU', symbol: '$', flag: '🇺🇾' },
    'paraguay': { name: 'Paraguay', currency: 'PYG', symbol: '₲', flag: '🇵🇾' },
    
    // Europa
    'spain': { name: 'España', currency: 'EUR', symbol: '€', flag: '🇪🇸' },
    'france': { name: 'Francia', currency: 'EUR', symbol: '€', flag: '🇫🇷' },
    'germany': { name: 'Alemania', currency: 'EUR', symbol: '€', flag: '🇩🇪' },
    'italy': { name: 'Italia', currency: 'EUR', symbol: '€', flag: '🇮🇹' },
    'portugal': { name: 'Portugal', currency: 'EUR', symbol: '€', flag: '🇵🇹' },
    'uk': { name: 'Reino Unido', currency: 'GBP', symbol: '£', flag: '🇬🇧' },
    'netherlands': { name: 'Países Bajos', currency: 'EUR', symbol: '€', flag: '🇳🇱' },
    'belgium': { name: 'Bélgica', currency: 'EUR', symbol: '€', flag: '🇧🇪' },
    'switzerland': { name: 'Suiza', currency: 'CHF', symbol: 'CHF', flag: '🇨🇭' },
    'austria': { name: 'Austria', currency: 'EUR', symbol: '€', flag: '🇦🇹' },
    'sweden': { name: 'Suecia', currency: 'SEK', symbol: 'kr', flag: '🇸🇪' },
    'norway': { name: 'Noruega', currency: 'NOK', symbol: 'kr', flag: '🇳🇴' },
    'denmark': { name: 'Dinamarca', currency: 'DKK', symbol: 'kr', flag: '🇩🇰' },
    'finland': { name: 'Finlandia', currency: 'EUR', symbol: '€', flag: '🇫🇮' },
    'poland': { name: 'Polonia', currency: 'PLN', symbol: 'zł', flag: '🇵🇱' },
    'czechia': { name: 'República Checa', currency: 'CZK', symbol: 'Kč', flag: '🇨🇿' },
    'hungary': { name: 'Hungría', currency: 'HUF', symbol: 'Ft', flag: '🇭🇺' },
    'romania': { name: 'Rumania', currency: 'RON', symbol: 'lei', flag: '🇷🇴' },
    'bulgaria': { name: 'Bulgaria', currency: 'BGN', symbol: 'лв', flag: '🇧🇬' },
    'croatia': { name: 'Croacia', currency: 'EUR', symbol: '€', flag: '🇭🇷' },
    'greece': { name: 'Grecia', currency: 'EUR', symbol: '€', flag: '🇬🇷' },
    'russia': { name: 'Rusia', currency: 'RUB', symbol: '₽', flag: '🇷🇺' },
    'ukraine': { name: 'Ucrania', currency: 'UAH', symbol: '₴', flag: '🇺🇦' },
    
    // Asia
    'china': { name: 'China', currency: 'CNY', symbol: '¥', flag: '🇨🇳' },
    'japan': { name: 'Japón', currency: 'JPY', symbol: '¥', flag: '🇯🇵' },
    'southkorea': { name: 'Corea del Sur', currency: 'KRW', symbol: '₩', flag: '🇰🇷' },
    'india': { name: 'India', currency: 'INR', symbol: '₹', flag: '🇮🇳' },
    'thailand': { name: 'Tailandia', currency: 'THB', symbol: '฿', flag: '🇹🇭' },
    'vietnam': { name: 'Vietnam', currency: 'VND', symbol: '₫', flag: '🇻🇳' },
    'singapore': { name: 'Singapur', currency: 'SGD', symbol: '$', flag: '🇸🇬' },
    'malaysia': { name: 'Malasia', currency: 'MYR', symbol: 'RM', flag: '🇲🇾' },
    'indonesia': { name: 'Indonesia', currency: 'IDR', symbol: 'Rp', flag: '🇮🇩' },
    'philippines': { name: 'Filipinas', currency: 'PHP', symbol: '₱', flag: '🇵🇭' },
    'taiwan': { name: 'Taiwán', currency: 'TWD', symbol: '$', flag: '🇹🇼' },
    'hongkong': { name: 'Hong Kong', currency: 'HKD', symbol: '$', flag: '🇭🇰' },
    'pakistan': { name: 'Pakistán', currency: 'PKR', symbol: '₨', flag: '🇵🇰' },
    'bangladesh': { name: 'Bangladesh', currency: 'BDT', symbol: '৳', flag: '🇧🇩' },
    'srilanka': { name: 'Sri Lanka', currency: 'LKR', symbol: 'Rs', flag: '🇱🇰' },
    'israel': { name: 'Israel', currency: 'ILS', symbol: '₪', flag: '🇮🇱' },
    'uae': { name: 'Emiratos Árabes', currency: 'AED', symbol: 'د.إ', flag: '🇦🇪' },
    'saudiarabia': { name: 'Arabia Saudí', currency: 'SAR', symbol: 'ر.س', flag: '🇸🇦' },
    'turkey': { name: 'Turquía', currency: 'TRY', symbol: '₺', flag: '🇹🇷' },
    
    // África
    'southafrica': { name: 'Sudáfrica', currency: 'ZAR', symbol: 'R', flag: '🇿🇦' },
    'egypt': { name: 'Egipto', currency: 'EGP', symbol: '£', flag: '🇪🇬' },
    'nigeria': { name: 'Nigeria', currency: 'NGN', symbol: '₦', flag: '🇳🇬' },
    'kenya': { name: 'Kenia', currency: 'KES', symbol: 'KSh', flag: '🇰🇪' },
    'morocco': { name: 'Marruecos', currency: 'MAD', symbol: 'د.م.', flag: '🇲🇦' },
    'tunisia': { name: 'Túnez', currency: 'TND', symbol: 'د.ت', flag: '🇹🇳' },
    'algeria': { name: 'Argelia', currency: 'DZD', symbol: 'د.ج', flag: '🇩🇿' },
    'ghana': { name: 'Ghana', currency: 'GHS', symbol: '₵', flag: '🇬🇭' },
    'senegal': { name: 'Senegal', currency: 'XOF', symbol: 'CFA', flag: '🇸🇳' },
    'mali': { name: 'Malí', currency: 'XOF', symbol: 'CFA', flag: '🇲🇱' },
    'burkinafaso': { name: 'Burkina Faso', currency: 'XOF', symbol: 'CFA', flag: '🇧🇫' },
    'niger': { name: 'Níger', currency: 'XOF', symbol: 'CFA', flag: '🇳🇪' },
    'ivorycoast': { name: 'Costa de Marfil', currency: 'XOF', symbol: 'CFA', flag: '🇨🇮' },
    'ethiopia': { name: 'Etiopía', currency: 'ETB', symbol: 'Br', flag: '🇪🇹' },
    'tanzania': { name: 'Tanzania', currency: 'TZS', symbol: 'TSh', flag: '🇹🇿' },
    'uganda': { name: 'Uganda', currency: 'UGX', symbol: 'USh', flag: '🇺🇬' },
    'rwanda': { name: 'Ruanda', currency: 'RWF', symbol: 'FRw', flag: '🇷🇼' },
    'cameroon': { name: 'Camerún', currency: 'XAF', symbol: 'FCFA', flag: '🇨🇲' },
    'angola': { name: 'Angola', currency: 'AOA', symbol: 'Kz', flag: '🇦🇴' },
    'mozambique': { name: 'Mozambique', currency: 'MZN', symbol: 'MT', flag: '🇲🇿' },
    'madagascar': { name: 'Madagascar', currency: 'MGA', symbol: 'Ar', flag: '🇲🇬' },
    'namibia': { name: 'Namibia', currency: 'NAD', symbol: '$', flag: '🇳🇦' },
    'botswana': { name: 'Botsuana', currency: 'BWP', symbol: 'P', flag: '🇧🇼' },
    'zimbabwe': { name: 'Zimbabue', currency: 'ZWL', symbol: '$', flag: '🇿🇼' },
    'zambia': { name: 'Zambia', currency: 'ZMW', symbol: 'ZK', flag: '🇿🇲' },
    'libya': { name: 'Libia', currency: 'LYD', symbol: 'ل.د', flag: '🇱🇾' },
    'sudan': { name: 'Sudán', currency: 'SDG', symbol: 'ج.س.', flag: '🇸🇩' },
    
    // Más países de Europa
    'ireland': { name: 'Irlanda', currency: 'EUR', symbol: '€', flag: '🇮🇪' },
    'iceland': { name: 'Islandia', currency: 'ISK', symbol: 'kr', flag: '🇮🇸' },
    'slovakia': { name: 'Eslovaquia', currency: 'EUR', symbol: '€', flag: '🇸🇰' },
    'slovenia': { name: 'Eslovenia', currency: 'EUR', symbol: '€', flag: '🇸🇮' },
    'bosniaherzegovina': { name: 'Bosnia y Herzegovina', currency: 'BAM', symbol: 'KM', flag: '🇧🇦' },
    'serbia': { name: 'Serbia', currency: 'RSD', symbol: 'дин', flag: '🇷🇸' },
    'montenegro': { name: 'Montenegro', currency: 'EUR', symbol: '€', flag: '🇲🇪' },
    'northmacedonia': { name: 'Macedonia del Norte', currency: 'MKD', symbol: 'ден', flag: '🇲🇰' },
    'albania': { name: 'Albania', currency: 'ALL', symbol: 'L', flag: '🇦🇱' },
    'latvia': { name: 'Letonia', currency: 'EUR', symbol: '€', flag: '🇱🇻' },
    'lithuania': { name: 'Lituania', currency: 'EUR', symbol: '€', flag: '🇱🇹' },
    'estonia': { name: 'Estonia', currency: 'EUR', symbol: '€', flag: '🇪🇪' },
    'belarus': { name: 'Bielorrusia', currency: 'BYN', symbol: 'Br', flag: '🇧🇾' },
    'moldova': { name: 'Moldavia', currency: 'MDL', symbol: 'L', flag: '🇲🇩' },
    'luxembourg': { name: 'Luxemburgo', currency: 'EUR', symbol: '€', flag: '🇱🇺' },
    'malta': { name: 'Malta', currency: 'EUR', symbol: '€', flag: '🇲🇹' },
    'cyprus': { name: 'Chipre', currency: 'EUR', symbol: '€', flag: '🇨🇾' },
    
    // Más países de Asia
    'northkorea': { name: 'Corea del Norte', currency: 'KPW', symbol: '₩', flag: '🇰🇵' },
    'mongolia': { name: 'Mongolia', currency: 'MNT', symbol: '₮', flag: '🇲🇳' },
    'myanmar': { name: 'Myanmar', currency: 'MMK', symbol: 'K', flag: '🇲🇲' },
    'laos': { name: 'Laos', currency: 'LAK', symbol: '₭', flag: '🇱🇦' },
    'cambodia': { name: 'Camboya', currency: 'KHR', symbol: '៛', flag: '🇰🇭' },
    'brunei': { name: 'Brunéi', currency: 'BND', symbol: '$', flag: '🇧🇳' },
    'nepal': { name: 'Nepal', currency: 'NPR', symbol: 'Rs', flag: '🇳🇵' },
    'bhutan': { name: 'Bután', currency: 'BTN', symbol: 'Nu.', flag: '🇧🇹' },
    'maldives': { name: 'Maldivas', currency: 'MVR', symbol: 'Rf', flag: '🇲🇻' },
    'afghanistan': { name: 'Afganistán', currency: 'AFN', symbol: '؋', flag: '🇦🇫' },
    'kazakhstan': { name: 'Kazajistán', currency: 'KZT', symbol: '₸', flag: '🇰🇿' },
    'uzbekistan': { name: 'Uzbekistán', currency: 'UZS', symbol: 'soʻm', flag: '🇺🇿' },
    'kyrgyzstan': { name: 'Kirguistán', currency: 'KGS', symbol: 'с', flag: '🇰🇬' },
    'tajikistan': { name: 'Tayikistán', currency: 'TJS', symbol: 'ЅМ', flag: '🇹🇯' },
    'turkmenistan': { name: 'Turkmenistán', currency: 'TMT', symbol: 'T', flag: '🇹🇲' },
    'iran': { name: 'Irán', currency: 'IRR', symbol: '﷼', flag: '🇮🇷' },
    'iraq': { name: 'Irak', currency: 'IQD', symbol: 'ع.د', flag: '🇮🇶' },
    'syria': { name: 'Siria', currency: 'SYP', symbol: '£', flag: '🇸🇾' },
    'jordan': { name: 'Jordania', currency: 'JOD', symbol: 'د.ا', flag: '🇯🇴' },
    'lebanon': { name: 'Líbano', currency: 'LBP', symbol: 'ل.ل', flag: '🇱🇧' },
    'palestine': { name: 'Palestina', currency: 'ILS', symbol: '₪', flag: '🇵🇸' },
    'qatar': { name: 'Qatar', currency: 'QAR', symbol: 'ر.ق', flag: '🇶🇦' },
    'kuwait': { name: 'Kuwait', currency: 'KWD', symbol: 'د.ك', flag: '🇰🇼' },
    'bahrain': { name: 'Baréin', currency: 'BHD', symbol: '.د.ب', flag: '🇧🇭' },
    'oman': { name: 'Omán', currency: 'OMR', symbol: 'ر.ع.', flag: '🇴🇲' },
    'yemen': { name: 'Yemen', currency: 'YER', symbol: '﷼', flag: '🇾🇪' },
    'macau': { name: 'Macao', currency: 'MOP', symbol: 'P', flag: '🇲🇴' },
    'timorleste': { name: 'Timor Oriental', currency: 'USD', symbol: '$', flag: '🇹🇱' },
    
    // Oceanía extendida
    'fiji': { name: 'Fiyi', currency: 'FJD', symbol: '$', flag: '🇫🇯' },
    'papuanewguinea': { name: 'Papúa Nueva Guinea', currency: 'PGK', symbol: 'K', flag: '🇵🇬' },
    'vanuatu': { name: 'Vanuatu', currency: 'VUV', symbol: 'VT', flag: '🇻🇺' },
    'samoa': { name: 'Samoa', currency: 'WST', symbol: 'T', flag: '🇼🇸' },
    'tonga': { name: 'Tonga', currency: 'TOP', symbol: 'T$', flag: '🇹🇴' },
    'palau': { name: 'Palaos', currency: 'USD', symbol: '$', flag: '🇵🇼' },
    'solomonislands': { name: 'Islas Salomón', currency: 'SBD', symbol: '$', flag: '🇸🇧' },
    'micronesia': { name: 'Micronesia', currency: 'USD', symbol: '$', flag: '🇫🇲' },
    'marshallislands': { name: 'Islas Marshall', currency: 'USD', symbol: '$', flag: '🇲🇭' },
    'kiribati': { name: 'Kiribati', currency: 'AUD', symbol: '$', flag: '🇰🇮' },
    'nauru': { name: 'Nauru', currency: 'AUD', symbol: '$', flag: '🇳🇷' },
    'tuvalu': { name: 'Tuvalu', currency: 'AUD', symbol: '$', flag: '🇹🇻' },
    
    // Caribe extendido
    'antiguabarbuda': { name: 'Antigua y Barbuda', currency: 'XCD', symbol: '$', flag: '🇦🇬' },
    'bahamas': { name: 'Bahamas', currency: 'BSD', symbol: '$', flag: '🇧🇸' },
    'dominica': { name: 'Dominica', currency: 'XCD', symbol: '$', flag: '🇩🇲' },
    'grenada': { name: 'Granada', currency: 'XCD', symbol: '$', flag: '🇬🇩' },
    'saintlucia': { name: 'Santa Lucía', currency: 'XCD', symbol: '$', flag: '🇱🇨' },
    'saintvincent': { name: 'San Vicente y las Granadinas', currency: 'XCD', symbol: '$', flag: '🇻🇨' },
    'saintkitts': { name: 'San Cristóbal y Nieves', currency: 'XCD', symbol: '$', flag: '🇰🇳' }
  };

  const [activeTab, setActiveTab] = useState<string>('configuracion');
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [selectedMainStrata, setSelectedMainStrata] = useState<string>('');

  const t = translations[selectedLanguage];

  // Estados de conservación para el dropdown con factores exactos
  const conservationStates = [
    { value: 'NUEVO', label: 'NUEVO', factor: 1.0000 },
    { value: 'BUENO', label: 'BUENO', factor: 0.9968 },
    { value: 'MEDIO', label: 'MEDIO', factor: 0.9748 },
    { value: 'REGULAR', label: 'REGULAR', factor: 0.9191 },
    { value: 'REPARACIONES SENCILLAS', label: 'REPARACIONES SENCILLAS', factor: 0.8190 },
    { value: 'REPARACIONES MEDIAS', label: 'REPARACIONES MEDIAS', factor: 0.6680 },
    { value: 'REPARACIONES IMPORTANTES', label: 'REPARACIONES IMPORTANTES', factor: 0.4740 },
    { value: 'DAÑOS GRAVES', label: 'DAÑOS GRAVES', factor: 0.2480 },
    { value: 'EN DESECHO', label: 'EN DESECHO', factor: 0.1350 }
  ];

  // Explicaciones detalladas para cada estado de conservación
  const conservationExplanations = {
    'NUEVO': {
      description: 'Propiedad en estado óptimo, sin desgaste visible',
      details: [
        'Construcción reciente (menos de 2 años)',
        'Acabados en perfecto estado',
        'Instalaciones eléctricas, hidráulicas y sanitarias nuevas',
        'Sin necesidad de reparaciones',
        'Pintura y revestimientos en excelente condición'
      ]
    },
    'BUENO': {
      description: 'Propiedad bien mantenida con desgaste mínimo',
      details: [
        'Mantenimiento regular y adecuado',
        'Desgaste normal por uso pero controlado',
        'Instalaciones funcionando correctamente',
        'Pequeños detalles de mantenimiento preventivo',
        'Estructura sólida y estable'
      ]
    },
    'MEDIO': {
      description: 'Propiedad con desgaste normal del tiempo',
      details: [
        'Signos evidentes de uso y tiempo',
        'Algunas instalaciones requieren revisión',
        'Pintura con desgaste en ciertas áreas',
        'Funcionalidad general buena',
        'Mantenimiento correctivo ocasional'
      ]
    },
    'REGULAR': {
      description: 'Propiedad que requiere mantenimiento programado',
      details: [
        'Desgaste considerable pero no crítico',
        'Necesita mantenimiento en múltiples áreas',
        'Algunas instalaciones obsoletas',
        'Problemas menores en acabados',
        'Requiere inversión en mejoras'
      ]
    },
    'REPARACIONES SENCILLAS': {
      description: 'Requiere reparaciones básicas y económicas',
      details: [
        'Pintura interior y exterior',
        'Reparación de cerrajería básica',
        'Mantenimiento de jardines',
        'Limpieza profunda y aseo',
        'Reparaciones eléctricas menores'
      ]
    },
    'REPARACIONES MEDIAS': {
      description: 'Necesita reparaciones de nivel intermedio',
      details: [
        'Renovación de pisos y revestimientos',
        'Reparación de instalaciones hidráulicas',
        'Mejoras en cocina y baños',
        'Reparaciones en techos y cubiertas',
        'Actualizaciones en instalaciones eléctricas'
      ]
    },
    'REPARACIONES IMPORTANTES': {
      description: 'Requiere intervenciones estructurales significativas',
      details: [
        'Reparaciones en estructura principal',
        'Renovación completa de techos',
        'Reconstrucción de muros y tabiques',
        'Reemplazo total de instalaciones',
        'Impermeabilización y cimentación'
      ]
    },
    'DAÑOS GRAVES': {
      description: 'Presenta fallas estructurales que comprometen la seguridad',
      details: [
        'Grietas en estructura principal',
        'Problemas de cimentación',
        'Techos con filtraciónes severas',
        'Instalaciones en estado crítico',
        'Riesgo para la habitabilidad'
      ]
    },
    'EN DESECHO': {
      description: 'Propiedad que requiere demolición o reconstrucción total',
      details: [
        'Estructura comprometida irreversiblemente',
        'Inhabitable por razones de seguridad',
        'Costo de reparación superior al valor',
        'Recomendable demolición completa',
        'Solo conserva valor del terreno'
      ]
    }
  };

  const [selectedConservationState, setSelectedConservationState] = useState<string | null>(null);

  // Funciones de validación de pasos
  const isStep0Complete = () => {
    return selectedLanguage !== '' && selectedCountry !== '';
  };

  const isStep1Complete = () => {
    return !!propertyData.estratoSocial;
  };

  const isStep2Complete = () => {
    return propertyData.tipoPropiedad !== '';
  };

  const isStep3Complete = () => {
    return propertyData.latitud !== 0 && propertyData.longitud !== 0 && propertyData.direccionCompleta !== '';
  };

  const isStep4Complete = () => {
    return propertyData.area > 0;
  };

  const isStep5Complete = () => {
    return propertyData.estadoConservacion !== '';
  };

  // Función para obtener el siguiente paso requerido
  const getNextRequiredStep = () => {
    if (!isStep0Complete()) return 0;
    if (!isStep1Complete()) return 1;
    if (!isStep2Complete()) return 2;
    if (!isStep3Complete()) return 3;
    if (!isStep4Complete()) return 4;
    if (!isStep5Complete()) return 5;
    return 'valuacion';
  };

  const handleInputChange = (field: string, value: any) => {
    console.log('INPUT CHANGE:', field, value);
    
    if (field === 'language') {
      setSelectedLanguage(value);
    } else if (field === 'country') {
      setSelectedCountry(value);
      setSelectedCurrency(countriesConfig[value]?.currency || '');
      if (selectedLanguage && value) {
        setActiveTab('estrato');
      }
    } else {
      setPropertyData(prev => {
        const updated = { ...prev, [field]: value };
        console.log('PROPERTY DATA UPDATED:', updated);
        return updated;
      });
    }
    
    // Auto-abrir el siguiente paso (solo para selects, no para inputs de texto)
    if (field === 'estratoSocial' && value && isStep2Complete()) {
      setActiveTab('tipo');
    } else if (field === 'tipoPropiedad' && value && isStep3Complete()) {
      setActiveTab('ubicacion');
    } else if ((field === 'latitud' || field === 'direccionCompleta') && value && isStep4Complete()) {
      setActiveTab('caracteristicas');
    }
    // Removido el auto-cambio para campos de área para evitar cambios no deseados
  };

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setPropertyData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng,
      direccionCompleta: address,
      barrio: '' // El componente no proporciona barrio específicamente
    }));
  };

  const fetchComparables = async () => {
    try {
      // 1) Preferimos usar la función SQL para buscar por cercanía + estrato
      if (propertyData.latitud && propertyData.longitud) {
        const { data, error } = await supabase.rpc('find_comparables_progressive_radius', {
          target_lat: propertyData.latitud,
          target_lng: propertyData.longitud,
          target_estrato: propertyData.estratoSocial,
          target_property_type: propertyData.tipoPropiedad || null,
        });

        if (error) {
          console.error('Error fetching comparables (rpc):', error);
        } else if (data) {
          return data;
        }
      }

      // 2) Fallback: filtrar por estrato + países de Latinoamérica
      const LATAM_COUNTRIES = [
        'Argentina', 'Bolivia', 'Brasil', 'Brazil', 'Chile', 'Colombia', 'Costa Rica',
        'Cuba', 'Ecuador', 'El Salvador', 'Guatemala', 'Honduras', 'México', 'Mexico',
        'Nicaragua', 'Panamá', 'Panama', 'Paraguay', 'Perú', 'Peru', 'Puerto Rico',
        'República Dominicana', 'Dominican Republic', 'Uruguay', 'Venezuela'
      ];

      const { data, error } = await supabase
        .from('property_comparables')
        .select('*')
        .eq('estrato_social', propertyData.estratoSocial)
        .in('country', LATAM_COUNTRIES)
        .limit(10);

      if (error) {
        console.error('Error fetching comparables (fallback):', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching comparables:', error);
      return [];
    }
  };

  const performValuation = async () => {
    if (getNextRequiredStep() !== 'valuacion') {
      toast.error("Debe completar todos los pasos antes de realizar la valuación");
      return;
    }

    setIsCalculating(true);
    
    try {
      const comparablesData = await fetchComparables();
      setComparables(comparablesData);

      // Obtener configuración del país seleccionado
      const countryConfig = countriesConfig[selectedCountry];
      const basePriceUSD = countryConfig?.basePricePerM2USD || 350;
      const economicFactor = countryConfig?.economicFactor || 1.0;
      const exchangeRate = countryConfig?.exchangeRate || 1.0;
      const currency = countryConfig?.currency || 'USD';
      const currencySymbol = countryConfig?.symbol || '$';

      // Precio base ajustado por país y economía local
      let adjustedBasePriceUSD = basePriceUSD;
      
      // Si tenemos comparables, usar el promedio ponderado con el precio base del país
      if (comparablesData.length > 0) {
        const avgPricePerM2USD = comparablesData.reduce((sum, comp) => sum + comp.price_per_sqm_usd, 0) / comparablesData.length;
        // Combinar precio base del país (60%) con comparables (40%)
        adjustedBasePriceUSD = (basePriceUSD * 0.6) + (avgPricePerM2USD * 0.4);
      }

      // Aplicar factores de ajuste
      const estratoMultiplier = estratoMultipliers[propertyData.estratoSocial];
      const conservationMultiplier = conservationFactors[propertyData.estadoConservacion] || 1;
      const ageMultiplier = Math.max(0.7, 1 - (propertyData.antiguedad * 0.02));
      
      console.log('FACTORES INTERNACIONALES APLICADOS:', {
        pais: selectedCountry,
        precioBasePais: basePriceUSD,
        factorEconomico: economicFactor,
        tipoCambio: exchangeRate,
        moneda: currency,
        estadoSeleccionado: propertyData.estadoConservacion,
        conservationMultiplier,
        estratoMultiplier
      });

      // Cálculo con factores internacionales
      const finalPriceUSD = adjustedBasePriceUSD * estratoMultiplier * conservationMultiplier * ageMultiplier * economicFactor;
      const totalValueUSD = finalPriceUSD * propertyData.area;
      
      // Convertir a moneda local
      const totalValueLocal = totalValueUSD * exchangeRate;
      const pricePerM2Local = finalPriceUSD * exchangeRate;

      const result = {
        valorTotal: totalValueUSD, // Valor total en USD para referencia
        valorTotalLocal: totalValueLocal, // Valor en moneda local
        valorPorM2: finalPriceUSD, // Precio por m² en USD
        valorPorM2Local: pricePerM2Local, // Precio por m² en moneda local
        direccion: propertyData.direccionCompleta,
        factores: {
          estrato: estratoMultiplier,
          conservacion: conservationMultiplier,
          antiguedad: ageMultiplier,
          economico: economicFactor
        },
        pais: countryConfig?.name || selectedCountry,
        moneda: currency,
        simbolo: currencySymbol,
        tipoCambio: exchangeRate,
        metodologia: `Método de Comparación de Mercado Internacional según normas UPAV e IVSC - Valuación en ${currency}`,
        fecha: new Date().toLocaleDateString(),
        comparables: comparablesData.length
      };

      setValuationResult(result);
      toast.success(`¡Valuación completada exitosamente en ${currency}!`);
      
    } catch (error) {
      console.error('Error performing valuation:', error);
      toast.error("Error al realizar la valuación");
    } finally {
      setIsCalculating(false);
    }
  };

  const reiniciarFormulario = () => {
    setPropertyData({
      tipoPropiedad: '',
      area: 0,
      construction_area: 0,
      habitaciones: 0,
      banos: 0,
      parqueaderos: 0,
      antiguedad: 0,
      estadoConservacion: '',
      latitud: 0,
      longitud: 0,
      direccionCompleta: '',
      barrio: '',
      descripcion: '',
      estratoSocial: 'medio_bajo' as EstratoSocial
    });
    setActiveTab('estrato');
    setValuationResult(null);
    setComparables([]);
    toast.info("Formulario reiniciado");
  };

  const handleWalkthroughStep = (stepId: string) => {
    setHighlightedElement(stepId);
    
    setTimeout(() => {
      const element = document.getElementById(stepId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Panel Principal - Formulario */}
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">💎 Valuador Latinoamericano</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowWalkthrough(true)}
                    className="text-xs font-semibold hover:scale-105 transition-transform"
                  >
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Tutorial
                  </Button>
                  <LanguageSelector />
                </div>
              </div>
              <p className="text-sm text-primary-foreground/90 mt-2">
                ✨ Siguiendo normas UPAV, IVSC y reglamentos de valuación latinoamericanos
              </p>
            </CardHeader>
            <CardContent className="p-6">
              
              {/* PESTAÑAS PRINCIPALES - SIEMPRE VISIBLES CON GRADIENTES LLAMATIVOS */}
              <div className="mb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-7 gap-2 h-auto p-2 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-2xl border-2 border-violet-300 shadow-2xl backdrop-blur-sm">
                    <TabsTrigger 
                      value="configuracion" 
                      className="relative overflow-hidden p-4 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-600 data-[state=active]:via-green-600 data-[state=active]:to-emerald-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:ring-4 data-[state=active]:ring-emerald-300 data-[state=active]:scale-110 bg-white/80 backdrop-blur-sm border border-emerald-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all ${
                          isStep0Complete() 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white ring-2 ring-emerald-300' 
                            : activeTab === 'configuracion' 
                              ? 'bg-gradient-to-r from-white to-emerald-50 text-emerald-700 ring-2 ring-emerald-300' 
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600'
                        }`}>
                          {isStep0Complete() ? '✓' : '0'}
                        </div>
                        <span className={activeTab === 'configuracion' ? 'text-white' : 'text-gray-700'}>🌍 Config</span>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger
                      value="estrato" 
                      className="relative overflow-hidden p-4 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-violet-600 data-[state=active]:via-purple-600 data-[state=active]:to-fuchsia-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:ring-4 data-[state=active]:ring-violet-300 data-[state=active]:scale-110 bg-white/80 backdrop-blur-sm border border-violet-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all ${
                          isStep1Complete() 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white ring-2 ring-emerald-300' 
                            : activeTab === 'estrato' 
                              ? 'bg-gradient-to-r from-white to-violet-50 text-violet-700 ring-2 ring-violet-300' 
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600'
                        }`}>
                          {isStep1Complete() ? '✓' : '1'}
                        </div>
                        <span className={activeTab === 'estrato' ? 'text-white' : 'text-gray-700'}>🏘️ Estrato</span>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="tipo" 
                      className="relative overflow-hidden p-4 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:via-cyan-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:ring-4 data-[state=active]:ring-blue-300 data-[state=active]:scale-110 bg-white/80 backdrop-blur-sm border border-blue-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all ${
                          isStep2Complete() 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white ring-2 ring-emerald-300' 
                            : activeTab === 'tipo' 
                              ? 'bg-gradient-to-r from-white to-blue-50 text-blue-700 ring-2 ring-blue-300' 
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600'
                        }`}>
                          {isStep2Complete() ? '✓' : '2'}
                        </div>
                        <span className={activeTab === 'tipo' ? 'text-white' : 'text-gray-700'}>🏠 Tipo</span>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="ubicacion" 
                      className="relative overflow-hidden p-4 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-600 data-[state=active]:via-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:ring-4 data-[state=active]:ring-emerald-300 data-[state=active]:scale-110 bg-white/80 backdrop-blur-sm border border-emerald-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all ${
                          isStep3Complete() 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white ring-2 ring-emerald-300' 
                            : activeTab === 'ubicacion' 
                              ? 'bg-gradient-to-r from-white to-emerald-50 text-emerald-700 ring-2 ring-emerald-300' 
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600'
                        }`}>
                          {isStep3Complete() ? '✓' : '3'}
                        </div>
                        <span className={activeTab === 'ubicacion' ? 'text-white' : 'text-gray-700'}>🌍 Ubicación</span>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger 
                      value="caracteristicas" 
                      className="relative overflow-hidden p-4 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-600 data-[state=active]:via-red-600 data-[state=active]:to-orange-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:ring-4 data-[state=active]:ring-orange-300 data-[state=active]:scale-110 bg-white/80 backdrop-blur-sm border border-orange-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all ${
                          isStep4Complete() 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white ring-2 ring-emerald-300' 
                            : activeTab === 'caracteristicas' 
                              ? 'bg-gradient-to-r from-white to-orange-50 text-orange-700 ring-2 ring-orange-300' 
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600'
                        }`}>
                          {isStep4Complete() ? '✓' : '4'}
                        </div>
                        <span className={activeTab === 'caracteristicas' ? 'text-white' : 'text-gray-700'}>📐 Área</span>
                      </div>
                    </TabsTrigger>
                    
                    
                    <TabsTrigger 
                      value="depreciacion"
                      className="relative overflow-hidden p-4 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-indigo-600 data-[state=active]:via-purple-600 data-[state=active]:to-indigo-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:ring-4 data-[state=active]:ring-indigo-300 data-[state=active]:scale-110 bg-white/80 backdrop-blur-sm border border-indigo-200"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all ${
                          activeTab === 'depreciacion' 
                            ? 'bg-gradient-to-r from-white to-indigo-50 text-indigo-700 ring-2 ring-indigo-300'
                            : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600'
                        }`}>
                          📉
                        </div>
                        <span className={activeTab === 'depreciacion' ? 'text-white' : 'text-gray-700'}>📉 Depreciación</span>
                      </div>
                    </TabsTrigger>
                    
                    <TabsTrigger
                      value="valuacion" 
                      disabled={getNextRequiredStep() !== 'valuacion'}
                      className="relative overflow-hidden p-4 rounded-xl text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg data-[state=active]:bg-gradient-to-br data-[state=active]:from-pink-600 data-[state=active]:via-rose-600 data-[state=active]:to-pink-700 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:ring-4 data-[state=active]:ring-pink-300 data-[state=active]:scale-110 bg-white/80 backdrop-blur-sm border border-pink-200 disabled:opacity-50"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all ${
                          getNextRequiredStep() === 'valuacion' 
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white animate-pulse ring-2 ring-pink-300' 
                            : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600'
                        }`}>
                          📊
                        </div>
                        <span className={activeTab === 'valuacion' ? 'text-white' : 'text-gray-700'}>💎 Valuación</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  {/* CONTENIDO DE LAS PESTAÑAS */}
                  
                  {/* Paso 0: Configuración - Idioma y Moneda */}
                  <TabsContent value="configuracion" className="mt-6">
                    <Card className="border-2 border-emerald-200 shadow-xl bg-gradient-to-br from-emerald-50/50 to-green-50/50">
                      <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            {isStep0Complete() ? '✓' : '0'}
                          </div>
                          🌍 Paso 1: Idioma y País
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          {/* Selección de Idioma */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-semibold mb-3 block">
                                🗣️ ¿En qué idioma quieres que te hablemos? *
                              </Label>
                              <Select 
                                value={selectedLanguage} 
                                onValueChange={(value) => handleInputChange('language', value)}
                              >
                                <SelectTrigger className="border-2 focus:border-emerald-500 hover:border-emerald-400 transition-colors h-12">
                                  <SelectValue placeholder="Elige tu idioma favorito" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900 z-50">
                                  <SelectItem value="es" className="font-medium py-3">🇪🇸 Español</SelectItem>
                                  <SelectItem value="en" className="font-medium py-3">🇺🇸 English</SelectItem>
                                  <SelectItem value="pt" className="font-medium py-3">🇧🇷 Português</SelectItem>
                                  <SelectItem value="fr" className="font-medium py-3">🇫🇷 Français</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Selección de País */}
                          <div className="space-y-4">
                            <div>
                              <Label className="text-base font-semibold mb-3 block">
                                🌍 ¿En qué país está tu casa? *
                              </Label>
                              <Select 
                                value={selectedCountry} 
                                onValueChange={(value) => handleInputChange('country', value)}
                                disabled={!selectedLanguage}
                              >
                                <SelectTrigger className="border-2 focus:border-emerald-500 hover:border-emerald-400 transition-colors h-12">
                                  <SelectValue placeholder="Elige el país donde está tu casa" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900 z-50 max-h-60 overflow-y-auto">
                                  {Object.entries(countriesConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key} className="font-medium py-3">
                                      {config.flag} {config.name} ({config.currency})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Mostrar moneda seleccionada */}
                            {selectedCountry && (
                              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <p className="text-emerald-800 font-semibold text-sm">
                                  ✅ País: {countriesConfig[selectedCountry]?.name}
                                </p>
                                <p className="text-emerald-700 text-sm">
                                  Moneda: {countriesConfig[selectedCountry]?.currency} ({countriesConfig[selectedCountry]?.symbol})
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Confirmación cuando se complete */}
                        {isStep0Complete() && (
                          <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">✅</span>
                              <p className="text-green-800 font-medium text-sm">¡Perfecto! Ya elegiste idioma y país</p>
                            </div>
                          </div>
                        )}

                        {/* Instrucciones si no está completo */}
                        {!isStep0Complete() && (
                          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                             <div className="flex items-center gap-2">
                               <span className="text-yellow-600">⚠️</span>
                               <p className="text-yellow-800 font-medium text-sm">
                                 <strong>¡Espera!</strong> Primero elige tu idioma y en qué país está tu casa
                               </p>
                             </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Paso 1: Estrato Social */}
                  <TabsContent value="estrato" className="mt-6">
                    <Card className="border-2 border-violet-200 shadow-xl bg-gradient-to-br from-violet-50/50 to-purple-50/50">
                      <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            {isStep1Complete() ? '✓' : '1'}
                          </div>
                          🏘️ Paso 2: ¿Qué tan rico es tu barrio?
                        </CardTitle>
                      </CardHeader>
                       <CardContent className="p-6">
                         {/* Validación si paso anterior no está completo */}
                         {!isStep0Complete() && (
                           <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-4">
                             <div className="flex items-center gap-2">
                               <span className="text-red-600">🚫</span>
                               <p className="text-red-800 font-medium text-sm">
                                 <strong>¡Alto!</strong> Primero debes elegir el idioma y país en el paso anterior
                               </p>
                             </div>
                           </div>
                         )}
                         
                         <p className="text-muted-foreground mb-4">Dime, ¿tu barrio es rico, normal o pobre?</p>
                         
                         {!propertyData.estratoSocial && (
                           <div className="space-y-4">
                             <h3 className="font-semibold text-lg">Primero dime, ¿cómo es tu barrio?</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               {/* Barrio Pobre */}
                               <div 
                                 className="p-4 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-400 transition-all"
                                 onClick={() => setSelectedMainStrata('bajo')}
                               >
                                 <div className="text-center">
                                   <span className="text-3xl">🏚️</span>
                                   <h4 className="font-bold text-lg mt-2">BARRIO POBRE</h4>
                                   <p className="text-sm text-muted-foreground">Casas sencillas, pocos servicios</p>
                                 </div>
                               </div>
                               
                               {/* Barrio Normal */}
                               <div 
                                 className="p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
                                 onClick={() => setSelectedMainStrata('medio')}
                               >
                                 <div className="text-center">
                                   <span className="text-3xl">🏙️</span>
                                   <h4 className="font-bold text-lg mt-2">BARRIO NORMAL</h4>
                                   <p className="text-sm text-muted-foreground">Casas normales, buenos servicios</p>
                                 </div>
                               </div>
                               
                               {/* Barrio Rico */}
                               <div 
                                 className="p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all"
                                 onClick={() => setSelectedMainStrata('alto')}
                               >
                                 <div className="text-center">
                                   <span className="text-3xl">🏰</span>
                                   <h4 className="font-bold text-lg mt-2">BARRIO RICO</h4>
                                   <p className="text-sm text-muted-foreground">Casas lujosas, zona exclusiva</p>
                                 </div>
                               </div>
                             </div>
                           </div>
                         )}
                         
                         {selectedMainStrata && !propertyData.estratoSocial && (
                           <div className="mt-6 space-y-4">
                             <h3 className="font-semibold text-lg">Ahora dime exactamente qué tan rico o pobre es:</h3>
                             <div className="grid gap-3">
                               {selectedMainStrata === 'bajo' && (
                                 <>
                                   <div 
                                     className="p-3 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-400 transition-all"
                                     onClick={() => handleInputChange('estratoSocial', 'bajo_bajo')}
                                   >
                                     <span className="font-medium">🏚️ {estratoSocialLabels['bajo_bajo']}</span>
                                   </div>
                                   <div 
                                     className="p-3 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-400 transition-all"
                                     onClick={() => handleInputChange('estratoSocial', 'bajo_medio')}
                                   >
                                     <span className="font-medium">🏡 {estratoSocialLabels['bajo_medio']}</span>
                                   </div>
                                   <div 
                                     className="p-3 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-400 transition-all"
                                     onClick={() => handleInputChange('estratoSocial', 'bajo_alto')}
                                   >
                                     <span className="font-medium">🏘️ {estratoSocialLabels['bajo_alto']}</span>
                                   </div>
                                 </>
                               )}
                               
                               {selectedMainStrata === 'medio' && (
                                 <>
                                   <div 
                                     className="p-3 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
                                     onClick={() => handleInputChange('estratoSocial', 'medio_bajo')}
                                   >
                                     <span className="font-medium">🏙️ {estratoSocialLabels['medio_bajo']}</span>
                                   </div>
                                   <div 
                                     className="p-3 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
                                     onClick={() => handleInputChange('estratoSocial', 'medio_medio')}
                                   >
                                     <span className="font-medium">🏢 {estratoSocialLabels['medio_medio']}</span>
                                   </div>
                                   <div 
                                     className="p-3 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all"
                                     onClick={() => handleInputChange('estratoSocial', 'medio_alto')}
                                   >
                                     <span className="font-medium">🏰 {estratoSocialLabels['medio_alto']}</span>
                                   </div>
                                 </>
                               )}
                               
                               {selectedMainStrata === 'alto' && (
                                 <>
                                   <div 
                                     className="p-3 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all"
                                     onClick={() => handleInputChange('estratoSocial', 'alto_medio')}
                                   >
                                     <span className="font-medium">🗼 {estratoSocialLabels['alto_medio']}</span>
                                   </div>
                                   <div 
                                     className="p-3 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all"
                                     onClick={() => handleInputChange('estratoSocial', 'alto_alto')}
                                   >
                                     <span className="font-medium">💎 {estratoSocialLabels['alto_alto']}</span>
                                   </div>
                                 </>
                               )}
                             </div>
                             <Button 
                               variant="outline" 
                               onClick={() => setSelectedMainStrata('')}
                               className="mt-4"
                             >
                               ← Volver a seleccionar nivel principal
                             </Button>
                           </div>
                         )}
                         
                          {propertyData.estratoSocial && (
                            <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                <p className="text-green-800 font-medium text-sm">
                                  Estrato social completado: {estratoSocialLabels[propertyData.estratoSocial]}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-muted-foreground mt-3">
                            💡 <strong>¿Por qué necesitamos esto?</strong> Para calcular el precio correcto de tu casa, necesitamos saber qué tan rico o pobre es tu barrio. Las casas en barrios ricos valen más que las casas iguales en barrios pobres.
                          </p>
                          
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-xs">
                              🎯 <strong>Importante para el avalúo:</strong> Esta información nos ayuda a encontrar otras casas similares a la tuya en barrios parecidos para comparar precios y darte un avalúo más exacto.
                            </p>
                          </div>
                       </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Paso 2: Tipo de Propiedad */}
                  <TabsContent value="tipo" className="mt-6">
                    <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50/50 to-cyan-50/50">
                      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            {isStep2Complete() ? '✓' : '2'}
                          </div>
                          🏠 Paso 3: ¿Qué tipo de casa tienes?
                        </CardTitle>
                      </CardHeader>
                       <CardContent className="p-6">
                         {/* Validación si paso anterior no está completo */}
                         {!isStep1Complete() && (
                           <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-4">
                             <div className="flex items-center gap-2">
                               <span className="text-red-600">🚫</span>
                               <p className="text-red-800 font-medium text-sm">
                                 <strong>¡Espera!</strong> Primero dime qué tan rico es tu barrio
                               </p>
                             </div>
                           </div>
                         )}
                         
                         <p className="text-muted-foreground mb-4">¿Tu casa es una casa normal, un apartamento, un terreno vacío o un local comercial?</p>
                        <Select 
                          value={propertyData.tipoPropiedad} 
                          onValueChange={(value) => handleInputChange('tipoPropiedad', value)}
                          disabled={!isStep1Complete()}
                        >
                          <SelectTrigger className="border-2 focus:border-blue-500 hover:border-blue-400 transition-colors">
                            <SelectValue placeholder="Selecciona el tipo de propiedad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casa" className="font-medium">🏠 Casa</SelectItem>
                            <SelectItem value="apartamento" className="font-medium">🏢 Apartamento</SelectItem>
                            <SelectItem value="terreno" className="font-medium">🌳 Terreno</SelectItem>
                            <SelectItem value="comercial" className="font-medium">🏪 Comercial</SelectItem>
                          </SelectContent>
                         </Select>
                         
                         {/* Confirmación cuando se complete */}
                         {isStep2Complete() && (
                           <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                             <div className="flex items-center gap-2">
                               <span className="text-green-600">✅</span>
                               <p className="text-green-800 font-medium text-sm">
                                 ¡Perfecto! Ya sabemos que tienes: {propertyData.tipoPropiedad}
                               </p>
                             </div>
                           </div>
                         )}
                         
                         <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                           <p className="text-blue-800 text-xs">
                             🎯 <strong>¿Por qué necesitamos esto?</strong> Una casa vale diferente que un apartamento o un terreno. Esto nos ayuda a comparar tu propiedad con otras del mismo tipo para darte el precio correcto.
                           </p>
                         </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Paso 3: Ubicación */}
                  <TabsContent value="ubicacion" className="mt-6">
                    <Card className="border-2 border-emerald-200 shadow-xl bg-gradient-to-br from-emerald-50/50 to-green-50/50">
                      <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            {isStep3Complete() ? '✓' : '3'}
                          </div>
                          🌍 Paso 4: ¿Dónde está tu casa?
                        </CardTitle>
                      </CardHeader>
                       <CardContent className="p-6">
                         {/* Validación si paso anterior no está completo */}
                         {!isStep2Complete() && (
                           <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-4">
                             <div className="flex items-center gap-2">
                               <span className="text-red-600">🚫</span>
                               <p className="text-red-800 font-medium text-sm">
                                 <strong>Complete primero:</strong> Seleccione el tipo de propiedad en el paso anterior
                               </p>
                             </div>
                           </div>
                         )}
                         
                         <div className="space-y-6">
                          <div>
                            <Label htmlFor="direccion" className="text-base font-semibold mb-2 block">
                              📍 Dirección Completa de la Propiedad
                            </Label>
                            <Input
                              id="direccion"
                              value={propertyData.direccionCompleta}
                              onChange={(e) => handleInputChange('direccionCompleta', e.target.value)}
                              placeholder="Ingrese la dirección completa donde se encuentra la propiedad"
                              className="border-2 focus:border-emerald-500"
                              disabled={!isStep2Complete()}
                            />
                          </div>
                          
                          <div>
                            <Label className="text-base font-semibold mb-3 block">
                              🗺️ Seleccione la ubicación en el mapa
                            </Label>
                            <div className="border-2 border-emerald-200 rounded-lg overflow-hidden shadow-md">
                              <FreeLocationMap 
                                onLocationChange={handleLocationChange}
                                initialLat={propertyData.latitud || 19.4326}
                                initialLng={propertyData.longitud || -99.1332}
                                initialAddress={propertyData.direccionCompleta}
                              />
                            </div>
                           </div>
                         </div>
                         
                         {/* Confirmación cuando se complete */}
                         {isStep3Complete() && (
                           <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                             <div className="flex items-center gap-2">
                               <span className="text-green-600">✅</span>
                               <p className="text-green-800 font-medium text-sm">Ubicación completada</p>
                             </div>
                           </div>
                         )}
                       </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Paso 4: Características */}
                  <TabsContent value="caracteristicas" className="mt-6">
                    <Card className="border-2 border-orange-200 shadow-xl bg-gradient-to-br from-orange-50/50 to-red-50/50">
                      <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            {isStep4Complete() ? '✓' : '4'}
                          </div>
                          📐 Paso 5: ¿Qué tan grande es tu casa?
                        </CardTitle>
                      </CardHeader>
                        <CardContent className="p-6">
                          {/* Validación si paso anterior no está completo */}
                          {!isStep3Complete() && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-red-600">🚫</span>
                                <p className="text-red-800 font-medium text-sm">
                                  <strong>Complete primero:</strong> Ingrese la ubicación de la propiedad en el paso anterior
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <Label htmlFor="areaTerreno" className="text-base font-semibold mb-2 block">
                                🌿 ¿Cuántos metros cuadrados tiene tu terreno? *
                              </Label>
                              <p className="text-xs text-gray-600 mb-2">
                                💡 Esto es todo el espacio de tu lote (incluyendo jardín, patio, etc.)
                              </p>
                             <Input
                               id="areaTerreno"
                               type="number"
                               value={propertyData.area || ''}
                               onChange={(e) => handleInputChange('area', Number(e.target.value))}
                               placeholder="Ej: 200"
                               className="border-2 focus:border-orange-500"
                               min="1"
                               disabled={!isStep3Complete()}
                             />
                           </div>
                           <div>
                              <Label htmlFor="areaConstruccion" className="text-base font-semibold mb-2 block">
                                🏗️ ¿Cuántos metros cuadrados están construidos? *
                              </Label>
                              <p className="text-xs text-gray-600 mb-2">
                                💡 Solo el espacio de la casa (habitaciones, baños, cocina, etc.)
                              </p>
                             <Input
                               id="areaConstruccion"
                               type="number"
                               value={propertyData.construction_area || ''}
                               onChange={(e) => handleInputChange('construction_area', Number(e.target.value))}
                               placeholder="Ej: 120"
                               className="border-2 focus:border-orange-500"
                               min="0"
                               disabled={!isStep3Complete()}
                             />
                            </div>
                          </div>
                           
                           <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                             <p className="text-blue-800 text-xs">
                               🎯 <strong>¿Por qué necesitamos estas medidas?</strong> El tamaño de tu casa es súper importante para calcular su precio. Una casa más grande normalmente vale más dinero. Necesitamos saber tanto el terreno total como lo que está construido para comparar con otras casas similares.
                             </p>
                           </div>
                           
                           {/* Confirmación cuando se complete */}
                           {isStep4Complete() && (
                             <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                               <div className="flex items-center gap-2">
                                 <span className="text-green-600">✅</span>
                                 <p className="text-green-800 font-medium text-sm">
                                   ¡Perfecto! Tu casa tiene: {propertyData.area} m² de terreno
                                 </p>
                               </div>
                             </div>
                           )}
                        </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Paso 5: Depreciación */}
                   <TabsContent value="depreciacion" className="mt-6">
                     {/* Validación si paso anterior no está completo */}
                     {!isStep4Complete() && (
                       <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-4">
                         <div className="flex items-center gap-2">
                           <span className="text-red-600">🚫</span>
                           <p className="text-red-800 font-medium text-sm">
                             <strong>Complete primero:</strong> Ingrese las características de la propiedad en el paso anterior
                           </p>
                         </div>
                       </div>
                     )}
                     
                     {/* Panel de confirmación de selección - MOVIDO ARRIBA */}
                     {propertyData.estadoConservacion && (
                       <div className="mb-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                         <div className="flex items-center gap-2">
                           <span className="text-green-600">✅</span>
                           <p className="text-green-800 font-medium text-sm">
                             Depreciación completada: {propertyData.estadoConservacion}
                           </p>
                         </div>
                       </div>
                    )}
                    
                    <Card className="border-2 border-indigo-200 shadow-xl bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
                      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            📉
                          </div>
                          📉 Depreciación - Estado de Conservación
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="bg-white rounded-lg p-6 border-2 border-indigo-200 shadow-lg">
                          <h3 className="text-xl font-bold text-center text-indigo-800 mb-6">ESTADO CONSERVACIÓN</h3>
                          
                          <div className="overflow-hidden rounded-lg border-2 border-indigo-300">
                            <table className="w-full">
                              <thead className="bg-indigo-100">
                                <tr>
                                  <th className="px-6 py-4 text-center font-bold text-indigo-800 text-lg">ESTADO</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-indigo-200">
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 relative group ${
                                    propertyData.estadoConservacion === 'NUEVO' 
                                      ? 'bg-green-100 border-l-4 border-green-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    console.log('Clicking NUEVO');
                                    handleInputChange('estadoConservacion', 'NUEVO');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center relative ${
                                    propertyData.estadoConservacion === 'NUEVO' ? 'font-bold text-green-800' : 'text-gray-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'NUEVO' ? '✅ NUEVO' : 'NUEVO'}
                                    
                                    {/* Tooltip explicativo */}
                                    <div className="absolute left-full top-0 ml-4 w-80 bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <h5 className="font-bold text-indigo-800 mb-2">🏠 NUEVO</h5>
                                      <p className="text-sm text-indigo-700 mb-2">
                                        {conservationExplanations['NUEVO'].description}
                                      </p>
                                      <div className="text-xs text-indigo-600">
                                        <strong>Factor:</strong> {conservationFactors['NUEVO']?.toFixed(4)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 relative group ${
                                    propertyData.estadoConservacion === 'BUENO' 
                                      ? 'bg-green-100 border-l-4 border-green-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    console.log('Clicking BUENO');
                                    handleInputChange('estadoConservacion', 'BUENO');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center relative ${
                                    propertyData.estadoConservacion === 'BUENO' ? 'font-bold text-green-800' : 'text-gray-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'BUENO' ? '✅ BUENO' : 'BUENO'}
                                    
                                    {/* Tooltip explicativo */}
                                    <div className="absolute left-full top-0 ml-4 w-80 bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <h5 className="font-bold text-indigo-800 mb-2">🏠 BUENO</h5>
                                      <p className="text-sm text-indigo-700 mb-2">
                                        {conservationExplanations['BUENO'].description}
                                      </p>
                                      <div className="text-xs text-indigo-600">
                                        <strong>Factor:</strong> {conservationFactors['BUENO']?.toFixed(4)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 relative group ${
                                    propertyData.estadoConservacion === 'MEDIO' 
                                      ? 'bg-blue-100 border-l-4 border-blue-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    console.log('Clicking MEDIO');
                                    handleInputChange('estadoConservacion', 'MEDIO');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center relative ${
                                    propertyData.estadoConservacion === 'MEDIO' ? 'font-bold text-blue-800' : 'text-gray-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'MEDIO' ? '✅ MEDIO' : 'MEDIO'}
                                    
                                    {/* Tooltip explicativo */}
                                    <div className="absolute left-full top-0 ml-4 w-80 bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <h5 className="font-bold text-indigo-800 mb-2">🏠 MEDIO</h5>
                                      <p className="text-sm text-indigo-700 mb-2">
                                        {conservationExplanations['MEDIO'].description}
                                      </p>
                                      <div className="text-xs text-indigo-600">
                                        <strong>Factor:</strong> {conservationFactors['MEDIO']?.toFixed(4)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 relative group ${
                                    propertyData.estadoConservacion === 'REGULAR' 
                                      ? 'bg-yellow-100 border-l-4 border-yellow-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'REGULAR');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center relative ${
                                    propertyData.estadoConservacion === 'REGULAR' ? 'font-bold text-yellow-800' : 'text-gray-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'REGULAR' ? '✅ REGULAR' : 'REGULAR'}
                                    
                                    {/* Tooltip explicativo */}
                                    <div className="absolute left-full top-0 ml-4 w-80 bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <h5 className="font-bold text-indigo-800 mb-2">🏠 REGULAR</h5>
                                      <p className="text-sm text-indigo-700 mb-2">
                                        {conservationExplanations['REGULAR'].description}
                                      </p>
                                      <div className="text-xs text-indigo-600">
                                        <strong>Factor:</strong> {conservationFactors['REGULAR']?.toFixed(4)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 relative group ${
                                    propertyData.estadoConservacion === 'REPARACIONES SENCILLAS' 
                                      ? 'bg-blue-100 border-l-4 border-blue-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'REPARACIONES SENCILLAS');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center relative ${
                                    propertyData.estadoConservacion === 'REPARACIONES SENCILLAS' ? 'font-bold text-blue-800' : 'text-gray-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'REPARACIONES SENCILLAS' ? '✅ REPARACIONES SENCILLAS' : 'REPARACIONES SENCILLAS'}
                                    
                                    {/* Tooltip explicativo */}
                                    <div className="absolute left-full top-0 ml-4 w-80 bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <h5 className="font-bold text-indigo-800 mb-2">🔧 REPARACIONES SENCILLAS</h5>
                                      <p className="text-sm text-indigo-700 mb-2">
                                        {conservationExplanations['REPARACIONES SENCILLAS'].description}
                                      </p>
                                      <div className="text-xs text-indigo-600">
                                        <strong>Factor:</strong> {conservationFactors['REPARACIONES SENCILLAS']?.toFixed(4)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 relative group ${
                                    propertyData.estadoConservacion === 'REPARACIONES MEDIAS' 
                                      ? 'bg-blue-100 border-l-4 border-blue-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'REPARACIONES MEDIAS');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center relative ${
                                    propertyData.estadoConservacion === 'REPARACIONES MEDIAS' ? 'font-bold text-blue-800' : 'text-gray-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'REPARACIONES MEDIAS' ? '✅ REPARACIONES MEDIAS' : 'REPARACIONES MEDIAS'}
                                    
                                    {/* Tooltip explicativo */}
                                    <div className="absolute left-full top-0 ml-4 w-80 bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <h5 className="font-bold text-indigo-800 mb-2">🔨 REPARACIONES MEDIAS</h5>
                                      <p className="text-sm text-indigo-700 mb-2">
                                        {conservationExplanations['REPARACIONES MEDIAS'].description}
                                      </p>
                                      <div className="text-xs text-indigo-600">
                                        <strong>Factor:</strong> {conservationFactors['REPARACIONES MEDIAS']?.toFixed(4)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 relative group ${
                                    propertyData.estadoConservacion === 'REPARACIONES IMPORTANTES' 
                                      ? 'bg-orange-100 border-l-4 border-orange-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                   onClick={() => {
                                     handleInputChange('estadoConservacion', 'REPARACIONES IMPORTANTES');
                                   }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center relative ${
                                    propertyData.estadoConservacion === 'REPARACIONES IMPORTANTES' ? 'font-bold text-orange-800' : 'text-gray-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'REPARACIONES IMPORTANTES' ? '✅ REPARACIONES IMPORTANTES' : 'REPARACIONES IMPORTANTES'}
                                    
                                    {/* Tooltip explicativo */}
                                    <div className="absolute left-full top-0 ml-4 w-80 bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <h5 className="font-bold text-indigo-800 mb-2">⚠️ REPARACIONES IMPORTANTES</h5>
                                      <p className="text-sm text-indigo-700 mb-2">
                                        {conservationExplanations['REPARACIONES IMPORTANTES'].description}
                                      </p>
                                      <div className="text-xs text-indigo-600">
                                        <strong>Factor:</strong> {conservationFactors['REPARACIONES IMPORTANTES']?.toFixed(4)}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 relative group ${
                                    propertyData.estadoConservacion === 'DAÑOS GRAVES' 
                                      ? 'bg-red-100 border-l-4 border-red-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                   onClick={() => {
                                     handleInputChange('estadoConservacion', 'DAÑOS GRAVES');
                                   }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center relative ${
                                    propertyData.estadoConservacion === 'DAÑOS GRAVES' ? 'font-bold text-red-800' : 'text-gray-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'DAÑOS GRAVES' ? '✅ DAÑOS GRAVES' : 'DAÑOS GRAVES'}
                                    
                                    {/* Tooltip explicativo */}
                                    <div className="absolute left-full top-0 ml-4 w-80 bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                      <h5 className="font-bold text-indigo-800 mb-2">🚨 DAÑOS GRAVES</h5>
                                      <p className="text-sm text-indigo-700 mb-2">
                                        {conservationExplanations['DAÑOS GRAVES'].description}
                                      </p>
                                      <div className="text-xs text-indigo-600">
                                        <strong>Factor:</strong> {conservationFactors['DAÑOS GRAVES']?.toFixed(4)}
                                      </div>
                                    </div>
                                  </td>
                                 </tr>
                               </tbody>
                             </table>
                          </div>
                          
                          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300 shadow-md">
                             <p className="text-yellow-800 text-center font-semibold">
                               💡 <strong>Instrucciones:</strong> Pase el mouse sobre cualquier estado para ver su explicación antes de seleccionarlo.
                             </p>
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Paso 6: Valuación */}
                  <TabsContent value="valuacion" className="mt-6">
                    <Card className="border-2 border-pink-200 shadow-xl bg-gradient-to-br from-pink-50/50 to-rose-50/50">
                      <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            📊
                          </div>
                          💎 Paso 6: ¡Calcular el precio de tu casa!
                        </CardTitle>
                      </CardHeader>
                       <CardContent className="p-6">
                         {/* Validación si no todos los pasos están completos */}
                         {getNextRequiredStep() !== 'valuacion' && (
                           <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-4">
                             <div className="flex items-center gap-2">
                               <span className="text-red-600">🚫</span>
                               <div>
                                 <p className="text-red-800 font-medium text-sm mb-2">
                                   <strong>Complete todos los pasos anteriores:</strong>
                                 </p>
                                 <ul className="text-red-700 text-xs space-y-1">
                                   {!isStep0Complete() && <li>• Configuración (idioma y país)</li>}
                                   {!isStep1Complete() && <li>• Estrato social</li>}
                                   {!isStep2Complete() && <li>• Tipo de propiedad</li>}
                                   {!isStep3Complete() && <li>• Ubicación</li>}
                                   {!isStep4Complete() && <li>• Características (área)</li>}
                                   {!isStep5Complete() && <li>• Depreciación (estado de conservación)</li>}
                                 </ul>
                               </div>
                             </div>
                           </div>
                         )}
                         
                         <div className="text-center py-6">
                           <div className="mb-4">
                             <Calculator className="w-16 h-16 text-pink-500 mx-auto" />
                           </div>
                           <h3 className="text-xl font-bold mb-4">
                             {getNextRequiredStep() === 'valuacion' ? '🎉 ¡Listo para la valuación!' : '⏳ Complete todos los pasos'}
                           </h3>
                          <Button
                            onClick={performValuation}
                            disabled={isCalculating}
                            size="lg"
                            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            {isCalculating ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Calculando...
                              </>
                            ) : (
                              <>
                                <Calculator className="w-5 h-5 mr-2" />
                                💎 Realizar Valuación
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                </Tabs>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Tutorial paso a paso */}
      <ValuationWalkthrough
        isOpen={showWalkthrough}
        onClose={() => {
          setShowWalkthrough(false);
          setHighlightedElement(null);
        }}
        onStepChange={handleWalkthroughStep}
      />
    </div>
  );
};

export default PropertyValuation;
