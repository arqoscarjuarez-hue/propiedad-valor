import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp, FileText, Download, Trash2, Play, Info, Share2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';

import jsPDF from 'jspdf';
import { 
  Document as DocxDocument, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table as DocxTable, 
  TableCell as DocxTableCell, 
  TableRow as DocxTableRow,
  ImageRun,
  AlignmentType 
} from 'docx';
import { saveAs } from 'file-saver';

import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import LocationMap from './LocationMap';
import GoogleLocationMap from './GoogleLocationMap';
import SupabaseGoogleLocationMap from './SupabaseGoogleLocationMap';
import SimpleLocationMap from './SimpleLocationMap';
import CurrencySelector, { Currency, formatCurrency } from './CurrencySelector';
import { ShareButtons } from './ShareButtons';
import { indexTranslations } from '@/translations/indexTranslations';

import { sanitizeNumericInput } from '@/utils/validation';
import { getLandSizeFactor } from '@/utils/landSizeAdjustment';

type Language = keyof typeof indexTranslations;

interface PropertyData {
  // Áreas
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  
  // Tipo de propiedad
  tipoPropiedad: string;
  
  // Características
  ubicacion: string;
  estadoGeneral: string;
  
  
  // Características específicas de terreno
  topografia?: string;
  tipoValoracion?: string;
  
  // Ubicación geográfica
  latitud?: number;
  longitud?: number;
  direccionCompleta?: string;
  
  // Método de la renta
  alquiler?: number;
}

interface ComparativeProperty {
  id: string;
  address: string;
  areaConstruida: number;
  areaTerreno: number;
  tipoPropiedad: string;
  
  ubicacion: string;
  estadoGeneral: string;
  precio: number;
  distancia?: number; // en metros
  descripcion?: string;
  url?: string;
  latitud?: number;
  longitud?: number;
  lat?: number;
  lng?: number;
  isReal?: boolean;
  rating?: number;
  // Campos específicos para terrenos
  topografia?: string;
  tipoValoracion?: string;
}

const PropertyValuation = () => {
  
  const { selectedLanguage } = useLanguage();
  const t = indexTranslations[selectedLanguage];
  
  // Función para obtener la ubicación del usuario
  const getUserLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      console.log('Iniciando detección de ubicación...');
      
      if (!navigator.geolocation) {
        console.log('Geolocalización no disponible');
        resolve({ lat: 19.4326, lng: -99.1332 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log('Ubicación detectada:', lat, lng);
          resolve({ lat, lng });
        },
        (error) => {
          console.log('Error obteniendo ubicación:', error);
          resolve({ lat: 19.4326, lng: -99.1332 });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };

  // Estado inicial
  const [propertyData, setPropertyData] = useState<PropertyData>({
    areaSotano: 0,
    areaPrimerNivel: 0,
    areaSegundoNivel: 0,
    areaTercerNivel: 0,
    areaCuartoNivel: 0,
    areaTerreno: 0,
    tipoPropiedad: '',
    ubicacion: '',
    estadoGeneral: ''
  });

  const [activeTab, setActiveTab] = useState('ubicacion');
  const [valuation, setValuation] = useState<number | null>(null);
  const [baseValuation, setBaseValuation] = useState<number | null>(null);
  const [comparativeProperties, setComparativeProperties] = useState<ComparativeProperty[]>([]);
  const [selectedComparatives, setSelectedComparatives] = useState<ComparativeProperty[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    rate: 1
  });
  const [adjustmentPercentage, setAdjustmentPercentage] = useState(0);
  const [finalAdjustedValue, setFinalAdjustedValue] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapMode, setMapMode] = useState<'view' | 'edit'>('view');

  // Inicialización de ubicación del usuario
  useEffect(() => {
    const initializeLocation = async () => {
      console.log('Inicializando ubicación del usuario...');
      const location = await getUserLocation();
      console.log('Ubicación inicial obtenida:', location);
      
      setPropertyData(prev => ({
        ...prev,
        latitud: location.lat,
        longitud: location.lng
      }));
      
      console.log(`Sistema configurado en: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    };

    initializeLocation();
  }, []);

  // Función para manejar cambios en los datos
  const handleInputChange = (field: keyof PropertyData, value: any) => {
    const newData = { ...propertyData, [field]: value };
    setPropertyData(newData);
    
    // Limpiar valuación cuando se cambian datos importantes
    if (['tipoPropiedad', 'areaPrimerNivel', 'areaTerreno', 'ubicacion'].includes(field)) {
      setValuation(null);
      setBaseValuation(null);
      setComparativeProperties([]);
      setSelectedComparatives([]);
      setFinalAdjustedValue(null);
    }
  };

  // Función para manejar cambios de moneda
  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    console.log(`${t.currencyChanged}: ${currency.name}`);
  };

  // Función de conversión de moneda
  const convertCurrency = (amount: number, targetCurrency: Currency): number => {
    const baseAmountInUSD = amount; // Asumiendo que el valor base está en USD
    return baseAmountInUSD * targetCurrency.rate;
  };

  // Función para calcular el valor base usando el método de costo
  const calculateBaseValue = () => {
    const areaTotal = (propertyData.areaSotano || 0) + 
                     (propertyData.areaPrimerNivel || 0) + 
                     (propertyData.areaSegundoNivel || 0) + 
                     (propertyData.areaTercerNivel || 0) + 
                     (propertyData.areaCuartoNivel || 0);

    if (propertyData.tipoPropiedad === 'terreno') {
      // Valuación de terreno
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
    } else {
      // Valuación de construcción
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
    }
  };

  // Validación de datos mínimos
  const validateMinimumData = () => {
    if (!propertyData.tipoPropiedad) {
      console.error(t.errorMinimumArea);
      return false;
    }

    if (propertyData.tipoPropiedad !== 'terreno') {
      const areaTotal = (propertyData.areaSotano || 0) + 
                       (propertyData.areaPrimerNivel || 0) + 
                       (propertyData.areaSegundoNivel || 0) + 
                       (propertyData.areaTercerNivel || 0) + 
                       (propertyData.areaCuartoNivel || 0);
      
      if (areaTotal <= 0) {
        console.error(t.errorMinimumArea);
        return false;
      }
    }

    if (!propertyData.areaTerreno || propertyData.areaTerreno <= 0) {
      console.error(t.errorMinimumArea);
      return false;
    }

    return true;
  };

  // Función principal de cálculo
  const calculateValuation = async () => {
    if (!validateMinimumData()) {
      return;
    }

    setIsCalculating(true);
    
    try {
      console.log(t.generatingReport);
      
      // Calcular valor base
      const baseValue = calculateBaseValue();
      setBaseValuation(baseValue);
      
      // Generar propiedades comparativas
      const comparatives = await generateComparativeProperties(baseValue);
      setComparativeProperties(comparatives);
      
      // Seleccionar las primeras 3 para el avalúo
      const selectedForValuation = comparatives.slice(0, 3);
      setSelectedComparatives(selectedForValuation);
      
      // Calcular valor ajustado con comparables
      const adjustedValue = calcularValorConComparables(baseValue, selectedForValuation);
      
      setValuation(adjustedValue);
      setFinalAdjustedValue(adjustedValue);
      
      console.log(`${t.valuationCompleted}: ${formatCurrency(convertCurrency(baseValue, selectedCurrency), selectedCurrency)}`);
      
    } catch (error) {
      console.error('Error en el cálculo:', error);
      console.error(t.errorCalculatingValuation);
    } finally {
      setIsCalculating(false);
    }
  };

  // Función para generar propiedades comparativas
  const generateComparativeProperties = async (baseValue: number): Promise<ComparativeProperty[]> => {
    const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
    
    // Buscar propiedades reales cercanas
    let nearbyProperties: any[] = [];
    if (propertyData.latitud && propertyData.longitud) {
      nearbyProperties = await searchNearbyProperties(
        propertyData.latitud,
        propertyData.longitud,
        propertyData.tipoPropiedad,
        10
      );
    }
    
    // Si no hay suficientes propiedades reales, usar direcciones simuladas
    if (nearbyProperties.length < 10 && propertyData.latitud && propertyData.longitud) {
      const fallbackAddresses = await generateNearbyAddresses(
        propertyData.latitud,
        propertyData.longitud,
        10 - nearbyProperties.length
      );
      nearbyProperties = [...nearbyProperties, ...fallbackAddresses];
    }
    
    // Asegurar que tenemos al menos 10 direcciones
    if (nearbyProperties.length < 10) {
      const fallbackAddresses = await generateNearbyAddresses(
        propertyData.latitud || 19.4326,
        propertyData.longitud || -99.1332,
        10
      );
      nearbyProperties = fallbackAddresses;
    }
    
    // Generar comparables basados en las direcciones encontradas
    const comparables = nearbyProperties.slice(0, 10).map((addressInfo, index) => {
      try {
        // Variaciones de precio (±15%)
        const variation = (Math.random() - 0.5) * 0.3;
        
        // Generar un tipo de propiedad similar o igual
        const propertyTypes = ['casa', 'departamento', 'comercial', 'bodega'];
        let tipoComparable = propertyData.tipoPropiedad;
        
        // 70% probabilidad de mantener el mismo tipo, 30% tipo similar
        if (Math.random() > 0.7) {
          const currentIndex = propertyTypes.indexOf(propertyData.tipoPropiedad);
          const similarTypes = propertyTypes.filter((_, i) => i !== currentIndex);
          tipoComparable = similarTypes[Math.floor(Math.random() * similarTypes.length)] || propertyData.tipoPropiedad;
        }
        
        // Generar variaciones de área basadas en el tipo de propiedad
        const getPropertyVariations = (tipo: string) => {
          switch (tipo) {
            case 'casa':
              return {
                areaVariation: 0.7 + (Math.random() * 0.6), // 70% a 130%
                terrenoVariation: 0.8 + (Math.random() * 0.4) // 80% a 120%
              };
            case 'departamento':
              return {
                areaVariation: 0.6 + (Math.random() * 0.8), // 60% a 140%
                terrenoVariation: 1.0 // Igual área construida para departamentos
              };
            case 'comercial':
              return {
                areaVariation: 0.5 + (Math.random() * 1.0), // 50% a 150%
                terrenoVariation: 0.7 + (Math.random() * 0.6) // 70% a 130%
              };
            default:
              return {
                areaVariation: 0.6 + (Math.random() * 0.8),
                terrenoVariation: 0.8 + (Math.random() * 0.4)
              };
          }
        };
        
        const variations = getPropertyVariations(tipoComparable);
        
        // Aplicar variaciones
        const areaComparable = Math.round(areaTotal * variations.areaVariation);
        const terrenoComparable = Math.round(propertyData.areaTerreno * variations.terrenoVariation);
        
        return {
          id: `comp-${index + 1}`,
          address: addressInfo.address,
          areaConstruida: areaComparable,
          areaTerreno: terrenoComparable,
          tipoPropiedad: tipoComparable,
          ubicacion: propertyData.ubicacion,
          estadoGeneral: propertyData.estadoGeneral,
          precio: convertCurrency(baseValue * (1 + variation) * 0.85, selectedCurrency),
          distancia: addressInfo.distance,
          descripcion: `${tipoComparable} de ${areaComparable}m². ${addressInfo.isReal ? 'Propiedad real encontrada en Google Maps' : 'Propiedad simulada'}.`,
          url: addressInfo.placeId ? `https://www.google.com/maps/place/?q=place_id:${addressInfo.placeId}` : `https://propiedades.com/inmueble/${Math.random().toString(36).substr(2, 9)}`,
          latitud: addressInfo.lat,
          longitud: addressInfo.lng
        };
      } catch (error) {
        console.error('Error procesando comparable:', error);
        const isTerreno = propertyData.tipoPropiedad === 'terreno';
        const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
        
        return {
          id: `fallback-comp-${index + 1}`,
          address: `${isTerreno ? 'Terreno' : 'Propiedad'} ${index + 1}`,
          areaConstruida: isTerreno ? 0 : areaTotal,
          areaTerreno: propertyData.areaTerreno,
          tipoPropiedad: propertyData.tipoPropiedad,
          ubicacion: propertyData.ubicacion,
          estadoGeneral: isTerreno ? 'nuevo' : propertyData.estadoGeneral,
          ...(isTerreno && {
            topografia: propertyData.topografia || 'plano',
            tipoValoracion: propertyData.tipoValoracion || 'residencial'
          }),
          precio: convertCurrency(baseValue * 0.85, selectedCurrency),
          distancia: 500 + (index * 100),
          descripcion: `${isTerreno ? 'Terreno' : 'Propiedad'} comparable básica ${index + 1}`,
          url: '#',
          latitud: addressInfo.lat,
          longitud: addressInfo.lng
        };
      }
    });
    
    return Promise.resolve(comparables);
  };

  // Función para buscar propiedades cercanas usando Google Maps
  const searchNearbyProperties = async (lat: number, lng: number, propertyType: string, numResults: number = 10) => {
    try {
      const propertyTypeQueries = {
        'casa': 'casas en venta',
        'departamento': 'apartamentos en venta',
        'terreno': 'terrenos en venta',
        'comercial': 'locales comerciales en venta',
        'bodega': 'bodegas en venta'
      };
      
      const query = propertyTypeQueries[propertyType as keyof typeof propertyTypeQueries] || 'propiedades en venta';
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout - búsqueda muy lenta')), 8000)
      );
      
      const searchPromise = supabase.functions.invoke('google-maps', {
        body: {
          action: 'places-search',
          data: {
            query: query,
            lat: lat,
            lng: lng,
            radius: 2000
          }
        }
      });
      
      const response = await Promise.race([searchPromise, timeoutPromise]);

      if ((response as any)?.data?.results && (response as any).data.results.length > 0) {
        return (response as any).data.results.slice(0, numResults).map((place: any, index: number) => ({
          id: `real-${index + 1}`,
          address: place.name || place.vicinity || `Propiedad ${index + 1}`,
          distance: place.geometry?.location ? 
            calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng) :
            Math.round(Math.random() * 2000),
          lat: place.geometry?.location?.lat || lat + (Math.random() - 0.5) * 0.01,
          lng: place.geometry?.location?.lng || lng + (Math.random() - 0.5) * 0.01,
          placeId: place.place_id,
          rating: place.rating,
          isReal: true
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.warn('Error al buscar propiedades cercanas, usando datos simulados:', error);
      return [];
    }
  };

  // Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000; // Radio de la Tierra en metros
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
  };

  // Función para generar direcciones cercanas usando geocodificación inversa (fallback)
  const generateNearbyAddresses = async (lat: number, lng: number, numComparables: number = 3) => {
    const addresses = [];
    const radiusKm = 2; // Radio de 2 km para buscar comparativos
    
    for (let i = 0; i < numComparables; i++) {
      // Generar coordenadas aleatorias dentro del radio
      const randomBearing = Math.random() * 2 * Math.PI;
      const randomDistance = Math.random() * radiusKm;
      
      // Convertir a coordenadas geográficas
      const earthRadius = 6371; // Radio de la Tierra en km
      const deltaLat = (randomDistance / earthRadius) * (180 / Math.PI);
      const deltaLng = (randomDistance / earthRadius) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
      
      const newLat = lat + (deltaLat * Math.cos(randomBearing));
      const newLng = lng + (deltaLng * Math.sin(randomBearing));
      
      addresses.push({
        address: `Propiedad cercana ${i + 1} (${randomDistance.toFixed(1)} km)`,
        distance: Math.round(randomDistance * 1000),
        lat: newLat,
        lng: newLng,
        isReal: false
      });
    }
    
    return addresses;
  };

  // Función para calcular el valor ajustado basado en comparables
  const calcularValorConComparables = (valorBase: number, comparables: ComparativeProperty[]): number => {
    if (comparables.length === 0) return valorBase;
    
    // Calcular precio promedio de comparables
    const precioPromedioComparables = comparables.reduce((sum, comp) => sum + comp.precio, 0) / comparables.length;
    
    // Calcular factor de ajuste basado en comparables (60% valor calculado + 40% promedio comparables)
    const factorAjuste = 0.6;
    const valorAjustadoPorComparables = (valorBase * factorAjuste) + (precioPromedioComparables * (1 - factorAjuste));
    
    return valorAjustadoPorComparables;
  };

  // Función para validar el progreso paso a paso
  const getStepCompletion = () => {
    // Paso 1: Ubicación
    const hasValidCoordinates = propertyData.latitud && propertyData.longitud && 
                                (propertyData.latitud !== 0 || propertyData.longitud !== 0);
    const step1Complete = hasValidCoordinates;
    
    // Paso 2: Tipo de propiedad
    const step2Complete = propertyData.tipoPropiedad && propertyData.tipoPropiedad !== '';
    
    // Paso 3: Áreas
    const hasValidLandArea = propertyData.tipoPropiedad === 'departamento' ? true : (propertyData.areaTerreno && propertyData.areaTerreno > 0);
    let hasValidBuiltArea = true;
    if (propertyData.tipoPropiedad !== 'terreno') {
      hasValidBuiltArea = (
        (propertyData.areaSotano || 0) +
        (propertyData.areaPrimerNivel || 0) +
        (propertyData.areaSegundoNivel || 0) +
        (propertyData.areaTercerNivel || 0) +
        (propertyData.areaCuartoNivel || 0)
      ) > 0;
    }
    const step3Complete = hasValidLandArea && hasValidBuiltArea;
    
    // Paso 4: Características  
    const hasValidLocation = propertyData.ubicacion && propertyData.ubicacion.trim() !== '';
    const step4Complete = hasValidLocation;
    
    // Paso 5: Valuación
    const step5Complete = valuation && valuation > 0;
    
    return {
      step1: step1Complete,
      step2: step2Complete && step1Complete,
      step3: step3Complete && step2Complete,
      step4: step4Complete && step3Complete,
      step5: step5Complete && step4Complete,
      allComplete: step5Complete
    };
  };

  const adjustValue = (percentage: number) => {
    if (!baseValuation) return;
    
    const adjustmentAmount = baseValuation * (percentage / 100);
    const newValue = baseValuation + adjustmentAmount;
    
    setFinalAdjustedValue(newValue);
    setAdjustmentPercentage(percentage);
    
    console.log(`${t.priceAdjusted}: ${percentage > 0 ? '+' : ''}${percentage}%`);
  };

  const regenerateComparatives = async () => {
    if (!baseValuation) return;
    
    try {
      console.log("Generando nuevas propiedades cercanas...");
      
      const newComparables = await generateComparativeProperties(baseValuation);
      setComparativeProperties(newComparables);
      setSelectedComparatives(newComparables.slice(0, 3));
      
      console.log(t.newComparativesGenerated);
    } catch (error) {
      console.error("Error al generar nuevas comparativas");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-2 sm:p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
        
        {/* Header Principal */}
        <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-2xl">
          <CardHeader className="relative pb-8 sm:pb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-transparent" />
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm">
                    <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold">
                      {t.propertyValuator}
                    </CardTitle>
                    <p className="text-sm sm:text-base text-primary-foreground/80 mt-1">
                      {t.professionalSystem}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                    <LanguageSelector />
                  </div>
                  
                  {/* Demo button */}
                   <Button
                      variant="secondary" 
                      size="sm" 
                      className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/20 text-xs sm:text-sm"
                    >
                      <Play className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      {t.viewDemo}
                    </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Panel Principal de Datos */}
        <Card className="shadow-xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              {t.propertyData}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Tabs value={activeTab} onValueChange={(newValue) => {
              try {
                setActiveTab(newValue);
              } catch (error) {
                console.error('Error changing tab:', error);
              }
            }} className="w-full">
              <TabsList className="grid w-full md:grid-cols-5 grid-cols-2 h-auto gap-1 bg-muted/50">
                 <TabsTrigger 
                   value="ubicacion" 
                   className={`flex flex-col items-center justify-center p-2 sm:p-3 h-14 sm:h-16 text-xs sm:text-sm transition-all duration-200 md:col-span-1 col-span-1 ${
                     getStepCompletion().step1 
                       ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
                       : 'hover:bg-muted/80'
                   }`}
                 >
                   <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
                   <span className="hidden sm:inline">{t.location}</span>
                   <span className="sm:hidden">Ubicación</span>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="tipo" 
                   className={`flex flex-col items-center justify-center p-2 sm:p-3 h-14 sm:h-16 text-xs sm:text-sm transition-all duration-200 md:col-span-1 col-span-1 ${
                     getStepCompletion().step2 
                       ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
                       : getStepCompletion().step1 
                         ? 'hover:bg-muted/80' 
                         : 'opacity-50 cursor-not-allowed'
                   }`}
                   disabled={!getStepCompletion().step1}
                 >
                   <Home className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
                   <span className="hidden sm:inline">{t.propertyType}</span>
                   <span className="sm:hidden">Tipo</span>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="areas" 
                   className={`flex flex-col items-center justify-center p-2 sm:p-3 h-14 sm:h-16 text-xs sm:text-sm transition-all duration-200 md:col-span-1 col-span-1 ${
                     getStepCompletion().step3 
                       ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
                       : getStepCompletion().step2 
                         ? 'hover:bg-muted/80' 
                         : 'opacity-50 cursor-not-allowed'
                   }`}
                   disabled={!getStepCompletion().step2}
                 >
                   <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
                   <span className="hidden sm:inline">{t.areas}</span>
                   <span className="sm:hidden">Áreas</span>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="caracteristicas" 
                   className={`flex flex-col items-center justify-center p-2 sm:p-3 h-14 sm:h-16 text-xs sm:text-sm transition-all duration-200 md:col-span-1 col-span-1 ${
                     getStepCompletion().step4 
                       ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' 
                       : getStepCompletion().step3 
                         ? 'hover:bg-muted/80' 
                         : 'opacity-50 cursor-not-allowed'
                   }`}
                   disabled={!getStepCompletion().step3}
                 >
                   <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mb-1" />
                   <span className="hidden sm:inline">{t.characteristics}</span>
                   <span className="sm:hidden">Características</span>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="valuacion" 
                   disabled={!getStepCompletion().step4}
                   className={`flex flex-col items-center justify-center p-2 sm:p-3 h-14 sm:h-16 text-xs sm:text-sm transition-all duration-200 md:col-span-1 col-span-2 ${
                     !getStepCompletion().step4 
                       ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                       : getStepCompletion().step5
                         ? 'bg-green-100 dark:bg-green-900 hover:bg-green-200 dark:hover:bg-green-800 data-[state=active]:bg-green-500 data-[state=active]:text-white'
                         : 'bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                   }`}
                 >
                   <span className="font-bold mr-1">
                     {getStepCompletion().step5 ? '✓' : '5'}
                   </span> 
                   <span className="hidden sm:inline">{t.calculate}</span>
                   <span className="sm:hidden">Calcular</span>
                 </TabsTrigger>
                </TabsList>

                {/* Ubicación Tab */}
                <TabsContent value="ubicacion" className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t.locationSketch}</h3>
                  
                  {/* Instrucciones */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {t.mapInstructions}
                    </p>
                  </div>
                  
                  {/* Controles del mapa */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      variant={mapMode === 'view' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMapMode('view')}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {t.viewMap}
                    </Button>
                    <Button
                      variant={mapMode === 'edit' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMapMode('edit')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {t.editData}
                    </Button>
                  </div>

                  {mapMode === 'view' ? (
                    <div className="space-y-4">
                      {/* Información actual */}
                      {propertyData.direccionCompleta && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium">{t.registeredAddress}</p>
                          <p className="text-sm text-muted-foreground">{propertyData.direccionCompleta}</p>
                        </div>
                      )}
                      
                      {propertyData.latitud && propertyData.longitud && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium">{t.coordinates}</p>
                          <p className="text-sm text-muted-foreground">
                            {propertyData.latitud.toFixed(6)}, {propertyData.longitud.toFixed(6)}
                          </p>
                        </div>
                      )}
                      
                      {/* Mapa */}
                      <div className="h-64 sm:h-80 bg-muted rounded-lg overflow-hidden">
                        <SupabaseGoogleLocationMap
                          initialLat={propertyData.latitud}
                          initialLng={propertyData.longitud}
                          onLocationChange={(lat, lng, address) => {
                            handleInputChange('latitud', lat);
                            handleInputChange('longitud', lng);
                            if (address) {
                              handleInputChange('direccionCompleta', address);
                            }
                          }}
                          
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{t.editLocationInstructions}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="direccionCompleta">{t.fullAddress}</Label>
                          <Input
                            id="direccionCompleta"
                            value={propertyData.direccionCompleta || ''}
                            onChange={(e) => handleInputChange('direccionCompleta', e.target.value)}
                            placeholder={t.fullAddressPlaceholder}
                          />
                        </div>
                        
                        <p className="text-xs text-muted-foreground">{t.coordinatesNote}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="latitud">{t.latitude}</Label>
                            <Input
                              id="latitud"
                              type="number"
                              step="any"
                              value={propertyData.latitud || ''}
                              onChange={(e) => handleInputChange('latitud', parseFloat(e.target.value) || 0)}
                              placeholder={t.latitudePlaceholder}
                            />
                          </div>
                          <div>
                            <Label htmlFor="longitud">{t.longitude}</Label>
                            <Input
                              id="longitud"
                              type="number"
                              step="any"
                              value={propertyData.longitud || ''}
                              onChange={(e) => handleInputChange('longitud', parseFloat(e.target.value) || 0)}
                              placeholder={t.longitudePlaceholder}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navegación */}
                  <div className="flex justify-between pt-4 border-t">
                    <div></div>
                    <div className="text-center">
                      {getStepCompletion().step1 ? (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ✅ <strong>Paso 1 completado</strong> - Ubicación registrada
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          📍 Seleccione o confirme la ubicación exacta
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('tipo')}
                      disabled={!getStepCompletion().step1}
                    >
                      Siguiente →
                    </Button>
                  </div>
                </TabsContent>

                {/* Tipo Tab */}
                <TabsContent value="tipo" className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t.propertyTypeTitle}</h3>
                  
                  {/* Indicador de progreso para Tipo */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('ubicacion')}
                    >
                      ← Anterior
                    </Button>
                    <div className="text-center">
                      {getStepCompletion().step2 ? (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ✅ <strong>Paso 2 completado</strong> - Tipo de propiedad seleccionado
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          🏠 Seleccione si es casa o apartamento
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('areas')}
                      disabled={!getStepCompletion().step2}
                    >
                      Siguiente →
                    </Button>
                  </div>
                  
                  <Select value={propertyData.tipoPropiedad} onValueChange={(value) => handleInputChange('tipoPropiedad', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.selectPropertyType} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">{t.house}</SelectItem>
                      <SelectItem value="departamento">{t.apartment}</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>

                {/* Áreas Tab */}
                <TabsContent value="areas" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                  {/* Mostrar áreas de construcción solo si NO es terreno */}
                  {propertyData.tipoPropiedad !== 'terreno' && (
                    <>
                      <h3 className="text-lg font-semibold text-foreground mb-4">{t.constructionAreas}</h3>
                      
                      {/* Para apartamentos, solo mostrar área total construida */}
                      {propertyData.tipoPropiedad === 'departamento' ? (
                        <div className="max-w-xs">
                          <Label htmlFor="areaPrimerNivel">{t.totalBuiltArea} ({t.sqm})</Label>
                          <Input
                            id="areaPrimerNivel"
                            type="number"
                            value={propertyData.areaPrimerNivel || ''}
                             onChange={(e) => handleInputChange('areaPrimerNivel', sanitizeNumericInput(e.target.value))}
                            placeholder="0"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Para departamentos, ingrese el área total construida
                          </p>
                        </div>
                      ) : (
                        /* Para otras propiedades, mostrar campos individuales */
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="areaSotano">{t.basement} ({t.sqm})</Label>
                            <Input
                              id="areaSotano"
                              type="number"
                              value={propertyData.areaSotano || ''}
                              onChange={(e) => handleInputChange('areaSotano', sanitizeNumericInput(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="areaPrimerNivel">{t.firstFloor} ({t.sqm})</Label>
                            <Input
                              id="areaPrimerNivel"
                              type="number"
                              value={propertyData.areaPrimerNivel || ''}
                              onChange={(e) => handleInputChange('areaPrimerNivel', sanitizeNumericInput(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="areaSegundoNivel">{t.secondFloor} ({t.sqm})</Label>
                            <Input
                              id="areaSegundoNivel"
                              type="number"
                              value={propertyData.areaSegundoNivel || ''}
                              onChange={(e) => handleInputChange('areaSegundoNivel', sanitizeNumericInput(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="areaTercerNivel">{t.thirdFloor} ({t.sqm})</Label>
                            <Input
                              id="areaTercerNivel"
                              type="number"
                              value={propertyData.areaTercerNivel || ''}
                              onChange={(e) => handleInputChange('areaTercerNivel', sanitizeNumericInput(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <Label htmlFor="areaCuartoNivel">{t.fourthFloor} ({t.sqm})</Label>
                            <Input
                              id="areaCuartoNivel"
                              type="number"
                              value={propertyData.areaCuartoNivel || ''}
                              onChange={(e) => handleInputChange('areaCuartoNivel', sanitizeNumericInput(e.target.value))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      )}
                      
                      {propertyData.tipoPropiedad !== 'departamento' && (
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm font-medium">
                            Área Total Construida: {(propertyData.areaSotano || 0) + (propertyData.areaPrimerNivel || 0) + (propertyData.areaSegundoNivel || 0) + (propertyData.areaTercerNivel || 0) + (propertyData.areaCuartoNivel || 0)} {t.sqm}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Área del terreno - no mostrar para departamentos */}
                  {propertyData.tipoPropiedad !== 'departamento' && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="areaTerreno" className="text-base font-medium">{t.landArea} ({t.sqm})</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm">{t.landAreaTooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="areaTerreno"
                        type="number"
                        value={propertyData.areaTerreno || ''}
                        onChange={(e) => handleInputChange('areaTerreno', sanitizeNumericInput(e.target.value))}
                        placeholder="0"
                        className="max-w-xs"
                      />
                    </div>
                  )}
                  
                  {/* Navegación paso a paso */}
                  <div className="flex justify-between pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('tipo')}
                      disabled={!getStepCompletion().step2}
                    >
                      ← Anterior
                    </Button>
                    <div className="text-center">
                      {getStepCompletion().step3 ? (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ✅ <strong>Paso 3 completado</strong> - Áreas registradas correctamente
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          🏠 Complete las áreas de construcción y terreno
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('caracteristicas')}
                      disabled={!getStepCompletion().step3}
                    >
                      Siguiente →
                    </Button>
                  </div>
                 </TabsContent>

                {/* Características Tab */}
                <TabsContent value="caracteristicas" className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{t.characteristics}</h3>
                  
                  {/* Indicador de progreso para Características */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('areas')}
                    >
                      ← Anterior
                    </Button>
                    <div className="text-center">
                      {getStepCompletion().step4 ? (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ✅ <strong>Paso 4 completado</strong> - Características registradas
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          📝 Complete la ubicación y características
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('valuacion')}
                      disabled={!getStepCompletion().step4}
                    >
                      Siguiente →
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Calidad de Ubicación */}
                    <div>
                      <Label htmlFor="ubicacion">{t.locationQuality}</Label>
                      <Select 
                        value={propertyData.ubicacion} 
                        onValueChange={(value) => handleInputChange('ubicacion', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.locationQualityPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excelente">{t.excellent}</SelectItem>
                          <SelectItem value="buena">{t.good}</SelectItem>
                          <SelectItem value="media">{t.medium}</SelectItem>
                          <SelectItem value="regular">{t.regular}</SelectItem>
                          <SelectItem value="mala">Mala</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">{t.evaluateServices}</p>
                    </div>

                    {/* Estado General */}
                    <div>
                      <Label htmlFor="estadoGeneral">{t.generalCondition}</Label>
                      <Select 
                        value={propertyData.estadoGeneral} 
                        onValueChange={(value) => handleInputChange('estadoGeneral', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t.conditionPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nuevo">{t.new}</SelectItem>
                          <SelectItem value="bueno">{t.good}</SelectItem>
                          <SelectItem value="medio">{t.medium}</SelectItem>
                          <SelectItem value="regular">{t.regular}</SelectItem>
                          <SelectItem value="reparaciones-sencillas">{t.simpleRepairs}</SelectItem>
                          <SelectItem value="reparaciones-medias">{t.mediumRepairs}</SelectItem>
                          <SelectItem value="reparaciones-importantes">{t.importantRepairs}</SelectItem>
                          <SelectItem value="danos-graves">{t.seriousDamage}</SelectItem>
                          <SelectItem value="en-desecho">{t.waste}</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">{t.affectsPropertyValue}</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Valuación Tab */}
                <TabsContent value="valuacion" className="space-y-6 mt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-foreground">{t.valuationMethodComparative}</h3>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={calculateValuation}
                        disabled={isCalculating || !getStepCompletion().step4}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {isCalculating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            {t.calculatingValuation}
                          </>
                        ) : (
                          <>
                            <Calculator className="mr-2 h-4 w-4" />
                            {t.realizarValuacion}
                          </>
                        )}
                      </Button>
                      
                      {valuation && (
                        <Button
                          onClick={regenerateComparatives}
                          variant="outline"
                          size="sm"
                        >
                          <Shuffle className="mr-2 h-4 w-4" />
                          {t.regenerate}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Resultado de Valuación */}
                  {valuation && (
                    <div className="space-y-6">
                      
                      {/* Panel de Resultado Principal */}
                      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                            <Star className="h-5 w-5" />
                            {t.valuationResultsTitle}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-green-700 dark:text-green-300 mb-2">{t.estimatedValue}</p>
                              <p className="text-3xl font-bold text-green-800 dark:text-green-200">
                                {formatCurrency(convertCurrency(finalAdjustedValue || valuation, selectedCurrency), selectedCurrency)}
                              </p>
                              {baseValuation && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  {t.basedOnComparablesText} {selectedComparatives.length} {t.comparables}
                                </p>
                              )}
                            </div>
                            
                            {/* Selector de Moneda */}
                            <div>
                              <Label className="text-sm text-green-700 dark:text-green-300">{t.currencyValuation}</Label>
                              <CurrencySelector 
                                selectedCurrency={selectedCurrency}
                                onCurrencyChange={handleCurrencyChange}
                              />
                            </div>
                          </div>

                          {/* Ajuste de Precio */}
                          {baseValuation && (
                            <div className="mt-6 pt-6 border-t border-green-200 dark:border-green-800">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="font-medium text-green-800 dark:text-green-200">{t.priceAdjustment}</h4>
                                <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                                  {adjustmentPercentage > 0 ? '+' : ''}{adjustmentPercentage}%
                                </Badge>
                              </div>
                              <p className="text-xs text-green-600 dark:text-green-400 mb-3">{t.adjustmentDescription}</p>
                              
                              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                {[-15, -10, -5, 5, 10, 15].map((percentage) => (
                                  <Button
                                    key={percentage}
                                    variant={adjustmentPercentage === percentage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => adjustValue(percentage)}
                                    className="text-xs"
                                  >
                                    {percentage > 0 ? '+' : ''}{percentage}%
                                  </Button>
                                ))}
                              </div>
                              
                              {adjustmentPercentage !== 0 && (
                                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-green-700 dark:text-green-300">{t.originalBaseValue}:</span>
                                    <span className="text-green-800 dark:text-green-200">{formatCurrency(convertCurrency(baseValuation, selectedCurrency), selectedCurrency)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-green-700 dark:text-green-300">{t.adjustmentLabel}:</span>
                                    <span className="text-green-800 dark:text-green-200">{adjustmentPercentage > 0 ? '+' : ''}{adjustmentPercentage}%</span>
                                  </div>
                                  <div className="flex justify-between text-sm font-medium border-t border-green-200 dark:border-green-700 pt-2 mt-2">
                                    <span className="text-green-700 dark:text-green-300">{t.newValueLabel}:</span>
                                    <span className="text-green-800 dark:text-green-200">{formatCurrency(convertCurrency(finalAdjustedValue || valuation, selectedCurrency), selectedCurrency)}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Análisis Comparativo */}
                      {selectedComparatives.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              {t.marketAnalysisTitle}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              
                              {/* Estadísticas de Comparables */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="text-sm text-muted-foreground">{t.averagePrice}</p>
                                  <p className="text-lg font-semibold">
                                    {formatCurrency(
                                      selectedComparatives.reduce((sum, comp) => sum + comp.precio, 0) / selectedComparatives.length,
                                      selectedCurrency
                                    )}
                                  </p>
                                </div>
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="text-sm text-muted-foreground">{t.minPrice}</p>
                                  <p className="text-lg font-semibold">
                                    {formatCurrency(Math.min(...selectedComparatives.map(comp => comp.precio)), selectedCurrency)}
                                  </p>
                                </div>
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="text-sm text-muted-foreground">{t.maxPrice}</p>
                                  <p className="text-lg font-semibold">
                                    {formatCurrency(Math.max(...selectedComparatives.map(comp => comp.precio)), selectedCurrency)}
                                  </p>
                                </div>
                              </div>

                              {/* Tabla de Comparables */}
                              <div className="rounded-lg border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>{t.property}</TableHead>
                                      <TableHead className="text-right">{t.builtArea}</TableHead>
                                      <TableHead className="text-right">{t.price}</TableHead>
                                      <TableHead className="text-right">{t.priceM2}</TableHead>
                                      <TableHead className="text-right">{t.distance}</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedComparatives.map((comp) => (
                                      <TableRow key={comp.id}>
                                        <TableCell>
                                          <div>
                                            <p className="font-medium">{comp.address}</p>
                                            <p className="text-xs text-muted-foreground">{comp.descripcion}</p>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">{comp.areaConstruida} {t.sqm}</TableCell>
                                        <TableCell className="text-right font-medium">
                                          {formatCurrency(comp.precio, selectedCurrency)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                          {comp.areaConstruida > 0 ? 
                                            formatCurrency(comp.precio / comp.areaConstruida, selectedCurrency) :
                                            '-'
                                          }
                                        </TableCell>
                                        <TableCell className="text-right">{comp.distancia}m</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Compartir Valuación */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Share2 className="h-5 w-5" />
                            {t.startValuation}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                    <ShareButtons />
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyValuation;