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

import { useLanguage } from '@/hooks/useLanguage';
import { LanguageSelector } from '@/components/LanguageSelector';
import LocationMap from './LocationMap';
import GoogleLocationMap from './GoogleLocationMap';
import SupabaseGoogleLocationMap from './SupabaseGoogleLocationMap';
import SimpleLocationMap from './SimpleLocationMap';
import CurrencySelector, { Currency, formatCurrency } from './CurrencySelector';
import { ShareButtons } from './ShareButtons';


import { sanitizeNumericInput } from '@/utils/validation';
import { getLandSizeFactor } from '@/utils/landSizeAdjustment';

// Traducciones / Translations
const translations = {
  es: {
    // UI Labels principales
    propertyValuator: 'Valuador de Propiedades',
    professionalSystem: 'Sistema profesional de valuación inmobiliaria',
    languageSelector: 'Idioma / Language',
    propertyData: 'Datos de la Propiedad',
    
    // Pestañas principales
    areas: 'Áreas',
    propertyType: 'Tipo',
    characteristics: 'Características',
    location: 'Ubicación',
    
    valuation: 'Ajuste de Valor',
    
    // Sección de áreas
    constructionAreas: 'Áreas de Construcción (m²)',
    totalBuiltArea: 'Área Total Construida',
    basement: 'Sótano',
    firstFloor: 'Primer Nivel',
    secondFloor: 'Segundo Nivel',
    thirdFloor: 'Tercer Nivel',
    fourthFloor: 'Cuarto Nivel',
    landArea: 'Área del Terreno',
    
    // Tipos de propiedad
    propertyTypeTitle: 'Tipo de Propiedad',
    selectPropertyType: 'Seleccionar',
    house: 'Casa',
    apartment: 'Apartamento',
    land: 'Terreno',
    commercial: 'Comercial',
    warehouse: 'Bodega',
    
    // Características
    propertyCharacteristics: 'Características de la Propiedad',
    temporalInfo: 'Información Temporal',
    qualityAndCondition: 'Calidad y Estado de la Propiedad',
    
    // Location Quality options
    excellentZone: 'Excelente',
    goodZone: 'Buena',
    mediumZone: 'Media',
    regularZone: 'Regular',
    badZone: 'Mala',
    locationQualityPlaceholder: 'Selecciona la calidad de ubicación',
    evaluateServices: 'Evalúa servicios, seguridad, accesibilidad',
    
    // General Condition options
    generalConditionLabel: 'Estado General de Conservación',
    conditionPlaceholder: 'Selecciona el estado de conservación',
    newCondition: 'EXCELENTE - Construcción nueva o recién remodelada',
    goodCondition: 'BUENA - Conservación adecuada, mantenimiento al corriente', 
    mediumCondition: 'MEDIO - Conservación promedio, uso normal visible',
    regularCondition: 'REGULAR - Desgaste visible, necesita mantenimiento',
    simpleRepairsCondition: 'REPARACIONES SENCILLAS - Pintura, detalles menores',
    mediumRepairsCondition: 'REPARACIONES MEDIAS - Cambio de pisos, plomería',
    importantRepairsCondition: 'REPARACIONES IMPORTANTES - Estructura, instalaciones',
    seriousDamageCondition: 'DAÑOS GRAVES - Problemas estructurales serios',
    wasteCondition: 'EN DESECHO - Demolición parcial necesaria',
    affectsPropertyValue: 'Afecta directamente el valor de la propiedad',
    
    
    // Características específicas de terreno
    landCharacteristics: 'Características del Terreno',
    topography: 'Topografía',
    selectTopography: 'Selecciona el tipo de topografía',
    flat: 'Plano',
    gentleSlope: 'Pendiente Suave',
    moderateSlope: 'Pendiente Moderada',
    steepSlope: 'Pendiente Pronunciada',
    irregular: 'Irregular',
    valuationType: 'Tipo de Valoración',
    selectValuationType: 'Selecciona el tipo de valoración',
    residentialUse: 'Residencial',
    commercialUse: 'Comercial',
    industrialUse: 'Industrial',
    agriculturalUse: 'Agrícola',
    
    // Explicaciones de estándares internacionales para terrenos
    internationalStandards: 'Estándares Internacionales IVS/RICS',
    topographyFactors: 'Factores de Topografía aplicados:',
    landUseFactors: 'Factores por Tipo de Uso aplicados:',
    flatLandExp: 'Terreno Plano (0-5% pendiente): +12% - Facilita construcción',
    gentleSlopeExp: 'Pendiente Suave (5-15%): +3% - Drenaje natural adecuado',
    moderateSlopeExp: 'Pendiente Moderada (15-25%): -7% - Costos adicionales',
    steepSlopeExp: 'Pendiente Pronunciada (25-40%): -20% - Requiere ingeniería especializada',
    irregularExp: 'Terreno Irregular (>40%): -25% - Desarrollo muy costoso',
    commercialUseExp: 'Uso Comercial: +28% - Mayor potencial de ingresos',
    industrialUseExp: 'Uso Industrial: +24% - Infraestructura especializada',
    residentialUseExp: 'Uso Residencial: -35% - Valor base estándar residencial',
    agriculturalUseExp: 'Uso Agrícola: -57% - Valor extensivo menor',
    
    // Summary sections
    characteristicsSummary: 'Resumen de Características:',
    propertyAge: 'Antigüedad:',
    propertyLocation: 'Ubicación:',
    propertyCondition: 'Estado:',
    propertyTopography: 'Topografía:',
    propertyValuationType: 'Tipo de Valoración:',
    notSpecified: 'No especificada',
    noSpecified: 'No especificado',
    
    // Letterhead and demo
    letterheadType: 'Tipo de Membrete para Reportes',
    selectLetterhead: 'Seleccionar tipo de membrete',
    viewDemo: 'Ver Demo de Uso',
    
    // Error messages
    errorTitle: 'Error',
    errorUpdatingData: 'Error al actualizar los datos de la propiedad',
    errorMinimumArea: 'Debe ingresar al menos un área de construcción mayor a 0',
    locationQuality: 'Calidad de Ubicación',
    locationDescription: 'Evalúa la zona y accesos',
    environmentalFactors: 'Factores Ambientales y Riesgos',
    environmentalDescription: 'Evalúa riesgos naturales y condiciones ambientales',
    environmentalExcellent: 'Excelente - Sin riesgos naturales, topografía favorable, clima estable',
    environmentalGood: 'Buena - Riesgos mínimos, condiciones ambientales aceptables',
    environmentalRegular: 'Regular - Algunos riesgos gestionables',
    environmentalPoor: 'Deficiente - Alto riesgo de inundación, deslizamiento u otros peligros',
    generalCondition: 'Estado General',
    conditionDescription: 'Condición física del inmueble',
    
    // Condiciones
    new: 'Nuevo',
    good: 'Bueno',
    medium: 'Medio',
    regular: 'Regular',
    simpleRepairs: 'Reparaciones Sencillas',
    mediumRepairs: 'Reparaciones Medias',
    importantRepairs: 'Reparaciones Importantes',
    seriousDamage: 'Daños Graves',
    waste: 'En Desecho',
    useless: 'Inservibles',
    
    // Ubicaciones
    excellent: 'Excelente',
    goodLocation: 'Buena',
    regularLocation: 'Regular',
    badLocation: 'Mala',
     
     // Ubicación
     locationSketch: 'Croquis de Ubicación',
     mapInstructions: 'Croquis de Ubicación: Marca la ubicación exacta de la propiedad en el mapa. Esto ayudará a proporcionar una valuación más precisa.',
     clickOnMap: 'Haz clic en el mapa para seleccionar la ubicación exacta de la propiedad',
     currentAddress: 'Dirección actual',
     viewMap: 'Ver Mapa',
     editData: 'Editar Datos',
     registeredAddress: 'Dirección Registrada:',
     coordinates: 'Coordenadas:',
     editLocationInstructions: 'Edita manualmente los datos de ubicación de la propiedad.',
     fullAddress: 'Dirección Completa',
     fullAddressPlaceholder: 'Ej: Calle 123, Colonia, Ciudad, Estado, CP',
     coordinatesNote: 'Las coordenadas del mapa se mantienen sin cambios',
     latitude: 'Latitud',
     longitude: 'Longitud',
     latitudePlaceholder: 'Ej: 19.4326',
     longitudePlaceholder: 'Ej: -99.1332',
    
    
    // Botones de acción
    calculate: 'Valuación',
    realizarValuacion: 'Realizar Valuación',
    regenerate: 'Regenerar Comparativas',
    downloadPDF: 'Descargar PDF',
    downloadWord: 'Descargar Word',
    
    // Resultado de valuación
    propertyValuationTitle: 'Valuación de la Propiedad',
    estimatedValue: 'Valor Estimado',
    priceAdjustment: 'Ajuste de Precio',
    adjustmentDescription: 'Ajusta el precio final basado en factores adicionales',
    marketAnalysisTitle: 'Análisis de Mercado',
    comparativeProperties: 'Propiedades Comparativas',
    selectComparatives: 'Seleccionar Comparables (3 de 10)',
    allComparatives: 'Todas las Propiedades Comparables',
    selectedForValuation: 'Seleccionadas para Avalúo',
    averagePrice: 'Precio Promedio',
    minPrice: 'Precio Mínimo',
    maxPrice: 'Precio Máximo',
    
    // Tabla de comparativas
    property: 'Propiedad',
    builtArea: 'Área Const.',
    price: 'Precio',
    priceM2: 'Precio/m²',
    distance: 'Distancia',
    
    // PDF Content
    residentialValuation: 'VALUACIÓN RESIDENCIAL',
    apartmentValuation: 'VALUACIÓN DE APARTAMENTO',
    landValuation: 'VALUACIÓN DE TERRENO',
    commercialValuation: 'VALUACIÓN COMERCIAL',
    residentialSubtitle: 'Avalúo Profesional de Casa Habitación',
    apartmentSubtitle: 'Avalúo Profesional de Unidad Habitacional',
    landSubtitle: 'Avalúo Profesional de Superficie - Estándares IVS/RICS',
    commercialSubtitle: 'Avalúo Profesional de Bien Comercial',
    marketAnalysis: 'Análisis Profesional de Valor de Mercado',
    propertyLocationPDF: 'UBICACIÓN DEL INMUEBLE',
    generalInfo: 'INFORMACIÓN GENERAL',
    type: 'Tipo',
    propertyAreas: 'ÁREAS DE LA PROPIEDAD',
    estimatedValuePDF: 'VALOR ESTIMADO',
    pricePerSqm: 'Precio por m²',
    basedOnComparables: 'Basado en 3 comparables',
    mapLocation: 'UBICACIÓN EN MAPA',
    address: 'Dirección',
    viewInGoogleMaps: 'Ver ubicación en Google Maps',
    photograph: 'Fotografía',
    totalPhotos: 'Total de fotografías en el expediente',
    captureDate: 'Fecha de captura',
    
    // Units
    sqm: 'm²',
    meters: 'm',
    years: 'años',
    
    // Messages
    calculatingValuation: 'Calculando Valuación',
    generatingReport: 'Generando avalúo con 3 comparables...',
    valuationCompleted: 'Valuación Completada',
    estimatedValueTitle: 'Valor estimado',
    comparables: 'comparables',
    comparativesUpdated: 'Comparativas Actualizadas',
    newComparativesGenerated: 'Se han generado nuevas propiedades cercanas',
    currencyChanged: 'Moneda Cambiada',
    valuationNowIn: 'Valuación ahora se muestra en',
      priceAdjusted: 'Precio Ajustado',
      adjustment: 'Ajuste',
      newValue: 'Nuevo valor',
      
      // PDF Additional labels
      professionalAppraisalSystem: 'Sistema profesional de avalúos, Evaluación de propiedades',
      coordinatesLabel: 'Coordenadas:',
      marketSummary: 'Resumen del Mercado:',
      propertyPhotographs: 'FOTOGRAFÍAS DEL INMUEBLE',
      comparablesAnnex: 'ANEXO: FICHAS DETALLADAS DE COMPARABLES',
      realProperty: '(Propiedad Real)',
      referenceProperty: '(Propiedad de Referencia)',
      locationCharacteristics: 'UBICACIÓN Y CARACTERÍSTICAS:',
      viewOnGoogleMaps: 'Ver ubicación en Google Maps',
      physicalCharacteristics: 'CARACTERÍSTICAS FÍSICAS:',
      priceInformation: 'INFORMACIÓN DE PRECIO:',
      
      // Share section
      shareAppraisal: 'COMPARTE ESTE AVALÚO',
      shareAppraisalText: 'Comparte este avalúo profesional en redes sociales:',
      clickSelectedLink: 'Hacer Click en el enlace seleccionado',
      whatsapp: 'WhatsApp',
      facebook: 'Facebook',
      twitter: 'Twitter',
      instagram: 'Instagram',
      tiktok: 'TikTok',
      linkedin: 'LinkedIn',
      visitWebsite: 'Visita nuestro sitio web:',
      getYourAppraisal: '¡Obtén tu propio avalúo profesional en nuestro sistema!',
      
      // Error messages
      errorGeneric: 'Error',
      errorCalculatingValuation: 'Ocurrió un error al calcular la valuación. Por favor intenta nuevamente.',
      errorPDFGeneration: 'Primero debes calcular la valuación para generar el PDF',
      errorWordGeneration: 'Primero debes calcular la valuación para generar el documento Word',
      errorGeneratingPDF: 'No se pudo generar el PDF',
      errorGeneratingWord: 'No se pudo generar el documento Word',
      searchingComparables: 'Buscando nuevas propiedades comparables cercanas...',
      pdfGenerated: 'PDF Generado',
      pdfGeneratedDesc: 'El avalúo completo se ha descargado correctamente',
      wordGenerated: 'Documento Word Generado',
      wordGeneratedDesc: 'El avalúo completo se ha descargado correctamente',
      
      // Disclaimer
      disclaimerText: 'Esta valuación es un estimado basado en los datos proporcionados. Se recomienda consultar con un perito valuador certificado para valuaciones oficiales.',
      
      // Método de la renta
      rentalMethodTitle: 'Valúo por el Método de la Renta',
      rentalMethodDescription: 'Si conoce el alquiler de la propiedad que quiere valuar, por favor escriba el monto',
      rentalAmountPlaceholder: 'Ingrese el monto del alquiler mensual',
      
      // Tooltips y explicaciones
      landAreaTooltip: 'Indique el área del terreno únicamente en metros cuadrados (m²). Para departamentos en niveles superiores al primero, el área de terreno deberá ser igual al área de construcción total.',
      observationsPlaceholder: 'Información adicional sobre el inmueble (máximo 500 caracteres)',
      selectServiceError: 'Debe seleccionar un servicio para continuar',
      maxCharactersNote: 'caracteres máximo',
     additionalInfo: 'Información adicional',
     optional: 'Opcional',
     propertyValuationResults: 'Resultados de Valuación',
     downloadDocuments: 'Descargar Documentos',
     shareValuation: 'Compartir Valuación',
     currencyValuation: 'Moneda de Valuación',
     needHelpSystem: '¿Necesitas ayuda para usar el sistema?',
     multilingual: 'Multiidioma',
     interfaceReports: 'Toda la interfaz y reportes se traducen automáticamente',
     // Currency selector
     exchangeRateUpdated: 'Tipos de Cambio Actualizados',
     exchangeRateError: 'No se pudieron actualizar los tipos de cambio. Se usarán las tasas anteriores.',
     exchangeRateNote: 'Los tipos de cambio se obtienen de ExchangeRate-API y se actualizan en tiempo real.',
     exchangeRateLabel: 'Tipo de cambio',
     lastUpdateText: 'Última actualización',
     // Valuation results panel
     valuationResultsTitle: 'Resultado de Valuación',
     basedOnComparablesText: 'Basado en 3 comparables',
     originalBaseValue: 'Valor base original',
     adjustmentLabel: 'Ajuste',
      newValueLabel: 'Nuevo valor'
    },
    en: {
      // Método de la renta
      rentalMethodTitle: 'Valuation by Income Method',
      rentalMethodDescription: 'If you know the rental income of the property you want to value, please enter the amount',
      rentalAmountPlaceholder: 'Enter monthly rental amount',
      disclaimerText: 'This valuation is an estimate based on the data provided. It is recommended to consult with a certified appraiser for official valuations.',
    }
  };

type Language = keyof typeof translations;

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
          console.log('Error de geolocalización:', error.message);
          console.log('Código de error:', error.code);
          // Ubicación no disponible, usando referencia silenciosamente
          console.log("Ubicación no disponible. Usando Ciudad de México como referencia.");
          resolve({ lat: 19.4326, lng: -99.1332 });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Aumenté el timeout
          maximumAge: 60000 // 1 minuto de cache
        }
      );
    });
  };
  
  // Función para obtener datos iniciales limpios (nuevo avalúo siempre)
  const getInitialData = () => {
    return {
      propertyData: {
        areaSotano: 0,
        areaPrimerNivel: 0,
        areaSegundoNivel: 0,
        areaTercerNivel: 0,
        areaCuartoNivel: 0,
        areaTerreno: 0,
        tipoPropiedad: '',
        ubicacion: '',
        estadoGeneral: '',
        latitud: 19.4326, // Valor inicial, se actualizará con geolocalización
        longitud: -99.1332,
        direccionCompleta: '',
        alquiler: 0
      },
      selectedCurrency: {
        code: 'USD',
        name: 'Dólar Estadounidense',
        symbol: '$',
        rate: 1
      },
      valuation: null,
      baseValuation: null,
      comparativeProperties: []
    };
  };

  const initialData = getInitialData();
  
  const [propertyData, setPropertyData] = useState<PropertyData>(initialData.propertyData);
  
  const [valuation, setValuation] = useState<number | null>(null);
  const [baseValuation, setBaseValuation] = useState<number | null>(null);
  
  const [multipleValuations, setMultipleValuations] = useState<Array<{
    id: number;
    valor: number;
    moneda: string;
  }>>([]);
  
  const [comparativeProperties, setComparativeProperties] = useState<ComparativeProperty[]>([]);
  const [selectedComparatives, setSelectedComparatives] = useState<ComparativeProperty[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('ubicacion');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialData.selectedCurrency);
  const [adjustmentPercentage, setAdjustmentPercentage] = useState(0);
  const [finalAdjustedValue, setFinalAdjustedValue] = useState<number | null>(null);
  const [propertyImages, setPropertyImages] = useState<string[]>([]);

  const { selectedLanguage: rawLanguage } = useLanguage();
  // Fallback to 'es' if the selected language is not available in translations
  const selectedLanguage = (rawLanguage in translations) ? rawLanguage : 'es';

  // Parámetros fijos del método de la renta (ajustados para ~81,600 USD con $400/mes)
  const RENTAL_CAP_RATE = 0.05; // 5%
  const RENTAL_EXPENSE_RATE = 0.15; // 15%

  // Cálculo derivado del método de la renta
  const grossAnnualRent = (propertyData.alquiler || 0) * 12;
  const netAnnualRent = grossAnnualRent * (1 - RENTAL_EXPENSE_RATE);
  const incomeMethodValue = RENTAL_CAP_RATE > 0 ? netAnnualRent / RENTAL_CAP_RATE : 0;

  // useEffect para obtener ubicación del usuario al cargar
  useEffect(() => {
    const initializeUserLocation = async () => {
      console.log('Inicializando ubicación del usuario...');
      
      try {
        const userLocation = await getUserLocation();
        console.log('Ubicación inicial obtenida:', userLocation);
        
        setPropertyData(prev => ({
          ...prev,
          latitud: userLocation.lat,
          longitud: userLocation.lng
        }));
        
        // Ubicación detectada silenciosamente
        const isUserLocation = userLocation.lat !== 19.4326 || userLocation.lng !== -99.1332;
        if (isUserLocation) {
          console.log(`Sistema configurado en: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`);
        }
      } catch (error) {
        console.error('Error inicializando ubicación:', error);
      }
    };
    
    initializeUserLocation();
  }, []);


  const convertCurrency = (amount: number, targetCurrency: Currency): number => {
    if (!targetCurrency || targetCurrency.rate <= 0) return amount;
    return amount / targetCurrency.rate;
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    
    if (valuation) {
      const convertedValuation = convertCurrency(valuation, currency);
      setValuation(convertedValuation);
    }
    
    if (baseValuation) {
      const convertedBaseValuation = convertCurrency(baseValuation, currency);
      setBaseValuation(convertedBaseValuation);
    }
    
    if (finalAdjustedValue) {
      const convertedFinalValue = convertCurrency(finalAdjustedValue, currency);
      setFinalAdjustedValue(convertedFinalValue);
    }
    
    const convertedComparatives = comparativeProperties.map(comp => ({
      ...comp,
      precio: convertCurrency(comp.precio, currency)
    }));
    setComparativeProperties(convertedComparatives);
    setSelectedComparatives(convertedComparatives.slice(0, 3));
    
    // Moneda cambiada silenciosamente
    console.log(`${translations[selectedLanguage].currencyChanged}: ${currency.name}`);
  };

  const handleInputChange = (field: keyof PropertyData, value: string | number) => {
    setPropertyData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Cuando se cambia el tipo de propiedad, limpiar campos específicos
      if (field === 'tipoPropiedad') {
        if (value === 'departamento') {
          // Para departamentos, limpiar todos los campos excepto areaPrimerNivel y resetear areaTerreno
          newData.areaSotano = 0;
          newData.areaSegundoNivel = 0;
          newData.areaTercerNivel = 0;
          newData.areaCuartoNivel = 0;
          newData.areaTerreno = 0;
        } else if (value === 'terreno') {
          // Para terrenos, limpiar todas las áreas de construcción
          newData.areaSotano = 0;
          newData.areaPrimerNivel = 0;
          newData.areaSegundoNivel = 0;
          newData.areaTercerNivel = 0;
          newData.areaCuartoNivel = 0;
        }
      }
      
      return newData;
    });
  };

  const handleLocationSelect = (lat: number, lng: number, address: string = '') => {
    setPropertyData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng,
      direccionCompleta: address || prev.direccionCompleta
    }));
  };

  const startNewValuation = async () => {
    console.log('Iniciando nuevo valúo...');
    
    try {
      // Obtener ubicación del usuario para el nuevo valúo
      const userLocation = await getUserLocation();
      console.log('Ubicación obtenida para nuevo valúo:', userLocation);
      
      // Reiniciar propertyData a valores iniciales con ubicación del usuario
      setPropertyData({
        areaSotano: 0,
        areaPrimerNivel: 0,
        areaSegundoNivel: 0,
        areaTercerNivel: 0,
        areaCuartoNivel: 0,
        areaTerreno: 0,
        tipoPropiedad: 'casa',
        ubicacion: '',
        estadoGeneral: '',
        
        latitud: userLocation.lat,
        longitud: userLocation.lng,
        direccionCompleta: ''
      });
      
      // Reiniciar todos los demás estados
      setValuation(null);
      setBaseValuation(null);
      setComparativeProperties([]);
      setSelectedComparatives([]);
      setIsCalculating(false);
      setActiveTab('ubicacion');
      setAdjustmentPercentage(0);
      setFinalAdjustedValue(null);
      setPropertyImages([]);
      setMultipleValuations([]);

      // Mostrar notificación de éxito con las coordenadas
      const isUserLocation = userLocation.lat !== 19.4326 || userLocation.lng !== -99.1332;
      
      // Nuevo valúo iniciado silenciosamente
      console.log(isUserLocation 
        ? `Ubicación detectada: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
        : "Usando ubicación de referencia (Ciudad de México)");
      
    } catch (error) {
      console.error('Error al iniciar nuevo valúo:', error);
      // Error silencioso
      console.error("Hubo un problema al detectar la ubicación.");
    }
  };

  // Función para validar que todos los pasos estén completos
  const isFormValid = () => {
    const completion = getStepCompletion();
    return completion.step4;
  };

  const calculateValuation = async () => {
    if (isCalculating) return; // Prevenir múltiples cálculos simultáneos
    
    setIsCalculating(true);
    try {
      const areaTotal = (propertyData.areaSotano || 0) + 
                       (propertyData.areaPrimerNivel || 0) + 
                       (propertyData.areaSegundoNivel || 0) + 
                       (propertyData.areaTercerNivel || 0) + 
                       (propertyData.areaCuartoNivel || 0);
      
      // Validación mejorada
      if (propertyData.tipoPropiedad !== 'terreno' && areaTotal <= 0) {
        // Error de área mínima - manejo silencioso
        console.error(translations[selectedLanguage].errorMinimumArea);
        setIsCalculating(false);
        return;
      }
      
      // Para departamentos, no validar área de terreno
      if (propertyData.tipoPropiedad !== 'departamento' && propertyData.areaTerreno <= 0) {
        // Error de área de terreno - manejo silencioso
        console.error("Debe ingresar un área de terreno mayor a 0");
        setIsCalculating(false);
        return;
      }

      // Generando reporte silenciosamente
      console.log(translations[selectedLanguage].generatingReport);

      // Sin bonificación por espacios ya que se eliminaron
      
      // Factores de ajuste según el tipo de propiedad
      let basePrice = 800; // USD por m² en mercado mexicano estándar
      
      // Ajustes específicos por tipo de propiedad
      const propertyTypeFactors = {
        'casa': 1.0,
        'departamento': 0.85,
        'terreno': 0.6,
        'comercial': 1.2,
        'bodega': 0.7
      };
      
      const propertyTypeFactor = propertyTypeFactors[propertyData.tipoPropiedad as keyof typeof propertyTypeFactors] || 1.0;
      
      // Factores de ubicación - Social Stratum Scale (decreasing curve - higher stratum = higher factor)
      const locationFactors = {
        // Para terrenos (Factores Ambientales y Riesgos)
        'mala': 0.01,                    // Deficiente - Base mínima (1% del valor)
        'vientos-fuertes': 0.16,         // +0.15
        'erosion-suelo': 0.29,           // +0.13
        'riesgo-hidrico': 0.40,          // +0.11
        'regular': 0.49,                 // +0.09
        'media': 0.56,                   // +0.07 (para propiedades no-terreno)
        'clima-favorable': 0.61,         // +0.05
        'drenaje-excelente': 0.64,       // +0.03
        'buena': 0.66,                   // +0.02
        'excelente': 0.67,               // +0.01 (máximo con menor incremento)
        
        // Para casas (Estratos Sociales) - Curva decreciente
        'estrato-1-elite': 1.50,         // Zona élite
        'estrato-2-alto-alto': 1.35,     // Zona alto-alto
        'estrato-3-alto-medio': 1.20,    // Zona alto-medio
        'estrato-4-alto-bajo': 1.00,     // Zona alto-bajo (base)
        'estrato-5-medio-alto': 0.85,    // Zona medio-alto
        'estrato-6-medio-medio': 0.75,   // Zona medio-medio
        'estrato-7-medio-bajo': 0.60,    // Zona medio-bajo
        'estrato-8-bajo-alto': 0.40,     // Zona bajo-alto
        'estrato-9-bajo-medio': 0.30,    // Zona bajo-medio
        'estrato-10-bajo-bajo': 0.20,    // Zona bajo-bajo
        'estrato-11-marginal': 0.05      // Zona marginal
      };
      
      const locationFactor = locationFactors[propertyData.ubicacion as keyof typeof locationFactors] || 1.0;
      
      // Factores de condición
      const conditionFactors = {
        'nuevo': 1.2,
        'bueno': 1.0,
        'medio': 0.85,
        'regular': 0.7,
        'reparaciones-sencillas': 0.6,
        'reparaciones-medias': 0.5,
        'reparaciones-importantes': 0.4,
        'danos-graves': 0.25,
        'en-desecho': 0.1
      };
      
      const conditionFactor = conditionFactors[propertyData.estadoGeneral as keyof typeof conditionFactors] || 1.0;
      
      
      // Lógica específica para terrenos
      if (propertyData.tipoPropiedad === 'terreno') {
        // Factor de precio base para terrenos (mucho menor que construcciones)
        const factorTerrenoBase = 0.5; // Ajuste IVS/RICS: base de terreno ~50% del precio de construcción
        
        console.log('🏞️ === CÁLCULO DE TERRENO PURO ===');
        console.log('📐 Área terreno:', propertyData.areaTerreno, 'm²');
        console.log('💰 Precio base construcción:', basePrice);
        console.log('🏞️ Factor terreno base:', factorTerrenoBase);
        console.log('🏗️ Factor tipo propiedad:', propertyTypeFactor);
        console.log('📍 Factor ubicación:', locationFactor);
        console.log('🔧 Factor condición:', conditionFactor);
        
        // Factores de tipo de valoración para terrenos
        const valuationTypeFactors = {
          'residencial': 0.65,
          'comercial': 2.00,     // Doble valoración (solicitado)
          'industrial': 2.00,    // Doble valoración (solicitado)
          'agricola': 0.011      // Ajustado para $15K con 6899m²
        };
        
        const valuationTypeFactor = valuationTypeFactors[propertyData.tipoValoracion as keyof typeof valuationTypeFactors] || 1.0;
        
        // Aplicar factores de tamaño y características del terreno (sin tipo de valoración para evitar duplicación)
        const landSizeFactor = getLandSizeFactor(
          propertyData.areaTerreno,
          propertyData.topografia, 
          undefined // No pasar tipoValoracion aquí para evitar duplicación
        );
        
        console.log('📏 Factor tamaño+características:', landSizeFactor);
        console.log('🏗️ Factor tipo valoración:', valuationTypeFactor, '(', propertyData.tipoValoracion, ')');
        
        const valorTerreno = propertyData.areaTerreno * basePrice * factorTerrenoBase * 
                           locationFactor * conditionFactor * 
                           landSizeFactor * valuationTypeFactor;
        
        console.log('💵 Valor terreno calculado:', valorTerreno.toLocaleString('es-ES', {
          style: 'currency',
          currency: 'USD'
        }));
        
        const valorFinal = convertCurrency(valorTerreno, selectedCurrency);
        
        setValuation(valorFinal);
        setBaseValuation(valorFinal);
        setFinalAdjustedValue(valorFinal);
        
      } else {
        // Lógica para propiedades construidas
        let areaTotalParaCalculo = areaTotal;
        
        // Para departamentos, duplicar el área para el cálculo
        if (propertyData.tipoPropiedad === 'departamento') {
          areaTotalParaCalculo = areaTotal * 2;
        }
        
        // Cálculo del valor de construcción
        const valorConstruccion = areaTotalParaCalculo * basePrice * propertyTypeFactor * locationFactor * conditionFactor;
        
        // Para casas, comercial y bodega, agregar valor del terreno
        let valorTotal = valorConstruccion;
        if (['casa', 'comercial', 'bodega'].includes(propertyData.tipoPropiedad) && propertyData.areaTerreno > 0) {
          let factorTerreno = 0.4; // Terreno vale 40% del precio de construcción por defecto
          
          // Ajustar factor según tipo de propiedad
          if (propertyData.tipoPropiedad === 'comercial') {
            factorTerreno = 0.6; // Terreno comercial vale más
          } else if (propertyData.tipoPropiedad === 'bodega') {
            factorTerreno = 0.3; // Terreno industrial vale menos
          }
          
          // Factores de topografía y tipo de valoración aplicables al terreno en propiedades construidas
          const topographyFactors = {
            'plano': 1.12,
            'pendiente-suave': 1.03,
            'pendiente-moderada': 0.93,
            'pendiente-pronunciada': 0.80,
            'irregular': 0.75
          };

          const valuationTypeFactors = {
            'residencial': 0.65,
            'comercial': 2.00,
            'industrial': 2.00,
            'agricola': 0.011
          };

          // Para terrenos, aplicamos todos los factores dentro de getLandSizeFactor 
          // para evitar duplicación
          const landSizeFactor = getLandSizeFactor(
            propertyData.areaTerreno, 
            propertyData.topografia, 
            propertyData.tipoValoracion
          );
          
          console.log('🧮 Cálculo de terreno:');
          console.log('📐 Área terreno:', propertyData.areaTerreno, 'm²');
          console.log('💰 Precio base:', basePrice);
          console.log('🏠 Factor terreno:', factorTerreno);
          console.log('🏗️ Factor tipo propiedad:', propertyTypeFactor);
          console.log('📍 Factor ubicación:', locationFactor);
          console.log('🔧 Factor condición:', conditionFactor);
          console.log('📏 Factor tamaño+características:', landSizeFactor);
          
          const valorTerreno = propertyData.areaTerreno * basePrice * factorTerreno * 
                               propertyTypeFactor * locationFactor * conditionFactor * landSizeFactor;
          
          console.log('💵 Valor terreno calculado:', valorTerreno.toLocaleString('es-ES', {
            style: 'currency',
            currency: 'USD'
          }));
          
          valorTotal = valorConstruccion + valorTerreno;
          
          console.log('🎯 Valor total final:', valorTotal.toLocaleString('es-ES', {
            style: 'currency', 
            currency: 'USD'
          }));
        }
        
        const valorFinal = convertCurrency(valorTotal, selectedCurrency);
        
        setValuation(valorFinal);
        setBaseValuation(valorFinal);
        setFinalAdjustedValue(valorFinal);
      }
      
      // Generar propiedades comparativas
      const comparables = await generateComparativeProperties(basePrice, 10);
      setComparativeProperties(comparables);
      setSelectedComparatives(comparables.slice(0, 3));
      
      // Valuación completada silenciosamente
      console.log(`${translations[selectedLanguage].valuationCompleted}: ${formatCurrency(convertCurrency(basePrice, selectedCurrency), selectedCurrency)}`);
      
    } catch (error) {
      // Error en cálculo - manejo silencioso
      console.error(translations[selectedLanguage].errorCalculatingValuation);
    } finally {
      setIsCalculating(false);
    }
  };

  const generateComparativeProperties = async (baseValue: number, numComparables: number = 10): Promise<ComparativeProperty[]> => {
    const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
    const lat = propertyData.latitud || 19.4326;
    const lng = propertyData.longitud || -99.1332;
    
    // Primero intentar buscar propiedades reales
    let nearbyAddresses = await searchNearbyProperties(lat, lng, propertyData.tipoPropiedad, numComparables);
    
    // Si no hay suficientes propiedades reales, completar con simuladas
    if (nearbyAddresses.length < numComparables) {
      const simulatedAddresses = await generateNearbyAddresses(lat, lng, numComparables - nearbyAddresses.length);
      nearbyAddresses = [...nearbyAddresses, ...simulatedAddresses];
    }
    
    // Procesar comparables de forma más eficiente para móviles
    const comparables = nearbyAddresses.map((addressInfo, index) => {
      try {
        const variation = (Math.random() - 0.5) * 0.2; // ±10% price variation
        
        // Lógica específica para terrenos vs propiedades construidas
        if (propertyData.tipoPropiedad === 'terreno') {
          // Para terrenos, solo usamos área del terreno, no área construida
          const areaVariationFactor = 0.6 + (Math.random() * 0.8); // Entre 0.6 y 1.4 (60% a 140% del área original)
          const areaTerrenoComparable = Math.round(propertyData.areaTerreno * areaVariationFactor);
          
          // Asegurar que esté dentro del rango ±40%
          const areaMinima = propertyData.areaTerreno * 0.6; // -40%
          const areaMaxima = propertyData.areaTerreno * 1.4; // +40%
          const areaTerrenoFinal = Math.max(areaMinima, Math.min(areaMaxima, areaTerrenoComparable));
          
          // Generar características específicas de terreno
          const topografias = ['terreno-plano', 'ondulado-suave', 'pendiente-leve', 'pendiente-moderada', 'pendiente-fuerte', 'pendiente-escarpada', 'afloramiento-rocoso', 'topografia-irregular', 'zona-humeda'];
          const tiposValoracion = ['residencial', 'comercial', 'industrial', 'agricola'];
          const topografiaComparable = topografias[Math.floor(Math.random() * topografias.length)];
          const tipoValoracionComparable = tiposValoracion[Math.floor(Math.random() * tiposValoracion.length)];
          
          return {
            id: `comp-${index + 1}`,
            address: addressInfo.address,
            areaConstruida: 0, // Terrenos no tienen área construida
            areaTerreno: areaTerrenoFinal,
            tipoPropiedad: 'terreno',
            
            ubicacion: propertyData.ubicacion,
            estadoGeneral: 'nuevo', // Terrenos se consideran en buen estado
            // Campos específicos para terrenos
            topografia: topografiaComparable,
            tipoValoracion: tipoValoracionComparable,
            precio: convertCurrency(baseValue * (1 + variation) * 0.85, selectedCurrency), // Aplicar descuento del 15%
            distancia: addressInfo.distance,
            descripcion: `Terreno de ${areaTerrenoFinal}m² con topografía ${topografiaComparable} para uso ${tipoValoracionComparable}. ${addressInfo.isReal ? 'Propiedad real encontrada en Google Maps' : 'Propiedad simulada'}.`,
            url: addressInfo.placeId ? `https://www.google.com/maps/place/?q=place_id:${addressInfo.placeId}` : `https://propiedades.com/terreno/${Math.random().toString(36).substr(2, 9)}`,
            latitud: addressInfo.lat,
            longitud: addressInfo.lng
          };
        } else {
          // Lógica para propiedades construidas específicas por tipo
          const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
          
          // Generar comparables del mismo tipo de propiedad
          const tipoComparable = propertyData.tipoPropiedad; // Mantener el mismo tipo exacto
          
          // Variaciones específicas por tipo de propiedad
          const getPropertyVariations = (tipo: string) => {
            switch (tipo) {
              case 'casa':
                return {
                  areaVariation: 0.6 + (Math.random() * 0.8), // ±40% para casas
                  
                  terrenoVariation: 0.7 + (Math.random() * 0.6) // ±30% terreno
                };
              case 'departamento':
                return {
                  areaVariation: 0.7 + (Math.random() * 0.6), // ±30% para departamentos
                  
                  terrenoVariation: 0.9 + (Math.random() * 0.2) // ±10% terreno (departamentos tienen menos variación)
                };
              case 'comercial':
                return {
                  areaVariation: 0.5 + (Math.random() * 1.0), // ±50% para comerciales
                  
                  terrenoVariation: 0.6 + (Math.random() * 0.8) // ±40% terreno
                };
              case 'bodega':
                return {
                  areaVariation: 0.4 + (Math.random() * 1.2), // ±60% para bodegas
                  
                  terrenoVariation: 0.5 + (Math.random() * 1.0) // ±50% terreno
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
          
          // Generar descripción específica por tipo
          const getPropertyDescription = (tipo: string, area: number) => {
            switch (tipo) {
              case 'casa':
                return `Casa de ${area}m²`;
              case 'departamento':
                return `Departamento de ${area}m²`;
              case 'comercial':
                return `Local comercial de ${area}m²`;
              case 'bodega':
                return `Bodega de ${area}m²`;
              default:
                return `${tipo} de ${area}m²`;
            }
          };
          
          return {
            id: `comp-${index + 1}`,
            address: addressInfo.address,
            areaConstruida: areaComparable,
            areaTerreno: terrenoComparable,
            tipoPropiedad: tipoComparable, // Mantener exactamente el mismo tipo
            
            ubicacion: propertyData.ubicacion,
            estadoGeneral: propertyData.estadoGeneral,
            precio: convertCurrency(baseValue * (1 + variation) * 0.85, selectedCurrency), // Aplicar descuento del 15%
            distancia: addressInfo.distance,
            descripcion: `${getPropertyDescription(tipoComparable, areaComparable)}. ${addressInfo.isReal ? 'Propiedad real encontrada en Google Maps' : 'Propiedad simulada'}.`,
            url: addressInfo.placeId ? `https://www.google.com/maps/place/?q=place_id:${addressInfo.placeId}` : `https://propiedades.com/inmueble/${Math.random().toString(36).substr(2, 9)}`,
            latitud: addressInfo.lat,
            longitud: addressInfo.lng
          };
        }
      } catch (error) {
        console.error('Error procesando comparable:', error);
        // Comparable fallback más simple
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
          // Campos específicos para terrenos
          ...(isTerreno && {
            topografia: propertyData.topografia || 'plano',
            tipoValoracion: propertyData.tipoValoracion || 'residencial'
          }),
          precio: convertCurrency(baseValue * 0.85, selectedCurrency), // Aplicar descuento del 15%
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
        'bodega': 'bodegas en venta',
        'oficina': 'oficinas en venta',
        'local': 'locales en venta',
        'consultorio': 'consultorios en venta',
        'restaurant': 'restaurantes en venta',
        'hotel': 'hoteles en venta'
      };
      
      const query = propertyTypeQueries[propertyType as keyof typeof propertyTypeQueries] || 'propiedades en venta';
      
      // Timeout más corto para móviles
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
            radius: 2000 // 2km radius
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
    // Para departamentos, no requiere área de terreno
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
    
    // Precio ajustado silenciosamente
    console.log(`${translations[selectedLanguage].priceAdjusted}: ${percentage > 0 ? '+' : ''}${percentage}%`);
  };

  const regenerateComparatives = async () => {
    if (!baseValuation) return;
    
    try {
      // Búsqueda de comparables iniciada silenciosamente
      console.log("Generando nuevas propiedades cercanas...");
      
      const newComparables = await generateComparativeProperties(baseValuation);
      setComparativeProperties(newComparables);
      setSelectedComparatives(newComparables.slice(0, 3));
      
      // Comparativas actualizadas silenciosamente
      console.log(translations[selectedLanguage].newComparativesGenerated);
    } catch (error) {
      // Error al generar comparativas - manejo silencioso
      console.error("Error al generar nuevas comparativas");
    }
  };

  const generatePDF = async () => {
    if (!valuation) {
      console.error(translations[selectedLanguage].errorPDFGeneration);
      return;
    }

    try {
      const doc = new jsPDF();
      const areaTotal = (propertyData.areaSotano || 0) + 
                       (propertyData.areaPrimerNivel || 0) + 
                       (propertyData.areaSegundoNivel || 0) + 
                       (propertyData.areaTercerNivel || 0) + 
                       (propertyData.areaCuartoNivel || 0);

      const config = {
        primaryColor: [37, 99, 235],
        textColor: [51, 51, 51],
        backgroundColor: [248, 250, 252]
      };

      let yPosition = 30;
      const marginLeft = 20;
      const contentWidth = 170;

      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > 280) {
          doc.addPage();
          yPosition = 20;
        }
      };

      // ENCABEZADO
      doc.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.rect(0, 0, 210, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      
      let titleText = '';
      switch (propertyData.tipoPropiedad) {
        case 'casa':
          titleText = translations[selectedLanguage].residentialValuation || 'VALUACIÓN RESIDENCIAL';
          break;
        case 'departamento':
          titleText = translations[selectedLanguage].apartmentValuation || 'VALUACIÓN DE APARTAMENTO';
          break;
        case 'terreno':
          titleText = translations[selectedLanguage].landValuation || 'VALUACIÓN DE TERRENO';
          break;
        case 'comercial':
          titleText = translations[selectedLanguage].commercialValuation || 'VALUACIÓN COMERCIAL';
          break;
        default:
          titleText = 'VALUACIÓN DE PROPIEDAD';
      }
      
      doc.text(titleText, 105, 15, { align: 'center' });

      // Resetear color y posición
      doc.setTextColor(config.textColor[0], config.textColor[1], config.textColor[2]);
      yPosition = 40;

      // SECCIÓN 1: INFORMACIÓN GENERAL
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.text(`1. ${translations[selectedLanguage].generalInfo}`, marginLeft, yPosition + 6);
      
      yPosition += 20;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.textColor[0], config.textColor[1], config.textColor[2]);
      
      const generalInfo = [
        `${translations[selectedLanguage].type}: ${propertyData.tipoPropiedad}`,
        `${translations[selectedLanguage].totalBuiltArea}: ${areaTotal} ${translations[selectedLanguage].sqm}`,
        `${translations[selectedLanguage].landArea}: ${propertyData.areaTerreno} ${translations[selectedLanguage].sqm}`,
        
        `${translations[selectedLanguage].locationQuality}: ${propertyData.ubicacion}`
      ];

      generalInfo.forEach(info => {
        checkNewPage(8);
        doc.text(info, marginLeft, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // SECCIÓN 2: UBICACIÓN
      checkNewPage(60);
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.text(`2. ${translations[selectedLanguage].propertyLocationPDF || translations[selectedLanguage].address}`, marginLeft, yPosition + 6);
      
      yPosition += 20;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.textColor[0], config.textColor[1], config.textColor[2]);
      
      if (propertyData.direccionCompleta) {
        doc.text(`${translations[selectedLanguage].address}: ${propertyData.direccionCompleta}`, marginLeft, yPosition);
        yPosition += 6;
      }
      
      if (propertyData.latitud && propertyData.longitud) {
        doc.text(`${translations[selectedLanguage].coordinatesLabel || 'Coordenadas:'} ${propertyData.latitud.toFixed(6)}, ${propertyData.longitud.toFixed(6)}`, marginLeft, yPosition);
        yPosition += 6;
      }

      yPosition += 10;

      // SECCIÓN 3: ÁREAS
      checkNewPage(80);
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.text(`3. ${translations[selectedLanguage].propertyAreas}`, marginLeft, yPosition + 6);
      
      yPosition += 20;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.textColor[0], config.textColor[1], config.textColor[2]);
      
      if (propertyData.tipoPropiedad !== 'terreno') {
        const areas = [
          { name: translations[selectedLanguage].basement, value: propertyData.areaSotano },
          { name: translations[selectedLanguage].firstFloor, value: propertyData.areaPrimerNivel },
          { name: translations[selectedLanguage].secondFloor, value: propertyData.areaSegundoNivel },
          { name: translations[selectedLanguage].thirdFloor, value: propertyData.areaTercerNivel },
          { name: translations[selectedLanguage].fourthFloor, value: propertyData.areaCuartoNivel }
        ].filter(area => area.value > 0);

        areas.forEach(area => {
          checkNewPage(8);
          doc.text(`${area.name}: ${area.value} ${translations[selectedLanguage].sqm}`, marginLeft, yPosition);
          yPosition += 6;
        });
        
        checkNewPage(8);
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].totalBuiltArea}: ${areaTotal} ${translations[selectedLanguage].sqm}`, marginLeft, yPosition);
        yPosition += 8;
        doc.setFont("helvetica", "normal");
      }
      
      checkNewPage(8);
      doc.text(`${translations[selectedLanguage].landArea}: ${propertyData.areaTerreno} ${translations[selectedLanguage].sqm}`, marginLeft, yPosition);
      yPosition += 10;

      // SECCIÓN 4: VALOR ESTIMADO
      checkNewPage(60);
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.text(`4. ${translations[selectedLanguage].estimatedValuePDF || translations[selectedLanguage].estimatedValue}`, marginLeft, yPosition + 6);
      
      yPosition += 20;
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.text(`${translations[selectedLanguage].estimatedValue.toUpperCase()}: ${formatCurrency(finalAdjustedValue || valuation, selectedCurrency)}`, marginLeft, yPosition);
      
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.textColor[0], config.textColor[1], config.textColor[2]);
      
      if (propertyData.tipoPropiedad !== 'terreno' && areaTotal > 0) {
        doc.text(`${translations[selectedLanguage].pricePerSqm}: ${formatCurrency((finalAdjustedValue || valuation) / areaTotal, selectedCurrency)}`, marginLeft, yPosition);
        yPosition += 6;
      }
      
      doc.text(`${translations[selectedLanguage].basedOnComparables}: ${selectedComparatives.length} comparables`, marginLeft, yPosition);
      yPosition += 6;
      
      doc.text(`Fecha de valuación: ${new Date().toLocaleDateString('es-ES')}`, marginLeft, yPosition);

      // Footer con disclaimer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 100, 100);
        doc.text(translations[selectedLanguage].disclaimerText, 105, 285, { align: 'center', maxWidth: 170 });
      }

      const fileName = `avaluo-${propertyData.tipoPropiedad}-${Date.now()}.pdf`;
      doc.save(fileName);

      // PDF generado silenciosamente
      console.log(translations[selectedLanguage].pdfGenerated);
    } catch (error) {
      // Error generando PDF - manejo silencioso
      console.error(translations[selectedLanguage].errorGeneratingPDF);
    }
  };

  const generateWord = async () => {
    if (!valuation) {
      console.error(translations[selectedLanguage].errorWordGeneration);
      return;
    }

    try {
      const areaTotal = (propertyData.areaSotano || 0) + 
                       (propertyData.areaPrimerNivel || 0) + 
                       (propertyData.areaSegundoNivel || 0) + 
                       (propertyData.areaTercerNivel || 0) + 
                       (propertyData.areaCuartoNivel || 0);

      let titleText = '';
      let subtitleText = '';
      
      switch (propertyData.tipoPropiedad) {
        case 'casa':
          titleText = translations[selectedLanguage].residentialValuation || 'VALUACIÓN RESIDENCIAL';
          subtitleText = translations[selectedLanguage].residentialSubtitle || 'Avalúo Profesional de Casa Habitación';
          break;
        case 'departamento':
          titleText = translations[selectedLanguage].apartmentValuation || 'VALUACIÓN DE APARTAMENTO';
          subtitleText = translations[selectedLanguage].apartmentSubtitle || 'Avalúo Profesional de Unidad Habitacional';
          break;
        case 'terreno':
          titleText = translations[selectedLanguage].landValuation || 'VALUACIÓN DE TERRENO';
          subtitleText = translations[selectedLanguage].landSubtitle || 'Avalúo Profesional de Superficie - Estándares IVS/RICS';
          break;
        case 'comercial':
          titleText = translations[selectedLanguage].commercialValuation || 'VALUACIÓN COMERCIAL';
          subtitleText = translations[selectedLanguage].commercialSubtitle || 'Avalúo Profesional de Bien Comercial';
          break;
        default:
          titleText = 'VALUACIÓN DE PROPIEDAD';
          subtitleText = 'Avalúo Profesional';
      }

      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: [
            // ENCABEZADO
            new Paragraph({
              children: [
                new TextRun({ 
                  text: titleText, 
                  bold: true, 
                  size: 32,
                  color: "2563eb"
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: subtitleText,
                  size: 20,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({ text: "" }), // Espacio

            // 1. INFORMACIÓN GENERAL
            new Paragraph({
              text: `1. ${translations[selectedLanguage].generalInfo}`,
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].type}: `, bold: true }),
                new TextRun({ text: propertyData.tipoPropiedad })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].totalBuiltArea}: `, bold: true }),
                new TextRun({ text: `${areaTotal} ${translations[selectedLanguage].sqm}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].landArea}: `, bold: true }),
                new TextRun({ text: `${propertyData.areaTerreno} ${translations[selectedLanguage].sqm}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].locationQuality}: `, bold: true }),
                new TextRun({ text: propertyData.ubicacion })
              ]
            }),
            new Paragraph({ text: "" }), // Espacio

            // 2. UBICACIÓN
            new Paragraph({
              text: `2. ${translations[selectedLanguage].propertyLocationPDF || translations[selectedLanguage].address}`,
              heading: HeadingLevel.HEADING_1
            }),
            ...(propertyData.direccionCompleta ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].address}: `, bold: true }),
                  new TextRun({ text: propertyData.direccionCompleta })
                ]
              })
            ] : []),
            ...(propertyData.latitud && propertyData.longitud ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].coordinatesLabel || 'Coordenadas:'} `, bold: true }),
                  new TextRun({ text: `${propertyData.latitud.toFixed(6)}, ${propertyData.longitud.toFixed(6)}` })
                ]
              })
            ] : []),
            new Paragraph({ text: "" }), // Espacio

            // 3. ÁREAS DE LA PROPIEDAD
            new Paragraph({
              text: `3. ${translations[selectedLanguage].propertyAreas}`,
              heading: HeadingLevel.HEADING_1
            }),
            
            // Áreas de construcción (solo si NO es terreno)
            ...(propertyData.tipoPropiedad !== 'terreno' ? [
              ...(propertyData.areaSotano > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${translations[selectedLanguage].basement}: `, bold: true }),
                    new TextRun({ text: `${propertyData.areaSotano} ${translations[selectedLanguage].sqm}` })
                  ]
                })
              ] : []),
              ...(propertyData.areaPrimerNivel > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${translations[selectedLanguage].firstFloor}: `, bold: true }),
                    new TextRun({ text: `${propertyData.areaPrimerNivel} ${translations[selectedLanguage].sqm}` })
                  ]
                })
              ] : []),
              ...(propertyData.areaSegundoNivel > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${translations[selectedLanguage].secondFloor}: `, bold: true }),
                    new TextRun({ text: `${propertyData.areaSegundoNivel} ${translations[selectedLanguage].sqm}` })
                  ]
                })
              ] : []),
              ...(propertyData.areaTercerNivel > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${translations[selectedLanguage].thirdFloor}: `, bold: true }),
                    new TextRun({ text: `${propertyData.areaTercerNivel} ${translations[selectedLanguage].sqm}` })
                  ]
                })
              ] : []),
              ...(propertyData.areaCuartoNivel > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${translations[selectedLanguage].fourthFloor}: `, bold: true }),
                    new TextRun({ text: `${propertyData.areaCuartoNivel} ${translations[selectedLanguage].sqm}` })
                  ]
                })
              ] : []),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].totalBuiltArea}: `, bold: true }),
                  new TextRun({ text: `${areaTotal} ${translations[selectedLanguage].sqm}` })
                ]
              })
            ] : []),
            
            // Área del terreno
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].landArea}: `, bold: true }),
                new TextRun({ text: `${propertyData.areaTerreno} ${translations[selectedLanguage].sqm}` })
              ]
            }),

            new Paragraph({ text: "" }), // Espacio

            // 4. VALOR ESTIMADO
            new Paragraph({
              text: `4. ${translations[selectedLanguage].estimatedValuePDF || translations[selectedLanguage].estimatedValue}`,
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].estimatedValue.toUpperCase()}: `, bold: true, size: 32 }),
                new TextRun({ text: formatCurrency(finalAdjustedValue || valuation, selectedCurrency), bold: true, size: 32 })
              ]
            }),
            ...(propertyData.tipoPropiedad !== 'terreno' && areaTotal > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].pricePerSqm}: `, bold: true }),
                  new TextRun({ text: formatCurrency((finalAdjustedValue || valuation) / areaTotal, selectedCurrency) })
                ]
              })
            ] : []),
            new Paragraph({
              children: [
                new TextRun({ text: "Método de Valuación: ", bold: true }),
                new TextRun({ text: `Comparación de mercado con ${selectedComparatives.length} comparables` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Fecha de Valuación: ", bold: true }),
                new TextRun({ text: new Date().toLocaleDateString('es-ES') })
              ]
            }),
            new Paragraph({ text: "" }), // Espacio

            // Disclaimer
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "NOTA IMPORTANTE:",
                  bold: true,
                  size: 20,
                  color: "FF0000"
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: translations[selectedLanguage].disclaimerText,
                  italics: true,
                  size: 18
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        }]
      });

      const buffer = await Packer.toBlob(doc);
      const fileName = `avaluo-inmobiliario-${Date.now()}.docx`;
      saveAs(buffer, fileName);

      // Documento Word generado silenciosamente
      console.log("El avalúo completo se ha descargado correctamente");
    } catch (error) {
      // Error generando Word - manejo silencioso
      console.error("No se pudo generar el documento Word");
    }
  };

  const handleCloseDemo = () => {
    setShowDemo(false);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
          <Calculator className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
          {translations[selectedLanguage].propertyValuator}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-4">
          {translations[selectedLanguage].professionalSystem}
        </p>
      </div>

      {/* Pasos 1, 2, Descargar Documentos, Nuevo Valúo y Disclaimer arriba */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Paso 1: Selector de Idioma */}
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <Label className="text-sm font-bold text-blue-900 dark:text-blue-100">
              {translations[selectedLanguage].languageSelector}
            </Label>
          </div>
          <LanguageSelector />
        </Card>
        
        {/* Paso 2: Selector de Moneda */}
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              ✓
            </div>
            <Label className="text-sm font-bold text-green-900 dark:text-green-100">
              {translations[selectedLanguage].currencyValuation}
            </Label>
          </div>
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
            title=""
            exchangeRateUpdated={translations[selectedLanguage].exchangeRateUpdated}
            exchangeRateError={translations[selectedLanguage].exchangeRateError}
            errorTitle={translations[selectedLanguage].errorTitle}
            lastUpdateText={translations[selectedLanguage].lastUpdateText}
            exchangeRateNote={translations[selectedLanguage].exchangeRateNote}
            exchangeRateLabel={translations[selectedLanguage].exchangeRateLabel}
          />
        </Card>

        {/* Botones de Descarga de Documentos */}
        <Card className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
          <Label className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-orange-900 dark:text-orange-100 flex items-center gap-2">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
            {translations[selectedLanguage].downloadDocuments}
          </Label>
          {valuation ? (
            <div className="space-y-2 sm:space-y-3">
              <Button 
                onClick={generatePDF} 
                variant="outline" 
                className="w-full border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/50 h-10 sm:h-auto text-xs sm:text-sm"
                size="sm"
              >
                <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                {translations[selectedLanguage].downloadPDF}
              </Button>
             
             <Button 
               onClick={generateWord} 
               variant="outline" 
               className="w-full border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300"
               size="sm"
             >
               <Download className="mr-2 h-4 w-4" />
               {translations[selectedLanguage].downloadWord}
             </Button>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Los documentos estarán disponibles después de realizar la valuación.
            </p>
          )}
        </Card>

        {/* Botón para Nuevo Valúo */}
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              🔄
            </div>
            <Label className="text-sm font-bold text-purple-900 dark:text-purple-100">
              Nuevo Valúo
            </Label>
          </div>
          <Button 
            onClick={startNewValuation}
            variant="outline" 
            className="w-full border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 h-10 text-xs sm:text-sm"
            size="sm"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Comenzar de Nuevo
          </Button>
        </Card>

        {/* Disclaimer de Valuación */}
        <Card className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              ⚠
            </div>
            <Label className="text-sm font-bold text-gray-900 dark:text-gray-100">
              Nota Importante
            </Label>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {translations[selectedLanguage].disclaimerText}
          </p>
        </Card>
      </div>

      {/* Valúo por el Método de la Renta */}
      <div className="mb-6">
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
          <h4 className="text-md font-semibold mb-3 text-blue-900 dark:text-blue-100 flex items-center justify-center gap-2">
            💰 {translations[selectedLanguage].rentalMethodTitle}
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mb-4 text-center">
            {translations[selectedLanguage].rentalMethodDescription}
          </p>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                type="number"
                placeholder={translations[selectedLanguage].rentalAmountPlaceholder}
                value={propertyData.alquiler || ''}
                onChange={(e) => handleInputChange('alquiler', sanitizeNumericInput(e.target.value))}
                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {selectedCurrency.symbol}
            </span>
          </div>

          {propertyData.alquiler ? (
            <div className="mt-4 p-3 bg-white/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-700/50">
              <div className="text-lg font-bold text-blue-900 dark:text-blue-100 text-center">
                Valor por método de la renta: {formatCurrency(incomeMethodValue, selectedCurrency)}
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      {/* Secuencia de Valuación */}
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <h4 className="text-md font-semibold mb-2 text-center">💰 Valúo por el método Comparativo</h4>
        <h4 className="text-md font-semibold mb-4 text-center">🏠 Secuencia de Valuación</h4>
        <p className="text-xs text-muted-foreground mb-4 text-center">Complete los pasos en orden para obtener su valuación profesional</p>
        
        {/* Primera fila - Pasos 1, 2, 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${getStepCompletion().step1 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              {getStepCompletion().step1 ? '✓' : '1'}
            </div>
            <div className="flex-1">
              <span className={`font-medium text-xs ${getStepCompletion().step1 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                Paso 1: Ubicación
              </span>
              <p className="text-xs text-muted-foreground mt-1">Marque la ubicación exacta en el mapa</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${getStepCompletion().step2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              {getStepCompletion().step2 ? '✓' : '2'}
            </div>
            <div className="flex-1">
              <span className={`font-medium text-xs ${getStepCompletion().step2 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                Paso 2: Tipo de Propiedad
              </span>
              <p className="text-xs text-muted-foreground mt-1">Seleccione si es casa, apartamento, terreno o comercial</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${getStepCompletion().step3 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              {getStepCompletion().step3 ? '✓' : '3'}
            </div>
            <div className="flex-1">
              <span className={`font-medium text-xs ${getStepCompletion().step3 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                Paso 3: Áreas
              </span>
              <p className="text-xs text-muted-foreground mt-1">Ingrese las áreas de construcción y terreno</p>
            </div>
          </div>
        </div>
        
        {/* Segunda fila - Pasos 4, 5 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${getStepCompletion().step4 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              {getStepCompletion().step4 ? '✓' : '4'}
            </div>
            <div className="flex-1">
              <span className={`font-medium text-xs ${getStepCompletion().step4 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                Paso 4: Características
              </span>
              <p className="text-xs text-muted-foreground mt-1">Antigüedad, calidad de ubicación y estado general</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 p-2 rounded-lg bg-background/50">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${getStepCompletion().step5 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
              {getStepCompletion().step5 ? '✓' : '5'}
            </div>
            <div className="flex-1">
              <span className={`font-medium text-xs ${getStepCompletion().step5 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                Paso 5: Valuación Final
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {getStepCompletion().step5
                  ? 'Su avalúo profesional está completado' 
                  : 'Obtenga su avalúo profesional con comparables'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card principal con datos de la propiedad */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            {translations[selectedLanguage].propertyData}
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
                 <span className="hidden sm:inline">{translations[selectedLanguage].location}</span>
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
                 <span className="hidden sm:inline">{translations[selectedLanguage].propertyType}</span>
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
                 <span className="hidden sm:inline">{translations[selectedLanguage].areas}</span>
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
                 <span className="hidden sm:inline">{translations[selectedLanguage].characteristics}</span>
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
                 <span className="hidden sm:inline">{translations[selectedLanguage].calculate}</span>
                 <span className="sm:hidden">Calcular</span>
               </TabsTrigger>
              </TabsList>

              <TabsContent value="areas" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                {/* Mostrar áreas de construcción solo si NO es terreno */}
                {propertyData.tipoPropiedad !== 'terreno' && (
                  <>
                    <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].constructionAreas}</h3>
                    
                    {/* Para apartamentos, solo mostrar área total construida */}
                    {propertyData.tipoPropiedad === 'departamento' ? (
                      <div className="max-w-xs">
                        <Label htmlFor="areaPrimerNivel">{translations[selectedLanguage].totalBuiltArea} ({translations[selectedLanguage].sqm})</Label>
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
                          <Label htmlFor="areaSotano">{translations[selectedLanguage].basement} ({translations[selectedLanguage].sqm})</Label>
                          <Input
                            id="areaSotano"
                            type="number"
                            value={propertyData.areaSotano || ''}
                            onChange={(e) => handleInputChange('areaSotano', sanitizeNumericInput(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="areaPrimerNivel">{translations[selectedLanguage].firstFloor} ({translations[selectedLanguage].sqm})</Label>
                          <Input
                            id="areaPrimerNivel"
                            type="number"
                            value={propertyData.areaPrimerNivel || ''}
                            onChange={(e) => handleInputChange('areaPrimerNivel', sanitizeNumericInput(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="areaSegundoNivel">{translations[selectedLanguage].secondFloor} ({translations[selectedLanguage].sqm})</Label>
                          <Input
                            id="areaSegundoNivel"
                            type="number"
                            value={propertyData.areaSegundoNivel || ''}
                            onChange={(e) => handleInputChange('areaSegundoNivel', sanitizeNumericInput(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="areaTercerNivel">{translations[selectedLanguage].thirdFloor} ({translations[selectedLanguage].sqm})</Label>
                          <Input
                            id="areaTercerNivel"
                            type="number"
                            value={propertyData.areaTercerNivel || ''}
                            onChange={(e) => handleInputChange('areaTercerNivel', sanitizeNumericInput(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="areaCuartoNivel">{translations[selectedLanguage].fourthFloor} ({translations[selectedLanguage].sqm})</Label>
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
                          Área Total Construida: {(propertyData.areaSotano || 0) + (propertyData.areaPrimerNivel || 0) + (propertyData.areaSegundoNivel || 0) + (propertyData.areaTercerNivel || 0) + (propertyData.areaCuartoNivel || 0)} {translations[selectedLanguage].sqm}
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {/* Área del terreno - no mostrar para departamentos */}
                {propertyData.tipoPropiedad !== 'departamento' && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Label htmlFor="areaTerreno" className="text-base font-medium">{translations[selectedLanguage].landArea} ({translations[selectedLanguage].sqm})</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{translations[selectedLanguage].landAreaTooltip}</p>
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

              <TabsContent value="tipo" className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].propertyTypeTitle}</h3>
                <Select value={propertyData.tipoPropiedad} onValueChange={(value) => handleInputChange('tipoPropiedad', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={translations[selectedLanguage].selectPropertyType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">{translations[selectedLanguage].house}</SelectItem>
                    <SelectItem value="departamento">{translations[selectedLanguage].apartment}</SelectItem>
                  </SelectContent>
                </Select>
              </TabsContent>

              <TabsContent value="caracteristicas" className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].characteristics}</h3>
                
                {/* Mostrar características específicas para terrenos */}
                {propertyData.tipoPropiedad === 'terreno' ? (
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].landCharacteristics}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="topografia">{translations[selectedLanguage].topography}</Label>
                        <Select 
                          value={propertyData.topografia || ''} 
                          onValueChange={(value) => handleInputChange('topografia', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={translations[selectedLanguage].selectTopography} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="terreno-plano">
                              <div className="flex flex-col">
                                <span className="font-medium">Terreno Plano (0-2% pendiente)</span>
                                <span className="text-xs text-muted-foreground">Superficie nivelada, óptima para construcción y desarrollo</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="ondulado-suave">
                              <div className="flex flex-col">
                                <span className="font-medium">Ondulado Suave (2-5% pendiente)</span>
                                <span className="text-xs text-muted-foreground">Relieve ondulado moderado, buen drenaje natural</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pendiente-leve">
                              <div className="flex flex-col">
                                <span className="font-medium">Pendiente Leve (5-10% pendiente)</span>
                                <span className="text-xs text-muted-foreground">Inclinación suave, favorable para construcción residencial</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pendiente-moderada">
                              <div className="flex flex-col">
                                <span className="font-medium">Pendiente Moderada (10-20% pendiente)</span>
                                <span className="text-xs text-muted-foreground">Requiere nivelación parcial, costos de construcción mayores</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pendiente-fuerte">
                              <div className="flex flex-col">
                                <span className="font-medium">Pendiente Fuerte (20-35% pendiente)</span>
                                <span className="text-xs text-muted-foreground">Terreno inclinado, requiere ingeniería especializada</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pendiente-escarpada">
                              <div className="flex flex-col">
                                <span className="font-medium">Pendiente Escarpada (&gt;35% pendiente)</span>
                                <span className="text-xs text-muted-foreground">Terreno muy empinado, desarrollo complejo y costoso</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="afloramiento-rocoso">
                              <div className="flex flex-col">
                                <span className="font-medium">Afloramiento Rocoso</span>
                                <span className="text-xs text-muted-foreground">Presencia de roca expuesta, requiere excavación especializada</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="topografia-irregular">
                              <div className="flex flex-col">
                                <span className="font-medium">Topografía Irregular</span>
                                <span className="text-xs text-muted-foreground">Relieve heterogéneo, múltiples niveles y desniveles</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="zona-humeda">
                              <div className="flex flex-col">
                                <span className="font-medium">Zona Húmeda</span>
                                <span className="text-xs text-muted-foreground">Terreno con alto nivel freático, requiere sistema de drenaje</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tipoValoracion">{translations[selectedLanguage].valuationType}</Label>
                        <Select 
                          value={propertyData.tipoValoracion || ''} 
                          onValueChange={(value) => handleInputChange('tipoValoracion', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={translations[selectedLanguage].selectValuationType} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="residencial">
                              <div className="flex flex-col">
                                <span className="font-medium">{translations[selectedLanguage].residentialUse}</span>
                                <span className="text-xs text-muted-foreground">Para viviendas unifamiliares o multifamiliares</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="comercial">
                              <div className="flex flex-col">
                                <span className="font-medium">{translations[selectedLanguage].commercialUse}</span>
                                <span className="text-xs text-muted-foreground">Para oficinas, tiendas o centros comerciales</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="industrial">
                              <div className="flex flex-col">
                                <span className="font-medium">{translations[selectedLanguage].industrialUse}</span>
                                <span className="text-xs text-muted-foreground">Para fábricas, bodegas o manufactura</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="agricola">
                              <div className="flex flex-col">
                                <span className="font-medium">{translations[selectedLanguage].agriculturalUse}</span>
                                <span className="text-xs text-muted-foreground">Para cultivos, ganadería o uso agrícola</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : null}

               {/* Calidad y Estado */}
               <div className="mb-6">
                 <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].qualityAndCondition}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                         {propertyData.tipoPropiedad === 'terreno' ? translations[selectedLanguage].environmentalFactors : translations[selectedLanguage].locationQuality}
                      </Label>
                       <Select 
                         value={propertyData.ubicacion} 
                         onValueChange={(value) => {
                           handleInputChange('ubicacion', value);
                         }}
                       >
                        <SelectTrigger>
                          <SelectValue placeholder={propertyData.tipoPropiedad === 'terreno' ? translations[selectedLanguage].environmentalDescription : translations[selectedLanguage].locationQualityPlaceholder} />
                        </SelectTrigger>
           <SelectContent>
             {propertyData.tipoPropiedad === 'terreno' ? (
               <>
                <SelectItem value="excelente">
                  <div className="flex flex-col">
                    <span className="font-medium">Excelente</span>
                    <span className="text-xs text-muted-foreground">Zona segura, sin riesgo de inundaciones o deslizamientos</span>
                  </div>
                </SelectItem>
                <SelectItem value="buena">
                  <div className="flex flex-col">
                    <span className="font-medium">Buena</span>
                    <span className="text-xs text-muted-foreground">Riesgos mínimos, terreno estable y bien drenado</span>
                  </div>
                </SelectItem>
                <SelectItem value="drenaje-excelente">
                  <div className="flex flex-col">
                    <span className="font-medium">Drenaje Excelente</span>
                    <span className="text-xs text-muted-foreground">Terreno con excelente drenaje natural, no se encharca</span>
                  </div>
                </SelectItem>
                <SelectItem value="clima-favorable">
                  <div className="flex flex-col">
                    <span className="font-medium">Clima Favorable</span>
                    <span className="text-xs text-muted-foreground">Condiciones climáticas ideales, sin extremos temperaturas</span>
                  </div>
                </SelectItem>
                <SelectItem value="regular">
                  <div className="flex flex-col">
                    <span className="font-medium">Regular</span>
                    <span className="text-xs text-muted-foreground">Algunos riesgos menores, puede necesitar precauciones</span>
                  </div>
                </SelectItem>
                <SelectItem value="riesgo-hidrico">
                  <div className="flex flex-col">
                    <span className="font-medium">Riesgo Hídrico</span>
                    <span className="text-xs text-muted-foreground">Zona con antecedentes de inundaciones ocasionales</span>
                  </div>
                </SelectItem>
                <SelectItem value="erosion-suelo">
                  <div className="flex flex-col">
                    <span className="font-medium">Erosión de Suelo</span>
                    <span className="text-xs text-muted-foreground">Terreno susceptible a erosión por lluvias intensas</span>
                  </div>
                </SelectItem>
                <SelectItem value="vientos-fuertes">
                  <div className="flex flex-col">
                    <span className="font-medium">Vientos Fuertes</span>
                    <span className="text-xs text-muted-foreground">Zona expuesta a vientos fuertes o temporadas de huracanes</span>
                  </div>
                </SelectItem>
                <SelectItem value="mala">
                  <div className="flex flex-col">
                    <span className="font-medium">Deficiente</span>
                    <span className="text-xs text-muted-foreground">Alto riesgo de inundación, deslizamiento o problemas ambientales</span>
                  </div>
                </SelectItem>
               </>
              ) : (
                <>
                  <SelectItem value="estrato-1-elite">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 1 - Élite</span>
                      <span className="text-xs text-muted-foreground">Zona exclusiva, residencial de lujo, máxima plusvalía</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-2-alto-alto">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 2 - Alto-Alto</span>
                      <span className="text-xs text-muted-foreground">Zona residencial alto-alto, plusvalía premium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-3-alto-medio">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 3 - Alto-Medio</span>
                      <span className="text-xs text-muted-foreground">Zona residencial alto-medio, buena ubicación</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-4-alto-bajo">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 4 - Alto-Bajo</span>
                      <span className="text-xs text-muted-foreground">Zona residencial alto-bajo, equilibrio precio-valor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-5-medio-alto">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 5 - Medio-Alto</span>
                      <span className="text-xs text-muted-foreground">Zona residencial medio-alto</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-6-medio-medio">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 6 - Medio-Medio</span>
                      <span className="text-xs text-muted-foreground">Zona medio-medio, equilibrio</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-7-medio-bajo">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 7 - Medio-Bajo</span>
                      <span className="text-xs text-muted-foreground">Zona medio-bajo, accesible</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-8-bajo-alto">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 8 - Bajo-Alto</span>
                      <span className="text-xs text-muted-foreground">Zona bajo-alto, transición</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-9-bajo-medio">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 9 - Bajo-Medio</span>
                      <span className="text-xs text-muted-foreground">Zona bajo-medio, popular</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-10-bajo-bajo">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 10 - Bajo-Bajo</span>
                      <span className="text-xs text-muted-foreground">Zona bajo-bajo, vivienda social</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="estrato-11-marginal">
                    <div className="flex flex-col">
                      <span className="font-medium">Estrato 11 - Marginal</span>
                      <span className="text-xs text-muted-foreground">Zona marginal, servicios limitados</span>
                    </div>
                  </SelectItem>
                </>
              )}
           </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">{propertyData.tipoPropiedad === 'terreno' ? translations[selectedLanguage].environmentalDescription : translations[selectedLanguage].evaluateServices}</p>
                    </div>
                   
                    {propertyData.tipoPropiedad !== 'terreno' && (
                      <div>
                        <Label className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                           {translations[selectedLanguage].generalConditionLabel}
                        </Label>
                         <Select 
                           value={propertyData.estadoGeneral} 
                           onValueChange={(value) => {
                             handleInputChange('estadoGeneral', value);
                           }}
                         >
                          <SelectTrigger>
                            <SelectValue placeholder={translations[selectedLanguage].conditionPlaceholder} />
                          </SelectTrigger>
          <SelectContent>
             <SelectItem value="nuevo">{translations[selectedLanguage].newCondition}</SelectItem>
             <SelectItem value="bueno">{translations[selectedLanguage].goodCondition}</SelectItem>
             <SelectItem value="medio">{translations[selectedLanguage].mediumCondition}</SelectItem>
             <SelectItem value="regular">{translations[selectedLanguage].regularCondition}</SelectItem>
            <SelectItem value="reparaciones-sencillas">{translations[selectedLanguage].simpleRepairsCondition}</SelectItem>
            <SelectItem value="reparaciones-medias">{translations[selectedLanguage].mediumRepairsCondition}</SelectItem>
            <SelectItem value="reparaciones-importantes">{translations[selectedLanguage].importantRepairsCondition}</SelectItem>
            <SelectItem value="danos-graves">{translations[selectedLanguage].seriousDamageCondition}</SelectItem>
            <SelectItem value="en-desecho">{translations[selectedLanguage].wasteCondition}</SelectItem>
          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">{translations[selectedLanguage].affectsPropertyValue}</p>
                      </div>
                    )}
                    
                 </div>
               </div>

               {/* Resumen de características */}
               <div className="bg-muted p-4 rounded-lg">
                 <h4 className="text-sm font-semibold mb-2">{translations[selectedLanguage].characteristicsSummary}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                   {propertyData.tipoPropiedad === 'terreno' ? (
                     <>
                       <div>
                         <span className="font-medium">{translations[selectedLanguage].propertyTopography}</span> {propertyData.topografia || translations[selectedLanguage].notSpecified}
                       </div>
                       <div className="md:col-span-2">
                         <span className="font-medium">{translations[selectedLanguage].propertyValuationType}</span> {propertyData.tipoValoracion || translations[selectedLanguage].notSpecified}
                       </div>
                     </>
                   ) : (
                     <>
                       <div>
                         <span className="font-medium">{translations[selectedLanguage].propertyCondition}</span> {propertyData.estadoGeneral || translations[selectedLanguage].noSpecified}
                       </div>
                     </>
                   )}
                   <div>
                     <span className="font-medium">{translations[selectedLanguage].propertyLocation}</span> {propertyData.ubicacion || translations[selectedLanguage].notSpecified}
                   </div>
                 </div>
               </div>
              </TabsContent>

              <TabsContent value="valuacion" className="space-y-4 mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Calcular Valuación</h3>
                <div className="text-center">
                  <Button onClick={calculateValuation} disabled={!isFormValid() || isCalculating} size="lg" className="w-full sm:w-auto">
                    {isCalculating ? "Calculando..." : translations[selectedLanguage].realizarValuacion}
                  </Button>
                </div>
              </TabsContent>

                 <TabsContent value="ubicacion" className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].locationSketch}</h3>
                  
                  <Tabs defaultValue="mapa" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="mapa">{translations[selectedLanguage].viewMap}</TabsTrigger>
                      <TabsTrigger value="editar">{translations[selectedLanguage].editData}</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="mapa" className="space-y-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {translations[selectedLanguage].mapInstructions}
                      </p>
                      
                       {/* Usar el componente SimpleLocationMap siempre */}
                       <SimpleLocationMap
                         initialLat={propertyData.latitud || 19.4326}
                         initialLng={propertyData.longitud || -99.1332}
                         onLocationChange={handleLocationSelect}
                       />
                   </TabsContent>
                   
                    <TabsContent value="editar" className="space-y-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-4">
                        {translations[selectedLanguage].editLocationInstructions}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="direccionCompleta">{translations[selectedLanguage].fullAddress}</Label>
                          <Input
                            id="direccionCompleta"
                            value={propertyData.direccionCompleta || ''}
                            onChange={(e) => handleInputChange('direccionCompleta', e.target.value)}
                            placeholder={translations[selectedLanguage].fullAddressPlaceholder}
                          />
                        </div>
                        
                        <div className="text-sm text-muted-foreground pt-6">
                          {translations[selectedLanguage].coordinatesNote}
                        </div>
                        
                        <div>
                          <Label htmlFor="latitud">{translations[selectedLanguage].latitude}</Label>
                          <Input
                            id="latitud"
                            type="number"
                            step="any"
                            value={propertyData.latitud || ''}
                            onChange={(e) => handleInputChange('latitud', parseFloat(e.target.value) || 0)}
                            placeholder={translations[selectedLanguage].latitudePlaceholder}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="longitud">{translations[selectedLanguage].longitude}</Label>
                          <Input
                            id="longitud"
                            type="number"
                            step="any"
                            value={propertyData.longitud || ''}
                            onChange={(e) => handleInputChange('longitud', parseFloat(e.target.value) || 0)}
                            placeholder={translations[selectedLanguage].longitudePlaceholder}
                          />
                        </div>
                      </div>
                      
                      {/* Mostrar datos registrados */}
                      {(propertyData.direccionCompleta || (propertyData.latitud && propertyData.longitud)) && (
                        <div className="bg-muted p-4 rounded-lg mt-4">
                          <h5 className="font-medium mb-2">{translations[selectedLanguage].registeredAddress}</h5>
                          {propertyData.direccionCompleta && (
                            <p className="text-sm text-muted-foreground">{propertyData.direccionCompleta}</p>
                          )}
                          {propertyData.latitud && propertyData.longitud && (
                            <p className="text-sm text-muted-foreground">
                              {translations[selectedLanguage].coordinates} {propertyData.latitud.toFixed(6)}, {propertyData.longitud.toFixed(6)}
                            </p>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </TabsContent>

            </Tabs>
        </CardContent>
      </Card>

      {/* Resultados de valuación, comparables y ajustes */}
      {valuation && (
        <div className="space-y-6">
          {/* Panel de resultados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {translations[selectedLanguage].valuationResultsTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">{translations[selectedLanguage].estimatedValue}</h3>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(finalAdjustedValue || valuation, selectedCurrency)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Alquiler Mensual Estimado</h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(Math.round(((finalAdjustedValue || valuation) * RENTAL_CAP_RATE / (1 - RENTAL_EXPENSE_RATE)) / 12), selectedCurrency)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Fórmula inversa del método de la renta (Cap rate 5%, gastos 15%)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {translations[selectedLanguage].basedOnComparablesText}
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">{translations[selectedLanguage].priceAdjustment}</h3>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => adjustValue(-10)}>-10%</Button>
                      <Button size="sm" variant="outline" onClick={() => adjustValue(-5)}>-5%</Button>
                      <Button size="sm" variant="outline" onClick={() => adjustValue(0)}>0%</Button>
                      <Button size="sm" variant="outline" onClick={() => adjustValue(5)}>+5%</Button>
                      <Button size="sm" variant="outline" onClick={() => adjustValue(10)}>+10%</Button>
                    </div>
                    {adjustmentPercentage !== 0 && (
                      <p className="text-sm text-muted-foreground">
                        {translations[selectedLanguage].adjustmentLabel}: {adjustmentPercentage > 0 ? '+' : ''}{adjustmentPercentage}%
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">{translations[selectedLanguage].downloadDocuments}</h3>
                  <div className="space-y-2">
                    <Button onClick={generatePDF} variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      {translations[selectedLanguage].downloadPDF}
                    </Button>
                    <Button onClick={generateWord} variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      {translations[selectedLanguage].downloadWord}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Share section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                {translations[selectedLanguage].shareValuation}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ShareButtons 
                title={`Valuación de ${propertyData.tipoPropiedad}`}
                description={`Valor estimado: ${formatCurrency(finalAdjustedValue || valuation, selectedCurrency)}`}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Demo walkthrough */}
      {showDemo && (
        <DemoWalkthrough 
          onClose={handleCloseDemo}
        />
      )}
    </div>
  );
};

export default PropertyValuation;