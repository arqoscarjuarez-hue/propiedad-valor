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
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp, FileText, Download, Camera, Trash2, Play, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import DemoWalkthrough from '@/components/DemoWalkthrough';

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
}

const PropertyValuation = () => {
  const { toast } = useToast();
  const { selectedLanguage } = useLanguage();
  
  // Estados para la valuación
  const [valuationResult, setValuationResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [isLoadingComparables, setIsLoadingComparables] = useState(false);
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

  const handleInputChange = (field: keyof PropertyData, value: string | number | EstratoSocial) => {
    const isStringField = ['ubicacion', 'estadoGeneral', 'tipoPropiedad', 'direccion', 'tipoAcceso', 'topografia', 'tipoValoracion', 'estratoSocial'].includes(field);
    
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

      const results = await Promise.all(
        estratosGrupo.map(e => supabase.rpc('find_comparables_progressive_radius', {
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
        address: d.address,
        price_usd: Number(d.price_usd || 0),
        price_per_sqm_usd: Number(d.price_per_sqm_usd || 0),
        total_area: d.total_area !== null ? Number(d.total_area) : null,
        latitude: d.latitude !== null ? Number(d.latitude) : null,
        longitude: d.longitude !== null ? Number(d.longitude) : null,
        property_type: d.property_type || null,
        estrato_social: d.estrato_social as EstratoSocial,
        distance_km: d.distance_km !== null ? Number(d.distance_km) : undefined,
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
        const valorTotal = areaEfectiva * precioM2 * factorEstrato;
        
        console.log('Área efectiva apartamento:', areaEfectiva);
        console.log('Factor estrato:', factorEstrato, 'Estrato:', propertyData.estratoSocial);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Panel Izquierdo - Formulario */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Valuador Latinoamericano</CardTitle>
                  <LanguageSelector />
                </div>
                <p className="text-sm text-primary-foreground/90 mt-2">
                  Siguiendo normas UPAV, IVSC y reglamentos de valuación latinoamericanos
                </p>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {/* Selector de Estrato Social */}
                <div className="mb-6">
                  <Label htmlFor="estratoSocial" className="text-base font-semibold">¿Cómo te consideras donde vives?</Label>
                  <Select value={propertyData.estratoSocial} onValueChange={(value: EstratoSocial) => handleInputChange('estratoSocial', value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecciona el estrato social" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(estratoSocialLabels) as [EstratoSocial, string][]).map(([key, label]) => {
                        const multiplier = estratoMultipliers[key];
                        const percentage = ((multiplier - 1) * 100).toFixed(0);
                        const sign = multiplier >= 1 ? '+' : '';
                        return (
                          <SelectItem key={key} value={key}>
                            {label} ({sign}{percentage}%)
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
                <div className="mb-6">
                  <Label htmlFor="tipoPropiedad" className="text-base font-semibold">Tipo de Propiedad</Label>
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

                <Tabs defaultValue="areas" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-auto">
                    <TabsTrigger value="ubicacion" className="h-8 sm:h-10 text-xs sm:text-sm">Ubicación</TabsTrigger>
                    <TabsTrigger value="areas" className="h-8 sm:h-10 text-xs sm:text-sm">Áreas</TabsTrigger>
                    <TabsTrigger value="depreciacion" className="h-8 sm:h-10 text-xs sm:text-sm">Depreciación</TabsTrigger>
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
                                <Label htmlFor="areaTerreno">Área de Terreno Casa (m²)</Label>
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
                    <h3 className="text-lg font-semibold text-foreground mb-4">Depreciación - Fórmula Ross-Heindecke</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-3">
                          📐 Fórmula Ross-Heindecke
                        </h4>
                        <div className="text-xs text-purple-700 dark:text-purple-300 space-y-2">
                          <div><strong>VN = VRN × (1 - D)</strong></div>
                          <div><strong>D = DF + DO + DE</strong></div>
                          <ul className="mt-2 space-y-1 ml-4">
                            <li>• VN = Valor Neto</li>
                            <li>• VRN = Valor de Reposición Nuevo</li>
                            <li>• DF = Depreciación Física</li>
                            <li>• DO = Depreciación por Obsolescencia</li>
                            <li>• DE = Depreciación Económica</li>
                          </ul>
                        </div>
                      </div>

                      {/* Depreciación Física */}
                      <Card className="border-red-200 dark:border-red-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-red-700 dark:text-red-300">🔧 Depreciación Física (DF)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="antiguedad" className="text-sm font-medium">Antigüedad (años)</Label>
                              <Input
                                id="antiguedad"
                                type="number"
                                value={propertyData.antiguedad || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleInputChange('antiguedad', value === '' ? 0 : parseFloat(value) || 0);
                                }}
                                placeholder="0"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="vidaUtil" className="text-sm font-medium">Vida Útil Total (años)</Label>
                              <Input
                                id="vidaUtil"
                                type="number"
                                value={propertyData.vidaUtil || (propertyData.tipoPropiedad === 'apartamento' ? 80 : 
                                      propertyData.tipoPropiedad === 'comercial' ? 60 : 100)}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleInputChange('vidaUtil', value === '' ? 0 : parseFloat(value) || 0);
                                }}
                                placeholder="80"
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="estadoConservacion" className="text-sm font-medium">Estado de Conservación</Label>
                            <Select value={propertyData.estadoConservacion} onValueChange={(value) => handleInputChange('estadoConservacion', value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecciona el estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excelente">Excelente (0%)</SelectItem>
                                <SelectItem value="muy_bueno">Muy Bueno (5%)</SelectItem>
                                <SelectItem value="bueno">Bueno (10%)</SelectItem>
                                <SelectItem value="regular">Regular (20%)</SelectItem>
                                <SelectItem value="malo">Malo (35%)</SelectItem>
                                <SelectItem value="muy_malo">Muy Malo (50%)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="mantenimiento" className="text-sm font-medium">Nivel de Mantenimiento (%)</Label>
                            <Input
                              id="mantenimiento"
                              type="number"
                              min="0"
                              max="100"
                              value={propertyData.mantenimiento || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleInputChange('mantenimiento', value === '' ? 0 : parseFloat(value) || 0);
                              }}
                              placeholder="85"
                              className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">0% = Sin mantenimiento, 100% = Mantenimiento perfecto</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Depreciación por Obsolescencia */}
                      <Card className="border-orange-200 dark:border-orange-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-orange-700 dark:text-orange-300">⚙️ Depreciación por Obsolescencia (DO)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="obsolescenciaFuncional" className="text-sm font-medium">Obsolescencia Funcional (%)</Label>
                              <Input
                                id="obsolescenciaFuncional"
                                type="number"
                                min="0"
                                max="50"
                                value={propertyData.obsolescenciaFuncional || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleInputChange('obsolescenciaFuncional', value === '' ? 0 : parseFloat(value) || 0);
                                }}
                                placeholder="0"
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">Diseño inadecuado, distribución obsoleta</p>
                            </div>
                            <div>
                              <Label htmlFor="obsolescenciaTecnologica" className="text-sm font-medium">Obsolescencia Tecnológica (%)</Label>
                              <Input
                                id="obsolescenciaTecnologica"
                                type="number"
                                min="0"
                                max="30"
                                value={propertyData.obsolescenciaTecnologica || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleInputChange('obsolescenciaTecnologica', value === '' ? 0 : parseFloat(value) || 0);
                                }}
                                placeholder="0"
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">Sistemas, instalaciones desactualizadas</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Depreciación Económica */}
                      <Card className="border-blue-200 dark:border-blue-800">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-blue-700 dark:text-blue-300">💰 Depreciación Económica (DE)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="factorUbicacion" className="text-sm font-medium">Factor de Ubicación (%)</Label>
                              <Input
                                id="factorUbicacion"
                                type="number"
                                min="-30"
                                max="20"
                                value={propertyData.factorUbicacion || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleInputChange('factorUbicacion', value === '' ? 0 : parseFloat(value) || 0);
                                }}
                                placeholder="0"
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">Valorización/desvalorización de la zona</p>
                            </div>
                            <div>
                              <Label htmlFor="factorMercado" className="text-sm font-medium">Factor de Mercado (%)</Label>
                              <Input
                                id="factorMercado"
                                type="number"
                                min="-25"
                                max="25"
                                value={propertyData.factorMercado || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  handleInputChange('factorMercado', value === '' ? 0 : parseFloat(value) || 0);
                                }}
                                placeholder="0"
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">Condiciones del mercado inmobiliario</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Cálculos Ross-Heindecke */}
                      {(propertyData.antiguedad > 0 || propertyData.estadoConservacion || 
                        propertyData.obsolescenciaFuncional > 0 || propertyData.obsolescenciaTecnologica > 0 ||
                        propertyData.factorUbicacion !== 0 || propertyData.factorMercado !== 0) && (
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base text-green-700 dark:text-green-300">📊 Cálculo Ross-Heindecke</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {(() => {
                                // Cálculo de Depreciación Física (DF)
                                const vidaUtil = propertyData.vidaUtil || (propertyData.tipoPropiedad === 'apartamento' ? 80 : 
                                               propertyData.tipoPropiedad === 'comercial' ? 60 : 100);
                                const depreciacionEdad = (propertyData.antiguedad || 0) / vidaUtil;
                                
                                const estadoFactores = {
                                  'excelente': 0,
                                  'muy_bueno': 0.05,
                                  'bueno': 0.10,
                                  'regular': 0.20,
                                  'malo': 0.35,
                                  'muy_malo': 0.50
                                };
                                const factorEstado = estadoFactores[propertyData.estadoConservacion as keyof typeof estadoFactores] || 0;
                                const factorMantenimiento = (100 - (propertyData.mantenimiento || 85)) / 100 * 0.3;
                                const DF = Math.min(0.95, depreciacionEdad + factorEstado + factorMantenimiento);

                                // Cálculo de Depreciación por Obsolescencia (DO)
                                const DO = ((propertyData.obsolescenciaFuncional || 0) + (propertyData.obsolescenciaTecnologica || 0)) / 100;

                                // Cálculo de Depreciación Económica (DE)
                                const DE = ((propertyData.factorUbicacion || 0) + (propertyData.factorMercado || 0)) / 100;

                                // Depreciación Total
                                const depreciacionTotal = Math.max(0, Math.min(0.95, DF + DO + DE));
                                const factorValor = 1 - depreciacionTotal;

                                return (
                                  <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                        <div className="font-semibold text-red-700 dark:text-red-300">Depreciación Física (DF)</div>
                                        <div className="text-xs space-y-1 mt-2">
                                          <div>Por edad: {(depreciacionEdad * 100).toFixed(1)}%</div>
                                          <div>Por estado: {(factorEstado * 100).toFixed(1)}%</div>
                                          <div>Por mantenimiento: {(factorMantenimiento * 100).toFixed(1)}%</div>
                                        </div>
                                        <div className="font-bold text-red-600 dark:text-red-400 mt-2">
                                          DF = {(DF * 100).toFixed(2)}%
                                        </div>
                                      </div>
                                      
                                      <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                        <div className="font-semibold text-orange-700 dark:text-orange-300">Obsolescencia (DO)</div>
                                        <div className="text-xs space-y-1 mt-2">
                                          <div>Funcional: {(propertyData.obsolescenciaFuncional || 0).toFixed(1)}%</div>
                                          <div>Tecnológica: {(propertyData.obsolescenciaTecnologica || 0).toFixed(1)}%</div>
                                        </div>
                                        <div className="font-bold text-orange-600 dark:text-orange-400 mt-2">
                                          DO = {(DO * 100).toFixed(2)}%
                                        </div>
                                      </div>
                                      
                                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <div className="font-semibold text-blue-700 dark:text-blue-300">Económica (DE)</div>
                                        <div className="text-xs space-y-1 mt-2">
                                          <div>Ubicación: {(propertyData.factorUbicacion || 0).toFixed(1)}%</div>
                                          <div>Mercado: {(propertyData.factorMercado || 0).toFixed(1)}%</div>
                                        </div>
                                        <div className="font-bold text-blue-600 dark:text-blue-400 mt-2">
                                          DE = {(DE * 100).toFixed(2)}%
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="border-t pt-4">
                                      <div className="text-center space-y-2">
                                        <div className="text-lg font-bold">
                                          <span className="text-muted-foreground">D = DF + DO + DE = </span>
                                          <span className="text-destructive">{(depreciacionTotal * 100).toFixed(2)}%</span>
                                        </div>
                                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                                          Factor de Valor = {factorValor.toFixed(4)}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          VN = VRN × {factorValor.toFixed(4)}
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho - Resultados */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-secondary to-real-estate-accent text-secondary-foreground p-3 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Resultados de Valuación</CardTitle>
              </CardHeader>
               <CardContent className="p-3 sm:p-6">
                 {/* Resultado de la valuación - siempre visible después del cálculo */}
                 {valuationResult && (
                   <div className="mb-6">
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
                             console.log('Tipo:', propertyData.tipoPropiedad);
                             console.log('Área efectiva:', areaEfectiva);
                             console.log('Factor estrato:', factorEstrato, 'Estrato:', propertyData.estratoSocial);
                             console.log('Valor total:', valorTotal);
                             
                             // Establecer resultado
                             setValuationResult(valorTotal);
                             
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
                         className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 rounded-md text-white"
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
    </div>
  );
};

export default PropertyValuation;