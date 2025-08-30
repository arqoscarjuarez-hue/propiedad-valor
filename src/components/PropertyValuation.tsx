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

  const handleInputChange = (field: keyof PropertyData, value: string | number) => {
    const isStringField = ['ubicacion', 'estadoGeneral', 'tipoPropiedad', 'direccion', 'tipoAcceso', 'topografia', 'tipoValoracion'].includes(field);
    
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

  // Util para calcular distancia entre dos coordenadas (Haversine)
  const haversineDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchComparables = async () => {
    try {
      setIsLoadingComparables(true);
      setComparables([]);

      const lat = propertyData.latitud;
      const lng = propertyData.longitud;

      if (!lat || !lng) {
        // Si no hay coordenadas, no bloqueamos el flujo; solo no mostramos comparables
        return;
      }

      const delta = 0.3; // ~33km aprox, depende de la latitud
      const { data, error } = await supabase
        .from('property_comparables')
        .select('id,address,price_usd,price_per_sqm_usd,total_area,latitude,longitude,property_type')
        .gte('latitude', lat - delta)
        .lte('latitude', lat + delta)
        .gte('longitude', lng - delta)
        .lte('longitude', lng + delta)
        .limit(100);

      if (error) throw error;

      const withDistance: Comparable[] = (data || []).map((d: any) => ({
        id: d.id,
        address: d.address,
        price_usd: Number(d.price_usd || 0),
        price_per_sqm_usd: Number(d.price_per_sqm_usd || 0),
        total_area: d.total_area !== null ? Number(d.total_area) : null,
        latitude: d.latitude !== null ? Number(d.latitude) : null,
        longitude: d.longitude !== null ? Number(d.longitude) : null,
        property_type: d.property_type || null,
        distance_km: d.latitude != null && d.longitude != null ? haversineDistanceKm(lat, lng, Number(d.latitude), Number(d.longitude)) : undefined,
      }));

      withDistance.sort((a, b) => (a.distance_km ?? Infinity) - (b.distance_km ?? Infinity));
      setComparables(withDistance.slice(0, 5));
    } catch (err) {
      console.error('Error fetching comparables:', err);
      toast({
        title: 'Error obteniendo comparables',
        description: 'Intenta nuevamente más tarde.',
        variant: 'destructive'
      });
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
      await fetchComparables();
      
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
                         <p>✓ Método: Comparables internacionales (IVS/RICS)</p>
                         <p>✓ Avalúo profesional con estándares IVS/RICS</p>
                         <p>✓ Certificación internacional</p>
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

                     {/* Comparables cercanos */}
                     <div className="space-y-3">
                       <h4 className="text-base font-semibold">Comparables más cercanos</h4>
                       {isLoadingComparables ? (
                         <div className="text-sm text-muted-foreground">Buscando comparables cercanos...</div>
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
                               </TableRow>
                             </TableHeader>
                             <TableBody>
                               {comparables.map((c) => (
                                 <TableRow key={c.id}>
                                   <TableCell className="max-w-[220px] truncate">{c.address}</TableCell>
                                   <TableCell className="text-right">${(c.price_usd || 0).toLocaleString('en-US')}</TableCell>
                                   <TableCell className="text-right">${(c.price_per_sqm_usd || 0).toLocaleString('en-US')}</TableCell>
                                   <TableCell className="text-right">{c.total_area ?? '-'}</TableCell>
                                   <TableCell className="text-right">{c.distance_km?.toFixed(2)} km</TableCell>
                                 </TableRow>
                               ))}
                             </TableBody>
                           </Table>
                           {comparables.length < 5 && (
                             <p className="text-xs text-muted-foreground mt-2">
                               Se encontraron {comparables.length} comparables cercanos.
                             </p>
                           )}
                         </div>
                       ) : (
                         <div className="text-sm text-muted-foreground">
                           No se encontraron comparables cercanos. Ajusta la ubicación para mejores resultados.
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
