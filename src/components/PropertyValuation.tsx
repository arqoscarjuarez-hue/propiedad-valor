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
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp, FileText, Download, Camera, Trash2, Play } from 'lucide-react';
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
import LocationMap from './LocationMap';
import GoogleLocationMap from './GoogleLocationMap';
import SupabaseGoogleLocationMap from './SupabaseGoogleLocationMap';
import SimpleLocationMap from './SimpleLocationMap';
import CurrencySelector, { Currency, formatCurrency } from './CurrencySelector';


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
    valuation: 'Valuación',
    
    // Sección de áreas
    constructionAreas: 'Áreas de Construcción (m²)',
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
    apartment: 'Departamento',
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
    excellentZone: 'EXCELENTE - Zona de alta plusvalía, servicios completos',
    goodZone: 'BUENA - Zona establecida con buenos servicios y acceso',
    regularZone: 'REGULAR - Zona en desarrollo, servicios básicos',
    badZone: 'MALA - Zona con limitaciones de servicios o acceso',
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
    
    // Summary sections
    spacesSummary: 'Resumen de Espacios:',
    characteristicsSummary: 'Resumen de Características:',
    servicesSummary: 'Resumen de Servicios:',
    basicServicesSummary: 'Básicos:',
    additionalServicesSummary: 'Adicionales:',
    propertyAge: 'Antigüedad:',
    propertyLocation: 'Ubicación:',
    propertyCondition: 'Estado:',
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
     clickOnMap: 'Haz clic en el mapa para seleccionar la ubicación exacta de la propiedad',
     currentAddress: 'Dirección actual',
     locationSketch: 'Croquis de Ubicación',
     viewMap: 'Ver Mapa',
     editData: 'Editar Datos',
     mapInstructions: 'Marca la ubicación exacta de la propiedad en el mapa. Esto ayudará a proporcionar una valuación más precisa.',
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
    apartmentValuation: 'VALUACIÓN DE DEPARTAMENTO',
    landValuation: 'VALUACIÓN DE TERRENO',
    commercialValuation: 'VALUACIÓN COMERCIAL',
    residentialSubtitle: 'Avalúo Profesional de Casa Habitación',
    apartmentSubtitle: 'Avalúo Profesional de Unidad Habitacional',
    landSubtitle: 'Avalúo Profesional de Superficie',
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
     
     // Disclaimer
     disclaimerText: 'Esta valuación es un estimado basado en los datos proporcionados. Se recomienda consultar con un perito valuador certificado para valuaciones oficiales.'
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
    excellentZone: 'EXCELLENT - High value area, complete services',
    goodZone: 'GOOD - Established area with good services and access',
    regularZone: 'REGULAR - Developing area, basic services', 
    badZone: 'POOR - Area with limited services or access',
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
    
    // Summary sections
    spacesSummary: 'Spaces Summary:',
    characteristicsSummary: 'Characteristics Summary:',
    servicesSummary: 'Services Summary:',
    basicServicesSummary: 'Basic:',
    additionalServicesSummary: 'Additional:',
    propertyAge: 'Age:',
    propertyLocation: 'Location:',
    propertyCondition: 'Condition:',
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
    clickOnMap: 'Click on the map to select the exact location of the property',
    currentAddress: 'Current address',
    locationSketch: 'Location Sketch',
    viewMap: 'View Map',
    editData: 'Edit Data',
    mapInstructions: 'Mark the exact location of the property on the map. This will help provide a more accurate valuation.',
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
    landSubtitle: 'Professional Land Surface Appraisal',
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
     
     // Disclaimer
     disclaimerText: 'This valuation is an estimate based on the provided data. It is recommended to consult with a certified appraiser for official valuations.'
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
    
    // Summary sections
    spacesSummary: 'Résumé des Espaces:',
    characteristicsSummary: 'Résumé des Caractéristiques:',
    servicesSummary: 'Résumé des Services:',
    basicServicesSummary: 'De base:',
    additionalServicesSummary: 'Supplémentaires:',
    propertyAge: 'Âge:',
    propertyLocation: 'Emplacement:',
    propertyCondition: 'État:',
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
    clickOnMap: 'Cliquez sur la carte pour sélectionner l\'emplacement exact de la propriété',
    currentAddress: 'Adresse actuelle',
    locationSketch: 'Croquis de Localisation',
    viewMap: 'Voir la Carte',
    editData: 'Modifier les Données',
    mapInstructions: 'Marquez l\'emplacement exact de la propriété sur la carte. Cela aidera à fournir une évaluation plus précise.',
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
    landSubtitle: 'Expertise Professionnelle de Surface',
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
     
     // Disclaimer
     disclaimerText: 'Cette évaluation est une estimation basée sur les données fournies. Il est recommandé de consulter un évaluateur certifié pour les évaluations officielles.'
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
    
    // Summary sections
    spacesSummary: 'Raumzusammenfassung:',
    characteristicsSummary: 'Merkmalszusammenfassung:',
    servicesSummary: 'Dienstleistungszusammenfassung:',
    basicServicesSummary: 'Grundlegend:',
    additionalServicesSummary: 'Zusätzlich:',
    propertyAge: 'Alter:',
    propertyLocation: 'Lage:',
    propertyCondition: 'Zustand:',
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
    clickOnMap: 'Klicken Sie auf die Karte, um den genauen Standort der Immobilie auszuwählen',
    currentAddress: 'Aktuelle Adresse',
    locationSketch: 'Standortskizze',
    viewMap: 'Karte Anzeigen',
    editData: 'Daten Bearbeiten',
    mapInstructions: 'Markieren Sie den genauen Standort der Immobilie auf der Karte. Dies hilft bei einer genaueren Bewertung.',
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
    landSubtitle: 'Professionelle Flächenbewertung',
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
     
     // Disclaimer
     disclaimerText: 'Diese Bewertung ist eine Schätzung basierend auf den bereitgestellten Daten. Es wird empfohlen, einen zertifizierten Gutachter für offizielle Bewertungen zu konsultieren.'
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
    
    // Summary sections
    spacesSummary: 'Riassunto Spazi:',
    characteristicsSummary: 'Riassunto Caratteristiche:',
    servicesSummary: 'Riassunto Servizi:',
    basicServicesSummary: 'Base:',
    additionalServicesSummary: 'Aggiuntivi:',
    propertyAge: 'Età:',
    propertyLocation: 'Posizione:',
    propertyCondition: 'Condizione:',
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
    clickOnMap: 'Clicca sulla mappa per selezionare la posizione esatta della proprietà',
    currentAddress: 'Indirizzo attuale',
    
    locationSketch: 'Schizzo della Posizione',
    viewMap: 'Visualizza Mappa',
    editData: 'Modifica Dati',
    mapInstructions: 'Contrassegna la posizione esatta della proprietà sulla mappa. Questo aiuterà a fornire una valutazione più accurata.',
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
    landSubtitle: 'Perizia Professionale di Superficie',
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
     
     // Disclaimer
     disclaimerText: 'Questa valutazione è una stima basata sui dati forniti. Si raccomanda di consultare un perito certificato per valutazioni ufficiali.'
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
    
    // Summary sections
    spacesSummary: 'Resumo de Espaços:',
    characteristicsSummary: 'Resumo de Características:',
    servicesSummary: 'Resumo de Serviços:',
    basicServicesSummary: 'Básicos:',
    additionalServicesSummary: 'Adicionais:',
    propertyAge: 'Idade:',
    propertyLocation: 'Localização:',
    propertyCondition: 'Condição:',
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
    clickOnMap: 'Clique no mapa para selecionar a localização exata da propriedade',
    currentAddress: 'Endereço atual',
    locationSketch: 'Esboço de Localização',
    viewMap: 'Ver Mapa',
    editData: 'Editar Dados',
    mapInstructions: 'Marque a localização exata da propriedade no mapa. Isso ajudará a fornecer uma avaliação mais precisa.',
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
    landSubtitle: 'Laudo Profissional de Superfície',
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
     
     // Disclaimer
     disclaimerText: 'Esta avaliação é uma estimativa baseada nos dados fornecidos. Recomenda-se consultar um avaliador certificado para avaliações oficiais.'
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
}

const PropertyValuation = () => {
  const { toast } = useToast();
  
  // Cargar datos del último avalúo desde localStorage
  const loadSavedData = () => {
    try {
      const savedData = localStorage.getItem('lastPropertyValuation');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return parsed.propertyData || null;
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
    return null;
  };

  const savedPropertyData = loadSavedData();
  
  const [propertyData, setPropertyData] = useState<PropertyData>(savedPropertyData || {
    areaSotano: 0,
    areaPrimerNivel: 120,
    areaSegundoNivel: 100,
    areaTercerNivel: 0,
    areaCuartoNivel: 0,
    areaTerreno: 200,
    tipoPropiedad: 'casa',
    recamaras: 3,
    salas: 2,
    comedor: 1,
    cocina: 1,
    bodega: 1,
    areaServicio: 1,
    cochera: 2,
    banos: 2,
    otros: 1,
    antiguedad: 5,
    ubicacion: 'good',
    estadoGeneral: 'good',
    latitud: 19.4326,
    longitud: -99.1332,
    direccionCompleta: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
    servicios: {
      agua: true,
      electricidad: true,
      gas: true,
      drenaje: true,
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
      tinaco: true,
    }
  });
  
  const [valuation, setValuation] = useState<number | null>(2850000);
  const [baseValuation, setBaseValuation] = useState<number | null>(2850000);
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0);
  const [multipleValuations, setMultipleValuations] = useState<Array<{
    id: number;
    valor: number;
    comparatives: ComparativeProperty[];
  }>>([
    {
      id: 1,
      valor: 2850000,
      comparatives: [
        {
          id: '1',
          address: 'Av. Insurgentes Sur 1200, Del Valle',
          areaConstruida: 180,
          areaTerreno: 180,
          tipoPropiedad: 'casa',
          recamaras: 3,
          banos: 2,
          antiguedad: 4,
          ubicacion: 'excellent',
          estadoGeneral: 'good',
          precio: 2950000,
          distancia: 150,
          descripcion: 'Casa moderna en excelente zona',
          latitud: 19.4320,
          longitud: -99.1330
        },
        {
          id: '2',
          address: 'Calle Medellin 123, Roma Norte',
          areaConstruida: 200,
          areaTerreno: 220,
          tipoPropiedad: 'casa',
          recamaras: 3,
          banos: 2,
          antiguedad: 6,
          ubicacion: 'excellent',
          estadoGeneral: 'good',
          precio: 3200000,
          distancia: 450,
          descripcion: 'Casa estilo colonial renovada',
          latitud: 19.4180,
          longitud: -99.1320
        },
        {
          id: '3',
          address: 'Av. Patriotismo 890, San Pedro de los Pinos',
          areaConstruida: 170,
          areaTerreno: 190,
          tipoPropiedad: 'casa',
          recamaras: 2,
          banos: 2,
          antiguedad: 7,
          ubicacion: 'good',
          estadoGeneral: 'medium',
          precio: 2400000,
          distancia: 680,
          descripcion: 'Casa tradicional con jardín',
          latitud: 19.4280,
          longitud: -99.1380
        }
      ]
    }
  ]);
  const [comparativeProperties, setComparativeProperties] = useState<ComparativeProperty[]>([
    {
      id: '1',
      address: 'Av. Insurgentes Sur 1200, Del Valle',
      areaConstruida: 180,
      areaTerreno: 180,
      tipoPropiedad: 'casa',
      recamaras: 3,
      banos: 2,
      antiguedad: 4,
      ubicacion: 'excellent',
      estadoGeneral: 'good',
      precio: 2950000,
      distancia: 150,
      descripcion: 'Casa moderna en excelente zona',
      latitud: 19.4320,
      longitud: -99.1330
    },
    {
      id: '2',
      address: 'Calle Medellin 123, Roma Norte',
      areaConstruida: 200,
      areaTerreno: 220,
      tipoPropiedad: 'casa',
      recamaras: 3,
      banos: 2,
      antiguedad: 6,
      ubicacion: 'excellent',
      estadoGeneral: 'good',
      precio: 3200000,
      distancia: 450,
      descripcion: 'Casa estilo colonial renovada',
      latitud: 19.4180,
      longitud: -99.1320
    },
    {
      id: '3',
      address: 'Av. Patriotismo 890, San Pedro de los Pinos',
      areaConstruida: 170,
      areaTerreno: 190,
      tipoPropiedad: 'casa',
      recamaras: 2,
      banos: 2,
      antiguedad: 7,
      ubicacion: 'good',
      estadoGeneral: 'medium',
      precio: 2400000,
      distancia: 680,
      descripcion: 'Casa tradicional con jardín',
      latitud: 19.4280,
      longitud: -99.1380
    }
  ]);
  
  // Estados para manejo de comparables
  const [allComparativeProperties, setAllComparativeProperties] = useState<ComparativeProperty[]>([]);
  const [selectedComparatives, setSelectedComparatives] = useState<number[]>([0, 1, 2]); // Por defecto los primeros 3
  
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    rate: 1
  });
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('es');
  const [activeTab, setActiveTab] = useState('areas');
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
    try {
      // Campos que deben mantenerse como string
      const stringFields = ['ubicacion', 'estadoGeneral', 'tipoPropiedad', 'direccion'];
      
      let sanitizedValue = value;
      
      // Solo convertir a número si no es un campo de string
      if (!stringFields.includes(field)) {
        if (typeof value === 'string') {
          const numValue = parseFloat(value);
          sanitizedValue = isNaN(numValue) ? 0 : Math.max(0, numValue);
        } else if (typeof value === 'number') {
          sanitizedValue = isNaN(value) ? 0 : Math.max(0, value);
        }
      }
      
      setPropertyData(prev => ({
        ...prev,
        [field]: sanitizedValue
      }));
    } catch (error) {
      console.error('Error updating property data:', error);
      toast({
        title: translations[selectedLanguage].errorTitle,
        description: translations[selectedLanguage].errorUpdatingData,
        variant: "destructive"
      });
    }
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
        
        // Variación del área de construcción: ±40% como máximo (estándar de valuación)
        const areaVariationFactor = 0.6 + (Math.random() * 0.8); // Entre 0.6 y 1.4 (60% a 140% del área original)
        const areaComparable = Math.round(areaTotal * areaVariationFactor);
        
        // Asegurar que esté dentro del rango ±40%
        const areaMinima = areaTotal * 0.6; // -40%
        const areaMaxima = areaTotal * 1.4; // +40%
        const areaFinal = Math.max(areaMinima, Math.min(areaMaxima, areaComparable));
        
        return {
          id: `comp-${index + 1}`,
          address: addressInfo.address,
          areaConstruida: areaFinal,
          areaTerreno: Math.round(propertyData.areaTerreno * (0.8 + Math.random() * 0.4)), // ±20% para terreno
          tipoPropiedad: propertyData.tipoPropiedad,
          recamaras: Math.max(1, propertyData.recamaras + Math.floor((Math.random() - 0.5) * 2)),
          banos: Math.max(1, propertyData.banos + Math.floor((Math.random() - 0.5) * 2)),
          antiguedad: Math.max(0, propertyData.antiguedad + Math.floor((Math.random() - 0.5) * 8)),
          ubicacion: propertyData.ubicacion,
          estadoGeneral: propertyData.estadoGeneral,
          precio: convertCurrency(baseValue * (1 + variation) * 0.85, selectedCurrency), // Aplicar descuento del 15%
          distancia: addressInfo.distance,
          descripcion: `${propertyData.tipoPropiedad} de ${areaFinal}m² con ${Math.max(1, propertyData.recamaras + Math.floor((Math.random() - 0.5) * 2))} recámaras y ${Math.max(1, propertyData.banos + Math.floor((Math.random() - 0.5) * 2))} baños. ${addressInfo.isReal ? 'Propiedad real encontrada en Google Maps' : 'Propiedad simulada'}.`,
          url: addressInfo.placeId ? `https://www.google.com/maps/place/?q=place_id:${addressInfo.placeId}` : `https://propiedades.com/inmueble/${Math.random().toString(36).substr(2, 9)}`,
          latitud: addressInfo.lat,
          longitud: addressInfo.lng
        };
      } catch (error) {
        console.error('Error procesando comparable:', error);
        // Comparable fallback más simple
        return {
          id: `fallback-comp-${index + 1}`,
          address: `Propiedad ${index + 1}`,
          areaConstruida: areaTotal,
          areaTerreno: propertyData.areaTerreno,
          tipoPropiedad: propertyData.tipoPropiedad,
          recamaras: propertyData.recamaras,
          banos: propertyData.banos,
          antiguedad: propertyData.antiguedad,
          ubicacion: propertyData.ubicacion,
          estadoGeneral: propertyData.estadoGeneral,
          precio: convertCurrency(baseValue * 0.85, selectedCurrency), // Aplicar descuento del 15%
          distancia: 500 + (index * 100),
          descripcion: `Propiedad comparable básica ${index + 1}`,
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
        'departamento': 'departamentos en venta',
        'terreno': 'terrenos en venta',
        'comercial': 'locales comerciales en venta',
        'bodega': 'bodegas en venta'
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
    
    // Calcular precio promedio de comparables
    const precioPromedioComparables = comparables.reduce((sum, comp) => sum + comp.precio, 0) / comparables.length;
    
    // Calcular factor de ajuste basado en comparables (60% valor calculado + 40% promedio comparables)
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
                       (propertyData.areaCuartoNivel || 0);
      
      if (areaTotal <= 0) {
        toast({
          title: translations[selectedLanguage].errorTitle,
          description: translations[selectedLanguage].errorMinimumArea,
          variant: "destructive"
        });
        return;
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
      
      // Bonificación por espacios (convertido a USD)
      const bonificacionEspacios = (propertyData.recamaras * 2800) +   // $2,800 per bedroom
                                  (propertyData.banos * 1600) +        // $1,600 per bathroom
                                  (propertyData.cochera * 2200) +      // $2,200 per garage
                                  (propertyData.salas * 1300) +        // $1,300 per living room
                                  (propertyData.cocina * 1900);        // $1,900 per kitchen
      
      // Calcular penalización por servicios básicos faltantes
      const serviciosBasicos = ['agua', 'electricidad', 'gas', 'drenaje'] as const;
      const serviciosFaltantes = serviciosBasicos.filter(servicio => !propertyData.servicios[servicio]).length;
      const factorServiciosBasicos = 1 - (serviciosFaltantes * 0.04); // -4.0% por cada servicio faltante
      
      // Calcular bonificación por servicios adicionales
      const serviciosAdicionales = ['internet', 'cable', 'telefono', 'seguridad', 'alberca', 'jardin', 'elevador', 'aireAcondicionado', 'calefaccion', 'panelesSolares', 'tinaco'] as const;
      const serviciosAdicionalesPresentes = serviciosAdicionales.filter(servicio => propertyData.servicios[servicio]).length;
      const factorServiciosAdicionales = 1 + (serviciosAdicionalesPresentes * 0.01); // +1.0% por cada servicio adicional
      
      const valorFinal = (valorBase * 
                         (factorUbicacion[propertyData.ubicacion as keyof typeof factorUbicacion] || 1) *
                         (factorEstado[propertyData.estadoGeneral as keyof typeof factorEstado] || 1) *
                         factorAntiguedad *
                         factorServiciosBasicos *
                         factorServiciosAdicionales) + bonificacionEspacios;
      
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
        setAllComparativeProperties(allComparatives);
        // Actualizar las propiedades seleccionadas (los primeros 3)
        const selectedProps = selectedComparatives.map(index => allComparatives[index]).filter(Boolean);
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
          const areaConstruida = Math.max(50, areaTotal + (Math.random() * 50 - 25));
          const precio = valorFinal * (0.9 + Math.random() * 0.2) * 0.85; // Aplicar descuento del 15%
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
        });
        
        setAllComparativeProperties(fallbackComparatives);
        setComparativeProperties(fallbackComparatives);
        
        // Calcular valor final ajustado con comparables de respaldo
        const valorFinalAjustado = calcularValorConComparables(valorFinalEnMonedaSeleccionada, fallbackComparatives);
        const valorAjustado = valorFinalAjustado * (1 + priceAdjustment / 100);
        setValuation(valorAjustado);
      }
      
      // Limpiar múltiples valuaciones ya que ahora solo hacemos una
      setMultipleValuations([]);
      
      // El valorAjustado ya se estableció en el try o catch
      const valorFinalParaToast = valuation || valorFinalEnMonedaSeleccionada;
      toast({
        title: translations[selectedLanguage].valuationCompleted,
        description: `${translations[selectedLanguage].estimatedValueTitle}: ${formatCurrency(valorFinalParaToast, selectedCurrency)} (3 ${translations[selectedLanguage].comparables})`,
      });
    } catch (error) {
      console.error('Error in calculateValuation:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error al calcular la valuación. Por favor intenta nuevamente.",
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
        description: 'Buscando nuevas propiedades comparables cercanas...',
      });

      // Convertir valuación actual de vuelta a USD base para generar comparativas
      const valuationInUSD = selectedCurrency.code === 'USD' ? valuation : valuation / (selectedCurrency.rate || 1);
      const newComparatives = await generateComparativeProperties(valuationInUSD);
      setComparativeProperties(newComparatives);
      toast({
        title: translations[selectedLanguage].comparativesUpdated,
        description: translations[selectedLanguage].newComparativesGenerated,
      });
    }
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
        title: "Error",
        description: "Primero debes calcular la valuación para generar el PDF",
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
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(config.title, pageWidth / 2, 18, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(config.subtitle, pageWidth / 2, 28, { align: "center" });
      doc.text(translations[selectedLanguage].marketAnalysis, pageWidth / 2, 35, { align: "center" });
      
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
      doc.text(propertyData.tipoPropiedad.toUpperCase(), marginLeft + 45, yPosition);
      yPosition += 6;

      doc.setFont("helvetica", "bold");
      doc.text(`${translations[selectedLanguage].totalBuiltArea}:`, marginLeft, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${areaTotal.toLocaleString()} ${translations[selectedLanguage].sqm}`, marginLeft + 50, yPosition);
      yPosition += 6;

      doc.setFont("helvetica", "bold");
      doc.text(`${translations[selectedLanguage].landArea}:`, marginLeft, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${propertyData.areaTerreno.toLocaleString()} ${translations[selectedLanguage].sqm}`, marginLeft + 40, yPosition);
      yPosition += 6;

      doc.setFont("helvetica", "bold");
      doc.text(`${translations[selectedLanguage].age}:`, marginLeft, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${propertyData.antiguedad} ${translations[selectedLanguage].years}`, marginLeft + 30, yPosition);
      yPosition += 6;

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

      doc.setFont("helvetica", "bold");
      doc.text(`${translations[selectedLanguage].generalCondition}:`, marginLeft, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(estadoTexto, marginLeft + 40, yPosition);
      yPosition += 15;

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
          doc.text("Coordenadas:", marginLeft, yPosition);
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

      // SECCIÓN 3: DISTRIBUCIÓN DE ÁREAS
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

      // Área libre
      const areaLibre = propertyData.areaTerreno - areaTotal;
      doc.setFontSize(11);
      doc.text(`Área Libre (sin construir): ${areaLibre > 0 ? areaLibre : 0} ${translations[selectedLanguage].sqm}`, marginLeft + 5, yPosition);
      yPosition += 6;
      
      const coeficienteOcupacion = ((areaTotal / propertyData.areaTerreno) * 100).toFixed(1);
      doc.text(`Coeficiente de Ocupación: ${coeficienteOcupacion}%`, marginLeft + 5, yPosition);
      yPosition += 15;

      // SECCIÓN 4: ESPACIOS Y CARACTERÍSTICAS
      checkNewPage(100);
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`4. ${translations[selectedLanguage].propertySpaces}`, marginLeft, yPosition + 6);
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

      // SECCIÓN 5: SERVICIOS DISPONIBLES
      checkNewPage(80);
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`5. ${translations[selectedLanguage].availableServices}`, marginLeft, yPosition + 6);
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

      // SECCIÓN 6: ANÁLISIS DE MERCADO Y COMPARABLES
      if (comparativeProperties.length > 0) {
        checkNewPage(120);
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft - 2, yPosition - 3, contentWidth + 4, 12, 'F');
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`6. ${translations[selectedLanguage].marketAnalysisTitle}`, marginLeft, yPosition + 6);
        doc.setTextColor(0, 0, 0);
        yPosition += 18;

        const analysis = getMarketAnalysis();
        if (analysis) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("Resumen del Mercado:", marginLeft, yPosition);
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
        doc.text("8. FOTOGRAFÍAS DEL INMUEBLE", marginLeft, yPosition + 6);
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
        doc.text("ANEXO: FICHAS DETALLADAS DE COMPARABLES", marginLeft, yPosition + 6);
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
          doc.text("CARACTERÍSTICAS FÍSICAS:", marginLeft + 5, yPosition);
          yPosition += 8;

          doc.setFont("helvetica", "normal");
          doc.text(`Área Construida: ${comp.areaConstruida} m²`, marginLeft + 10, yPosition);
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
          doc.text(`Precio por m²: ${formatCurrency(comp.precio / comp.areaConstruida, selectedCurrency)}`, marginLeft + 10, yPosition);
          yPosition += 6;

          // Análisis comparativo
          const pricePerM2Property = valuation / areaTotal;
          const pricePerM2Comp = comp.precio / comp.areaConstruida;
          const variance = ((pricePerM2Comp - pricePerM2Property) / pricePerM2Property * 100);
          
          doc.setFont("helvetica", "bold");
          doc.text("ANÁLISIS COMPARATIVO:", marginLeft + 5, yPosition);
          yPosition += 8;

          doc.setFont("helvetica", "normal");
          doc.text(`Diferencia de precio por m²: ${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`, marginLeft + 10, yPosition);
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

      // Guardar PDF
      const fileName = `avaluo-inmobiliario-${Date.now()}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Generado",
        description: "El avalúo completo se ha descargado correctamente",
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
                new TextRun({ text: propertyData.tipoPropiedad.toUpperCase() })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].totalBuiltArea}: `, bold: true }),
                new TextRun({ text: `${areaTotal.toLocaleString()} ${translations[selectedLanguage].sqm}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].landArea}: `, bold: true }),
                new TextRun({ text: `${propertyData.areaTerreno.toLocaleString()} ${translations[selectedLanguage].sqm}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `${translations[selectedLanguage].age}: `, bold: true }),
                new TextRun({ text: `${propertyData.antiguedad} ${translations[selectedLanguage].years}` })
              ]
            }),
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
            }),
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

            // 3. DISTRIBUCIÓN DE ÁREAS CONSTRUIDAS
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
                new TextRun({ text: `${propertyData.areaTerreno - areaTotal > 0 ? propertyData.areaTerreno - areaTotal : 0} m²` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Coeficiente de Ocupación: ", bold: true }),
                new TextRun({ text: `${((areaTotal / propertyData.areaTerreno) * 100).toFixed(1)}%` })
              ]
            }),
            new Paragraph({ text: "" }), // Espacio

            // 4. ESPACIOS Y CARACTERÍSTICAS
            new Paragraph({
              text: `4. ${translations[selectedLanguage].propertySpaces}`,
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
            new Paragraph({ text: "" }), // Espacio

            // 5. SERVICIOS DISPONIBLES
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

            new Paragraph({ text: "" }), // Espacio

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
                text: "ANEXO: FICHAS DETALLADAS DE COMPARABLES",
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
                    new TextRun({ text: "CARACTERÍSTICAS FÍSICAS:", bold: true, underline: {} })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Área Construida: ", bold: true }),
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
                new Paragraph({
                  children: [
                    new TextRun({ text: "Precio por m²: ", bold: true }),
                    new TextRun({ text: formatCurrency(comp.precio / comp.areaConstruida, selectedCurrency) })
                  ]
                }),
                new Paragraph({ text: "" }), // Espacio
                
                // Análisis comparativo
                new Paragraph({
                  children: [
                    new TextRun({ text: "ANÁLISIS COMPARATIVO:", bold: true, underline: {} })
                  ]
                }),
                (() => {
                  const pricePerM2Property = valuation / areaTotal;
                  const pricePerM2Comp = comp.precio / comp.areaConstruida;
                  const variance = ((pricePerM2Comp - pricePerM2Property) / pricePerM2Property * 100);
                  
                  return new Paragraph({
                    children: [
                      new TextRun({ text: "Diferencia de precio por m²: ", bold: true }),
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
                })(),
                new Paragraph({ text: "" }), // Espacio
                new Paragraph({ text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" }), // Separador
                new Paragraph({ text: "" }) // Espacio
              ])
            ] : [])
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
        {/* Selectores de Moneda e Idioma */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
          />
          
           {/* Selector de Idioma */}
           <Card className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
             <Label className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {translations[selectedLanguage].languageSelector}
            </Label>
            <Select value={selectedLanguage} onValueChange={(value: Language) => setSelectedLanguage(value)}>
              <SelectTrigger className="bg-background border-input hover:bg-accent hover:text-accent-foreground focus:ring-ring">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border shadow-md z-[1000] min-w-[200px]">
                <SelectItem value="es" className="hover:bg-accent hover:text-accent-foreground cursor-pointer">🇪🇸 Español</SelectItem>
                <SelectItem value="en" className="hover:bg-accent hover:text-accent-foreground cursor-pointer">🇺🇸 English</SelectItem>
                <SelectItem value="fr" className="hover:bg-accent hover:text-accent-foreground cursor-pointer">🇫🇷 Français</SelectItem>
                <SelectItem value="de" className="hover:bg-accent hover:text-accent-foreground cursor-pointer">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="it" className="hover:bg-accent hover:text-accent-foreground cursor-pointer">🇮🇹 Italiano</SelectItem>
                <SelectItem value="pt" className="hover:bg-accent hover:text-accent-foreground cursor-pointer">🇵🇹 Português</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Toda la interfaz y reportes se traducen automáticamente
            </p>
          </Card>
          
           {/* Botones de Descarga de Documentos */}
           {valuation && (
             <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
               <Label className="text-xs sm:text-sm font-bold mb-2 sm:mb-3 block text-green-900 dark:text-green-100 flex items-center gap-2">
                 <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                 Descargar Documentos
               </Label>
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
          {valuation && (
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  ¿Necesitas ayuda para usar el sistema?
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleShowDemo}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                   {translations[selectedLanguage].viewDemo}
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                {translations[selectedLanguage].propertyData}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <Tabs value={activeTab} onValueChange={(newValue) => {
                try {
                  setActiveTab(newValue);
                } catch (error) {
                  console.error('Error changing tab:', error);
                  // Fallback al tab de áreas si hay error
                  setActiveTab('areas');
                }
              }} className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 grid-rows-4 sm:grid-rows-2 h-auto gap-1 bg-muted/50">
                   <TabsTrigger 
                     value="areas" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].areas}
                   </TabsTrigger>
                   <TabsTrigger 
                     value="tipo" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].propertyType}
                   </TabsTrigger>
                   <TabsTrigger 
                     value="espacios" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].spaces}
                   </TabsTrigger>
                   <TabsTrigger 
                     value="caracteristicas" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].characteristics}
                   </TabsTrigger>
                   <TabsTrigger 
                     value="servicios" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].services}
                   </TabsTrigger>
                   <TabsTrigger 
                     value="ubicacion" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].location}
                   </TabsTrigger>
                   <TabsTrigger 
                     value="fotos" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].photos}
                   </TabsTrigger>
                   <TabsTrigger 
                     value="ajustes" 
                     className="h-8 sm:h-10 text-xs sm:text-sm touch-manipulation bg-background hover:bg-muted/80 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                   >
                     {translations[selectedLanguage].valuation}
                   </TabsTrigger>
                  </TabsList>

                 <TabsContent value="areas" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">{translations[selectedLanguage].constructionAreas}</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                     <div>
                       <Label htmlFor="areaSotano">{translations[selectedLanguage].basement}</Label>
                       <Input
                         id="areaSotano"
                         type="number"
                         value={propertyData.areaSotano || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleInputChange('areaSotano', value === '' ? 0 : parseFloat(value) || 0);
                          }}
                         placeholder="0"
                       />
                     </div>
                     <div>
                        <Label htmlFor="areaPrimerNivel">{translations[selectedLanguage].firstFloor}</Label>
                        <Input
                          id="areaPrimerNivel"
                          type="number"
                          value={propertyData.areaPrimerNivel || ''}
                           onChange={(e) => {
                             const value = e.target.value;
                             handleInputChange('areaPrimerNivel', value === '' ? 0 : parseFloat(value) || 0);
                           }}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaSegundoNivel">{translations[selectedLanguage].secondFloor}</Label>
                        <Input
                          id="areaSegundoNivel"
                          type="number"
                          value={propertyData.areaSegundoNivel || ''}
                           onChange={(e) => {
                             const value = e.target.value;
                             handleInputChange('areaSegundoNivel', value === '' ? 0 : parseFloat(value) || 0);
                           }}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaTercerNivel">{translations[selectedLanguage].thirdFloor}</Label>
                        <Input
                          id="areaTercerNivel"
                          type="number"
                          value={propertyData.areaTercerNivel || ''}
                           onChange={(e) => {
                             const value = e.target.value;
                             handleInputChange('areaTercerNivel', value === '' ? 0 : parseFloat(value) || 0);
                           }}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaCuartoNivel">{translations[selectedLanguage].fourthFloor}</Label>
                        <Input
                          id="areaCuartoNivel"
                          type="number"
                          value={propertyData.areaCuartoNivel || ''}
                           onChange={(e) => {
                             const value = e.target.value;
                             handleInputChange('areaCuartoNivel', value === '' ? 0 : parseFloat(value) || 0);
                           }}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaTerreno">{translations[selectedLanguage].landArea}</Label>
                       <Input
                         id="areaTerreno"
                         type="number"
                         value={propertyData.areaTerreno || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleInputChange('areaTerreno', value === '' ? 0 : parseFloat(value) || 0);
                          }}
                         placeholder="0"
                       />
                     </div>
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
                       <SelectItem value="terreno">{translations[selectedLanguage].land}</SelectItem>
                       <SelectItem value="comercial">{translations[selectedLanguage].commercial}</SelectItem>
                       <SelectItem value="bodega">{translations[selectedLanguage].warehouse}</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>

                 <TabsContent value="espacios" className="space-y-4 mt-6 px-1">
                    <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].spacesDistribution}</h3>
                    
                    {/* Espacios Habitacionales */}
                    <div className="mb-6">
                      <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].livingSpaces}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {[
                          { key: 'recamaras', label: translations[selectedLanguage].bedrooms, description: translations[selectedLanguage].bedroomsDescription },
                          { key: 'salas', label: translations[selectedLanguage].livingRooms, description: translations[selectedLanguage].livingRoomsDescription },
                          { key: 'comedor', label: translations[selectedLanguage].diningRoom, description: translations[selectedLanguage].diningRoomDescription },
                          { key: 'banos', label: translations[selectedLanguage].bathrooms, description: translations[selectedLanguage].bathroomsDescription }
                         ].map(({ key, label, description }) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="text-sm font-medium block">{label}</Label>
                            <Input
                              id={key}
                              type="number"
                              value={propertyData[key as keyof Omit<PropertyData, 'servicios'>] || ''}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 handleInputChange(key as keyof PropertyData, value === '' ? 0 : parseFloat(value) || 0);
                               }}
                              placeholder="0"
                              className="text-center h-10"
                              min="0"
                              step="1"
                            />
                            <p className="text-xs text-muted-foreground leading-tight">{description}</p>
                          </div>
                        ))}
                     </div>
                   </div>

                   {/* Espacios de Servicio */}
                   <div className="mb-6">
                     <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].serviceSpaces}</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {[
                          { key: 'cocina', label: translations[selectedLanguage].kitchen, description: translations[selectedLanguage].kitchenDescription },
                          { key: 'areaServicio', label: translations[selectedLanguage].serviceArea, description: translations[selectedLanguage].serviceAreaDescription },
                          { key: 'bodega', label: translations[selectedLanguage].storage, description: translations[selectedLanguage].storageDescription },
                          { key: 'cochera', label: translations[selectedLanguage].garage, description: translations[selectedLanguage].garageDescription }
                        ].map(({ key, label, description }) => (
                          <div key={key} className="space-y-2">
                            <Label htmlFor={key} className="text-sm font-medium block">{label}</Label>
                            <Input
                              id={key}
                              type="number"
                              value={propertyData[key as keyof Omit<PropertyData, 'servicios'>] || ''}
                               onChange={(e) => {
                                 const value = e.target.value;
                                 handleInputChange(key as keyof PropertyData, value === '' ? 0 : parseFloat(value) || 0);
                               }}
                              placeholder="0"
                              className="text-center h-10"
                              min="0"
                              step="1"
                            />
                            <p className="text-xs text-muted-foreground leading-tight">{description}</p>
                          </div>
                        ))}
                     </div>
                   </div>

                   {/* Espacios Adicionales */}
                   <div className="mb-6">
                     <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].additionalSpaces}</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                       <div className="space-y-2">
                         <Label htmlFor="otros" className="text-sm font-medium block">{translations[selectedLanguage].others}</Label>
                         <Input
                           id="otros"
                           type="number"
                           value={propertyData.otros || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleInputChange('otros', value === '' ? 0 : parseFloat(value) || 0);
                            }}
                           placeholder="0"
                           className="text-center h-10"
                           min="0"
                           step="1"
                         />
                         <p className="text-xs text-muted-foreground leading-tight">{translations[selectedLanguage].othersDescription}</p>
                       </div>
                     </div>
                   </div>

                   {/* Resumen de espacios */}
                   <div className="bg-muted p-3 sm:p-4 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3">{translations[selectedLanguage].spacesSummary}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between py-1">
                          <span>Total {translations[selectedLanguage].bedrooms}:</span>
                          <span className="font-medium">{propertyData.recamaras}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Total {translations[selectedLanguage].bathrooms}:</span>
                          <span className="font-medium">{propertyData.banos}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>Total {translations[selectedLanguage].livingRooms}:</span>
                          <span className="font-medium">{propertyData.salas}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>{translations[selectedLanguage].garage}:</span>
                          <span className="font-medium">{propertyData.cochera}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>{translations[selectedLanguage].serviceSpaces}:</span>
                          <span className="font-medium">{propertyData.areaServicio + propertyData.bodega}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span>{translations[selectedLanguage].others}:</span>
                          <span className="font-medium">{propertyData.otros}</span>
                        </div>
                     </div>
                   </div>
                </TabsContent>

                <TabsContent value="caracteristicas" className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].characteristics}</h3>
                  
                  {/* Información Temporal */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].temporalInfo}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="antiguedad" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {translations[selectedLanguage].constructionAge} ({translations[selectedLanguage].years})
                        </Label>
                        <Input
                          id="antiguedad"
                          type="number"
                          value={propertyData.antiguedad || ''}
                           onChange={(e) => {
                             const value = e.target.value;
                             handleInputChange('antiguedad', value === '' ? 0 : parseFloat(value) || 0);
                           }}
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">{translations[selectedLanguage].yearsSinceConstruction}</p>
                      </div>
                    </div>
                  </div>

                  {/* Calidad y Estado */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].qualityAndCondition}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                           {translations[selectedLanguage].locationQuality}
                        </Label>
                         <Select 
                           value={propertyData.ubicacion} 
                           onValueChange={(value) => {
                             
                             handleInputChange('ubicacion', value);
                           }}
                         >
                          <SelectTrigger>
                            <SelectValue placeholder={translations[selectedLanguage].locationQualityPlaceholder} />
                          </SelectTrigger>
            <SelectContent>
               <SelectItem value="excelente">{translations[selectedLanguage].excellentZone}</SelectItem>
               <SelectItem value="buena">{translations[selectedLanguage].goodZone}</SelectItem>
               <SelectItem value="regular">{translations[selectedLanguage].regularZone}</SelectItem>
               <SelectItem value="mala">{translations[selectedLanguage].badZone}</SelectItem>
            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">{translations[selectedLanguage].evaluateServices}</p>
                      </div>
                      
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
                    </div>
                  </div>

                  {/* Resumen de características */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">{translations[selectedLanguage].characteristicsSummary}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">{translations[selectedLanguage].propertyAge}</span> {propertyData.antiguedad} {translations[selectedLanguage].years}
                      </div>
                      <div>
                        <span className="font-medium">{translations[selectedLanguage].propertyLocation}</span> {propertyData.ubicacion || translations[selectedLanguage].notSpecified}
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">{translations[selectedLanguage].propertyCondition}</span> {propertyData.estadoGeneral || translations[selectedLanguage].noSpecified}
                      </div>
                    </div>
                  </div>
                 </TabsContent>

                 <TabsContent value="servicios" className="space-y-4 mt-6">
                   <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].availableServices}</h3>
                   
                   {/* Servicios Básicos */}
                   <div className="mb-6">
                     <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].basicServices}</h4>
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

                   {/* Servicios Adicionales */}
                   <div className="mb-6">
                     <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].additionalServices}</h4>
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
                   </div>

                   {/* Resumen de servicios */}
                   <div className="bg-muted p-4 rounded-lg">
                     <h4 className="text-sm font-semibold mb-2">{translations[selectedLanguage].servicesSummary}</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                       <div className="flex justify-between">
                         <span>{translations[selectedLanguage].basicServicesSummary}</span>
                         <span className="font-medium">
                           {[propertyData.servicios.agua, propertyData.servicios.electricidad, propertyData.servicios.gas, propertyData.servicios.drenaje].filter(Boolean).length}/4
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span>Comunicación:</span>
                         <span className="font-medium">
                           {[propertyData.servicios.internet, propertyData.servicios.cable, propertyData.servicios.telefono].filter(Boolean).length}/3
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span>Comodidades:</span>
                         <span className="font-medium">
                           {[propertyData.servicios.alberca, propertyData.servicios.jardin, propertyData.servicios.elevador, propertyData.servicios.aireAcondicionado, propertyData.servicios.calefaccion].filter(Boolean).length}/5
                         </span>
                       </div>
                       <div className="flex justify-between">
                         <span>Especiales:</span>
                         <span className="font-medium">
                           {[propertyData.servicios.seguridad, propertyData.servicios.panelesSolares, propertyData.servicios.tinaco].filter(Boolean).length}/3
                         </span>
                       </div>
                     </div>
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
                     Fotos del Inmueble (Opcional)
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
                               <Button
                                 variant="destructive"
                                 size="sm"
                                 className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                 onClick={() => removeImage(index)}
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                  </TabsContent>

                   <TabsContent value="ajustes" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                     <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                       <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                       Ajuste de Precio
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ajusta el valor del avalúo hasta en un ±30% según consideraciones especiales del mercado o características únicas de la propiedad.
                    </p>
                    
                    <div className="space-y-6">
                      {/* Mostrar valores solo si hay valuación */}
                      {baseValuation && (
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Valor Base (Original)</Label>
                              <p className="text-lg font-bold text-foreground">
                                {formatCurrency(baseValuation, selectedCurrency)}
                              </p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Valor Ajustado</Label>
                              <p className="text-xl font-bold text-primary">
                                {formatCurrency(valuation || 0, selectedCurrency)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <Badge variant={priceAdjustment > 0 ? "default" : priceAdjustment < 0 ? "destructive" : "secondary"}>
                              {priceAdjustment > 0 ? '+' : ''}{priceAdjustment}% de ajuste
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Control de ajuste */}
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="price-adjustment" className="text-sm font-medium">
                            Porcentaje de Ajuste: {priceAdjustment > 0 ? '+' : ''}{priceAdjustment}%
                          </Label>
                          <div className="mt-2">
                            <input
                              type="range"
                              id="price-adjustment"
                              min="-30"
                              max="30"
                              step="1"
                              value={priceAdjustment}
                               onChange={(e) => {
                                 const value = parseFloat(e.target.value);
                                 if (!isNaN(value)) {
                                   handlePriceAdjustment(Math.max(-30, Math.min(30, value)));
                                 }
                               }}
                              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>-30%</span>
                            <span>0%</span>
                            <span>+30%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePriceAdjustment(-10)}
                            className="text-xs h-8 sm:h-auto"
                          >
                            -10%
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePriceAdjustment(0)}
                            className="text-xs h-8 sm:h-auto"
                          >
                            Reset 0%
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePriceAdjustment(10)}
                            className="text-xs h-8 sm:h-auto"
                          >
                            +10%
                          </Button>
                        </div>
                      </div>

                      {/* Información del ajuste */}
                      <div className="text-xs text-muted-foreground space-y-2">
                        <p><strong>Cuándo ajustar hacia arriba (+):</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Características premium únicas</li>
                          <li>Ubicación excepcional en la zona</li>
                          <li>Acabados de lujo o renovaciones recientes</li>
                          <li>Mercado inmobiliario en alza</li>
                        </ul>
                        
                        <p><strong>Cuándo ajustar hacia abajo (-):</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Defectos estructurales o problemas ocultos</li>
                          <li>Necesidad urgente de venta</li>
                          <li>Mercado inmobiliario en baja</li>
                          <li>Factores externos negativos (ruido, contaminación)</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>

                </Tabs>
              
              <div className="mt-6 sm:mt-8 pt-3 sm:pt-4 border-t">
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isCalculating) {
                      calculateValuation();
                    }
                  }} 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity h-12 sm:h-auto text-sm sm:text-base touch-manipulation"
                  size="lg"
                  disabled={isCalculating}
                >
                  <Calculator className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  {isCalculating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculando...
                    </>
                  ) : (
                    translations[selectedLanguage].calculate
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Resultados */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary to-real-estate-accent text-secondary-foreground p-3 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Resultado de Valuación</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              {valuation && valuation > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <h3 className="text-base sm:text-lg font-semibold text-muted-foreground">{translations[selectedLanguage].estimatedValue}</h3>
                    <p className="text-2xl sm:text-3xl font-bold text-primary leading-tight break-words">
                      {formatCurrency(valuation, selectedCurrency)}
                    </p>
                    <Badge variant="secondary" className="mt-1 sm:mt-2">{selectedCurrency.code}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Basado en 3 comparables</p>
                    
                    {/* Mostrar información del ajuste si existe */}
                    {priceAdjustment !== 0 && baseValuation && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Valor base original:</p>
                        <p className="text-sm font-medium">{formatCurrency(baseValuation, selectedCurrency)}</p>
                        <Badge variant={priceAdjustment > 0 ? "default" : "destructive"} className="mt-1">
                          Ajuste: {priceAdjustment > 0 ? '+' : ''}{priceAdjustment}%
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between">
                       <span>Área Total Construida:</span>
                       <span className="font-medium">
                         {(propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel).toLocaleString()} m²
                       </span>
                     </div>
                    <div className="flex justify-between">
                      <span>Área de Terreno:</span>
                      <span className="font-medium">{propertyData.areaTerreno.toLocaleString()} m²</span>
                    </div>
                    {propertyData.direccionCompleta && (
                      <div className="flex justify-between">
                        <span>Ubicación:</span>
                        <span className="font-medium text-xs">
                          {propertyData.direccionCompleta.length > 30 
                            ? `${propertyData.direccionCompleta.substring(0, 30)}...` 
                            : propertyData.direccionCompleta
                          }
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Precio por m² construido:</span>
                      <span className="font-medium">
                         {formatCurrency(
                           valuation / (propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel || 1), 
                           selectedCurrency
                         )}
                      </span>
                    </div>
                    {comparativeProperties.length > 0 && (() => {
                      const analysis = getMarketAnalysis();
                      return analysis ? (
                        <div className="flex justify-between">
                          <span>Comparación mercado:</span>
                          <span className={`font-medium ${analysis.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysis.difference > 0 ? '+' : ''}{analysis.difference.toFixed(1)}%
                          </span>
                        </div>
                      ) : null;
                    })()}
                   </div>
                   
                    {/* Selector de Comparables */}
                    {(allComparativeProperties.length > 0 || comparativeProperties.length > 0) && (
                     <div className="pt-4 border-t">
                        <Label className="text-sm font-medium mb-3 block">
                          {allComparativeProperties.length > 0 ? 'Seleccionar Comparables (3 de 10)' : 'Propiedades Comparables Utilizadas'}
                        </Label>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {(allComparativeProperties.length > 0 ? allComparativeProperties : comparativeProperties).map((comp, index) => (
                            <div 
                              key={index}
                              className={`p-3 border rounded-lg ${
                                allComparativeProperties.length > 0 ? 
                                  `cursor-pointer transition-all ${
                                    selectedComparatives.includes(index) 
                                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                      : 'border-gray-200 hover:border-gray-300'
                                  }` :
                                  'border-gray-200 bg-green-50 dark:bg-green-900/20'
                              }`}
                              onClick={allComparativeProperties.length > 0 ? () => {
                                if (selectedComparatives.includes(index)) {
                                  if (selectedComparatives.length > 1) {
                                    setSelectedComparatives(selectedComparatives.filter(i => i !== index));
                                  }
                                } else if (selectedComparatives.length < 3) {
                                  setSelectedComparatives([...selectedComparatives, index]);
                                } else {
                                  // Reemplazar el último seleccionado
                                  const newSelection = [...selectedComparatives.slice(0, 2), index];
                                  setSelectedComparatives(newSelection);
                                }
                              } : undefined}
                           >
                             <div className="flex justify-between items-start">
                               <div className="flex-1">
                                 <p className="text-sm font-medium truncate">{comp.address}</p>
                                 <div className="flex gap-4 mt-1 text-xs text-gray-600">
                                   <span>{comp.areaConstruida}m²</span>
                                   <span>{comp.recamaras} rec</span>
                                   <span>{comp.banos} baños</span>
                                   <span>{comp.distancia}m</span>
                                 </div>
                                 <p className="text-sm font-bold text-green-600 mt-1">
                                   {formatCurrency(comp.precio, selectedCurrency)}
                                 </p>
                               </div>
                                <div className="ml-2">
                                  {allComparativeProperties.length > 0 ? (
                                    selectedComparatives.includes(index) && (
                                      <Badge variant="default" className="text-xs">
                                        #{selectedComparatives.indexOf(index) + 1}
                                      </Badge>
                                    )
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">
                                      #{index + 1}
                                    </Badge>
                                  )}
                                </div>
                             </div>
                           </div>
                         ))}
                        </div>
                        {allComparativeProperties.length > 0 ? (
                          <>
                            <p className="text-xs text-gray-500 mt-2">
                              Selecciona exactamente 3 propiedades para el avalúo final ({selectedComparatives.length}/3)
                            </p>
                            <Button 
                              onClick={regenerateComparatives} 
                              variant="outline" 
                              className="w-full mt-3"
                              size="sm"
                            >
                              <Shuffle className="mr-2 h-4 w-4" />
                              Buscar Nuevos Comparables Cercanos
                            </Button>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500 mt-2">
                            Propiedades utilizadas en la valuación actual
                          </p>
                        )}
                      </div>
                    )}
                     
                 </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {translations[selectedLanguage].propertyData === 'Datos de la Propiedad' ? 
                      'Completa los datos de la propiedad y presiona "Calcular Valuación" para ver el resultado.' :
                      'Complete the property data and press "Calculate Valuation" to see the result.'
                    }
                  </p>
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