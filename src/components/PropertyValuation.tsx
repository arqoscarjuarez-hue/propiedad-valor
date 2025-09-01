import React, { useState, useEffect } from 'react';
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
  estratoSocial: EstratoSocial | '';
  clasePrincipal: ClasePrincipal | '';
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
  estrato_social: any;
}

// Tipos de estrato social - normas internacionales de Latinoamérica
export type EstratoSocial = 
  | 'bajo_bajo' | 'bajo_medio' | 'bajo_alto'
  | 'medio_bajo' | 'medio_medio' | 'medio_alto' 
  | 'alto_bajo' | 'alto_medio' | 'alto_alto';

// Clases principales para primer nivel de selección
export type ClasePrincipal = 'bajo' | 'medio' | 'alto';

// Etiquetas para estratos sociales completos
export const estratoSocialLabels: Record<EstratoSocial, string> = {
  // Estrato Bajo
  'bajo_bajo': 'Estrato Bajo Bajo - Barrios marginales con servicios limitados',
  'bajo_medio': 'Estrato Bajo Medio - Barrios populares con servicios básicos',
  'bajo_alto': 'Estrato Bajo Alto - Barrios obreros con servicios mejorados',
  
  // Estrato Medio
  'medio_bajo': 'Estrato Medio Bajo - Barrios residenciales con buenos servicios',
  'medio_medio': 'Estrato Medio Medio - Barrios de estrato medio consolidado',
  'medio_alto': 'Estrato Medio Alto - Barrios residenciales premium',
  
  // Estrato Alto
  'alto_bajo': 'Estrato Alto Bajo - Barrios exclusivos entrada',
  'alto_medio': 'Estrato Alto Medio - Barrios exclusivos con servicios de lujo',
  'alto_alto': 'Estrato Alto Alto - Barrios de élite con servicios premium'
};

// Etiquetas para estratos principales
export const clasePrincipalLabels: Record<ClasePrincipal, string> = {
  'bajo': 'Estrato Socioeconómico Bajo',
  'medio': 'Estrato Socioeconómico Medio', 
  'alto': 'Estrato Socioeconómico Alto'
};

// Factores de valuación por estrato social - Alto-Bajo como base (0%)
export const estratoValuationFactors: Record<EstratoSocial, number> = {
  // Estratos Bajos (factores negativos)
  'bajo_bajo': -0.40,    // -40%
  'bajo_medio': -0.30,   // -30%
  'bajo_alto': -0.20,    // -20%
  
  // Estratos Medios (factores negativos a neutros)
  'medio_bajo': -0.15,   // -15%
  'medio_medio': -0.10,  // -10%
  'medio_alto': -0.05,   // -5%
  
  // Estratos Altos (base y factores positivos)
  'alto_bajo': 0.00,     // 0% (BASE)
  'alto_medio': 0.05,    // +5%
  'alto_alto': 0.07      // +7%
};

// Labels para mostrar los factores de valuación
export const estratoValuationLabels: Record<EstratoSocial, string> = {
  'bajo_bajo': '-40%',
  'bajo_medio': '-30%',
  'bajo_alto': '-20%',
  'medio_bajo': '-15%',
  'medio_medio': '-10%',
  'medio_alto': '-5%',
  'alto_bajo': '0% (BASE)',
  'alto_medio': '+5%',
  'alto_alto': '+7%'
};

// Mapeo de estratos a clases sociales principales
export const estratoToClassMap: Record<EstratoSocial, ClasePrincipal> = {
  'bajo_bajo': 'bajo',
  'bajo_medio': 'bajo',
  'bajo_alto': 'bajo',
  'medio_bajo': 'medio',
  'medio_medio': 'medio',
  'medio_alto': 'medio',
  'alto_bajo': 'alto',
  'alto_medio': 'alto',
  'alto_alto': 'alto'
};

// Mapeo de clases principales a estratos específicos
export const clasePrincipalToEstratos: Record<ClasePrincipal, EstratoSocial[]> = {
  'bajo': ['bajo_bajo', 'bajo_medio', 'bajo_alto'],
  'medio': ['medio_bajo', 'medio_medio', 'medio_alto'],
  'alto': ['alto_bajo', 'alto_medio', 'alto_alto']
};

// Multiplicadores de valor según estrato social - normas internacionales
export const estratoMultipliers: Record<EstratoSocial, number> = {
  // Estrato Bajo (0.7-0.9)
  'bajo_bajo': 0.7,
  'bajo_medio': 0.8,
  'bajo_alto': 0.9,
  
  // Estrato Medio (1.0-1.3)
  'medio_bajo': 1.0,
  'medio_medio': 1.15,
  'medio_alto': 1.3,
  
  // Estrato Alto (1.4-1.8)
  'alto_bajo': 1.4,
  'alto_medio': 1.6,
  'alto_alto': 1.8
};

// Factores de depreciación por estado de conservación
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

// Explicaciones detalladas para cada estado
const conservationExplanations: Record<string, any> = {
  'NUEVO': {
    description: 'Casa recién construida o como nueva. Acabados perfectos, sin desgaste visible.',
    examples: ['Menos de 2 años de construcción', 'Pintura fresca', 'Instalaciones nuevas']
  },
  'BUENO': {
    description: 'Casa en excelente estado con mantenimiento regular. Mínimo desgaste.',
    examples: ['Pintura en buen estado', 'Pisos sin daños', 'Instalaciones funcionando']
  },
  'MEDIO': {
    description: 'Casa con desgaste normal por el uso pero bien mantenida.',
    examples: ['Pintura con pequeñas marcas', 'Pisos con uso normal', 'Todo funciona bien']
  },
  'REGULAR': {
    description: 'Casa que necesita mantenimiento básico pero es habitable.',
    examples: ['Necesita pintura', 'Algunos desperfectos menores', 'Reparaciones pequeñas']
  },
  'REPARACIONES SENCILLAS': {
    description: 'Casa que necesita reparaciones menores para estar en buen estado.',
    examples: ['Pintura completa', 'Arreglos de plomería menores', 'Cambio de llaves']
  },
  'REPARACIONES MEDIAS': {
    description: 'Casa que requiere inversión moderada en reparaciones.',
    examples: ['Cambio de pisos', 'Reparación de techos', 'Actualización eléctrica']
  },
  'REPARACIONES IMPORTANTES': {
    description: 'Casa que necesita inversión considerable en reparaciones.',
    examples: ['Reparación estructural menor', 'Cambio de instalaciones', 'Remodelación parcial']
  },
  'DAÑOS GRAVES': {
    description: 'Casa con problemas serios que requieren reparación inmediata.',
    examples: ['Problemas estructurales', 'Daños por agua', 'Sistemas no funcionan']
  },
  'EN DESECHO': {
    description: 'Casa que requiere demolición o reconstrucción completa.',
    examples: ['Estructura comprometida', 'Inhabitable', 'Solo vale el terreno']
  }
};

// Mapeo de códigos de país ISO a nuestras claves internas
const countryCodeToKey: Record<string, string> = {
  'US': 'usa',
  'CA': 'canada', 
  'MX': 'mexico',
  'GT': 'guatemala',
  'BZ': 'belize',
  'HN': 'honduras',
  'SV': 'salvador',
  'NI': 'nicaragua',
  'CR': 'costarica',
  'PA': 'panama',
  'CO': 'colombia',
  'VE': 'venezuela',
  'BR': 'brazil',
  'EC': 'ecuador',
  'PE': 'peru',
  'CL': 'chile',
  'AR': 'argentina'
};

// Configuración completa de países del mundo con factores económicos
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
  'venezuela': { 
    name: 'Venezuela', 
    currency: 'VES', 
    symbol: 'Bs.', 
    flag: '🇻🇪',
    basePricePerM2USD: 300,
    economicFactor: 0.4,
    exchangeRate: 4500000.0
  },
  'brazil': { 
    name: 'Brasil', 
    currency: 'BRL', 
    symbol: 'R$', 
    flag: '🇧🇷',
    basePricePerM2USD: 1100,
    economicFactor: 1.4,
    exchangeRate: 5.2
  },
  'ecuador': { 
    name: 'Ecuador', 
    currency: 'USD', 
    symbol: '$', 
    flag: '🇪🇨',
    basePricePerM2USD: 650,
    economicFactor: 0.8,
    exchangeRate: 1.0
  },
  'peru': { 
    name: 'Perú', 
    currency: 'PEN', 
    symbol: 'S/', 
    flag: '🇵🇪',
    basePricePerM2USD: 800,
    economicFactor: 1.0,
    exchangeRate: 3.7
  },
  'chile': { 
    name: 'Chile', 
    currency: 'CLP', 
    symbol: '$', 
    flag: '🇨🇱',
    basePricePerM2USD: 1400,
    economicFactor: 1.8,
    exchangeRate: 950.0
  },
  'argentina': { 
    name: 'Argentina', 
    currency: 'ARS', 
    symbol: '$', 
    flag: '🇦🇷',
    basePricePerM2USD: 1000,
    economicFactor: 1.2,
    exchangeRate: 350.0
  }
};

const PropertyValuation = () => {
  console.log('PropertyValuation component is loading...');
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
    estratoSocial: '',
    clasePrincipal: ''
  });

  // Estados para idioma y moneda con valores por defecto
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedCountry, setSelectedCountry] = useState('salvador');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  
  // Estados adicionales
  const [selectedMainStrata, setSelectedMainStrata] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  // Función para detectar país automáticamente para nuevos usuarios
  const detectUserCountry = async () => {
    // Verificar si es un nuevo usuario (país por defecto)
    if (selectedCountry !== 'salvador') {
      return; // Ya tienen un país seleccionado
    }

    setIsDetectingLocation(true);

    try {
      // Intentar obtener ubicación del usuario
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocalización no soportada'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutos
          }
        );
      });

      const { latitude, longitude } = position.coords;

      // Usar geocodificación inversa para obtener el país
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=es`
      );
      
      const data = await response.json();
      
      if (data && data.address && data.address.country_code) {
        const countryCode = data.address.country_code.toUpperCase();
        const countryKey = countryCodeToKey[countryCode];
        
        if (countryKey && countriesConfig[countryKey as keyof typeof countriesConfig]) {
          // Actualizar país y moneda detectados
          setSelectedCountry(countryKey);
          setSelectedCurrency(countriesConfig[countryKey as keyof typeof countriesConfig].currency);
          
          toast(
            `¡País detectado automáticamente! Se detectó que estás en ${countriesConfig[countryKey as keyof typeof countriesConfig].name}`
          );
        }
      }
    } catch (error) {
      console.log('No se pudo detectar el país automáticamente:', error);
      // No mostrar error al usuario, simplemente mantener el país por defecto
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Detectar país automáticamente al cargar el componente
  useEffect(() => {
    detectUserCountry();
  }, []);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  // Funciones de validación de pasos
  const isStep0Complete = () => selectedLanguage && selectedCountry;
  const isStep1Complete = () => propertyData.latitud && propertyData.longitud && propertyData.direccionCompleta;
  const isStep2Complete = () => propertyData.estratoSocial;
  const isStep3Complete = () => propertyData.area > 0;
  const isStep4Complete = () => propertyData.tipoPropiedad;
  const isStep5Complete = () => propertyData.estadoConservacion;

  const handleInputChange = (field: keyof PropertyData, value: any) => {
    console.log(`✅ CAMPO ACTUALIZADO: ${field} = ${value}`);
    setPropertyData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📊 DATOS COMPLETOS:', updated);
      return updated;
    });
  };

  // Función de avalúo internacional completa
  const performValuation = async () => {
    setIsCalculating(true);
    try {
      console.log('🔥 INICIANDO AVALÚO INTERNACIONAL...');
      
      // Validar datos requeridos
      if (!propertyData.area || !propertyData.tipoPropiedad || !propertyData.estratoSocial) {
        toast('❌ Faltan datos requeridos para el avalúo');
        return;
      }

      // Obtener configuración del país
      const countryConfig = countriesConfig[selectedCountry as keyof typeof countriesConfig];
      if (!countryConfig) {
        toast('❌ País no configurado');
        return;
      }

      // 1. Precio base por país
      const basePricePerM2 = countryConfig.basePricePerM2USD || 1000;
      
      // 2. Factor de conservación
      const conservationMultiplier = conservationFactors[propertyData.estadoConservacion] || 0.9;
      
      // 3. Factor económico del país
      const economicMultiplier = countryConfig.economicFactor || 1;

      // 4. Cálculo del precio base sin estrato (método comparativo base)
      const baseValue = propertyData.area * basePricePerM2;
      
      // 5. Aplicar multiplicadores base (sin estrato)
      const comparativeValue = baseValue * conservationMultiplier * economicMultiplier;

      console.log('📊 MÉTODO COMPARATIVO BASE:', {
        area: propertyData.area,
        basePricePerM2,
        conservationMultiplier,
        economicMultiplier,
        baseValue,
        comparativeValue
      });

      // 6. Buscar comparables basados en el estrato social seleccionado
      let comparablesData: any[] = [];
      try {
        if (propertyData.latitud && propertyData.longitud && propertyData.estratoSocial) {
          // Usar la función de comparables con filtro por estrato social y ubicación
          const { data } = await supabase
            .rpc('find_comparables_progressive_radius', {
              target_lat: propertyData.latitud,
              target_lng: propertyData.longitud,
              target_estrato: propertyData.estratoSocial,
              target_property_type: propertyData.tipoPropiedad
            });

          comparablesData = data || [];
          
          if (comparablesData && comparablesData.length > 0) {
            console.log(`✅ Encontrados ${comparablesData.length} comparables para estrato ${propertyData.estratoSocial}`);
          } else {
            console.log(`⚠️ No se encontraron comparables para el estrato ${propertyData.estratoSocial} en la zona`);
          }
        } else if (propertyData.estratoSocial) {
          // Fallback: búsqueda básica por estrato social sin ubicación específica
          const { data } = await supabase
            .from('property_comparables')
            .select('*')
            .eq('property_type', propertyData.tipoPropiedad)
            .eq('estrato_social', propertyData.estratoSocial)
            .gte('total_area', propertyData.area * 0.8)
            .lte('total_area', propertyData.area * 1.2)
            .limit(5);

          comparablesData = data || [];
          console.log(`✅ Búsqueda básica: encontrados ${comparablesData?.length || 0} comparables para estrato ${propertyData.estratoSocial}`);
        } else {
          console.log('⚠️ No se puede buscar comparables: falta seleccionar el estrato social');
        }
      } catch (error) {
        console.log('⚠️ Error al buscar comparables:', error);
      }

      setComparables(comparablesData);

      // 7. SEGUNDO AJUSTE: Aplicar factor de estrato social después del método comparativo
      const estratoAdjustmentFactor = 1 + (estratoValuationFactors[propertyData.estratoSocial as EstratoSocial] || 0);
      const finalValueWithEstratoAdjustment = comparativeValue * estratoAdjustmentFactor;
      
      // 8. Convertir a moneda local
      const valueInLocalCurrency = finalValueWithEstratoAdjustment * (countryConfig.exchangeRate || 1);

      console.log('📊 CÁLCULO COMPLETO CON SEGUNDO AJUSTE:', {
        comparativeValue,
        estratoSelected: propertyData.estratoSocial,
        estratoAdjustmentFactor,
        estratoPercentage: (estratoValuationFactors[propertyData.estratoSocial as EstratoSocial] * 100).toFixed(1) + '%',
        finalValueWithEstratoAdjustment,
        valueInLocalCurrency
      });

      // 9. Resultado final
      const result = {
        estimatedValueUSD: finalValueWithEstratoAdjustment,
        estimatedValueLocal: valueInLocalCurrency,
        comparativeValueUSD: comparativeValue, // Valor del método comparativo antes del ajuste
        currency: countryConfig.currency,
        symbol: countryConfig.symbol,
        country: countryConfig.name,
        propertyType: propertyData.tipoPropiedad,
        area: propertyData.area,
        estrato: estratoSocialLabels[propertyData.estratoSocial as EstratoSocial],
        conservation: propertyData.estadoConservacion,
        factors: {
          basePricePerM2,
          conservationMultiplier,
          economicMultiplier,
          estratoAdjustmentFactor,
          estratoPercentage: estratoValuationLabels[propertyData.estratoSocial as EstratoSocial]
        }
      };

      setValuationResult(result);
      toast('🎉 ¡Valuación completada exitosamente!');
      
    } catch (error) {
      console.error('❌ Error en valuación:', error);
      toast('❌ Error al calcular la valuación');
    } finally {
      setIsCalculating(false);
    }
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
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWalkthrough(true)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Ayuda
                  </Button>
                  <div className="text-sm bg-white/20 px-3 py-1 rounded-lg">
                    {countriesConfig[selectedCountry as keyof typeof countriesConfig]?.flag} {selectedLanguage.toUpperCase()}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="mb-6">
                <p className="text-muted-foreground text-center">
                  🎯 <strong>¡Bienvenido!</strong> Este formulario es súper fácil de usar.
                  Te vamos a ayudar a saber cuánto vale tu casa paso a paso.
                </p>
              </div>

              <Tabs defaultValue="setup" className="w-full">
                <TabsList className="grid w-full grid-cols-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <TabsTrigger 
                    value="setup" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-slate-700 dark:text-slate-300"
                  >
                    {isStep0Complete() ? '✅' : '1️⃣'} Inicio
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tipo" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-slate-700 dark:text-slate-300"
                  >
                    {isStep4Complete() ? '✅' : '2️⃣'} Tipo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ubicacion" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-slate-700 dark:text-slate-300"
                  >
                    {isStep1Complete() ? '✅' : '3️⃣'} Ubicación
                  </TabsTrigger>
                  <TabsTrigger 
                    value="estrato" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-slate-700 dark:text-slate-300"
                  >
                    {isStep2Complete() ? '✅' : '4️⃣'} Estrato
                  </TabsTrigger>
                  <TabsTrigger 
                    value="caracteristicas" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-slate-700 dark:text-slate-300"
                  >
                    {isStep3Complete() ? '✅' : '5️⃣'} Área
                  </TabsTrigger>
                  <TabsTrigger 
                    value="valuacion" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-slate-700 dark:text-slate-300"
                  >
                    {isStep5Complete() ? '✅' : '6️⃣'} Resultado
                  </TabsTrigger>
                </TabsList>

                {/* Paso 1: Configuración */}
                <TabsContent value="setup" className="mt-6">
                  <Card className="border-2 border-purple-200 shadow-xl bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep0Complete() ? '✓' : '1'}
                        </div>
                        🌍 Paso 1: ¿De dónde eres?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>🌟 ¡Hola! Empezamos aquí</strong><br />
                          Primero necesitamos saber en qué país está tu casa para usar la moneda correcta y hacer el cálculo perfecto.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-base font-semibold mb-3 block">
                            🌍 ¿En qué país está tu casa? *
                            {isDetectingLocation && (
                              <span className="ml-2 text-sm text-blue-600 font-normal">
                                <div className="inline-flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                  Detectando ubicación...
                                </div>
                              </span>
                            )}
                          </Label>
                          <Select 
                            value={selectedCountry} 
                            onValueChange={(value) => {
                              setSelectedCountry(value);
                              setSelectedCurrency(countriesConfig[value as keyof typeof countriesConfig]?.currency || 'USD');
                            }}
                            disabled={isDetectingLocation}
                          >
                            <SelectTrigger className="border-2 focus:border-purple-500 hover:border-purple-400 transition-colors h-12">
                              <SelectValue placeholder="Elige el país donde está tu casa" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 z-50 max-h-60 overflow-y-auto">
                              <div className="px-3 py-2 text-sm font-medium text-muted-foreground">América del Norte</div>
                              <SelectItem value="usa">{countriesConfig.usa.flag} {countriesConfig.usa.name}</SelectItem>
                              <SelectItem value="canada">{countriesConfig.canada.flag} {countriesConfig.canada.name}</SelectItem>
                              <SelectItem value="mexico">{countriesConfig.mexico.flag} {countriesConfig.mexico.name}</SelectItem>
                              
                              <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-t mt-2 pt-2">América Central</div>
                              <SelectItem value="guatemala">{countriesConfig.guatemala.flag} {countriesConfig.guatemala.name}</SelectItem>
                              <SelectItem value="belize">{countriesConfig.belize.flag} {countriesConfig.belize.name}</SelectItem>
                              <SelectItem value="salvador">{countriesConfig.salvador.flag} {countriesConfig.salvador.name}</SelectItem>
                              <SelectItem value="honduras">{countriesConfig.honduras.flag} {countriesConfig.honduras.name}</SelectItem>
                              <SelectItem value="nicaragua">{countriesConfig.nicaragua.flag} {countriesConfig.nicaragua.name}</SelectItem>
                              <SelectItem value="costarica">{countriesConfig.costarica.flag} {countriesConfig.costarica.name}</SelectItem>
                              <SelectItem value="panama">{countriesConfig.panama.flag} {countriesConfig.panama.name}</SelectItem>
                              
                              <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-t mt-2 pt-2">América del Sur</div>
                              <SelectItem value="colombia">{countriesConfig.colombia.flag} {countriesConfig.colombia.name}</SelectItem>
                              <SelectItem value="venezuela">{countriesConfig.venezuela.flag} {countriesConfig.venezuela.name}</SelectItem>
                              <SelectItem value="brazil">{countriesConfig.brazil.flag} {countriesConfig.brazil.name}</SelectItem>
                              <SelectItem value="ecuador">{countriesConfig.ecuador.flag} {countriesConfig.ecuador.name}</SelectItem>
                              <SelectItem value="peru">{countriesConfig.peru.flag} {countriesConfig.peru.name}</SelectItem>
                              <SelectItem value="chile">{countriesConfig.chile.flag} {countriesConfig.chile.name}</SelectItem>
                              <SelectItem value="argentina">{countriesConfig.argentina.flag} {countriesConfig.argentina.name}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Mostrar moneda seleccionada */}
                        {selectedCountry && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 font-semibold text-sm">
                              ✅ País: {countriesConfig[selectedCountry as keyof typeof countriesConfig]?.name}
                            </p>
                            <p className="text-green-700 text-sm">
                              Moneda: {countriesConfig[selectedCountry as keyof typeof countriesConfig]?.currency} ({countriesConfig[selectedCountry as keyof typeof countriesConfig]?.symbol})
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirmación cuando se complete */}
                      {isStep0Complete() && (
                        <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✅</span>
                            <p className="text-green-800 font-medium text-sm">¡Perfecto! Ya configuramos tu país</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 2: Estrato Social */}
                <TabsContent value="estrato" className="mt-6">
                  <Card className="border-2 border-violet-200 shadow-xl bg-gradient-to-br from-violet-50/50 to-purple-50/50">
                    <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep1Complete() ? '✓' : '2'}
                        </div>
                        🏘️ Paso 2: Estrato Socioeconómico del Inmueble a Valuar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>🏘️ ¿Cuál es el estrato socioeconómico del barrio, colonia o residencial?</strong><br />
                          Según las normas internacionales de Latinoamérica, clasifica el barrio, colonia o residencial donde está ubicada tu propiedad. 
                          <strong>Esta selección es crucial para encontrar comparables exactos del mismo estrato social.</strong>
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* SELECCIÓN DE ESTRATO SOCIOECONÓMICO */}
                        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                          <h3 className="font-semibold mb-2">🏘️ Estrato Socioeconómico</h3>
                          <p className="text-sm text-violet-800 dark:text-violet-200 mb-4">
                            Selecciona el estrato socioeconómico del barrio, colonia o residencial:
                          </p>
                          <Select 
                            value={propertyData.estratoSocial} 
                            onValueChange={(value) => {
                              handleInputChange('estratoSocial', value);
                              // Auto-set clasePrincipal based on estrato selection
                              const clasePrincipal = estratoToClassMap[value as EstratoSocial];
                              handleInputChange('clasePrincipal', clasePrincipal);
                            }}
                          >
                            <SelectTrigger className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                              <SelectValue placeholder="Selecciona el estrato socioeconómico" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50">
                              <SelectItem value="bajo_bajo">🏘️ Bajo-Bajo - Barrios marginales con servicios limitados</SelectItem>
                              <SelectItem value="bajo_medio">🏘️ Bajo-Medio - Barrios populares con servicios básicos</SelectItem>
                              <SelectItem value="bajo_alto">🏘️ Bajo-Alto - Barrios obreros con servicios mejorados</SelectItem>
                              <SelectItem value="medio_bajo">🏡 Medio-Bajo - Barrios residenciales con buenos servicios</SelectItem>
                              <SelectItem value="medio_medio">🏡 Medio-Medio - Barrios de estrato medio consolidado</SelectItem>
                              <SelectItem value="medio_alto">🏡 Medio-Alto - Barrios residenciales premium</SelectItem>
                              <SelectItem value="alto_bajo">🏰 Alto-Bajo - Barrios exclusivos entrada</SelectItem>
                              <SelectItem value="alto_medio">🏰 Alto-Medio - Barrios exclusivos con servicios de lujo</SelectItem>
                              <SelectItem value="alto_alto">🏰 Alto-Alto - Barrios de élite con servicios premium</SelectItem>
                            </SelectContent>
                          </Select>

                          {propertyData.estratoSocial && (
                            <div className="mt-3 space-y-3">
                              <div className="p-2 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-600 rounded">
                                <p className="text-sm text-green-800 dark:text-green-200">
                                  <strong>✅ Estrato seleccionado:</strong> {estratoSocialLabels[propertyData.estratoSocial as EstratoSocial]}
                                </p>
                                <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                                  <strong>📈 Factor de valuación:</strong> {estratoValuationLabels[propertyData.estratoSocial as EstratoSocial]}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Tabla de Factores de Valuación */}
                          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
                              📊 Tabla de Factores de Valuación por Estrato
                            </h4>
                            <div className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                              Los factores afectan directamente el precio de valuación. <strong>Alto-Bajo</strong> es la base (0%).
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {/* Header */}
                              <div className="font-semibold text-amber-800 dark:text-amber-200 border-b border-amber-300 pb-1">Estrato</div>
                              <div className="font-semibold text-amber-800 dark:text-amber-200 border-b border-amber-300 pb-1">Factor</div>
                              <div className="font-semibold text-amber-800 dark:text-amber-200 border-b border-amber-300 pb-1">Impacto</div>
                              
                              {/* Datos */}
                              {(Object.entries(estratoSocialLabels) as [EstratoSocial, string][]).map(([estrato, label]) => (
                                <React.Fragment key={estrato}>
                                  <div className={`py-1 ${propertyData.estratoSocial === estrato ? 'font-bold text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
                                    {label.split(' - ')[0]}
                                  </div>
                                  <div className={`py-1 text-center ${propertyData.estratoSocial === estrato ? 'font-bold text-green-700 dark:text-green-300' : 
                                    estratoValuationFactors[estrato] > 0 ? 'text-green-600 dark:text-green-400' : 
                                    estratoValuationFactors[estrato] < 0 ? 'text-red-600 dark:text-red-400' : 
                                    'text-blue-600 dark:text-blue-400'}`}>
                                    {estratoValuationLabels[estrato]}
                                  </div>
                                  <div className={`py-1 text-center ${propertyData.estratoSocial === estrato ? 'font-bold text-green-700 dark:text-green-300' : 
                                    estratoValuationFactors[estrato] > 0 ? 'text-green-600 dark:text-green-400' : 
                                    estratoValuationFactors[estrato] < 0 ? 'text-red-600 dark:text-red-400' : 
                                    'text-blue-600 dark:text-blue-400'}`}>
                                    {estratoValuationFactors[estrato] > 0 ? '↗️ Mayor valor' : 
                                     estratoValuationFactors[estrato] < 0 ? '↘️ Menor valor' : '➡️ Valor base'}
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 3: Tipo de Propiedad */}
                <TabsContent value="tipo" className="mt-6">
                  <Card className="border-2 border-green-200 shadow-xl bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep4Complete() ? '✓' : '4'}
                        </div>
                        🏠 Paso 4: Tipo de Propiedad
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                       <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                         <p className="text-sm text-blue-800 dark:text-blue-200">
                           <strong>🏠 ¿Qué tipo de casa tienes?</strong><br />
                           Necesitamos saber si tu propiedad es una casa, apartamento, terreno o local comercial.
                           <strong> Esta selección será utilizada para buscar comparables del mismo tipo de propiedad en tu estrato social.</strong>
                         </p>
                       </div>

                      <div className="space-y-6">
                        {/* SELECCIÓN DE TIPO DE PROPIEDAD */}
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <h3 className="font-semibold mb-2">🏠 Tipo de Propiedad</h3>
                          <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                            Dime qué tipo de propiedad quieres valuar.
                          </p>
                          <Select value={propertyData.tipoPropiedad} onValueChange={(value) => handleInputChange('tipoPropiedad', value)}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="¿Qué tipo de propiedad es?" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="casa">🏠 Casa - Vivienda independiente</SelectItem>
                              <SelectItem value="apartamento">🏢 Apartamento - Vivienda en edificio</SelectItem>
                              <SelectItem value="terreno">🌳 Terreno - Lote sin construcción</SelectItem>
                              <SelectItem value="comercial">🏪 Comercial - Local de negocio</SelectItem>
                            </SelectContent>
                          </Select>
                          {propertyData.tipoPropiedad && (
                            <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded">
                              <p className="text-sm text-green-800">
                                <strong>✅ Tipo seleccionado:</strong> {
                                  propertyData.tipoPropiedad === 'casa' ? '🏠 Casa' :
                                  propertyData.tipoPropiedad === 'apartamento' ? '🏢 Apartamento' :
                                  propertyData.tipoPropiedad === 'terreno' ? '🌳 Terreno' :
                                  propertyData.tipoPropiedad === 'comercial' ? '🏪 Comercial' : ''
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 4: Características */}
                <TabsContent value="caracteristicas" className="mt-6">
                  <Card className="border-2 border-orange-200 shadow-xl bg-gradient-to-br from-orange-50/50 to-amber-50/50">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep3Complete() ? '✓' : '4'}
                        </div>
                        📏 Paso 4: Área
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>📏 ¿Qué tan grande es tu terreno y tu casa?</strong><br />
                          Solo necesitamos dos medidas: el área total del terreno y el área construida de tu casa.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="area" className="text-base font-semibold">
                            🌱 Área de Terreno (metros cuadrados) *
                          </Label>
                          <Input 
                            id="area"
                            type="number" 
                            value={propertyData.area || ''}
                            onChange={(e) => handleInputChange('area', Number(e.target.value))}
                            placeholder="Ejemplo: 200"
                            className="border-2 focus:border-green-500 hover:border-green-400 transition-colors h-12"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            🏞️ El área total del terreno (incluyendo patio, jardín, etc.)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="construction_area" className="text-base font-semibold">
                            🏠 Área Total de Construcción (m²) *
                          </Label>
                          <Input 
                            id="construction_area"
                            type="number" 
                            value={propertyData.construction_area || ''}
                            onChange={(e) => handleInputChange('construction_area', Number(e.target.value))}
                            placeholder="Ejemplo: 120"
                            className="border-2 focus:border-green-500 hover:border-green-400 transition-colors h-12"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            🏗️ Solo el área techada de la casa (sin patio). Si la construcción es de 2 niveles o más, se deberán sumar dichas áreas de construcción por cada nivel
                          </p>
                        </div>
                      </div>

                      {/* Confirmación cuando se complete el área */}
                      {isStep4Complete() && (
                        <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600">✅</span>
                            <p className="text-green-800 font-medium text-sm">
                              ¡Excelente! Ya sabemos el tamaño: {propertyData.area} m²
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-xs">
                          🎯 <strong>¿Por qué necesitamos esto?</strong> El tamaño es lo más importante para saber cuánto vale tu casa. 
                          Una casa más grande vale más dinero.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 5: Área y Características */}
                <TabsContent value="caracteristicas" className="mt-6">
                  <Card className="border-2 border-orange-200 shadow-xl bg-gradient-to-br from-orange-50/50 to-yellow-50/50">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep4Complete() ? '✓' : '5'}
                        </div>
                        🔧 Paso 5: ¿En qué estado está tu casa?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>🔍 ¿Tu casa está nueva o necesita arreglos?</strong><br />
                          Es súper importante saber si tu casa está en buen estado o necesita reparaciones. 
                          Una casa nueva vale más que una que necesita muchos arreglos.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base font-semibold">
                          🏠 Estado de tu Casa *
                        </Label>
                        <Select 
                          value={propertyData.estadoConservacion} 
                          onValueChange={(value) => handleInputChange('estadoConservacion', value)}
                        >
                          <SelectTrigger className="border-2 focus:border-orange-500 hover:border-orange-400 transition-colors h-12">
                            <SelectValue placeholder="¿Cómo está tu casa?" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NUEVO">🆕 Nueva - Como recién construida</SelectItem>
                            <SelectItem value="BUENO">👍 Buena - Se ve muy bien</SelectItem>
                            <SelectItem value="MEDIO">😊 Normal - Se ve bien pero con uso</SelectItem>
                            <SelectItem value="REGULAR">⚠️ Regular - Necesita algunos arreglos</SelectItem>
                            <SelectItem value="REPARACIONES SENCILLAS">🔨 Necesita arreglos fáciles</SelectItem>
                            <SelectItem value="REPARACIONES MEDIAS">🏗️ Necesita arreglos importantes</SelectItem>
                            <SelectItem value="REPARACIONES IMPORTANTES">⚒️ Necesita muchos arreglos</SelectItem>
                            <SelectItem value="DAÑOS GRAVES">❌ Tiene problemas serios</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Mostrar explicación del estado seleccionado */}
                        {propertyData.estadoConservacion && conservationExplanations[propertyData.estadoConservacion] && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">
                              📝 {propertyData.estadoConservacion}
                            </h4>
                            <p className="text-sm text-blue-700 mb-3">
                              {conservationExplanations[propertyData.estadoConservacion].description}
                            </p>
                            <div className="text-xs text-blue-600">
                              <strong>Ejemplos:</strong>
                              <ul className="list-disc pl-4 mt-1">
                                {conservationExplanations[propertyData.estadoConservacion].examples?.map((example: string, index: number) => (
                                  <li key={index}>{example}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {/* Confirmación cuando se complete */}
                        {isStep5Complete() && (
                          <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                            <div className="flex items-center gap-2">
                              <span className="text-green-600">✅</span>
                              <p className="text-green-800 font-medium text-sm">
                                ¡Perfecto! Estado: {propertyData.estadoConservacion}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 text-xs">
                          🎯 <strong>¿Por qué necesitamos esto?</strong> El estado de tu casa cambia mucho el precio. 
                          Una casa nueva vale mucho más que una que necesita arreglos. Es como comparar un carro nuevo vs uno usado.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 5: Ubicación */}
                <TabsContent value="ubicacion" className="mt-6">
                  <Card className="border-2 border-teal-200 shadow-xl bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
                    <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep1Complete() ? '✓' : '2'}
                        </div>
                        📍 Paso 2: ¿Dónde está tu casa?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>📍 ¿Dónde está exactamente tu casa?</strong><br />
                          Ubica tu casa en el mapa para que podamos calcular mejor el precio. 
                          La ubicación es muy importante porque en algunos barrios las casas valen más.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold mb-2">📍 Ubicación exacta de tu propiedad</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Ubica exactamente dónde está tu casa/terreno en el mapa.
                        </p>
                        <FreeLocationMap
                          onLocationChange={(lat, lng, address) => {
                            handleInputChange('latitud', lat);
                            handleInputChange('longitud', lng);
                            handleInputChange('direccionCompleta', address);
                          }}
                          initialLat={propertyData.latitud || 13.7042}
                          initialLng={propertyData.longitud || -89.2073}
                          initialAddress={propertyData.direccionCompleta}
                        />
                        {propertyData.direccionCompleta && (
                          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                            <p className="text-sm text-green-800">
                              <strong>📍 Ubicación seleccionada:</strong> {propertyData.direccionCompleta}
                            </p>
                          </div>
                        )}

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-xs">
                            🎯 <strong>¿Por qué necesitamos esto?</strong> La ubicación es súper importante para el precio. 
                            Una casa en el centro de la ciudad vale diferente que una en las afueras. También nos ayuda a encontrar casas similares para comparar.
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
                        💎 Paso 6: ¡Descubre cuánto vale tu casa!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-6">
                        <div className="mb-4">
                          <Calculator className="w-16 h-16 text-pink-500 mx-auto" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">
                          {(propertyData.area > 0 && propertyData.tipoPropiedad && propertyData.estratoSocial) ? 
                            '🎉 ¡Listo para saber el precio!' : 
                            '⏳ Faltan algunos datos'
                          }
                        </h3>

                        {/* Validación de campos requeridos */}
                        {(!propertyData.area || !propertyData.tipoPropiedad || !propertyData.estratoSocial) && (
                          <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-6">
                            <p className="text-red-800 font-medium mb-2">
                              ❌ <strong>Necesitas completar estos datos:</strong>
                            </p>
                            <ul className="text-red-700 text-sm space-y-1">
                              {!propertyData.area && <li>• El área de tu casa (Paso 3)</li>}
                              {!propertyData.tipoPropiedad && <li>• El tipo de propiedad (Paso 2)</li>}
                              {!propertyData.estratoSocial && <li>• El estrato social del barrio, colonia o residencial (Paso 2)</li>}
                            </ul>
                          </div>
                        )}

                        <Button
                          onClick={performValuation}
                          disabled={isCalculating || !propertyData.area || !propertyData.tipoPropiedad || !propertyData.estratoSocial}
                          size="lg"
                          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          {isCalculating ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Calculando el precio...
                            </>
                          ) : (
                            <>
                              <Calculator className="w-5 h-5 mr-2" />
                              💎 ¡Calcular el Valor de mi Casa!
                            </>
                          )}
                        </Button>

                        {/* Resultado de la valuación */}
                        {valuationResult && (
                          <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                            <h4 className="text-2xl font-bold text-green-800 mb-4">
                              🏆 ¡Tu Casa Vale!
                            </h4>
                            
                            {/* Precio en USD */}
                            <div className="text-3xl font-bold text-green-900 mb-2">
                              ${valuationResult.estimatedValueUSD?.toLocaleString()} USD
                            </div>
                            
                            {/* Precio en moneda local si es diferente */}
                            {valuationResult.currency !== 'USD' && (
                              <div className="text-2xl font-bold text-green-800 mb-4">
                                {valuationResult.symbol}{valuationResult.estimatedValueLocal?.toLocaleString()} {valuationResult.currency}
                              </div>
                            )}
                            
                            <div className="text-green-700 space-y-1 text-sm">
                              <p><strong>Propiedad:</strong> {valuationResult.propertyType} de {valuationResult.area} m²</p>
                              <p><strong>Ubicación:</strong> {valuationResult.country}</p>
                              <p><strong>Barrio:</strong> {valuationResult.estrato}</p>
                              <p><strong>Estado:</strong> {valuationResult.conservation}</p>
                            </div>

                            {/* Detalles del cálculo con dos fases */}
                            <div className="mt-4 p-3 bg-white border border-green-200 rounded text-left">
                              <h5 className="font-semibold text-green-800 mb-2">📊 ¿Cómo calculamos este precio?</h5>
                              
                              {/* Método Comparativo */}
                              <div className="mb-3 p-2 bg-blue-50 rounded">
                                <h6 className="font-semibold text-blue-800 text-xs mb-1">1️⃣ MÉTODO COMPARATIVO BASE</h6>
                                <div className="text-xs text-blue-700 space-y-1">
                                  <p>• Precio base por m²: ${valuationResult.factors?.basePricePerM2?.toLocaleString()} USD</p>
                                  <p>• Factor por estado: {((valuationResult.factors?.conservationMultiplier || 1) * 100).toFixed(0)}%</p>
                                  <p>• Factor económico del país: {((valuationResult.factors?.economicMultiplier || 1) * 100).toFixed(0)}%</p>
                                  <p className="font-semibold border-t pt-1">
                                    = Valor comparativo: ${valuationResult.comparativeValueUSD?.toLocaleString()} USD
                                  </p>
                                </div>
                              </div>

                              {/* Segundo Ajuste por Estrato */}
                              <div className="p-2 bg-purple-50 rounded">
                                <h6 className="font-semibold text-purple-800 text-xs mb-1">2️⃣ SEGUNDO AJUSTE POR ESTRATO SOCIAL</h6>
                                <div className="text-xs text-purple-700 space-y-1">
                                  <p>• Estrato seleccionado: {valuationResult.estrato}</p>
                                  <p>• Factor de ajuste: {valuationResult.factors?.estratoPercentage}</p>
                                  <p className="font-semibold border-t pt-1 text-green-700">
                                    = Valor final: ${valuationResult.estimatedValueUSD?.toLocaleString()} USD
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Comparables si los hay */}
                            {comparables.length > 0 && (
                              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                <h5 className="font-semibold text-blue-800 mb-2">🏘️ Propiedades Similares Encontradas</h5>
                                <p className="text-xs text-blue-700">
                                  Encontramos {comparables.length} propiedades similares del estrato <strong>{estratoSocialLabels[propertyData.estratoSocial as EstratoSocial]}</strong> para comparar en la zona.
                                </p>
                              </div>
                            )}
                            
                            {/* Mensaje cuando no hay comparables */}
                            {comparables.length === 0 && propertyData.estratoSocial && (
                              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                                <h5 className="font-semibold text-amber-800 mb-2">🔍 Búsqueda de Comparables</h5>
                                <p className="text-xs text-amber-700">
                                  No se encontraron propiedades similares del estrato <strong>{estratoSocialLabels[propertyData.estratoSocial as EstratoSocial]}</strong> en la zona inmediata. 
                                  El avalúo se basa en datos generales del mercado para este estrato social.
                                </p>
                              </div>
                            )}

                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                              <p className="text-yellow-800 text-xs">
                                ⚠️ <strong>Importante:</strong> Este es un estimado basado en datos del mercado. 
                                Para un avalúo oficial, consulta con un profesional certificado.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Tutorial paso a paso */}
      <ValuationWalkthrough
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
        onStepChange={() => {}}
      />
    </div>
  );
};

export default PropertyValuation;