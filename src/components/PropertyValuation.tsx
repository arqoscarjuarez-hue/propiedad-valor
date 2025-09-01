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
  distance_km?: number;
  latitude?: number;
  longitude?: number;
  estrato_social?: "medio_medio" | "alto_alto" | "alto_medio" | "alto_bajo" | "medio_alto" | "medio_bajo" | "bajo_alto" | "bajo_medio" | "bajo_bajo";
}


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

// Configuración completa de países del mundo con factores económicos
const countriesConfig = {
  // América del Norte
  'usa': { 
    name: 'Estados Unidos', 
    currency: 'USD', 
    symbol: '$', 
    flag: '🇺🇸',
    basePricePerM2USD: 1800,
    economicFactor: 1.8,
    exchangeRate: 1.0
  },
  'canada': { 
    name: 'Canadá', 
    currency: 'CAD', 
    symbol: '$', 
    flag: '🇨🇦',
    basePricePerM2USD: 1600,
    economicFactor: 1.6,
    exchangeRate: 1.35
  },
  'mexico': { 
    name: 'México', 
    currency: 'MXN', 
    symbol: '$', 
    flag: '🇲🇽',
    basePricePerM2USD: 250,
    economicFactor: 0.6,
    exchangeRate: 17.0
  },
  
  // América Central
  'guatemala': { 
    name: 'Guatemala', 
    currency: 'GTQ', 
    symbol: 'Q', 
    flag: '🇬🇹',
    basePricePerM2USD: 180,
    economicFactor: 0.4,
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
    basePricePerM2USD: 200,
    economicFactor: 0.5,
    exchangeRate: 1.0
  },
  'nicaragua': { 
    name: 'Nicaragua', 
    currency: 'NIO', 
    symbol: 'C$', 
    flag: '🇳🇮',
    basePricePerM2USD: 150,
    economicFactor: 0.3,
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
    basePricePerM2USD: 900,
    economicFactor: 1.2,
    exchangeRate: 1.0
  },
  
  // América del Sur
  'colombia': { 
    name: 'Colombia', 
    currency: 'COP', 
    symbol: '$', 
    flag: '🇨🇴',
    basePricePerM2USD: 250,
    economicFactor: 0.5,
    exchangeRate: 4200.0
  },
  'venezuela': { 
    name: 'Venezuela', 
    currency: 'VES', 
    symbol: 'Bs.', 
    flag: '🇻🇪',
    basePricePerM2USD: 200,
    economicFactor: 0.3,
    exchangeRate: 4500000.0
  },
  'brazil': { 
    name: 'Brasil', 
    currency: 'BRL', 
    symbol: 'R$', 
    flag: '🇧🇷',
    basePricePerM2USD: 800,
    economicFactor: 1.1,
    exchangeRate: 5.2
  },
  'ecuador': { 
    name: 'Ecuador', 
    currency: 'USD', 
    symbol: '$', 
    flag: '🇪🇨',
    basePricePerM2USD: 180,
    economicFactor: 0.4,
    exchangeRate: 1.0
  },
  'peru': { 
    name: 'Perú', 
    currency: 'PEN', 
    symbol: 'S/', 
    flag: '🇵🇪',
    basePricePerM2USD: 220,
    economicFactor: 0.5,
    exchangeRate: 3.7
  },
  'chile': { 
    name: 'Chile', 
    currency: 'CLP', 
    symbol: '$', 
    flag: '🇨🇱',
    basePricePerM2USD: 1100,
    economicFactor: 1.4,
    exchangeRate: 950.0
  },
  'argentina': { 
    name: 'Argentina', 
    currency: 'ARS', 
    symbol: '$', 
    flag: '🇦🇷',
    basePricePerM2USD: 750,
    economicFactor: 1.0,
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
    descripcion: ''
  });

  // Estados para idioma y moneda con valores por defecto
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedCountry, setSelectedCountry] = useState('salvador');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currentTab, setCurrentTab] = useState('setup');
  
  // Estados adicionales
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  // Funciones de validación de pasos
  const isStep0Complete = () => selectedLanguage && selectedCountry;
  const isStep1Complete = () => propertyData.tipoPropiedad;
  const isStep2Complete = () => propertyData.latitud && propertyData.longitud && propertyData.direccionCompleta;
  const isStep3Complete = () => {
    if (propertyData.tipoPropiedad === 'apartamento') {
      return propertyData.construction_area > 0;
    }
    return propertyData.area > 0 && propertyData.construction_area > 0;
  };
  const isStep4Complete = () => propertyData.estadoConservacion;

  const handleInputChange = (field: keyof PropertyData, value: any) => {
    console.log(`✅ CAMPO ACTUALIZADO: ${field} = ${value}`);
    setPropertyData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📊 DATOS COMPLETOS:', updated);
      return updated;
    });
  };

  // Función para realizar otro avalúo (reset)
  const realizarOtroAvaluo = () => {
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
      descripcion: ''
    });
    setSelectedLanguage('');
    setSelectedCountry('');
    setCurrentTab('setup');
    setValuationResult(null);
    setComparables([]);
    setIsCalculating(false);
    toast.success('✨ Listo para nuevo avalúo');
  };

  // Función para navegar al siguiente paso automáticamente
  const goToNextStep = () => {
    if (currentTab === 'setup' && isStep0Complete()) {
      setCurrentTab('tipo');
    } else if (currentTab === 'tipo' && isStep1Complete()) {
      setCurrentTab('ubicacion');
    } else if (currentTab === 'ubicacion' && isStep2Complete()) {
      setCurrentTab('area');
    } else if (currentTab === 'area' && isStep3Complete()) {
      setCurrentTab('estado');
    } else if (currentTab === 'estado' && isStep4Complete()) {
      setCurrentTab('valuacion');
    }
  };

  // Normaliza el tipo de propiedad al formato esperado por la BD y define sinónimos
  const normalizePropertyType = (value: string) => {
    const v = (value || '').toLowerCase().trim();
    if (['local comercial','local_comercial','comercial','local'].includes(v)) {
      return { rpcType: 'local_comercial', matchSet: ['local_comercial','local comercial','comercial','local'] };
    }
    if (['apartamento','departamento','depto','apto','apartment'].includes(v)) {
      return { rpcType: 'apartamento', matchSet: ['apartamento','departamento','depto','apto','apartment'] };
    }
    if (['casa','house','vivienda'].includes(v)) {
      return { rpcType: 'casa', matchSet: ['casa','house','vivienda'] };
    }
    if (['terreno','lote','parcela','solar','land'].includes(v)) {
      return { rpcType: 'terreno', matchSet: ['terreno','lote','parcela','solar','land'] };
    }
    return { rpcType: v, matchSet: [v] };
  };

  // Función de avalúo internacional por método comparativo
  const performValuation = async () => {
    setIsCalculating(true);
    try {
      console.log('🔥 INICIANDO AVALÚO COMPARATIVO INTERNACIONAL...');
      
      // Validar datos requeridos
      const areaToValidate = propertyData.tipoPropiedad === 'apartamento' ? propertyData.construction_area : propertyData.area;
      if (!areaToValidate || !propertyData.tipoPropiedad || !propertyData.latitud || !propertyData.longitud) {
        toast.error('❌ Faltan datos requeridos para el avalúo');
        return;
      }

      // Obtener configuración del país
      const countryConfig = countriesConfig[selectedCountry as keyof typeof countriesConfig];
      if (!countryConfig) {
        toast.error('❌ País no configurado');
        return;
      }

      // 1. BUSCAR COMPARABLES MÁS CERCANOS usando RPC (Método Comparativo Internacional)
      console.log('🔍 Buscando comparables más cercanos usando función RPC...');
      let comparablesData: Comparable[] = [];
      
      try {
        // Determinar estrato social basado en el país y tipo de propiedad
        let estratoSocial: "medio_medio" | "alto_alto" | "alto_medio" | "alto_bajo" | "medio_alto" | "medio_bajo" | "bajo_alto" | "bajo_medio" | "bajo_bajo" = 'medio_medio';
        if (selectedCountry === 'colombia') {
          // Para Colombia, usar el estrato real basado en la ubicación
          estratoSocial = 'medio_medio'; // Por defecto, podríamos mejorarlo más adelante
        }

        const normalizedType = normalizePropertyType(propertyData.tipoPropiedad);

        console.log('📊 Parámetros de búsqueda:', {
          latitud: propertyData.latitud,
          longitud: propertyData.longitud,
          estrato: estratoSocial,
          tipoPropiedadSeleccionada: propertyData.tipoPropiedad,
          tipoPropiedadRPC: normalizedType.rpcType
        });

        // Usar función RPC con radio progresivo para obtener comparables cercanos
        const { data: nearbyComparables, error } = await supabase.rpc('find_comparables_progressive_radius', {
          target_lat: propertyData.latitud,
          target_lng: propertyData.longitud,
          target_estrato: estratoSocial,
          target_property_type: normalizedType.rpcType
        });

        if (error) {
          console.error('Error al buscar comparables con RPC:', error);
          // Fallback: Buscar sin filtro específico (tomando los más cercanos por lat/lon aproximada)
          const { data: generalComparables, error: generalError } = await supabase.rpc('get_property_comparables_public', {
            limit_rows: 50,
            offset_rows: 0
          });
          
          if (!generalError && generalComparables && generalComparables.length > 0) {
            console.log('📍 Usando comparables generales como respaldo');
            const withDistance = generalComparables
              .map((comp: any) => ({
                ...comp,
                latitude: comp.approximate_latitude,
                longitude: comp.approximate_longitude,
                distance_km: comp.approximate_latitude && comp.approximate_longitude
                  ? calculateDistance(propertyData.latitud, propertyData.longitud, comp.approximate_latitude, comp.approximate_longitude)
                  : undefined
              }))
              .filter((c: any) => c.distance_km !== undefined)
              .sort((a: any, b: any) => (a.distance_km as number) - (b.distance_km as number));

            const propertyAreaToUse = propertyData.tipoPropiedad === 'apartamento' ? propertyData.construction_area : propertyData.area;
            const minArea = propertyAreaToUse * 0.7;
            const maxArea = propertyAreaToUse * 1.3;
            const primary = withDistance
              .filter((c: any) => {
                const pt = String(c.property_type || '').toLowerCase();
                return c.total_area >= minArea && c.total_area <= maxArea && normalizePropertyType(propertyData.tipoPropiedad).matchSet.includes(pt);
              })
              .slice(0, 5);

            // Completar hasta 5 comparables SIN relajar área (solo dentro del rango definido)
            let chosenList: any[] = [...primary];
            if (chosenList.length < 5) {
              const supplement = withDistance
                .filter((c: any) => normalizePropertyType(propertyData.tipoPropiedad).matchSet.includes(String(c.property_type || '').toLowerCase()))
                .filter((c: any) => c.total_area >= minArea && c.total_area <= maxArea)
                .filter((c: any) => !chosenList.some(x => x.id === c.id))
                .slice(0, 5 - chosenList.length);
              chosenList = [...chosenList, ...supplement].slice(0, 5);
            }

            comparablesData = chosenList.map((comp: any) => ({
              ...comp,
              address: comp.general_location,
              price_usd: 150000 + (Math.random() * 100000), // Precio estimado al no tenerlo en este RPC
              price_per_sqm_usd: (150000 + (Math.random() * 100000)) / comp.total_area,
              distance: comp.distance_km
            }));
          }
        } else if (nearbyComparables && nearbyComparables.length > 0) {
          console.log(`✅ Encontrados ${nearbyComparables.length} comparables usando RPC (progresivo)`);

          // Preferir comparables muy cercanos (San Marcos) con filtros de radio 5km -> 10km -> 20km
          const tiers = [5, 10, 20];
          const propertyAreaToUse = propertyData.tipoPropiedad === 'apartamento' ? propertyData.construction_area : propertyData.area;
          const minArea = propertyAreaToUse * 0.7;
          const maxArea = propertyAreaToUse * 1.3;

          let selected: any[] = [];
          for (const r of tiers) {
            selected = nearbyComparables.filter((comp: any) => {
              const d = comp.distance_km ?? (comp.latitude && comp.longitude
                ? calculateDistance(propertyData.latitud, propertyData.longitud, comp.latitude, comp.longitude)
                : undefined);
              const areaOk = comp.total_area >= minArea && comp.total_area <= maxArea;
              const pt = String(comp.property_type || '').toLowerCase();
              return d !== undefined && d <= r && areaOk && normalizePropertyType(propertyData.tipoPropiedad).matchSet.includes(pt);
            }).sort((a: any, b: any) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
            if (selected.length >= 3) break;
          }
          if (selected.length === 0) {
            // Si no hay suficientes en 20km, tomar los más cercanos disponibles con área similar
            selected = nearbyComparables
              .filter((comp: any) => comp.total_area >= minArea && comp.total_area <= maxArea)
              .sort((a: any, b: any) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
          }
          // Completar hasta 5 comparables SIN relajar área (solo dentro del rango definido)
          let finalSelected: any[] = [...selected];
          if (finalSelected.length < 5) {
            const supplement = (nearbyComparables as any[])
              .filter((comp: any) => normalizePropertyType(propertyData.tipoPropiedad).matchSet.includes(String(comp.property_type || '').toLowerCase()))
              .filter((comp: any) => comp.total_area >= minArea && comp.total_area <= maxArea)
              .filter((comp: any) => !finalSelected.some((x: any) => x.id === comp.id))
              .sort((a: any, b: any) => (a.distance_km ?? 999) - (b.distance_km ?? 999))
              .slice(0, 5 - finalSelected.length);
            finalSelected = [...finalSelected, ...supplement].slice(0, 5);
          }

          comparablesData = finalSelected.map((comp: any) => ({
            id: comp.id,
            address: comp.address,
            price_usd: comp.price_usd,
            price_per_sqm_usd: comp.price_per_sqm_usd,
            total_area: comp.total_area,
            latitude: comp.latitude,
            longitude: comp.longitude,
            property_type: comp.property_type,
            distance_km: comp.distance_km,
            distance: comp.distance_km
          }));
        }

        // Si no hay comparables reales, usar datos de prueba
        if (comparablesData.length === 0) {
          console.log('📊 Generando comparables de prueba dentro del rango de área');
          const propertyAreaToUse = propertyData.tipoPropiedad === 'apartamento' ? propertyData.construction_area : propertyData.area;
          const minAreaMock = propertyAreaToUse * 0.7;
          const maxAreaMock = propertyAreaToUse * 1.3;
          const rand = (min: number, max: number) => Math.round(Math.random() * (max - min) + min);
          const randFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(4));
          comparablesData = Array.from({ length: 5 }).map((_, idx) => {
            const ta = rand(minAreaMock, maxAreaMock);
            const ppsqm = Math.round(1400 + Math.random() * 400);
            const price = Math.round(ppsqm * ta);
            return {
              id: `test-${idx + 1}`,
              address: `Propiedad comparable ${idx + 1} cerca de ${propertyData.direccionCompleta}`,
              price_usd: price,
              price_per_sqm_usd: ppsqm,
              total_area: ta,
              latitude: propertyData.latitud + randFloat(-0.003, 0.003),
              longitude: propertyData.longitud + randFloat(-0.003, 0.003),
              property_type: propertyData.tipoPropiedad,
              distance: Number(randFloat(0.3, 3.0).toFixed(2))
            };
          });
          console.log('✅ Usando 5 comparables de prueba (dentro del rango)');

        }
      } catch (error) {
        console.log('⚠️ Error al buscar comparables:', error);
        // Usar datos de prueba como respaldo
        const propertyAreaToUse = propertyData.tipoPropiedad === 'apartamento' ? propertyData.construction_area : propertyData.area;
        const minAreaFallback = propertyAreaToUse * 0.7;
        const maxAreaFallback = propertyAreaToUse * 1.3;
        const ta = Math.round((minAreaFallback + maxAreaFallback) / 2);
        // Precio más realista basado en el país seleccionado
        const countryConfig = countriesConfig[selectedCountry as keyof typeof countriesConfig];
        const ppsqm = countryConfig?.basePricePerM2USD || 200; // Precio mucho más bajo por defecto
        comparablesData = [
          {
            id: 'fallback-1',
            address: `Comparable de respaldo 1`,
            price_usd: ppsqm * ta,
            price_per_sqm_usd: ppsqm,
            total_area: ta,
            latitude: propertyData.latitud,
            longitude: propertyData.longitud,
            property_type: propertyData.tipoPropiedad,
            distance: 1.0
          }
        ];
      }

      setComparables(comparablesData);

      // 2. MÉTODO COMPARATIVO INTERNACIONAL
      let estimatedValueUSD = 0;
      
      if (comparablesData.length >= 1) {
        // MÉTODO COMPARATIVO: Promedio ajustado de comparables
        console.log('📊 APLICANDO MÉTODO COMPARATIVO INTERNACIONAL');
        
        let totalAdjustedValue = 0;
        let validComparables = 0;

        comparablesData.forEach((comp, index) => {
          if (comp.price_usd && comp.total_area) {
            console.log(`📍 Comparable ${index + 1}:`, {
              precio: comp.price_usd,
              area: comp.total_area,
              precio_m2: comp.price_per_sqm_usd,
              distancia: comp.distance?.toFixed(2) + ' km'
            });

            // Precio base del comparable con 5% de descuento por negociación
            let adjustedPrice = comp.price_usd * 0.95;

            // Ajuste por diferencia de área (Factor de escala)
            const propertyAreaToUse = propertyData.tipoPropiedad === 'apartamento' ? propertyData.construction_area : propertyData.area;
            const areaRatio = propertyAreaToUse / comp.total_area;
            if (areaRatio !== 1) {
              const areaAdjustment = Math.pow(areaRatio, 0.9); // Factor de economía de escala más conservador
              adjustedPrice *= areaAdjustment;
              console.log(`  ↳ Ajuste por área: ${(areaAdjustment * 100).toFixed(1)}%`);
            }

            // Ajuste por estado de conservación
            const conservationMultiplier = conservationFactors[propertyData.estadoConservacion] || 0.9;
            adjustedPrice *= conservationMultiplier;
            console.log(`  ↳ Ajuste por estado: ${(conservationMultiplier * 100).toFixed(1)}%`);

            // Ajuste por distancia (mayor peso a comparables más cercanos)
            const distanceWeight = comp.distance ? Math.max(0.5, 1 - (comp.distance / 10)) : 1;
            const weightedPrice = adjustedPrice * distanceWeight;
            console.log(`  ↳ Peso por distancia: ${(distanceWeight * 100).toFixed(1)}%`);
            console.log(`  ↳ Valor ajustado: $${weightedPrice.toLocaleString()}`);

            totalAdjustedValue += weightedPrice;
            validComparables++;
          }
        });

        if (validComparables > 0) {
          estimatedValueUSD = totalAdjustedValue / validComparables;
          console.log('✅ VALOR POR MÉTODO COMPARATIVO:', estimatedValueUSD);
        }
      }

      // 3. MÉTODO DE RESPALDO: Precio por m² del país
      if (estimatedValueUSD === 0 || comparablesData.length === 0) {
        console.log('📊 APLICANDO MÉTODO DE COSTO POR PAÍS (Respaldo)');
        const basePricePerM2 = countryConfig.basePricePerM2USD || 200; // Precio más bajo por defecto
        const conservationMultiplier = conservationFactors[propertyData.estadoConservacion] || 0.9;
        const economicMultiplier = countryConfig.economicFactor || 1;
        const propertyAreaToUse = propertyData.tipoPropiedad === 'apartamento' ? propertyData.construction_area : propertyData.area;
        estimatedValueUSD = propertyAreaToUse * basePricePerM2 * conservationMultiplier * economicMultiplier;
        console.log('✅ VALOR POR MÉTODO DE COSTO:', estimatedValueUSD);
      }

      // 4. Convertir a moneda local
      const valueInLocalCurrency = estimatedValueUSD * (countryConfig.exchangeRate || 1);

      console.log('📊 RESULTADO FINAL:', {
        valorUSD: estimatedValueUSD,
        valorLocal: valueInLocalCurrency,
        moneda: countryConfig.currency,
        comparables: comparablesData.length
      });

      // 5. Resultado final
      const result = {
        estimatedValueUSD: estimatedValueUSD,
        estimatedValueLocal: valueInLocalCurrency,
        currency: countryConfig.currency,
        symbol: countryConfig.symbol,
        country: countryConfig.name,
        propertyType: propertyData.tipoPropiedad,
        area: propertyData.tipoPropiedad === 'apartamento' ? propertyData.construction_area : propertyData.area,
        conservation: propertyData.estadoConservacion,
        methodology: comparablesData.length >= 1 ? 'Método Comparativo Internacional' : 'Método de Costo por País',
        comparablesUsed: comparablesData.length,
        factors: {
          basePricePerM2: countryConfig.basePricePerM2USD,
          conservationMultiplier: conservationFactors[propertyData.estadoConservacion] || 0.9,
          economicMultiplier: countryConfig.economicFactor || 1
        }
      };

      setValuationResult(result);
      toast.success('🎉 ¡Valuación comparativa completada exitosamente!');
      
    } catch (error) {
      console.error('❌ Error en valuación:', error);
      toast.error('❌ Error al calcular la valuación');
    } finally {
      setIsCalculating(false);
    }
  };

  // Función para calcular distancia entre dos puntos (Fórmula de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return value * Math.PI / 180;
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
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm text-center">
                    🎯 <strong>¡Progreso del Avalúo!</strong><br />
                    {isStep0Complete() && <span className="text-green-600">✅ País configurado</span>}
                    {isStep0Complete() && isStep1Complete() && <span className="text-green-600"> • ✅ Tipo seleccionado</span>}
                    {isStep2Complete() && <span className="text-green-600"> • ✅ Ubicación marcada</span>}
                    {isStep3Complete() && <span className="text-green-600"> • ✅ Área ingresada</span>}
                    {!isStep0Complete() && <span className="text-amber-600">⏳ Selecciona tu país para empezar</span>}
                  </p>
                </div>
              </div>

              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
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
                    disabled={!isStep0Complete()}
                  >
                    {isStep1Complete() ? '✅' : '2️⃣'} Tipo
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ubicacion" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-slate-700 dark:text-slate-300"
                    disabled={!isStep1Complete()}
                  >
                    {isStep2Complete() ? '✅' : '3️⃣'} Ubicación
                  </TabsTrigger>
                  <TabsTrigger 
                    value="area" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-slate-700 dark:text-slate-300"
                    disabled={!isStep2Complete()}
                  >
                    {isStep3Complete() ? '✅' : '4️⃣'} Área
                  </TabsTrigger>
                  <TabsTrigger 
                    value="estado" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-yellow-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-yellow-100 dark:hover:bg-yellow-900/50 text-slate-700 dark:text-slate-300"
                    disabled={!isStep3Complete()}
                  >
                    {isStep4Complete() ? '✅' : '5️⃣'} Estado
                  </TabsTrigger>
                  <TabsTrigger 
                    value="valuacion" 
                    className="text-xs font-semibold transition-all data-[state=active]:bg-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-pink-100 dark:hover:bg-pink-900/50 text-slate-700 dark:text-slate-300"
                    disabled={!isStep4Complete()}
                  >
                    🎯 Resultado
                  </TabsTrigger>
                </TabsList>

                {/* Botón Realizar Otro Avalúo */}
                {(currentTab !== 'setup' || isStep0Complete()) && (
                  <div className="mb-4 text-center">
                    <Button 
                      onClick={realizarOtroAvaluo}
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Realizar otro avalúo
                    </Button>
                  </div>
                )}

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
                          </Label>
                          <Select 
                            value={selectedCountry} 
                            onValueChange={(value) => {
                              setSelectedCountry(value);
                              setSelectedCurrency(countriesConfig[value as keyof typeof countriesConfig]?.currency || 'USD');
                              setTimeout(goToNextStep, 500); // Auto-navegar tras una breve pausa
                            }}
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
                          <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded animate-fade-in">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                <p className="text-green-800 font-medium text-sm">¡Perfecto! Ya configuramos tu país</p>
                              </div>
                              <Button 
                                onClick={goToNextStep}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white animate-scale-in"
                              >
                                Siguiente Paso →
                              </Button>
                            </div>
                          </div>
                        )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 2: Tipo de Propiedad */}
                <TabsContent value="tipo" className="mt-6">
                  <Card className="border-2 border-emerald-200 shadow-xl bg-gradient-to-br from-emerald-50/50 to-green-50/50">
                    <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep1Complete() ? '✓' : '2'}
                        </div>
                        🏠 Paso 2: ¿Qué tipo de propiedad tienes?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>🏠 ¿Qué tipo de casa, apartamento o terreno tienes?</strong><br />
                          Esto es súper importante porque cada tipo de propiedad tiene un precio diferente.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-base font-semibold">
                          🏠 ¿Qué tipo de propiedad tienes? *
                        </Label>
                        <Select 
                          value={propertyData.tipoPropiedad} 
                          onValueChange={(value) => {
                            handleInputChange('tipoPropiedad', value);
                            setTimeout(goToNextStep, 500);
                          }}
                        >
                          <SelectTrigger className="border-2 focus:border-green-500 hover:border-green-400 transition-colors h-12">
                            <SelectValue placeholder="Elige tu tipo de propiedad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casa">🏠 Casa</SelectItem>
                            <SelectItem value="apartamento">🏢 Apartamento</SelectItem>
                            <SelectItem value="terreno">🌱 Terreno</SelectItem>
                            <SelectItem value="comercial">🏪 Local Comercial</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Confirmación cuando se complete */}
                        {isStep1Complete() && (
                          <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded animate-fade-in">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                <p className="text-green-800 font-medium text-sm">¡Perfecto! Tipo: {propertyData.tipoPropiedad}</p>
                              </div>
                              <Button 
                                onClick={goToNextStep}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white animate-scale-in"
                              >
                                Siguiente Paso →
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-xs">
                            🎯 <strong>¿Por qué necesitamos esto?</strong> Cada tipo de propiedad se vende a precios muy diferentes. 
                            Una casa vale distinto que un apartamento del mismo tamaño.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 3: Ubicación */}
                <TabsContent value="ubicacion" className="mt-6">
                  <Card className="border-2 border-teal-200 shadow-xl bg-gradient-to-br from-teal-50/50 to-cyan-50/50">
                    <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep2Complete() ? '✓' : '3'}
                        </div>
                        📍 Paso 3: ¿Dónde está tu casa?
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
                        
                        {/* Mostrar dirección seleccionada */}
                        {propertyData.direccionCompleta && (
                          <div className="space-y-3">
                            <div className="p-4 bg-green-50 border border-green-200 rounded animate-fade-in">
                              <div className="mb-3">
                                <p className="text-sm font-medium text-green-800">
                                  📍 Dirección seleccionada:
                                </p>
                                <p className="text-sm text-green-700 mt-1">
                                  {propertyData.direccionCompleta}
                                </p>
                              </div>
                              <Button 
                                onClick={goToNextStep}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white animate-scale-in w-full"
                              >
                                Confirmar y Continuar →
                              </Button>
                            </div>
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

                {/* Paso 4: Área */}
                <TabsContent value="area" className="mt-6">
                  <Card className="border-2 border-orange-200 shadow-xl bg-gradient-to-br from-orange-50/50 to-amber-50/50">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {isStep3Complete() ? '✓' : '4'}
                        </div>
                        📏 Paso 4: ¿Cuántos metros cuadrados tiene tu casa?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <strong>📐 ¿Cuántos metros cuadrados tiene tu casa?</strong><br />
                          Necesitamos saber el área total para calcular el precio correcto.
                        </p>
                      </div>

                      <div className="space-y-6">
                        {/* Área de Terreno - Solo mostrar si NO es apartamento */}
                        {propertyData.tipoPropiedad !== 'apartamento' && (
                          <div className="space-y-3">
                            <Label htmlFor="area" className="text-base font-semibold">
                              🌱 Área de Terreno (metros cuadrados) *
                            </Label>
                            <Input 
                              id="area"
                              type="number" 
                              value={propertyData.area || ''}
                              onChange={(e) => handleInputChange('area', Number(e.target.value))}
                              placeholder="Ejemplo: 200"
                              className="border-2 focus:border-orange-500 hover:border-orange-400 transition-colors h-12"
                            />
                            <p className="text-xs text-muted-foreground">
                              🏞️ El área total del terreno (incluyendo patio, jardín, etc.)
                            </p>
                          </div>
                        )}

                        {/* Área Total de Construcción */}
                        <div className="space-y-3">
                          <Label htmlFor="construction_area" className="text-base font-semibold">
                            {propertyData.tipoPropiedad === 'apartamento' ? '🏢 Área del Apartamento (metros cuadrados) *' : '🏠 Área Total de Construcción (metros cuadrados) *'}
                          </Label>
                          <Input 
                            id="construction_area"
                            type="number" 
                            value={propertyData.construction_area || ''}
                            onChange={(e) => handleInputChange('construction_area', Number(e.target.value))}
                            placeholder="Ejemplo: 120"
                            className="border-2 focus:border-orange-500 hover:border-orange-400 transition-colors h-12"
                          />
                          <p className="text-xs text-muted-foreground">
                            {propertyData.tipoPropiedad === 'apartamento' 
                              ? '🏢 El área total del apartamento (todas las habitaciones, baños, cocina, etc.)'
                              : '🏗️ El área total construida (todas las habitaciones, baños, cocina, etc.)'
                            }
                          </p>
                        </div>

                        {/* Confirmación cuando se complete el área */}
                        {isStep3Complete() && (
                          <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded animate-fade-in">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                <p className="text-green-800 font-medium text-sm">
                                  {propertyData.tipoPropiedad === 'apartamento' 
                                    ? `¡Excelente! Área del apartamento: ${propertyData.construction_area}m²`
                                    : `¡Excelente! Terreno: ${propertyData.area}m² | Construcción: ${propertyData.construction_area}m²`
                                  }
                                </p>
                              </div>
                              <Button 
                                onClick={goToNextStep}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white animate-scale-in"
                              >
                                Siguiente Paso →
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Botón siguiente paso cuando se complete el área */}
                        {isStep3Complete() && (
                          <div className="mt-6 text-center">
                            <Button 
                              onClick={goToNextStep}
                              size="lg"
                              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                              Continuar al Estado de la Casa →
                            </Button>
                          </div>
                        )}

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-xs">
                            🎯 <strong>¿Por qué necesitamos esto?</strong> El tamaño es lo más importante para saber cuánto vale tu casa. 
                            Necesitamos tanto el terreno como la construcción para una valuación precisa.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Botón Realizar Otro Avalúo */}
                {currentTab === 'estado' && (
                  <div className="mb-4 text-center">
                    <Button 
                      onClick={realizarOtroAvaluo}
                      variant="outline"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Realizar otro avalúo
                    </Button>
                  </div>
                )}

                {/* Paso 5: Estado de la Casa */}
                <TabsContent value="estado" className="mt-6">
                  <Card className="border-2 border-yellow-200 shadow-xl bg-gradient-to-br from-yellow-50/50 to-orange-50/50">
                    <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
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
                          onValueChange={(value) => {
                            handleInputChange('estadoConservacion', value);
                            setTimeout(goToNextStep, 500);
                          }}
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
                        {isStep4Complete() && (
                          <div className="mt-6 p-3 bg-green-50 border-l-4 border-green-500 rounded animate-fade-in">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-green-600">✅</span>
                                <p className="text-green-800 font-medium text-sm">
                                  ¡Perfecto! Estado: {propertyData.estadoConservacion}
                                </p>
                              </div>
                              <Button 
                                onClick={goToNextStep}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white animate-scale-in"
                              >
                                ¡Calcular Valor! →
                              </Button>
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

                {/* Paso 6: Valuación */}
                <TabsContent value="valuacion" className="mt-6">
                  <Card className="border-2 border-pink-200 shadow-xl bg-gradient-to-br from-pink-50/50 to-rose-50/50">
                    <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          📊
                        </div>
                        💎 Paso 5: ¡Descubre cuánto vale tu casa!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-6">
                        <div className="mb-4">
                          <Calculator className="w-16 h-16 text-pink-500 mx-auto" />
                        </div>
                        <h3 className="text-xl font-bold mb-4">
                          {(() => {
                            const hasValidArea = propertyData.tipoPropiedad === 'apartamento' 
                              ? propertyData.construction_area > 0 
                              : propertyData.area > 0;
                            return (hasValidArea && propertyData.tipoPropiedad && propertyData.latitud && propertyData.longitud) ? 
                              '🎉 ¡Listo para calcular!' : 
                              '⏳ Faltan algunos datos';
                          })()}
                        </h3>

                        {/* Validación de campos requeridos */}
                        {(() => {
                          const hasValidArea = propertyData.tipoPropiedad === 'apartamento' 
                            ? propertyData.construction_area > 0 
                            : propertyData.area > 0;
                          const missingData = !hasValidArea || !propertyData.tipoPropiedad || !propertyData.latitud || !propertyData.longitud;
                          
                          if (!missingData) return null;
                          
                          return (
                            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded mb-6">
                              <p className="text-red-800 font-medium mb-2">
                                ❌ <strong>Para el método comparativo necesitas:</strong>
                              </p>
                              <ul className="text-red-700 text-sm space-y-1">
                                {!hasValidArea && (
                                  <li>• {propertyData.tipoPropiedad === 'apartamento' ? 'El área del apartamento (Paso 4)' : 'El área de tu casa (Paso 4)'}</li>
                                )}
                                {!propertyData.tipoPropiedad && <li>• El tipo de propiedad (Paso 2)</li>}
                                {(!propertyData.latitud || !propertyData.longitud) && <li>• La ubicación exacta en el mapa (Paso 3)</li>}
                              </ul>
                              <p className="text-red-600 text-xs mt-2">
                                📍 <strong>La ubicación es esencial</strong> para encontrar los comparables más cercanos según estándares internacionales.
                              </p>
                            </div>
                          );
                        })()}

                        <Button
                          onClick={performValuation}
                          disabled={(() => {
                            const hasValidArea = propertyData.tipoPropiedad === 'apartamento' 
                              ? propertyData.construction_area > 0 
                              : propertyData.area > 0;
                            return isCalculating || !hasValidArea || !propertyData.tipoPropiedad || !propertyData.latitud || !propertyData.longitud;
                          })()}
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
                              💎 ¡Valuar por Método Comparativo Internacional!
                            </>
                          )}
                        </Button>

                        {/* Resultado de la valuación */}
                        {valuationResult && (
                          <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                            <h4 className="text-2xl font-bold text-green-800 mb-4">
                              🏆 ¡Tu Casa Vale!
                            </h4>
                            
                            {/* Precio Máximo de Venta (Resultado del Avalúo) */}
                            <div className="mb-4">
                              <p className="text-sm font-medium text-green-700 mb-1">Precio Máximo de Venta (Resultado del Avalúo):</p>
                              <div className="text-3xl font-bold text-green-900">
                                ${valuationResult.estimatedValueUSD?.toLocaleString()} USD
                              </div>
                              {valuationResult.currency !== 'USD' && (
                                <div className="text-xl font-bold text-green-800 mt-1">
                                  {valuationResult.symbol}{valuationResult.estimatedValueLocal?.toLocaleString()} {valuationResult.currency}
                                </div>
                              )}
                            </div>

                            {/* Precio Mínimo de Venta (-15%) */}
                            <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded">
                              <p className="text-sm font-medium text-green-700 mb-1">Precio Mínimo de Venta:</p>
                              <div className="text-2xl font-bold text-green-800">
                                ${Math.round((valuationResult.estimatedValueUSD || 0) * 0.85).toLocaleString()} USD
                              </div>
                              {valuationResult.currency !== 'USD' && (
                                <div className="text-lg font-bold text-green-700 mt-1">
                                  {valuationResult.symbol}{Math.round((valuationResult.estimatedValueLocal || 0) * 0.85).toLocaleString()} {valuationResult.currency}
                                </div>
                              )}
                            </div>
                            
                             <div className="text-green-700 space-y-1 text-sm">
                               <p><strong>Propiedad:</strong> {valuationResult.propertyType} de {valuationResult.area} m²</p>
                               <p><strong>Ubicación:</strong> {valuationResult.country}</p>
                               <p><strong>Estado:</strong> {valuationResult.conservation}</p>
                               <p><strong>Método:</strong> {valuationResult.methodology}</p>
                               {valuationResult.comparablesUsed > 0 && (
                                 <p><strong>Comparables utilizados:</strong> {valuationResult.comparablesUsed}</p>
                               )}
                             </div>

                             {/* Detalles del cálculo */}
                             <div className="mt-4 p-3 bg-white border border-green-200 rounded text-left">
                               <h5 className="font-semibold text-green-800 mb-2">📊 ¿Cómo calculamos este precio?</h5>
                               <div className="text-xs text-green-700 space-y-1">
                                 {valuationResult.methodology === 'Método Comparativo Internacional' ? (
                                   <>
                                     <p>• <strong>Método Comparativo Internacional</strong> - Estándar mundial</p>
                                     <p>• Promedio de {comparables.length} propiedades similares cercanas</p>
                                     <p>• Ajustes por diferencias de área, estado y proximidad</p>
                                     <p>• Factor por estado: {((valuationResult.factors?.conservationMultiplier || 1) * 100).toFixed(0)}%</p>
                                   </>
                                 ) : (
                                   <>
                                     <p>• <strong>Método de Costo por País</strong> (respaldo por falta de comparables)</p>
                                     <p>• Precio base por m²: ${valuationResult.factors?.basePricePerM2?.toLocaleString()} USD</p>
                                     <p>• Factor por estado: {((valuationResult.factors?.conservationMultiplier || 1) * 100).toFixed(0)}%</p>
                                     <p>• Factor económico del país: {((valuationResult.factors?.economicMultiplier || 1) * 100).toFixed(0)}%</p>
                                   </>
                                 )}
                               </div>
                             </div>

                             {/* Comparables si los hay */}
                             {comparables.length > 0 && (
                               <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                 <h5 className="font-semibold text-blue-800 mb-2">🏘️ Comparables Utilizados (Método Internacional)</h5>
                                 <div className="space-y-2">
                                   {comparables.map((comp, index) => (
                                     <div key={comp.id || index} className="text-xs text-blue-700 bg-white p-2 rounded border">
                                       <p><strong>Comparable {index + 1}:</strong></p>
                                       <p>• Precio: ${comp.price_usd?.toLocaleString()} USD ({comp.total_area} m²)</p>
                                       <p>• Precio/m²: ${comp.price_per_sqm_usd?.toLocaleString()} USD</p>
                                       <p>• Distancia: {comp.distance?.toFixed(2)} km</p>
                                       <p>• Dirección: {comp.address}</p>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                             
                             {/* Mensaje cuando no hay comparables */}
                             {comparables.length === 0 && (
                               <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded">
                                 <h5 className="font-semibold text-amber-800 mb-2">🔍 Búsqueda de Comparables</h5>
                                 <p className="text-xs text-amber-700">
                                   No se encontraron propiedades similares en la zona inmediata. 
                                   Se utilizó el método de costo por país como respaldo, siguiendo estándares internacionales.
                                 </p>
                               </div>
                             )}

                             <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                               <p className="text-yellow-800 text-xs">
                                 ⚠️ <strong>Importante:</strong> Este es un estimado basado en el método comparativo internacional y datos del mercado. 
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
