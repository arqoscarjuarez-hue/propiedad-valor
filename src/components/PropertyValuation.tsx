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
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp, FileText, Download, Camera, Trash2, Play, Info, Share2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';
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
import { ShareButtons } from './ShareButtons';


import PropertyComparison from './PropertyComparison';

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
    spaces: 'Espacios',
    characteristics: 'Características',
    location: 'Ubicación',
    photos: 'Fotografías',
    valuation: 'Ajuste de Valor',
    
    // Sección de áreas
    constructionAreas: 'Áreas de Construcción (m²)',
    apartmentArea: 'Área del Apartamento (m²)',
    apartmentAreaTab: 'AREA',
    basement: 'Sótano',
    firstFloor: 'Primer Nivel',
    secondFloor: 'Segundo Nivel',
    thirdFloor: 'Tercer Nivel',
    fourthFloor: 'Cuarto Nivel',
    landArea: 'Área del Terreno',
    
    // Servicios disponibles
    services: 'Servicios',
    availableServices: 'Servicios Disponibles',
    basicServices: 'Servicios Básicos',
    additionalServices: 'Servicios Adicionales',
    water: 'Agua Potable',
    electricity: 'Electricidad',
    gas: 'Gas Natural/LP',
    drainage: 'Drenaje',
    internet: 'Internet',
    cable: 'TV por Cable',
    phone: 'Teléfono',
    security: 'Seguridad Privada',
    swimmingPool: 'Alberca',
    garden: 'Jardín',
    elevator: 'Elevador',
    airConditioning: 'Aire Acondicionado',
    heating: 'Calefacción',
    solarPanels: 'Paneles Solares',
    waterTank: 'Tinaco/Cisterna',
    
    // Tipos de propiedad
    propertyTypeTitle: 'Tipo de Propiedad',
    selectPropertyType: 'Selecciona el tipo de propiedad',
    house: 'Casa',
    apartment: 'Apartamento',
    land: 'Terreno',
    commercial: 'Comercial',
    warehouse: 'Bodega',
    
    // Espacios y características
    spacesDistribution: 'Distribución de Espacios y Características',
    livingSpaces: 'Espacios Habitacionales',
    bedrooms: 'Recámaras/Dormitorios',
    bedroomsDescription: 'Número de habitaciones',
    livingRooms: 'Salas/Estancias',
    livingRoomsDescription: 'Salas de estar principales',
    diningRoom: 'Comedor',
    diningRoomDescription: 'Espacios de comedor',
    bathrooms: 'Baños Completos',
    bathroomsDescription: 'Baños con regadera/tina',
    
    serviceSpaces: 'Espacios de Servicio',
    kitchen: 'Cocina',
    kitchenDescription: 'Número de cocinas',
    storage: 'Bodega/Almacén',
    storageDescription: 'Espacios de almacenamiento',
    serviceArea: 'Área de Servicio',
    serviceAreaDescription: 'Cuarto de lavado/servicio',
    garage: 'Cochera/Garaje',
    garageDescription: 'Espacios de estacionamiento',
    others: 'Otros Espacios',
    othersDescription: 'Estudios, oficinas, etc.',
    additionalSpaces: 'Espacios Adicionales',
    
    // Características
    propertyCharacteristics: 'Características de la Propiedad',
    temporalInfo: 'Información Temporal',
    qualityAndCondition: 'Calidad y Estado de la Propiedad',
    constructionAge: 'Antigüedad de la Construcción',
    yearsSinceConstruction: 'Años desde la construcción original',
    
    // Location Quality options
    excellentZone: 'Excelente',
    goodZone: 'Buena',
    regularZone: 'Regular',
    badZone: 'Mala',
    locationQualityPlaceholder: 'Selecciona la calidad de ubicación',
    evaluateServices: 'Evalúa servicios, seguridad, accesibilidad',
    
    // General Condition options
    generalConditionLabel: 'Estado General de Conservación',
    conditionPlaceholder: 'Selecciona el estado de conservación',
    newCondition: 'EXCELENTE - Construcción nueva o recién remodelada',
    goodCondition: 'BUENA - Conservación adecuada, mantenimiento al corriente', 
    mediumCondition: 'REGULAR - Desgaste visible, necesita mantenimiento',
    regularCondition: 'REGULAR - Desgaste visible, necesita mantenimiento',
    simpleRepairsCondition: 'REPARACIONES SENCILLAS - Pintura, detalles menores',
    mediumRepairsCondition: 'REPARACIONES MEDIAS - Cambio de pisos, plomería',
    importantRepairsCondition: 'REPARACIONES IMPORTANTES - Estructura, instalaciones',
    seriousDamageCondition: 'DAÑOS GRAVES - Problemas estructurales serios',
    wasteCondition: 'EN DESECHO - Demolición parcial necesaria',
    affectsPropertyValue: 'Afecta directamente el valor de la propiedad',
    
    // Access Type options
    accessType: 'Tipo de acceso',
    accessTypePlaceholder: 'Selecciona el tipo de acceso',
    mainStreet: 'Calle principal',
    vehicularPassage: 'Pasaje vehicular',
    pedestrianPassage: 'Pasaje peatonal',
    rightOfWay: 'Servidumbre de paso',
    affectsAccessibility: 'Afecta la accesibilidad de la propiedad',
    
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
    recreationalUse: 'Recreativo',
    
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
    industrialUseExp: 'Uso Industrial: +12% - Infraestructura especializada',
    residentialUseExp: 'Uso Residencial: 0% - Valor base estándar',
    recreationalUseExp: 'Uso Recreativo: -8% - Mercado especializado',
    agriculturalUseExp: 'Uso Agrícola: -32% - Valor extensivo menor',
    
    // Summary sections
    spacesSummary: 'Resumen de Espacios:',
    characteristicsSummary: 'Resumen de Características:',
    servicesSummary: 'Resumen de Servicios:',
    basicServicesSummary: 'Básicos:',
    additionalServicesSummary: 'Adicionales:',
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
    age: 'Antigüedad (años)',
    ageDescription: 'Años desde construcción',
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
    
    // Fotografías
    propertyPhotos: 'Fotografías del Inmueble',
    uploadPhotos: 'Subir Fotografías',
    photosDescription: 'Sube imágenes del interior y exterior del inmueble',
    removePhoto: 'Eliminar foto',
    
    // Botones de acción
    calculate: 'Calcular Valuación',
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
    totalBuiltArea: 'Área Total Construida',
    propertyAreas: 'ÁREAS DE LA PROPIEDAD',
    propertySpaces: 'ESPACIOS DE LA PROPIEDAD',
    availableServicesPDF: 'SERVICIOS DISPONIBLES',
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
     totalBuiltAreaLabel: 'Área Total Construida',
     landAreaLabel: 'Área de Terreno',
     locationLabel: 'Ubicación',
     pricePerBuiltM2: 'Precio por m² construido',
     marketComparison: 'Comparación mercado',
     // Report sections
     annexDetailedComparables: 'ANEXO: FICHAS DETALLADAS DE COMPARABLES',
     physicalCharacteristicsReport: 'CARACTERÍSTICAS FÍSICAS:',
     comparativeAnalysisReport: 'ANÁLISIS COMPARATIVO:',
     builtAreaReport: 'Área Construida',
     priceDifferencePerM2: 'Diferencia de precio por m²',
     completeDataMessage: 'Completa los datos de la propiedad y presiona "Calcular Valuación" para ver el resultado.'
  },
  en: {
    // UI Labels principales
    propertyValuator: 'Property Valuator',
    professionalSystem: 'Professional real estate valuation system',
    languageSelector: 'Language / Idioma',
    propertyData: 'Property Data',
    
    // Pestañas principales
    areas: 'Areas',
    propertyType: 'Type',
    spaces: 'Spaces',
    characteristics: 'Features',
    location: 'Location',
    photos: 'Photos',
    valuation: 'Valuation',
    
    // Sección de áreas
    constructionAreas: 'Construction Areas (sqm)',
    apartmentArea: 'Apartment Area (sqm)',
    apartmentAreaTab: 'AREA',
    basement: 'Basement',
    firstFloor: 'First Floor',
    secondFloor: 'Second Floor',
    thirdFloor: 'Third Floor',
    fourthFloor: 'Fourth Floor',
    landArea: 'Land Area',
    
    // Servicios disponibles
    services: 'Services',
    availableServices: 'Available Services',
    basicServices: 'Basic Services',
    additionalServices: 'Additional Services',
    water: 'Potable Water',
    electricity: 'Electricity',
    gas: 'Natural Gas/LP',
    drainage: 'Drainage',
    internet: 'Internet',
    cable: 'Cable TV',
    phone: 'Phone',
    security: 'Private Security',
    swimmingPool: 'Swimming Pool',
    garden: 'Garden',
    elevator: 'Elevator',
    airConditioning: 'Air Conditioning',
    heating: 'Heating',
    solarPanels: 'Solar Panels',
    waterTank: 'Water Tank/Cistern',
    
    // Tipos de propiedad
    propertyTypeTitle: 'Property Type',
    selectPropertyType: 'Select property type',
    house: 'House',
    apartment: 'Apartment',
    land: 'Land',
    commercial: 'Commercial',
    warehouse: 'Warehouse',
    
    // Espacios y características
    spacesDistribution: 'Spaces Distribution and Features',
    livingSpaces: 'Living Spaces',
    bedrooms: 'Bedrooms',
    bedroomsDescription: 'Number of bedrooms',
    livingRooms: 'Living Rooms',
    livingRoomsDescription: 'Main living areas',
    diningRoom: 'Dining Room',
    diningRoomDescription: 'Dining spaces',
    bathrooms: 'Full Bathrooms',
    bathroomsDescription: 'Bathrooms with shower/tub',
    
    serviceSpaces: 'Service Spaces',
    kitchen: 'Kitchen',
    kitchenDescription: 'Number of kitchens',
    storage: 'Storage/Warehouse',
    storageDescription: 'Storage spaces',
    serviceArea: 'Service Area',
    serviceAreaDescription: 'Laundry/service room',
    garage: 'Garage',
    garageDescription: 'Parking spaces',
    others: 'Other Spaces',
    othersDescription: 'Studies, offices, etc.',
    additionalSpaces: 'Additional Spaces',
    
    // Características
    propertyCharacteristics: 'Property Features',
    temporalInfo: 'Temporal Information',
    qualityAndCondition: 'Quality and Property Condition',
    constructionAge: 'Construction Age',
    yearsSinceConstruction: 'Years since original construction',
    
    // Location Quality options
    excellentZone: 'Excellent',
    goodZone: 'Good',
    regularZone: 'Regular', 
    badZone: 'Bad',
    locationQualityPlaceholder: 'Select location quality',
    evaluateServices: 'Evaluate services, security, accessibility',
    
    // General Condition options
    generalConditionLabel: 'General Condition',
    conditionPlaceholder: 'Select conservation condition',
    newCondition: 'EXCELLENT - New construction or recently remodeled',
    goodCondition: 'GOOD - Adequate conservation, up-to-date maintenance',
    mediumCondition: 'REGULAR - Visible wear, needs maintenance',
    regularCondition: 'REGULAR - Visible wear, needs maintenance',
    simpleRepairsCondition: 'SIMPLE REPAIRS - Paint, minor details',
    mediumRepairsCondition: 'MEDIUM REPAIRS - Floor change, plumbing',
    importantRepairsCondition: 'IMPORTANT REPAIRS - Structure, installations',
    seriousDamageCondition: 'SERIOUS DAMAGE - Serious structural problems',
    wasteCondition: 'WASTE - Partial demolition needed',
    affectsPropertyValue: 'Directly affects property value',
    
    // Access Type options
    accessType: 'Access Type',
    accessTypePlaceholder: 'Select access type',
    mainStreet: 'Main street',
    vehicularPassage: 'Vehicular passage',
    pedestrianPassage: 'Pedestrian passage',
    rightOfWay: 'Right of way',
    affectsAccessibility: 'Affects property accessibility',
    
    // Land-specific characteristics
    landCharacteristics: 'Land Characteristics',
    topography: 'Topography',
    selectTopography: 'Select topography type',
    flat: 'Flat',
    gentleSlope: 'Gentle Slope',
    moderateSlope: 'Moderate Slope',
    steepSlope: 'Steep Slope',
    irregular: 'Irregular',
    valuationType: 'Valuation Type',
    selectValuationType: 'Select valuation type',
    residentialUse: 'Residential',
    commercialUse: 'Commercial',
    industrialUse: 'Industrial',
    agriculturalUse: 'Agricultural',
    recreationalUse: 'Recreational',
    
    // International standards explanations for land
    internationalStandards: 'International IVS/RICS Standards',
    topographyFactors: 'Topography Factors applied:',
    landUseFactors: 'Land Use Factors applied:',
    flatLandExp: 'Flat Land (0-5% slope): +12% - Facilitates construction',
    gentleSlopeExp: 'Gentle Slope (5-15%): +3% - Adequate natural drainage',
    moderateSlopeExp: 'Moderate Slope (15-25%): -7% - Additional costs',
    steepSlopeExp: 'Steep Slope (25-40%): -20% - Requires specialized engineering',
    irregularExp: 'Irregular Terrain (>40%): -25% - Very costly development',
    commercialUseExp: 'Commercial Use: +28% - Higher income potential',
    industrialUseExp: 'Industrial Use: +12% - Specialized infrastructure',
    residentialUseExp: 'Residential Use: 0% - Standard base value',
    recreationalUseExp: 'Recreational Use: -8% - Specialized market',
    agriculturalUseExp: 'Agricultural Use: -32% - Lower extensive value',
    
    // Summary sections
    spacesSummary: 'Spaces Summary:',
    characteristicsSummary: 'Characteristics Summary:',
    servicesSummary: 'Services Summary:',
    basicServicesSummary: 'Basic:',
    additionalServicesSummary: 'Additional:',
    propertyAge: 'Age:',
    propertyLocation: 'Location:',
    propertyCondition: 'Condition:',
    propertyTopography: 'Topography:',
    propertyValuationType: 'Valuation Type:',
    notSpecified: 'Not specified',
    noSpecified: 'Not specified',
    
    // Letterhead and demo
    letterheadType: 'Letterhead Type for Reports',
    selectLetterhead: 'Select letterhead type',
    viewDemo: 'View Usage Demo',
    
    // Error messages
    errorTitle: 'Error',
    errorUpdatingData: 'Error updating property data',
    errorMinimumArea: 'Must enter at least one construction area greater than 0',
    age: 'Age (years)',
    ageDescription: 'Years since construction',
    locationQuality: 'Location Quality',
    locationDescription: 'Evaluate area and access',
    environmentalFactors: 'Environmental Factors and Risks',
    environmentalDescription: 'Evaluate natural risks and environmental conditions',
    environmentalExcellent: 'Excellent - No natural risks, favorable topography, stable climate',
    environmentalGood: 'Good - Minimal risks, acceptable environmental conditions',
    environmentalRegular: 'Regular - Some manageable risks',
    environmentalPoor: 'Poor - High risk of flooding, landslides or other hazards',
    generalCondition: 'General Condition',
    conditionDescription: 'Physical condition of property',
    
    // Condiciones
    new: 'New',
    good: 'Good',
    medium: 'Medium',
    regular: 'Regular',
    simpleRepairs: 'Simple Repairs',
    mediumRepairs: 'Medium Repairs',
    importantRepairs: 'Important Repairs',
    seriousDamage: 'Serious Damage',
    waste: 'Waste',
    useless: 'Useless',
    
    // Ubicaciones
    excellent: 'Excellent',
    goodLocation: 'Good',
    regularLocation: 'Regular',
    badLocation: 'Bad',
    
    
    // Ubicación
    locationSketch: 'Location Sketch',
    mapInstructions: 'Location Sketch: Mark the exact location of the property on the map. This will help provide a more accurate valuation.',
    clickOnMap: 'Click on the map to select the exact location of the property',
    currentAddress: 'Current address',
    viewMap: 'View Map',
    editData: 'Edit Data',
    registeredAddress: 'Registered Address:',
    coordinates: 'Coordinates:',
    editLocationInstructions: 'Manually edit the property location data.',
    fullAddress: 'Full Address',
    fullAddressPlaceholder: 'E.g.: 123 Street, Neighborhood, City, State, ZIP',
    coordinatesNote: 'Map coordinates remain unchanged',
    latitude: 'Latitude',
    longitude: 'Longitude',
    latitudePlaceholder: 'E.g.: 19.4326',
    longitudePlaceholder: 'E.g.: -99.1332',
    
    
    // Fotografías
    uploadPhotos: 'Upload Photos',
    photosDescription: 'Upload interior and exterior images of the property',
    removePhoto: 'Remove photo',
    
    // Botones de acción
    calculate: 'Calculate Valuation',
    regenerate: 'Regenerate Comparatives',
    downloadPDF: 'Download PDF',
    downloadWord: 'Download Word',
    
    // Resultado de valuación
    propertyValuationTitle: 'Property Valuation',
    estimatedValue: 'Estimated Value',
    priceAdjustment: 'Price Adjustment',
    adjustmentDescription: 'Adjust final price based on additional factors',
    marketAnalysisTitle: 'Market Analysis',
    comparativeProperties: 'Comparative Properties',
    selectComparatives: 'Select Comparables (3 of 10)',
    allComparatives: 'All Comparative Properties',
    selectedForValuation: 'Selected for Valuation',
    averagePrice: 'Average Price',
    minPrice: 'Minimum Price',
    maxPrice: 'Maximum Price',
    
    // Tabla de comparativas
    property: 'Property',
    builtArea: 'Built Area',
    price: 'Price',
    priceM2: 'Price/sqm',
    distance: 'Distance',
    
    // PDF Content
    residentialValuation: 'RESIDENTIAL VALUATION',
    apartmentValuation: 'APARTMENT VALUATION',
    landValuation: 'LAND VALUATION',
    commercialValuation: 'COMMERCIAL VALUATION',
    residentialSubtitle: 'Professional Residential Property Appraisal',
    apartmentSubtitle: 'Professional Housing Unit Appraisal',
    landSubtitle: 'Professional Land Appraisal - IVS/RICS Standards',
    commercialSubtitle: 'Professional Commercial Property Appraisal',
    marketAnalysis: 'Professional Market Value Analysis',
    propertyLocationPDF: 'PROPERTY LOCATION',
    generalInfo: 'GENERAL INFORMATION',
    type: 'Type',
    totalBuiltArea: 'Total Built Area',
    propertyAreas: 'PROPERTY AREAS',
    propertySpaces: 'PROPERTY SPACES',
    estimatedValuePDF: 'ESTIMATED VALUE',
    pricePerSqm: 'Price per sqm',
    basedOnComparables: 'Based on 3 comparables',
    mapLocation: 'MAP LOCATION',
    address: 'Address',
    viewInGoogleMaps: 'View location on Google Maps',
    photograph: 'Photograph',
    totalPhotos: 'Total photographs in file',
    captureDate: 'Capture date',
    
    // Units
    sqm: 'sqm',
    meters: 'm',
    years: 'years',
    
    // Messages
    calculatingValuation: 'Calculating Valuation',
    generatingReport: 'Generating appraisal with 3 comparables...',
    valuationCompleted: 'Valuation Completed',
    estimatedValueTitle: 'Estimated value',
    comparables: 'comparables',
    comparativesUpdated: 'Comparatives Updated',
    newComparativesGenerated: 'New nearby properties have been generated',
    currencyChanged: 'Currency Changed',
    valuationNowIn: 'Valuation now shown in',
     priceAdjusted: 'Price Adjusted',
     adjustment: 'Adjustment',
     newValue: 'New value',
     
      // PDF Additional labels
      professionalAppraisalSystem: 'Professional appraisal system, Property evaluation',
      coordinatesLabel: 'Coordinates:',
     marketSummary: 'Market Summary:',
     propertyPhotographs: 'PROPERTY PHOTOGRAPHS',
     comparablesAnnex: 'ANNEX: DETAILED COMPARABLE SHEETS',
     realProperty: '(Real Property)',
     referenceProperty: '(Reference Property)',
     locationCharacteristics: 'LOCATION AND CHARACTERISTICS:',
     viewOnGoogleMaps: 'View location on Google Maps',
     physicalCharacteristics: 'PHYSICAL CHARACTERISTICS:',
     priceInformation: 'PRICE INFORMATION:',
     
     // Share section
     shareAppraisal: 'SHARE THIS APPRAISAL',
     shareAppraisalText: 'Share this professional appraisal on social media:',
     clickSelectedLink: 'Click on the selected link',
     whatsapp: 'WhatsApp',
     facebook: 'Facebook',
     twitter: 'Twitter',
     instagram: 'Instagram',
     tiktok: 'TikTok',
     linkedin: 'LinkedIn',
     visitWebsite: 'Visit our website:',
     getYourAppraisal: 'Get your own professional appraisal on our system!',
     
     // Error messages
     errorGeneric: 'Error',
     errorCalculatingValuation: 'An error occurred while calculating the valuation. Please try again.',
     errorPDFGeneration: 'You must first calculate the valuation to generate the PDF',
     errorWordGeneration: 'You must first calculate the valuation to generate the Word document',
     errorGeneratingPDF: 'Could not generate PDF',
     errorGeneratingWord: 'Could not generate Word document',
     searchingComparables: 'Searching for new comparable nearby properties...',
     pdfGenerated: 'PDF Generated',
     pdfGeneratedDesc: 'The complete appraisal has been downloaded successfully',
     wordGenerated: 'Word Document Generated',
     wordGeneratedDesc: 'The complete appraisal has been downloaded successfully',
     
      // Disclaimer
      disclaimerText: 'This valuation is an estimate based on the provided data. It is recommended to consult with a certified appraiser for official valuations.',
      
      // Tooltips y explicaciones
      landAreaTooltip: 'Indicate the land area only in square meters (m²). For apartments on floors above the first, the land area should equal the total construction area.',
      observationsPlaceholder: 'Additional information about the property (maximum 500 characters)',
      selectServiceError: 'You must select a service to continue',
      maxCharactersNote: 'maximum characters',
       additionalInfo: 'Additional information',
       optional: 'Optional',
       propertyValuationResults: 'Valuation Results',
       downloadDocuments: 'Download Documents',
       shareValuation: 'Share Valuation',
       currencyValuation: 'Valuation Currency',
       needHelpSystem: 'Need help using the system?',
       multilingual: 'Multilingual',
       interfaceReports: 'All interface and reports are automatically translated',
       // Currency selector  
       exchangeRateUpdated: 'Exchange Rates Updated',
       exchangeRateError: 'Could not update exchange rates. Previous rates will be used.',
       exchangeRateNote: 'Exchange rates are obtained from ExchangeRate-API and updated in real time.',
       exchangeRateLabel: 'Exchange rate',
       lastUpdateText: 'Last update',
       // Valuation results panel
       valuationResultsTitle: 'Valuation Results',
       basedOnComparablesText: 'Based on 3 comparables',
       originalBaseValue: 'Original base value',
       adjustmentLabel: 'Adjustment',
       totalBuiltAreaLabel: 'Total Built Area',
       landAreaLabel: 'Land Area',
       locationLabel: 'Location',
       pricePerBuiltM2: 'Price per built m²',
       marketComparison: 'Market comparison',
       // Report sections
       annexDetailedComparables: 'ANNEX: DETAILED COMPARABLE SHEETS',
       physicalCharacteristicsReport: 'PHYSICAL CHARACTERISTICS:',
       comparativeAnalysisReport: 'COMPARATIVE ANALYSIS:',
       builtAreaReport: 'Built Area',
       priceDifferencePerM2: 'Price difference per m²',
       completeDataMessage: 'Complete the property data and press "Calculate Valuation" to see the result.'
  },
  fr: {
    // UI Labels principales
    propertyValuator: 'Évaluateur de Propriétés',
    professionalSystem: 'Système professionnel d\'évaluation immobilière',
    languageSelector: 'Langue / Language',
    propertyData: 'Données de la Propriété',
    
    // Pestañas principales
    areas: 'Superficies',
    propertyType: 'Type',
    spaces: 'Espaces',
    characteristics: 'Caractéristiques',
    location: 'Localisation',
    photos: 'Photos',
    valuation: 'Évaluation',
    
    // Sección de áreas
    constructionAreas: 'Superficies de Construction (m²)',
    apartmentArea: 'Surface de l\'Appartement (m²)',
    apartmentAreaTab: 'SUPERFICIE',
    basement: 'Sous-sol',
    firstFloor: 'Rez-de-chaussée',
    secondFloor: 'Premier Étage',
    thirdFloor: 'Deuxième Étage',
    fourthFloor: 'Troisième Étage',
    landArea: 'Surface du Terrain',
    
    // Servicios disponibles
    services: 'Services',
    availableServices: 'Services Disponibles',
    basicServices: 'Services de Base',
    additionalServices: 'Services Supplémentaires',
    water: 'Eau Potable',
    electricity: 'Électricité',
    gas: 'Gaz Naturel/GPL',
    drainage: 'Égouts',
    internet: 'Internet',
    cable: 'Télévision par Câble',
    phone: 'Téléphone',
    security: 'Sécurité Privée',
    swimmingPool: 'Piscine',
    garden: 'Jardin',
    elevator: 'Ascenseur',
    airConditioning: 'Climatisation',
    heating: 'Chauffage',
    solarPanels: 'Panneaux Solaires',
    waterTank: 'Réservoir d\'Eau/Citerne',
    
    // Tipos de propiedad
    propertyTypeTitle: 'Type de Propriété',
    selectPropertyType: 'Sélectionnez le type de propriété',
    house: 'Maison',
    apartment: 'Appartement',
    land: 'Terrain',
    commercial: 'Commercial',
    warehouse: 'Entrepôt',
    
    // Espacios y características
    spacesDistribution: 'Distribution des Espaces et Caractéristiques',
    livingSpaces: 'Espaces Habitables',
    bedrooms: 'Chambres',
    bedroomsDescription: 'Nombre de chambres',
    livingRooms: 'Salons',
    livingRoomsDescription: 'Espaces de vie principaux',
    diningRoom: 'Salle à Manger',
    diningRoomDescription: 'Espaces de repas',
    bathrooms: 'Salles de Bain Complètes',
    bathroomsDescription: 'Salles de bain avec douche/baignoire',
    
    serviceSpaces: 'Espaces de Service',
    kitchen: 'Cuisine',
    kitchenDescription: 'Nombre de cuisines',
    storage: 'Stockage/Entrepôt',
    storageDescription: 'Espaces de stockage',
    serviceArea: 'Zone de Service',
    serviceAreaDescription: 'Buanderie/local de service',
    garage: 'Garage',
    garageDescription: 'Places de parking',
    others: 'Autres Espaces',
    othersDescription: 'Bureaux, études, etc.',
    additionalSpaces: 'Espaces Supplémentaires',
    
    // Características
    propertyCharacteristics: 'Caractéristiques de la Propriété',
    temporalInfo: 'Informations Temporelles',
    qualityAndCondition: 'Qualité et État de la Propriété',
    constructionAge: 'Âge de la Construction',
    yearsSinceConstruction: 'Années depuis la construction originale',
    
    // Location Quality options
    excellentZone: 'Excellent - Zone exclusive/premium',
    goodZone: 'Bon - Zone résidentielle établie',
    regularZone: 'Régulier - Zone en développement',
    badZone: 'Mauvais - Zone avec problèmes urbains',
    locationQualityPlaceholder: 'Sélectionnez la qualité de l\'emplacement',
    evaluateServices: 'Évaluer services, sécurité, accessibilité',
    
    // General Condition options  
    generalConditionLabel: 'État Général de Conservation',
    conditionPlaceholder: 'Sélectionnez l\'état de conservation',
    newCondition: 'NOUVEAU - Inutilisé, comme nouvellement construit',
    goodCondition: 'BON - Très bien entretenu, usure minimale',
    mediumCondition: 'MOYEN - Conservation moyenne, usage normal',
    regularCondition: 'RÉGULIER - Usure visible, nécessite entretien',
    simpleRepairsCondition: 'RÉPARATIONS SIMPLES - Peinture, détails mineurs',
    mediumRepairsCondition: 'RÉPARATIONS MOYENNES - Changement sols, plomberie',
    importantRepairsCondition: 'RÉPARATIONS IMPORTANTES - Structure, installations',
    seriousDamageCondition: 'DOMMAGES GRAVES - Problèmes structurels sérieux',
    wasteCondition: 'DÉCHET - Démolition partielle nécessaire',
    affectsPropertyValue: 'Affecte directement la valeur de la propriété',
    
    // Access Type options
    accessType: 'Type d\'accès',
    accessTypePlaceholder: 'Sélectionnez le type d\'accès',
    mainStreet: 'Rue principale',
    vehicularPassage: 'Passage véhiculaire',
    pedestrianPassage: 'Passage piétonnier',
    rightOfWay: 'Servitude de passage',
    affectsAccessibility: 'Affecte l\'accessibilité de la propriété',
    
    // Caractéristiques spécifiques du terrain
    landCharacteristics: 'Caractéristiques du Terrain',
    topography: 'Topographie',
    selectTopography: 'Sélectionnez le type de topographie',
    flat: 'Plat',
    gentleSlope: 'Pente Douce',
    moderateSlope: 'Pente Modérée',
    steepSlope: 'Pente Raide',
    irregular: 'Irrégulier',
    valuationType: 'Type de Valorisation',
    selectValuationType: 'Sélectionnez le type de valorisation',
    residentialUse: 'Résidentiel',
    commercialUse: 'Commercial',
    industrialUse: 'Industriel',
    agriculturalUse: 'Agricole',
    recreationalUse: 'Récréatif',
    
    // Explicaciones de estándares internacionales para terrenos - French
    internationalStandards: 'Standards Internationaux IVS/RICS',
    topographyFactors: 'Facteurs de Topographie appliqués:',
    landUseFactors: 'Facteurs par Type d\'Usage appliqués:',
    flatLandExp: 'Terrain Plat (0-5% pente): +12% - Facilite la construction',
    gentleSlopeExp: 'Pente Douce (5-15%): +3% - Drainage naturel adéquat',
    moderateSlopeExp: 'Pente Modérée (15-25%): -7% - Coûts supplémentaires',
    steepSlopeExp: 'Pente Prononcée (25-40%): -20% - Nécessite ingénierie spécialisée',
    irregularExp: 'Terrain Irrégulier (>40%): -25% - Développement très coûteux',
    commercialUseExp: 'Usage Commercial: +28% - Plus grand potentiel de revenus',
    industrialUseExp: 'Usage Industriel: +12% - Infrastructure spécialisée',
    residentialUseExp: 'Usage Résidentiel: 0% - Valeur de base standard',
    recreationalUseExp: 'Usage Récréatif: -8% - Marché spécialisé',
    agriculturalUseExp: 'Usage Agricole: -32% - Valeur extensive moindre',
    
    // Summary sections
    spacesSummary: 'Résumé des Espaces:',
    characteristicsSummary: 'Résumé des Caractéristiques:',
    servicesSummary: 'Résumé des Services:',
    basicServicesSummary: 'De base:',
    additionalServicesSummary: 'Supplémentaires:',
    propertyAge: 'Âge:',
    propertyLocation: 'Emplacement:',
    propertyCondition: 'État:',
    propertyTopography: 'Topographie:',
    propertyValuationType: 'Type de Valorisation:',
    notSpecified: 'Non spécifié',
    noSpecified: 'Non spécifié',
    
    // Letterhead and demo
    letterheadType: 'Type d\'En-tête pour Rapports',
    selectLetterhead: 'Sélectionner type d\'en-tête',
    viewDemo: 'Voir Démo d\'Utilisation',
    
    // Error messages
    errorTitle: 'Erreur',
    errorUpdatingData: 'Erreur lors de la mise à jour des données de propriété',
    errorMinimumArea: 'Doit saisir au moins une surface de construction supérieure à 0',
    age: 'Âge (années)',
    ageDescription: 'Années depuis la construction',
    locationQuality: 'Qualité de l\'Emplacement',
    locationDescription: 'Évaluer la zone et les accès',
    environmentalFactors: 'Facteurs Environnementaux et Risques',
    environmentalDescription: 'Évaluer les risques naturels et conditions environnementales',
    environmentalExcellent: 'Excellent - Aucun risque naturel, topographie favorable, climat stable',
    environmentalGood: 'Bon - Risques minimaux, conditions environnementales acceptables',
    environmentalRegular: 'Régulier - Quelques risques gérables',
    environmentalPoor: 'Déficient - Risque élevé d\'inondation, glissement ou autres dangers',
    generalCondition: 'État Général',
    conditionDescription: 'Condition physique de la propriété',
    
    // Condiciones
    new: 'Nouveau',
    good: 'Bon',
    medium: 'Moyen',
    regular: 'Régulier',
    simpleRepairs: 'Réparations Simples',
    mediumRepairs: 'Réparations Moyennes',
    importantRepairs: 'Réparations Importantes',
    seriousDamage: 'Dommages Graves',
    waste: 'À Démolir',
    useless: 'Inutilisable',
    
    // Ubicaciones
    excellent: 'Excellent',
    goodLocation: 'Bon',
    regularLocation: 'Régulier',
    badLocation: 'Mauvais',
    
    

    
    // Ubicación
    locationSketch: 'Croquis de Localisation',
    mapInstructions: 'Croquis de Localisation: Marquez l\'emplacement exact de la propriété sur la carte. Cela aidera à fournir une évaluation plus précise.',
    clickOnMap: 'Cliquez sur la carte pour sélectionner l\'emplacement exact de la propriété',
    currentAddress: 'Adresse actuelle',
    viewMap: 'Voir la Carte',
    editData: 'Modifier les Données',
    registeredAddress: 'Adresse Enregistrée:',
    coordinates: 'Coordonnées:',
    editLocationInstructions: 'Modifier manuellement les données de localisation de la propriété.',
    fullAddress: 'Adresse Complète',
    fullAddressPlaceholder: 'Ex: 123 Rue, Quartier, Ville, État, CP',
    coordinatesNote: 'Les coordonnées de la carte restent inchangées',
    latitude: 'Latitude',
    longitude: 'Longitude',
    latitudePlaceholder: 'Ex: 19.4326',
    longitudePlaceholder: 'Ex: -99.1332',
    
    // Fotografías
    photosDescription: 'Téléchargez des images intérieures et extérieures de la propriété',
    removePhoto: 'Supprimer la photo',
    
    // Botones de acción
    calculate: 'Calculer l\'Évaluation',
    regenerate: 'Régénérer les Comparaisons',
    downloadPDF: 'Télécharger PDF',
    downloadWord: 'Télécharger Word',
    
    // Resultado de valuación
    propertyValuationTitle: 'Évaluation de la Propriété',
    estimatedValue: 'Valeur Estimée',
    priceAdjustment: 'Ajustement du Prix',
    adjustmentDescription: 'Ajuster le prix final basé sur des facteurs supplémentaires',
    marketAnalysisTitle: 'Analyse du Marché',
    comparativeProperties: 'Propriétés Comparatives',
    selectComparatives: 'Sélectionner Comparables (3 sur 10)',
    allComparatives: 'Toutes les Propriétés Comparatives',
    selectedForValuation: 'Sélectionnées pour Évaluation',
    averagePrice: 'Prix Moyen',
    minPrice: 'Prix Minimum',
    maxPrice: 'Prix Maximum',
    
    // Tabla de comparativas
    property: 'Propriété',
    builtArea: 'Surface Const.',
    price: 'Prix',
    priceM2: 'Prix/m²',
    distance: 'Distance',
    
    // PDF Content
    residentialValuation: 'ÉVALUATION RÉSIDENTIELLE',
    apartmentValuation: 'ÉVALUATION D\'APPARTEMENT',
    landValuation: 'ÉVALUATION DE TERRAIN',
    commercialValuation: 'ÉVALUATION COMMERCIALE',
    residentialSubtitle: 'Expertise Professionnelle de Maison d\'Habitation',
    apartmentSubtitle: 'Expertise Professionnelle d\'Unité d\'Habitation',
    landSubtitle: 'Expertise Professionnelle de Terrain - Standards IVS/RICS',
    commercialSubtitle: 'Expertise Professionnelle de Bien Commercial',
    marketAnalysis: 'Analyse Professionnelle de la Valeur de Marché',
    propertyLocationPDF: 'LOCALISATION DE LA PROPRIÉTÉ',
    generalInfo: 'INFORMATIONS GÉNÉRALES',
    type: 'Type',
    totalBuiltArea: 'Surface Totale Construite',
    propertyAreas: 'SURFACES DE LA PROPRIÉTÉ',
    propertySpaces: 'ESPACES DE LA PROPRIÉTÉ',
    estimatedValuePDF: 'VALEUR ESTIMÉE',
    pricePerSqm: 'Prix par m²',
    basedOnComparables: 'Basé sur 3 comparables',
    mapLocation: 'LOCALISATION SUR CARTE',
    address: 'Adresse',
    viewInGoogleMaps: 'Voir l\'emplacement sur Google Maps',
    photograph: 'Photographie',
    totalPhotos: 'Total des photographies dans le dossier',
    captureDate: 'Date de capture',
    
    // Units
    sqm: 'm²',
    meters: 'm',
    years: 'années',
    
    // Messages
    calculatingValuation: 'Calcul de l\'Évaluation',
    generatingReport: 'Génération de l\'expertise avec 3 comparables...',
    valuationCompleted: 'Évaluation Terminée',
    estimatedValueTitle: 'Valeur estimée',
    comparables: 'comparables',
    comparativesUpdated: 'Comparaisons Mises à Jour',
    newComparativesGenerated: 'De nouvelles propriétés proches ont été générées',
    currencyChanged: 'Devise Changée',
    valuationNowIn: 'Évaluation maintenant affichée en',
     priceAdjusted: 'Prix Ajusté',
     adjustment: 'Ajustement',
     newValue: 'Nouvelle valeur',
     
     // PDF Additional labels
     professionalAppraisalSystem: 'Système professionnel d\'évaluations, Évaluation de propriétés',
     coordinatesLabel: 'Coordonnées:',
     marketSummary: 'Résumé du Marché:',
     propertyPhotographs: 'PHOTOGRAPHIES DE LA PROPRIÉTÉ',
     comparablesAnnex: 'ANNEXE: FICHES DÉTAILLÉES DES COMPARABLES',
     realProperty: '(Propriété Réelle)',
     referenceProperty: '(Propriété de Référence)',
     locationCharacteristics: 'LOCALISATION ET CARACTÉRISTIQUES:',
     viewOnGoogleMaps: 'Voir l\'emplacement sur Google Maps',
     physicalCharacteristics: 'CARACTÉRISTIQUES PHYSIQUES:',
     priceInformation: 'INFORMATIONS DE PRIX:',
     
     // Share section
     shareAppraisal: 'PARTAGEZ CETTE ÉVALUATION',
     shareAppraisalText: 'Partagez cette évaluation professionnelle sur les réseaux sociaux:',
     clickSelectedLink: 'Cliquez sur le lien sélectionné',
     whatsapp: 'WhatsApp',
     facebook: 'Facebook',
     twitter: 'Twitter',
     instagram: 'Instagram',
     tiktok: 'TikTok',
     linkedin: 'LinkedIn',
     visitWebsite: 'Visitez notre site web:',
     getYourAppraisal: 'Obtenez votre propre évaluation professionnelle sur notre système!',
     
     // Error messages
     errorGeneric: 'Erreur',
     errorCalculatingValuation: 'Une erreur s\'est produite lors du calcul de l\'évaluation. Veuillez réessayer.',
     errorPDFGeneration: 'Vous devez d\'abord calculer l\'évaluation pour générer le PDF',
     errorWordGeneration: 'Vous devez d\'abord calculer l\'évaluation pour générer le document Word',
     errorGeneratingPDF: 'Impossible de générer le PDF',
     errorGeneratingWord: 'Impossible de générer le document Word',
     searchingComparables: 'Recherche de nouvelles propriétés comparables à proximité...',
     pdfGenerated: 'PDF Généré',
     pdfGeneratedDesc: 'L\'évaluation complète a été téléchargée avec succès',
     wordGenerated: 'Document Word Généré',
     wordGeneratedDesc: 'L\'évaluation complète a été téléchargée avec succès',
     
      // Disclaimer
      disclaimerText: 'Cette évaluation est une estimation basée sur les données fournies. Il est recommandé de consulter un évaluateur certifié pour les évaluations officielles.',
      
      // Tooltips y explicaciones
      landAreaTooltip: 'Indiquez la superficie du terrain uniquement en mètres carrés (m²). Pour les appartements aux étages supérieurs au premier, la surface du terrain doit être égale à la surface totale de construction.',
      observationsPlaceholder: 'Informations supplémentaires sur la propriété (maximum 500 caractères)',
      selectServiceError: 'Vous devez sélectionner un service pour continuer',
      maxCharactersNote: 'caractères maximum',
       additionalInfo: 'Informations supplémentaires',
       optional: 'Optionnel',
       propertyValuationResults: 'Résultats d\'Évaluation',
       downloadDocuments: 'Télécharger Documents',
       shareValuation: 'Partager Évaluation',
       currencyValuation: 'Devise d\'Évaluation',
       needHelpSystem: 'Besoin d\'aide pour utiliser le système?',
       multilingual: 'Multilingue',
       interfaceReports: 'Toute l\'interface et les rapports sont traduits automatiquement',
       // Currency selector
       exchangeRateUpdated: 'Taux de Change Mis à Jour',
       exchangeRateError: 'Impossible de mettre à jour les taux de change. Les taux précédents seront utilisés.',
       exchangeRateNote: 'Les taux de change sont obtenus d\'ExchangeRate-API et mis à jour en temps réel.',
       exchangeRateLabel: 'Taux de change',
       lastUpdateText: 'Dernière mise à jour',
       // Valuation results panel
       valuationResultsTitle: 'Résultats d\'Évaluation',
       basedOnComparablesText: 'Basé sur 3 comparables',
       originalBaseValue: 'Valeur de base originale',
       adjustmentLabel: 'Ajustement',
       totalBuiltAreaLabel: 'Surface Totale Construite',
       landAreaLabel: 'Surface du Terrain',
       locationLabel: 'Emplacement',
       pricePerBuiltM2: 'Prix par m² construit',
       marketComparison: 'Comparaison marché',
       // Report sections
       annexDetailedComparables: 'ANNEXE: FICHES DÉTAILLÉES DES COMPARABLES',
       physicalCharacteristicsReport: 'CARACTÉRISTIQUES PHYSIQUES:',
       comparativeAnalysisReport: 'ANALYSE COMPARATIVE:',
       builtAreaReport: 'Surface Construite',
       priceDifferencePerM2: 'Différence de prix par m²',
       completeDataMessage: 'Complétez les données de la propriété et appuyez sur "Calculer Évaluation" pour voir le résultat.'
  },
  de: {
    // UI Labels principales
    propertyValuator: 'Immobilienbewertung',
    professionalSystem: 'Professionelles Immobilienbewertungssystem',
    languageSelector: 'Sprache / Language',
    propertyData: 'Immobiliendaten',
    
    // Pestañas principales
    areas: 'Flächen',
    propertyType: 'Typ',
    spaces: 'Räume',
    characteristics: 'Eigenschaften',
    location: 'Lage',
    photos: 'Fotos',
    valuation: 'Bewertung',
    
    // Sección de áreas
    constructionAreas: 'Bauflächen (m²)',
    apartmentArea: 'Wohnungsfläche (m²)',
    apartmentAreaTab: 'FLÄCHE',
    basement: 'Keller',
    firstFloor: 'Erdgeschoss',
    secondFloor: 'Erster Stock',
    thirdFloor: 'Zweiter Stock',
    fourthFloor: 'Dritter Stock',
    landArea: 'Grundstücksfläche',
    
    // Servicios disponibles
    services: 'Dienstleistungen',
    availableServices: 'Verfügbare Dienstleistungen',
    basicServices: 'Grundlegende Dienstleistungen',
    additionalServices: 'Zusätzliche Dienstleistungen',
    water: 'Trinkwasser',
    electricity: 'Elektrizität',
    gas: 'Erdgas/Propangas',
    drainage: 'Kanalisation',
    internet: 'Internet',
    cable: 'Kabelfernsehen',
    phone: 'Telefon',
    security: 'Private Sicherheit',
    swimmingPool: 'Schwimmbad',
    garden: 'Garten',
    elevator: 'Aufzug',
    airConditioning: 'Klimaanlage',
    heating: 'Heizung',
    solarPanels: 'Solarpaneele',
    waterTank: 'Wassertank/Zisterne',
    
    // Tipos de propiedad
    propertyTypeTitle: 'Immobilientyp',
    selectPropertyType: 'Immobilientyp auswählen',
    house: 'Haus',
    apartment: 'Wohnung',
    land: 'Grundstück',
    commercial: 'Gewerblich',
    warehouse: 'Lager',
    
    // Espacios y características
    spacesDistribution: 'Raumaufteilung und Eigenschaften',
    livingSpaces: 'Wohnräume',
    bedrooms: 'Schlafzimmer',
    bedroomsDescription: 'Anzahl der Schlafzimmer',
    livingRooms: 'Wohnzimmer',
    livingRoomsDescription: 'Hauptwohnbereiche',
    diningRoom: 'Esszimmer',
    diningRoomDescription: 'Essbereiche',
    bathrooms: 'Vollbäder',
    bathroomsDescription: 'Badezimmer mit Dusche/Badewanne',
    
    serviceSpaces: 'Wirtschaftsräume',
    kitchen: 'Küche',
    kitchenDescription: 'Anzahl der Küchen',
    storage: 'Lager/Abstellraum',
    storageDescription: 'Lagerräume',
    serviceArea: 'Wirtschaftsbereich',
    serviceAreaDescription: 'Waschküche/Wirtschaftsraum',
    garage: 'Garage',
    garageDescription: 'Parkplätze',
    others: 'Andere Räume',
    othersDescription: 'Büros, Arbeitszimmer, etc.',
    additionalSpaces: 'Zusätzliche Räume',
    
    // Características
    temporalInfo: 'Zeitliche Informationen',
    qualityAndCondition: 'Qualität und Zustand der Immobilie',
    constructionAge: 'Alter der Konstruktion',
    yearsSinceConstruction: 'Jahre seit der ursprünglichen Konstruktion',
    
    // Location Quality options
    excellentZone: 'Exzellent - Exklusive/Premium-Zone',
    goodZone: 'Gut - Etablierte Wohngegend',
    regularZone: 'Regulär - Entwicklungsgebiet',
    badZone: 'Schlecht - Gebiet mit städtischen Problemen',
    locationQualityPlaceholder: 'Standortqualität auswählen',
    evaluateServices: 'Bewerten Sie Dienstleistungen, Sicherheit, Zugänglichkeit',
    
    // General Condition options
    generalConditionLabel: 'Allgemeiner Erhaltungszustand',
    conditionPlaceholder: 'Erhaltungszustand auswählen',
    newCondition: 'NEU - Unbenutzt, wie neu gebaut',
    goodCondition: 'GUT - Sehr gut gepflegt, minimaler Verschleiß',
    mediumCondition: 'MITTEL - Durchschnittliche Erhaltung, normale Nutzung',
    regularCondition: 'REGULÄR - Sichtbarer Verschleiß, benötigt Wartung',
    simpleRepairsCondition: 'EINFACHE REPARATUREN - Farbe, kleinere Details',
    mediumRepairsCondition: 'MITTLERE REPARATUREN - Bodenwechsel, Rohrleitungen',
    importantRepairsCondition: 'WICHTIGE REPARATUREN - Struktur, Installationen',
    seriousDamageCondition: 'SCHWERE SCHÄDEN - Ernsthafte strukturelle Probleme',
    wasteCondition: 'ABFALL - Teilabriss erforderlich',
    affectsPropertyValue: 'Beeinflusst direkt den Immobilienwert',
    
    // Access Type options
    accessType: 'Zugangsart',
    accessTypePlaceholder: 'Zugangsart auswählen',
    mainStreet: 'Hauptstraße',
    vehicularPassage: 'Fahrzeugdurchgang',
    pedestrianPassage: 'Fußgängerdurchgang',
    rightOfWay: 'Wegerecht',
    affectsAccessibility: 'Beeinflusst die Zugänglichkeit der Immobilie',
    
    // Grundstücksspezifische Eigenschaften
    landCharacteristics: 'Grundstücksmerkmale',
    topography: 'Topographie',
    selectTopography: 'Topographietyp auswählen',
    flat: 'Flach',
    gentleSlope: 'Sanfte Neigung',
    moderateSlope: 'Mittlere Neigung',
    steepSlope: 'Steile Neigung',
    irregular: 'Unregelmäßig',
    valuationType: 'Bewertungstyp',
    selectValuationType: 'Bewertungstyp auswählen',
    residentialUse: 'Wohnen',
    commercialUse: 'Gewerblich',
    industrialUse: 'Industriell',
    agriculturalUse: 'Landwirtschaftlich',
    recreationalUse: 'Erholung',
    
    // Explicaciones de estándares internacionales para terrenos - German
    internationalStandards: 'Internationale IVS/RICS Standards',
    topographyFactors: 'Angewandte Topographie-Faktoren:',
    landUseFactors: 'Angewandte Landnutzungsfaktoren:',
    flatLandExp: 'Flaches Land (0-5% Neigung): +12% - Erleichtert Bau',
    gentleSlopeExp: 'Sanfte Neigung (5-15%): +3% - Angemessene natürliche Entwässerung',
    moderateSlopeExp: 'Mittlere Neigung (15-25%): -7% - Zusätzliche Kosten',
    steepSlopeExp: 'Steile Neigung (25-40%): -20% - Erfordert spezialisierte Technik',
    irregularExp: 'Unregelmäßiges Gelände (>40%): -25% - Sehr kostspielige Entwicklung',
    commercialUseExp: 'Gewerbliche Nutzung: +28% - Höheres Einkommenspotential',
    industrialUseExp: 'Industrielle Nutzung: +12% - Spezialisierte Infrastruktur',
    residentialUseExp: 'Wohnnutzung: 0% - Standard Grundwert',
    recreationalUseExp: 'Erholungsnutzung: -8% - Spezialisierter Markt',
    agriculturalUseExp: 'Landwirtschaftliche Nutzung: -32% - Geringerer extensiver Wert',
    
    // Summary sections
    spacesSummary: 'Raumzusammenfassung:',
    characteristicsSummary: 'Merkmalszusammenfassung:',
    servicesSummary: 'Dienstleistungszusammenfassung:',
    basicServicesSummary: 'Grundlegend:',
    additionalServicesSummary: 'Zusätzlich:',
    propertyAge: 'Alter:',
    propertyLocation: 'Lage:',
    propertyCondition: 'Zustand:',
    propertyTopography: 'Topographie:',
    propertyValuationType: 'Bewertungstyp:',
    notSpecified: 'Nicht angegeben',
    noSpecified: 'Nicht angegeben',
    
    // Letterhead and demo
    letterheadType: 'Briefkopf-Typ für Berichte',
    selectLetterhead: 'Briefkopf-Typ auswählen',
    viewDemo: 'Nutzungsdemonstration anzeigen',
    
    // Error messages
    errorTitle: 'Fehler',
    errorUpdatingData: 'Fehler beim Aktualisieren der Immobiliendaten',
    errorMinimumArea: 'Mindestens eine Baufläche größer als 0 eingeben',
    
    // Características
    propertyCharacteristics: 'Immobilieneigenschaften',
    age: 'Alter (Jahre)',
    ageDescription: 'Jahre seit Bau',
    locationQuality: 'Lagequalität',
    locationDescription: 'Gebiet und Zugang bewerten',
    environmentalFactors: 'Umweltfaktoren und Risiken',
    environmentalDescription: 'Natürliche Risiken und Umweltbedingungen bewerten',
    environmentalExcellent: 'Ausgezeichnet - Keine Naturrisiken, günstige Topografie, stabiles Klima',
    environmentalGood: 'Gut - Minimale Risiken, akzeptable Umweltbedingungen',
    environmentalRegular: 'Regulär - Einige beherrschbare Risiken',
    environmentalPoor: 'Mangelhaft - Hohe Überschwemmungs-, Erdrutsch- oder andere Gefahren',
    generalCondition: 'Allgemeinzustand',
    conditionDescription: 'Physischer Zustand der Immobilie',
    
    // Condiciones
    new: 'Neu',
    good: 'Gut',
    medium: 'Mittel',
    regular: 'Regulär',
    simpleRepairs: 'Einfache Reparaturen',
    mediumRepairs: 'Mittlere Reparaturen',
    importantRepairs: 'Wichtige Reparaturen',
    seriousDamage: 'Schwere Schäden',
    waste: 'Abbruchreif',
    useless: 'Unbrauchbar',
    
    // Ubicaciones
    excellent: 'Ausgezeichnet',
    goodLocation: 'Gut',
    regularLocation: 'Regulär',
    badLocation: 'Schlecht',
    
    

    
    // Ubicación
    locationSketch: 'Standortskizze',
    mapInstructions: 'Standortskizze: Markieren Sie den genauen Standort der Immobilie auf der Karte. Dies hilft bei einer genaueren Bewertung.',
    clickOnMap: 'Klicken Sie auf die Karte, um den genauen Standort der Immobilie auszuwählen',
    currentAddress: 'Aktuelle Adresse',
    viewMap: 'Karte Anzeigen',
    editData: 'Daten Bearbeiten',
    registeredAddress: 'Registrierte Adresse:',
    coordinates: 'Koordinaten:',
    editLocationInstructions: 'Bearbeiten Sie manuell die Standortdaten der Immobilie.',
    fullAddress: 'Vollständige Adresse',
    fullAddressPlaceholder: 'Z.B.: Straße 123, Stadtteil, Stadt, Land, PLZ',
    coordinatesNote: 'Kartenkoordinaten bleiben unverändert',
    latitude: 'Breitengrad',
    longitude: 'Längengrad',
    latitudePlaceholder: 'Z.B.: 19.4326',
    longitudePlaceholder: 'Z.B.: -99.1332',
    
    // Fotografías
    photosDescription: 'Innen- und Außenbilder der Immobilie hochladen',
    removePhoto: 'Foto entfernen',
    
    // Botones de acción
    calculate: 'Bewertung Berechnen',
    regenerate: 'Vergleiche Regenerieren',
    downloadPDF: 'PDF Herunterladen',
    downloadWord: 'Word Herunterladen',
    
    // Resultado de valuación
    propertyValuationTitle: 'Immobilienbewertung',
    estimatedValue: 'Geschätzter Wert',
    priceAdjustment: 'Preisanpassung',
    adjustmentDescription: 'Endpreis basierend auf zusätzlichen Faktoren anpassen',
    marketAnalysisTitle: 'Marktanalyse',
    comparativeProperties: 'Vergleichsimmobilien',
    selectComparatives: 'Vergleichsimmobilien Auswählen (3 von 10)',
    allComparatives: 'Alle Vergleichsimmobilien',
    selectedForValuation: 'Für Bewertung Ausgewählt',
    averagePrice: 'Durchschnittspreis',
    minPrice: 'Mindestpreis',
    maxPrice: 'Höchstpreis',
    
    // Tabla de comparativas
    property: 'Immobilie',
    builtArea: 'Wohnfläche',
    price: 'Preis',
    priceM2: 'Preis/m²',
    distance: 'Entfernung',
    
    // PDF Content
    residentialValuation: 'WOHNIMMOBILIENBEWERTUNG',
    apartmentValuation: 'WOHNUNGSBEWERTUNG',
    landValuation: 'GRUNDSTÜCKSBEWERTUNG',
    commercialValuation: 'GEWERBEBEWERTUNG',
    residentialSubtitle: 'Professionelle Wohnhausbewertung',
    apartmentSubtitle: 'Professionelle Wohneinheitsbewertung',
    landSubtitle: 'Professionelle Grundstücksbewertung - IVS/RICS Standards',
    commercialSubtitle: 'Professionelle Gewerbeimmobilienbewertung',
    marketAnalysis: 'Professionelle Marktwertanalyse',
    propertyLocationPDF: 'IMMOBILIENLAGE',
    generalInfo: 'ALLGEMEINE INFORMATIONEN',
    type: 'Typ',
    totalBuiltArea: 'Gesamte Wohnfläche',
    propertyAreas: 'IMMOBILIENFLÄCHEN',
    propertySpaces: 'IMMOBILIENRÄUME',
    estimatedValuePDF: 'GESCHÄTZTER WERT',
    pricePerSqm: 'Preis pro m²',
    basedOnComparables: 'Basierend auf 3 Vergleichsobjekten',
    mapLocation: 'KARTENSTANDORT',
    address: 'Adresse',
    viewInGoogleMaps: 'Standort in Google Maps anzeigen',
    photograph: 'Fotografie',
    totalPhotos: 'Gesamtanzahl Fotos in der Akte',
    captureDate: 'Aufnahmedatum',
    
    // Units
    sqm: 'm²',
    meters: 'm',
    years: 'Jahre',
    
    // Messages
    calculatingValuation: 'Bewertung Berechnen',
    generatingReport: 'Gutachten mit 3 Vergleichsobjekten erstellen...',
    valuationCompleted: 'Bewertung Abgeschlossen',
    estimatedValueTitle: 'Geschätzter Wert',
    comparables: 'Vergleichsobjekte',
    comparativesUpdated: 'Vergleiche Aktualisiert',
    newComparativesGenerated: 'Neue naheliegende Immobilien wurden generiert',
    currencyChanged: 'Währung Geändert',
    valuationNowIn: 'Bewertung wird jetzt angezeigt in',
     priceAdjusted: 'Preis Angepasst',
     adjustment: 'Anpassung',
     newValue: 'Neuer Wert',
     
     // PDF Additional labels
     professionalAppraisalSystem: 'Professionelles Bewertungssystem, Immobilienbewertung',
     coordinatesLabel: 'Koordinaten:',
     marketSummary: 'Marktzusammenfassung:',
     propertyPhotographs: 'IMMOBILIENFOTOS',
     comparablesAnnex: 'ANHANG: DETAILLIERTE VERGLEICHSBLÄTTER',
     realProperty: '(Echte Immobilie)',
     referenceProperty: '(Referenzimmobilie)',
     locationCharacteristics: 'LAGE UND EIGENSCHAFTEN:',
     viewOnGoogleMaps: 'Standort auf Google Maps anzeigen',
     physicalCharacteristics: 'PHYSISCHE EIGENSCHAFTEN:',
     priceInformation: 'PREISINFORMATIONEN:',
     
     // Share section
     shareAppraisal: 'TEILEN SIE DIESE BEWERTUNG',
     shareAppraisalText: 'Teilen Sie diese professionelle Bewertung in sozialen Medien:',
     clickSelectedLink: 'Klicken Sie auf den ausgewählten Link',
     whatsapp: 'WhatsApp',
     facebook: 'Facebook',
     twitter: 'Twitter',
     instagram: 'Instagram',
     tiktok: 'TikTok',
     linkedin: 'LinkedIn',
     visitWebsite: 'Besuchen Sie unsere Website:',
     getYourAppraisal: 'Holen Sie sich Ihre eigene professionelle Bewertung auf unserem System!',
     
     // Error messages
     errorGeneric: 'Fehler',
     errorCalculatingValuation: 'Ein Fehler ist bei der Berechnung der Bewertung aufgetreten. Bitte versuchen Sie es erneut.',
     errorPDFGeneration: 'Sie müssen zuerst die Bewertung berechnen, um das PDF zu generieren',
     errorWordGeneration: 'Sie müssen zuerst die Bewertung berechnen, um das Word-Dokument zu generieren',
     errorGeneratingPDF: 'PDF konnte nicht generiert werden',
     errorGeneratingWord: 'Word-Dokument konnte nicht generiert werden',
     searchingComparables: 'Suche nach neuen vergleichbaren Immobilien in der Nähe...',
     pdfGenerated: 'PDF Generiert',
     pdfGeneratedDesc: 'Die vollständige Bewertung wurde erfolgreich heruntergeladen',
     wordGenerated: 'Word-Dokument Generiert',
     wordGeneratedDesc: 'Die vollständige Bewertung wurde erfolgreich heruntergeladen',
     
      // Disclaimer
      disclaimerText: 'Diese Bewertung ist eine Schätzung basierend auf den bereitgestellten Daten. Es wird empfohlen, einen zertifizierten Gutachter für offizielle Bewertungen zu konsultieren.',
      
      // Tooltips y explicaciones
      landAreaTooltip: 'Geben Sie die Grundstücksfläche nur in Quadratmetern (m²) an. Bei Wohnungen in Stockwerken über dem ersten sollte die Grundstücksfläche der gesamten Baufläche entsprechen.',
      observationsPlaceholder: 'Zusätzliche Informationen zur Immobilie (maximal 500 Zeichen)',
      selectServiceError: 'Sie müssen einen Service auswählen, um fortzufahren',
      maxCharactersNote: 'maximale Zeichen',
       additionalInfo: 'Zusätzliche Informationen',
       optional: 'Optional',
       propertyValuationResults: 'Bewertungsergebnisse',
       downloadDocuments: 'Dokumente Herunterladen',
       shareValuation: 'Bewertung Teilen',
       currencyValuation: 'Bewertungswährung',
       needHelpSystem: 'Benötigen Sie Hilfe bei der Nutzung des Systems?',
       multilingual: 'Mehrsprachig',
       interfaceReports: 'Die gesamte Benutzeroberfläche und Berichte werden automatisch übersetzt',
       // Currency selector
       exchangeRateUpdated: 'Wechselkurse Aktualisiert',
       exchangeRateError: 'Wechselkurse konnten nicht aktualisiert werden. Vorherige Kurse werden verwendet.',
       exchangeRateNote: 'Wechselkurse werden von ExchangeRate-API bezogen und in Echtzeit aktualisiert.',
       exchangeRateLabel: 'Wechselkurs',
       lastUpdateText: 'Letzte Aktualisierung',
       // Valuation results panel
       valuationResultsTitle: 'Bewertungsergebnisse',
       basedOnComparablesText: 'Basierend auf 3 Vergleichsobjekten',
       originalBaseValue: 'Ursprünglicher Grundwert',
       adjustmentLabel: 'Anpassung',
       totalBuiltAreaLabel: 'Gesamte Baufläche',
       landAreaLabel: 'Grundstücksfläche',
       locationLabel: 'Lage',
       pricePerBuiltM2: 'Preis pro gebautem m²',
       marketComparison: 'Marktvergleich',
       // Report sections
       annexDetailedComparables: 'ANHANG: DETAILLIERTE VERGLEICHSBLÄTTER',
       physicalCharacteristicsReport: 'PHYSISCHE EIGENSCHAFTEN:',
       comparativeAnalysisReport: 'VERGLEICHSANALYSE:',
       builtAreaReport: 'Baufläche',
       priceDifferencePerM2: 'Preisunterschied pro m²',
       completeDataMessage: 'Vervollständigen Sie die Immobiliendaten und drücken Sie "Bewertung Berechnen", um das Ergebnis zu sehen.'
  },
  it: {
    // UI Labels principales
    propertyValuator: 'Valutatore di Proprietà',
    professionalSystem: 'Sistema professionale di valutazione immobiliare',
    languageSelector: 'Lingua / Language',
    propertyData: 'Dati della Proprietà',
    
    // Pestañas principales
    areas: 'Aree',
    propertyType: 'Tipo',
    spaces: 'Spazi',
    characteristics: 'Caratteristiche',
    location: 'Posizione',
    photos: 'Foto',
    valuation: 'Valutazione',
    
    // Sección de áreas
    constructionAreas: 'Aree di Costruzione (m²)',
    apartmentArea: 'Area dell\'Appartamento (m²)',
    apartmentAreaTab: 'AREA',
    basement: 'Seminterrato',
    firstFloor: 'Piano Terra',
    secondFloor: 'Primo Piano',
    thirdFloor: 'Secondo Piano',
    fourthFloor: 'Terzo Piano',
    landArea: 'Area del Terreno',
    
    // Servicios disponibles
    services: 'Servizi',
    availableServices: 'Servizi Disponibili',
    basicServices: 'Servizi di Base',
    additionalServices: 'Servizi Aggiuntivi',
    water: 'Acqua Potabile',
    electricity: 'Elettricità',
    gas: 'Gas Naturale/GPL',
    drainage: 'Fognature',
    internet: 'Internet',
    cable: 'TV via Cavo',
    phone: 'Telefono',
    security: 'Sicurezza Privata',
    swimmingPool: 'Piscina',
    garden: 'Giardino',
    elevator: 'Ascensore',
    airConditioning: 'Aria Condizionata',
    heating: 'Riscaldamento',
    solarPanels: 'Pannelli Solari',
    waterTank: 'Serbatoio Acqua/Cisterna',
    
    // Tipos de propiedad
    propertyTypeTitle: 'Tipo di Proprietà',
    selectPropertyType: 'Seleziona il tipo di proprietà',
    house: 'Casa',
    apartment: 'Appartamento',
    land: 'Terreno',
    commercial: 'Commerciale',
    warehouse: 'Magazzino',
    
    // Espacios y características
    spacesDistribution: 'Distribuzione degli Spazi e Caratteristiche',
    livingSpaces: 'Spazi Abitativi',
    bedrooms: 'Camere da Letto',
    bedroomsDescription: 'Numero di camere da letto',
    livingRooms: 'Soggiorni',
    livingRoomsDescription: 'Aree principali di soggiorno',
    diningRoom: 'Sala da Pranzo',
    diningRoomDescription: 'Spazi per mangiare',
    bathrooms: 'Bagni Completi',
    bathroomsDescription: 'Bagni con doccia/vasca',
    
    serviceSpaces: 'Spazi di Servizio',
    kitchen: 'Cucina',
    kitchenDescription: 'Numero di cucine',
    storage: 'Ripostiglio/Magazzino',
    storageDescription: 'Spazi di stoccaggio',
    serviceArea: 'Area di Servizio',
    serviceAreaDescription: 'Lavanderia/locale di servizio',
    garage: 'Garage',
    garageDescription: 'Posti auto',
    others: 'Altri Spazi',
    othersDescription: 'Studi, uffici, ecc.',
    additionalSpaces: 'Spazi Aggiuntivi',
    
    // Características
    temporalInfo: 'Informazioni Temporali',
    qualityAndCondition: 'Qualità e Condizioni della Proprietà',
    constructionAge: 'Età della Costruzione',
    yearsSinceConstruction: 'Anni dalla costruzione originale',
    
    // Location Quality options
    excellentZone: 'Eccellente - Zona esclusiva/premium',
    goodZone: 'Buona - Zona residenziale consolidata',
    regularZone: 'Regolare - Zona in sviluppo',
    badZone: 'Cattiva - Zona con problemi urbani',
    locationQualityPlaceholder: 'Seleziona qualità della posizione',
    evaluateServices: 'Valuta servizi, sicurezza, accessibilità',
    
    // General Condition options
    generalConditionLabel: 'Stato Generale di Conservazione',
    conditionPlaceholder: 'Seleziona stato di conservazione',
    newCondition: 'NUOVO - Inutilizzato, come appena costruito',
    goodCondition: 'BUONO - Molto ben conservato, usura minima',
    mediumCondition: 'MEDIO - Conservazione media, uso normale',
    regularCondition: 'REGOLARE - Usura visibile, necessita manutenzione',
    simpleRepairsCondition: 'RIPARAZIONI SEMPLICI - Pittura, dettagli minori',
    mediumRepairsCondition: 'RIPARAZIONI MEDIE - Cambio pavimenti, idraulica',
    importantRepairsCondition: 'RIPARAZIONI IMPORTANTI - Struttura, impianti',
    seriousDamageCondition: 'DANNI GRAVI - Problemi strutturali seri',
    wasteCondition: 'SCARTO - Demolizione parziale necessaria',
    affectsPropertyValue: 'Influisce direttamente sul valore della proprietà',
    
    // Access Type options
    accessType: 'Tipo di accesso',
    accessTypePlaceholder: 'Seleziona il tipo di accesso',
    mainStreet: 'Strada principale',
    vehicularPassage: 'Passaggio veicolare',
    pedestrianPassage: 'Passaggio pedonale',
    rightOfWay: 'Servitù di passaggio',
    affectsAccessibility: 'Influisce sull\'accessibilità della proprietà',
    
    // Caratteristiche specifiche del terreno
    landCharacteristics: 'Caratteristiche del Terreno',
    topography: 'Topografia',
    selectTopography: 'Seleziona tipo di topografia',
    flat: 'Pianeggiante',
    gentleSlope: 'Pendenza Dolce',
    moderateSlope: 'Pendenza Moderata',
    steepSlope: 'Pendenza Ripida',
    irregular: 'Irregolare',
    valuationType: 'Tipo di Valutazione',
    selectValuationType: 'Seleziona tipo di valutazione',
    residentialUse: 'Residenziale',
    commercialUse: 'Commerciale',
    industrialUse: 'Industriale',
    agriculturalUse: 'Agricolo',
    recreationalUse: 'Ricreativo',
    
    // Explicaciones de estándares internacionales para terrenos - Italian
    internationalStandards: 'Standard Internazionali IVS/RICS',
    topographyFactors: 'Fattori di Topografia applicati:',
    landUseFactors: 'Fattori per Tipo di Uso applicati:',
    flatLandExp: 'Terreno Pianeggiante (0-5% pendenza): +12% - Facilita costruzione',
    gentleSlopeExp: 'Pendenza Dolce (5-15%): +3% - Drenaggio naturale adeguato',
    moderateSlopeExp: 'Pendenza Moderata (15-25%): -7% - Costi aggiuntivi',
    steepSlopeExp: 'Pendenza Ripida (25-40%): -20% - Richiede ingegneria specializzata',
    irregularExp: 'Terreno Irregolare (>40%): -25% - Sviluppo molto costoso',
    commercialUseExp: 'Uso Commerciale: +28% - Maggiore potenziale di reddito',
    industrialUseExp: 'Uso Industriale: +12% - Infrastruttura specializzata',
    residentialUseExp: 'Uso Residenziale: 0% - Valore base standard',
    recreationalUseExp: 'Uso Ricreativo: -8% - Mercato specializzato',
    agriculturalUseExp: 'Uso Agricolo: -32% - Valore estensivo minore',
    
    // Summary sections
    spacesSummary: 'Riassunto Spazi:',
    characteristicsSummary: 'Riassunto Caratteristiche:',
    servicesSummary: 'Riassunto Servizi:',
    basicServicesSummary: 'Base:',
    additionalServicesSummary: 'Aggiuntivi:',
    propertyAge: 'Età:',
    propertyLocation: 'Posizione:',
    propertyCondition: 'Condizione:',
    propertyTopography: 'Topografia:',
    propertyValuationType: 'Tipo di Valutazione:',
    notSpecified: 'Non specificato',
    noSpecified: 'Non specificato',
    
    // Letterhead and demo
    letterheadType: 'Tipo di Intestazione per Rapporti',
    selectLetterhead: 'Seleziona tipo di intestazione',
    viewDemo: 'Visualizza Demo di Utilizzo',
    
    // Error messages
    errorTitle: 'Errore',
    errorUpdatingData: 'Errore nell\'aggiornamento dei dati della proprietà',
    errorMinimumArea: 'Deve inserire almeno un\'area di costruzione maggiore di 0',
    
     // Características
    age: 'Età (anni)',
    ageDescription: 'Anni dalla costruzione',
    locationQuality: 'Qualità della Posizione',
    locationDescription: 'Valuta zona e accessi',
    environmentalFactors: 'Fattori Ambientali e Rischi',
    environmentalDescription: 'Valuta rischi naturali e condizioni ambientali',
    environmentalExcellent: 'Eccellente - Nessun rischio naturale, topografia favorevole, clima stabile',
    environmentalGood: 'Buona - Rischi minimi, condizioni ambientali accettabili',
    environmentalRegular: 'Regolare - Alcuni rischi gestibili',
    environmentalPoor: 'Carente - Alto rischio di inondazioni, frane o altri pericoli',
    generalCondition: 'Condizione Generale',
    conditionDescription: 'Condizione fisica della proprietà',
    
    // Condiciones
    new: 'Nuovo',
    good: 'Buono',
    medium: 'Medio',
    regular: 'Regolare',
    simpleRepairs: 'Riparazioni Semplici',
    mediumRepairs: 'Riparazioni Medie',
    importantRepairs: 'Riparazioni Importanti',
    seriousDamage: 'Danni Gravi',
    waste: 'Da Demolire',
    useless: 'Inutilizzabile',
    
    // Ubicaciones
    excellent: 'Eccellente',
    goodLocation: 'Buona',
    regularLocation: 'Regolare',
    badLocation: 'Cattiva',
    
     // Ubicación
    locationSketch: 'Schizzo della Posizione',
    mapInstructions: 'Schizzo della Posizione: Contrassegna la posizione esatta della proprietà sulla mappa. Questo aiuterà a fornire una valutazione più accurata.',
    clickOnMap: 'Clicca sulla mappa per selezionare la posizione esatta della proprietà',
    currentAddress: 'Indirizzo attuale',
    viewMap: 'Visualizza Mappa',
    editData: 'Modifica Dati',
    registeredAddress: 'Indirizzo Registrato:',
    coordinates: 'Coordinate:',
    editLocationInstructions: 'Modifica manualmente i dati di posizione della proprietà.',
    fullAddress: 'Indirizzo Completo',
    fullAddressPlaceholder: 'Es: Via 123, Quartiere, Città, Provincia, CAP',
    coordinatesNote: 'Le coordinate della mappa rimangono invariate',
    latitude: 'Latitudine',
    longitude: 'Longitudine',
    latitudePlaceholder: 'Es: 19.4326',
    longitudePlaceholder: 'Es: -99.1332',

    // Fotografías
    photosDescription: 'Carica immagini interne ed esterne della proprietà',
    removePhoto: 'Rimuovi foto',
    
    // Botones de acción
    calculate: 'Calcola Valutazione',
    regenerate: 'Rigenera Comparazioni',
    downloadPDF: 'Scarica PDF',
    downloadWord: 'Scarica Word',
    
    // Resultado de valuación
    propertyValuationTitle: 'Valutazione della Proprietà',
    estimatedValue: 'Valore Stimato',
    priceAdjustment: 'Aggiustamento del Prezzo',
    adjustmentDescription: 'Aggiusta il prezzo finale basato su fattori aggiuntivi',
    marketAnalysisTitle: 'Analisi di Mercato',
    comparativeProperties: 'Proprietà Comparative',
    selectComparatives: 'Seleziona Comparabili (3 di 10)',
    allComparatives: 'Tutte le Proprietà Comparative',
    selectedForValuation: 'Selezionate per Valutazione',
    averagePrice: 'Prezzo Medio',
    minPrice: 'Prezzo Minimo',
    maxPrice: 'Prezzo Massimo',
    
    // Tabla de comparativas
    property: 'Proprietà',
    builtArea: 'Area Costr.',
    price: 'Prezzo',
    priceM2: 'Prezzo/m²',
    distance: 'Distanza',
    
    // PDF Content
    residentialValuation: 'VALUTAZIONE RESIDENZIALE',
    apartmentValuation: 'VALUTAZIONE DI APPARTAMENTO',
    landValuation: 'VALUTAZIONE DI TERRENO',
    commercialValuation: 'VALUTAZIONE COMMERCIALE',
    residentialSubtitle: 'Perizia Professionale di Casa di Abitazione',
    apartmentSubtitle: 'Perizia Professionale di Unità Abitativa',
    landSubtitle: 'Perizia Professionale di Terreno - Standard IVS/RICS',
    commercialSubtitle: 'Perizia Professionale di Bene Commerciale',
    marketAnalysis: 'Analisi Professionale del Valore di Mercato',
    propertyLocationPDF: 'POSIZIONE DELLA PROPRIETÀ',
    generalInfo: 'INFORMAZIONI GENERALI',
    type: 'Tipo',
    totalBuiltArea: 'Area Totale Costruita',
    propertyAreas: 'AREE DELLA PROPRIETÀ',
    propertySpaces: 'SPAZI DELLA PROPRIETÀ',
    estimatedValuePDF: 'VALORE STIMATO',
    pricePerSqm: 'Prezzo per m²',
    basedOnComparables: 'Basato su 3 comparabili',
    mapLocation: 'POSIZIONE SULLA MAPPA',
    address: 'Indirizzo',
    viewInGoogleMaps: 'Visualizza posizione su Google Maps',
    photograph: 'Fotografia',
    totalPhotos: 'Totale fotografie nel fascicolo',
    captureDate: 'Data di acquisizione',
    
    // Units
    sqm: 'm²',
    meters: 'm',
    years: 'anni',
    
    // Messages
    calculatingValuation: 'Calcolo Valutazione',
    generatingReport: 'Generazione perizia con 3 comparabili...',
    valuationCompleted: 'Valutazione Completata',
    estimatedValueTitle: 'Valore stimato',
    comparables: 'comparabili',
    comparativesUpdated: 'Comparazioni Aggiornate',
    newComparativesGenerated: 'Sono state generate nuove proprietà vicine',
    currencyChanged: 'Valuta Cambiata',
    valuationNowIn: 'Valutazione ora mostrata in',
     priceAdjusted: 'Prezzo Aggiustato',
     adjustment: 'Aggiustamento',
     newValue: 'Nuovo valore',
     
     // PDF Additional labels
     professionalAppraisalSystem: 'Sistema professionale di valutazioni, Valutazione di proprietà',
     coordinatesLabel: 'Coordinate:',
     marketSummary: 'Riassunto del Mercato:',
     propertyPhotographs: 'FOTOGRAFIE DELLA PROPRIETÀ',
     comparablesAnnex: 'ALLEGATO: SCHEDE DETTAGLIATE DEI COMPARABILI',
     realProperty: '(Proprietà Reale)',
     referenceProperty: '(Proprietà di Riferimento)',
     locationCharacteristics: 'UBICAZIONE E CARATTERISTICHE:',
     viewOnGoogleMaps: 'Visualizza posizione su Google Maps',
     physicalCharacteristics: 'CARATTERISTICHE FISICHE:',
     priceInformation: 'INFORMAZIONI SUL PREZZO:',
     
     // Share section
     shareAppraisal: 'CONDIVIDI QUESTA VALUTAZIONE',
     shareAppraisalText: 'Condividi questa valutazione professionale sui social media:',
     clickSelectedLink: 'Clicca sul link selezionato',
     whatsapp: 'WhatsApp',
     facebook: 'Facebook',
     twitter: 'Twitter',
     instagram: 'Instagram',
     tiktok: 'TikTok',
     linkedin: 'LinkedIn',
     visitWebsite: 'Visita il nostro sito web:',
     getYourAppraisal: 'Ottieni la tua valutazione professionale sul nostro sistema!',
     
     // Error messages
     errorGeneric: 'Errore',
     errorCalculatingValuation: 'Si è verificato un errore durante il calcolo della valutazione. Riprova.',
     errorPDFGeneration: 'Devi prima calcolare la valutazione per generare il PDF',
     errorWordGeneration: 'Devi prima calcolare la valutazione per generare il documento Word',
     errorGeneratingPDF: 'Impossibile generare il PDF',
     errorGeneratingWord: 'Impossibile generare il documento Word',
     searchingComparables: 'Ricerca di nuove proprietà comparabili nelle vicinanze...',
     pdfGenerated: 'PDF Generato',
     pdfGeneratedDesc: 'La valutazione completa è stata scaricata con successo',
     wordGenerated: 'Documento Word Generato',
     wordGeneratedDesc: 'La valutazione completa è stata scaricata con successo',
     
      // Disclaimer
      disclaimerText: 'Questa valutazione è una stima basata sui dati forniti. Si raccomanda di consultare un perito certificato per valutazioni ufficiali.',
      
      // Tooltips y explicaciones
      landAreaTooltip: 'Indicare l\'area del terreno solo in metri quadrati (m²). Per appartamenti ai piani superiori al primo, l\'area del terreno deve essere uguale all\'area totale di costruzione.',
      observationsPlaceholder: 'Informazioni aggiuntive sulla proprietà (massimo 500 caratteri)',
      selectServiceError: 'Devi selezionare un servizio per continuare',
      maxCharactersNote: 'caratteri massimi',
       additionalInfo: 'Informazioni aggiuntive',
       optional: 'Opzionale',
       propertyValuationResults: 'Risultati di Valutazione',
       downloadDocuments: 'Scarica Documenti',
       shareValuation: 'Condividi Valutazione',
       currencyValuation: 'Valuta di Valutazione',
       needHelpSystem: 'Hai bisogno di aiuto per usare il sistema?',
       multilingual: 'Multilingue',
       interfaceReports: 'Tutta l\'interfaccia e i report vengono tradotti automaticamente',
       // Currency selector
       exchangeRateUpdated: 'Tassi di Cambio Aggiornati',
       exchangeRateError: 'Impossibile aggiornare i tassi di cambio. Verranno utilizzati i tassi precedenti.',
       exchangeRateNote: 'I tassi di cambio sono ottenuti da ExchangeRate-API e aggiornati in tempo reale.',
       exchangeRateLabel: 'Tasso di cambio',
       lastUpdateText: 'Ultimo aggiornamento',
       // Valuation results panel
       valuationResultsTitle: 'Risultati di Valutazione',
       basedOnComparablesText: 'Basato su 3 comparabili',
       originalBaseValue: 'Valore base originale',
       adjustmentLabel: 'Aggiustamento',
       totalBuiltAreaLabel: 'Area Totale Costruita',
       landAreaLabel: 'Area del Terreno',
       locationLabel: 'Posizione',
       pricePerBuiltM2: 'Prezzo per m² costruito',
       marketComparison: 'Confronto mercato',
       // Report sections
       annexDetailedComparables: 'ALLEGATO: SCHEDE DETTAGLIATE DEI COMPARABILI',
       physicalCharacteristicsReport: 'CARATTERISTICHE FISICHE:',
       comparativeAnalysisReport: 'ANALISI COMPARATIVA:',
       builtAreaReport: 'Area Costruita',
       priceDifferencePerM2: 'Differenza di prezzo per m²',
       completeDataMessage: 'Completa i dati della proprietà e premi "Calcola Valutazione" per vedere il risultato.'
  },
  pt: {
    // UI Labels principales
    propertyValuator: 'Avaliador de Propriedades',
    professionalSystem: 'Sistema profissional de avaliação imobiliária',
    languageSelector: 'Idioma / Language',
    propertyData: 'Dados da Propriedade',
    
    // Pestañas principales
    areas: 'Áreas',
    propertyType: 'Tipo',
    spaces: 'Espaços',
    characteristics: 'Características',
    location: 'Localização',
    photos: 'Fotos',
    valuation: 'Avaliação',
    
    // Sección de áreas
    constructionAreas: 'Áreas de Construção (m²)',
    apartmentArea: 'Área do Apartamento (m²)',
    apartmentAreaTab: 'ÁREA',
    basement: 'Subsolo',
    firstFloor: 'Térreo',
    secondFloor: 'Primeiro Andar',
    thirdFloor: 'Segundo Andar',
    fourthFloor: 'Terceiro Andar',
    landArea: 'Área do Terreno',
    
    // Servicios disponibles
    services: 'Serviços',
    availableServices: 'Serviços Disponíveis',
    basicServices: 'Serviços Básicos',
    additionalServices: 'Serviços Adicionais',
    water: 'Água Potável',
    electricity: 'Eletricidade',
    gas: 'Gás Natural/GLP',
    drainage: 'Esgoto',
    internet: 'Internet',
    cable: 'TV a Cabo',
    phone: 'Telefone',
    security: 'Segurança Privada',
    swimmingPool: 'Piscina',
    garden: 'Jardim',
    elevator: 'Elevador',
    airConditioning: 'Ar Condicionado',
    heating: 'Aquecimento',
    solarPanels: 'Painéis Solares',
    waterTank: 'Tanque de Água/Cisterna',
    
    // Tipos de propiedad
    propertyTypeTitle: 'Tipo de Propriedade',
    selectPropertyType: 'Selecione o tipo de propriedade',
    house: 'Casa',
    apartment: 'Apartamento',
    land: 'Terreno',
    commercial: 'Comercial',
    warehouse: 'Armazém',
    
    // Espacios y características
    spacesDistribution: 'Distribuição de Espaços e Características',
    livingSpaces: 'Espaços Habitacionais',
    bedrooms: 'Quartos',
    bedroomsDescription: 'Número de quartos',
    livingRooms: 'Salas de Estar',
    livingRoomsDescription: 'Áreas principais de estar',
    diningRoom: 'Sala de Jantar',
    diningRoomDescription: 'Espaços de refeição',
    bathrooms: 'Banheiros Completos',
    bathroomsDescription: 'Banheiros com chuveiro/banheira',
    
    serviceSpaces: 'Espaços de Serviço',
    kitchen: 'Cozinha',
    kitchenDescription: 'Número de cozinhas',
    storage: 'Depósito/Armazém',
    storageDescription: 'Espaços de armazenamento',
    serviceArea: 'Área de Serviço',
    serviceAreaDescription: 'Lavanderia/área de serviço',
    garage: 'Garagem',
    garageDescription: 'Vagas de estacionamento',
    others: 'Outros Espaços',
    othersDescription: 'Escritórios, estudos, etc.',
    additionalSpaces: 'Espaços Adicionais',
    
    // Características
    temporalInfo: 'Informações Temporais',
    qualityAndCondition: 'Qualidade e Estado da Propriedade',
    constructionAge: 'Idade da Construção',
    yearsSinceConstruction: 'Anos desde a construção original',
    
    // Location Quality options
    excellentZone: 'Excelente - Zona exclusiva/premium',
    goodZone: 'Boa - Zona residencial consolidada',
    regularZone: 'Regular - Zona em desenvolvimento',
    badZone: 'Ruim - Zona com problemas urbanos',
    locationQualityPlaceholder: 'Selecione qualidade da localização',
    evaluateServices: 'Avalie serviços, segurança, acessibilidade',
    
    // General Condition options
    generalConditionLabel: 'Estado Geral de Conservação',
    conditionPlaceholder: 'Selecione estado de conservação',
    newCondition: 'NOVO - Sem uso, como recém construído',
    goodCondition: 'BOM - Muito bem conservado, desgaste mínimo',
    mediumCondition: 'MÉDIO - Conservação média, uso normal',
    regularCondition: 'REGULAR - Desgaste visível, precisa manutenção',
    simpleRepairsCondition: 'REPAROS SIMPLES - Pintura, detalhes menores',
    mediumRepairsCondition: 'REPAROS MÉDIOS - Troca pisos, encanamento',
    importantRepairsCondition: 'REPAROS IMPORTANTES - Estrutura, instalações',
    seriousDamageCondition: 'DANOS GRAVES - Problemas estruturais sérios',
    wasteCondition: 'DESPERDÍCIO - Demolição parcial necessária',
    affectsPropertyValue: 'Afeta diretamente o valor da propriedade',
    
    // Access Type options
    accessType: 'Tipo de acesso',
    accessTypePlaceholder: 'Selecione o tipo de acesso',
    mainStreet: 'Rua principal',
    vehicularPassage: 'Passagem veicular',
    pedestrianPassage: 'Passagem pedestre',
    rightOfWay: 'Servidão de passagem',
    affectsAccessibility: 'Afeta a acessibilidade da propriedade',
    
    // Características específicas do terreno
    landCharacteristics: 'Características do Terreno',
    topography: 'Topografia',
    selectTopography: 'Selecione o tipo de topografia',
    flat: 'Plano',
    gentleSlope: 'Inclinação Suave',
    moderateSlope: 'Inclinação Moderada',
    steepSlope: 'Inclinação Acentuada',
    irregular: 'Irregular',
    valuationType: 'Tipo de Avaliação',
    selectValuationType: 'Selecione o tipo de avaliação',
    residentialUse: 'Residencial',
    commercialUse: 'Comercial',
    industrialUse: 'Industrial',
    agriculturalUse: 'Agrícola',
    recreationalUse: 'Recreativo',
    
    // Explicaciones de estándares internacionales para terrenos - Portuguese
    internationalStandards: 'Padrões Internacionais IVS/RICS',
    topographyFactors: 'Fatores de Topografia aplicados:',
    landUseFactors: 'Fatores por Tipo de Uso aplicados:',
    flatLandExp: 'Terreno Plano (0-5% inclinação): +12% - Facilita construção',
    gentleSlopeExp: 'Inclinação Suave (5-15%): +3% - Drenagem natural adequada',
    moderateSlopeExp: 'Inclinação Moderada (15-25%): -7% - Custos adicionais',
    steepSlopeExp: 'Inclinação Acentuada (25-40%): -20% - Requer engenharia especializada',
    irregularExp: 'Terreno Irregular (>40%): -25% - Desenvolvimento muito custoso',
    commercialUseExp: 'Uso Comercial: +28% - Maior potencial de renda',
    industrialUseExp: 'Uso Industrial: +12% - Infraestrutura especializada',
    residentialUseExp: 'Uso Residencial: 0% - Valor base padrão',
    recreationalUseExp: 'Uso Recreativo: -8% - Mercado especializado',
    agriculturalUseExp: 'Uso Agrícola: -32% - Valor extensivo menor',
    
    // Summary sections
    spacesSummary: 'Resumo de Espaços:',
    characteristicsSummary: 'Resumo de Características:',
    servicesSummary: 'Resumo de Serviços:',
    basicServicesSummary: 'Básicos:',
    additionalServicesSummary: 'Adicionais:',
    propertyAge: 'Idade:',
    propertyLocation: 'Localização:',
    propertyCondition: 'Condição:',
    propertyTopography: 'Topografia:',
    propertyValuationType: 'Tipo de Avaliação:',
    notSpecified: 'Não especificado',
    noSpecified: 'Não especificado',
    
    // Letterhead and demo
    letterheadType: 'Tipo de Cabeçalho para Relatórios',
    selectLetterhead: 'Selecionar tipo de cabeçalho',
    viewDemo: 'Ver Demo de Uso',
    
    // Error messages
    errorTitle: 'Erro',
    errorUpdatingData: 'Erro ao atualizar dados da propriedade',
    errorMinimumArea: 'Deve inserir pelo menos uma área de construção maior que 0',
    
     // Características
    age: 'Idade (anos)',
    ageDescription: 'Anos desde a construção',
    locationQuality: 'Qualidade da Localização',
    locationDescription: 'Avaliar área e acessos',
    environmentalFactors: 'Fatores Ambientais e Riscos',
    environmentalDescription: 'Avaliar riscos naturais e condições ambientais',
    environmentalExcellent: 'Excelente - Sem riscos naturais, topografia favorável, clima estável',
    environmentalGood: 'Boa - Riscos mínimos, condições ambientais aceitáveis',
    environmentalRegular: 'Regular - Alguns riscos gerenciáveis',
    environmentalPoor: 'Deficiente - Alto risco de inundação, deslizamento ou outros perigos',
    generalCondition: 'Estado Geral',
    conditionDescription: 'Condição física da propriedade',
    
    // Condiciones
    new: 'Novo',
    good: 'Bom',
    medium: 'Médio',
    regular: 'Regular',
    simpleRepairs: 'Reparos Simples',
    mediumRepairs: 'Reparos Médios',
    importantRepairs: 'Reparos Importantes',
    seriousDamage: 'Danos Graves',
    waste: 'Para Demolição',
    useless: 'Inutilizável',
    
    // Ubicaciones
    excellent: 'Excelente',
    goodLocation: 'Boa',
    regularLocation: 'Regular',
    badLocation: 'Ruim',
    
    // Ubicación
    locationSketch: 'Esboço de Localização',
    mapInstructions: 'Esboço de Localização: Marque a localização exata da propriedade no mapa. Isso ajudará a fornecer uma avaliação mais precisa.',
    clickOnMap: 'Clique no mapa para selecionar a localização exata da propriedade',
    currentAddress: 'Endereço atual',
    viewMap: 'Ver Mapa',
    editData: 'Editar Dados',
    registeredAddress: 'Endereço Registrado:',
    coordinates: 'Coordenadas:',
    editLocationInstructions: 'Edite manualmente os dados de localização da propriedade.',
    fullAddress: 'Endereço Completo',
    fullAddressPlaceholder: 'Ex: Rua 123, Bairro, Cidade, Estado, CEP',
    coordinatesNote: 'As coordenadas do mapa permanecem inalteradas',
    latitude: 'Latitude',
    longitude: 'Longitude',
    latitudePlaceholder: 'Ex: 19.4326',
    longitudePlaceholder: 'Ex: -99.1332',
    
    
    // Fotografías
    propertyPhotos: 'Fotos da Propriedade',
    uploadPhotos: 'Enviar Fotos',
    photosDescription: 'Envie imagens internas e externas da propriedade',
    removePhoto: 'Remover foto',
    
    // Botones de acción
    calculate: 'Calcular Avaliação',
    regenerate: 'Regenerar Comparações',
    downloadPDF: 'Baixar PDF',
    downloadWord: 'Baixar Word',
    
    // Resultado de valuación
    propertyValuationTitle: 'Avaliação da Propriedade',
    estimatedValue: 'Valor Estimado',
    priceAdjustment: 'Ajuste de Preço',
    adjustmentDescription: 'Ajustar preço final baseado em fatores adicionais',
    marketAnalysisTitle: 'Análise de Mercado',
    comparativeProperties: 'Propriedades Comparativas',
    selectComparatives: 'Selecionar Comparáveis (3 de 10)',
    allComparatives: 'Todas as Propriedades Comparativas',
    selectedForValuation: 'Selecionadas para Avaliação',
    averagePrice: 'Preço Médio',
    minPrice: 'Preço Mínimo',
    maxPrice: 'Preço Máximo',
    
    // Tabla de comparativas
    property: 'Propriedade',
    builtArea: 'Área Const.',
    price: 'Preço',
    priceM2: 'Preço/m²',
    distance: 'Distância',
    
    // PDF Content
    residentialValuation: 'AVALIAÇÃO RESIDENCIAL',
    apartmentValuation: 'AVALIAÇÃO DE APARTAMENTO',
    landValuation: 'AVALIAÇÃO DE TERRENO',
    commercialValuation: 'AVALIAÇÃO COMERCIAL',
    residentialSubtitle: 'Laudo Profissional de Casa de Habitação',
    apartmentSubtitle: 'Laudo Profissional de Unidade Habitacional',
    landSubtitle: 'Laudo Profissional de Terreno - Padrões IVS/RICS',
    commercialSubtitle: 'Laudo Profissional de Bem Comercial',
    marketAnalysis: 'Análise Profissional de Valor de Mercado',
    propertyLocationPDF: 'LOCALIZAÇÃO DA PROPRIEDADE',
    generalInfo: 'INFORMAÇÕES GERAIS',
    type: 'Tipo',
    totalBuiltArea: 'Área Total Construída',
    propertyAreas: 'ÁREAS DA PROPRIEDADE',
    propertySpaces: 'ESPAÇOS DA PROPRIEDADE',
    estimatedValuePDF: 'VALOR ESTIMADO',
    pricePerSqm: 'Preço por m²',
    basedOnComparables: 'Baseado em 3 comparáveis',
    mapLocation: 'LOCALIZAÇÃO NO MAPA',
    address: 'Endereço',
    viewInGoogleMaps: 'Ver localização no Google Maps',
    photograph: 'Fotografia',
    totalPhotos: 'Total de fotografias no arquivo',
    captureDate: 'Data de captura',
    
    // Units
    sqm: 'm²',
    meters: 'm',
    years: 'anos',
    
    // Messages
    calculatingValuation: 'Calculando Avaliação',
    generatingReport: 'Gerando laudo com 3 comparáveis...',
    valuationCompleted: 'Avaliação Concluída',
    estimatedValueTitle: 'Valor estimado',
    comparables: 'comparáveis',
    comparativesUpdated: 'Comparações Atualizadas',
    newComparativesGenerated: 'Novas propriedades próximas foram geradas',
    currencyChanged: 'Moeda Alterada',
    valuationNowIn: 'Avaliação agora mostrada em',
     priceAdjusted: 'Preço Ajustado',
     adjustment: 'Ajuste',
     newValue: 'Novo valor',
     
     // PDF Additional labels
     professionalAppraisalSystem: 'Sistema profissional de avaliações, Avaliação de propriedades',
     coordinatesLabel: 'Coordenadas:',
     marketSummary: 'Resumo do Mercado:',
     propertyPhotographs: 'FOTOGRAFIAS DA PROPRIEDADE',
     comparablesAnnex: 'ANEXO: FICHAS DETALHADAS DOS COMPARÁVEIS',
     realProperty: '(Propriedade Real)',
     referenceProperty: '(Propriedade de Referência)',
     locationCharacteristics: 'LOCALIZAÇÃO E CARACTERÍSTICAS:',
     viewOnGoogleMaps: 'Ver localização no Google Maps',
     physicalCharacteristics: 'CARACTERÍSTICAS FÍSICAS:',
     priceInformation: 'INFORMAÇÕES DE PREÇO:',
     
     // Share section
     shareAppraisal: 'COMPARTILHE ESTA AVALIAÇÃO',
     shareAppraisalText: 'Compartilhe esta avaliação profissional nas redes sociais:',
     clickSelectedLink: 'Clique no link selecionado',
     whatsapp: 'WhatsApp',
     facebook: 'Facebook',
     twitter: 'Twitter',
     instagram: 'Instagram',
     tiktok: 'TikTok',
     linkedin: 'LinkedIn',
     visitWebsite: 'Visite nosso site:',
     getYourAppraisal: 'Obtenha sua própria avaliação profissional em nosso sistema!',
     
     // Error messages
     errorGeneric: 'Erro',
     errorCalculatingValuation: 'Ocorreu um erro ao calcular a avaliação. Tente novamente.',
     errorPDFGeneration: 'Você deve primeiro calcular a avaliação para gerar o PDF',
     errorWordGeneration: 'Você deve primeiro calcular a avaliação para gerar o documento Word',
     errorGeneratingPDF: 'Não foi possível gerar o PDF',
     errorGeneratingWord: 'Não foi possível gerar o documento Word',
     searchingComparables: 'Procurando novas propriedades comparáveis próximas...',
     pdfGenerated: 'PDF Gerado',
     pdfGeneratedDesc: 'A avaliação completa foi baixada com sucesso',
     wordGenerated: 'Documento Word Gerado',
     wordGeneratedDesc: 'A avaliação completa foi baixada com sucesso',
     
      // Disclaimer
      disclaimerText: 'Esta avaliação é uma estimativa baseada nos dados fornecidos. Recomenda-se consultar um avaliador certificado para avaliações oficiais.',
      
      // Tooltips y explicaciones
      landAreaTooltip: 'Indique a área do terreno apenas em metros quadrados (m²). Para apartamentos em andares acima do primeiro, a área do terreno deve ser igual à área total de construção.',
      observationsPlaceholder: 'Informações adicionais sobre a propriedade (máximo 500 caracteres)',
      selectServiceError: 'Você deve selecionar um serviço para continuar',
      maxCharactersNote: 'caracteres máximo',
       additionalInfo: 'Informações adicionais',
       optional: 'Opcional',
       propertyValuationResults: 'Resultados de Avaliação',
       downloadDocuments: 'Baixar Documentos',
       shareValuation: 'Compartilhar Avaliação',
       currencyValuation: 'Moeda de Avaliação',
       needHelpSystem: 'Precisa de ajuda para usar o sistema?',
       multilingual: 'Multilíngue',
       interfaceReports: 'Toda a interface e relatórios são traduzidos automaticamente',
       // Currency selector
       exchangeRateUpdated: 'Taxas de Câmbio Atualizadas',
       exchangeRateError: 'Não foi possível atualizar as taxas de câmbio. Taxas anteriores serão usadas.',
       exchangeRateNote: 'As taxas de câmbio são obtidas do ExchangeRate-API e atualizadas em tempo real.',
       exchangeRateLabel: 'Taxa de câmbio',
       lastUpdateText: 'Última atualização',
       // Valuation results panel
       valuationResultsTitle: 'Resultados de Avaliação',
       basedOnComparablesText: 'Baseado em 3 comparáveis',
       originalBaseValue: 'Valor base original',
       adjustmentLabel: 'Ajuste',
       totalBuiltAreaLabel: 'Área Total Construída',
       landAreaLabel: 'Área do Terreno',
       locationLabel: 'Localização',
       pricePerBuiltM2: 'Preço por m² construído',
       marketComparison: 'Comparação mercado',
       // Report sections
       annexDetailedComparables: 'ANEXO: FICHAS DETALHADAS DOS COMPARÁVEIS',
       physicalCharacteristicsReport: 'CARACTERÍSTICAS FÍSICAS:',
       comparativeAnalysisReport: 'ANÁLISE COMPARATIVA:',
       builtAreaReport: 'Área Construída',
       priceDifferencePerM2: 'Diferença de preço por m²',
       completeDataMessage: 'Complete os dados da propriedade e pressione "Calcular Avaliação" para ver o resultado.'
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
  areaApartamento: number;
  
  // Tipo de propiedad
  tipoPropiedad: string;
  
  // Espacios
  recamaras: number;
  salas: number;
  comedor: number;
  cocina: number;
  bodega: number;
  areaServicio: number;
  cochera: number;
  banos: number;
  otros: number;
  
  // Características
  antiguedad: number;
  ubicacion: string;
  estadoGeneral: string;
  tipoAcceso?: string;
  
  // Características específicas de terreno
  topografia?: string;
  tipoValoracion?: string;
  
  // Ubicación geográfica
  latitud?: number;
  longitud?: number;
  direccionCompleta?: string;
  
  // Servicios disponibles
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
}

interface ComparativeProperty {
  id: string;
  address: string;
  areaConstruida: number;
  areaTerreno: number;
  tipoPropiedad: string;
  recamaras: number;
  banos: number;
  antiguedad: number;
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
  const { toast } = useToast();
  
  // Cargar datos del último avalúo desde localStorage
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('lastPropertyValuation');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          propertyData: parsed.propertyData || null,
          priceAdjustment: parsed.priceAdjustment || 0,
          selectedCurrency: parsed.selectedCurrency || null,
          valuation: parsed.valuation || null,
          baseValuation: parsed.baseValuation || null,
          comparativeProperties: parsed.comparativeProperties || []
        };
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return {
      propertyData: null,
      priceAdjustment: 0,
      selectedCurrency: null,
      valuation: null,
      baseValuation: null,
      comparativeProperties: []
    };
  };

  const savedData = loadSavedData();
  
  const [propertyData, setPropertyData] = useState<PropertyData>(savedData.propertyData || {
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
  
  const [valuation, setValuation] = useState<number | null>(null);
  const [baseValuation, setBaseValuation] = useState<number | null>(null);
  const [priceAdjustment, setPriceAdjustment] = useState<number>(savedData.priceAdjustment);
  const [multipleValuations, setMultipleValuations] = useState<Array<{
    id: number;
    valor: number;
    comparatives: ComparativeProperty[];
  }>>([]);
  const [comparativeProperties, setComparativeProperties] = useState<ComparativeProperty[]>(savedData.comparativeProperties);
  
  // Estados para manejo de comparables
  const [allComparativeProperties, setAllComparativeProperties] = useState<ComparativeProperty[]>([]);
  const [selectedComparatives, setSelectedComparatives] = useState<number[]>([0, 1, 2, 3, 4]); // Por defecto los primeros 5
  
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(savedData.selectedCurrency || {
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    rate: 1
  });
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('tipo');
  const [propertyImages, setPropertyImages] = useState<Array<{ file: File; preview: string }>>([]);
  const [selectedLetterhead, setSelectedLetterhead] = useState('casa'); // Nuevo estado para el membrete
  const [isCalculating, setIsCalculating] = useState(false); // Estado para loading del cálculo
  const [showDemo, setShowDemo] = useState(false); // Estado para mostrar demo

  // Guardar datos del último avalúo completado
  useEffect(() => {
    if (valuation && valuation > 0) {
      const dataToSave = {
        propertyData,
        valuation,
        baseValuation,
        priceAdjustment,
        comparativeProperties: comparativeProperties.slice(0, 3), // Solo las primeras 3 que se usan para el avalúo
        selectedCurrency,
        timestamp: new Date().toISOString()
      };
      
      try {
        localStorage.setItem('lastPropertyValuation', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving valuation data:', error);
      }
    }
  }, [valuation, propertyData, baseValuation, priceAdjustment, comparativeProperties, selectedCurrency]);

  // Configuraciones de membrete por tipo de propiedad
  const letterheadConfigs = {
    casa: {
      name: translations[selectedLanguage].house,
      primaryColor: [34, 139, 34], // Verde
      secondaryColor: [144, 238, 144], // Verde claro
      title: translations[selectedLanguage].residentialValuation,
      subtitle: translations[selectedLanguage].residentialSubtitle,
      icon: '🏠'
    },
    departamento: {
      name: translations[selectedLanguage].apartment,
      primaryColor: [70, 130, 180], // Azul acero
      secondaryColor: [176, 196, 222], // Azul claro
      title: translations[selectedLanguage].apartmentValuation,
      subtitle: translations[selectedLanguage].apartmentSubtitle,
      icon: '🏢'
    },
    terreno: {
      name: translations[selectedLanguage].land,
      primaryColor: [139, 69, 19], // Marrón
      secondaryColor: [222, 184, 135], // Marrón claro
      title: translations[selectedLanguage].landValuation,
      subtitle: translations[selectedLanguage].landSubtitle,
      icon: '🏞️'
    },
    comercial: {
      name: translations[selectedLanguage].commercial,
      primaryColor: [128, 0, 128], // Púrpura
      secondaryColor: [221, 160, 221], // Púrpura claro
      title: translations[selectedLanguage].commercialValuation,
      subtitle: translations[selectedLanguage].commercialSubtitle,
      icon: '🏪'
    }
  };

  const handleInputChange = (field: keyof PropertyData, value: string | number) => {
    // Función muy simple sin lógica compleja
    const isStringField = ['ubicacion', 'estadoGeneral', 'tipoPropiedad', 'direccion', 'tipoAcceso', 'topografia', 'tipoValoracion'].includes(field);
    
    let finalValue = value;
    if (!isStringField && typeof value === 'string') {
      const numValue = parseFloat(value);
      finalValue = isNaN(numValue) ? 0 : Math.max(0, numValue);
    }
    
    // Actualización directa del estado
    setPropertyData(current => {
      const newData = {
        ...current,
        [field]: finalValue
      };
      
      // Cuando se modifica el área de apartamento, poner a cero las áreas de construcción y terreno
      if (field === 'areaApartamento') {
        newData.areaSotano = 0;
        newData.areaPrimerNivel = 0;
        newData.areaSegundoNivel = 0;
        newData.areaTercerNivel = 0;
        newData.areaCuartoNivel = 0;
        newData.areaTerreno = 0;
      }
      
      return newData;
    });
  };

  const handleServiceChange = (serviceName: keyof PropertyData['servicios'], checked: boolean) => {
    setPropertyData(prev => ({
      ...prev,
      servicios: {
        ...prev.servicios,
        [serviceName]: checked
      }
    }));
  };

  const convertCurrency = (amountInUSD: number, targetCurrency: Currency): number => {
    if (targetCurrency.code === 'USD') {
      return amountInUSD;
    }
    return amountInUSD * (targetCurrency.rate || 1);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    
    // Si hay una valuación existente, recalcular las comparativas con la nueva moneda
    if (valuation && comparativeProperties.length > 0) {
      const newComparatives = comparativeProperties.map(prop => ({
        ...prop,
        precio: convertCurrency(prop.precio / (selectedCurrency.rate || 1), currency)
      }));
      setComparativeProperties(newComparatives);
    }
    
    toast({
      title: translations[selectedLanguage].currencyChanged,
      description: `${translations[selectedLanguage].valuationNowIn} ${currency.name} (${currency.code})`,
    });
  };

  // Efecto para actualizar comparables seleccionados y recalcular valor
  useEffect(() => {
    if (allComparativeProperties.length > 0) {
      const selectedProps = selectedComparatives.map(index => allComparativeProperties[index]).filter(Boolean);
      setComparativeProperties(selectedProps);
      
      // Recalcular valor si tenemos valuación base y comparables seleccionados
      if (baseValuation && selectedProps.length > 0) {
        const valorFinalAjustado = calcularValorConComparables(baseValuation, selectedProps);
        const valorAjustado = valorFinalAjustado * (1 + priceAdjustment / 100);
        setValuation(valorAjustado);
        
        
      }
    }
  }, [selectedComparatives, allComparativeProperties, baseValuation, priceAdjustment]);

  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setPropertyData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng,
      direccionCompleta: address
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') && propertyImages.length < 12) {
        const preview = URL.createObjectURL(file);
        setPropertyImages(prev => {
          if (prev.length >= 12) return prev;
          return [...prev, { file, preview }];
        });
      }
    });
  };

  const removeImage = (index: number) => {
    setPropertyImages(prev => {
      const newImages = prev.filter((_, i) => i !== index);
      // Liberar memoria del preview
      URL.revokeObjectURL(prev[index].preview);
      return newImages;
    });
  };

  const handleShowDemo = () => {
    setShowDemo(true);
  };

  const handleCloseDemo = () => {
    setShowDemo(false);
  };

  const generateComparativeProperties = async (baseValue: number, numComparables: number = 10): Promise<ComparativeProperty[]> => {
    const areaTotal = (propertyData.areaSotano || 0) + (propertyData.areaPrimerNivel || 0) + (propertyData.areaSegundoNivel || 0) + (propertyData.areaTercerNivel || 0) + (propertyData.areaCuartoNivel || 0);
    const desiredArea = propertyData.tipoPropiedad === 'terreno' ? (propertyData.areaTerreno || 0) : areaTotal;
    const lat = propertyData.latitud || 19.4326;
    const lng = propertyData.longitud || -99.1332;

    // Primero intentar buscar propiedades reales con radios progresivos (1km, 2km, 3km, 5km)
    const radii = [1000, 2000, 3000, 5000];
    let nearbyAddresses: any[] = [];
    const seen = new Set<string>();
    for (const r of radii) {
      const batch = await searchNearbyProperties(lat, lng, propertyData.tipoPropiedad, numComparables * 2, r);
      for (const item of batch) {
        const key = item.placeId || item.address;
        if (!seen.has(key)) {
          seen.add(key);
          nearbyAddresses.push(item);
        }
      }
      if (nearbyAddresses.length >= numComparables) break;
    }

    // Si no hay suficientes propiedades reales, completar con simuladas cercanas
    if (nearbyAddresses.length < numComparables) {
      const simulatedAddresses = await generateNearbyAddresses(lat, lng, (numComparables * 2) - nearbyAddresses.length);
      nearbyAddresses = [...nearbyAddresses, ...simulatedAddresses];
    }
    // Ordenar por distancia ascendente para priorizar ubicación cercana
    nearbyAddresses.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));

    // Procesar comparables de forma más eficiente para móviles y con mayor similitud de área
    const comparables = nearbyAddresses.map((addressInfo, index) => {
      try {
        const variation = (Math.random() - 0.5) * 0.2; // ±10% price variation

        if (propertyData.tipoPropiedad === 'terreno') {
          // Para terrenos, usar área del terreno con variación estrecha ±15%
          const areaVariationFactor = 0.85 + (Math.random() * 0.30); // 0.85 - 1.15
          const tentativeArea = (propertyData.areaTerreno || 0) * areaVariationFactor;
          const areaMinima = (propertyData.areaTerreno || 0) * 0.85;
          const areaMaxima = (propertyData.areaTerreno || 0) * 1.15;
          const areaTerrenoFinal = Math.round(Math.max(areaMinima, Math.min(areaMaxima, tentativeArea)));

          // Generar características específicas de terreno
          const topografias = ['plano', 'pendiente-suave', 'pendiente-moderada', 'pendiente-pronunciada', 'irregular'];
          const tiposValoracion = ['residencial', 'comercial', 'industrial', 'agricola', 'recreativo'];
          const topografiaComparable = topografias[Math.floor(Math.random() * topografias.length)];
          const tipoValoracionComparable = tiposValoracion[Math.floor(Math.random() * tiposValoracion.length)];

          return {
            id: `comp-${index + 1}`,
            address: addressInfo.address,
            areaConstruida: 0,
            areaTerreno: areaTerrenoFinal,
            tipoPropiedad: 'terreno',
            recamaras: 0,
            banos: 0,
            antiguedad: 0,
            ubicacion: propertyData.ubicacion,
            estadoGeneral: 'nuevo',
            topografia: topografiaComparable,
            tipoValoracion: tipoValoracionComparable,
            precio: convertCurrency(baseValue * (1 + variation) * 0.85, selectedCurrency),
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
                  recamarasVariation: Math.floor((Math.random() - 0.5) * 2), // ±1 recámara
                  banosVariation: Math.floor((Math.random() - 0.5) * 2), // ±1 baño
                  antiguedadVariation: Math.floor((Math.random() - 0.5) * 10), // ±5 años
                  terrenoVariation: 0.7 + (Math.random() * 0.6) // ±30% terreno
                };
              case 'departamento':
                return {
                  areaVariation: 0.7 + (Math.random() * 0.6), // ±30% para departamentos
                  recamarasVariation: Math.floor((Math.random() - 0.5) * 2), // ±1 recámara
                  banosVariation: Math.floor((Math.random() - 0.5) * 1.5), // ±0-1 baño
                  antiguedadVariation: Math.floor((Math.random() - 0.5) * 8), // ±4 años
                  terrenoVariation: 0.9 + (Math.random() * 0.2) // ±10% terreno (departamentos tienen menos variación)
                };
              case 'comercial':
                return {
                  areaVariation: 0.5 + (Math.random() * 1.0), // ±50% para comerciales
                  recamarasVariation: 0, // Comerciales no tienen recámaras
                  banosVariation: Math.floor((Math.random() - 0.5) * 2), // ±1 baño
                  antiguedadVariation: Math.floor((Math.random() - 0.5) * 12), // ±6 años
                  terrenoVariation: 0.6 + (Math.random() * 0.8) // ±40% terreno
                };
              case 'bodega':
                return {
                  areaVariation: 0.4 + (Math.random() * 1.2), // ±60% para bodegas
                  recamarasVariation: 0, // Bodegas no tienen recámaras
                  banosVariation: Math.floor(Math.random() * 2), // 0-1 baño
                  antiguedadVariation: Math.floor((Math.random() - 0.5) * 15), // ±7-8 años
                  terrenoVariation: 0.5 + (Math.random() * 1.0) // ±50% terreno
                };
              default:
                return {
                  areaVariation: 0.6 + (Math.random() * 0.8),
                  recamarasVariation: Math.floor((Math.random() - 0.5) * 2),
                  banosVariation: Math.floor((Math.random() - 0.5) * 2),
                  antiguedadVariation: Math.floor((Math.random() - 0.5) * 8),
                  terrenoVariation: 0.8 + (Math.random() * 0.4)
                };
            }
          };
          
          const variations = getPropertyVariations(tipoComparable);
          
          // Aplicar variaciones y acercar el área a la del sujeto (±15%)
          const rawAreaComparable = Math.round(areaTotal * variations.areaVariation);
          const areaMin = Math.round(desiredArea * 0.85);
          const areaMax = Math.round(desiredArea * 1.15);
          const areaComparable = Math.max(areaMin, Math.min(areaMax, rawAreaComparable));
          const recamarasComparable = Math.max(0, propertyData.recamaras + variations.recamarasVariation);
          const banosComparable = Math.max(1, propertyData.banos + variations.banosVariation);
          const antiguedadComparable = Math.max(0, propertyData.antiguedad + variations.antiguedadVariation);
          const terrenoComparable = Math.round(propertyData.areaTerreno * variations.terrenoVariation);
          
          // Generar descripción específica por tipo
          const getPropertyDescription = (tipo: string, area: number, recamaras: number, banos: number) => {
            switch (tipo) {
              case 'casa':
                return `Casa de ${area}m² con ${recamaras} recámaras y ${banos} baños`;
              case 'departamento':
                return `Departamento de ${area}m² con ${recamaras} recámaras y ${banos} baños`;
              case 'comercial':
                return `Local comercial de ${area}m² con ${banos} baños`;
              case 'bodega':
                return `Bodega de ${area}m² ${banos > 0 ? `con ${banos} baños` : ''}`;
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
            recamaras: recamarasComparable,
            banos: banosComparable,
            antiguedad: antiguedadComparable,
            ubicacion: propertyData.ubicacion,
            estadoGeneral: propertyData.estadoGeneral,
            precio: convertCurrency(baseValue * (1 + variation) * 0.85, selectedCurrency), // Aplicar descuento del 15%
            distancia: addressInfo.distance,
            descripcion: `${getPropertyDescription(tipoComparable, areaComparable, recamarasComparable, banosComparable)}. ${addressInfo.isReal ? 'Propiedad real encontrada en Google Maps' : 'Propiedad simulada'}.`,
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
          recamaras: isTerreno ? 0 : propertyData.recamaras,
          banos: isTerreno ? 0 : propertyData.banos,
          antiguedad: isTerreno ? 0 : propertyData.antiguedad,
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
  const searchNearbyProperties = async (lat: number, lng: number, propertyType: string, numResults: number = 10, radiusMeters: number = 2000) => {
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
            query,
            lat,
            lng,
            radius: radiusMeters
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
            Math.round(Math.random() * radiusMeters),
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
      console.error('Error buscando propiedades con Google Maps:', error);
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
    
    // Calcular precio promedio ponderado por cercanía (mayor peso a los más cercanos)
    const weights = comparables.map((comp) => {
      const d = typeof comp.distancia === 'number' ? comp.distancia : 2000; // en metros
      return 1 / (1 + d / 1000); // 0.5 a 1km, 0.25 a 3km, etc.
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
    const precioPromedioComparables = comparables.reduce((sum, comp, i) => sum + comp.precio * weights[i], 0) / totalWeight;
    
    // Calcular factor de ajuste basado en comparables (60% valor calculado + 40% promedio comparables ponderado)
    const factorAjuste = 0.6;
    const valorAjustadoPorComparables = (valorBase * factorAjuste) + (precioPromedioComparables * (1 - factorAjuste));
    
    return valorAjustadoPorComparables;
  };

  const calculateValuation = async () => {
    if (isCalculating) return; // Prevenir múltiples cálculos simultáneos
    
    setIsCalculating(true);
    try {
      const areaTotal = (propertyData.areaSotano || 0) + 
                       (propertyData.areaPrimerNivel || 0) + 
                       (propertyData.areaSegundoNivel || 0) + 
                       (propertyData.areaTercerNivel || 0) + 
                       (propertyData.areaCuartoNivel || 0) +
                       ((propertyData.areaApartamento || 0) * 2); // Duplicar área de apartamento
      
      // Validación diferente para terrenos vs propiedades construidas
      if (propertyData.tipoPropiedad === 'terreno') {
        // Para terrenos, solo validar que el área del terreno sea mayor a 0
        if ((propertyData.areaTerreno || 0) <= 0) {
          toast({
            title: translations[selectedLanguage].errorTitle,
            description: "Debe ingresar un área de terreno mayor a 0",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Para propiedades construidas, validar área de construcción
        if (areaTotal <= 0) {
          toast({
            title: translations[selectedLanguage].errorTitle,
            description: translations[selectedLanguage].errorMinimumArea,
            variant: "destructive"
          });
          return;
        }
      }
      
      // Precio base por m² según tipo de propiedad (convertido a USD)
      const precioBase = {
        'casa': 800,      // ~$800 USD per m²
        'departamento': 650,  // ~$650 USD per m²
        'terreno': 400,   // ~$400 USD per m²
        'comercial': 950,  // ~$950 USD per m²
        'bodega': 550     // ~$550 USD per m²
      };
      
      let valorBase = (areaTotal * (precioBase[propertyData.tipoPropiedad as keyof typeof precioBase] || 650)) +
                      (propertyData.areaTerreno * 250); // $250 USD per m² for land
      
      // Factores de multiplicación por ubicación
      const factorUbicacion = {
        'excelente': 1.4,
        'buena': 1.2,
        'regular': 1.0,
        'mala': 0.7
      };
      
      // Factores por estado general (valores exactos proporcionados)
      const factorEstado = {
        'nuevo': 1.0000,
        'bueno': 0.9968,
        'medio': 0.9748,
        'regular': 0.9191,
        'reparaciones-sencillas': 0.8190,
        'reparaciones-medias': 0.6680,
        'reparaciones-importantes': 0.4740,
        'danos-graves': 0.2480,
        'en-desecho': 0.1350,
        'inservibles': 0.0000
      };
      
      // Depreciación por antigüedad usando método lineal
      const getVidaUtilSegunTipo = (tipo: string): number => {
        const vidasUtiles = {
          'casa': 100,        // 100 años
          'departamento': 80, // 80 años  
          'terreno': 0,       // Sin depreciación
          'comercial': 60,    // 60 años
          'bodega': 50        // 50 años
        };
        return vidasUtiles[tipo as keyof typeof vidasUtiles] || 80;
      };

      const vidaUtilTotal = getVidaUtilSegunTipo(propertyData.tipoPropiedad);
      
      // Factor de depreciación lineal: 1 - (antigüedad / vida útil total)
      const factorAntiguedad = vidaUtilTotal > 0 
        ? Math.max(0, 1 - (propertyData.antiguedad / vidaUtilTotal))
        : 1; // Para terrenos sin depreciación
      
      // Bonificación por espacios (convertido a USD) - Reducidas 80%
      const bonificacionEspacios = (propertyData.recamaras * 560) +    // $560 per bedroom (antes $2,800)
                                  (propertyData.banos * 320) +          // $320 per bathroom (antes $1,600)
                                  (propertyData.cochera * 440) +        // $440 per garage (antes $2,200)
                                  (propertyData.salas * 260) +          // $260 per living room (antes $1,300)
                                  (propertyData.cocina * 380);          // $380 per kitchen (antes $1,900)
      
      // Calcular penalización por servicios básicos faltantes
      const serviciosBasicos = ['agua', 'electricidad', 'gas', 'drenaje'] as const;
      const serviciosFaltantes = serviciosBasicos.filter(servicio => !propertyData.servicios[servicio]).length;
      const factorServiciosBasicos = 1 - (serviciosFaltantes * 0.04); // -4.0% por cada servicio faltante
      
      // Calcular bonificación por servicios adicionales
      const serviciosAdicionales = ['internet', 'cable', 'telefono', 'seguridad', 'alberca', 'jardin', 'elevador', 'aireAcondicionado', 'calefaccion', 'panelesSolares', 'tinaco'] as const;
      const serviciosAdicionalesPresentes = serviciosAdicionales.filter(servicio => propertyData.servicios[servicio]).length;
      const factorServiciosAdicionales = 1 + (serviciosAdicionalesPresentes * 0.01); // +1.0% por cada servicio adicional
      
      // Factor de ajuste por tipo de acceso (según estándares internacionales IVS/RICS/USPAP)
      const factorTipoAcceso = {
        'mainStreet': 1.15,        // +15% (acceso directo a vía pública principal)
        'vehicularPassage': 1.02,  // +2% (acceso vehicular indirecto - ligeramente positivo)
        'pedestrianPassage': 0.92, // -8% (acceso peatonal únicamente)
        'rightOfWay': 0.85         // -15% (servidumbre de paso/acceso limitado)
      };
      
      // Factor de ajuste por topografía (según estándares internacionales IVS/RICS)
      const factorTopografia = {
        'plano': 1.12,                    // +12% (terreno plano, 0-5% pendiente)
        'pendiente-suave': 1.03,          // +3% (pendiente suave, 5-15%)
        'pendiente-moderada': 0.93,       // -7% (pendiente moderada, 15-25%)
        'pendiente-pronunciada': 0.80,    // -20% (pendiente pronunciada, 25-40%)
        'irregular': 0.75                 // -25% (terreno irregular/escarpado, >40%)
      };
      
      // Factor de ajuste por tipo de valoración (según zonificación internacional)
      const factorTipoValoracion = {
        'residencial': 1.00,              // 0% (base estándar)
        'comercial': 1.28,                // +28% (mayor potencial comercial)
        'industrial': 1.12,               // +12% (uso industrial ligero)
        'agricola': 0.68,                 // -32% (uso agrícola extensivo)
        'recreativo': 0.92                // -8% (uso recreativo/turístico)
      };
      // Aplicar factores específicos para terrenos
      let factorTopografiaFinal = 1;
      let factorTipoValoracionFinal = 1;
      
      if (propertyData.tipoPropiedad === 'terreno') {
        factorTopografiaFinal = factorTopografia[propertyData.topografia as keyof typeof factorTopografia] || 1;
        factorTipoValoracionFinal = factorTipoValoracion[propertyData.tipoValoracion as keyof typeof factorTipoValoracion] || 1;
      }
      
      const valorFinal = (valorBase * 
                         (factorUbicacion[propertyData.ubicacion as keyof typeof factorUbicacion] || 1) *
                         (factorEstado[propertyData.estadoGeneral as keyof typeof factorEstado] || 1) *
                         factorAntiguedad *
                         factorServiciosBasicos *
                         factorServiciosAdicionales *
                         (factorTipoAcceso[propertyData.tipoAcceso as keyof typeof factorTipoAcceso] || 1) *
                         factorTopografiaFinal *
                         factorTipoValoracionFinal) + bonificacionEspacios;
      
      // Convertir a la moneda seleccionada
      const valorFinalEnMonedaSeleccionada = convertCurrency(valorFinal, selectedCurrency);
      
      setBaseValuation(valorFinalEnMonedaSeleccionada);
      
      toast({
        title: translations[selectedLanguage].calculatingValuation,
        description: translations[selectedLanguage].generatingReport,
      });

      try {
        // Generar comparativas con 10 comparables
        const allComparatives = await generateComparativeProperties(valorFinal, 10);

        // Filtrar outliers por precio unitario (cerca del promedio) y seleccionar 5
        const toUnitPrice = (comp: ComparativeProperty) => {
          const area = propertyData.tipoPropiedad === 'terreno' 
            ? (comp.areaTerreno || 0) 
            : (comp.areaConstruida || 0);
          return area > 0 ? comp.precio / area : comp.precio;
        };

        const unitPrices = allComparatives.map(toUnitPrice).sort((a, b) => a - b);
        const mid = Math.floor(unitPrices.length / 2);
        const median = unitPrices.length % 2 === 0
          ? (unitPrices[mid - 1] + unitPrices[mid]) / 2
          : unitPrices[mid];

        const filterByThreshold = (threshold: number) =>
          allComparatives.filter(c => {
            const up = toUnitPrice(c);
            return median > 0 ? Math.abs(up - median) / median <= threshold : true;
          });

        let threshold = 0.25; // ±25%
        let filtered = filterByThreshold(threshold);
        while (filtered.length < 3 && threshold < 0.5) {
          threshold += 0.05; // ampliar gradualmente
          filtered = filterByThreshold(threshold);
        }

        const sortByCloseness = (arr: ComparativeProperty[]) =>
          arr.slice().sort((a, b) => Math.abs(toUnitPrice(a) - median) - Math.abs(toUnitPrice(b) - median));

        const sortedFiltered = sortByCloseness(filtered);
        const desiredCount = Math.min(5, Math.max(3, sortedFiltered.length));
        let selectedProps = sortedFiltered.slice(0, desiredCount);

        // Si hay menos de 3 filtrados, completar hasta 3 con los más cercanos del conjunto total
        if (selectedProps.length < 3) {
          const fallbackTo3 = sortByCloseness(allComparatives)
            .filter(c => !selectedProps.includes(c))
            .slice(0, 3 - selectedProps.length);
          selectedProps = [...selectedProps, ...fallbackTo3];
        }

        setAllComparativeProperties(sortedFiltered.length > 0 ? sortedFiltered : allComparatives);
        setSelectedComparatives(selectedProps.map((_, i) => i));
        setComparativeProperties(selectedProps);
        
        // Calcular valor final ajustado por comparables y aplicar ajuste de precio
        const valorFinalAjustado = calcularValorConComparables(valorFinalEnMonedaSeleccionada, selectedProps);
        const valorAjustado = valorFinalAjustado * (1 + priceAdjustment / 100);
        setValuation(valorAjustado);
      } catch (comparativesError) {
        console.error('Error generating comparatives:', comparativesError);
        // Generar comparativas básicas de respaldo
        const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
        const fallbackComparatives = Array.from({ length: 3 }, (_, i) => {
          const precio = valorFinal * (0.9 + Math.random() * 0.2) * 0.85; // Aplicar descuento del 15%
          const isTerreno = propertyData.tipoPropiedad === 'terreno';
          
          if (isTerreno) {
            // Lógica específica para terrenos fallback
            const topografias = ['plano', 'pendiente-suave', 'pendiente-moderada', 'pendiente-pronunciada', 'irregular'];
            const tiposValoracion = ['residencial', 'comercial', 'industrial', 'agricola', 'recreativo'];
            
            return {
              id: `fallback-${i + 1}`,
              address: `Terreno comparable ${i + 1}`,
              areaConstruida: 0, // Terrenos no tienen área construida
              areaTerreno: Math.max(100, propertyData.areaTerreno + (Math.random() * 200 - 100)), // ±100m²
              tipoPropiedad: 'terreno',
              recamaras: 0, // Terrenos no tienen recámaras
              banos: 0, // Terrenos no tienen baños
              antiguedad: 0, // Terrenos no tienen antigüedad
              ubicacion: propertyData.ubicacion,
              estadoGeneral: 'nuevo', // Terrenos se consideran en buen estado
              // Campos específicos para terrenos
              topografia: topografias[Math.floor(Math.random() * topografias.length)],
              tipoValoracion: tiposValoracion[Math.floor(Math.random() * tiposValoracion.length)],
              precio: precio,
              distancia: Math.floor(Math.random() * 2000 + 500), // distancia en metros
              descripcion: `Terreno comparable generado automáticamente`,
              lat: (propertyData.latitud || 19.4326) + (Math.random() * 0.01 - 0.005),
              lng: (propertyData.longitud || -99.1332) + (Math.random() * 0.01 - 0.005),
              isReal: false
            };
          } else {
            // Lógica para propiedades construidas (original)
            const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
            const areaConstruida = Math.max(50, areaTotal + (Math.random() * 50 - 25));
            
            return {
              id: `fallback-${i + 1}`,
              address: `Propiedad comparable ${i + 1}`,
              areaConstruida: areaConstruida,
              areaTerreno: Math.max(100, propertyData.areaTerreno + (Math.random() * 100 - 50)),
              tipoPropiedad: propertyData.tipoPropiedad,
              recamaras: Math.max(1, propertyData.recamaras + Math.floor(Math.random() * 3 - 1)),
              banos: Math.max(1, propertyData.banos + Math.floor(Math.random() * 2)),
              antiguedad: Math.max(0, propertyData.antiguedad + Math.floor(Math.random() * 10 - 5)),
              ubicacion: propertyData.ubicacion,
              estadoGeneral: propertyData.estadoGeneral,
              precio: precio,
              distancia: Math.floor(Math.random() * 2000 + 500), // distancia en metros
              descripcion: `Propiedad comparable generada automáticamente`,
              lat: (propertyData.latitud || 19.4326) + (Math.random() * 0.01 - 0.005),
              lng: (propertyData.longitud || -99.1332) + (Math.random() * 0.01 - 0.005),
              isReal: false
            };
          }
        });
        
        // Aplicar filtrado y selección de 5 comparables más cercanos al promedio
        const toUnitPrice = (comp: ComparativeProperty) => {
          const area = propertyData.tipoPropiedad === 'terreno' 
            ? (comp.areaTerreno || 0) 
            : (comp.areaConstruida || 0);
          return area > 0 ? comp.precio / area : comp.precio;
        };
        const unitPrices = fallbackComparatives.map(toUnitPrice).sort((a, b) => a - b);
        const mid = Math.floor(unitPrices.length / 2);
        const median = unitPrices.length % 2 === 0
          ? (unitPrices[mid - 1] + unitPrices[mid]) / 2
          : unitPrices[mid];
        const sortByCloseness = (arr: ComparativeProperty[]) =>
          arr.slice().sort((a, b) => Math.abs(toUnitPrice(a) - median) - Math.abs(toUnitPrice(b) - median));
        const desiredCount = Math.min(5, Math.max(3, fallbackComparatives.length));
        const selectedProps = sortByCloseness(fallbackComparatives).slice(0, desiredCount);

        setAllComparativeProperties(fallbackComparatives);
        setSelectedComparatives(selectedProps.map((_, i) => i));
        setComparativeProperties(selectedProps);
        
        // Calcular valor final ajustado con comparables de respaldo
        const valorFinalAjustado = calcularValorConComparables(valorFinalEnMonedaSeleccionada, selectedProps);
        const valorAjustado = valorFinalAjustado * (1 + priceAdjustment / 100);
        setValuation(valorAjustado);
      }
      
      // Limpiar múltiples valuaciones ya que ahora solo hacemos una
      setMultipleValuations([]);
      
      // Hacer scroll al panel de resultados después del cálculo exitoso
      setTimeout(() => {
        const resultsPanel = document.querySelector('[data-results-panel]');
        if (resultsPanel) {
          resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Delay para asegurar que el DOM se actualice
      
      // El valorAjustado ya se estableció en el try o catch
      const valorFinalParaToast = valuation || valorFinalEnMonedaSeleccionada;
      // toast({
      //   title: translations[selectedLanguage].valuationCompleted,
      //   description: `${translations[selectedLanguage].estimatedValueTitle}: ${formatCurrency(valorFinalParaToast, selectedCurrency)} (3 ${translations[selectedLanguage].comparables})`,
      // });
    } catch (error) {
      console.error('Error in calculateValuation:', error);
      toast({
        title: translations[selectedLanguage].errorGeneric,
        description: translations[selectedLanguage].errorCalculatingValuation,
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  // Función para manejar cambios en el ajuste de precio
  const handlePriceAdjustment = (newAdjustment: number) => {
    setPriceAdjustment(newAdjustment);
    
    if (baseValuation && comparativeProperties.length > 0) {
      // Calcular valor ajustado por comparables primero, luego aplicar ajuste de precio
      const valorAjustadoPorComparables = calcularValorConComparables(baseValuation, comparativeProperties);
      const valorFinal = valorAjustadoPorComparables * (1 + newAdjustment / 100);
      setValuation(valorFinal);
      
      toast({
        title: translations[selectedLanguage].priceAdjusted,
        description: `${translations[selectedLanguage].adjustment}: ${newAdjustment > 0 ? '+' : ''}${newAdjustment}% - ${translations[selectedLanguage].newValue}: ${formatCurrency(valorFinal, selectedCurrency)}`,
      });
    } else if (baseValuation) {
      // Fallback si no hay comparables
      const valorAjustado = baseValuation * (1 + newAdjustment / 100);
      setValuation(valorAjustado);
      
      toast({
        title: translations[selectedLanguage].priceAdjusted,
        description: `${translations[selectedLanguage].adjustment}: ${newAdjustment > 0 ? '+' : ''}${newAdjustment}% - ${translations[selectedLanguage].newValue}: ${formatCurrency(valorAjustado, selectedCurrency)}`,
      });
    }
  };

  const regenerateComparatives = async () => {
    if (valuation) {
      toast({
        title: translations[selectedLanguage].calculatingValuation,
        description: translations[selectedLanguage].searchingComparables,
      });

      // Convertir valuación actual de vuelta a USD base para generar comparativas
      const valuationInUSD = selectedCurrency.code === 'USD' ? valuation : valuation / (selectedCurrency.rate || 1);
      const allNew = await generateComparativeProperties(valuationInUSD, 10);

      // Filtrar por precio unitario cercano al promedio y seleccionar 5
      const toUnitPrice = (comp: ComparativeProperty) => {
        const area = propertyData.tipoPropiedad === 'terreno' 
          ? (comp.areaTerreno || 0) 
          : (comp.areaConstruida || 0);
        return area > 0 ? comp.precio / area : comp.precio;
      };
      const prices = allNew.map(toUnitPrice).sort((a,b) => a-b);
      const mid = Math.floor(prices.length/2);
      const median = prices.length % 2 === 0 ? (prices[mid-1]+prices[mid])/2 : prices[mid];
        const sortedByCloseness = allNew
          .slice()
          .sort((a,b) => Math.abs(toUnitPrice(a)-median) - Math.abs(toUnitPrice(b)-median));
        const desiredCount = Math.min(5, Math.max(3, sortedByCloseness.length));
        const selected = sortedByCloseness.slice(0, desiredCount);

      setAllComparativeProperties(sortedByCloseness);
      setSelectedComparatives(selected.map((_, i) => i));
      setComparativeProperties(selected);
      toast({
        title: translations[selectedLanguage].comparativesUpdated,
        description: translations[selectedLanguage].newComparativesGenerated,
      });
    }
  };

  // Función para clasificar comparables por proximidad y precio (matriz 3x3) - Estratificación Latino América
  const classifyComparable = (comparable: ComparativeProperty) => {
    // Calcular distancia
    const distance = comparable.distancia || 0;
    
    // Clasificar por proximidad (ubicación)
    let proximityClass = '';
    if (distance <= 1000) {
      proximityClass = 'bajo'; // bajo = cerca
    } else if (distance <= 3000) {
      proximityClass = 'medio';
    } else {
      proximityClass = 'alto'; // alto = lejos
    }
    
    // Calcular precio por m² del comparable
    const pricePerSqm = comparable.precio / comparable.areaConstruida;
    
    // Estratificación de precios para Latino América (USD/m²)
    // Rangos típicos del mercado latinoamericano
    let priceClass = '';
    if (pricePerSqm <= 800) {
      priceClass = 'bajo';    // Segmento económico
    } else if (pricePerSqm <= 1500) {
      priceClass = 'medio';   // Segmento medio
    } else {
      priceClass = 'alto';    // Segmento alto/premium
    }
    
    // Crear la clasificación 3x3: ubicación-precio
    const classification = `${proximityClass}-${priceClass}`;
    
    return {
      proximity: proximityClass,
      price: priceClass,
      classification: classification
    };
  };

  const getMarketAnalysis = () => {
    if (comparativeProperties.length === 0) return null;
    
    const prices = [...comparativeProperties.map(p => p.precio), valuation || 0];
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const difference = valuation ? ((valuation - avgPrice) / avgPrice) * 100 : 0;
    
    return { avgPrice, minPrice, maxPrice, difference };
  };

  // Función para generar imagen del mapa
  const generateMapImage = async (lat: number, lng: number): Promise<string | null> => {
    try {
      // Usar OpenStreetMap como base para generar imagen del mapa
      const zoom = 16;
      const width = 400;
      const height = 300;
      
      // Crear canvas para el mapa
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return null;
      
      // Fondo blanco
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
      
      // Dibujar un mapa simple con las coordenadas
      ctx.fillStyle = '#e8f4fd';
      ctx.fillRect(0, 0, width, height);
      
      // Dibujar calles simuladas
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      
      // Calles horizontales
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
      
      // Calles verticales
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      
      // Marcador de la propiedad en el centro
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Círculo del marcador
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Borde del marcador
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Etiqueta de ubicación
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Propiedad Valuada', centerX, centerY + 25);
      
      // Coordenadas en la esquina
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`, 10, height - 10);
      
      // Escala
      ctx.fillStyle = '#374151';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('Escala: 1:1000', width - 10, height - 10);
      
      // Convertir canvas a imagen base64
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error generando imagen del mapa:', error);
      return null;
    }
  };

  const generatePDF = async () => {
    if (!valuation) {
      toast({
        title: translations[selectedLanguage].errorGeneric,
        description: translations[selectedLanguage].errorPDFGeneration,
        variant: "destructive"
      });
      return;
    }

    try {
      // Crear PDF con páginas tamaño carta (8.5" x 11" = 215.9mm x 279.4mm)
      const doc = new jsPDF('portrait', 'mm', 'letter'); 
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      const marginLeft = 15;
      const marginRight = 15;
      const marginTop = 15;
      const marginBottom = 15;
      const contentWidth = pageWidth - marginLeft - marginRight;
      
      let yPosition = marginTop;
      
      // Obtener configuración del membrete seleccionado
      const config = letterheadConfigs[selectedLetterhead as keyof typeof letterheadConfigs];

      // HEADER PRINCIPAL
      doc.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Agregar URL del sitio web centrado y resaltado
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const websiteUrl = "https://3ec5020c-6e84-4581-8725-0120596969e6.lovableproject.com";
      doc.textWithLink(translations[selectedLanguage].professionalAppraisalSystem, pageWidth / 2, 12, { align: "center", url: websiteUrl });
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(config.title, pageWidth / 2, 22, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(config.subtitle, pageWidth / 2, 32, { align: "center" });
      doc.text(translations[selectedLanguage].marketAnalysis, pageWidth / 2, 39, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      yPosition = 50;

      // Variable para contar páginas
      let currentPageNumber = 1;

      // Función para agregar número de página
      const addPageNumber = (pageNum: number) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(`Página ${pageNum}`, marginLeft, pageHeight - 10);
        doc.setTextColor(0, 0, 0);
      };

      // Agregar número de página a la primera página
      addPageNumber(currentPageNumber);

      // Función para verificar si necesitamos nueva página
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - marginBottom) {
          doc.addPage();
          currentPageNumber++;
          addPageNumber(currentPageNumber);
          yPosition = marginTop;
          return true;
        }
        return false;
      };

      // SECCIÓN 1: INFORMACIÓN GENERAL DEL INMUEBLE
      checkNewPage(60);
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`1. ${translations[selectedLanguage].generalInfo}`, marginLeft, yPosition + 6);
      doc.setTextColor(0, 0, 0);
      yPosition += 18;

      // Información básica
      const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + 
                       propertyData.areaSegundoNivel + propertyData.areaTercerNivel + 
                       propertyData.areaCuartoNivel;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${translations[selectedLanguage].type}:`, marginLeft, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(letterheadConfigs[propertyData.tipoPropiedad as keyof typeof letterheadConfigs]?.name?.toUpperCase() || propertyData.tipoPropiedad.toUpperCase(), marginLeft + 45, yPosition);
      yPosition += 6;

      // Mostrar área construida solo si NO es terreno
      if (propertyData.tipoPropiedad !== 'terreno') {
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].totalBuiltArea}:`, marginLeft, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${areaTotal.toLocaleString()} ${translations[selectedLanguage].sqm}`, marginLeft + 50, yPosition);
        yPosition += 6;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${translations[selectedLanguage].landArea}:`, marginLeft, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${propertyData.areaTerreno.toLocaleString()} ${translations[selectedLanguage].sqm}`, marginLeft + 40, yPosition);
      yPosition += 6;

      // Mostrar antigüedad solo si NO es terreno
      if (propertyData.tipoPropiedad !== 'terreno') {
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].age}:`, marginLeft, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(`${propertyData.antiguedad} ${translations[selectedLanguage].years}`, marginLeft + 50, yPosition);
        yPosition += 6;
      }

       // Información específica para terrenos
       if (propertyData.tipoPropiedad === 'terreno') {
         doc.setFont("helvetica", "bold");
         doc.text(`${translations[selectedLanguage].topography}:`, marginLeft, yPosition);
         doc.setFont("helvetica", "normal");
         const topografiaTexto = propertyData.topografia === 'plano' ? 'Plano' :
                                propertyData.topografia === 'pendiente-suave' ? 'Pendiente Suave' :
                                propertyData.topografia === 'pendiente-moderada' ? 'Pendiente Moderada' :
                                propertyData.topografia === 'pendiente-pronunciada' ? 'Pendiente Pronunciada' :
                                propertyData.topografia === 'irregular' ? 'Irregular' : 
                                translations[selectedLanguage].notSpecified;
         doc.text(topografiaTexto, marginLeft + 40, yPosition);
         yPosition += 6;

         doc.setFont("helvetica", "bold");
         doc.text(`${translations[selectedLanguage].propertyValuationType}:`, marginLeft, yPosition);
         doc.setFont("helvetica", "normal");
         const tipoValoracionTexto = propertyData.tipoValoracion === 'residencial' ? 'Residencial' :
                                    propertyData.tipoValoracion === 'comercial' ? 'Comercial' :
                                    propertyData.tipoValoracion === 'industrial' ? 'Industrial' :
                                    propertyData.tipoValoracion === 'agricola' ? 'Agrícola' :
                                    propertyData.tipoValoracion === 'recreativo' ? 'Recreativo' :
                                    translations[selectedLanguage].notSpecified;
         doc.text(tipoValoracionTexto, marginLeft + 50, yPosition);
         yPosition += 6;
       }

      // Ubicación y estado
      const ubicacionTexto = propertyData.ubicacion === 'excelente' ? translations[selectedLanguage].excellent :
                             propertyData.ubicacion === 'buena' ? translations[selectedLanguage].goodLocation :
                             propertyData.ubicacion === 'regular' ? translations[selectedLanguage].regularLocation : translations[selectedLanguage].badLocation;
      
      const estadoTexto = propertyData.estadoGeneral === 'nuevo' ? translations[selectedLanguage].new :
                         propertyData.estadoGeneral === 'bueno' ? translations[selectedLanguage].good :
                         propertyData.estadoGeneral === 'medio' ? translations[selectedLanguage].medium :
                         propertyData.estadoGeneral === 'regular' ? translations[selectedLanguage].regular :
                         propertyData.estadoGeneral === 'reparaciones-sencillas' ? translations[selectedLanguage].simpleRepairs :
                         propertyData.estadoGeneral === 'reparaciones-medias' ? translations[selectedLanguage].mediumRepairs :
                         propertyData.estadoGeneral === 'reparaciones-importantes' ? translations[selectedLanguage].importantRepairs :
                         propertyData.estadoGeneral === 'danos-graves' ? translations[selectedLanguage].seriousDamage :
                         propertyData.estadoGeneral === 'en-desecho' ? translations[selectedLanguage].waste :
                         propertyData.estadoGeneral === 'inservibles' ? translations[selectedLanguage].useless : 'No Especificado';

      doc.setFont("helvetica", "bold");
      doc.text(`${translations[selectedLanguage].locationQuality}:`, marginLeft, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(ubicacionTexto, marginLeft + 50, yPosition);
      yPosition += 6;

      // Solo para terrenos: incluir información adicional específica
      if (propertyData.tipoPropiedad === 'terreno') {
        // Factores ambientales (mostrar la calidad seleccionada)
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].environmentalFactors}:`, marginLeft, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(ubicacionTexto, marginLeft + 70, yPosition);
        yPosition += 6;
        
        // Tipo de acceso
        if (propertyData.tipoAcceso) {
          const accessTypeText = propertyData.tipoAcceso === 'pavimentado' ? 'Pavimentado' :
                                 propertyData.tipoAcceso === 'terraceria' ? 'Terracería' :
                                 propertyData.tipoAcceso === 'grava' ? 'Grava' :
                                 'Mixto';
          doc.setFont("helvetica", "bold");
          doc.text(`Tipo de Acceso:`, marginLeft, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(accessTypeText, marginLeft + 30, yPosition);
          yPosition += 6;
        }
        
        // Servicios seleccionados - solo para terrenos mostrar servicios básicos relevantes
        if (propertyData.servicios) {
          let serviciosActivos = [];
          
          if (propertyData.tipoPropiedad === 'terreno') {
            // Para terrenos, solo mostrar servicios básicos que realmente estén seleccionados
            const serviciosBasicosTerreno = ['agua', 'electricidad', 'gas', 'drenaje'];
            serviciosActivos = Object.entries(propertyData.servicios)
              .filter(([key, value]) => value === true && serviciosBasicosTerreno.includes(key))
              .map(([key, _]) => {
                switch(key) {
                  case 'agua': return translations[selectedLanguage].water;
                  case 'electricidad': return translations[selectedLanguage].electricity;
                  case 'gas': return translations[selectedLanguage].gas;
                  case 'drenaje': return translations[selectedLanguage].drainage;
                  default: return key;
                }
              });
          } else {
            // Para otros tipos de propiedad, mostrar todos los servicios seleccionados
            serviciosActivos = Object.entries(propertyData.servicios)
              .filter(([_, value]) => value === true)
              .map(([key, _]) => {
                switch(key) {
                  case 'agua': return translations[selectedLanguage].water;
                  case 'electricidad': return translations[selectedLanguage].electricity;
                  case 'gas': return translations[selectedLanguage].gas;
                  case 'drenaje': return translations[selectedLanguage].drainage;
                  case 'internet': return translations[selectedLanguage].internet;
                  case 'cable': return translations[selectedLanguage].cable;
                  case 'telefono': return translations[selectedLanguage].phone;
                  case 'seguridad': return translations[selectedLanguage].security;
                  case 'alberca': return translations[selectedLanguage].swimmingPool;
                  case 'jardin': return translations[selectedLanguage].garden;
                  case 'elevador': return translations[selectedLanguage].elevator;
                  case 'aireAcondicionado': return translations[selectedLanguage].airConditioning;
                  case 'calefaccion': return translations[selectedLanguage].heating;
                  case 'panelesSolares': return translations[selectedLanguage].solarPanels;
                  case 'tinaco': return translations[selectedLanguage].waterTank;
                  default: return key;
                }
              });
          }
          if (serviciosActivos.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text(`${translations[selectedLanguage].availableServices}:`, marginLeft, yPosition);
            doc.setFont("helvetica", "normal");
            const servicesText = doc.splitTextToSize(serviciosActivos.join(', '), contentWidth - 50);
            doc.text(servicesText, marginLeft + 50, yPosition);
            yPosition += (servicesText.length * 5) + 1;
          }
        }
      } else {
        // Solo mostrar estado general para propiedades que no sean terrenos
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].generalCondition}:`, marginLeft, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(estadoTexto, marginLeft + 40, yPosition);
        yPosition += 6;
      }
      
      yPosition += 9;

      // SECCIÓN 2: UBICACIÓN Y DIRECCIÓN
      if (propertyData.direccionCompleta) {
        checkNewPage(40);
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`2. ${translations[selectedLanguage].propertyLocationPDF}`, marginLeft, yPosition + 6);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].address}:`, marginLeft, yPosition);
        doc.setFont("helvetica", "normal");
        const addressLines = doc.splitTextToSize(propertyData.direccionCompleta, contentWidth - 25);
        doc.text(addressLines, marginLeft + 25, yPosition);
        yPosition += (addressLines.length * 5) + 6;

        if (propertyData.latitud && propertyData.longitud) {
          doc.setFont("helvetica", "bold");
          doc.text(translations[selectedLanguage].coordinatesLabel, marginLeft, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(`${propertyData.latitud.toFixed(6)}, ${propertyData.longitud.toFixed(6)}`, marginLeft + 30, yPosition);
          yPosition += 6;
          
          // Agregar enlace a Google Maps
          const googleMapsUrl = `https://www.google.com/maps?q=${propertyData.latitud},${propertyData.longitud}`;
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 255); // Azul para el enlace
          doc.textWithLink(translations[selectedLanguage].viewInGoogleMaps, marginLeft, yPosition, { url: googleMapsUrl });
          doc.setTextColor(0, 0, 0); // Regresar a negro
          yPosition += 10;
        }
      }

      // SECCIÓN 3: DISTRIBUCIÓN DE ÁREAS (solo para propiedades construidas)
      if (propertyData.tipoPropiedad !== 'terreno') {
        checkNewPage(80);
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`3. ${translations[selectedLanguage].propertyAreas}`, marginLeft, yPosition + 6);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        
        // Áreas por nivel
        const areas = [
          { nivel: translations[selectedLanguage].basement, area: propertyData.areaSotano },
          { nivel: translations[selectedLanguage].firstFloor, area: propertyData.areaPrimerNivel },
          { nivel: translations[selectedLanguage].secondFloor, area: propertyData.areaSegundoNivel },
          { nivel: translations[selectedLanguage].thirdFloor, area: propertyData.areaTercerNivel },
          { nivel: translations[selectedLanguage].fourthFloor, area: propertyData.areaCuartoNivel }
        ];

        areas.forEach(({ nivel, area }) => {
          doc.text(`${nivel}:`, marginLeft + 5, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(`${area} ${translations[selectedLanguage].sqm}`, marginLeft + 50, yPosition);
          doc.setFont("helvetica", "bold");
          yPosition += 5;
        });

        yPosition += 5;
        doc.setFillColor(240, 248, 255);
        doc.rect(marginLeft, yPosition - 3, contentWidth, 8, 'F');
        doc.setFontSize(12);
        doc.text(`${translations[selectedLanguage].totalBuiltArea.toUpperCase()}: ${areaTotal} ${translations[selectedLanguage].sqm}`, marginLeft + 5, yPosition + 3);
        yPosition += 15;

        // Área libre (sin construir) - se calcula restando solo el primer nivel del terreno
        const areaLibre = propertyData.areaTerreno - (propertyData.areaPrimerNivel || 0);
        doc.setFontSize(11);
        doc.text(`Área Libre (sin construir): ${areaLibre > 0 ? areaLibre.toFixed(2) : 0} ${translations[selectedLanguage].sqm}`, marginLeft + 5, yPosition);
        yPosition += 6;
        
        const coeficienteOcupacion = ((areaTotal / propertyData.areaTerreno) * 100).toFixed(1);
        doc.text(`Coeficiente de Ocupación: ${coeficienteOcupacion}%`, marginLeft + 5, yPosition);
        yPosition += 15;
      }

      // SECCIÓN 4: ESPACIOS Y CARACTERÍSTICAS (solo para propiedades construidas)
      if (propertyData.tipoPropiedad !== 'terreno') {
        checkNewPage(100);
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        const seccionNumero = propertyData.tipoPropiedad === 'terreno' ? '3' : '4';
        doc.text(`${seccionNumero}. ${translations[selectedLanguage].propertySpaces}`, marginLeft, yPosition + 6);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;

        // Espacios habitacionales
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].livingSpaces}:`, marginLeft, yPosition);
        yPosition += 8;

        const espacios = [
          { nombre: translations[selectedLanguage].bedrooms, cantidad: propertyData.recamaras },
          { nombre: translations[selectedLanguage].livingRooms, cantidad: propertyData.salas },
          { nombre: translations[selectedLanguage].diningRoom, cantidad: propertyData.comedor },
          { nombre: translations[selectedLanguage].kitchen, cantidad: propertyData.cocina },
          { nombre: translations[selectedLanguage].bathrooms, cantidad: propertyData.banos },
          { nombre: translations[selectedLanguage].serviceArea, cantidad: propertyData.areaServicio },
          { nombre: translations[selectedLanguage].storage, cantidad: propertyData.bodega },
          { nombre: translations[selectedLanguage].garage, cantidad: propertyData.cochera },
          { nombre: translations[selectedLanguage].others, cantidad: propertyData.otros }
        ];

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        espacios.forEach(({ nombre, cantidad }) => {
          doc.text(`• ${nombre}:`, marginLeft + 5, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(`${cantidad}`, marginLeft + 70, yPosition);
          doc.setFont("helvetica", "bold");
          yPosition += 5;
        });

        yPosition += 10;
      }

      // SECCIÓN 5: SERVICIOS DISPONIBLES (solo para propiedades construidas)
      if (propertyData.tipoPropiedad !== 'terreno') {
        checkNewPage(80);
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        const seccionNumero = propertyData.tipoPropiedad === 'terreno' ? '3' : '5';
        doc.text(`${seccionNumero}. ${translations[selectedLanguage].availableServices}`, marginLeft, yPosition + 6);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;

        // Servicios básicos
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].basicServices}:`, marginLeft, yPosition);
        yPosition += 8;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const serviciosBasicos = [
          { nombre: translations[selectedLanguage].water, disponible: propertyData.servicios.agua },
          { nombre: translations[selectedLanguage].electricity, disponible: propertyData.servicios.electricidad },
          { nombre: translations[selectedLanguage].gas, disponible: propertyData.servicios.gas },
          { nombre: translations[selectedLanguage].drainage, disponible: propertyData.servicios.drenaje }
        ];

        serviciosBasicos.filter(({ disponible }) => disponible).forEach(({ nombre }) => {
          doc.text(`✓ ${nombre}`, marginLeft + 5, yPosition);
          yPosition += 5;
        });

        yPosition += 5;
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].additionalServices}:`, marginLeft, yPosition);
        yPosition += 8;

        doc.setFont("helvetica", "normal");
        const serviciosAdicionales = [
          { nombre: translations[selectedLanguage].internet, disponible: propertyData.servicios.internet },
          { nombre: translations[selectedLanguage].cable, disponible: propertyData.servicios.cable },
          { nombre: translations[selectedLanguage].phone, disponible: propertyData.servicios.telefono },
          { nombre: translations[selectedLanguage].security, disponible: propertyData.servicios.seguridad },
          { nombre: translations[selectedLanguage].swimmingPool, disponible: propertyData.servicios.alberca },
          { nombre: translations[selectedLanguage].garden, disponible: propertyData.servicios.jardin },
          { nombre: translations[selectedLanguage].elevator, disponible: propertyData.servicios.elevador },
          { nombre: translations[selectedLanguage].airConditioning, disponible: propertyData.servicios.aireAcondicionado },
          { nombre: translations[selectedLanguage].heating, disponible: propertyData.servicios.calefaccion },
          { nombre: translations[selectedLanguage].solarPanels, disponible: propertyData.servicios.panelesSolares },
          { nombre: translations[selectedLanguage].waterTank, disponible: propertyData.servicios.tinaco }
        ];

        serviciosAdicionales.filter(({ disponible }) => disponible).forEach(({ nombre }) => {
          doc.text(`✓ ${nombre}`, marginLeft + 5, yPosition);
          yPosition += 5;
        });

        yPosition += 15;
      }

      // SECCIÓN 6: ANÁLISIS DE MERCADO Y COMPARABLES
      if (comparativeProperties.length > 0) {
        checkNewPage(120);
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        const seccionAnalisis = propertyData.tipoPropiedad === 'terreno' ? '3' : '6';
        doc.text(`${seccionAnalisis}. ${translations[selectedLanguage].marketAnalysisTitle}`, marginLeft, yPosition + 6);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;

        const analysis = getMarketAnalysis();
        if (analysis) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(translations[selectedLanguage].marketSummary, marginLeft, yPosition);
          yPosition += 10;

          doc.setFontSize(11);
          doc.text(`${translations[selectedLanguage].averagePrice}: ${formatCurrency(analysis.avgPrice, selectedCurrency)}`, marginLeft + 5, yPosition);
          yPosition += 6;
          doc.text(`${translations[selectedLanguage].minPrice}: ${formatCurrency(analysis.minPrice, selectedCurrency)}`, marginLeft + 5, yPosition);
          yPosition += 6;
          doc.text(`${translations[selectedLanguage].maxPrice}: ${formatCurrency(analysis.maxPrice, selectedCurrency)}`, marginLeft + 5, yPosition);
          yPosition += 6;
          
          const variacion = ((valuation - analysis.avgPrice) / analysis.avgPrice * 100).toFixed(1);
          doc.text(`Variación vs. Mercado: ${variacion}%`, marginLeft + 5, yPosition);
          yPosition += 15;
        }

        // Tabla de comparables (resumen)
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${translations[selectedLanguage].comparativeProperties}:`, marginLeft, yPosition);
        yPosition += 10;

        comparativeProperties.forEach((comp, index) => {
          checkNewPage(25);
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`Comparable ${index + 1}:`, marginLeft, yPosition);
          yPosition += 6;

          doc.setFont("helvetica", "normal");
          doc.text(`• ${translations[selectedLanguage].address}: ${comp.address}`, marginLeft + 5, yPosition);
          yPosition += 5;
          doc.text(`• ${translations[selectedLanguage].builtArea}: ${comp.areaConstruida} ${translations[selectedLanguage].sqm}`, marginLeft + 5, yPosition);
          yPosition += 5;
          doc.text(`• ${translations[selectedLanguage].price}: ${formatCurrency(comp.precio, selectedCurrency)}`, marginLeft + 5, yPosition);
          yPosition += 5;
          doc.text(`• ${translations[selectedLanguage].pricePerSqm}: ${formatCurrency(comp.precio / comp.areaConstruida, selectedCurrency)}`, marginLeft + 5, yPosition);
          yPosition += 8;
        });
      }

      // SECCIÓN 7: RESULTADO DE VALUACIÓN
      checkNewPage(80);
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`7. ${translations[selectedLanguage].estimatedValuePDF || translations[selectedLanguage].estimatedValue}`, marginLeft, yPosition + 6);
      doc.setTextColor(0, 0, 0);
      yPosition += 18;

      // Resultado principal
      doc.setFillColor(248, 250, 252);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 25, 'F');
      
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text(`${translations[selectedLanguage].estimatedValue.toUpperCase()}:`, marginLeft + 5, yPosition + 8);
      
      doc.setFontSize(20);
      doc.text(formatCurrency(valuation, selectedCurrency), marginLeft + 5, yPosition + 18);
      yPosition += 35;

      // Detalles del resultado
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Precio por m² construido: ${formatCurrency(valuation / areaTotal, selectedCurrency)}`, marginLeft, yPosition);
      yPosition += 6;

      if (priceAdjustment !== 0) {
        doc.text(`Valor Base Original: ${formatCurrency(baseValuation || 0, selectedCurrency)}`, marginLeft, yPosition);
        yPosition += 6;
        doc.text(`Ajuste Aplicado: ${priceAdjustment > 0 ? '+' : ''}${priceAdjustment}%`, marginLeft, yPosition);
        yPosition += 6;
      }

      doc.text(`Método: Comparación de mercado con ${comparativeProperties.length} comparables`, marginLeft, yPosition);
      yPosition += 6;
      doc.text(`Fecha de Valuación: ${new Date().toLocaleDateString('es-ES')}`, marginLeft, yPosition);
      yPosition += 15;

      // FOTOGRAFÍAS
      if (propertyImages.length > 0) {
        checkNewPage(60);
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`8. ${translations[selectedLanguage].propertyPhotographs}`, marginLeft, yPosition + 6);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text(`Total de fotografías incluidas: ${propertyImages.length}`, marginLeft, yPosition);
        doc.text(`Fecha de captura: ${new Date().toLocaleDateString('es-ES')}`, marginLeft, yPosition + 6);
        yPosition += 20;

        // Procesar fotografías en grupos de 4 por página
        for (let i = 0; i < propertyImages.length; i += 4) {
          if (i > 0) {
            doc.addPage();
            currentPageNumber++;
            addPageNumber(currentPageNumber);
            yPosition = marginTop;
          }

          const currentGroup = propertyImages.slice(i, i + 4);
          const imageWidth = 80;
          const imageHeight = 60;
          const spacingX = 10;
          const spacingY = 5;

          currentGroup.forEach((imageData, groupIndex) => {
            try {
              // Calcular posición en grid 2x2
              const row = Math.floor(groupIndex / 2);
              const col = groupIndex % 2;
              const xPosition = marginLeft + (col * (imageWidth + spacingX));
              const currentYPosition = yPosition + (row * (imageHeight + spacingY + 15));
              
              doc.addImage(imageData.preview, 'JPEG', xPosition, currentYPosition, imageWidth, imageHeight);
              
              // Marco
              doc.setDrawColor(150, 150, 150);
              doc.setLineWidth(0.5);
              doc.rect(xPosition, currentYPosition, imageWidth, imageHeight);
              
              // Título
              doc.setFontSize(10);
              doc.setFont("helvetica", "bold");
              doc.text(`Fotografía ${i + groupIndex + 1}`, xPosition, currentYPosition + imageHeight + 8);
            } catch (error) {
              console.error(`Error agregando imagen ${i + groupIndex + 1}:`, error);
            }
          });

          yPosition += (imageHeight + spacingY + 15) * 2;
        }
      }

      // ANEXO: FICHAS DETALLADAS DE COMPARABLES (al final del documento)
      if (comparativeProperties.length > 0) {
        // Agregar nueva página para anexos
        doc.addPage();
        currentPageNumber++;
        addPageNumber(currentPageNumber);
        yPosition = marginTop + 10;
        
        // Título del anexo
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(translations[selectedLanguage].annexDetailedComparables, marginLeft, yPosition + 6);
        doc.setTextColor(0, 0, 0);
        yPosition += 25;

        comparativeProperties.forEach((comp, index) => {
          // Agregar nueva página para cada comparable (excepto el primero)
          if (index > 0) {
            doc.addPage();
            currentPageNumber++;
            addPageNumber(currentPageNumber);
            yPosition = marginTop + 10;
          }
          
          // Marco para cada comparable
          doc.setDrawColor(200, 200, 200);
          doc.setLineWidth(0.5);
          doc.rect(marginLeft - 2, yPosition - 5, contentWidth + 4, 110);
          
          // Título del comparable
          doc.setFillColor(248, 250, 252);
          doc.rect(marginLeft - 2, yPosition - 5, contentWidth + 4, 15, 'F');
          doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(`COMPARABLE ${index + 1}`, marginLeft + 5, yPosition + 5);
          
          // Estado de la propiedad
          doc.setTextColor(0, 150, 0);
          doc.setFontSize(10);
          doc.text(comp.isReal ? "(Propiedad Real)" : "(Propiedad de Referencia)", marginLeft + 100, yPosition + 5);
          doc.setTextColor(0, 0, 0);
          yPosition += 20;

          // Información principal
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text("UBICACIÓN Y CARACTERÍSTICAS:", marginLeft + 5, yPosition);
          yPosition += 8;

          doc.setFont("helvetica", "normal");
          doc.text(`Dirección: ${comp.address}`, marginLeft + 10, yPosition);
          yPosition += 6;
          
          if (comp.distancia) {
            doc.text(`Distancia al inmueble valuado: ${comp.distancia} metros`, marginLeft + 10, yPosition);
            yPosition += 6;
          }

          if (comp.lat && comp.lng) {
            doc.text(`Coordenadas: ${comp.lat.toFixed(6)}, ${comp.lng.toFixed(6)}`, marginLeft + 10, yPosition);
            yPosition += 6;
            
            // Agregar enlace a Google Maps
            const googleMapsUrl = `https://www.google.com/maps?q=${comp.lat},${comp.lng}`;
            doc.setTextColor(0, 0, 255); // Azul para el enlace
            doc.textWithLink("Ver ubicación en Google Maps", marginLeft + 10, yPosition + 6, { url: googleMapsUrl });
            doc.setTextColor(0, 0, 0); // Regresar a negro
            yPosition += 6;
          }

          // Características físicas
          doc.setFont("helvetica", "bold");
          doc.text(translations[selectedLanguage].physicalCharacteristicsReport, marginLeft + 5, yPosition);
          yPosition += 8;

          doc.setFont("helvetica", "normal");
          doc.text(`${translations[selectedLanguage].builtAreaReport}: ${comp.areaConstruida} m²`, marginLeft + 10, yPosition);
          yPosition += 6;
          doc.text(`Recámaras: ${comp.recamaras}`, marginLeft + 10, yPosition);
          doc.text(`Baños: ${comp.banos}`, marginLeft + 80, yPosition);
          yPosition += 6;
          doc.text(`Antigüedad: ${comp.antiguedad} años`, marginLeft + 10, yPosition);
          doc.text(`Tipo: Casa`, marginLeft + 80, yPosition);
          yPosition += 6;

          // Información de precio
          doc.setFont("helvetica", "bold");
          doc.text("INFORMACIÓN DE PRECIO:", marginLeft + 5, yPosition);
          yPosition += 8;

          doc.setFont("helvetica", "normal");
          doc.text(`Precio Total: ${formatCurrency(comp.precio, selectedCurrency)}`, marginLeft + 10, yPosition);
          yPosition += 6;
          
          yPosition += 6;

          // Análisis comparativo
          const pricePerM2Property = valuation / areaTotal;
          const pricePerM2Comp = comp.precio / comp.areaConstruida;
          const variance = ((pricePerM2Comp - pricePerM2Property) / pricePerM2Property * 100);
          
          doc.setFont("helvetica", "bold");
          doc.text(translations[selectedLanguage].comparativeAnalysisReport, marginLeft + 5, yPosition);
          yPosition += 8;

          doc.setFont("helvetica", "normal");
          doc.text(`${translations[selectedLanguage].priceDifferencePerM2}: ${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`, marginLeft + 10, yPosition);
          yPosition += 6;
          
          if (comp.rating && comp.isReal) {
            doc.text(`Calificación: ${comp.rating}/5.0 estrellas`, marginLeft + 10, yPosition);
            yPosition += 6;
          }

          // Observaciones
          doc.setFont("helvetica", "bold");
          doc.text("OBSERVACIONES:", marginLeft + 5, yPosition);
          yPosition += 8;

          doc.setFont("helvetica", "normal");
          let observacion = "";
          if (comp.areaConstruida > areaTotal * 1.1) {
            observacion = "Propiedad de mayor tamaño que el inmueble valuado.";
          } else if (comp.areaConstruida < areaTotal * 0.9) {
            observacion = "Propiedad de menor tamaño que el inmueble valuado.";
          } else {
            observacion = "Propiedad de tamaño similar al inmueble valuado.";
          }
          
          if (Math.abs(variance) > 10) {
            observacion += ` Presenta ${variance > 0 ? 'mayor' : 'menor'} valor de mercado.`;
          } else {
            observacion += " Precio consistente con el mercado local.";
          }

          doc.text(observacion, marginLeft + 10, yPosition);
        });
      }

      // NUEVA PÁGINA FINAL para sección de compartir
      doc.addPage();
      currentPageNumber++;
      addPageNumber(currentPageNumber);
      yPosition = marginTop + 80; // Posición centrada en la página
      
      // Sección de compartir centrada en la última página con más espacio horizontal
      doc.setFillColor(248, 250, 252);
      doc.rect(10, yPosition - 25, pageWidth - 20, 100, 'F'); // Mayor área horizontal
      
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("COMPARTE ESTE AVALÚO", pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 25; // Más espacio vertical entre líneas
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(translations[selectedLanguage].shareAppraisalText, pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 12;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(translations[selectedLanguage].clickSelectedLink, pageWidth / 2, yPosition, { align: "center" });
      
      yPosition += 20; // Más espacio vertical
      const shareWebsiteUrl = "https://3ec5020c-6e84-4581-8725-0120596969e6.lovableproject.com";
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      
      // Redes sociales en formato vertical - grupo de 2 con color de enlace web
      doc.setTextColor(0, 0, 238); // Color azul de enlaces web
      doc.textWithLink("WhatsApp                    Facebook", pageWidth / 2, yPosition, { align: "center", url: shareWebsiteUrl });
      yPosition += 10;
      doc.textWithLink("Twitter                     Instagram", pageWidth / 2, yPosition, { align: "center", url: shareWebsiteUrl });
      yPosition += 10;
      doc.textWithLink("TikTok                      LinkedIn", pageWidth / 2, yPosition, { align: "center", url: shareWebsiteUrl });
      
      yPosition += 15; // Más espacio vertical
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.textWithLink("¡Obtén tu propio avalúo profesional en nuestro sistema!", pageWidth / 2, yPosition, { align: "center", url: shareWebsiteUrl });

      // Guardar PDF
      const fileName = `avaluo-inmobiliario-${Date.now()}.pdf`;
      doc.save(fileName);

      toast({
        title: translations[selectedLanguage].pdfGenerated,
        description: translations[selectedLanguage].pdfGeneratedDesc,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive"
      });
    }
  };

  // Función para generar PDF como Blob (para compartir directamente)
  const generatePDFBlob = async (): Promise<Blob | null> => {
    if (!valuation) {
      return null;
    }

    try {
      const doc = new jsPDF('portrait', 'mm', 'letter'); 
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      const marginLeft = 15;
      const marginRight = 15;
      const marginTop = 15;
      const marginBottom = 15;
      const contentWidth = pageWidth - marginLeft - marginRight;
      
      let yPosition = marginTop + 10;
      
      // Función para verificar si necesitamos nueva página
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - marginBottom) {
          doc.addPage();
          yPosition = marginTop;
        }
      };

      // Título principal
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235); // Color azul
      doc.text("AVALÚO INMOBILIARIO PROFESIONAL", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 12;

      // Subtítulo
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Sistema de Valuación Inmobiliaria", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Información básica
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("1. INFORMACIÓN GENERAL", marginLeft, yPosition);
      yPosition += 10;

      // Fecha y folio
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Fecha de Evaluación: ${new Date().toLocaleDateString('es-ES')}`, marginLeft, yPosition);
      yPosition += 6;
      doc.text(`Folio: AV-${Date.now().toString().slice(-8)}`, marginLeft, yPosition);
      yPosition += 6;
      doc.text(`Tipo de Propiedad: ${propertyData.tipoPropiedad}`, marginLeft, yPosition);
      yPosition += 10;

      // Valor estimado
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(37, 99, 235);
      doc.text(`VALOR ESTIMADO: ${formatCurrency(valuation, selectedCurrency)}`, marginLeft, yPosition);
      yPosition += 15;

      // Áreas
      const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + 
                       propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
      
      if (areaTotal > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text("2. CARACTERÍSTICAS PRINCIPALES", marginLeft, yPosition);
        yPosition += 10;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(12);
        doc.text(`Área Total Construida: ${areaTotal} m²`, marginLeft, yPosition);
        yPosition += 6;
        
        if (propertyData.areaTerreno > 0) {
          doc.text(`Área del Terreno: ${propertyData.areaTerreno} m²`, marginLeft, yPosition);
          yPosition += 6;
        }
        
        doc.text(`Precio por m²: ${formatCurrency(valuation / areaTotal, selectedCurrency)}`, marginLeft, yPosition);
        yPosition += 10;
      }

      // Servicios (solo para terrenos mostrar servicios básicos)
      if (propertyData.servicios) {
        let serviciosActivos = [];
        
        if (propertyData.tipoPropiedad === 'terreno') {
          const serviciosBasicosTerreno = ['agua', 'electricidad', 'gas', 'drenaje'];
          serviciosActivos = Object.entries(propertyData.servicios)
            .filter(([key, value]) => value === true && serviciosBasicosTerreno.includes(key))
            .map(([key, _]) => {
              switch(key) {
                case 'agua': return translations[selectedLanguage].water;
                case 'electricidad': return translations[selectedLanguage].electricity;
                case 'gas': return translations[selectedLanguage].gas;
                case 'drenaje': return translations[selectedLanguage].drainage;
                default: return key;
              }
            });
        } else {
          serviciosActivos = Object.entries(propertyData.servicios)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => {
              switch(key) {
                case 'agua': return translations[selectedLanguage].water;
                case 'electricidad': return translations[selectedLanguage].electricity;
                case 'gas': return translations[selectedLanguage].gas;
                case 'drenaje': return translations[selectedLanguage].drainage;
                case 'internet': return translations[selectedLanguage].internet;
                case 'cable': return translations[selectedLanguage].cable;
                case 'telefono': return translations[selectedLanguage].phone;
                case 'seguridad': return translations[selectedLanguage].security;
                case 'alberca': return translations[selectedLanguage].swimmingPool;
                case 'jardin': return translations[selectedLanguage].garden;
                case 'elevador': return translations[selectedLanguage].elevator;
                case 'aireAcondicionado': return translations[selectedLanguage].airConditioning;
                case 'calefaccion': return translations[selectedLanguage].heating;
                case 'panelesSolares': return translations[selectedLanguage].solarPanels;
                case 'tinaco': return translations[selectedLanguage].waterTank;
                default: return key;
              }
            });
        }
        
        if (serviciosActivos.length > 0) {
          doc.setFont("helvetica", "bold");
          doc.text(`${translations[selectedLanguage].availableServices}:`, marginLeft, yPosition);
          doc.setFont("helvetica", "normal");
          const servicesText = doc.splitTextToSize(serviciosActivos.join(', '), contentWidth - 50);
          doc.text(servicesText, marginLeft + 50, yPosition);
          yPosition += (servicesText.length * 5) + 10;
        }
      }

      // Información adicional
      checkNewPage(50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("3. METODOLOGÍA", marginLeft, yPosition);
      yPosition += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      const metodologia = "Este avalúo se realizó utilizando el método de comparación de mercado, " +
        "considerando propiedades similares en ubicaciones cercanas y aplicando factores de ajuste " +
        "por características específicas de la propiedad.";
      const metodologiaLines = doc.splitTextToSize(metodologia, contentWidth);
      doc.text(metodologiaLines, marginLeft, yPosition);
      yPosition += (metodologiaLines.length * 5) + 10;

      // Pie de página
      yPosition = pageHeight - 30;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Sistema de Valuación Inmobiliaria - Avalúo Profesional", pageWidth / 2, yPosition, { align: "center" });

      // Generar blob
      return doc.output('blob');

    } catch (error) {
      console.error('Error generating PDF blob:', error);
      return null;
    }
  };

  const generateWord = async () => {
    if (!valuation) {
      toast({
        title: "Error",
        description: "Primero debes calcular la valuación para generar el documento Word",
        variant: "destructive"
      });
      return;
    }

    try {
      const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + 
                       propertyData.areaSegundoNivel + propertyData.areaTercerNivel + 
                       propertyData.areaCuartoNivel;
      
      // Obtener configuración del membrete seleccionado
      const config = letterheadConfigs[selectedLetterhead as keyof typeof letterheadConfigs];
      
      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: [
            // ENCABEZADO
            new Paragraph({
              text: config.title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: config.subtitle,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: translations[selectedLanguage].marketAnalysis,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }), // Espacio

            // 1. INFORMACIÓN GENERAL DEL INMUEBLE
            new Paragraph({
              text: `1. ${translations[selectedLanguage].generalInfo}`,
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].type}: `, bold: true }),
                new TextRun({ text: letterheadConfigs[propertyData.tipoPropiedad as keyof typeof letterheadConfigs]?.name?.toUpperCase() || propertyData.tipoPropiedad.toUpperCase() })
              ]
            }),
            // Mostrar área construida solo si NO es terreno
            ...(propertyData.tipoPropiedad !== 'terreno' ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].totalBuiltArea}: `, bold: true }),
                  new TextRun({ text: `${areaTotal.toLocaleString()} ${translations[selectedLanguage].sqm}` })
                ]
              })
            ] : []),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].landArea}: `, bold: true }),
                new TextRun({ text: `${propertyData.areaTerreno.toLocaleString()} ${translations[selectedLanguage].sqm}` })
              ]
            }),
            // Mostrar antigüedad solo si NO es terreno
            ...(propertyData.tipoPropiedad !== 'terreno' ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].age}: `, bold: true }),
                  new TextRun({ text: `${propertyData.antiguedad} ${translations[selectedLanguage].years}` })
                ]
              })
            ] : []),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].locationQuality}: `, bold: true }),
                new TextRun({ 
                  text: propertyData.ubicacion === 'excelente' ? translations[selectedLanguage].excellent :
                        propertyData.ubicacion === 'buena' ? translations[selectedLanguage].goodLocation :
                        propertyData.ubicacion === 'regular' ? translations[selectedLanguage].regularLocation : translations[selectedLanguage].badLocation
                })
              ]
            }),
            // Solo mostrar estado general si NO es terreno
            ...(propertyData.tipoPropiedad !== 'terreno' ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].generalCondition}: `, bold: true }),
                  new TextRun({ 
                    text: propertyData.estadoGeneral === 'nuevo' ? translations[selectedLanguage].new :
                          propertyData.estadoGeneral === 'bueno' ? translations[selectedLanguage].good :
                          propertyData.estadoGeneral === 'medio' ? translations[selectedLanguage].medium :
                          propertyData.estadoGeneral === 'regular' ? translations[selectedLanguage].regular :
                          propertyData.estadoGeneral === 'reparaciones-sencillas' ? translations[selectedLanguage].simpleRepairs :
                          propertyData.estadoGeneral === 'reparaciones-medias' ? translations[selectedLanguage].mediumRepairs :
                          propertyData.estadoGeneral === 'reparaciones-importantes' ? translations[selectedLanguage].importantRepairs :
                          propertyData.estadoGeneral === 'danos-graves' ? translations[selectedLanguage].seriousDamage :
                          propertyData.estadoGeneral === 'en-desecho' ? translations[selectedLanguage].waste :
                          propertyData.estadoGeneral === 'inservibles' ? translations[selectedLanguage].useless : 'No Especificado'
                  })
                ]
               })
            ] : []),
            
            // Para terrenos: incluir información específica
            ...(propertyData.tipoPropiedad === 'terreno' ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].environmentalFactors}: `, bold: true }),
                  new TextRun({ 
                    text: propertyData.ubicacion === 'excelente' ? translations[selectedLanguage].excellent :
                          propertyData.ubicacion === 'buena' ? translations[selectedLanguage].goodLocation :
                          propertyData.ubicacion === 'regular' ? translations[selectedLanguage].regularLocation : translations[selectedLanguage].badLocation
                  })
                ]
              }),
              // Tipo de acceso
              ...(propertyData.tipoAcceso ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: `Tipo de Acceso: `, bold: true }),
                    new TextRun({ 
                      text: propertyData.tipoAcceso === 'pavimentado' ? 'Pavimentado' :
                            propertyData.tipoAcceso === 'terraceria' ? 'Terracería' :
                            propertyData.tipoAcceso === 'grava' ? 'Grava' :
                            'Mixto'
                    })
                  ]
                })
              ] : []),
              // Servicios seleccionados
              ...(propertyData.servicios && Object.values(propertyData.servicios).some(Boolean) ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${translations[selectedLanguage].availableServices}: `, bold: true }),
                    new TextRun({ 
                      text: Object.entries(propertyData.servicios)
                        .filter(([_, value]) => value === true)
                        .map(([key, _]) => {
                          switch(key) {
                            case 'agua': return translations[selectedLanguage].water;
                            case 'electricidad': return translations[selectedLanguage].electricity;
                            case 'gas': return translations[selectedLanguage].gas;
                            case 'drenaje': return translations[selectedLanguage].drainage;
                            case 'internet': return translations[selectedLanguage].internet;
                            case 'cable': return translations[selectedLanguage].cable;
                            case 'telefono': return translations[selectedLanguage].phone;
                            case 'seguridad': return translations[selectedLanguage].security;
                            case 'alberca': return translations[selectedLanguage].swimmingPool;
                            case 'jardin': return translations[selectedLanguage].garden;
                            case 'elevador': return translations[selectedLanguage].elevator;
                            case 'aireAcondicionado': return translations[selectedLanguage].airConditioning;
                            case 'calefaccion': return translations[selectedLanguage].heating;
                            case 'panelesSolares': return translations[selectedLanguage].solarPanels;
                            case 'tinaco': return translations[selectedLanguage].waterTank;
                            default: return key;
                          }
                        }).join(', ')
                    })
                  ]
                })
              ] : [])
            ] : []),
             
             // Información específica para terrenos
             ...(propertyData.tipoPropiedad === 'terreno' ? [
               new Paragraph({
                 children: [
                   new TextRun({ text: `${translations[selectedLanguage].topography}: `, bold: true }),
                   new TextRun({ 
                     text: propertyData.topografia === 'plano' ? 'Plano' :
                           propertyData.topografia === 'pendiente-suave' ? 'Pendiente Suave' :
                           propertyData.topografia === 'pendiente-moderada' ? 'Pendiente Moderada' :
                           propertyData.topografia === 'pendiente-pronunciada' ? 'Pendiente Pronunciada' :
                           propertyData.topografia === 'irregular' ? 'Irregular' : 
                           translations[selectedLanguage].notSpecified
                   })
                 ]
               }),
               new Paragraph({
                 children: [
                   new TextRun({ text: `${translations[selectedLanguage].propertyValuationType}: `, bold: true }),
                   new TextRun({ 
                     text: propertyData.tipoValoracion === 'residencial' ? 'Residencial' :
                           propertyData.tipoValoracion === 'comercial' ? 'Comercial' :
                           propertyData.tipoValoracion === 'industrial' ? 'Industrial' :
                           propertyData.tipoValoracion === 'agricola' ? 'Agrícola' :
                           propertyData.tipoValoracion === 'recreativo' ? 'Recreativo' :
                           translations[selectedLanguage].notSpecified
                   })
                 ]
               })
             ] : []),
             
             new Paragraph({ text: "" }), // Espacio

            // 2. UBICACIÓN DEL INMUEBLE
            ...(propertyData.direccionCompleta ? [
              new Paragraph({
                text: `2. ${translations[selectedLanguage].propertyLocationPDF}`,
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].address}: `, bold: true }),
                  new TextRun({ text: propertyData.direccionCompleta })
                ]
              }),
              ...(propertyData.latitud && propertyData.longitud ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Coordenadas: ", bold: true }),
                    new TextRun({ text: `${propertyData.latitud.toFixed(6)}, ${propertyData.longitud.toFixed(6)}` })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Google Maps: ", bold: true }),
                    new TextRun({ 
                      text: `https://www.google.com/maps?q=${propertyData.latitud},${propertyData.longitud}`,
                      color: "0000FF"
                    })
                  ]
                })
              ] : []),
              new Paragraph({ text: "" }) // Espacio
            ] : []),

            // 3. DISTRIBUCIÓN DE ÁREAS CONSTRUIDAS (solo para propiedades construidas)
            ...(propertyData.tipoPropiedad !== 'terreno' ? [
              new Paragraph({
                text: `3. ${translations[selectedLanguage].propertyAreas}`,
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].basement}: `, bold: true }),
                  new TextRun({ text: `${propertyData.areaSotano} ${translations[selectedLanguage].sqm}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].firstFloor}: `, bold: true }),
                  new TextRun({ text: `${propertyData.areaPrimerNivel} ${translations[selectedLanguage].sqm}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].secondFloor}: `, bold: true }),
                  new TextRun({ text: `${propertyData.areaSegundoNivel} ${translations[selectedLanguage].sqm}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].thirdFloor}: `, bold: true }),
                  new TextRun({ text: `${propertyData.areaTercerNivel} ${translations[selectedLanguage].sqm}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].fourthFloor}: `, bold: true }),
                  new TextRun({ text: `${propertyData.areaCuartoNivel} ${translations[selectedLanguage].sqm}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].totalBuiltArea.toUpperCase()}: `, bold: true }),
                  new TextRun({ text: `${areaTotal} ${translations[selectedLanguage].sqm}`, bold: true })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Área Libre (sin construir): ", bold: true }),
                  new TextRun({ text: `${propertyData.areaTerreno - (propertyData.areaPrimerNivel || 0) > 0 ? (propertyData.areaTerreno - (propertyData.areaPrimerNivel || 0)).toFixed(2) : 0} m²` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Coeficiente de Ocupación: ", bold: true }),
                  new TextRun({ text: `${((areaTotal / propertyData.areaTerreno) * 100).toFixed(1)}%` })
                ]
              }),
              new Paragraph({ text: "" }) // Espacio
            ] : []),

            // 4. ESPACIOS Y CARACTERÍSTICAS (solo para propiedades construidas)
            ...(propertyData.tipoPropiedad !== 'terreno' ? [
              new Paragraph({
                text: `${propertyData.tipoPropiedad === 'terreno' ? '3' : '4'}. ${translations[selectedLanguage].propertySpaces}`,
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].livingSpaces}:`, bold: true })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].bedrooms}: `, bold: true }),
                  new TextRun({ text: `${propertyData.recamaras}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].livingRooms}: `, bold: true }),
                  new TextRun({ text: `${propertyData.salas}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].diningRoom}: `, bold: true }),
                  new TextRun({ text: `${propertyData.comedor}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].kitchen}: `, bold: true }),
                  new TextRun({ text: `${propertyData.cocina}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].bathrooms}: `, bold: true }),
                  new TextRun({ text: `${propertyData.banos}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].serviceArea}: `, bold: true }),
                  new TextRun({ text: `${propertyData.areaServicio}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].storage}: `, bold: true }),
                  new TextRun({ text: `${propertyData.bodega}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].garage}: `, bold: true }),
                  new TextRun({ text: `${propertyData.cochera}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `• ${translations[selectedLanguage].others}: `, bold: true }),
                  new TextRun({ text: `${propertyData.otros}` })
                ]
              }),
              new Paragraph({ text: "" }) // Espacio
            ] : []),

            // 5. SERVICIOS DISPONIBLES
            // Para terrenos: solo servicios básicos disponibles
            ...(propertyData.tipoPropiedad === 'terreno' ? [
              ...((() => {
                const serviciosBasicosTerreno = ['agua', 'electricidad', 'gas', 'drenaje'];
                const serviciosActivos = Object.entries(propertyData.servicios)
                  .filter(([key, value]) => value === true && serviciosBasicosTerreno.includes(key))
                  .map(([key, _]) => {
                    const serviceNames = {
                      agua: translations[selectedLanguage].water,
                      electricidad: translations[selectedLanguage].electricity,
                      gas: translations[selectedLanguage].gas,
                      drenaje: translations[selectedLanguage].drainage
                    };
                    return serviceNames[key as keyof typeof serviceNames] || key;
                  });
                
                if (serviciosActivos.length > 0) {
                  return [
                    new Paragraph({
                      text: `3. ${translations[selectedLanguage].availableServices}`,
                      heading: HeadingLevel.HEADING_1
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: `${translations[selectedLanguage].basicServices}:`, bold: true })
                      ]
                    }),
                    ...serviciosActivos.map(servicio => 
                      new Paragraph({ children: [new TextRun({ text: `✓ ${servicio}` })] })
                    ),
                    new Paragraph({ text: "" }) // Espacio
                  ];
                } else {
                  return [];
                }
              })())
            ] : [
              // Para otros tipos de propiedad: todos los servicios
              new Paragraph({
                text: `5. ${translations[selectedLanguage].availableServices}`,
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].basicServices}:`, bold: true })
                ]
              }),
              ...(propertyData.servicios.agua ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].water}` })] })] : []),
              ...(propertyData.servicios.electricidad ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].electricity}` })] })] : []),
              ...(propertyData.servicios.gas ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].gas}` })] })] : []),
              ...(propertyData.servicios.drenaje ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].drainage}` })] })] : []),
              
              new Paragraph({
                children: [
                  new TextRun({ text: `${translations[selectedLanguage].additionalServices}:`, bold: true })
                ]
              }),
              ...(propertyData.servicios.internet ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].internet}` })] })] : []),
              ...(propertyData.servicios.cable ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].cable}` })] })] : []),
              ...(propertyData.servicios.telefono ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].phone}` })] })] : []),
              ...(propertyData.servicios.seguridad ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].security}` })] })] : []),
              ...(propertyData.servicios.alberca ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].swimmingPool}` })] })] : []),
              ...(propertyData.servicios.jardin ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].garden}` })] })] : []),
              ...(propertyData.servicios.elevador ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].elevator}` })] })] : []),
              ...(propertyData.servicios.aireAcondicionado ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].airConditioning}` })] })] : []),
              ...(propertyData.servicios.calefaccion ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].heating}` })] })] : []),
              ...(propertyData.servicios.panelesSolares ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].solarPanels}` })] })] : []),
              ...(propertyData.servicios.tinaco ? [new Paragraph({ children: [new TextRun({ text: `✓ ${translations[selectedLanguage].waterTank}` })] })] : []),

              new Paragraph({ text: "" }) // Espacio
            ]),

            // 6. ANÁLISIS DE MERCADO (si hay comparables)
            ...(comparativeProperties.length > 0 ? (() => {
              const analysis = getMarketAnalysis();
              return [
                new Paragraph({
                  text: `6. ${translations[selectedLanguage].marketAnalysisTitle}`,
                  heading: HeadingLevel.HEADING_1
                }),
                ...(analysis ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Resumen del Mercado:", bold: true })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${translations[selectedLanguage].averagePrice}: `, bold: true }),
                      new TextRun({ text: formatCurrency(analysis.avgPrice, selectedCurrency) })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${translations[selectedLanguage].minPrice}: `, bold: true }),
                      new TextRun({ text: formatCurrency(analysis.minPrice, selectedCurrency) })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${translations[selectedLanguage].maxPrice}: `, bold: true }),
                      new TextRun({ text: formatCurrency(analysis.maxPrice, selectedCurrency) })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Variación vs. Mercado: ", bold: true }),
                      new TextRun({ text: `${((valuation - analysis.avgPrice) / analysis.avgPrice * 100).toFixed(1)}%` })
                    ]
                  }),
                  new Paragraph({ text: "" }) // Espacio
                ] : []),
                
                // Tabla de comparables
                new DocxTable({
                  rows: [
                    new DocxTableRow({
                      children: [
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: translations[selectedLanguage].property, bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${translations[selectedLanguage].builtArea} (${translations[selectedLanguage].sqm})`, bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: translations[selectedLanguage].bedrooms, bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: translations[selectedLanguage].bathrooms, bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: translations[selectedLanguage].age, bold: true })] })] }),
                new DocxTableCell({ children: [new Paragraph({ children: [new TextRun({ text: translations[selectedLanguage].price, bold: true })] })] })
                      ]
                    }),
                    ...comparativeProperties.map((comp: ComparativeProperty) => 
                      new DocxTableRow({
                        children: [
                          new DocxTableCell({ children: [new Paragraph({ text: comp.address })] }),
                          new DocxTableCell({ children: [new Paragraph({ text: comp.areaConstruida.toString() })] }),
                          new DocxTableCell({ children: [new Paragraph({ text: comp.recamaras.toString() })] }),
                          new DocxTableCell({ children: [new Paragraph({ text: comp.banos.toString() })] }),
                          new DocxTableCell({ children: [new Paragraph({ text: comp.antiguedad.toString() })] }),
                          new DocxTableCell({ children: [new Paragraph({ text: formatCurrency(comp.precio, selectedCurrency) })] })
                        ]
                      })
                    )
                  ]
                }),
                new Paragraph({ text: "" }) // Espacio
              ];
            })() : []),

            // 7. RESULTADO DE VALUACIÓN
            new Paragraph({
              text: `7. ${translations[selectedLanguage].estimatedValuePDF || translations[selectedLanguage].estimatedValue}`,
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].estimatedValue.toUpperCase()}: `, bold: true, size: 32 }),
                new TextRun({ text: formatCurrency(valuation, selectedCurrency), bold: true, size: 32 })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].pricePerSqm}: `, bold: true }),
                new TextRun({ text: formatCurrency(valuation / areaTotal, selectedCurrency) })
              ]
            }),
            ...(priceAdjustment !== 0 ? [
              new Paragraph({
                children: [
                  new TextRun({ text: "Valor Base Original: ", bold: true }),
                  new TextRun({ text: formatCurrency(baseValuation || 0, selectedCurrency) })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Ajuste Aplicado: ", bold: true }),
                  new TextRun({ text: `${priceAdjustment > 0 ? '+' : ''}${priceAdjustment}%` })
                ]
              })
            ] : []),
            new Paragraph({
              children: [
                new TextRun({ text: "Método de Valuación: ", bold: true }),
                new TextRun({ text: `Comparación de mercado con ${comparativeProperties.length} comparables` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Fecha de Valuación: ", bold: true }),
                new TextRun({ text: new Date().toLocaleDateString('es-ES') })
              ]
            }),
            new Paragraph({ text: "" }), // Espacio

            // 8. FOTOGRAFÍAS (si existen)
            ...(propertyImages.length > 0 ? [
              new Paragraph({
                text: "8. FOTOGRAFÍAS DEL INMUEBLE",
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Total de fotografías incluidas: ${propertyImages.length}` }),
                  new TextRun({ text: ` | Fecha de captura: ${new Date().toLocaleDateString('es-ES')}` })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: "Nota: Las fotografías están incluidas en el reporte PDF para una mejor visualización.",
                    italics: true
                  })
                ]
              }),
              new Paragraph({ text: "" }) // Espacio
            ] : []),

            // ANEXO: FICHAS DETALLADAS DE COMPARABLES (al final del documento)
            ...(comparativeProperties.length > 0 ? [
              new Paragraph({
                text: translations[selectedLanguage].annexDetailedComparables,
                heading: HeadingLevel.HEADING_1,
                pageBreakBefore: true
              }),
              new Paragraph({ text: "" }), // Espacio
              
              ...comparativeProperties.flatMap((comp: ComparativeProperty, index: number) => [
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: `COMPARABLE ${index + 1}`, 
                      bold: true, 
                      size: 28,
                      color: "2563eb"
                    }),
                    new TextRun({ 
                      text: comp.isReal ? " (Propiedad Real)" : " (Propiedad de Referencia)", 
                      size: 20,
                      color: "059669"
                    })
                  ]
                }),
                new Paragraph({ text: "" }), // Espacio
                
                // Ubicación y características
                new Paragraph({
                  children: [
                    new TextRun({ text: "UBICACIÓN Y CARACTERÍSTICAS:", bold: true, underline: {} })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Dirección: ", bold: true }),
                    new TextRun({ text: comp.address })
                  ]
                }),
                ...(comp.distancia ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Distancia al inmueble valuado: ", bold: true }),
                      new TextRun({ text: `${comp.distancia} metros` })
                    ]
                  })
                ] : []),
                ...((comp.lat && comp.lng) || (comp.latitud && comp.longitud) ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Coordenadas: ", bold: true }),
                      new TextRun({ 
                        text: `${(comp.lat || comp.latitud)?.toFixed(6)}, ${(comp.lng || comp.longitud)?.toFixed(6)} (Ver en Google Maps)`
                      })
                    ]
                  })
                ] : []),
                new Paragraph({ text: "" }), // Espacio
                
                // Características físicas
                new Paragraph({
                  children: [
                    new TextRun({ text: translations[selectedLanguage].physicalCharacteristicsReport, bold: true, underline: {} })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `${translations[selectedLanguage].builtAreaReport}: `, bold: true }),
                    new TextRun({ text: `${comp.areaConstruida} m²` })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Recámaras: ", bold: true }),
                    new TextRun({ text: comp.recamaras.toString() }),
                    new TextRun({ text: " | Baños: ", bold: true }),
                    new TextRun({ text: comp.banos.toString() })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Antigüedad: ", bold: true }),
                    new TextRun({ text: `${comp.antiguedad} años` }),
                    new TextRun({ text: " | Tipo: ", bold: true }),
                    new TextRun({ text: "Casa" })
                  ]
                }),
                new Paragraph({ text: "" }), // Espacio
                
                // Información de precio
                new Paragraph({
                  children: [
                    new TextRun({ text: "INFORMACIÓN DE PRECIO:", bold: true, underline: {} })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Precio Total: ", bold: true }),
                    new TextRun({ text: formatCurrency(comp.precio, selectedCurrency) })
                  ]
                }),
                new Paragraph({ text: "" }), // Espacio
                
                // Análisis comparativo
                new Paragraph({
                  children: [
                    new TextRun({ text: translations[selectedLanguage].comparativeAnalysisReport, bold: true, underline: {} })
                  ]
                }),
                (() => {
                  const pricePerM2Property = valuation / areaTotal;
                  const pricePerM2Comp = comp.precio / comp.areaConstruida;
                  const variance = ((pricePerM2Comp - pricePerM2Property) / pricePerM2Property * 100);
                  
                  return new Paragraph({
                    children: [
                      new TextRun({ text: `${translations[selectedLanguage].priceDifferencePerM2}: `, bold: true }),
                      new TextRun({ text: `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%` })
                    ]
                  });
                })(),
                ...(comp.rating && comp.isReal ? [
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Calificación: ", bold: true }),
                      new TextRun({ text: `${comp.rating}/5.0 estrellas` })
                    ]
                  })
                ] : []),
                new Paragraph({ text: "" }), // Espacio
                
                // Observaciones
                new Paragraph({
                  children: [
                    new TextRun({ text: "OBSERVACIONES:", bold: true, underline: {} })
                  ]
                }),
                (() => {
                  const pricePerM2Property = valuation / areaTotal;
                  const pricePerM2Comp = comp.precio / comp.areaConstruida;
                  const variance = ((pricePerM2Comp - pricePerM2Property) / pricePerM2Property * 100);
                  
                  let observacion = "";
                  if (comp.areaConstruida > areaTotal * 1.1) {
                    observacion = "Propiedad de mayor tamaño que el inmueble valuado.";
                  } else if (comp.areaConstruida < areaTotal * 0.9) {
                    observacion = "Propiedad de menor tamaño que el inmueble valuado.";
                  } else {
                    observacion = "Propiedad de tamaño similar al inmueble valuado.";
                  }
                  
                  if (Math.abs(variance) > 10) {
                    observacion += ` Presenta ${variance > 0 ? 'mayor' : 'menor'} valor de mercado.`;
                  } else {
                    observacion += " Precio consistente con el mercado local.";
                  }
                  
                  return new Paragraph({
                    children: [
                      new TextRun({ text: observacion })
                    ]
                  });
                })()
              ])
            ] : [])
          ]
        },
        
        // NUEVA SECCIÓN (PÁGINA) PARA COMPARTIR
        {
          properties: {},
          children: [
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({ text: "" }), // Espacio
            
            // Sección de compartir en nueva página
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "COMPARTE ESTE AVALÚO", 
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
                  text: "Hacer Click en el enlace seleccionado",
                  size: 20,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),
            
            // Enlaces separados para cada red social con sus URLs específicas
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "WhatsApp",
                  bold: true,
                  color: "25D366",
                  size: 24
                }),
                new TextRun({ text: "   |   " }),
                new TextRun({ 
                  text: "Facebook",
                  bold: true,
                  color: "1877F2",
                  size: 24
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "Twitter",
                  bold: true,
                  color: "1DA1F2",
                  size: 24
                }),
                new TextRun({ text: "   |   " }),
                new TextRun({ 
                  text: "Instagram",
                  bold: true,
                  color: "E4405F",
                  size: 24
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "TikTok",
                  bold: true,
                  color: "000000",
                  size: 24
                }),
                new TextRun({ text: "   |   " }),
                new TextRun({ 
                  text: "LinkedIn",
                  bold: true,
                  color: "0A66C2",
                  size: 24
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "Visita nuestro sitio web:",
                  size: 18,
                  bold: true
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "https://3ec5020c-6e84-4581-8725-0120596969e6.lovableproject.com",
                  color: "2563eb",
                  underline: {},
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "¡Obtén tu propio avalúo profesional en nuestro sistema!",
                  size: 28,
                  bold: true,
                  color: "2563eb",
                  underline: {}
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

      toast({
        title: "Documento Word Generado",
        description: "El avalúo completo se ha descargado correctamente",
      });
    } catch (error) {
      console.error('Error generating Word document:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el documento Word",
        variant: "destructive"
      });
    }
  };

  // Función para generar Word como Blob (para compartir directamente)
  const generateWordBlob = async (): Promise<Blob | null> => {
    if (!valuation) {
      return null;
    }

    try {
      const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + 
                       propertyData.areaTercerNivel + propertyData.areaCuartoNivel;

      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "AVALÚO INMOBILIARIO PROFESIONAL", 
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
                  text: "Sistema de Valuación Inmobiliaria",
                  size: 24,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),
            
            new Paragraph({
              text: "1. INFORMACIÓN GENERAL",
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Fecha de Evaluación: ", bold: true }),
                new TextRun({ text: new Date().toLocaleDateString('es-ES') })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Folio: ", bold: true }),
                new TextRun({ text: `AV-${Date.now().toString().slice(-8)}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Tipo de Propiedad: ", bold: true }),
                new TextRun({ text: propertyData.tipoPropiedad || 'No especificado' })
              ]
            }),
            new Paragraph({ text: "" }),
            
            new Paragraph({
              children: [
                new TextRun({ 
                  text: `VALOR ESTIMADO: ${formatCurrency(valuation, selectedCurrency)}`, 
                  bold: true, 
                  size: 28,
                  color: "2563eb"
                })
              ]
            }),
            new Paragraph({ text: "" }),
            
            ...(areaTotal > 0 ? [
              new Paragraph({
                text: "2. CARACTERÍSTICAS PRINCIPALES",
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Área Total Construida: ", bold: true }),
                  new TextRun({ text: `${areaTotal} m²` })
                ]
              }),
              ...(propertyData.areaTerreno > 0 ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Área del Terreno: ", bold: true }),
                    new TextRun({ text: `${propertyData.areaTerreno} m²` })
                  ]
                })
              ] : []),
              new Paragraph({
                children: [
                  new TextRun({ text: "Precio por m²: ", bold: true }),
                  new TextRun({ text: formatCurrency(valuation / areaTotal, selectedCurrency) })
                ]
              }),
              new Paragraph({ text: "" })
            ] : []),

            new Paragraph({
              text: "3. METODOLOGÍA",
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "Este avalúo se realizó utilizando el método de comparación de mercado, considerando propiedades similares en ubicaciones cercanas y aplicando factores de ajuste por características específicas de la propiedad."
                })
              ]
            }),
            new Paragraph({ text: "" }),
            
            new Paragraph({
              children: [
                new TextRun({ 
                  text: "Sistema de Valuación Inmobiliaria - Avalúo Profesional",
                  italics: true,
                  size: 20,
                  color: "666666"
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        }]
      });

      return await Packer.toBlob(doc);

    } catch (error) {
      console.error('Error generating Word blob:', error);
      return null;
    }
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Selectores de Idioma y Moneda */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
           <LanguageSelector />
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
            title={translations[selectedLanguage].currencyValuation}
            exchangeRateUpdated={translations[selectedLanguage].exchangeRateUpdated}
            exchangeRateError={translations[selectedLanguage].exchangeRateError}
            errorTitle={translations[selectedLanguage].errorTitle}
            lastUpdateText={translations[selectedLanguage].lastUpdateText}
            exchangeRateNote={translations[selectedLanguage].exchangeRateNote}
            exchangeRateLabel={translations[selectedLanguage].exchangeRateLabel}
          />
          
          
          {/* Botones de descarga eliminados */}

            {/* Botón de Compartir */}
            {valuation && (
              <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
                <Label className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                   {translations[selectedLanguage].shareValuation}
                </Label>
                <ShareButtons 
                  title="Valuación Inmobiliaria Profesional - Sistema de Avalúos"
                  description="He obtenido una valuación profesional de mi propiedad. ¡Descubre el valor de la tuya también!"
                  onGeneratePDF={generatePDF}
                  onGenerateWord={generateWord}
                  onGeneratePDFBlob={generatePDFBlob}
                  onGenerateWordBlob={generateWordBlob}
                />
              </Card>
            )}
          
          {/* Selector de tipo de membrete */}
          {valuation && (
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-200 dark:border-amber-800">
              <Label className="text-sm font-bold mb-3 block text-amber-900 dark:text-amber-100">{translations[selectedLanguage].letterheadType}</Label>
              <Select value={selectedLetterhead} onValueChange={setSelectedLetterhead}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={translations[selectedLanguage].selectLetterhead} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(letterheadConfigs).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>
          )}
          
          {/* Disclaimer de Valuación */}
          {valuation && (
            <Card className="p-4 bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-700">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                * {translations[selectedLanguage].disclaimerText}
              </p>
            </Card>
          )}
          
          {/* Botón de Demo */}
          {/* Botón de demo eliminado */}
        </div>

        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                {translations[selectedLanguage].propertyData}
              </CardTitle>
              {propertyData.tipoPropiedad === 'departamento' && (
                <div className="mt-3 bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/30 rounded-full p-1">
                      <Home className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-white font-semibold text-sm">
                      CONFIGURACIÓN DE APARTAMENTO
                    </span>
                  </div>
                  <p className="text-white/80 text-xs mt-1">
                    Los campos están optimizados para propiedades tipo apartamento
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Tabs value={activeTab} onValueChange={(newValue) => {
                try {
                  setActiveTab(newValue);
                } catch (error) {
                  console.error('Error changing tab:', error);
                  // Fallback al tab de tipo si hay error
                  setActiveTab('tipo');
                }
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-2 h-auto gap-1 bg-muted/50">
                   <TabsTrigger 
                     value="ubicacion" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].location}
                   </TabsTrigger>
                    <TabsTrigger 
                      value="areas" 
                      className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {translations[selectedLanguage].areas}
                     </TabsTrigger>
                   {propertyData.tipoPropiedad !== 'departamento' && (
                     <TabsTrigger 
                       value="servicios" 
                       className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                     >
                       {translations[selectedLanguage].services}
                     </TabsTrigger>
                   )}
                   <TabsTrigger 
                     value="fotos" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].photos}
                   </TabsTrigger>
                  </TabsList>

                  <TabsContent value="areas" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                     {propertyData.tipoPropiedad === 'apartamento' ? (
                       <>
                         
                         {/* Sub-tabs para apartamentos */}
                         <Tabs defaultValue="general" className="w-full">
                           <TabsList className="grid w-full grid-cols-3">
                             <TabsTrigger value="general">Información General</TabsTrigger>
                             <TabsTrigger value="adicional">Información Adicional</TabsTrigger>
                             <TabsTrigger value="apartamento">Apartamento</TabsTrigger>
                           </TabsList>
                           
                           <TabsContent value="general" className="space-y-4 mt-4">
                             <div className="grid grid-cols-1 gap-4">
                               {/* Área del apartamento */}
                               <div>
                                 <Label htmlFor="areaConstruccion">
                                   {translations[selectedLanguage].apartmentArea}
                                 </Label>
                                 <Input
                                   id="areaConstruccion"
                                   type="number"
                                   value={propertyData.areaPrimerNivel || ''}
                                   onChange={(e) => {
                                     const value = e.target.value;
                                     const numValue = value === '' ? 0 : parseFloat(value) || 0;
                                     handleInputChange('areaPrimerNivel', numValue);
                                   }}
                                   placeholder="Ej: 120"
                                   className="mt-1"
                                 />
                                 <p className="text-xs text-muted-foreground mt-1">
                                   Ingrese el área total del apartamento en metros cuadrados
                                 </p>
                               </div>
                             </div>
                           </TabsContent>
                           
                           <TabsContent value="adicional" className="space-y-4 mt-4">
                             <div className="grid grid-cols-1 gap-4">
                               <div>
                                 <Label htmlFor="infoAdicional">
                                   Información Adicional del Apartamento
                                 </Label>
                                 <p className="text-sm text-muted-foreground mt-2">
                                   Esta sección está disponible para información adicional específica del apartamento.
                                 </p>
                               </div>
                             </div>
                           </TabsContent>
                           
                           <TabsContent value="apartamento" className="space-y-4 mt-4">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div>
                                 <Label htmlFor="nivelApartamento">
                                   Nivel del Apartamento
                                 </Label>
                                 <Input
                                   id="nivelApartamento"
                                   type="number"
                                   placeholder="Ej: 5"
                                   className="mt-1"
                                 />
                                 <p className="text-xs text-muted-foreground mt-1">
                                   En qué piso se encuentra el apartamento
                                 </p>
                               </div>
                               <div>
                                 <Label htmlFor="orientacionApartamento">
                                   Orientación
                                 </Label>
                                 <Select>
                                   <SelectTrigger className="mt-1">
                                     <SelectValue placeholder="Selecciona orientación" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="norte">Norte</SelectItem>
                                     <SelectItem value="sur">Sur</SelectItem>
                                     <SelectItem value="este">Este</SelectItem>
                                     <SelectItem value="oeste">Oeste</SelectItem>
                                     <SelectItem value="noreste">Noreste</SelectItem>
                                     <SelectItem value="noroeste">Noroeste</SelectItem>
                                     <SelectItem value="sureste">Sureste</SelectItem>
                                     <SelectItem value="suroeste">Suroeste</SelectItem>
                                   </SelectContent>
                                 </Select>
                                 <p className="text-xs text-muted-foreground mt-1">
                                   Orientación principal del apartamento
                                 </p>
                               </div>
                             </div>
                           </TabsContent>
                         </Tabs>
                       </>
                      ) : (
                       <>
                         <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">{translations[selectedLanguage].areas}</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Área de construcción - para todas las propiedades excepto terrenos */}
                          {propertyData.tipoPropiedad !== 'terreno' && (
                            <div>
                              <Label htmlFor="areaConstruccion">
                                Área de Construcción Casa (m²)
                              </Label>
                              <Input
                                id="areaConstruccion"
                                type="number"
                                value={propertyData.areaPrimerNivel || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const numValue = value === '' ? 0 : parseFloat(value) || 0;
                                  handleInputChange('areaPrimerNivel', numValue);
                                }}
                                placeholder="Ej: 120"
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Ingrese el área total construida de la propiedad
                              </p>
                            </div>
                          )}
                          
                          {/* Área de terreno - siempre visible para el método de comparables */}
                          <div>
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
                                    <TooltipContent 
                                      side="top" 
                                      className="z-50 max-w-xs p-3 bg-background border border-border shadow-lg"
                                    >
                                      <p className="text-sm leading-relaxed text-foreground">
                                        {propertyData.tipoPropiedad === 'terreno' ? 
                                          'Indique el área del terreno únicamente en metros cuadrados (m²).' :
                                          'Indique el área del terreno donde se encuentra la construcción en metros cuadrados (m²).'
                                        }
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
                                placeholder="Ej: 200"
                                className="mt-1"
                              />
                            </div>

                          {/* Área de Apartamento */}
                          <div>
                            <Label htmlFor="areaApartamento">
                              Área de Apartamento (m²)
                            </Label>
                            <Input
                              id="areaApartamento"
                              type="number"
                              value={propertyData.areaApartamento || ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleInputChange('areaApartamento', value === '' ? 0 : parseFloat(value) || 0);
                              }}
                              placeholder="Ej: 85"
                              className="mt-1"
                            />
                           </div>
                         </div>
                       </>
                      )}
                    </TabsContent>





                  <TabsContent value="servicios" className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <span className="text-lg">🌐</span>
                      EVALUACIÓN DE SERVICIOS - Estándares IVS/RICS
                    </h3>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Parámetros de Valoración Internacional</h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Cada servicio impacta el valor de la propiedad según estándares mundiales de avalúo (IVS/RICS):
                        <br />• Servicios Básicos: -15% a 0% (ausencia penaliza valor)
                        <br />• Servicios Premium: +2% a +8% (incrementan valor de mercado)
                        <br />• Infraestructura Avanzada: +5% a +12% (diferenciación competitiva)
                      </p>
                    </div>
                    
                    {/* Servicios Básicos Esenciales */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2 flex items-center gap-2">
                        <span className="text-red-500">⚡</span>
                        SERVICIOS BÁSICOS ESENCIALES
                        <Badge variant="destructive" className="text-xs">Impacto: -15% si faltan</Badge>
                      </h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                       <div className="flex items-center space-x-2">
                         <Checkbox 
                           id="agua"
                           checked={propertyData.servicios.agua}
                           onCheckedChange={(checked) => handleServiceChange('agua', checked as boolean)}
                         />
                         <label htmlFor="agua" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                           {translations[selectedLanguage].water}
                         </label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Checkbox 
                           id="electricidad"
                           checked={propertyData.servicios.electricidad}
                           onCheckedChange={(checked) => handleServiceChange('electricidad', checked as boolean)}
                         />
                         <label htmlFor="electricidad" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                           {translations[selectedLanguage].electricity}
                         </label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Checkbox 
                           id="gas"
                           checked={propertyData.servicios.gas}
                           onCheckedChange={(checked) => handleServiceChange('gas', checked as boolean)}
                         />
                         <label htmlFor="gas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                           {translations[selectedLanguage].gas}
                         </label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <Checkbox 
                           id="drenaje"
                           checked={propertyData.servicios.drenaje}
                           onCheckedChange={(checked) => handleServiceChange('drenaje', checked as boolean)}
                         />
                         <label htmlFor="drenaje" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                           {translations[selectedLanguage].drainage}
                         </label>
                       </div>
                     </div>
                   </div>

                    {/* Servicios Premium */}
                    {propertyData.tipoPropiedad !== 'terreno' && (
                      <div className="mb-6">
                        <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2 flex items-center gap-2">
                          <span className="text-green-500">📶</span>
                          SERVICIOS PREMIUM
                          <Badge variant="default" className="text-xs bg-green-600">Impacto: +2% a +5%</Badge>
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="internet"
                              checked={propertyData.servicios.internet}
                              onCheckedChange={(checked) => handleServiceChange('internet', checked as boolean)}
                            />
                            <label htmlFor="internet" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].internet}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="cable"
                              checked={propertyData.servicios.cable}
                              onCheckedChange={(checked) => handleServiceChange('cable', checked as boolean)}
                            />
                            <label htmlFor="cable" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].cable}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="telefono"
                              checked={propertyData.servicios.telefono}
                              onCheckedChange={(checked) => handleServiceChange('telefono', checked as boolean)}
                            />
                            <label htmlFor="telefono" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].phone}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="seguridad"
                              checked={propertyData.servicios.seguridad}
                              onCheckedChange={(checked) => handleServiceChange('seguridad', checked as boolean)}
                            />
                            <label htmlFor="seguridad" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].security}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="alberca"
                              checked={propertyData.servicios.alberca}
                              onCheckedChange={(checked) => handleServiceChange('alberca', checked as boolean)}
                            />
                            <label htmlFor="alberca" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].swimmingPool}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="jardin"
                              checked={propertyData.servicios.jardin}
                              onCheckedChange={(checked) => handleServiceChange('jardin', checked as boolean)}
                            />
                            <label htmlFor="jardin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].garden}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="elevador"
                              checked={propertyData.servicios.elevador}
                              onCheckedChange={(checked) => handleServiceChange('elevador', checked as boolean)}
                            />
                            <label htmlFor="elevador" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].elevator}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="aireAcondicionado"
                              checked={propertyData.servicios.aireAcondicionado}
                              onCheckedChange={(checked) => handleServiceChange('aireAcondicionado', checked as boolean)}
                            />
                            <label htmlFor="aireAcondicionado" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].airConditioning}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="calefaccion"
                              checked={propertyData.servicios.calefaccion}
                              onCheckedChange={(checked) => handleServiceChange('calefaccion', checked as boolean)}
                            />
                            <label htmlFor="calefaccion" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].heating}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="panelesSolares"
                              checked={propertyData.servicios.panelesSolares}
                              onCheckedChange={(checked) => handleServiceChange('panelesSolares', checked as boolean)}
                            />
                            <label htmlFor="panelesSolares" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].solarPanels}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="tinaco"
                              checked={propertyData.servicios.tinaco}
                              onCheckedChange={(checked) => handleServiceChange('tinaco', checked as boolean)}
                            />
                            <label htmlFor="tinaco" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {translations[selectedLanguage].waterTank}
                            </label>
                          </div>
                        </div>
                        
                        {/* Nueva sección: Infraestructura Avanzada */}
                        <div className="mt-6 pt-4 border-t border-muted">
                          <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <span className="text-blue-500">🏗️</span>
                            INFRAESTRUCTURA AVANZADA
                            <Badge variant="default" className="text-xs bg-blue-600">Impacto: +5% a +12%</Badge>
                          </h5>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="sistemaSmart"
                                checked={propertyData.servicios.panelesSolares}
                                onCheckedChange={(checked) => handleServiceChange('panelesSolares', checked as boolean)}
                              />
                              <label htmlFor="sistemaSmart" className="text-sm font-medium leading-none">
                                Sistema Domótico/Smart Home
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="energiaRenovable"
                                checked={propertyData.servicios.tinaco}
                                onCheckedChange={(checked) => handleServiceChange('tinaco', checked as boolean)}
                              />
                              <label htmlFor="energiaRenovable" className="text-sm font-medium leading-none">
                                Energía Renovable Certificada
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        {/* Resumen de Impacto en Valuación */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg border">
                          <h5 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                            <span>💰</span>
                            IMPACTO TOTAL EN VALUACIÓN (Estándares IVS/RICS)
                          </h5>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>✅ Servicios Básicos Completos:</span>
                              <span className="font-semibold text-green-600">0% (Base estándar)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🚫 Ausencia de Servicios Básicos:</span>
                              <span className="font-semibold text-red-600">-15% (Penalización)</span>
                            </div>
                            <div className="flex justify-between">
                              <span>📶 Servicios Premium:</span>
                              <span className="font-semibold text-green-600">+2% a +5%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>🏗️ Infraestructura Avanzada:</span>
                              <span className="font-semibold text-blue-600">+5% a +12%</span>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-muted text-xs">
                            <p className="font-semibold">
                              📋 Nota: Estos factores se aplican automáticamente en el cálculo final del avalúo según normativas internacionales.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Información de Estándares */}
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                      <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                        <span>🌍</span>
                        CERTIFICACIÓN INTERNACIONAL
                      </h4>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Esta evaluación cumple con los Estándares Internacionales de Valuación (IVS) y las directrices del Royal Institution of Chartered Surveyors (RICS) 
                        para la valoración de servicios e infraestructura en propiedades residenciales y comerciales.
                      </p>
                    </div>
                    {/* Resumen de servicios */}
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-2">{translations[selectedLanguage].servicesSummary}</h4>
                      
                      {/* Servicios Básicos disponibles */}
                      {[propertyData.servicios.agua, propertyData.servicios.electricidad, propertyData.servicios.gas, propertyData.servicios.drenaje].some(Boolean) && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-muted-foreground">{translations[selectedLanguage].basicServicesSummary}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {propertyData.servicios.agua && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{translations[selectedLanguage].water}</span>
                            )}
                            {propertyData.servicios.electricidad && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{translations[selectedLanguage].electricity}</span>
                            )}
                            {propertyData.servicios.gas && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{translations[selectedLanguage].gas}</span>
                            )}
                            {propertyData.servicios.drenaje && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">{translations[selectedLanguage].drainage}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Servicios Adicionales disponibles - Solo si NO es terreno */}
                      {propertyData.tipoPropiedad !== 'terreno' && [propertyData.servicios.internet, propertyData.servicios.cable, propertyData.servicios.telefono, propertyData.servicios.seguridad, propertyData.servicios.alberca, propertyData.servicios.jardin, propertyData.servicios.elevador, propertyData.servicios.aireAcondicionado, propertyData.servicios.calefaccion, propertyData.servicios.panelesSolares, propertyData.servicios.tinaco].some(Boolean) && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">{translations[selectedLanguage].additionalServicesSummary}</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {propertyData.servicios.internet && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{translations[selectedLanguage].internet}</span>
                            )}
                            {propertyData.servicios.cable && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{translations[selectedLanguage].cable}</span>
                            )}
                            {propertyData.servicios.telefono && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{translations[selectedLanguage].phone}</span>
                            )}
                            {propertyData.servicios.seguridad && (
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{translations[selectedLanguage].security}</span>
                            )}
                            {propertyData.servicios.alberca && (
                              <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">{translations[selectedLanguage].swimmingPool}</span>
                            )}
                            {propertyData.servicios.jardin && (
                              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">{translations[selectedLanguage].garden}</span>
                            )}
                            {propertyData.servicios.elevador && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">{translations[selectedLanguage].elevator}</span>
                            )}
                            {propertyData.servicios.aireAcondicionado && (
                              <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded">{translations[selectedLanguage].airConditioning}</span>
                            )}
                            {propertyData.servicios.calefaccion && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">{translations[selectedLanguage].heating}</span>
                            )}
                            {propertyData.servicios.panelesSolares && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{translations[selectedLanguage].solarPanels}</span>
                            )}
                            {propertyData.servicios.tinaco && (
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">{translations[selectedLanguage].waterTank}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Mensaje si no hay servicios disponibles */}
                      {![propertyData.servicios.agua, propertyData.servicios.electricidad, propertyData.servicios.gas, propertyData.servicios.drenaje, propertyData.servicios.internet, propertyData.servicios.cable, propertyData.servicios.telefono, propertyData.servicios.seguridad, propertyData.servicios.alberca, propertyData.servicios.jardin, propertyData.servicios.elevador, propertyData.servicios.aireAcondicionado, propertyData.servicios.calefaccion, propertyData.servicios.panelesSolares, propertyData.servicios.tinaco].some(Boolean) && (
                        <p className="text-xs text-muted-foreground italic">No hay servicios seleccionados</p>
                      )}
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
                        <SimpleLocationMap
                          onLocationChange={handleLocationChange}
                          initialLat={propertyData.latitud}
                          initialLng={propertyData.longitud}
                          initialAddress={propertyData.direccionCompleta}
                        />
                         {propertyData.direccionCompleta && (
                           <div className="p-3 bg-muted rounded-lg">
                             <div className="flex items-start gap-2">
                               <MapPin className="h-4 w-4 text-primary mt-0.5" />
                               <div>
                                 <p className="text-sm font-medium">{translations[selectedLanguage].registeredAddress}</p>
                                 <p className="text-sm text-muted-foreground">{propertyData.direccionCompleta}</p>
                                 <p className="text-xs text-muted-foreground mt-1">
                                   {translations[selectedLanguage].coordinates} {propertyData.latitud?.toFixed(6)}, {propertyData.longitud?.toFixed(6)}
                                 </p>
                               </div>
                             </div>
                           </div>
                         )}
                      </TabsContent>
                      
                       <TabsContent value="editar" className="space-y-4 mt-4">
                         <p className="text-sm text-muted-foreground mb-4">
                           {translations[selectedLanguage].editLocationInstructions}
                         </p>
                         
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="direccion-completa">{translations[selectedLanguage].fullAddress}</Label>
                              <Input
                                id="direccion-completa"
                                value={propertyData.direccionCompleta || ''}
                                onChange={(e) => {
                                  // Solo actualizar la dirección, mantener las coordenadas del mapa
                                  setPropertyData(prev => ({
                                    ...prev,
                                    direccionCompleta: e.target.value
                                  }));
                                }}
                                placeholder={translations[selectedLanguage].fullAddressPlaceholder}
                                className="mt-1"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {translations[selectedLanguage].coordinatesNote}
                              </p>
                            </div>
                          
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <Label htmlFor="latitud">{translations[selectedLanguage].latitude}</Label>
                               <Input
                                 id="latitud"
                                 type="number"
                                 step="any"
                                 value={propertyData.latitud || ''}
                                 onChange={(e) => handleInputChange('latitud', parseFloat(e.target.value) || 0)}
                                 placeholder={translations[selectedLanguage].latitudePlaceholder}
                                 className="mt-1"
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
                                 className="mt-1"
                               />
                             </div>
                           </div>
                          
                          <div>
                            <Label htmlFor="ubicacion-calidad">Calidad de la Ubicación</Label>
                            <Select
                              value={propertyData.ubicacion}
                              onValueChange={(value) => handleInputChange('ubicacion', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecciona la calidad de la ubicación" />
                              </SelectTrigger>
                              <SelectContent className="bg-background border border-border shadow-lg z-50">
                                <SelectItem value="excelente">Excelente</SelectItem>
                                <SelectItem value="buena">Buena</SelectItem>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="mala">Mala</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {propertyData.direccionCompleta && propertyData.latitud && propertyData.longitud && (
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium">Datos Guardados:</p>
                                  <p className="text-sm text-muted-foreground">{propertyData.direccionCompleta}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Coordenadas: {propertyData.latitud?.toFixed(6)}, {propertyData.longitud?.toFixed(6)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Ubicación: {propertyData.ubicacion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                 </TabsContent>

                 <TabsContent value="fotos" className="space-y-4 mt-6">
                   <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                     <Camera className="h-5 w-5" />
                     {translations[selectedLanguage].photos} ({translations[selectedLanguage].optional})
                   </h3>
                   <p className="text-sm text-muted-foreground mb-4">
                     Agrega fotos del inmueble para incluirlas en el reporte de valuación. Formatos aceptados: JPG, PNG, WebP
                   </p>
                   
                   <div className="space-y-4">
                     <div>
                       <Label htmlFor="property-images" className="cursor-pointer">
                         <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                           <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                           <p className="text-sm text-muted-foreground">Haz clic para seleccionar fotos o arrastra aquí</p>
                           <p className="text-xs text-muted-foreground mt-1">Máximo 12 fotos</p>
                         </div>
                       </Label>
                       <Input
                         id="property-images"
                         type="file"
                         multiple
                         accept="image/*"
                         onChange={handleImageUpload}
                         className="hidden"
                       />
                     </div>

                       {propertyImages.length > 0 && (
                         <div className="space-y-2 sm:space-y-3">
                           <h4 className="text-xs sm:text-sm font-medium">Fotos seleccionadas ({propertyImages.length})</h4>
                           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                           {propertyImages.map((image, index) => (
                             <div key={index} className="relative group">
                               <img
                                 src={image.preview}
                                 alt={`Foto ${index + 1}`}
                                 className="w-full h-24 object-cover rounded-lg border"
                               />
                                {/* Botón eliminar foto removido */}
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                   </TabsContent>
                </Tabs>
                
                {/* Botón Principal para Realizar Valuación - Siempre visible */}
                <div className="mt-6 space-y-4">
                  <Button 
                    onClick={calculateValuation}
                    disabled={isCalculating}
                    size="lg"
                    className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isCalculating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Calculando Valuación...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        <span>REALIZAR VALUACIÓN</span>
                      </div>
                    )}
                  </Button>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Método: Comparables internacionales (IVS/RICS)</p>
                    <p>✓ Avalúo profesional con estándares IVS/RICS</p>
                    <p>✓ Certificación internacional</p>
                  </div>
                </div>
              </CardContent>
          </Card>
        </div>

        {/* Panel de Resultados */}
        <div className="lg:col-span-1" data-results-panel>
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary to-real-estate-accent text-secondary-foreground p-3 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">{translations[selectedLanguage].valuationResultsTitle}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {valuation ? (
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-muted-foreground">{translations[selectedLanguage].estimatedValue}</h3>
                   <p className="text-2xl sm:text-3xl font-bold text-primary leading-tight break-words">
                     {formatCurrency(valuation || 0, selectedCurrency)}
                   </p>
                    <Badge variant="secondary" className="mt-1 sm:mt-2">{selectedCurrency.code}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Método: Comparables internacionales (IVS/RICS)</p>
                    
                    {/* Mostrar información del ajuste si existe */}
                    {priceAdjustment !== 0 && baseValuation && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">{translations[selectedLanguage].originalBaseValue}:</p>
                        <p className="text-sm font-medium">{formatCurrency(baseValuation, selectedCurrency)}</p>
                        <Badge variant={priceAdjustment > 0 ? "default" : "destructive"} className="mt-1">
                          {translations[selectedLanguage].adjustmentLabel}: {priceAdjustment > 0 ? '+' : ''}{priceAdjustment}%
                        </Badge>
                      </div>
                     )}
                   </div>
                   
                   {/* Mostrar imágenes si existen */}
                   {propertyImages.length > 0 && (
                     <div className="space-y-2">
                       <h4 className="text-sm font-medium">{translations[selectedLanguage].photos}</h4>
                       <div className="grid grid-cols-2 gap-2">
                         {propertyImages.slice(0, 4).map((image, index) => (
                           <img
                             key={index}
                             src={image.preview}
                             alt={`Foto ${index + 1}`}
                             className="w-full h-16 object-cover rounded border"
                           />
                         ))}
                       </div>
                       {propertyImages.length > 4 && (
                         <p className="text-xs text-muted-foreground">
                           +{propertyImages.length - 4} fotos más
                         </p>
                       )}
                     </div>
                   )}
                   
                     <div className="space-y-2 text-sm">
                    {propertyData.direccionCompleta && (
                      <div className="flex justify-between">
                        <span>{translations[selectedLanguage].locationLabel}:</span>
                        <span className="font-medium text-xs">
                          {propertyData.direccionCompleta.length > 30 
                            ? `${propertyData.direccionCompleta.substring(0, 30)}...` 
                            : propertyData.direccionCompleta
                          }
                        </span>
                      </div>
                    )}
                    
                    {/* Información de Áreas */}
                    <div className="border-t pt-2 mt-3">
                      <h4 className="text-sm font-medium mb-2">Áreas de la Propiedad</h4>
                      
                      {/* Área de Construcción (para todas las propiedades excepto terrenos) */}
                      {propertyData.tipoPropiedad !== 'terreno' && (
                        <div className="flex justify-between">
                          <span>Área de Construcción:</span>
                          <span className="font-medium">
                            {propertyData.tipoPropiedad === 'apartamento' 
                              ? (propertyData.areaApartamento || 0)
                              : (
                                  (propertyData.areaSotano || 0) +
                                  (propertyData.areaPrimerNivel || 0) +
                                  (propertyData.areaSegundoNivel || 0) +
                                  (propertyData.areaTercerNivel || 0) +
                                  (propertyData.areaCuartoNivel || 0)
                                )
                            } m²
                          </span>
                        </div>
                      )}
                      
                      {/* Área de Terreno */}
                      <div className="flex justify-between">
                        <span>Área de Terreno:</span>
                        <span className="font-medium">{propertyData.areaTerreno || 0} m²</span>
                      </div>
                    </div>
                    
                    {/* Información de Espacios y Características */}
                    <div className="border-t pt-2 mt-3">
                      <h4 className="text-sm font-medium mb-2">Espacios y Características</h4>
                      
                      {/* Espacios Habitacionales */}
                      {propertyData.tipoPropiedad !== 'terreno' && (
                        <>
                          {propertyData.recamaras > 0 && (
                            <div className="flex justify-between">
                              <span>Recámaras:</span>
                              <span className="font-medium">{propertyData.recamaras}</span>
                            </div>
                          )}
                          
                          {propertyData.banos > 0 && (
                            <div className="flex justify-between">
                              <span>Baños:</span>
                              <span className="font-medium">{propertyData.banos}</span>
                            </div>
                          )}
                          
                          {propertyData.salas > 0 && (
                            <div className="flex justify-between">
                              <span>Salas:</span>
                              <span className="font-medium">{propertyData.salas}</span>
                            </div>
                          )}
                          
                          {propertyData.cochera > 0 && (
                            <div className="flex justify-between">
                              <span>Cocheras:</span>
                              <span className="font-medium">{propertyData.cochera}</span>
                            </div>
                          )}
                          
                          {propertyData.cocina > 0 && (
                            <div className="flex justify-between">
                              <span>Cocinas:</span>
                              <span className="font-medium">{propertyData.cocina}</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {/* Antigüedad */}
                      {propertyData.antiguedad > 0 && (
                        <div className="flex justify-between">
                          <span>Antigüedad:</span>
                          <span className="font-medium">{propertyData.antiguedad} años</span>
                        </div>
                      )}
                      
                      {/* Estado y Ubicación */}
                      {propertyData.estadoGeneral && (
                        <div className="flex justify-between">
                          <span>Estado:</span>
                          <span className="font-medium text-xs">
                            {propertyData.estadoGeneral === 'nuevo' ? 'Excelente' :
                             propertyData.estadoGeneral === 'good' ? 'Bueno' :
                             propertyData.estadoGeneral === 'regular' ? 'Regular' :
                             propertyData.estadoGeneral}
                          </span>
                        </div>
                      )}
                      
                      {propertyData.ubicacion && (
                        <div className="flex justify-between">
                          <span>Calidad Ubicación:</span>
                          <span className="font-medium text-xs">
                            {propertyData.ubicacion === 'excelente' ? 'Excelente' :
                             propertyData.ubicacion === 'buena' ? 'Buena' :
                             propertyData.ubicacion === 'regular' ? 'Regular' :
                             propertyData.ubicacion === 'mala' ? 'Mala' :
                             propertyData.ubicacion}
                          </span>
                        </div>
                      )}
                    </div>
                     </div>
                   
                      
                  </div>
              ) : (
                <div className="text-center py-8 space-y-6">
                  <div>
                    <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  </div>
                  
                  {/* Botón Principal para Realizar Valuación */}
                  <div className="space-y-4">
                    <Button 
                      onClick={calculateValuation}
                      disabled={isCalculating}
                      size="lg"
                      className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isCalculating ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          <span>Calculando Valuación...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Calculator className="h-5 w-5" />
                          <span>REALIZAR VALUACIÓN</span>
                        </div>
                      )}
                    </Button>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>✓ Método: Comparables internacionales (IVS/RICS)</p>
                      <p>✓ Avalúo profesional con estándares IVS/RICS</p>
                      <p>✓ Certificación internacional</p>
                    </div>
                  </div>
                </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Demo Walkthrough */}
      {showDemo && <DemoWalkthrough onClose={handleCloseDemo} />}
    </div>
  );
};

export default PropertyValuation;