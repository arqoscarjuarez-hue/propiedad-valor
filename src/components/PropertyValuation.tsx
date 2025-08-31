import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp, FileText, Download, Camera, Trash2, Play, Info, HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import DemoWalkthrough from '@/components/DemoWalkthrough';
import { ValuationWalkthrough } from '@/components/ValuationWalkthrough';

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
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import LocationMap from './LocationMap';
import GoogleLocationMap from './GoogleLocationMap';
import SupabaseGoogleLocationMap from './SupabaseGoogleLocationMap';
import SimpleLocationMap from './SimpleLocationMap';
import CurrencySelector, { Currency, formatCurrency } from './CurrencySelector';

import PropertyComparison from './PropertyComparison';

interface Translation {
  [key: string]: string;
}

interface Translations {
  [key: string]: Translation;
}

const translations: Translations = {
  es: {
    propertyValuation: 'Valuación de Propiedad',
    propertyType: 'Tipo de Propiedad',
    house: 'Casa',
    apartment: 'Apartamento',
    land: 'Terreno',
    commercial: 'Comercial',
    rooms: 'Habitaciones',
    bathrooms: 'Baños',
    age: 'Antigüedad (años)',
    address: 'Dirección',
    valuationResults: 'Resultados de la Valuación',
    performValuation: 'Realizar Valuación',
    method: 'Método: Comparables internacionales (IVS/RICS)',
    professionalAppraisal: 'Avalúo profesional con estándares IVS/RICS',
    internationalCertification: 'Certificación internacional',
    areas: 'Áreas',
    spaces: 'Espacios',
    features: 'Características',
    location: 'Ubicación',
    propertyAreas: 'Áreas de la Propiedad',
    basementArea: 'Área del Sótano (m²)',
    firstFloorArea: 'Área del Primer Nivel (m²)',
    secondFloorArea: 'Área del Segundo Nivel (m²)',
    thirdFloorArea: 'Área del Tercer Nivel (m²)',
    fourthFloorArea: 'Área del Cuarto Nivel (m²)',
    landArea: 'Área del Terreno (m²)',
    apartmentArea: 'Área del Apartamento (m²)',
    propertySpaces: 'Espacios de la Propiedad',
    livingRooms: 'Salas',
    diningRooms: 'Comedor',
    kitchens: 'Cocina',
    storageRooms: 'Bodega',
    serviceArea: 'Área de Servicio',
    garages: 'Cochera',
    otherSpaces: 'Otros',
    propertyFeatures: 'Características de la Propiedad',
    generalCondition: 'Estado General',
    accessType: 'Tipo de Acceso',
    propertyLocation: 'Ubicación de la Propiedad',
    fullAddress: 'Dirección Completa',
    services: 'Servicios',
    water: 'Agua',
    electricity: 'Electricidad',
    gas: 'Gas',
    drainage: 'Drenaje',
    internet: 'Internet',
    cable: 'Cable',
    phone: 'Teléfono',
    security: 'Seguridad',
    pool: 'Alberca',
    garden: 'Jardín',
    elevator: 'Elevador',
    airConditioning: 'Aire Acondicionado',
    heating: 'Calefacción',
    solarPanels: 'Paneles Solares',
    waterTank: 'Tinaco',
    topography: 'Topografía',
    valuationType: 'Tipo de Valuación',
    selectPropertyType: 'Selecciona el tipo de propiedad',
    additionalInformation: 'Información Adicional',
    generalInformation: 'Información General',
    apartmentInformation: 'Apartamento',
    constructionAreaHouse: 'Área de Construcción Casa (m²)',
    enterTotalPropertyArea: 'Ingrese el área total construida de la propiedad',
    indicateLandArea: 'Indique el área del terreno donde se encuentra la construcción en metros cuadrados (m²).',
    enterTotalApartmentArea: 'Ingrese el área total del apartamento en metros cuadrados',
  },
  en: {
    propertyValuation: 'Property Valuation',
    propertyType: 'Property Type',
    house: 'House',
    apartment: 'Apartment',
    land: 'Land',
    commercial: 'Commercial',
    rooms: 'Rooms',
    bathrooms: 'Bathrooms',
    age: 'Age (years)',
    address: 'Address',
    valuationResults: 'Valuation Results',
    performValuation: 'Perform Valuation',
    method: 'Method: International comparables (IVS/RICS)',
    professionalAppraisal: 'Professional appraisal with IVS/RICS standards',
    internationalCertification: 'International certification',
    areas: 'Areas',
    spaces: 'Spaces',
    features: 'Features',
    location: 'Location',
    propertyAreas: 'Property Areas',
    basementArea: 'Basement Area (m²)',
    firstFloorArea: 'First Floor Area (m²)',
    secondFloorArea: 'Second Floor Area (m²)',
    thirdFloorArea: 'Third Floor Area (m²)',
    fourthFloorArea: 'Fourth Floor Area (m²)',
    landArea: 'Land Area (m²)',
    apartmentArea: 'Apartment Area (m²)',
    propertySpaces: 'Property Spaces',
    livingRooms: 'Living Rooms',
    diningRooms: 'Dining Room',
    kitchens: 'Kitchen',
    storageRooms: 'Storage Room',
    serviceArea: 'Service Area',
    garages: 'Garage',
    otherSpaces: 'Other',
    propertyFeatures: 'Property Features',
    generalCondition: 'General Condition',
    accessType: 'Access Type',
    propertyLocation: 'Property Location',
    fullAddress: 'Full Address',
    services: 'Services',
    water: 'Water',
    electricity: 'Electricity',
    gas: 'Gas',
    drainage: 'Drainage',
    internet: 'Internet',
    cable: 'Cable',
    phone: 'Phone',
    security: 'Security',
    pool: 'Pool',
    garden: 'Garden',
    elevator: 'Elevator',
    airConditioning: 'Air Conditioning',
    heating: 'Heating',
    solarPanels: 'Solar Panels',
    waterTank: 'Water Tank',
    topography: 'Topography',
    valuationType: 'Valuation Type',
    selectPropertyType: 'Select property type',
    additionalInformation: 'Additional Information',
    generalInformation: 'General Information',
    apartmentInformation: 'Apartment',
    constructionAreaHouse: 'Construction Area House (m²)',
    enterTotalPropertyArea: 'Enter the total built area of the property',
    indicateLandArea: 'Indicate the land area where the construction is located in square meters (m²).',
    enterTotalApartmentArea: 'Enter the total area of the apartment in square meters',
  },
};

// Estrato social latinoamericano
export type EstratoSocial = 
  | 'alto_alto'
  | 'alto_medio'
  | 'alto_bajo'
  | 'medio_alto'
  | 'medio_medio'
  | 'medio_bajo'
  | 'bajo_alto'
  | 'bajo_medio'
  | 'bajo_bajo';

export const estratoSocialLabels: Record<EstratoSocial, string> = {
  'alto_alto': 'Alto Alto',
  'alto_medio': 'Alto Medio', 
  'alto_bajo': 'Alto Bajo',
  'medio_alto': 'Medio Alto',
  'medio_medio': 'Medio Medio',
  'medio_bajo': 'Medio Bajo',
  'bajo_alto': 'Bajo Alto',
  'bajo_medio': 'Bajo Medio',
  'bajo_bajo': 'Bajo Bajo'
};

type SocialClass = 'baja' | 'media' | 'alta';

const socialClassLabels: Record<SocialClass, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
};

const estratoToClassMap: Record<EstratoSocial, SocialClass> = {
  bajo_bajo: 'baja',
  bajo_medio: 'baja',
  bajo_alto: 'baja',
  medio_bajo: 'media',
  medio_medio: 'media',
  medio_alto: 'media',
  alto_bajo: 'alta',
  alto_medio: 'alta',
  alto_alto: 'alta',
};

const classToEstratos: Record<SocialClass, EstratoSocial[]> = {
  baja: ['bajo_bajo', 'bajo_medio', 'bajo_alto'],
  media: ['medio_bajo', 'medio_medio', 'medio_alto'],
  alta: ['alto_bajo', 'alto_medio', 'alto_alto'],
};

// Multiplicadores específicos por estrato socioeconómico
const estratoMultipliers: Record<EstratoSocial, number> = {
  bajo_bajo: 0.85,    // -15%
  bajo_medio: 0.90,   // -10%
  bajo_alto: 0.95,    // -5%
  medio_bajo: 0.97,   // -3%
  medio_medio: 1.00,  // 0% (base)
  medio_alto: 1.03,   // +3%
  alto_bajo: 1.10,    // +10%
  alto_medio: 1.20,   // +20%
  alto_alto: 1.35,    // +35%
};

// Factores de depreciación por estado de conservación
const conservationFactors: Record<string, number> = {
  nuevo: 1.0000,
  bueno: 0.9968,
  medio: 0.9748,
  regular: 0.9191,
  reparaciones_sencillas: 0.8190,
  reparaciones_medias: 0.6680,
  reparaciones_importantes: 0.4740,
  danos_graves: 0.2480,
};

const classMultipliers: Record<SocialClass, number> = {
  baja: 0.9,
  media: 1.0,
  alta: 1.2,
};

const getSocialClass = (e: EstratoSocial): SocialClass => estratoToClassMap[e];

interface PropertyData {
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  areaApartamento: number;
  tipoPropiedad: string;
  estratoSocial: EstratoSocial;
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
    agua: boolean;
    electricidad: boolean;
    gas: boolean;
    drenaje: boolean;
    internet: boolean;
    cable: boolean;
    telefono: boolean;
    seguridad: boolean;
    alberca: boolean;
    jardin: boolean;
    elevador: boolean;
    aireAcondicionado: boolean;
    calefaccion: boolean;
    panelesSolares: boolean;
    tinaco: boolean;
  };
  topografia?: string;
  tipoValoracion?: string;
  // Ross-Heindecke parameters
  vidaUtil?: number;
  estadoConservacion?: string;
  mantenimiento?: number;
  obsolescenciaFuncional?: number;
  obsolescenciaTecnologica?: number;
  factorUbicacion?: number;
  factorMercado?: number;
}

interface Comparable {
  id: string;
  address: string;
  price_usd: number;
  price_per_sqm_usd: number;
  total_area: number | null;
  latitude: number | null;
  longitude: number | null;
  property_type: string | null;
  estrato_social: EstratoSocial;
  distance_km?: number;
  price_range?: string; // Nuevo campo para rangos de precio sanitizados
}

const PropertyValuation = () => {
  const { toast } = useToast();
  const { selectedLanguage } = useLanguage();
  
  // Estados para la valuación
  const [valuationResult, setValuationResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [isLoadingComparables, setIsLoadingComparables] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('areas');
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    areaSotano: 0,
    areaPrimerNivel: 0,
    areaSegundoNivel: 0,
    areaTercerNivel: 0,
    areaCuartoNivel: 0,
    areaTerreno: 0,
    areaApartamento: 0,
    tipoPropiedad: 'casa',
    estratoSocial: 'medio_medio' as EstratoSocial,
    recamaras: 0,
    salas: 0,
    comedor: 0,
    cocina: 0,
    bodega: 0,
    areaServicio: 0,
    cochera: 0,
    banos: 0,
    otros: 0,
    antiguedad: 0,
    ubicacion: '',
    estadoGeneral: '',
    estadoConservacion: '',
    tipoAcceso: '',
    latitud: 0,
    longitud: 0,
    direccionCompleta: '',
    servicios: {
      agua: false,
      electricidad: false,
      gas: false,
      drenaje: false,
      internet: false,
      cable: false,
      telefono: false,
      seguridad: false,
      alberca: false,
      jardin: false,
      elevador: false,
      aireAcondicionado: false,
      calefaccion: false,
      panelesSolares: false,
      tinaco: false,
    }
  });

  // Debug effect para encontrar el cero que aparece
  useEffect(() => {
    console.log('=== DEBUG ESTADO CONSERVACIÓN ===');
    console.log('estadoConservacion actual:', propertyData.estadoConservacion);
    console.log('Hay estado seleccionado:', !!propertyData.estadoConservacion);
  }, [propertyData.estadoConservacion]);

  const handleInputChange = (field: keyof PropertyData, value: string | number | EstratoSocial) => {
    const isStringField = ['ubicacion', 'estadoGeneral', 'estadoConservacion', 'tipoPropiedad', 'direccion', 'tipoAcceso', 'topografia', 'tipoValoracion', 'estratoSocial'].includes(field);
    
    let finalValue = value;
    if (!isStringField && typeof value === 'string') {
      const numValue = parseFloat(value);
      finalValue = isNaN(numValue) ? 0 : Math.max(0, numValue);
    }
    
    setPropertyData(current => {
      const newData = {
        ...current,
        [field]: finalValue
      };
      
      // Cuando se modifica el área de apartamento, poner a cero las áreas de construcción y terreno
      if (field === 'areaApartamento') {
        newData.areaPrimerNivel = 0;  // Este es el campo que se muestra como "Área de Construcción Casa"
        newData.areaTerreno = 0;      // Este es el campo que se muestra como "Área de Terreno Casa"
        newData.areaSotano = 0;
        newData.areaSegundoNivel = 0;
        newData.areaTercerNivel = 0;
        newData.areaCuartoNivel = 0;
      }
      
      return newData;
    });
  };

  // Funciones de validación para cada paso
  const isStep1Complete = () => {
    return propertyData.estratoSocial !== 'medio_medio' || propertyData.estratoSocial;
  };

  const isStep2Complete = () => {
    return propertyData.tipoPropiedad !== '';
  };

  const isStep3Complete = () => {
    return propertyData.direccionCompleta !== '' && propertyData.latitud !== 0 && propertyData.longitud !== 0;
  };

  const isStep4Complete = () => {
    if (propertyData.tipoPropiedad === 'apartamento') {
      return propertyData.areaApartamento > 0;
    } else if (propertyData.tipoPropiedad === 'terreno') {
      return propertyData.areaTerreno > 0;
    } else {
      return getEffectiveArea() > 0;
    }
  };

  const isStep5Complete = () => {
    if (propertyData.tipoPropiedad === 'terreno') {
      return true; // Los terrenos no necesitan paso 5
    }
    return propertyData.estadoConservacion !== '';
  };

  const getNextRequiredStep = () => {
    if (!isStep1Complete()) return 1;
    if (!isStep2Complete()) return 2;
    if (!isStep3Complete()) return 3;
    if (!isStep4Complete()) return 4;
    if (!isStep5Complete()) return 5;
    return 'valuacion'; // Paso final: realizar valuación
  };

  const canAccessTab = (tabValue: string) => {
    switch (tabValue) {
      case 'ubicacion':
        return isStep1Complete() && isStep2Complete();
      case 'areas':
        return isStep1Complete() && isStep2Complete() && isStep3Complete();
      case 'depreciacion':
        return isStep1Complete() && isStep2Complete() && isStep3Complete() && isStep4Complete();
      default:
        return true;
    }
  };

  const handleTabChange = (tabValue: string) => {
    if (canAccessTab(tabValue)) {
      setActiveTab(tabValue);
    } else {
      const nextStep = getNextRequiredStep();
      toast({
        title: "Paso requerido",
        description: `Debe completar el Paso ${nextStep} antes de continuar.`,
        variant: "destructive"
      });
    }
  };

  // Función para calcular el área efectiva para avalúo
  const getEffectiveArea = () => {
    if (propertyData.tipoPropiedad === 'apartamento') {
      // Para apartamentos, solo se necesita el área del apartamento
      return (propertyData.areaApartamento || 0);
    } else if (propertyData.tipoPropiedad === 'terreno') {
      // Para terrenos, solo se necesita el área del terreno
      return propertyData.areaTerreno || 0;
    }
    
    // Para casas y comerciales, usar la suma de áreas de construcción
    return (propertyData.areaSotano || 0) + 
           (propertyData.areaPrimerNivel || 0) + 
           (propertyData.areaSegundoNivel || 0) + 
           (propertyData.areaTercerNivel || 0) + 
           (propertyData.areaCuartoNivel || 0);
  };

  // Función para validar si hay área suficiente según el tipo de propiedad
  const hasValidArea = () => {
    console.log('Validando área para:', propertyData.tipoPropiedad);
    console.log('Área apartamento:', propertyData.areaApartamento);
    
    if (propertyData.tipoPropiedad === 'apartamento') {
      const valid = propertyData.areaApartamento > 0;
      console.log('Apartamento válido:', valid);
      return valid;
    } else if (propertyData.tipoPropiedad === 'terreno') {
      return propertyData.areaTerreno > 0;
    } else {
      // Para casas y comerciales, verificar áreas de construcción
      return getEffectiveArea() > 0;
    }
  };

  // Función actualizada para usar la función de BD con búsqueda progresiva
  const fetchComparables = async () => {
    try {
      setIsLoadingComparables(true);
      setComparables([]);

      const lat = propertyData.latitud;
      const lng = propertyData.longitud;
      const estrato = propertyData.estratoSocial;

      if (!lat || !lng) {
        // Si no hay coordenadas, solo log pero no bloquear
        console.log('Sin coordenadas para buscar comparables');
        return;
      }

      // Buscar comparables por CLASE social (Baja/Media/Alta)
      const clase = getSocialClass(estrato);
      const estratosGrupo = classToEstratos[clase];

      // Usar función pública con datos sanitizados por seguridad
      const results = await Promise.all(
        estratosGrupo.map(e => supabase.rpc('find_comparables_public', {
          target_lat: lat,
          target_lng: lng,
          target_estrato: e,
          target_property_type: propertyData.tipoPropiedad
        }))
      );

      const allData = results
        .filter((r: any) => {
          if (r.error) {
            console.error('Error fetching comparables for estrato', r);
            return false;
          }
          return Array.isArray(r.data);
        })
        .flatMap((r: any) => r.data as any[]);

      // De-duplicar por id
      const uniqueById: Record<string, any> = {};
      for (const d of allData) {
        uniqueById[d.id] = d;
      }
      const merged = Object.values(uniqueById);

      const comparablesData: Comparable[] = (merged || []).map((d: any) => ({
        id: d.id,
        address: d.general_location || d.address || 'Ubicación no disponible',
        price_usd: Number(d.price_usd || 0), // Puede ser 0 si viene de función pública
        price_per_sqm_usd: Number(d.price_per_sqm_usd || 0),
        total_area: d.total_area !== null ? Number(d.total_area) : null,
        latitude: d.approximate_latitude !== null ? Number(d.approximate_latitude) : 
                 (d.latitude !== null ? Number(d.latitude) : null),
        longitude: d.approximate_longitude !== null ? Number(d.approximate_longitude) : 
                  (d.longitude !== null ? Number(d.longitude) : null),
        property_type: d.property_type || null,
        estrato_social: d.estrato_social as EstratoSocial,
        distance_km: d.distance_km !== null ? Number(d.distance_km) : undefined,
        price_range: d.price_range // Nuevo campo para mostrar rango de precio sanitizado
      }));

      setComparables(comparablesData);

      // Mostrar toast informativo pero no bloquear
      const claseLabel = socialClassLabels[clase];
      if (comparablesData.length < 3) {
        toast({
          title: "Información de comparables",
          description: `Se encontraron ${comparablesData.length} comparables de la clase social ${claseLabel}. La valuación se basa en el método de costo.`,
        });
      } else {
        toast({
          title: "Comparables encontrados",
          description: `Se encontraron ${comparablesData.length} comparables de la misma clase social (${claseLabel})`,
        });
      }

    } catch (err) {
      console.error('Error fetching comparables:', err);
      // No mostrar error al usuario, solo continuar
    } finally {
      setIsLoadingComparables(false);
    }
  };

  // Función para calcular la valuación
  const performValuation = async () => {
    console.log('=== INICIANDO VALUACIÓN ===');
    console.log('Tipo de propiedad:', propertyData.tipoPropiedad);
    console.log('Área apartamento:', propertyData.areaApartamento);
    
    setIsCalculating(true);
    
    try {
      // Para apartamentos, validación directa y simple
      if (propertyData.tipoPropiedad === 'apartamento') {
        if (!propertyData.areaApartamento || propertyData.areaApartamento <= 0) {
          console.log('ERROR: Área de apartamento inválida');
          toast({
            title: "Error en la valuación",
            description: "Debe ingresar el área del apartamento para realizar la valuación",
            variant: "destructive"
          });
          setIsCalculating(false);
          return;
        }
        
        // Simular cálculo con delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Cálculo para apartamento: área * precio por m²
        const areaEfectiva = propertyData.areaApartamento;
        const precioM2 = 1800; // USD por m² para apartamentos
        const claseSocial = getSocialClass(propertyData.estratoSocial);
        const factorEstrato = classMultipliers[claseSocial];
        
        // Aplicar factor de conservación si está seleccionado
        const factorConservacion = propertyData.estadoConservacion 
          ? conservationFactors[propertyData.estadoConservacion] 
          : 1.0;
        
        const valorTotal = areaEfectiva * precioM2 * factorEstrato * factorConservacion;
        
        console.log('Área efectiva apartamento:', areaEfectiva);
        console.log('Factor estrato:', factorEstrato, 'Estrato:', propertyData.estratoSocial);
        console.log('Factor conservación:', factorConservacion, 'Estado:', propertyData.estadoConservacion);
        console.log('Valor total calculado:', valorTotal);
        
        setValuationResult(valorTotal);
        
        // Buscar comparables
        await fetchComparables();
        
        toast({
          title: "Valuación Completada",
          description: `Valor estimado: $${valorTotal.toLocaleString("en-US")} USD (Apartamento)`,
        });
        
        console.log('=== VALUACIÓN COMPLETADA ===');
        return;
      }
      
      // Para otros tipos de propiedad
      const effectiveArea = getEffectiveArea();
      console.log('Área efectiva otros:', effectiveArea);
      
      if (effectiveArea <= 0) {
        const areaMessage = propertyData.tipoPropiedad === 'terreno'
          ? "Debe ingresar el área del terreno para realizar la valuación"  
          : "Debe ingresar el área de construcción para realizar la valuación";
          
        console.log('ERROR: Área no válida para otros tipos');
        toast({
          title: "Error en la valuación",
          description: areaMessage,
          variant: "destructive"
        });
        setIsCalculating(false);
        return;
      }
      
      // Cálculo básico de valuación (puedes ajustar esta fórmula)
      let basePricePerM2 = 1500; // USD por m² base
      
      // Ajustes según tipo de propiedad
      if (propertyData.tipoPropiedad === 'apartamento') {
        basePricePerM2 = 1800;
      } else if (propertyData.tipoPropiedad === 'comercial') {
        basePricePerM2 = 2200;
      } else if (propertyData.tipoPropiedad === 'terreno') {
        basePricePerM2 = 800;
      }
      
      // Calcular valor total con factor por estrato social
      const claseSocial = getSocialClass(propertyData.estratoSocial);
      const factorEstrato = classMultipliers[claseSocial];
      const totalValue = effectiveArea * basePricePerM2 * factorEstrato;
      
      setValuationResult(totalValue);
      
      // Hacer scroll automático al resultado después de un breve delay
      setTimeout(() => {
        const resultElement = document.getElementById('resultado-valuacion');
        if (resultElement) {
          resultElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 500);
      
      // Buscar comparables (no bloquear si no hay suficientes)
      await fetchComparables();
      
      toast({
        title: "Valuación Completada",
        description: `Valor estimado: $${totalValue.toLocaleString("en-US")} USD (Normas UPAV/IVSC)`,
      });
      
    } catch (error) {
      console.error('Error performing valuation:', error);
      setValuationResult(null);
      setComparables([]);
      
      toast({
        title: "Error en la valuación",
        description: "Ocurrió un error al realizar la valuación. Verifique los datos e intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Función para manejar los pasos del tutorial
  const handleWalkthroughStep = (stepId: string) => {
    setHighlightedElement(stepId);
    
    // Auto-scroll al elemento resaltado después de un breve delay
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
          <div>
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Valuador Latinoamericano</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowWalkthrough(true)}
                      className="text-xs"
                    >
                      <HelpCircle className="w-3 h-3 mr-1" />
                      Tutorial
                    </Button>
                    <LanguageSelector />
                  </div>
                </div>
                <p className="text-sm text-primary-foreground/90 mt-2">
                  Siguiendo normas UPAV, IVSC y reglamentos de valuación latinoamericanos
                </p>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {/* Selector de Estrato Social */}
                <div className={`mb-6 ${highlightedElement === 'estrato-social-select' ? 'ring-4 ring-yellow-400 ring-opacity-75 rounded-lg p-2 bg-yellow-50 dark:bg-yellow-950' : ''}`} id="estrato-social-select">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="estratoSocial" className="text-base font-semibold">Paso 1</Label>
                    {isStep1Complete() && <span className="text-green-500 font-bold">✓</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">¿Cómo te consideras donde vives?</p>
                  <Select value={propertyData.estratoSocial} onValueChange={(value: EstratoSocial) => handleInputChange('estratoSocial', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecciona el estrato social" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(estratoSocialLabels) as [EstratoSocial, string][]).map(([key, label]) => {
                        return (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Requerido para encontrar comparables del mismo nivel socioeconómico según normas latinoamericanas
                  </p>
                </div>

                {/* Selector de Tipo de Propiedad */}
                <div className="mb-6" id="tipo-propiedad-select">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="tipoPropiedad" className="text-base font-semibold">Paso 2</Label>
                    {isStep2Complete() && <span className="text-green-500 font-bold">✓</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">Tipo de Propiedad</p>
                  <Select value={propertyData.tipoPropiedad} onValueChange={(value) => handleInputChange('tipoPropiedad', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecciona el tipo de propiedad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="apartamento">Apartamento</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                
                {/* Guía de pasos */}
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900 dark:text-blue-100">Guía de Pasos</span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {getNextRequiredStep() === 'valuacion'
                      ? "¡Todos los pasos están completados! Ahora debe tocar el botón 'Realizar Valuación' para obtener el resultado."
                      : getNextRequiredStep() 
                        ? `Complete el Paso ${getNextRequiredStep()} para continuar con la valuación.`
                        : "¡Todos los pasos están completados! Puede proceder con la valuación."
                    }
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((step) => {
                      if (step === 5 && propertyData.tipoPropiedad === 'terreno') return null;
                      const isComplete = (
                        (step === 1 && isStep1Complete()) ||
                        (step === 2 && isStep2Complete()) ||
                        (step === 3 && isStep3Complete()) ||
                        (step === 4 && isStep4Complete()) ||
                        (step === 5 && isStep5Complete())
                      );
                      const isCurrent = getNextRequiredStep() === step;
                      
                      return (
                        <div 
                          key={step} 
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                            isComplete 
                              ? 'bg-green-500 text-white' 
                              : isCurrent 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-300 text-gray-600'
                          }`}
                        >
                          {step}
                        </div>
                      );
                    })}
                    {/* Indicador del botón de valuación */}
                    <div className={`w-auto px-3 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      getNextRequiredStep() === 'valuacion' 
                        ? 'bg-orange-500 text-white animate-pulse' 
                        : isStep1Complete() && isStep2Complete() && isStep3Complete() && isStep4Complete() && isStep5Complete()
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      📊 Valuación
                    </div>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className={`grid w-full ${propertyData.tipoPropiedad === 'terreno' ? 'grid-cols-2' : 'grid-cols-3'} h-auto`}>
                    <TabsTrigger 
                      value="ubicacion" 
                      className={`h-8 sm:h-10 text-xs sm:text-sm ${!canAccessTab('ubicacion') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      id="ubicacion-tab"
                      disabled={!canAccessTab('ubicacion')}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Paso 3</span>
                          {isStep3Complete() && <span className="text-green-500">✓</span>}
                        </div>
                        <span className="text-xs">Ubicación</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="areas" 
                      className={`h-8 sm:h-10 text-xs sm:text-sm ${!canAccessTab('areas') ? 'opacity-50 cursor-not-allowed' : ''}`}
                      id="areas-tab"
                      disabled={!canAccessTab('areas')}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Paso 4</span>
                          {isStep4Complete() && <span className="text-green-500">✓</span>}
                        </div>
                        <span className="text-xs">Áreas</span>
                      </div>
                    </TabsTrigger>
                    {propertyData.tipoPropiedad !== 'terreno' && (
                      <TabsTrigger 
                        value="depreciacion" 
                        className={`h-8 sm:h-10 text-xs sm:text-sm ${!canAccessTab('depreciacion') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        id="depreciacion-tab"
                        disabled={!canAccessTab('depreciacion')}
                      >
                        {propertyData.estadoConservacion ? (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">Paso 5</span>
                              {isStep5Complete() && <span className="text-green-500">✓</span>}
                            </div>
                            <span className="text-xs">Depreciación</span>
                            <span className="text-[10px] font-medium text-primary">
                              {propertyData.estadoConservacion === 'nuevo' ? 'Nuevo' :
                               propertyData.estadoConservacion === 'bueno' ? 'Bueno' :
                               propertyData.estadoConservacion === 'medio' ? 'Medio' :
                               propertyData.estadoConservacion === 'regular' ? 'Regular' :
                               propertyData.estadoConservacion === 'reparaciones_sencillas' ? 'R.Sencillas' :
                               propertyData.estadoConservacion === 'reparaciones_medias' ? 'R.Medias' :
                               propertyData.estadoConservacion === 'reparaciones_importantes' ? 'R.Importantes' : 'D.Graves'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">Paso 5</span>
                              {isStep5Complete() && <span className="text-green-500">✓</span>}
                            </div>
                            <span className="text-xs">Depreciación</span>
                          </div>
                        )}
                      </TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="areas" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                    {propertyData.tipoPropiedad === 'apartamento' ? (
                      <>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">🏢 Información del Apartamento</h3>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                              📋 Avalúo Especial para Apartamentos
                            </h4>
                            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 mb-4">
                              <li>• Solo necesita ingresar el área interior del apartamento</li>
                              <li>• No requiere área de terreno ni construcción adicional</li>
                              <li>• Se aplica el área directa del apartamento para el avalúo</li>
                              <li>• Incluye: sala, comedor, cocina, recámaras, baños</li>
                            </ul>
                          </div>
                          
                          <div>
                            <Label htmlFor="areaApartamento" className="text-base font-semibold">🏠 Área del Apartamento (m²)</Label>
                            <Input
                              id="areaApartamento"
                              type="number"
                              value={propertyData.areaApartamento || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleInputChange('areaApartamento', value === '' ? 0 : parseFloat(value) || 0);
                              }}
                              placeholder="Ingrese el área total del apartamento"
                              className="mt-2 text-lg"
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                              Ingrese el área total interior del apartamento en metros cuadrados
                            </p>
                            <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                ✅ Área efectiva para avalúo: {propertyData.areaApartamento ? `${propertyData.areaApartamento} m²` : '0 m²'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Áreas</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Área de construcción - para todas las propiedades excepto terrenos */}
                          {propertyData.tipoPropiedad !== 'terreno' && (
                            <div>
                              <Label htmlFor="areaConstruccion">Área de Construcción Casa (m²)</Label>
                              <Input
                                id="areaConstruccion"
                                type="number"
                                value={propertyData.areaPrimerNivel || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numValue = value === '' ? 0 : parseFloat(value) || 0;
                                  handleInputChange('areaPrimerNivel', numValue);
                                }}
                                placeholder="0"
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Ingrese el área total construida de la propiedad
                              </p>
                            </div>
                          )}
                          
                          {/* Área de terreno - no mostrar para apartamentos */}
                          {propertyData.tipoPropiedad !== 'apartamento' && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Label htmlFor="areaTerreno">
                                  {propertyData.tipoPropiedad === 'terreno' ? 'Área de Terreno (m²)' : 'Área de Terreno Casa (m²)'}
                                </Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-5 w-5 p-0 hover:bg-muted">
                                        <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="z-50 max-w-xs p-3 bg-background border border-border shadow-lg">
                                      <p className="text-sm leading-relaxed text-foreground">
                                        Indique el área del terreno donde se encuentra la construcción en metros cuadrados (m²).
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Input
                                id="areaTerreno"
                                type="number"
                                value={propertyData.areaTerreno || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleInputChange('areaTerreno', value === '' ? 0 : parseFloat(value) || 0);
                                }}
                                placeholder="0"
                                className="mt-1"
                              />
                            </div>
                          )}

                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="ubicacion" className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Ubicación</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                          id="direccion"
                          value={propertyData.direccionCompleta || ''}
                          onChange={(e) => handleInputChange('direccionCompleta', e.target.value)}
                          placeholder="Ingrese la dirección completa"
                          className="mt-1"
                        />
                      </div>
                      
                      {/* Mapa para buscar ubicaciones */}
                      <div>
                        <Label>Mapa de Ubicación</Label>
                        <div className="mt-2">
                          <SimpleLocationMap
                            onLocationChange={(lat, lng, address) => {
                              handleInputChange('direccionCompleta', address);
                              handleInputChange('latitud', lat);
                              handleInputChange('longitud', lng);
                            }}
                            initialLat={19.4326}
                            initialLng={-99.1332}
                            initialAddress={propertyData.direccionCompleta || ''}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                   <TabsContent value="depreciacion" className="space-y-4 mt-6">
                    
                    {/* Indicador del estado seleccionado */}
                    {propertyData.estadoConservacion && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg border-2 border-primary">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-base font-bold text-primary">✅ Estado Seleccionado</h4>
                            <p className="text-lg font-semibold text-foreground">
                              {propertyData.estadoConservacion === 'nuevo' ? '🟢 NUEVO' :
                               propertyData.estadoConservacion === 'bueno' ? '🔵 BUENO' :
                               propertyData.estadoConservacion === 'medio' ? '🔷 MEDIO' :
                               propertyData.estadoConservacion === 'regular' ? '🟡 REGULAR' :
                               propertyData.estadoConservacion === 'reparaciones_sencillas' ? '🟠 REPARACIONES SENCILLAS' :
                               propertyData.estadoConservacion === 'reparaciones_medias' ? '🔴 REPARACIONES MEDIAS' :
                               propertyData.estadoConservacion === 'reparaciones_importantes' ? '🟣 REPARACIONES IMPORTANTES' : '⚫ DAÑOS GRAVES'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                     <div className="space-y-4">

                      {/* Guía de Estados de Conservación - Método único de selección */}
                      <div>
                         <Label className="text-base font-semibold">Estado de Conservación</Label>
                         <p className="text-xs text-muted-foreground mt-1 mb-4">
                           Haga clic en el estado que mejor describa la condición actual del inmueble
                         </p>
                       </div>

                      {/* Guía de Estados de Conservación */}
                      <div>
                        <Card className="shadow-lg border-2 border-amber-200 dark:border-amber-800">
                          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4">
                            <CardTitle className="text-lg">📚 Selecciona el Estado de Conservación</CardTitle>
                            <p className="text-sm text-amber-100">Haga clic en el estado que corresponda a su propiedad</p>
                          </CardHeader>
                          <CardContent className="p-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                               <button 
                               onClick={() => {
                                 console.log('Clickeando NUEVO');
                                 handleInputChange('estadoConservacion', 'nuevo');
                                 console.log('Estado después del click:', 'nuevo');
                               }}
                                 className={`p-3 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer group ${
                                   propertyData.estadoConservacion === 'nuevo' 
                                   ? 'bg-gradient-to-r from-green-400 to-green-600 border-green-700 shadow-2xl transform scale-110 ring-4 ring-green-300' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'nuevo'
                                   ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md grayscale'
                                   : 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900 hover:shadow-md'
                                 }`}
                               >
                                 <div className={`font-bold mb-1 text-base flex items-center gap-2 ${
                                   propertyData.estadoConservacion === 'nuevo' 
                                   ? 'text-white text-lg' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'nuevo'
                                   ? 'text-gray-600 dark:text-gray-400'
                                   : 'text-green-700 dark:text-green-300'
                                 }`}>
                                   {propertyData.estadoConservacion === 'nuevo' && <span className="text-2xl">✅</span>}
                                   🟢 NUEVO
                                   {propertyData.estadoConservacion === 'nuevo' && <span className="ml-auto text-xl">🎯</span>}
                                 </div>
                                 <p className={`text-green-600 dark:text-green-400 text-xs transition-all duration-200 ${propertyData.estadoConservacion === 'nuevo' ? 'block' : 'hidden group-hover:block'}`}>
                                   Construcción reciente o recién terminada. Sin desgaste visible.
                                 </p>
                               </button>
                               
                               <button 
                                 onClick={() => {
                                   console.log('Clickeando BUENO');
                                   handleInputChange('estadoConservacion', 'bueno');
                                 }}
                                 className={`p-3 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer group ${
                                   propertyData.estadoConservacion === 'bueno' 
                                   ? 'bg-gradient-to-r from-blue-400 to-blue-600 border-blue-700 shadow-2xl transform scale-110 ring-4 ring-blue-300' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'bueno'
                                   ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md grayscale'
                                   : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 hover:shadow-md'
                                 }`}
                               >
                                 <div className={`font-bold mb-1 text-base flex items-center gap-2 ${
                                   propertyData.estadoConservacion === 'bueno' 
                                   ? 'text-white text-lg' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'bueno'
                                   ? 'text-gray-600 dark:text-gray-400'
                                   : 'text-blue-700 dark:text-blue-300'
                                 }`}>
                                   {propertyData.estadoConservacion === 'bueno' && <span className="text-2xl">✅</span>}
                                   🔵 BUENO
                                   {propertyData.estadoConservacion === 'bueno' && <span className="ml-auto text-xl">🎯</span>}
                                 </div>
                                 <p className={`text-blue-600 dark:text-blue-400 text-xs transition-all duration-200 ${propertyData.estadoConservacion === 'bueno' ? 'block' : 'hidden group-hover:block'}`}>
                                   Excelente estado general. Mantenimiento adecuado.
                                 </p>
                               </button>
                               
                               <button 
                                 onClick={() => {
                                   console.log('Clickeando MEDIO');
                                   handleInputChange('estadoConservacion', 'medio');
                                 }}
                                 className={`p-3 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer group ${
                                   propertyData.estadoConservacion === 'medio' 
                                   ? 'bg-gradient-to-r from-cyan-400 to-cyan-600 border-cyan-700 shadow-2xl transform scale-110 ring-4 ring-cyan-300' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'medio'
                                   ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md grayscale'
                                   : 'bg-cyan-50 dark:bg-cyan-950 border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900 hover:shadow-md'
                                 }`}
                               >
                                 <div className={`font-bold mb-1 text-base flex items-center gap-2 ${
                                   propertyData.estadoConservacion === 'medio' 
                                   ? 'text-white text-lg' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'medio'
                                   ? 'text-gray-600 dark:text-gray-400'
                                   : 'text-cyan-700 dark:text-cyan-300'
                                 }`}>
                                   {propertyData.estadoConservacion === 'medio' && <span className="text-2xl">✅</span>}
                                   🔷 MEDIO
                                   {propertyData.estadoConservacion === 'medio' && <span className="ml-auto text-xl">🎯</span>}
                                 </div>
                                 <p className={`text-cyan-600 dark:text-cyan-400 text-xs transition-all duration-200 ${propertyData.estadoConservacion === 'medio' ? 'block' : 'hidden group-hover:block'}`}>
                                   Buen estado con desgaste moderado.
                                 </p>
                               </button>
                               
                               <button 
                                 onClick={() => {
                                   console.log('Clickeando REGULAR');
                                   handleInputChange('estadoConservacion', 'regular');
                                 }}
                                 className={`p-3 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer group ${
                                   propertyData.estadoConservacion === 'regular' 
                                   ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-700 shadow-2xl transform scale-110 ring-4 ring-yellow-300' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'regular'
                                   ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md grayscale'
                                   : 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900 hover:shadow-md'
                                 }`}
                               >
                                 <div className={`font-bold mb-1 text-base flex items-center gap-2 ${
                                   propertyData.estadoConservacion === 'regular' 
                                   ? 'text-white text-lg' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'regular'
                                   ? 'text-gray-600 dark:text-gray-400'
                                   : 'text-yellow-700 dark:text-yellow-300'
                                 }`}>
                                   {propertyData.estadoConservacion === 'regular' && <span className="text-2xl">✅</span>}
                                   🟡 REGULAR
                                   {propertyData.estadoConservacion === 'regular' && <span className="ml-auto text-xl">🎯</span>}
                                 </div>
                                 <p className={`text-yellow-600 dark:text-yellow-400 text-xs transition-all duration-200 ${propertyData.estadoConservacion === 'regular' ? 'block' : 'hidden group-hover:block'}`}>
                                   Estado aceptable pero con desgaste visible.
                                 </p>
                               </button>
                               
                               <button 
                                 onClick={() => {
                                   console.log('Clickeando REPARACIONES SENCILLAS');
                                   handleInputChange('estadoConservacion', 'reparaciones_sencillas');
                                 }}
                                 className={`p-3 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer group ${
                                   propertyData.estadoConservacion === 'reparaciones_sencillas' 
                                   ? 'bg-gradient-to-r from-orange-400 to-orange-600 border-orange-700 shadow-2xl transform scale-110 ring-4 ring-orange-300' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'reparaciones_sencillas'
                                   ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md grayscale'
                                   : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900 hover:shadow-md'
                                 }`}
                               >
                                 <div className={`font-bold mb-1 text-base flex items-center gap-2 ${
                                   propertyData.estadoConservacion === 'reparaciones_sencillas' 
                                   ? 'text-white text-lg' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'reparaciones_sencillas'
                                   ? 'text-gray-600 dark:text-gray-400'
                                   : 'text-orange-700 dark:text-orange-300'
                                 }`}>
                                   {propertyData.estadoConservacion === 'reparaciones_sencillas' && <span className="text-2xl">✅</span>}
                                   🟠 REPARACIONES SENCILLAS
                                   {propertyData.estadoConservacion === 'reparaciones_sencillas' && <span className="ml-auto text-xl">🎯</span>}
                                 </div>
                                 <p className={`text-orange-600 dark:text-orange-400 text-xs transition-all duration-200 ${propertyData.estadoConservacion === 'reparaciones_sencillas' ? 'block' : 'hidden group-hover:block'}`}>
                                   Requiere reparaciones menores como pintura o plomería básica.
                                 </p>
                               </button>
                               
                               <button 
                                 onClick={() => {
                                   console.log('Clickeando REPARACIONES MEDIAS');
                                   handleInputChange('estadoConservacion', 'reparaciones_medias');
                                 }}
                                 className={`p-3 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer group ${
                                   propertyData.estadoConservacion === 'reparaciones_medias' 
                                   ? 'bg-gradient-to-r from-red-400 to-red-600 border-red-700 shadow-2xl transform scale-110 ring-4 ring-red-300' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'reparaciones_medias'
                                   ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md grayscale'
                                   : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900 hover:shadow-md'
                                 }`}
                               >
                                 <div className={`font-bold mb-1 text-base flex items-center gap-2 ${
                                   propertyData.estadoConservacion === 'reparaciones_medias' 
                                   ? 'text-white text-lg' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'reparaciones_medias'
                                   ? 'text-gray-600 dark:text-gray-400'
                                   : 'text-red-700 dark:text-red-300'
                                 }`}>
                                   {propertyData.estadoConservacion === 'reparaciones_medias' && <span className="text-2xl">✅</span>}
                                   🔴 REPARACIONES MEDIAS
                                   {propertyData.estadoConservacion === 'reparaciones_medias' && <span className="ml-auto text-xl">🎯</span>}
                                 </div>
                                 <p className={`text-red-600 dark:text-red-400 text-xs transition-all duration-200 ${propertyData.estadoConservacion === 'reparaciones_medias' ? 'block' : 'hidden group-hover:block'}`}>
                                   Necesita reparaciones importantes: pisos, instalaciones eléctricas.
                                 </p>
                               </button>
                               
                               <button 
                                 onClick={() => {
                                   console.log('Clickeando REPARACIONES IMPORTANTES');
                                   handleInputChange('estadoConservacion', 'reparaciones_importantes');
                                 }}
                                 className={`p-3 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer group ${
                                   propertyData.estadoConservacion === 'reparaciones_importantes' 
                                   ? 'bg-gradient-to-r from-purple-400 to-purple-600 border-purple-700 shadow-2xl transform scale-110 ring-4 ring-purple-300' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'reparaciones_importantes'
                                   ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md grayscale'
                                   : 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900 hover:shadow-md'
                                 }`}
                               >
                                 <div className={`font-bold mb-1 text-base flex items-center gap-2 ${
                                   propertyData.estadoConservacion === 'reparaciones_importantes' 
                                   ? 'text-white text-lg' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'reparaciones_importantes'
                                   ? 'text-gray-600 dark:text-gray-400'
                                   : 'text-purple-700 dark:text-purple-300'
                                 }`}>
                                   {propertyData.estadoConservacion === 'reparaciones_importantes' && <span className="text-2xl">✅</span>}
                                   🟣 REPARACIONES IMPORTANTES
                                   {propertyData.estadoConservacion === 'reparaciones_importantes' && <span className="ml-auto text-xl">🎯</span>}
                                 </div>
                                 <p className={`text-purple-600 dark:text-purple-400 text-xs transition-all duration-200 ${propertyData.estadoConservacion === 'reparaciones_importantes' ? 'block' : 'hidden group-hover:block'}`}>
                                   Requiere rehabilitación mayor: estructura, techumbres.
                                 </p>
                               </button>
                               
                               <button 
                                 onClick={() => {
                                   console.log('Clickeando DAÑOS GRAVES');
                                   handleInputChange('estadoConservacion', 'danos_graves');
                                 }}
                                 className={`p-3 rounded-lg border-2 text-left transition-all duration-300 cursor-pointer group ${
                                   propertyData.estadoConservacion === 'danos_graves' 
                                   ? 'bg-gradient-to-r from-gray-400 to-gray-600 border-gray-700 shadow-2xl transform scale-110 ring-4 ring-gray-300' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'danos_graves'
                                   ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md grayscale'
                                   : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 hover:shadow-md'
                                 }`}
                               >
                                 <div className={`font-bold mb-1 text-base flex items-center gap-2 ${
                                   propertyData.estadoConservacion === 'danos_graves' 
                                   ? 'text-white text-lg' 
                                   : propertyData.estadoConservacion && propertyData.estadoConservacion !== 'danos_graves'
                                   ? 'text-gray-600 dark:text-gray-400'
                                   : 'text-gray-700 dark:text-gray-300'
                                 }`}>
                                   {propertyData.estadoConservacion === 'danos_graves' && <span className="text-2xl">✅</span>}
                                   ⚫ DAÑOS GRAVES
                                   {propertyData.estadoConservacion === 'danos_graves' && <span className="ml-auto text-xl">🎯</span>}
                                 </div>
                                 <p className={`text-gray-600 dark:text-gray-400 text-xs transition-all duration-200 ${propertyData.estadoConservacion === 'danos_graves' ? 'block' : 'hidden group-hover:block'}`}>
                                   Daños estructurales severos. Requiere reconstrucción parcial o total.
                                 </p>
                              </button>
                            </div>
                            
                            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Tip Profesional</h4>
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                El estado de conservación afecta directamente el valor final de la propiedad. 
                                Una evaluación precisa es fundamental para un avalúo confiable según normas UPAV/IVSC.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Panel de Resultados - Ahora abajo del formulario */}
          <div>
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-secondary to-real-estate-accent text-secondary-foreground p-3 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Resultados de Valuación</CardTitle>
              </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {/* Resultado de la valuación - siempre visible después del cálculo */}
                  {valuationResult && (
                    <div className="mb-6" id="resultado-valuacion">
                      <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                       <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                         Valor Estimado
                       </div>
                       <div className="text-4xl font-bold text-green-900 dark:text-green-100">
                         ${valuationResult.toLocaleString("en-US")} USD
                       </div>
                       <div className="text-sm text-green-700 dark:text-green-300 mt-2">
                         Área efectiva: {getEffectiveArea()} m²
                       </div>
                     </div>
                   </div>
                 )}

                 {/* Sección del botón de cálculo */}
                 <div className="space-y-6">
                   {!valuationResult && (
                     <div className="text-center py-8">
                       <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                     </div>
                   )}
                   
                   <div className="space-y-4">
                        <button 
                          id="calcular-button"
                          onClick={() => {
                            console.log('=== INICIO CÁLCULO MÉTODO COMPARATIVO ===');
                            console.log('Datos de propiedad:', propertyData);
                            
                            try {
                              let valorTotal = 0;
                              let areaEfectiva = 0;
                              
                              // Método comparativo según tipo de propiedad
                              if (propertyData.tipoPropiedad === 'apartamento') {
                                if (!propertyData.areaApartamento || propertyData.areaApartamento <= 0) {
                                  alert('Debe ingresar el área del apartamento');
                                  return;
                                }
                                areaEfectiva = propertyData.areaApartamento;
                                valorTotal = areaEfectiva * 1800; // $1800 por m²
                                
                              } else if (propertyData.tipoPropiedad === 'casa') {
                                if (!propertyData.areaPrimerNivel || propertyData.areaPrimerNivel <= 0) {
                                  alert('Debe ingresar el área construida de la casa');
                                  return;
                                }
                                areaEfectiva = propertyData.areaPrimerNivel;
                                valorTotal = areaEfectiva * 1500; // $1500 por m² para casas
                                
                              } else if (propertyData.tipoPropiedad === 'comercial') {
                                if (!propertyData.areaPrimerNivel || propertyData.areaPrimerNivel <= 0) {
                                  alert('Debe ingresar el área del local comercial');
                                  return;
                                }
                                areaEfectiva = propertyData.areaPrimerNivel;
                                valorTotal = areaEfectiva * 2200; // $2200 por m² para locales comerciales
                                
                              } else {
                                alert('Debe seleccionar un tipo de propiedad válido');
                                return;
                              }
                              
                              // Aplicar factor específico por estrato socioeconómico
                              const factorEstrato = estratoMultipliers[propertyData.estratoSocial];
                              valorTotal = valorTotal * factorEstrato;
                              
                              // Aplicar factor de conservación si está seleccionado
                              const factorConservacion = propertyData.estadoConservacion 
                                ? conservationFactors[propertyData.estadoConservacion] 
                                : 1.0;
                              valorTotal = valorTotal * factorConservacion;
                              
                              console.log('Tipo:', propertyData.tipoPropiedad);
                              console.log('Área efectiva:', areaEfectiva);
                              console.log('Factor estrato:', factorEstrato, 'Estrato:', propertyData.estratoSocial);
                              console.log('Factor conservación:', factorConservacion, 'Estado:', propertyData.estadoConservacion);
                              console.log('Valor total:', valorTotal);
                              
                               // Establecer resultado
                               setValuationResult(valorTotal);
                               
                               // Hacer scroll automático al resultado después de un breve delay
                               setTimeout(() => {
                                 const resultElement = document.getElementById('resultado-valuacion');
                                 if (resultElement) {
                                   resultElement.scrollIntoView({ 
                                     behavior: 'smooth', 
                                     block: 'center' 
                                   });
                                 }
                               }, 500);
                               
                               toast({
                                 title: "Valuación Completada",
                                description: `Valor estimado: $${valorTotal.toLocaleString("en-US")} USD`,
                              });
                              
                            } catch (error) {
                              console.error('ERROR en cálculo:', error);
                              alert('Error en el cálculo: ' + error.message);
                            }
                          }}
                          disabled={isCalculating}
                          className={`w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md text-white ${highlightedElement === 'calcular-button' ? 'ring-4 ring-yellow-400 ring-opacity-75' : ''}`}
                        >
                         <div className="flex items-center justify-center gap-2">
                           ⚡ REALIZAR VALUACIÓN
                         </div>
                       </button>
                   
                   <div className="text-xs text-muted-foreground space-y-1">
                     <p>✓ Método: Comparables por estrato social (UPAV/IVSC)</p>
                     <p>✓ Avalúo profesional con estándares latinoamericanos</p>
                     <p>✓ Certificación internacional y reglamentos regionales</p>
                   </div>
                   </div>

                   {/* Comparables - solo mostrar si hay resultado */}
                   {valuationResult && (
                     <div className="space-y-3">
                       <h4 className="text-base font-semibold">Comparables de la misma clase social</h4>
                       <p className="text-xs text-muted-foreground">
                         Clase social: {socialClassLabels[getSocialClass(propertyData.estratoSocial)]} | 
                         Normas: UPAV, IVSC, Reglamentos Latinoamericanos
                       </p>
                       {isLoadingComparables ? (
                         <div className="text-sm text-muted-foreground">Búsqueda progresiva en curso (1km → 50km)...</div>
                       ) : comparables.length > 0 ? (
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Dirección</TableHead>
                                  <TableHead className="text-right">Precio Original</TableHead>
                                  <TableHead className="text-right">Precio Ajustado (-15%)</TableHead>
                                  <TableHead className="text-right">Precio/m² Ajustado (-15%)</TableHead>
                                  <TableHead className="text-right">Área (m²)</TableHead>
                                  <TableHead className="text-right">Distancia</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {comparables.slice(0, 3).map((c) => (
                                  <TableRow key={c.id}>
                                    <TableCell className="max-w-[180px] truncate">{c.address}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">${(c.price_usd || 0).toLocaleString("en-US")}</TableCell>
                                    <TableCell className="text-right font-semibold">${Math.round((c.price_usd || 0) * 0.85).toLocaleString("en-US")}</TableCell>
                                    <TableCell className="text-right font-semibold">${Math.round((c.price_per_sqm_usd || 0) * 0.85).toLocaleString("en-US")}</TableCell>
                                    <TableCell className="text-right">{c.total_area ?? "-"}</TableCell>
                                    <TableCell className="text-right">{c.distance_km?.toFixed(2)} km</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                           <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                             ✓ Mostrando los 3 más cercanos de {comparables.length} comparables válidos (mínimo 3 requerido por normas latinoamericanas)
                           </p>
                         </div>
                         ) : comparables.length === 0 ? (
                           <div className="text-sm text-muted-foreground">
                             No se encontraron comparables del mismo estrato social en la zona. 
                             La valuación se realizó usando el método de costo de reposición.
                           </div>
                         ) : (
                           <div className="text-sm text-amber-600 dark:text-amber-400">
                             Se encontraron solo {comparables.length} comparables. 
                             Se recomienda tener mínimo 3 según normas UPAV/IVSC.
                           </div>
                       )}
                     </div>
                    )}
                  </div>
               </CardContent>
             </Card>
           </div>
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