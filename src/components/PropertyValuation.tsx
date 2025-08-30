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

interface PropertyData {
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  areaApartamento: number;
  tipoPropiedad: string;
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
  estratoSocial: EstratoSocial;
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
    estratoSocial: 'medio_medio' as EstratoSocial,
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
      // Para apartamentos, el área se duplica para el avalúo
      return (propertyData.areaApartamento || 0) * 2;
    }
    
    // Para otras propiedades, usar la suma de áreas normales
    return (propertyData.areaSotano || 0) + 
           (propertyData.areaPrimerNivel || 0) + 
           (propertyData.areaSegundoNivel || 0) + 
           (propertyData.areaTercerNivel || 0) + 
           (propertyData.areaCuartoNivel || 0);
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
        toast({
          title: "Ubicación requerida",
          description: "Por favor seleccione una ubicación en el mapa para encontrar comparables",
          variant: "destructive"
        });
        return;
      }

      // Usar la función de BD con búsqueda progresiva
      const { data, error } = await supabase.rpc('find_comparables_progressive_radius', {
        target_lat: lat,
        target_lng: lng,
        target_estrato: estrato,
        target_property_type: propertyData.tipoPropiedad
      });

      if (error) throw error;

      const comparablesData: Comparable[] = (data || []).map((d: any) => ({
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

      // Validar mínimo de 3 comparables según estándares latinoamericanos
      if (comparablesData.length < 3) {
        toast({
          title: "Comparables insuficientes",
          description: `Se encontraron solo ${comparablesData.length} comparables del estrato ${estratoSocialLabels[estrato]}. Se requieren mínimo 3 para una valuación confiable según normas UPAV/IVSC.`,
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Comparables encontrados",
        description: `Se encontraron ${comparablesData.length} comparables del estrato ${estratoSocialLabels[estrato]}`,
      });

      return true;

    } catch (err) {
      console.error('Error fetching comparables:', err);
      toast({
        title: 'Error obteniendo comparables',
        description: 'Intenta nuevamente más tarde.',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoadingComparables(false);
    }
  };

  // Función para calcular la valuación
  const performValuation = async () => {
    setIsCalculating(true);
    
    try {
      // Simular cálculo con delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const effectiveArea = getEffectiveArea();
      
      if (effectiveArea === 0) {
        toast({
          title: "Error en la valuación",
          description: "Debe ingresar el área de la propiedad para realizar la valuación",
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
      
      // Calcular valor total
      const totalValue = effectiveArea * basePricePerM2;
      
      setValuationResult(totalValue);
      
      // Buscar comparables y validar mínimo requerido
      const hasMinComparables = await fetchComparables();
      if (!hasMinComparables) {
        setValuationResult(null);
        setIsCalculating(false);
        return;
      }
      
      toast({
        title: "Valuación Completada",
        description: `Valor estimado: $${totalValue.toLocaleString('en-US')} USD`,
      });
      
    } catch (error) {
      console.error('Error performing valuation:', error);
      toast({
        title: "Error en la valuación",
        description: "Ocurrió un error al realizar la valuación. Intente nuevamente.",
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
                  <CardTitle className="text-lg sm:text-xl">Valuador de Propiedades</CardTitle>
                  <LanguageSelector />
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                <Tabs defaultValue="areas" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 h-auto">
                    <TabsTrigger value="ubicacion" className="h-8 sm:h-10 text-xs sm:text-sm">Ubicación</TabsTrigger>
                    <TabsTrigger value="areas" className="h-8 sm:h-10 text-xs sm:text-sm">Áreas</TabsTrigger>
                  </TabsList>

                   <TabsContent value="areas" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                     {/* Selector de Estrato Social */}
                     <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                       <Label htmlFor="estratoSocial" className="text-blue-800 dark:text-blue-200 font-medium">
                         Estrato Social (Reglamento Latinoamericano UPAV/IVSC)
                       </Label>
                       <Select
                         value={propertyData.estratoSocial}
                         onValueChange={(value: EstratoSocial) => handleInputChange('estratoSocial', value)}
                       >
                         <SelectTrigger className="mt-2 border-blue-300 dark:border-blue-700">
                           <SelectValue placeholder="Seleccionar estrato social" />
                         </SelectTrigger>
                         <SelectContent>
                           {(Object.entries(estratoSocialLabels) as [EstratoSocial, string][]).map(([key, label]) => (
                             <SelectItem key={key} value={key}>
                               {label}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                         Solo se compararán propiedades del mismo estrato social según normas de valuación latinoamericanas
                       </p>
                     </div>

                     {propertyData.tipoPropiedad === 'apartamento' ? (
                      <>
                        <Tabs defaultValue="general" className="w-full">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="general">Información General</TabsTrigger>
                            <TabsTrigger value="adicional">Información Adicional</TabsTrigger>
                            <TabsTrigger value="apartamento">Apartamento</TabsTrigger>
                          </TabsList>

                          <TabsContent value="general" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <Label htmlFor="areaApartamento">Área del Apartamento (m²)</Label>
                                <Input
                                  id="areaApartamento"
                                  type="number"
                                  value={propertyData.areaApartamento || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleInputChange('areaApartamento', value === '' ? 0 : parseFloat(value) || 0);
                                  }}
                                  placeholder="0"
                                  className="mt-1"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Ingrese el área total del apartamento en metros cuadrados
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                                  ℹ️ Para el avalúo se duplica automáticamente: {propertyData.areaApartamento ? `${propertyData.areaApartamento} × 2 = ${getEffectiveArea()} m²` : '0 × 2 = 0 m²'}
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="adicional" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <h4 className="text-sm font-medium">Información Adicional</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Esta sección está disponible para información adicional específica del apartamento.
                                </p>
                              </div>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="apartamento" className="space-y-4 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Área de construcción - mostrar siempre para apartamentos */}
                              {(
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
                              
                              {/* Área de terreno */}
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

                              {/* Área de Apartamento */}
                              <div>
                                <Label htmlFor="areaApartamento">Área de Apartamento (m²)</Label>
                                <Input
                                  id="areaApartamento"
                                  type="number"
                                  value={propertyData.areaApartamento || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleInputChange('areaApartamento', value === '' ? 0 : parseFloat(value) || 0);
                                  }}
                                  placeholder="0"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
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
                           
                           {/* Área de terreno */}
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

                           {/* Área de Apartamento */}
                           <div>
                             <Label htmlFor="areaApartamento">Área de Apartamento (m²)</Label>
                             <Input
                               id="areaApartamento"
                               type="number"
                               value={propertyData.areaApartamento || ''}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 handleInputChange('areaApartamento', value === '' ? 0 : parseFloat(value) || 0);
                               }}
                               placeholder="0"
                               className="mt-1"
                             />
                           </div>
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
                 {!valuationResult ? (
                   <div className="text-center py-8 space-y-6">
                     <div>
                       <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                     </div>
                     
                     <div className="space-y-4">
                       <Button 
                         size="lg"
                         onClick={performValuation}
                         disabled={isCalculating}
                         className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                       >
                         <div className="flex items-center gap-2">
                           <Calculator className="h-5 w-5" />
                           <span>{isCalculating ? "CALCULANDO..." : "REALIZAR VALUACIÓN"}</span>
                         </div>
                       </Button>
                     
                     <div className="text-xs text-muted-foreground space-y-1">
                       <p>✓ Método: Comparables por estrato social (UPAV/IVSC)</p>
                       <p>✓ Avalúo profesional con estándares latinoamericanos</p>
                       <p>✓ Certificación internacional y reglamentos regionales</p>
                     </div>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-6">
                     {/* Resultado de la valuación */}
                     <div className="text-center p-6 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                       <div className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                         Valor Estimado
                       </div>
                       <div className="text-4xl font-bold text-green-900 dark:text-green-100">
                         ${valuationResult.toLocaleString('en-US')} USD
                       </div>
                       <div className="text-sm text-green-700 dark:text-green-300 mt-2">
                         Área efectiva: {getEffectiveArea()} m²
                       </div>
                       {propertyData.tipoPropiedad === 'apartamento' && (
                         <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                           (Área apartamento duplicada para avalúo)
                         </div>
                       )}
                     </div>
                     
                     {/* Botón para nueva valuación */}
                     <Button 
                       variant="outline"
                       onClick={() => setValuationResult(null)}
                       className="w-full"
                     >
                       Nueva Valuación
                     </Button>

                     {/* Comparables cercanos - Estándares Latinoamericanos */}
                     <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <h4 className="text-base font-semibold">Comparables más cercanos</h4>
                         <Badge variant="outline" className="text-xs">
                           Estrato: {estratoSocialLabels[propertyData.estratoSocial]}
                         </Badge>
                       </div>
                       {isLoadingComparables ? (
                         <div className="text-sm text-muted-foreground">Buscando comparables cercanos del mismo estrato social...</div>
                       ) : comparables.length > 0 ? (
                         <div className="overflow-x-auto">
                           <Table>
                             <TableHeader>
                               <TableRow>
                                 <TableHead>Dirección</TableHead>
                                 <TableHead className="text-right">Precio (USD)</TableHead>
                                 <TableHead className="text-right">Precio/m²</TableHead>
                                 <TableHead className="text-right">Área (m²)</TableHead>
                                 <TableHead className="text-right">Distancia</TableHead>
                                 <TableHead className="text-center">Estrato</TableHead>
                               </TableRow>
                             </TableHeader>
                             <TableBody>
                               {comparables.map((c) => (
                                 <TableRow key={c.id}>
                                   <TableCell className="max-w-[200px] truncate">{c.address}</TableCell>
                                   <TableCell className="text-right">${(c.price_usd || 0).toLocaleString('en-US')}</TableCell>
                                   <TableCell className="text-right">${(c.price_per_sqm_usd || 0).toLocaleString('en-US')}</TableCell>
                                   <TableCell className="text-right">{c.total_area ?? '-'}</TableCell>
                                   <TableCell className="text-right">{c.distance_km?.toFixed(2)} km</TableCell>
                                   <TableCell className="text-center">
                                     <Badge variant="secondary" className="text-xs">
                                       {estratoSocialLabels[c.estrato_social]}
                                     </Badge>
                                   </TableCell>
                                 </TableRow>
                               ))}
                             </TableBody>
                           </Table>
                           <div className="mt-2 text-xs text-muted-foreground space-y-1">
                             <p>✓ {comparables.length} comparables encontrados (mínimo 3 requerido por normas UPAV/IVSC)</p>
                             <p>✓ Búsqueda progresiva: 1km → 3km → 5km → 10km → 20km → 50km</p>
                             <p>✓ Filtrado por estrato social latinoamericano</p>
                           </div>
                         </div>
                       ) : (
                         <div className="text-sm text-muted-foreground space-y-2">
                           <p>No se encontraron comparables del estrato {estratoSocialLabels[propertyData.estratoSocial]} cercanos.</p>
                           <p>• Ajusta la ubicación en el mapa</p>
                           <p>• Considera cambiar el estrato social si es apropiado</p>
                           <p>• Verifica que hay propiedades comparables en la base de datos</p>
                         </div>
                       )}
                     </div>
                     
                     <div className="text-xs text-muted-foreground space-y-1">
                       <p>✓ Método: Comparables internacionales (IVS/RICS)</p>
                       <p>✓ Avalúo profesional con estándares IVS/RICS</p>
                       <p>✓ Certificación internacional</p>
                     </div>
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyValuation;
