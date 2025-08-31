import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calculator, MapPin, Building, DollarSign, FileText, HelpCircle, CheckCircle, AlertCircle, Shuffle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import SupabaseGoogleLocationMap from '@/components/SupabaseGoogleLocationMap';
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
  tipo_propiedad: string;
  area: number;
  precio_m2: number;
  precio_total: number;
  habitaciones?: number;
  banos?: number;
  direccion: string;
  fecha_venta: string;
  distancia?: number;
  estrato_social: string;
}

// Tipos de estrato social
export type EstratoSocial = 'bajo-bajo' | 'bajo' | 'medio-bajo' | 'medio' | 'medio-alto' | 'alto';

// Etiquetas para estratos sociales
export const estratoSocialLabels: Record<EstratoSocial, string> = {
  'bajo-bajo': 'Estrato 1 - Bajo-Bajo',
  'bajo': 'Estrato 2 - Bajo',
  'medio-bajo': 'Estrato 3 - Medio-Bajo',
  'medio': 'Estrato 4 - Medio',
  'medio-alto': 'Estrato 5 - Medio-Alto',
  'alto': 'Estrato 6 - Alto'
};

// Mapeo de estratos a clases sociales simplificadas
export const estratoToClassMap: Record<EstratoSocial, string> = {
  'bajo-bajo': 'popular',
  'bajo': 'popular',
  'medio-bajo': 'media',
  'medio': 'media',
  'medio-alto': 'alta',
  'alto': 'alta'
};

// Mapeo inverso: clases a estratos
export const classToEstratos: Record<string, EstratoSocial[]> = {
  'popular': ['bajo-bajo', 'bajo'],
  'media': ['medio-bajo', 'medio'],
  'alta': ['medio-alto', 'alto']
};

// Multiplicadores de valor según estrato social
export const estratoMultipliers: Record<EstratoSocial, number> = {
  'bajo-bajo': 0.7,
  'bajo': 0.8,
  'medio-bajo': 0.9,
  'medio': 1.0,
  'medio-alto': 1.2,
  'alto': 1.5
};

// Factores de conservación
export const conservationFactors: Record<string, number> = {
  'excelente': 1.15,
  'bueno': 1.0,
  'regular': 0.9,
  'malo': 0.75
};

// Multiplicadores por clase social
export const classMultipliers: Record<string, number> = {
  'popular': 0.75,
  'media': 1.0,
  'alta': 1.35
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
    estratoSocial: 'medio' as EstratoSocial
  });

  const [activeTab, setActiveTab] = useState<string>('');
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [selectedLanguage] = useState('es');

  const t = translations[selectedLanguage];

  // Funciones de validación de pasos
  const isStep1Complete = () => {
    return propertyData.estratoSocial && propertyData.estratoSocial !== 'medio';
  };

  const isStep2Complete = () => {
    return propertyData.tipoPropiedad !== '';
  };

  const isStep3Complete = () => {
    return propertyData.latitud !== 0 && propertyData.longitud !== 0 && propertyData.direccionCompleta !== '';
  };

  const isStep4Complete = () => {
    return propertyData.area > 0 && propertyData.estadoConservacion !== '';
  };

  const isStep5Complete = () => {
    if (propertyData.tipoPropiedad === 'terreno') return true;
    return propertyData.habitaciones > 0 && propertyData.banos > 0;
  };

  // Función para obtener el siguiente paso requerido
  const getNextRequiredStep = () => {
    if (!isStep1Complete()) return 1;
    if (!isStep2Complete()) return 2;
    if (!isStep3Complete()) return 3;
    if (!isStep4Complete()) return 4;
    if (!isStep5Complete()) return 5;
    return 'valuacion';
  };

  const handleInputChange = (field: string, value: any) => {
    setPropertyData(prev => ({ ...prev, [field]: value }));
    
    // Auto-abrir el siguiente paso
    if (field === 'estratoSocial' && value && isStep2Complete()) {
      setActiveTab('tipo');
    } else if (field === 'tipoPropiedad' && value && isStep3Complete()) {
      setActiveTab('ubicacion');
    } else if ((field === 'latitud' || field === 'direccionCompleta') && value && isStep4Complete()) {
      setActiveTab('caracteristicas');
    } else if ((field === 'area' || field === 'estadoConservacion') && value && !isStep5Complete() && propertyData.tipoPropiedad !== 'terreno') {
      setActiveTab('detalles');
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string; neighborhood: string }) => {
    setPropertyData(prev => ({
      ...prev,
      latitud: location.lat,
      longitud: location.lng,
      direccionCompleta: location.address,
      barrio: location.neighborhood
    }));
  };

  const fetchComparables = async () => {
    try {
      const { data, error } = await supabase
        .from('property_comparables')
        .select('*')
        .eq('tipo_propiedad', propertyData.tipoPropiedad)
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
        const avgPricePerM2 = comparablesData.reduce((sum, comp) => sum + comp.precio_m2, 0) / comparablesData.length;
        basePrice = avgPricePerM2;
      }

      // Aplicar factores de ajuste
      const estratoMultiplier = estratoMultipliers[propertyData.estratoSocial];
      const conservationMultiplier = conservationFactors[propertyData.estadoConservacion];
      const ageMultiplier = Math.max(0.7, 1 - (propertyData.antiguedad * 0.02));

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
      estratoSocial: 'medio' as EstratoSocial
    });
    setActiveTab('');
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
              
              {/* Guía de pasos mejorada */}
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950 dark:via-cyan-950 dark:to-indigo-950 rounded-xl border-2 border-blue-200 dark:border-blue-700 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <Info className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-lg text-blue-900 dark:text-blue-100">🎯 Guía de Pasos</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reiniciarFormulario}
                    className="ml-auto text-xs h-8 hover:bg-blue-100 dark:hover:bg-blue-900 hover:scale-105 transition-all"
                  >
                    🔄 Reiniciar
                  </Button>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-4 font-medium">
                  {getNextRequiredStep() === 'valuacion'
                    ? "🎉 ¡Todos los pasos están completados! Ahora puede realizar la valuación tocando el botón 'Realizar Valuación'."
                    : getNextRequiredStep() 
                      ? `📋 Complete el Paso ${getNextRequiredStep()} para continuar con la valuación.`
                      : "✅ ¡Todos los pasos están completados! Puede proceder con la valuación."
                  }
                </p>
                <div className="flex items-center gap-3 flex-wrap">
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                          isComplete 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-4 ring-green-200 scale-110' 
                            : isCurrent 
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white ring-4 ring-orange-200 animate-pulse scale-110' 
                              : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 scale-95'
                        }`}
                      >
                        {isComplete ? '✓' : step}
                      </div>
                    );
                  })}
                  {/* Indicador del botón de valuación */}
                  <div className={`px-4 h-10 rounded-full flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-300 ${
                    getNextRequiredStep() === 'valuacion' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white ring-4 ring-purple-200 animate-pulse scale-110' 
                      : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 scale-95'
                  }`}>
                    📊 Valuación
                  </div>
                </div>
              </div>
              
              {/* Paso 1: Estrato Social */}
              <div className={`mb-6 p-6 rounded-xl border-2 transition-all duration-300 shadow-md ${
                highlightedElement === 'estrato-social-select' 
                  ? 'ring-4 ring-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-300 shadow-yellow-200' 
                  : isStep1Complete() 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700 shadow-green-200'
                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700 shadow-blue-200'
              }`} id="estrato-social-select">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                    isStep1Complete() 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-2 ring-green-200' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white ring-2 ring-blue-200'
                  }`}>
                    {isStep1Complete() ? '✓' : '1'}
                  </div>
                  <Label htmlFor="estratoSocial" className="text-lg font-bold">🏘️ Paso 1: Estrato Social</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4 ml-11">¿Cómo te consideras donde vives?</p>
                <div className="ml-11">
                  <Select value={propertyData.estratoSocial} onValueChange={(value: EstratoSocial) => handleInputChange('estratoSocial', value)}>
                    <SelectTrigger className="border-2 focus:border-primary hover:border-primary/70 transition-colors">
                      <SelectValue placeholder="Selecciona el estrato social" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(estratoSocialLabels) as [EstratoSocial, string][]).map(([key, label]) => {
                        return (
                          <SelectItem key={key} value={key} className="font-medium">
                            {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 Requerido para encontrar comparables del mismo nivel socioeconómico según normas latinoamericanas
                  </p>
                </div>
              </div>

              {/* Paso 2: Tipo de Propiedad */}
              <div className={`mb-6 p-6 rounded-xl border-2 transition-all duration-300 shadow-md ${
                isStep2Complete() 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-300 dark:border-green-700 shadow-green-200'
                  : isStep1Complete()
                    ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-300 dark:border-blue-700 shadow-blue-200'
                    : 'bg-gray-50 dark:bg-gray-950 border-gray-300 dark:border-gray-700 opacity-60'
              }`} id="tipo-propiedad-select">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                    isStep2Complete() 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-2 ring-green-200' 
                      : isStep1Complete() 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white ring-2 ring-blue-200' 
                        : 'bg-gray-400 text-white'
                  }`}>
                    {isStep2Complete() ? '✓' : '2'}
                  </div>
                  <Label htmlFor="tipoPropiedad" className="text-lg font-bold">🏠 Paso 2: Tipo de Propiedad</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4 ml-11">Selecciona el tipo de propiedad a valuar</p>
                <div className="ml-11">
                  <Select 
                    value={propertyData.tipoPropiedad} 
                    onValueChange={(value) => handleInputChange('tipoPropiedad', value)}
                    disabled={!isStep1Complete()}
                  >
                    <SelectTrigger className="border-2 focus:border-primary hover:border-primary/70 transition-colors">
                      <SelectValue placeholder="Selecciona el tipo de propiedad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa" className="font-medium">🏠 Casa</SelectItem>
                      <SelectItem value="apartamento" className="font-medium">🏢 Apartamento</SelectItem>
                      <SelectItem value="terreno" className="font-medium">🌳 Terreno</SelectItem>
                      <SelectItem value="comercial" className="font-medium">🏪 Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pasos colapsables */}
              <div className="space-y-6">
                
                {/* Paso 3: Ubicación */}
                {(isStep1Complete() && isStep2Complete()) && (
                  <Card className={`transition-all duration-300 border-2 shadow-xl hover:shadow-2xl ${
                    activeTab === 'ubicacion' 
                      ? 'ring-4 ring-primary/50 shadow-primary/30 border-primary bg-gradient-to-r from-primary/5 to-secondary/5 scale-[1.02]' 
                      : isStep3Complete()
                        ? 'border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:scale-[1.01]'
                        : 'border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 hover:border-primary/50 hover:scale-[1.01]'
                  }`}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/70 transition-all duration-200 p-6 rounded-t-xl group"
                      onClick={() => setActiveTab(activeTab === 'ubicacion' ? '' : 'ubicacion')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110 ${
                            isStep3Complete() 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-4 ring-green-200' 
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white ring-4 ring-blue-200'
                          }`}>
                            {isStep3Complete() ? '✓' : '3'}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                              🌍 Paso 3: Ubicación de la Propiedad
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {isStep3Complete() 
                                ? `✅ Ubicación: ${propertyData.direccionCompleta.substring(0, 50)}...`
                                : '📍 Haga clic para ingresar la ubicación de la propiedad'
                              }
                            </p>
                          </div>
                        </div>
                        <div className={`transform transition-transform duration-300 text-2xl group-hover:scale-125 ${
                          activeTab === 'ubicacion' ? 'rotate-180 text-primary' : 'text-muted-foreground'
                        }`}>
                          <ChevronDown />
                        </div>
                      </div>
                    </CardHeader>
                    
                    {activeTab === 'ubicacion' && (
                      <CardContent className="border-t-2 border-primary/20 p-6 bg-background/80 backdrop-blur-sm">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <Label htmlFor="direccion" className="text-base font-semibold text-foreground mb-2 block">
                                📍 Dirección Completa
                              </Label>
                              <Input
                                id="direccion"
                                value={propertyData.direccionCompleta}
                                onChange={(e) => handleInputChange('direccionCompleta', e.target.value)}
                                placeholder="Ingrese la dirección completa"
                                className="border-2 focus:border-primary"
                              />
                            </div>
                            <div>
                              <Label className="text-base font-semibold text-foreground mb-3 block">
                                🗺️ Seleccione la ubicación en el mapa
                              </Label>
                              <div className="border-2 border-primary/20 rounded-lg overflow-hidden shadow-md">
                                <SupabaseGoogleLocationMap />
                              </div>
                            </div>
                            {isStep3Complete() && (
                              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                  ✅ Ubicación confirmada: {propertyData.direccionCompleta}
                                </p>
                                {propertyData.barrio && (
                                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                    📍 Barrio: {propertyData.barrio}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Paso 4: Características Básicas */}
                {(isStep1Complete() && isStep2Complete() && isStep3Complete()) && (
                  <Card className={`transition-all duration-300 border-2 shadow-xl hover:shadow-2xl ${
                    activeTab === 'caracteristicas' 
                      ? 'ring-4 ring-primary/50 shadow-primary/30 border-primary bg-gradient-to-r from-primary/5 to-secondary/5 scale-[1.02]' 
                      : isStep4Complete()
                        ? 'border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:scale-[1.01]'
                        : 'border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 hover:border-primary/50 hover:scale-[1.01]'
                  }`}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/70 transition-all duration-200 p-6 rounded-t-xl group"
                      onClick={() => setActiveTab(activeTab === 'caracteristicas' ? '' : 'caracteristicas')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110 ${
                            isStep4Complete() 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-4 ring-green-200' 
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white ring-4 ring-blue-200'
                          }`}>
                            {isStep4Complete() ? '✓' : '4'}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                              📐 Paso 4: Características Básicas
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {isStep4Complete() 
                                ? `✅ Área: ${propertyData.area}m² - Estado: ${propertyData.estadoConservacion}`
                                : '📝 Haga clic para ingresar área y estado de conservación'
                              }
                            </p>
                          </div>
                        </div>
                        <div className={`transform transition-transform duration-300 text-2xl group-hover:scale-125 ${
                          activeTab === 'caracteristicas' ? 'rotate-180 text-primary' : 'text-muted-foreground'
                        }`}>
                          <ChevronDown />
                        </div>
                      </div>
                    </CardHeader>
                    
                    {activeTab === 'caracteristicas' && (
                      <CardContent className="border-t-2 border-primary/20 p-6 bg-background/80 backdrop-blur-sm">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="area" className="text-base font-semibold text-foreground mb-2 block">
                                📐 Área Total (m²) *
                              </Label>
                              <Input
                                id="area"
                                type="number"
                                value={propertyData.area || ''}
                                onChange={(e) => handleInputChange('area', Number(e.target.value))}
                                placeholder="Ej: 120"
                                className="border-2 focus:border-primary"
                                min="1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="antiguedad" className="text-base font-semibold text-foreground mb-2 block">
                                🗓️ Antigüedad (años)
                              </Label>
                              <Input
                                id="antiguedad"
                                type="number"
                                value={propertyData.antiguedad || ''}
                                onChange={(e) => handleInputChange('antiguedad', Number(e.target.value))}
                                placeholder="Ej: 5"
                                className="border-2 focus:border-primary"
                                min="0"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="estadoConservacion" className="text-base font-semibold text-foreground mb-2 block">
                              🔨 Estado de Conservación *
                            </Label>
                            <Select 
                              value={propertyData.estadoConservacion} 
                              onValueChange={(value) => handleInputChange('estadoConservacion', value)}
                            >
                              <SelectTrigger className="border-2 focus:border-primary">
                                <SelectValue placeholder="Selecciona el estado de conservación" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="excelente" className="font-medium">⭐ Excelente</SelectItem>
                                <SelectItem value="bueno" className="font-medium">✅ Bueno</SelectItem>
                                <SelectItem value="regular" className="font-medium">⚠️ Regular</SelectItem>
                                <SelectItem value="malo" className="font-medium">❌ Malo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {isStep4Complete() && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                ✅ Características básicas completadas
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}

                {/* Paso 5: Detalles Adicionales (Solo para casas y apartamentos) */}
                {(isStep1Complete() && isStep2Complete() && isStep3Complete() && isStep4Complete() && propertyData.tipoPropiedad !== 'terreno') && (
                  <Card className={`transition-all duration-300 border-2 shadow-xl hover:shadow-2xl ${
                    activeTab === 'detalles' 
                      ? 'ring-4 ring-primary/50 shadow-primary/30 border-primary bg-gradient-to-r from-primary/5 to-secondary/5 scale-[1.02]' 
                      : isStep5Complete()
                        ? 'border-green-300 dark:border-green-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 hover:scale-[1.01]'
                        : 'border-blue-300 dark:border-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 hover:border-primary/50 hover:scale-[1.01]'
                  }`}>
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/70 transition-all duration-200 p-6 rounded-t-xl group"
                      onClick={() => setActiveTab(activeTab === 'detalles' ? '' : 'detalles')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110 ${
                            isStep5Complete() 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-4 ring-green-200' 
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white ring-4 ring-blue-200'
                          }`}>
                            {isStep5Complete() ? '✓' : '5'}
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                              🏠 Paso 5: Detalles Adicionales
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {isStep5Complete() 
                                ? `✅ ${propertyData.habitaciones} hab, ${propertyData.banos} baños, ${propertyData.parqueaderos} parqueaderos`
                                : '🏠 Haga clic para ingresar habitaciones, baños y parqueaderos'
                              }
                            </p>
                          </div>
                        </div>
                        <div className={`transform transition-transform duration-300 text-2xl group-hover:scale-125 ${
                          activeTab === 'detalles' ? 'rotate-180 text-primary' : 'text-muted-foreground'
                        }`}>
                          <ChevronDown />
                        </div>
                      </div>
                    </CardHeader>
                    
                    {activeTab === 'detalles' && (
                      <CardContent className="border-t-2 border-primary/20 p-6 bg-background/80 backdrop-blur-sm">
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <Label htmlFor="habitaciones" className="text-base font-semibold text-foreground mb-2 block">
                                🛏️ Habitaciones *
                              </Label>
                              <Input
                                id="habitaciones"
                                type="number"
                                value={propertyData.habitaciones || ''}
                                onChange={(e) => handleInputChange('habitaciones', Number(e.target.value))}
                                placeholder="Ej: 3"
                                className="border-2 focus:border-primary"
                                min="1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="banos" className="text-base font-semibold text-foreground mb-2 block">
                                🚿 Baños *
                              </Label>
                              <Input
                                id="banos"
                                type="number"
                                value={propertyData.banos || ''}
                                onChange={(e) => handleInputChange('banos', Number(e.target.value))}
                                placeholder="Ej: 2"
                                className="border-2 focus:border-primary"
                                min="1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="parqueaderos" className="text-base font-semibold text-foreground mb-2 block">
                                🚗 Parqueaderos
                              </Label>
                              <Input
                                id="parqueaderos"
                                type="number"
                                value={propertyData.parqueaderos || ''}
                                onChange={(e) => handleInputChange('parqueaderos', Number(e.target.value))}
                                placeholder="Ej: 1"
                                className="border-2 focus:border-primary"
                                min="0"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="descripcion" className="text-base font-semibold text-foreground mb-2 block">
                              📝 Descripción Adicional
                            </Label>
                            <Textarea
                              id="descripcion"
                              value={propertyData.descripcion}
                              onChange={(e) => handleInputChange('descripcion', e.target.value)}
                              placeholder="Describa características especiales de la propiedad..."
                              className="border-2 focus:border-primary"
                              rows={3}
                            />
                          </div>
                          {isStep5Complete() && (
                            <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                                ✅ Detalles adicionales completados
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botón de Valuación */}
          <Card className="shadow-xl border-2 border-primary/30">
            <CardContent className="p-6">
              {getNextRequiredStep() !== 'valuacion' ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">⚠️ Complete todos los pasos</h3>
                  <p className="text-muted-foreground mb-4">
                    Debe completar el Paso {getNextRequiredStep()} antes de realizar la valuación.
                  </p>
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Paso {getNextRequiredStep()} pendiente
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mb-4">
                    <Calculator className="w-16 h-16 text-primary mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4">🎉 ¡Listo para la valuación!</h3>
                  <Button
                    onClick={performValuation}
                    disabled={isCalculating}
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
              )}
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