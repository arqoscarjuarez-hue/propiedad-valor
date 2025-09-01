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
  | 'medio_bajo' | 'medio_alto' 
  | 'alto_medio' | 'alto_alto';

// Etiquetas para estratos sociales
export const estratoSocialLabels: Record<EstratoSocial, string> = {
  // Nivel Bajo
  'bajo_bajo': 'Estrato 1 - Bajo-Bajo',
  'bajo_medio': 'Estrato 2 - Bajo-Medio',
  'bajo_alto': 'Estrato 3 - Bajo-Alto',
  
  // Nivel Medio
  'medio_bajo': 'Estrato 4 - Medio-Bajo',
  'medio_alto': 'Estrato 5 - Medio-Alto',
  
  // Nivel Alto
  'alto_medio': 'Estrato 6 - Alto-Medio',
  'alto_alto': 'Estrato 7 - Alto-Alto'
};

// Mapeo de estratos a clases sociales simplificadas
export const estratoToClassMap: Record<EstratoSocial, string> = {
  // Clase Popular/Baja
  'bajo_bajo': 'popular',
  'bajo_medio': 'popular',
  'bajo_alto': 'popular',
  
  // Clase Media
  'medio_bajo': 'media',
  'medio_alto': 'media',
  
  // Clase Alta
  'alto_medio': 'alta',
  'alto_alto': 'alta'
};

// Mapeo inverso: clases a estratos (solo los que existen en la DB)
export const classToEstratos: Record<string, EstratoSocial[]> = {
  'popular': ['bajo_bajo', 'bajo_medio', 'bajo_alto'],
  'media': ['medio_bajo', 'medio_alto'],
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

  const [activeTab, setActiveTab] = useState<string>('estrato');
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [selectedLanguage] = useState('es');

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
    return true; // Ya no hay paso 5
  };

  // Función para obtener el siguiente paso requerido
  const getNextRequiredStep = () => {
    if (!isStep1Complete()) return 1;
    if (!isStep2Complete()) return 2;
    if (!isStep3Complete()) return 3;
    if (!isStep4Complete()) return 4;
    return 'valuacion';
  };

  const handleInputChange = (field: string, value: any) => {
    console.log('INPUT CHANGE:', field, value);
    setPropertyData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('PROPERTY DATA UPDATED:', updated);
      return updated;
    });
    
    // Auto-abrir el siguiente paso
    if (field === 'estratoSocial' && value && isStep2Complete()) {
      setActiveTab('tipo');
    } else if (field === 'tipoPropiedad' && value && isStep3Complete()) {
      setActiveTab('ubicacion');
    } else if ((field === 'latitud' || field === 'direccionCompleta') && value && isStep4Complete()) {
      setActiveTab('caracteristicas');
    } else if ((field === 'area' || field === 'construction_area') && value && getNextRequiredStep() === 'valuacion') {
      setActiveTab('valuacion');
    }
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
      const { data, error } = await supabase
        .from('property_comparables')
        .select('*')
        .eq('property_type', propertyData.tipoPropiedad)
        .in('estrato_social', classToEstratos[estratoToClassMap[propertyData.estratoSocial]])
        .limit(10);

      if (error) {
        console.error('Error fetching comparables:', error);
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

      let basePrice = 1500000; // Precio base por m² en pesos colombianos
      
      if (comparablesData.length > 0) {
        const avgPricePerM2 = comparablesData.reduce((sum, comp) => sum + comp.price_per_sqm_usd, 0) / comparablesData.length;
        basePrice = avgPricePerM2;
      }

      // Aplicar factores de ajuste
      const estratoMultiplier = estratoMultipliers[propertyData.estratoSocial];
      const conservationMultiplier = conservationFactors[propertyData.estadoConservacion] || 1;
      const ageMultiplier = Math.max(0.7, 1 - (propertyData.antiguedad * 0.02));
      
      console.log('FACTORES DE DEPRECIACIÓN APLICADOS:', {
        estadoSeleccionado: propertyData.estadoConservacion,
        conservationMultiplier,
        todosLosfactores: conservationFactors
      });

      const adjustedPrice = basePrice * estratoMultiplier * conservationMultiplier * ageMultiplier;
      const totalValue = adjustedPrice * propertyData.area;

      const result = {
        valorTotal: totalValue,
        valorPorM2: adjustedPrice,
        factores: {
          estrato: estratoMultiplier,
          conservacion: conservationMultiplier,
          antiguedad: ageMultiplier
        },
        metodologia: "Método de Comparación de Mercado según normas UPAV e IVSC",
        fecha: new Date().toLocaleDateString(),
        comparables: comparablesData.length
      };

      setValuationResult(result);
      toast.success("¡Valuación completada exitosamente!");
      
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
                  <TabsList className="grid w-full grid-cols-6 gap-2 h-auto p-2 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-2xl border-2 border-violet-300 shadow-2xl backdrop-blur-sm">
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
                  
                  {/* Paso 1: Estrato Social */}
                  <TabsContent value="estrato" className="mt-6">
                    <Card className="border-2 border-violet-200 shadow-xl bg-gradient-to-br from-violet-50/50 to-purple-50/50">
                      <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            {isStep1Complete() ? '✓' : '1'}
                          </div>
                          🏘️ Paso 1: Estrato Social
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground mb-4">¿En qué estrato socioeconómico vives?</p>
                        <Select 
                          value={propertyData.estratoSocial} 
                          onValueChange={(value: EstratoSocial) => handleInputChange('estratoSocial', value)}
                        >
                          <SelectTrigger className="border-2 focus:border-violet-500 hover:border-violet-400 transition-colors">
                            <SelectValue placeholder="Selecciona tu estrato socioeconómico" />
                          </SelectTrigger>
                           <SelectContent className="max-h-60 bg-white dark:bg-gray-900 z-50">
                             {/* Nivel Bajo */}
                             <SelectItem value="bajo_bajo" className="font-medium text-sm py-3">
                               🏚️ {estratoSocialLabels['bajo_bajo']}
                             </SelectItem>
                             <SelectItem value="bajo_medio" className="font-medium text-sm py-3">
                               🏡 {estratoSocialLabels['bajo_medio']}
                             </SelectItem>
                             <SelectItem value="bajo_alto" className="font-medium text-sm py-3">
                               🏘️ {estratoSocialLabels['bajo_alto']}
                             </SelectItem>
                             
                             {/* Nivel Medio */}
                             <SelectItem value="medio_bajo" className="font-medium text-sm py-3">
                               🏙️ {estratoSocialLabels['medio_bajo']}
                             </SelectItem>
                             <SelectItem value="medio_alto" className="font-medium text-sm py-3">
                               🏰 {estratoSocialLabels['medio_alto']}
                             </SelectItem>
                             
                             {/* Nivel Alto */}
                             <SelectItem value="alto_medio" className="font-medium text-sm py-3">
                               🗼 {estratoSocialLabels['alto_medio']}
                             </SelectItem>
                             <SelectItem value="alto_alto" className="font-medium text-sm py-3">
                               🏰 {estratoSocialLabels['alto_alto']}
                             </SelectItem>
                           </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-3">
                          💡 Requerido para encontrar propiedades comparables del mismo nivel
                        </p>
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
                          🏠 Paso 2: Tipo de Propiedad
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground mb-4">Selecciona el tipo de propiedad a valuar</p>
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
                          🌍 Paso 3: Ubicación de la Propiedad
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
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
                          📐 Paso 4: Características Básicas
                        </CardTitle>
                      </CardHeader>
                       <CardContent className="p-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                             <Label htmlFor="areaTerreno" className="text-base font-semibold mb-2 block">
                               🌿 Área Total de Terreno (m²) *
                             </Label>
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
                               🏗️ Área Total de Construcción (m²) *
                             </Label>
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
                       </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Paso 5: Depreciación */}
                  <TabsContent value="depreciacion" className="mt-6">
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
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'NUEVO' 
                                      ? 'bg-green-100 border-l-4 border-green-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'NUEVO');
                                    setSelectedConservationState(selectedConservationState === 'NUEVO' ? null : 'NUEVO');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'NUEVO' ? 'font-bold text-green-800' : ''
                                  }`}>
                                    {propertyData.estadoConservacion === 'NUEVO' ? '✅ NUEVO' : 'NUEVO'}
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'BUENO' 
                                      ? 'bg-green-100 border-l-4 border-green-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'BUENO');
                                    setSelectedConservationState(selectedConservationState === 'BUENO' ? null : 'BUENO');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'BUENO' ? 'font-bold text-green-800' : ''
                                  }`}>
                                    {propertyData.estadoConservacion === 'BUENO' ? '✅ BUENO' : 'BUENO'}
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'MEDIO' 
                                      ? 'bg-blue-100 border-l-4 border-blue-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'MEDIO');
                                    setSelectedConservationState(selectedConservationState === 'MEDIO' ? null : 'MEDIO');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'MEDIO' ? 'font-bold text-blue-800' : ''
                                  }`}>
                                    {propertyData.estadoConservacion === 'MEDIO' ? '✅ MEDIO' : 'MEDIO'}
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'REGULAR' 
                                      ? 'bg-yellow-100 border-l-4 border-yellow-500 shadow-md transform scale-105' 
                                      : 'hover:bg-indigo-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'REGULAR');
                                    setSelectedConservationState(selectedConservationState === 'REGULAR' ? null : 'REGULAR');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'REGULAR' ? 'font-bold text-yellow-800' : ''
                                  }`}>
                                    {propertyData.estadoConservacion === 'REGULAR' ? '✅ REGULAR' : 'REGULAR'}
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'REPARACIONES SENCILLAS' 
                                      ? 'bg-blue-100 border-l-4 border-blue-500 shadow-md transform scale-105' 
                                      : 'hover:bg-blue-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'REPARACIONES SENCILLAS');
                                    setSelectedConservationState(selectedConservationState === 'REPARACIONES SENCILLAS' ? null : 'REPARACIONES SENCILLAS');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'REPARACIONES SENCILLAS' ? 'font-bold text-blue-800' : 'text-blue-600'
                                  }`}>
                                    {propertyData.estadoConservacion === 'REPARACIONES SENCILLAS' ? '✅ REPARACIONES SENCILLAS' : 'REPARACIONES SENCILLAS'}
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'REPARACIONES MEDIAS' 
                                      ? 'bg-blue-100 border-l-4 border-blue-500 shadow-md transform scale-105' 
                                      : 'hover:bg-blue-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'REPARACIONES MEDIAS');
                                    setSelectedConservationState(selectedConservationState === 'REPARACIONES MEDIAS' ? null : 'REPARACIONES MEDIAS');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'REPARACIONES MEDIAS' ? 'font-bold text-blue-800' : 'text-blue-600'
                                  }`}>
                                    {propertyData.estadoConservacion === 'REPARACIONES MEDIAS' ? '✅ REPARACIONES MEDIAS' : 'REPARACIONES MEDIAS'}
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'REPARACIONES IMPORTANTES' 
                                      ? 'bg-orange-100 border-l-4 border-orange-500 shadow-md transform scale-105' 
                                      : 'hover:bg-orange-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'REPARACIONES IMPORTANTES');
                                    setSelectedConservationState(selectedConservationState === 'REPARACIONES IMPORTANTES' ? null : 'REPARACIONES IMPORTANTES');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'REPARACIONES IMPORTANTES' ? 'font-bold text-orange-800' : 'text-orange-600'
                                  }`}>
                                    {propertyData.estadoConservacion === 'REPARACIONES IMPORTANTES' ? '✅ REPARACIONES IMPORTANTES' : 'REPARACIONES IMPORTANTES'}
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'DAÑOS GRAVES' 
                                      ? 'bg-red-100 border-l-4 border-red-500 shadow-md transform scale-105' 
                                      : 'hover:bg-red-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'DAÑOS GRAVES');
                                    setSelectedConservationState(selectedConservationState === 'DAÑOS GRAVES' ? null : 'DAÑOS GRAVES');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'DAÑOS GRAVES' ? 'font-bold text-red-800' : 'text-red-600'
                                  }`}>
                                    {propertyData.estadoConservacion === 'DAÑOS GRAVES' ? '✅ DAÑOS GRAVES' : 'DAÑOS GRAVES'}
                                  </td>
                                </tr>
                                <tr 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    propertyData.estadoConservacion === 'EN DESECHO' 
                                      ? 'bg-red-100 border-l-4 border-red-500 shadow-md transform scale-105' 
                                      : 'hover:bg-red-50'
                                  }`}
                                  onClick={() => {
                                    handleInputChange('estadoConservacion', 'EN DESECHO');
                                    setSelectedConservationState(selectedConservationState === 'EN DESECHO' ? null : 'EN DESECHO');
                                  }}
                                >
                                  <td className={`px-6 py-3 font-medium text-lg text-center ${
                                    propertyData.estadoConservacion === 'EN DESECHO' ? 'font-bold text-red-800' : 'text-red-700'
                                  }`}>
                                    {propertyData.estadoConservacion === 'EN DESECHO' ? '✅ EN DESECHO' : 'EN DESECHO'}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          
                          {/* Panel de confirmación de selección */}
                          {propertyData.estadoConservacion && (
                            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 shadow-lg">
                              <div className="flex items-center justify-center gap-3">
                                <span className="text-2xl">✅</span>
                                <div className="text-center">
                                  <p className="text-green-800 font-bold text-lg">
                                    Estado seleccionado: {propertyData.estadoConservacion}
                                  </p>
                                  <p className="text-green-700 text-sm">
                                    Factor de depreciación aplicado: <span className="font-bold">{conservationFactors[propertyData.estadoConservacion]?.toFixed(4)}</span>
                                  </p>
                                  <p className="text-green-600 text-xs mt-1">
                                    ✨ Este factor influye directamente en el cálculo del avalúo final
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          
                          {/* Panel de explicación detallada */}
                          {selectedConservationState && conservationExplanations[selectedConservationState] && (
                            <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-300 shadow-md">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xl font-bold text-indigo-800">
                                  📋 {selectedConservationState}
                                </h4>
                                <button 
                                  onClick={() => setSelectedConservationState(null)}
                                  className="text-indigo-600 hover:text-indigo-800 text-xl font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                              
                              <p className="text-indigo-700 font-medium text-lg mb-4">
                                {conservationExplanations[selectedConservationState].description}
                              </p>
                              
                              <div className="space-y-2">
                                <h5 className="font-semibold text-indigo-800">🔍 Características detalladas:</h5>
                                <ul className="space-y-2">
                                  {conservationExplanations[selectedConservationState].details.map((detail, index) => (
                                    <li key={index} className="flex items-start gap-2 text-indigo-700">
                                      <span className="text-indigo-500 font-bold">•</span>
                                      <span>{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <p className="text-sm text-indigo-700 text-center">
                              💡 Haga clic en cualquier estado para ver su explicación detallada.
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
                          💎 Realizar Valuación
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="text-center py-6">
                          <div className="mb-4">
                            <Calculator className="w-16 h-16 text-pink-500 mx-auto" />
                          </div>
                          <h3 className="text-xl font-bold mb-4">🎉 ¡Listo para la valuación!</h3>
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

          {/* Resultados de la Valuación */}
          {valuationResult && (
            <Card className="shadow-xl border-2 border-green-300 dark:border-green-700">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <CheckCircle className="w-8 h-8" />
                  🎊 Resultado de la Valuación
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-bold text-green-800 dark:text-green-200 mb-2">💰 Valor Total</h3>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      ${valuationResult.valorTotal?.toLocaleString('es-CO')} COP
                    </p>
                  </div>
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-2">📐 Valor por m²</h3>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      ${valuationResult.valorPorM2?.toLocaleString('es-CO')} COP
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border">
                    <h4 className="font-semibold text-foreground mb-2">📊 Factores de Ajuste Aplicados</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Estrato Social:</span>
                        <span className="font-semibold ml-2">{(valuationResult.factores?.estrato * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conservación:</span>
                        <span className="font-semibold ml-2">{(valuationResult.factores?.conservacion * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Antigüedad:</span>
                        <span className="font-semibold ml-2">{(valuationResult.factores?.antiguedad * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-lg border">
                    <h4 className="font-semibold text-foreground mb-2">📋 Detalles de la Valuación</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-muted-foreground">Metodología:</span> <span className="font-medium">{valuationResult.metodologia}</span></p>
                      <p><span className="text-muted-foreground">Fecha:</span> <span className="font-medium">{valuationResult.fecha}</span></p>
                      <p><span className="text-muted-foreground">Comparables utilizados:</span> <span className="font-medium">{valuationResult.comparables} propiedades</span></p>
                    </div>
                  </div>

                  <Button
                    onClick={reiniciarFormulario}
                    variant="outline" 
                    className="w-full mt-6 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    🔄 Nueva Valuación
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
