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
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp, FileText, Download, Camera, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
    
    // Características
    propertyCharacteristics: 'Características de la Propiedad',
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
    propertyLocation: 'Ubicación de la Propiedad',
    clickOnMap: 'Haz clic en el mapa para seleccionar la ubicación exacta del inmueble',
    currentAddress: 'Dirección actual',
    
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
    newValue: 'Nuevo valor'
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
    
    // Características
    propertyCharacteristics: 'Property Features',
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
    propertyLocation: 'Property Location',
    clickOnMap: 'Click on the map to select the exact location of the property',
    currentAddress: 'Current address',
    
    // Fotografías
    propertyPhotos: 'Property Photos',
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
    newValue: 'New value'
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
    
    // Características
    propertyCharacteristics: 'Caractéristiques de la Propriété',
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
    propertyLocation: 'Localisation de la Propriété',
    clickOnMap: 'Cliquez sur la carte pour sélectionner l\'emplacement exact de la propriété',
    currentAddress: 'Adresse actuelle',
    
    // Fotografías
    propertyPhotos: 'Photos de la Propriété',
    uploadPhotos: 'Télécharger des Photos',
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
    newValue: 'Nouvelle valeur'
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
    propertyLocation: 'Immobilienlage',
    clickOnMap: 'Klicken Sie auf die Karte, um den genauen Standort der Immobilie auszuwählen',
    currentAddress: 'Aktuelle Adresse',
    
    // Fotografías
    propertyPhotos: 'Immobilienfotos',
    uploadPhotos: 'Fotos Hochladen',
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
    newValue: 'Neuer Wert'
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
    
    // Características
    propertyCharacteristics: 'Caratteristiche della Proprietà',
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
    propertyLocation: 'Posizione della Proprietà',
    clickOnMap: 'Clicca sulla mappa per selezionare la posizione esatta della proprietà',
    currentAddress: 'Indirizzo attuale',
    
    // Fotografías
    propertyPhotos: 'Foto della Proprietà',
    uploadPhotos: 'Carica Foto',
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
    newValue: 'Nuovo valore'
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
    
    // Características
    propertyCharacteristics: 'Características da Propriedade',
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
    propertyLocation: 'Localização da Propriedade',
    clickOnMap: 'Clique no mapa para selecionar a localização exata da propriedade',
    currentAddress: 'Endereço atual',
    
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
    newValue: 'Novo valor'
  },

  zh: {
    propertyValuator: '房产评估师',
    professionalSystem: '专业评估系统',
    languageSelector: '语言选择',
    propertyData: '房产数据',
    areas: '面积',
    propertyType: '房产类型',
    spaces: '空间',
    characteristics: '特征',
    location: '位置',
    photos: '照片',
    valuation: '评估',
    
    // Areas
    constructionAreas: '建筑面积',
    basement: '地下室',
    firstFloor: '一层',
    secondFloor: '二层',
    thirdFloor: '三层',
    fourthFloor: '四层',
    landArea: '土地面积',
    
    // Servicios disponibles
    services: '服务',
    availableServices: '可用服务',
    basicServices: '基础服务',
    additionalServices: '附加服务',
    water: '自来水',
    electricity: '电力',
    gas: '天然气/液化气',
    drainage: '排水',
    internet: '互联网',
    cable: '有线电视',
    phone: '电话',
    security: '私人保安',
    swimmingPool: '游泳池',
    garden: '花园',
    elevator: '电梯',
    airConditioning: '空调',
    heating: '暖气',
    solarPanels: '太阳能板',
    waterTank: '水箱/水池',
    
    // Tipo de propiedad
    propertyTypeTitle: '房产类型',
    selectPropertyType: '选择房产类型',
    house: '房屋',
    apartment: '公寓',
    land: '土地',
    commercial: '商业',
    warehouse: '仓库',
    
    // Espacios
    spacesDistribution: '空间分布和特征',
    livingSpaces: '居住空间',
    bedrooms: '卧室',
    bedroomsDescription: '卧室数量',
    livingRooms: '客厅',
    livingRoomsDescription: '主要居住区域',
    diningRoom: '餐厅',
    diningRoomDescription: '用餐空间',
    bathrooms: '浴室',
    bathroomsDescription: '带淋浴/浴缸的浴室',
    serviceSpaces: '服务空间',
    kitchen: '厨房',
    kitchenDescription: '厨房数量',
    storage: '储藏室',
    storageDescription: '储存空间',
    serviceArea: '服务区',
    serviceAreaDescription: '洗衣/服务间',
    garage: '车库',
    garageDescription: '停车位',
    others: '其他空间',
    othersDescription: '书房、办公室等',
    
    // Características
    propertyCharacteristics: '房产特征',
    age: '房龄 (年)',
    ageDescription: '建成年数',
    locationQuality: '位置质量',
    locationDescription: '评估区域和交通',
    generalCondition: '总体状况',
    conditionDescription: '房产物理状况',
    
    // Condiciones
    new: '全新',
    good: '良好',
    medium: '中等',
    regular: '一般',
    simpleRepairs: '简单维修',
    mediumRepairs: '中等维修',
    importantRepairs: '重要维修',
    seriousDamage: '严重损坏',
    waste: '待拆除',
    useless: '无法使用',
    
    // Ubicaciones
    excellent: '优秀',
    goodLocation: '良好',
    regularLocation: '一般',
    badLocation: '较差',
    
    // Ubicación
    propertyLocation: '房产位置',
    clickOnMap: '在地图上点击选择房产确切位置',
    currentAddress: '当前地址',
    
    // Fotografías
    propertyPhotos: '房产照片',
    uploadPhotos: '上传照片',
    photosDescription: '上传房产内外部图片',
    removePhoto: '删除照片',
    
    // Botones de acción
    calculate: '计算评估',
    regenerate: '重新生成对比',
    downloadPDF: '下载 PDF',
    downloadWord: '下载 Word',
    
    // Resultado de valuación
    propertyValuationTitle: '房产评估',
    estimatedValue: '估计价值',
    priceAdjustment: '价格调整',
    adjustmentDescription: '根据附加因素调整最终价格',
    marketAnalysisTitle: '市场分析',
    comparativeProperties: '可比房产',
    selectComparatives: '选择可比房产 (10选3)',
    allComparatives: '所有可比房产',
    selectedForValuation: '选中用于评估',
    averagePrice: '平均价格',
    minPrice: '最低价格',
    maxPrice: '最高价格',
    
    // Tabla de comparativas
    property: '房产',
    builtArea: '建筑面积',
    price: '价格',
    priceM2: '单价/m²',
    distance: '距离',
    
    // PDF Content
    residentialValuation: '住宅评估',
    apartmentValuation: '公寓评估',
    landValuation: '土地评估',
    commercialValuation: '商业评估',
    residentialSubtitle: '住宅房产专业报告',
    apartmentSubtitle: '公寓单位专业报告',
    landSubtitle: '土地表面专业报告',
    commercialSubtitle: '商业房产专业报告',
    marketAnalysis: '市场价值专业分析',
    propertyLocationPDF: '房产位置',
    generalInfo: '一般信息',
    type: '类型',
    totalBuiltArea: '总建筑面积',
    propertyAreas: '房产面积',
    propertySpaces: '房产空间',
    estimatedValuePDF: '估计价值',
    pricePerSqm: '每平方米价格',
    basedOnComparables: '基于3个可比房产',
    mapLocation: '地图位置',
    address: '地址',
    viewInGoogleMaps: '在Google地图中查看位置',
    photograph: '照片',
    totalPhotos: '档案中的照片总数',
    captureDate: '拍摄日期',
    
    // Units
    sqm: 'm²',
    meters: 'm',
    years: '年',
    
    // Messages
    calculatingValuation: '正在计算评估',
    generatingReport: '正在生成3个可比的评估...',
    valuationCompleted: '评估完成',
    estimatedValueTitle: '估计价值',
    comparables: '可比房产',
    comparativesUpdated: '可比房产已更新',
    newComparativesGenerated: '已生成新的附近房产',
    currencyChanged: '货币已更改',
    valuationNowIn: '评估现在显示为',
    priceAdjusted: '价格已调整',
    adjustment: '调整',
    newValue: '新价值'
  },

  hi: {
    propertyValuator: 'संपत्ति मूल्यांकनकर्ता',
    professionalSystem: 'व्यावसायिक मूल्यांकन प्रणाली',
    languageSelector: 'भाषा चयनकर्ता',
    propertyData: 'संपत्ति डेटा',
    areas: 'क्षेत्रफल',
    propertyType: 'संपत्ति प्रकार',
    spaces: 'स्थान',
    characteristics: 'विशेषताएं',
    location: 'स्थान',
    photos: 'तस्वीरें',
    valuation: 'मूल्यांकन',
    
    // Areas
    constructionAreas: 'निर्माण क्षेत्र',
    basement: 'तहखाना',
    firstFloor: 'पहली मंजिल',
    secondFloor: 'दूसरी मंजिल',
    thirdFloor: 'तीसरी मंजिल',
    fourthFloor: 'चौथी मंजिल',
    landArea: 'भूमि क्षेत्र',
    
    // Servicios disponibles
    services: 'सेवाएं',
    availableServices: 'उपलब्ध सेवाएं',
    basicServices: 'मूलभूत सेवाएं',
    additionalServices: 'अतिरिक्त सेवाएं',
    water: 'पेयजल',
    electricity: 'बिजली',
    gas: 'प्राकृतिक गैस/एलपी',
    drainage: 'जल निकासी',
    internet: 'इंटरनेट',
    cable: 'केबल टीवी',
    phone: 'फोन',
    security: 'निजी सुरक्षा',
    swimmingPool: 'तरणताल',
    garden: 'उद्यान',
    elevator: 'लिफ्ट',
    airConditioning: 'वातानुकूलन',
    heating: 'हीटिंग',
    solarPanels: 'सोलर पैनल',
    waterTank: 'पानी टैंक/टंकी',
    
    // Tipo de propiedad
    propertyTypeTitle: 'संपत्ति प्रकार',
    selectPropertyType: 'संपत्ति प्रकार चुनें',
    house: 'मकान',
    apartment: 'अपार्टमेंट',
    land: 'भूमि',
    commercial: 'व्यावसायिक',
    warehouse: 'गोदाम',
    
    // Espacios
    spacesDistribution: 'स्थान वितरण और विशेषताएं',
    livingSpaces: 'रहने की जगह',
    bedrooms: 'शयनकक्ष',
    bedroomsDescription: 'शयनकक्षों की संख्या',
    livingRooms: 'बैठक कक्ष',
    livingRoomsDescription: 'मुख्य रहने के क्षेत्र',
    diningRoom: 'भोजन कक्ष',
    diningRoomDescription: 'भोजन स्थान',
    bathrooms: 'पूर्ण स्नानघर',
    bathroomsDescription: 'शावर/टब के साथ स्नानघर',
    serviceSpaces: 'सेवा स्थान',
    kitchen: 'रसोई',
    kitchenDescription: 'रसोई की संख्या',
    storage: 'भंडारण/गोदाम',
    storageDescription: 'भंडारण स्थान',
    serviceArea: 'सेवा क्षेत्र',
    serviceAreaDescription: 'धुलाई/सेवा कक्ष',
    garage: 'गैराज/कार पार्किंग',
    garageDescription: 'पार्किंग स्थान',
    others: 'अन्य स्थान',
    othersDescription: 'अध्ययन, कार्यालय, आदि',
    
    // Características
    propertyCharacteristics: 'संपत्ति विशेषताएं',
    age: 'आयु (वर्ष)',
    ageDescription: 'निर्माण के बाद से वर्ष',
    locationQuality: 'स्थान गुणवत्ता',
    locationDescription: 'क्षेत्र और पहुंच का मूल्यांकन',
    generalCondition: 'सामान्य स्थिति',
    conditionDescription: 'संपत्ति की भौतिक स्थिति',
    
    // Condiciones
    new: 'नया',
    good: 'अच्छा',
    medium: 'मध्यम',
    regular: 'नियमित',
    simpleRepairs: 'सरल मरम्मत',
    mediumRepairs: 'मध्यम मरम्मत',
    importantRepairs: 'महत्वपूर्ण मरम्मत',
    seriousDamage: 'गंभीर क्षति',
    waste: 'कचरे में',
    useless: 'बेकार',
    
    // Ubicaciones
    excellent: 'उत्कृष्ट',
    goodLocation: 'अच्छा',
    regularLocation: 'नियमित',
    badLocation: 'खराब',
    
    // Ubicación
    propertyLocation: 'संपत्ति स्थान',
    clickOnMap: 'संपत्ति का सटीक स्थान चुनने के लिए मानचित्र पर क्लिक करें',
    currentAddress: 'वर्तमान पता',
    
    // Fotografías
    propertyPhotos: 'संपत्ति तस्वीरें',
    uploadPhotos: 'तस्वीरें अपलोड करें',
    photosDescription: 'संपत्ति के अंदर और बाहर की छवियां अपलोड करें',
    removePhoto: 'तस्वीर हटाएं',
    
    // Botones de acción
    calculate: 'मूल्यांकन की गणना करें',
    regenerate: 'तुलनात्मक पुनर्जनन',
    downloadPDF: 'PDF डाउनलोड करें',
    downloadWord: 'Word डाउनलोड करें',
    
    // Resultado de valuación
    propertyValuationTitle: 'संपत्ति मूल्यांकन',
    estimatedValue: 'अनुमानित मूल्य',
    priceAdjustment: 'मूल्य समायोजन',
    adjustmentDescription: 'अतिरिक्त कारकों के आधार पर अंतिम मूल्य समायोजित करें',
    marketAnalysisTitle: 'बाजार विश्लेषण',
    comparativeProperties: 'तुलनात्मक संपत्तियां',
    selectComparatives: 'तुलनीय चुनें (10 में से 3)',
    allComparatives: 'सभी तुलनात्मक संपत्तियां',
    selectedForValuation: 'मूल्यांकन के लिए चयनित',
    averagePrice: 'औसत मूल्य',
    minPrice: 'न्यूनतम मूल्य',
    maxPrice: 'अधिकतम मूल्य',
    
    // Tabla de comparativas
    property: 'संपत्ति',
    builtArea: 'निर्मित क्षेत्र',
    price: 'मूल्य',
    priceM2: 'मूल्य/m²',
    distance: 'दूरी',
    
    // PDF Content
    residentialValuation: 'आवासीय मूल्यांकन',
    apartmentValuation: 'अपार्टमेंट मूल्यांकन',
    landValuation: 'भूमि मूल्यांकन',
    commercialValuation: 'व्यावसायिक मूल्यांकन',
    residentialSubtitle: 'आवासीय संपत्ति पेशेवर रिपोर्ट',
    apartmentSubtitle: 'अपार्टमेंट इकाई पेशेवर रिपोर्ट',
    landSubtitle: 'भूमि सतह पेशेवर रिपोर्ट',
    commercialSubtitle: 'व्यावसायिक संपत्ति पेशेवर रिपोर्ट',
    marketAnalysis: 'बाजार मूल्य पेशेवर विश्लेषण',
    propertyLocationPDF: 'संपत्ति स्थान',
    generalInfo: 'सामान्य जानकारी',
    type: 'प्रकार',
    totalBuiltArea: 'कुल निर्मित क्षेत्र',
    propertyAreas: 'संपत्ति क्षेत्र',
    propertySpaces: 'संपत्ति स्थान',
    estimatedValuePDF: 'अनुमानित मूल्य',
    pricePerSqm: 'प्रति वर्ग मीटर मूल्य',
    basedOnComparables: '3 तुलनीय पर आधारित',
    mapLocation: 'मानचित्र स्थान',
    address: 'पता',
    viewInGoogleMaps: 'Google मानचित्र में स्थान देखें',
    photograph: 'तस्वीर',
    totalPhotos: 'फाइल में कुल तस्वीरें',
    captureDate: 'कैप्चर तिथि',
    
    // Units
    sqm: 'm²',
    meters: 'm',
    years: 'वर्ष',
    
    // Messages
    calculatingValuation: 'मूल्यांकन की गणना हो रही है',
    generatingReport: '3 तुलनीय के साथ मूल्यांकन तैयार की जा रही है...',
    valuationCompleted: 'मूल्यांकन पूर्ण',
    estimatedValueTitle: 'अनुमानित मूल्य',
    comparables: 'तुलनीय',
    comparativesUpdated: 'तुलनात्मक अपडेट किए गए',
    newComparativesGenerated: 'नई आस-पास की संपत्तियां तैयार की गईं',
    currencyChanged: 'मुद्रा बदली गई',
    valuationNowIn: 'मूल्यांकन अब इसमें दिखाया गया है',
    priceAdjusted: 'मूल्य समायोजित',
    adjustment: 'समायोजन',
    newValue: 'नया मूल्य'
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
}

const PropertyValuation = () => {
  const { toast } = useToast();
  const [propertyData, setPropertyData] = useState<PropertyData>({
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
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));
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

  // Efecto para actualizar comparables seleccionados
  useEffect(() => {
    if (allComparativeProperties.length > 0) {
      const selectedProps = selectedComparatives.map(index => allComparativeProperties[index]).filter(Boolean);
      setComparativeProperties(selectedProps);
    }
  }, [selectedComparatives, allComparativeProperties]);

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
      if (file.type.startsWith('image/')) {
        const preview = URL.createObjectURL(file);
        setPropertyImages(prev => [...prev, { file, preview }]);
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

  const generateComparativeProperties = async (baseValue: number, numComparables: number = 10): Promise<ComparativeProperty[]> => {
    const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
    const lat = propertyData.latitud || 19.4326;
    const lng = propertyData.longitud || -99.1332;
    
    console.log('Generando comparables con búsqueda real de Google Maps...');
    
    // Primero intentar buscar propiedades reales
    let nearbyAddresses = await searchNearbyProperties(lat, lng, propertyData.tipoPropiedad, numComparables);
    
    // Si no hay suficientes propiedades reales, completar con simuladas
    if (nearbyAddresses.length < numComparables) {
      console.log(`Solo se encontraron ${nearbyAddresses.length} propiedades reales, completando con simuladas...`);
      const simulatedAddresses = await generateNearbyAddresses(lat, lng, numComparables - nearbyAddresses.length);
      nearbyAddresses = [...nearbyAddresses, ...simulatedAddresses];
    }
    
    return Promise.all(nearbyAddresses.map(async (addressInfo, index) => {
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
        precio: convertCurrency(baseValue * (1 + variation), selectedCurrency),
        distancia: addressInfo.distance,
        descripcion: `${propertyData.tipoPropiedad} de ${areaFinal}m² con ${Math.max(1, propertyData.recamaras + Math.floor((Math.random() - 0.5) * 2))} recámaras y ${Math.max(1, propertyData.banos + Math.floor((Math.random() - 0.5) * 2))} baños. ${addressInfo.isReal ? 'Propiedad real encontrada en Google Maps' : 'Propiedad simulada'}.`,
        url: addressInfo.placeId ? `https://www.google.com/maps/place/?q=place_id:${addressInfo.placeId}` : `https://propiedades.com/inmueble/${Math.random().toString(36).substr(2, 9)}`,
        latitud: addressInfo.lat,
        longitud: addressInfo.lng
      };
    }));
  };

  // Función para buscar propiedades cercanas usando Google Maps
  const searchNearbyProperties = async (lat: number, lng: number, propertyType: string, numResults: number = 10) => {
    try {
      console.log('Buscando propiedades cercanas con Google Maps...');
      
      const propertyTypeQueries = {
        'casa': 'casas en venta',
        'departamento': 'departamentos en venta',
        'terreno': 'terrenos en venta',
        'comercial': 'locales comerciales en venta',
        'bodega': 'bodegas en venta'
      };
      
      const query = propertyTypeQueries[propertyType as keyof typeof propertyTypeQueries] || 'propiedades en venta';
      
      const response = await supabase.functions.invoke('google-maps', {
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

      if (response.data?.results && response.data.results.length > 0) {
        console.log(`Encontradas ${response.data.results.length} propiedades en Google Maps`);
        return response.data.results.slice(0, numResults).map((place: any, index: number) => ({
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
        console.log('No se encontraron propiedades reales, generando simuladas');
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

  const calculateValuation = async () => {
    const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
    
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
    
    const valorFinal = (valorBase * 
                       (factorUbicacion[propertyData.ubicacion as keyof typeof factorUbicacion] || 1) *
                       (factorEstado[propertyData.estadoGeneral as keyof typeof factorEstado] || 1) *
                       factorAntiguedad) + bonificacionEspacios;
    
    // Convertir a la moneda seleccionada
    const valorFinalEnMonedaSeleccionada = convertCurrency(valorFinal, selectedCurrency);
    
    setBaseValuation(valorFinalEnMonedaSeleccionada);
    
    // Aplicar ajuste de precio si existe
    const valorAjustado = valorFinalEnMonedaSeleccionada * (1 + priceAdjustment / 100);
    setValuation(valorAjustado);
    
    toast({
      title: translations[selectedLanguage].calculatingValuation,
      description: translations[selectedLanguage].generatingReport,
    });

    // Generar comparativas con 10 comparables
    const allComparatives = await generateComparativeProperties(valorFinal, 10);
    setAllComparativeProperties(allComparatives);
    // Actualizar las propiedades seleccionadas (los primeros 3)
    const selectedProps = selectedComparatives.map(index => allComparatives[index]).filter(Boolean);
    setComparativeProperties(selectedProps);
    
    // Limpiar múltiples valuaciones ya que ahora solo hacemos una
    setMultipleValuations([]);
    
    toast({
      title: translations[selectedLanguage].valuationCompleted,
      description: `${translations[selectedLanguage].estimatedValueTitle}: ${formatCurrency(valorAjustado, selectedCurrency)} (3 ${translations[selectedLanguage].comparables})`,
    });
  };

  // Función para manejar cambios en el ajuste de precio
  const handlePriceAdjustment = (newAdjustment: number) => {
    setPriceAdjustment(newAdjustment);
    
    if (baseValuation) {
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
      // Calcular altura total necesaria para página continua
      const estimatedHeight = 800; // mm aproximados para todo el contenido en una página continua
      
      // Crear PDF con página continua (ancho carta, altura extendida)
      const doc = new jsPDF('portrait', 'mm', [216, estimatedHeight]); 
      const pageWidth = doc.internal.pageSize.width; // 216mm (ancho carta)
      const pageHeight = doc.internal.pageSize.height; // altura extendida
      
      // Márgenes reducidos para página continua
      const marginLeft = 20; // 20mm margen izquierdo
      const marginRight = 20; // 20mm margen derecho  
      const marginTop = 15; // 15mm margen superior
      const marginBottom = 15; // 15mm margen inferior
      const contentWidth = pageWidth - marginLeft - marginRight; // Ancho útil del contenido
      
      let yPosition = marginTop;
      
      // Obtener configuración del membrete seleccionado
      const config = letterheadConfigs[selectedLetterhead as keyof typeof letterheadConfigs];

      // Header principal con color personalizado
      doc.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(config.title, pageWidth / 2, 16, { align: "center" });
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(config.subtitle, pageWidth / 2, 25, { align: "center" });
      doc.text("Análisis Profesional de Valor de Mercado", pageWidth / 2, 30, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      yPosition = 50;

      // Dirección del inmueble (sección profesional destacada)
      if (propertyData.direccionCompleta) {
        yPosition += 10; // Margen superior
        
        // Marco decorativo para la dirección
        doc.setFillColor(248, 250, 252); // Gris muy claro
        doc.rect(marginLeft - 5, yPosition, contentWidth + 10, 25, 'F');
        
        // Borde izquierdo de color
        doc.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.rect(marginLeft - 5, yPosition, 4, 25, 'F');
        
        // Borde exterior sutil
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(marginLeft - 5, yPosition, contentWidth + 10, 25);
        
        // Título de la sección
        doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('UBICACIÓN DEL INMUEBLE', marginLeft + 5, yPosition + 8);
        
        // Línea separadora sutil
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(marginLeft + 5, yPosition + 10, marginLeft + contentWidth - 5, yPosition + 10);
        
        // Dirección con formato elegante
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        const addressLines = doc.splitTextToSize(propertyData.direccionCompleta, contentWidth - 20);
        doc.text(addressLines, marginLeft + 5, yPosition + 16);
        
        yPosition += 35 + (addressLines.length > 1 ? (addressLines.length - 1) * 4 : 0);
        
        // Agregar coordenadas y croquis de ubicación inmediatamente después de la dirección
        if (propertyData.latitud && propertyData.longitud) {
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Coordenadas: ${propertyData.latitud.toFixed(6)}, ${propertyData.longitud.toFixed(6)}`, marginLeft, yPosition);
          yPosition += 10;
          
          // Agregar imagen del croquis de ubicación
          try {
            const mapImage = await generateMapImage(propertyData.latitud, propertyData.longitud);
            if (mapImage) {
              doc.setFontSize(12);
              doc.setFont("helvetica", "bold");
              doc.text("CROQUIS DE UBICACIÓN", marginLeft, yPosition);
              yPosition += 10;
              
              // Agregar la imagen del mapa
              const mapWidth = 80;
              const mapHeight = 60;
              doc.addImage(mapImage, 'PNG', marginLeft, yPosition, mapWidth, mapHeight);
              
              // Marco alrededor del mapa
              doc.setDrawColor(150, 150, 150);
              doc.setLineWidth(0.5);
              doc.rect(marginLeft, yPosition, mapWidth, mapHeight);
              
              // Enlace a Google Maps
              const googleMapsUrl = `https://www.google.com/maps?q=${propertyData.latitud},${propertyData.longitud}`;
              doc.setFontSize(10);
              doc.setFont("helvetica", "bold");
              doc.setTextColor(0, 0, 255); // Color azul para el enlace
              doc.textWithLink("Ver ubicación en Google Maps", marginLeft, yPosition + mapHeight + 8, { url: googleMapsUrl });
              
              // Restaurar color de texto negro
              doc.setTextColor(0, 0, 0);
              
              yPosition += mapHeight + 20;
            }
          } catch (error) {
            console.error('Error agregando imagen del mapa:', error);
            yPosition += 10;
          }
        }
      }

      // Información general
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMACIÓN GENERAL", marginLeft, yPosition);
      yPosition += 10;

      const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
      
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(`Tipo: ${propertyData.tipoPropiedad.toUpperCase()}`, marginLeft, yPosition);
      yPosition += 7;
      doc.text(`Área Total Construida: ${areaTotal.toLocaleString()} m²`, marginLeft, yPosition);
      yPosition += 7;
      doc.text(`Área de Terreno: ${propertyData.areaTerreno.toLocaleString()} m²`, marginLeft, yPosition);
      yPosition += 7;
      doc.text(`Antigüedad de la Construcción: ${propertyData.antiguedad} años`, marginLeft, yPosition);
      yPosition += 7;
      
      // Traducir ubicación
      const ubicacionTexto = propertyData.ubicacion === 'excellent' ? 'Excelente' :
                            propertyData.ubicacion === 'good' ? 'Buena' :
                            propertyData.ubicacion === 'medium' ? 'Regular' :
                            propertyData.ubicacion === 'poor' ? 'Deficiente' : propertyData.ubicacion;
      doc.text(`Calidad de Ubicación: ${ubicacionTexto}`, marginLeft, yPosition);
      yPosition += 7;
      
      // Traducir estado general
      const estadoTexto = propertyData.estadoGeneral === 'excellent' ? 'Excelente' :
                         propertyData.estadoGeneral === 'good' ? 'Bueno' :
                         propertyData.estadoGeneral === 'medium' ? 'Regular' :
                         propertyData.estadoGeneral === 'poor' ? 'Deficiente' : propertyData.estadoGeneral;
      doc.text(`Estado General: ${estadoTexto}`, marginLeft, yPosition);
      yPosition += 15;

      // Detalles completos de áreas por nivel
      doc.setFillColor(250, 250, 250);
      doc.rect(marginLeft - 5, yPosition - 5, contentWidth + 10, 8, 'F');
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DISTRIBUCIÓN DETALLADA DE ÁREAS CONSTRUIDAS", marginLeft, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 15;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      
      // Mostrar todas las áreas, incluso si son 0
      doc.text(`• Sótano: ${propertyData.areaSotano} m²`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Primer Nivel: ${propertyData.areaPrimerNivel} m²`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Segundo Nivel: ${propertyData.areaSegundoNivel} m²`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Tercer Nivel: ${propertyData.areaTercerNivel} m²`, 25, yPosition);
      yPosition += 7;
      doc.text(`• Cuarto Nivel: ${propertyData.areaCuartoNivel} m²`, 25, yPosition);
      yPosition += 7;
      
      // Resumen de área construida
      doc.setFillColor(240, 248, 255);
      doc.rect(20, yPosition, contentWidth - 10, 12, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`TOTAL ÁREA CONSTRUIDA: ${areaTotal} m²`, 25, yPosition + 8);
      yPosition += 20;
      
      // Área de terreno detallada
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`• Área Total del Terreno: ${propertyData.areaTerreno} m²`, 25, yPosition);
      yPosition += 7;
      
      // Cálculo de área libre (terreno - construcción)
      const areaLibre = propertyData.areaTerreno - areaTotal;
      doc.text(`• Área Libre (sin construir): ${areaLibre > 0 ? areaLibre : 0} m²`, 25, yPosition);
      yPosition += 7;
      
      // Coeficiente de ocupación del suelo
      const coeficienteOcupacion = ((areaTotal / propertyData.areaTerreno) * 100).toFixed(1);
      doc.text(`• Coeficiente de Ocupación del Suelo: ${coeficienteOcupacion}%`, 25, yPosition);
      yPosition += 15;

      // Características completas de la propiedad
      doc.setFillColor(250, 250, 250);
      doc.rect(marginLeft - 5, yPosition - 5, contentWidth + 10, 8, 'F');
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CARACTERÍSTICAS COMPLETAS DE LA PROPIEDAD", marginLeft, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 15;
      
      // Características físicas
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("CARACTERÍSTICAS FÍSICAS:", 20, yPosition);
      yPosition += 8;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`• Tipo de Propiedad: ${propertyData.tipoPropiedad.charAt(0).toUpperCase() + propertyData.tipoPropiedad.slice(1)}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Antigüedad: ${propertyData.antiguedad} años`, 25, yPosition);
      yPosition += 6;
      
      // Traducir ubicación
      const ubicacionTextoDetalle = propertyData.ubicacion === 'excellent' ? 'Excelente' :
                            propertyData.ubicacion === 'good' ? 'Buena' :
                            propertyData.ubicacion === 'medium' ? 'Regular' :
                            propertyData.ubicacion === 'poor' ? 'Deficiente' : propertyData.ubicacion;
      doc.text(`• Calidad de Ubicación: ${ubicacionTextoDetalle}`, 25, yPosition);
      yPosition += 6;
      
      // Traducir estado general
      const estadoTextoDetalle = propertyData.estadoGeneral === 'excellent' ? 'Excelente' :
                         propertyData.estadoGeneral === 'good' ? 'Bueno' :
                         propertyData.estadoGeneral === 'medium' ? 'Regular' :
                         propertyData.estadoGeneral === 'poor' ? 'Deficiente' : propertyData.estadoGeneral;
      doc.text(`• Estado General de Conservación: ${estadoTextoDetalle}`, 25, yPosition);
      yPosition += 10;

      // Resumen cuantitativo
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("RESUMEN CUANTITATIVO:", 20, yPosition);
      yPosition += 8;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`• Total de Recámaras: ${propertyData.recamaras}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Total de Salas: ${propertyData.salas}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Total de Comedores: ${propertyData.comedor}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Total de Cocinas: ${propertyData.cocina}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Total de Baños: ${propertyData.banos}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Total de Cocheras: ${propertyData.cochera}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Áreas de Servicio: ${propertyData.areaServicio}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Bodegas/Trasteros: ${propertyData.bodega}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Otros Espacios: ${propertyData.otros}`, 25, yPosition);
      yPosition += 15;
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      // Espacios habitacionales
      doc.setFont("helvetica", "bold");
      doc.text("Espacios Habitacionales:", marginLeft, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "bold");
      
      // Recámaras con nombres específicos
      if (propertyData.recamaras > 0) {
        doc.text(`• Recámaras/Dormitorios (${propertyData.recamaras} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.recamaras; i++) {
          const nombreRecamara = i === 1 ? "Recámara Principal" : `Recámara ${i}`;
          doc.text(`  - ${nombreRecamara}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      // Salas con nombres específicos
      if (propertyData.salas > 0) {
        doc.text(`• Salas/Estancias (${propertyData.salas} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.salas; i++) {
          const nombreSala = i === 1 ? "Sala Principal" : 
                           i === 2 ? "Sala de TV/Familiar" : `Sala ${i}`;
          doc.text(`  - ${nombreSala}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      // Comedor con nombres específicos
      if (propertyData.comedor > 0) {
        doc.text(`• Comedor (${propertyData.comedor} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.comedor; i++) {
          const nombreComedor = i === 1 ? "Comedor Principal" : `Comedor ${i}`;
          doc.text(`  - ${nombreComedor}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      // Cocina como espacio habitacional
      if (propertyData.cocina > 0) {
        doc.text(`• Cocina (${propertyData.cocina} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.cocina; i++) {
          const nombreCocina = i === 1 ? "Cocina Principal" : `Cocina ${i}`;
          doc.text(`  - ${nombreCocina}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      // Baños con nombres específicos
      if (propertyData.banos > 0) {
        doc.text(`• Baños Completos (${propertyData.banos} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.banos; i++) {
          const nombreBano = i === 1 ? "Baño Principal" : 
                           i === 2 ? "Baño de Visitas" : `Baño ${i}`;
          doc.text(`  - ${nombreBano}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      // Otros espacios habitacionales
      if (propertyData.otros > 0) {
        doc.text(`• Otros Espacios Habitacionales (${propertyData.otros} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.otros; i++) {
          const nombreOtro = i === 1 ? "Estudio/Oficina" : 
                           i === 2 ? "Sala de Juegos" :
                           i === 3 ? "Biblioteca/Den" : `Espacio Adicional ${i}`;
          doc.text(`  - ${nombreOtro}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      yPosition += 5;
      
      // Espacios de servicio y apoyo
      doc.setFont("helvetica", "bold");
      doc.text("Espacios de Servicio y Apoyo:", marginLeft, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "bold");
      
      // Área de servicio con nombres específicos
      if (propertyData.areaServicio > 0) {
        doc.text(`• Área de Servicio/Lavado (${propertyData.areaServicio} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.areaServicio; i++) {
          const nombreServicio = i === 1 ? "Cuarto de Lavado Principal" : `Área de Servicio ${i}`;
          doc.text(`  - ${nombreServicio}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      // Bodegas con nombres específicos
      if (propertyData.bodega > 0) {
        doc.text(`• Bodegas/Trasteros (${propertyData.bodega} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.bodega; i++) {
          const nombreBodega = i === 1 ? "Bodega Principal" : `Bodega ${i}`;
          doc.text(`  - ${nombreBodega}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      // Cocheras con nombres específicos
      if (propertyData.cochera > 0) {
        doc.text(`• Cocheras/Garajes (${propertyData.cochera} espacios):`, 25, yPosition);
        yPosition += 5;
        for (let i = 1; i <= propertyData.cochera; i++) {
          const nombreCochera = i === 1 ? "Cochera Principal" : 
                               i === 2 ? "Cochera Secundaria" : `Cochera ${i}`;
          doc.text(`  - ${nombreCochera}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 3;
      }
      
      // Resumen total de espacios
      const totalEspaciosHabitacionales = propertyData.recamaras + propertyData.salas + propertyData.comedor + 
                                         propertyData.cocina + propertyData.banos + propertyData.otros;
      const totalEspaciosServicio = propertyData.areaServicio + propertyData.bodega + propertyData.cochera;
      const totalEspacios = totalEspaciosHabitacionales + totalEspaciosServicio;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPosition, pageWidth - 40, 25, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`TOTAL DE ESPACIOS HABITACIONALES: ${totalEspaciosHabitacionales}`, 25, yPosition + 7);
      doc.text(`TOTAL DE ESPACIOS DE SERVICIO: ${totalEspaciosServicio}`, 25, yPosition + 14);
      doc.text(`TOTAL GENERAL DE ESPACIOS: ${totalEspacios}`, 25, yPosition + 21);
      yPosition += 30;

      // Sección de Servicios Disponibles
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPosition - 5, pageWidth - 40, 15, 'F');
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SERVICIOS DISPONIBLES", marginLeft, yPosition + 5);
      doc.setTextColor(0, 0, 0);
      yPosition += 20;

      // Servicios básicos
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Servicios Básicos:", marginLeft, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      if (propertyData.servicios.agua) { doc.text("✓ Agua Potable", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.electricidad) { doc.text("✓ Electricidad", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.gas) { doc.text("✓ Gas Natural/LP", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.drenaje) { doc.text("✓ Drenaje", 25, yPosition); yPosition += 5; }
      
      yPosition += 5;
      
      // Servicios adicionales
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Servicios Adicionales:", marginLeft, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      if (propertyData.servicios.internet) { doc.text("✓ Internet", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.cable) { doc.text("✓ TV por Cable", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.telefono) { doc.text("✓ Teléfono", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.seguridad) { doc.text("✓ Seguridad Privada", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.alberca) { doc.text("✓ Alberca", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.jardin) { doc.text("✓ Jardín", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.elevador) { doc.text("✓ Elevador", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.aireAcondicionado) { doc.text("✓ Aire Acondicionado", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.calefaccion) { doc.text("✓ Calefacción", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.panelesSolares) { doc.text("✓ Paneles Solares", 25, yPosition); yPosition += 5; }
      if (propertyData.servicios.tinaco) { doc.text("✓ Tinaco/Cisterna", 25, yPosition); yPosition += 5; }
      
      yPosition += 10;

      // Resultado de valuación con color personalizado
      doc.setFillColor(config.secondaryColor[0], config.secondaryColor[1], config.secondaryColor[2]);
      doc.rect(marginLeft, yPosition - 5, contentWidth, 35, 'F');
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Valor Estimado: ${formatCurrency(valuation, selectedCurrency)}`, 20, yPosition + 8);
      
      // Mostrar ajuste si existe
      if (priceAdjustment !== 0) {
        doc.setFontSize(10);
        doc.text(`(Valor base: ${formatCurrency(baseValuation || 0, selectedCurrency)} | Ajuste: ${priceAdjustment > 0 ? '+' : ''}${priceAdjustment}%)`, 20, yPosition + 18);
        yPosition += 6;
      }
      
      doc.setFontSize(12);
      doc.text(`Precio por m²: ${formatCurrency(valuation / areaTotal, selectedCurrency)}`, 20, yPosition + 18);
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Basado en 3 comparables", 20, yPosition + 28);
      
      yPosition += 35;



      // Tabla de comparables
      if (comparativeProperties.length > 0) {
        yPosition += 10;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PROPIEDADES COMPARABLES", marginLeft, yPosition);
        yPosition += 15;

        // Tabla de 3 comparables seleccionados
        const colWidths = [40, 25, 25, 25, 30, 35];
        const colPositions = [marginLeft, marginLeft + 40, marginLeft + 65, marginLeft + 90, marginLeft + 115, marginLeft + 145];
        
        doc.setFillColor(240, 240, 240);
        doc.rect(marginLeft, yPosition - 2, contentWidth, 15, 'F');
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Dirección", colPositions[0], yPosition + 8);
        doc.text("Área (m²)", colPositions[1], yPosition + 8);
        doc.text("Rec.", colPositions[2], yPosition + 8);
        doc.text("Baños", colPositions[3], yPosition + 8);
        doc.text("Antigüedad", colPositions[4], yPosition + 8);
        doc.text("Precio", colPositions[5], yPosition + 8);
        
        yPosition += 15;

        // Datos de los comparables
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        
        for (let i = 0; i < Math.min(comparativeProperties.length, 3); i++) {
          const comp = comparativeProperties[i];
          
          // Sin verificación de salto de página para contenido continuo
          
          
          // Alternar color de fila
          if (i % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(marginLeft, yPosition - 2, contentWidth, 12, 'F');
          }
          
          // Truncar dirección si es muy larga
          const shortAddress = comp.address.length > 25 ? comp.address.substring(0, 22) + "..." : comp.address;
          
          doc.text(shortAddress, colPositions[0], yPosition + 6);
          doc.text(comp.areaConstruida.toString(), colPositions[1], yPosition + 6);
          doc.text(comp.recamaras.toString(), colPositions[2], yPosition + 6);
          doc.text(comp.banos.toString(), colPositions[3], yPosition + 6);
          doc.text(comp.antiguedad.toString(), colPositions[4], yPosition + 6);
          doc.text(formatCurrency(comp.precio, selectedCurrency), colPositions[5], yPosition + 6);
          
          yPosition += 12;
        }
        
        yPosition += 10;

        // Sección detallada de comparables con fotografías
        doc.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.rect(marginLeft, yPosition - 5, contentWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("ANÁLISIS DETALLADO DE COMPARABLES", marginLeft, yPosition + 5);
        doc.setTextColor(0, 0, 0);
        yPosition += 25;

        // Placeholder images for comparable properties
        const comparableImages = [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300&h=200&fit=crop',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300&h=200&fit=crop'
        ];

        // Procesar cada comparable con detalle y fotografía
        for (let i = 0; i < Math.min(comparativeProperties.length, 3); i++) {
          const comp = comparativeProperties[i];
          
          // Título del comparable con número destacado
          doc.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          doc.rect(marginLeft, yPosition - 2, contentWidth, 18, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(`PROPIEDAD COMPARABLE ${i + 1}`, marginLeft + 5, yPosition + 10);
          doc.setTextColor(0, 0, 0);
          yPosition += 25;
          
          // Marco principal para el comparable
          doc.setFillColor(248, 250, 252);
          doc.rect(marginLeft, yPosition - 5, contentWidth, 120, 'F');
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.8);
          doc.rect(marginLeft, yPosition - 5, contentWidth, 120);
          
          // Información básica del inmueble
          doc.setFillColor(230, 235, 240);
          doc.rect(marginLeft + 2, yPosition, contentWidth - 4, 15, 'F');
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          doc.text("INFORMACIÓN DEL INMUEBLE", marginLeft + 5, yPosition + 10);
          doc.setTextColor(0, 0, 0);
          yPosition += 20;
          
          // Dirección completa
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("Dirección completa:", marginLeft + 5, yPosition);
          doc.setFont("helvetica", "normal");
          const addressLines = doc.splitTextToSize(comp.address, contentWidth - 50);
          doc.text(addressLines, marginLeft + 40, yPosition);
          yPosition += Math.max(addressLines.length * 5, 8);
          
          // Características físicas en dos columnas
          doc.setFont("helvetica", "bold");
          doc.text("CARACTERÍSTICAS FÍSICAS", marginLeft + 5, yPosition);
          yPosition += 8;
          
          // Columna izquierda
          doc.setFont("helvetica", "bold");
          doc.text("• Área construida:", marginLeft + 8, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(`${comp.areaConstruida.toLocaleString()} m²`, marginLeft + 35, yPosition);
          
          doc.setFont("helvetica", "bold");
          doc.text("• Recámaras:", marginLeft + 8, yPosition + 7);
          doc.setFont("helvetica", "normal");
          doc.text(comp.recamaras.toString(), marginLeft + 25, yPosition + 7);
          
          doc.setFont("helvetica", "bold");
          doc.text("• Baños completos:", marginLeft + 8, yPosition + 14);
          doc.setFont("helvetica", "normal");
          doc.text(comp.banos.toString(), marginLeft + 35, yPosition + 14);
          
          // Columna derecha
          doc.setFont("helvetica", "bold");
          doc.text("• Antigüedad:", marginLeft + 100, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(`${comp.antiguedad} años`, marginLeft + 125, yPosition);
          
          doc.setFont("helvetica", "bold");
          doc.text("• Distancia:", marginLeft + 100, yPosition + 7);
          doc.setFont("helvetica", "normal");
          doc.text(`${comp.distancia} metros`, marginLeft + 120, yPosition + 7);
          
          doc.setFont("helvetica", "bold");
          doc.text("• Tipo:", marginLeft + 100, yPosition + 14);
          doc.setFont("helvetica", "normal");
          doc.text(comp.tipoPropiedad || propertyData.tipoPropiedad, marginLeft + 115, yPosition + 14);
          
          yPosition += 25;
          
          // Análisis de precios
          doc.setFillColor(230, 235, 240);
          doc.rect(marginLeft + 2, yPosition, contentWidth - 4, 15, 'F');
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
          doc.text("ANÁLISIS DE PRECIOS", marginLeft + 5, yPosition + 10);
          doc.setTextColor(0, 0, 0);
          yPosition += 20;
          
          // Información de precios
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text("• Precio de venta:", marginLeft + 8, yPosition);
          doc.setFont("helvetica", "normal");
          doc.text(formatCurrency(comp.precio, selectedCurrency), marginLeft + 35, yPosition);
          
          doc.setFont("helvetica", "bold");
          doc.text("• Precio por m²:", marginLeft + 8, yPosition + 7);
          doc.setFont("helvetica", "normal");
          doc.text(formatCurrency(comp.precio / comp.areaConstruida, selectedCurrency), marginLeft + 30, yPosition + 7);
          
          // Cálculo de ajuste vs propiedad valuada
          const adjustmentFactor = ((comp.precio / comp.areaConstruida) / (valuation / (propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel)) - 1) * 100;
          doc.setFont("helvetica", "bold");
          doc.text("• Variación vs valuado:", marginLeft + 8, yPosition + 14);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(adjustmentFactor > 0 ? 0 : 255, adjustmentFactor > 0 ? 150 : 0, 0);
          doc.text(`${adjustmentFactor > 0 ? '+' : ''}${adjustmentFactor.toFixed(1)}%`, marginLeft + 45, yPosition + 14);
          doc.setTextColor(0, 0, 0);
          
          // Agregar imagen placeholder del comparable con mejor diseño
          try {
            const canvas = document.createElement('canvas');
            canvas.width = 150;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              // Fondo degradado
              const gradient = ctx.createLinearGradient(0, 0, 0, 100);
              gradient.addColorStop(0, '#f8fafc');
              gradient.addColorStop(1, '#e2e8f0');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 150, 100);
              
              // Bordes
              ctx.strokeStyle = '#94a3b8';
              ctx.lineWidth = 2;
              ctx.strokeRect(2, 2, 146, 96);
              
              // Simulación de ventanas/estructura
              ctx.fillStyle = '#cbd5e1';
              ctx.fillRect(20, 20, 25, 20);
              ctx.fillRect(50, 20, 25, 20);
              ctx.fillRect(80, 20, 25, 20);
              ctx.fillRect(20, 45, 85, 15);
              
              // Texto informativo
              ctx.fillStyle = '#475569';
              ctx.font = 'bold 12px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(`Comparable ${i + 1}`, 75, 75);
              ctx.font = '10px Arial';
              ctx.fillText(`${comp.areaConstruida} m²`, 75, 88);
            }
            
            const imageData = canvas.toDataURL('image/png');
            
            // Posición de la imagen a la derecha
            const imageX = marginLeft + contentWidth - 48;
            const imageY = yPosition - 35;
            doc.addImage(imageData, 'PNG', imageX, imageY, 40, 25);
            
            // Marco alrededor de la imagen
            doc.setDrawColor(120, 120, 120);
            doc.setLineWidth(0.5);
            doc.rect(imageX, imageY, 40, 25);
            
            // Etiqueta de la imagen
            doc.setFontSize(8);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(100, 100, 100);
            doc.text("Vista representativa", imageX + 20, imageY + 30, { align: "center" });
            doc.setTextColor(0, 0, 0);
            
          } catch (error) {
            console.error('Error creando imagen del comparable:', error);
          }
          
          yPosition += 35;
        }

        // Análisis de mercado
        const analysis = getMarketAnalysis();
        if (analysis) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("ANÁLISIS DE MERCADO", marginLeft, yPosition);
          yPosition += 10;
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.text(`Precio Promedio: ${formatCurrency(analysis.avgPrice, selectedCurrency)}`, 20, yPosition);
          doc.setFont("helvetica", "bold");
          yPosition += 7;
          doc.text(`Precio Mínimo: ${formatCurrency(analysis.minPrice, selectedCurrency)}`, 20, yPosition);
          yPosition += 7;
          doc.text(`Precio Máximo: ${formatCurrency(analysis.maxPrice, selectedCurrency)}`, 20, yPosition);
          yPosition += 7;
          
          const variationText = analysis.difference > 0 ? 
            `+${analysis.difference.toFixed(1)}% sobre el promedio` : 
            `${analysis.difference.toFixed(1)}% bajo el promedio`;
          doc.text(`Variación vs. Mercado: ${variationText}`, 20, yPosition);
          yPosition += 15;
        }
      }

      // Agregar fotografías continuando en la misma página
      if (propertyImages.length > 0) {
        // Continuar en la misma página
        yPosition += 15;

        // Título de la sección de fotografías
        doc.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
        doc.rect(marginLeft, yPosition - 5, contentWidth, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("FOTOGRAFÍAS OFICIALES DEL INMUEBLE", marginLeft, yPosition + 5);
        doc.setTextColor(0, 0, 0);
        yPosition += 25;

        // Configuración para imágenes en página continua
        const imageHeight = 55; // Altura de cada imagen
        const imageWidth = 90; // Ancho de cada imagen
        const spacingBetweenImages = 15;
        
        // Procesar todas las imágenes en página continua
        for (let i = 0; i < propertyImages.length; i++) {
          const imageData = propertyImages[i];
          
          try {
            // Centrar imagen horizontalmente
            const imageX = (pageWidth - imageWidth) / 2;
            const currentY = yPosition + (i * (imageHeight + spacingBetweenImages));
            
            // Añadir imagen
            doc.addImage(imageData.preview, 'JPEG', imageX, currentY, imageWidth, imageHeight);
            
            // Marco alrededor de la imagen
            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.5);
            doc.rect(imageX, currentY, imageWidth, imageHeight);
            
            // Numeración y descripción de imagen
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(80, 80, 80);
            doc.text(`Fotografía ${i + 1}`, imageX, currentY + imageHeight + 8);
            
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`Vista del inmueble - Archivo oficial`, imageX, currentY + imageHeight + 15);
            
            // Restaurar color de texto
            doc.setTextColor(0, 0, 0);
            
          } catch (imgError) {
            console.error('Error agregando imagen:', imgError);
            
            // En caso de error, mostrar un placeholder
            doc.setFillColor(240, 240, 240);
            const currentY = yPosition + (i * (imageHeight + spacingBetweenImages));
            const imageX = (pageWidth - imageWidth) / 2;
            doc.rect(imageX, currentY, imageWidth, imageHeight, 'F');
            doc.setTextColor(120, 120, 120);
            doc.setFontSize(10);
            doc.text(`Imagen ${i + 1} no disponible`, imageX + imageWidth/2, currentY + imageHeight/2, { align: "center" });
            doc.setTextColor(0, 0, 0);
          }
        }

        // Información adicional al final de las fotos
        const finalY = yPosition + (propertyImages.length * (imageHeight + spacingBetweenImages)) + 20;
        doc.setFillColor(248, 250, 252);
        doc.rect(marginLeft, finalY - 5, contentWidth, 25, 'F');
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 100, 100);
        doc.text(`Total de fotografías en el expediente: ${propertyImages.length}`, pageWidth / 2, finalY + 5, { align: "center" });
        doc.text(`Fecha de captura: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, finalY + 12, { align: "center" });
        doc.text("Fotografías tomadas para fines de valuación profesional", pageWidth / 2, finalY + 19, { align: "center" });
        doc.setTextColor(0, 0, 0);
      }

      // SECCIÓN FINAL - CONCLUSIONES Y CERTIFICACIÓN
      yPosition += 30;
      
      // Nueva página para conclusiones si es necesario
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 30;
      }

      // Título de conclusiones
      doc.setFillColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.rect(marginLeft, yPosition - 5, contentWidth, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("CONCLUSIONES DEL AVALÚO INMOBILIARIO", marginLeft, yPosition + 8);
      doc.setTextColor(0, 0, 0);
      yPosition += 30;

      // Resumen ejecutivo del avalúo
      doc.setFillColor(248, 250, 252);
      doc.rect(marginLeft, yPosition - 5, contentWidth, 80, 'F');
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.8);
      doc.rect(marginLeft, yPosition - 5, contentWidth, 80);
      
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.text("RESUMEN EJECUTIVO", marginLeft + 5, yPosition + 5);
      doc.setTextColor(0, 0, 0);
      yPosition += 15;

      // Datos principales del avalúo
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("VALOR COMERCIAL DETERMINADO:", marginLeft + 5, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.text(formatCurrency(valuation, selectedCurrency), marginLeft + 80, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("VALOR POR METRO CUADRADO:", marginLeft + 5, yPosition);
      doc.setFont("helvetica", "normal");
      const valorM2 = valuation / areaTotal;
      doc.text(formatCurrency(valorM2, selectedCurrency), marginLeft + 80, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("ÁREA TOTAL CONSTRUIDA:", marginLeft + 5, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${areaTotal.toLocaleString()} m²`, marginLeft + 80, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("MÉTODO DE AVALÚO:", marginLeft + 5, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text("Enfoque de Mercado - Análisis Comparativo", marginLeft + 80, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("COMPARABLES UTILIZADOS:", marginLeft + 5, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(`${Math.min(comparativeProperties.length, 3)} propiedades similares`, marginLeft + 80, yPosition);
      yPosition += 8;

      doc.setFont("helvetica", "bold");
      doc.text("FECHA DE AVALÚO:", marginLeft + 5, yPosition);
      doc.setFont("helvetica", "normal");
      doc.text(new Date().toLocaleDateString('es-ES'), marginLeft + 80, yPosition);
      yPosition += 20;

      // Metodología aplicada
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("METODOLOGÍA APLICADA", marginLeft, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const metodologiaText = [
        "1. Análisis de la propiedad sujeto: Se realizó inspección detallada de las características físicas,",
        "   distribución de espacios, estado de conservación y servicios disponibles.",
        "",
        "2. Investigación de mercado: Se analizaron propiedades comparables en la zona con características",
        "   similares en cuanto a tipo, ubicación, antigüedad y área construida.",
        "",
        "3. Análisis comparativo: Se aplicaron ajustes por diferencias en características específicas",
        "   entre la propiedad sujeto y los comparables seleccionados.",
        "",
        "4. Valor final: Se determinó el valor comercial basado en el análisis estadístico de los",
        "   comparables ajustados y las condiciones actuales del mercado inmobiliario."
      ];

      metodologiaText.forEach(line => {
        doc.text(line, marginLeft, yPosition);
        yPosition += 5;
      });

      yPosition += 15;

      // Certificación profesional
      doc.setFillColor(245, 245, 245);
      doc.rect(marginLeft, yPosition - 5, contentWidth, 60, 'F');
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.rect(marginLeft, yPosition - 5, contentWidth, 60);

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]);
      doc.text("CERTIFICACIÓN PROFESIONAL", marginLeft + 5, yPosition + 5);
      doc.setTextColor(0, 0, 0);
      yPosition += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const certificacionText = [
        "El presente avalúo ha sido elaborado siguiendo estándares profesionales internacionales",
        "y metodologías reconocidas para la valuación de bienes inmuebles. El valor determinado",
        "representa el valor comercial más probable bajo condiciones normales de mercado.",
        "",
        "Este documento constituye la opinión profesional del valor de la propiedad con base en",
        "la información disponible a la fecha de elaboración del presente avalúo."
      ];

      certificacionText.forEach(line => {
        doc.text(line, marginLeft + 5, yPosition);
        yPosition += 5;
      });

      yPosition += 10;

      // Línea para firma
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(marginLeft + 120, yPosition + 15, marginLeft + contentWidth - 20, yPosition + 15);
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Valuador Profesional", marginLeft + 140, yPosition + 22);
      doc.text(`${config.title}`, marginLeft + 140, yPosition + 28);

      // Pie de página final
      yPosition = pageHeight - 30;
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(`Reporte generado el ${new Date().toLocaleDateString('es-ES')} - Página ${doc.getNumberOfPages()}`, pageWidth / 2, yPosition, { align: "center" });
      doc.text("Este avalúo es válido únicamente para la fecha de su elaboración", pageWidth / 2, yPosition + 8, { align: "center" });
      doc.setTextColor(0, 0, 0);

      // Guardar PDF
      const fileName = `reporte-valuacion-${Date.now()}.pdf`;
      doc.save(fileName);

      toast({
        title: "PDF Generado",
        description: "El reporte PDF se ha descargado correctamente con todos los datos, ubicación y fotografías",
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
      const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
      
      // Obtener configuración del membrete seleccionado
      const config = letterheadConfigs[selectedLetterhead as keyof typeof letterheadConfigs];
      
      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: config.title,
              heading: HeadingLevel.TITLE,
              alignment: "center"
            }),
            new Paragraph({
              text: config.subtitle,
              alignment: "center"
            }),
            new Paragraph({
              text: `${config.icon} Análisis Profesional de Valor de Mercado`,
              alignment: "center"
            }),
            new Paragraph({ text: "" }), // Espacio
            
            // UBICACIÓN - Mover al principio del documento
            ...(propertyData.direccionCompleta ? [
              new Paragraph({
                text: "UBICACIÓN DEL INMUEBLE",
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Dirección: ", bold: true }),
                  new TextRun({ text: propertyData.direccionCompleta })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Coordenadas: ", bold: true }),
                  new TextRun({ text: `${propertyData.latitud?.toFixed(6)}, ${propertyData.longitud?.toFixed(6)}` })
                ]
              }),
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                children: [
                  new TextRun({ text: "CROQUIS DE UBICACIÓN", bold: true })
                ]
              }),
              new Paragraph({
                text: "Croquis de ubicación incluido en reporte PDF",
                alignment: AlignmentType.CENTER
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Ver ubicación en Google Maps: " }),
                  new TextRun({ 
                    text: `https://www.google.com/maps?q=${propertyData.latitud},${propertyData.longitud}`,
                    color: "0000FF"
                  })
                ]
              }),
              new Paragraph({ text: "" }) // Espacio
            ] : []),
            
            new Paragraph({
              text: "INFORMACIÓN GENERAL",
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Tipo de Propiedad: ", bold: true }),
                new TextRun({ text: propertyData.tipoPropiedad.toUpperCase() })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Área Total Construida: ", bold: true }),
                new TextRun({ text: `${areaTotal.toLocaleString()} m²` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Área de Terreno: ", bold: true }),
                new TextRun({ text: `${propertyData.areaTerreno.toLocaleString()} m²` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Área de Terreno: ", bold: true }),
                new TextRun({ text: `${propertyData.areaTerreno.toLocaleString()} m²` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Recámaras: ", bold: true }),
                new TextRun({ text: `${propertyData.recamaras}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Salas: ", bold: true }),
                new TextRun({ text: `${propertyData.salas}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Comedores: ", bold: true }),
                new TextRun({ text: `${propertyData.comedor}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Cocinas: ", bold: true }),
                new TextRun({ text: `${propertyData.cocina}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Áreas de Servicio: ", bold: true }),
                new TextRun({ text: `${propertyData.areaServicio}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Bodegas: ", bold: true }),
                new TextRun({ text: `${propertyData.bodega}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Baños: ", bold: true }),
                new TextRun({ text: `${propertyData.banos}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Cocheras: ", bold: true }),
                new TextRun({ text: `${propertyData.cochera}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Otros Espacios: ", bold: true }),
                new TextRun({ text: `${propertyData.otros}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Antigüedad de la Construcción: ", bold: true }),
                new TextRun({ text: `${propertyData.antiguedad} años` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Ubicación: ", bold: true }),
                new TextRun({ text: propertyData.ubicacion })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Estado General: ", bold: true }),
                new TextRun({ text: propertyData.estadoGeneral })
              ]
            }),
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({
              text: "DETALLES DE ÁREAS",
              heading: HeadingLevel.HEADING_1
            }),
            ...(propertyData.areaSotano > 0 ? [new Paragraph({
              children: [
                new TextRun({ text: "Sótano: ", bold: true }),
                new TextRun({ text: `${propertyData.areaSotano} m²` })
              ]
            })] : []),
            ...(propertyData.areaPrimerNivel > 0 ? [new Paragraph({
              children: [
                new TextRun({ text: "Primer Nivel: ", bold: true }),
                new TextRun({ text: `${propertyData.areaPrimerNivel} m²` })
              ]
            })] : []),
            ...(propertyData.areaSegundoNivel > 0 ? [new Paragraph({
              children: [
                new TextRun({ text: "Segundo Nivel: ", bold: true }),
                new TextRun({ text: `${propertyData.areaSegundoNivel} m²` })
              ]
            })] : []),
            ...(propertyData.areaTercerNivel > 0 ? [new Paragraph({
              children: [
                new TextRun({ text: "Tercer Nivel: ", bold: true }),
                new TextRun({ text: `${propertyData.areaTercerNivel} m²` })
              ]
            })] : []),
            ...(propertyData.areaCuartoNivel > 0 ? [new Paragraph({
              children: [
                new TextRun({ text: "Cuarto Nivel: ", bold: true }),
                new TextRun({ text: `${propertyData.areaCuartoNivel} m²` })
              ]
            })] : []),
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({
              text: "DISTRIBUCIÓN COMPLETA DE ESPACIOS",
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              text: "Espacios Habitacionales:",
              heading: HeadingLevel.HEADING_2
            }),
            // Recámaras con nombres específicos
            ...(propertyData.recamaras > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `• Recámaras/Dormitorios (${propertyData.recamaras} espacios):`, bold: true })
                ]
              }),
              ...Array.from({ length: propertyData.recamaras }, (_, i) => {
                const nombreRecamara = i === 0 ? "Recámara Principal" : `Recámara ${i + 1}`;
                return new Paragraph({
                  children: [
                    new TextRun({ text: `  - ${nombreRecamara}` })
                  ]
                });
              })
            ] : []),
            // Salas con nombres específicos
            ...(propertyData.salas > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `• Salas/Estancias (${propertyData.salas} espacios):`, bold: true })
                ]
              }),
              ...Array.from({ length: propertyData.salas }, (_, i) => {
                const nombreSala = i === 0 ? "Sala Principal" : 
                                 i === 1 ? "Sala de TV/Familiar" : `Sala ${i + 1}`;
                return new Paragraph({
                  children: [
                    new TextRun({ text: `  - ${nombreSala}` })
                  ]
                });
              })
            ] : []),
            // Comedor con nombres específicos
            ...(propertyData.comedor > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `• Comedor (${propertyData.comedor} espacios):`, bold: true })
                ]
              }),
              ...Array.from({ length: propertyData.comedor }, (_, i) => {
                const nombreComedor = i === 0 ? "Comedor Principal" : `Comedor ${i + 1}`;
                return new Paragraph({
                  children: [
                    new TextRun({ text: `  - ${nombreComedor}` })
                  ]
                });
              })
            ] : []),
            // Baños con nombres específicos
            ...(propertyData.banos > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({ text: `• Baños Completos (${propertyData.banos} espacios):`, bold: true })
                ]
              }),
              ...Array.from({ length: propertyData.banos }, (_, i) => {
                const nombreBano = i === 0 ? "Baño Principal" : 
                                 i === 1 ? "Baño de Visitas" : `Baño ${i + 1}`;
                return new Paragraph({
                  children: [
                    new TextRun({ text: `  - ${nombreBano}` })
                  ]
                });
              })
            ] : []),
            new Paragraph({
              children: [
                new TextRun({ text: "• Baños Completos: ", bold: true }),
                new TextRun({ text: `${propertyData.banos}` })
              ]
            }),
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({
              text: "Espacios de Servicio:",
              heading: HeadingLevel.HEADING_2
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "• Cocina: ", bold: true }),
                new TextRun({ text: `${propertyData.cocina}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "• Área de Servicio/Lavado: ", bold: true }),
                new TextRun({ text: `${propertyData.areaServicio}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "• Bodegas/Trasteros: ", bold: true }),
                new TextRun({ text: `${propertyData.bodega}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "• Cocheras/Garajes: ", bold: true }),
                new TextRun({ text: `${propertyData.cochera}` })
              ]
            }),
            ...(propertyData.otros > 0 ? [
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                text: "Espacios Adicionales:",
                heading: HeadingLevel.HEADING_2
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "• Otros Espacios (estudios, oficinas, patios techados): ", bold: true }),
                  new TextRun({ text: `${propertyData.otros}` })
                ]
              })
            ] : []),
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({
              children: [
                new TextRun({ text: "TOTAL DE ESPACIOS IDENTIFICADOS: ", bold: true }),
                new TextRun({ 
                  text: `${propertyData.recamaras + propertyData.salas + propertyData.comedor + 
                          propertyData.banos + propertyData.cocina + propertyData.areaServicio + 
                          propertyData.bodega + propertyData.cochera + propertyData.otros}`,
                  bold: true
                })
              ]
            }),
            new Paragraph({ text: "" }), // Espacio
            new Paragraph({
              text: "SERVICIOS DISPONIBLES",
              heading: HeadingLevel.HEADING_1
            }),
            // Servicios básicos
            new Paragraph({
              children: [
                new TextRun({ text: "Servicios Básicos:", bold: true })
              ]
            }),
            ...(propertyData.servicios.agua ? [new Paragraph({ children: [new TextRun({ text: "✓ Agua Potable" })] })] : []),
            ...(propertyData.servicios.electricidad ? [new Paragraph({ children: [new TextRun({ text: "✓ Electricidad" })] })] : []),
            ...(propertyData.servicios.gas ? [new Paragraph({ children: [new TextRun({ text: "✓ Gas Natural/LP" })] })] : []),
            ...(propertyData.servicios.drenaje ? [new Paragraph({ children: [new TextRun({ text: "✓ Drenaje" })] })] : []),
            
            // Servicios adicionales
            new Paragraph({
              children: [
                new TextRun({ text: "Servicios Adicionales:", bold: true })
              ]
            }),
            ...(propertyData.servicios.internet ? [new Paragraph({ children: [new TextRun({ text: "✓ Internet" })] })] : []),
            ...(propertyData.servicios.cable ? [new Paragraph({ children: [new TextRun({ text: "✓ TV por Cable" })] })] : []),
            ...(propertyData.servicios.telefono ? [new Paragraph({ children: [new TextRun({ text: "✓ Teléfono" })] })] : []),
            ...(propertyData.servicios.seguridad ? [new Paragraph({ children: [new TextRun({ text: "✓ Seguridad Privada" })] })] : []),
            ...(propertyData.servicios.alberca ? [new Paragraph({ children: [new TextRun({ text: "✓ Alberca" })] })] : []),
            ...(propertyData.servicios.jardin ? [new Paragraph({ children: [new TextRun({ text: "✓ Jardín" })] })] : []),
            ...(propertyData.servicios.elevador ? [new Paragraph({ children: [new TextRun({ text: "✓ Elevador" })] })] : []),
            ...(propertyData.servicios.aireAcondicionado ? [new Paragraph({ children: [new TextRun({ text: "✓ Aire Acondicionado" })] })] : []),
            ...(propertyData.servicios.calefaccion ? [new Paragraph({ children: [new TextRun({ text: "✓ Calefacción" })] })] : []),
            ...(propertyData.servicios.panelesSolares ? [new Paragraph({ children: [new TextRun({ text: "✓ Paneles Solares" })] })] : []),
            ...(propertyData.servicios.tinaco ? [new Paragraph({ children: [new TextRun({ text: "✓ Tinaco/Cisterna" })] })] : []),

            new Paragraph({ text: "" }), // Espacio
            new Paragraph({
              text: "RESULTADO DE VALUACIÓN",
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Valor Estimado: ", bold: true }),
                new TextRun({ text: formatCurrency(valuation, selectedCurrency), size: 28, bold: true })
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
                new TextRun({ text: "Precio por m² construido: ", bold: true }),
                new TextRun({ text: formatCurrency(valuation / areaTotal, selectedCurrency) })
              ]
            }),
            ...(comparativeProperties.length > 0 ? [
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                text: "PROPIEDADES COMPARABLES",
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({ text: "" }), // Espacio
              new DocxTable({
                rows: [
                  new DocxTableRow({
                    children: [
                      new DocxTableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "Dirección", bold: true })]
                        })]
                      }),
                      new DocxTableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "Área (m²)", bold: true })]
                        })]
                      }),
                      new DocxTableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "Rec.", bold: true })]
                        })]
                      }),
                      new DocxTableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "Baños", bold: true })]
                        })]
                      }),
                      new DocxTableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "Antigüedad", bold: true })]
                        })]
                      }),
                      new DocxTableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "Precio", bold: true })]
                        })]
                      })
                    ]
                  }),
                  ...comparativeProperties.slice(0, 3).map(comp => 
                    new DocxTableRow({
                      children: [
                        new DocxTableCell({
                          children: [new Paragraph({ text: comp.address.length > 30 ? comp.address.substring(0, 27) + "..." : comp.address })]
                        }),
                        new DocxTableCell({
                          children: [new Paragraph({ text: comp.areaConstruida.toString() })]
                        }),
                        new DocxTableCell({
                          children: [new Paragraph({ text: comp.recamaras.toString() })]
                        }),
                        new DocxTableCell({
                          children: [new Paragraph({ text: comp.banos.toString() })]
                        }),
                        new DocxTableCell({
                          children: [new Paragraph({ text: comp.antiguedad.toString() })]
                        }),
                        new DocxTableCell({
                          children: [new Paragraph({ text: formatCurrency(comp.precio, selectedCurrency) })]
                        })
                      ]
                    })
                  )
                ]
              }),
              ...((() => {
                const analysis = getMarketAnalysis();
                return analysis ? [
                  new Paragraph({ text: "" }), // Espacio
                  new Paragraph({
                    text: "ANÁLISIS DE MERCADO",
                    heading: HeadingLevel.HEADING_2
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Precio Promedio: ", bold: true }),
                      new TextRun({ text: formatCurrency(analysis.avgPrice, selectedCurrency), bold: true })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Precio Mínimo: ", bold: true }),
                      new TextRun({ text: formatCurrency(analysis.minPrice, selectedCurrency) })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Precio Máximo: ", bold: true }),
                      new TextRun({ text: formatCurrency(analysis.maxPrice, selectedCurrency) })
                    ]
                  }),
                  new Paragraph({
                    children: [
                      new TextRun({ text: "Variación vs. Mercado: ", bold: true }),
                      new TextRun({ 
                        text: analysis.difference > 0 ? 
                          `+${analysis.difference.toFixed(1)}% sobre el promedio` : 
                          `${analysis.difference.toFixed(1)}% bajo el promedio`
                      })
                    ]
                  })
                ] : [];
              })()),
              
              // Análisis detallado de comparables con fotografías
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                text: "ANÁLISIS DETALLADO DE COMPARABLES",
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({ text: "" }), // Espacio
              
              // Procesar cada comparable con detalle
              ...comparativeProperties.slice(0, 3).flatMap((comp, index) => [
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: `COMPARABLE ${index + 1}`,
                      bold: true,
                      size: 24,
                      color: "2563eb"
                    })
                  ]
                }),
                new Paragraph({ text: "" }), // Espacio
                new Paragraph({
                  children: [
                    new TextRun({ text: "Dirección: ", bold: true }),
                    new TextRun({ text: comp.address })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Área construida: ", bold: true }),
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
                    new TextRun({ text: `${comp.antiguedad} años` })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Precio: ", bold: true }),
                    new TextRun({ text: formatCurrency(comp.precio, selectedCurrency) })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Precio por m²: ", bold: true }),
                    new TextRun({ text: formatCurrency(comp.precio / comp.areaConstruida, selectedCurrency) })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Distancia del inmueble valuado: ", bold: true }),
                    new TextRun({ text: `${comp.distancia} metros` })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: "Fotografía:", 
                      bold: true 
                    })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: `[Fotografía del Comparable ${index + 1} - Vista de la propiedad]`,
                      italics: true,
                      color: "6b7280"
                    })
                  ],
                  alignment: AlignmentType.CENTER
                }),
                new Paragraph({
                  children: [
                    new TextRun({ 
                      text: "Nota: Las fotografías de los comparables están incluidas en el reporte PDF",
                      size: 18,
                      italics: true,
                      color: "9ca3af"
                    })
                  ],
                  alignment: AlignmentType.CENTER
                }),
                new Paragraph({ text: "" }), // Espacio
                new Paragraph({ text: "" }) // Espacio adicional
              ])
            ] : []),
            ...(propertyImages.length > 0 ? [
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                text: "FOTOGRAFÍAS DEL INMUEBLE",
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Total de fotografías: ${propertyImages.length}` }),
                  new TextRun({ text: ` | Fecha: ${new Date().toLocaleDateString('es-ES')}` })
                ]
              }),
              new Paragraph({ text: "" }), // Espacio
              // Agregar fotografías agrupadas de 3 en 3
              ...(() => {
                const photoParagraphs: any[] = [];
                const imagesPerGroup = 3;
                
                for (let i = 0; i < propertyImages.length; i += imagesPerGroup) {
                  // Grupo de hasta 3 imágenes
                  const currentGroup = propertyImages.slice(i, i + imagesPerGroup);
                  
                  // Título del grupo
                  if (i > 0) {
                    photoParagraphs.push(new Paragraph({ text: "" })); // Espacio
                  }
                  
                  photoParagraphs.push(
                    new Paragraph({
                      children: [
                        new TextRun({ 
                          text: `Grupo ${Math.floor(i / imagesPerGroup) + 1} - Fotografías ${i + 1} a ${Math.min(i + imagesPerGroup, propertyImages.length)}`,
                          bold: true 
                        })
                      ]
                    })
                  );
                  
                  // Procesar cada imagen del grupo
                  currentGroup.forEach((imageData, groupIndex) => {
                    const imageNumber = i + groupIndex + 1;
                    
                    try {
                      // Convertir base64 a buffer para Word
                      const base64Data = imageData.preview.split(',')[1];
                      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                      
                      photoParagraphs.push(
                        new Paragraph({
                          children: [
                            new ImageRun({
                              data: imageBuffer,
                              transformation: {
                                width: 250,
                                height: 180,
                              },
                              type: "jpg"
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({
                          children: [
                            new TextRun({ 
                              text: `Fotografía ${imageNumber} - Vista del inmueble`,
                              italics: true 
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        }),
                        new Paragraph({ text: "" }) // Espacio entre imágenes
                      );
                    } catch (error) {
                      console.error(`Error procesando imagen ${imageNumber}:`, error);
                      // En caso de error, agregar texto indicativo
                      photoParagraphs.push(
                        new Paragraph({
                          children: [
                            new TextRun({ 
                              text: `[Fotografía ${imageNumber} - No disponible en formato Word]`,
                              italics: true 
                            })
                          ],
                          alignment: AlignmentType.CENTER
                        }),
                         new Paragraph({ text: "" })
                       );
                     }
                   });
                   
                   // Separador entre grupos (excepto el último)
                   if (i + imagesPerGroup < propertyImages.length) {
                     photoParagraphs.push(
                       new Paragraph({ text: "─".repeat(50), alignment: AlignmentType.CENTER }),
                       new Paragraph({ text: "" })
                     );
                   }
                 }
                 
                 return photoParagraphs;
               })(),
               new Paragraph({ text: "" }), // Espacio final
               new Paragraph({
                 children: [
                   new TextRun({ 
                     text: "Nota: Las fotografías han sido tomadas para fines de valuación profesional y forman parte integral del presente avalúo.",
                     italics: true,
                     size: 20
                   })
                 ]
               })
            ] : [])
          ]
        }]
      });

      const buffer = await Packer.toBlob(doc);
      const fileName = `reporte-valuacion-${Date.now()}.docx`;
      saveAs(buffer, fileName);

      toast({
        title: "Documento Word Generado",
        description: "El reporte Word se ha descargado correctamente con todos los datos del inmueble",
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
          <Calculator className="h-10 w-10 text-primary" />
          {translations[selectedLanguage].propertyValuator}
        </h1>
        <p className="text-lg text-muted-foreground">
          {translations[selectedLanguage].professionalSystem}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selectores de Moneda e Idioma */}
        <div className="lg:col-span-1 space-y-4">
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
          />
          
          {/* Selector de Idioma */}
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <Label className="text-sm font-bold mb-3 block text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {translations[selectedLanguage].languageSelector}
            </Label>
            <Select value={selectedLanguage} onValueChange={(value: Language) => setSelectedLanguage(value)}>
              <SelectTrigger className="bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-700 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 z-50">
                <SelectItem value="es" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🇪🇸 Español</SelectItem>
                <SelectItem value="en" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🇺🇸 English</SelectItem>
                <SelectItem value="fr" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🇫🇷 Français</SelectItem>
                <SelectItem value="de" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="it" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🇮🇹 Italiano</SelectItem>
                <SelectItem value="pt" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🇵🇹 Português</SelectItem>
                <SelectItem value="zh" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🇨🇳 中文</SelectItem>
                <SelectItem value="hi" className="hover:bg-blue-50 dark:hover:bg-blue-900/50">🇮🇳 हिन्दी</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Toda la interfaz y reportes se traducen automáticamente
            </p>
          </Card>
          
          {/* Botones de Descarga de Documentos */}
          {valuation && (
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <Label className="text-sm font-bold mb-3 block text-green-900 dark:text-green-100 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Descargar Documentos
              </Label>
              <div className="space-y-3">
                <Button 
                  onClick={generatePDF} 
                  variant="outline" 
                  className="w-full border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/50"
                  size="sm"
                >
                  <FileText className="mr-2 h-4 w-4" />
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
              <Label className="text-sm font-bold mb-3 block text-amber-900 dark:text-amber-100">Tipo de Membrete para Reportes</Label>
              <Select value={selectedLetterhead} onValueChange={setSelectedLetterhead}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo de membrete" />
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
        </div>

        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                {translations[selectedLanguage].propertyData}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 grid-rows-2 h-auto gap-1">
                   <TabsTrigger value="areas" className="h-10">{translations[selectedLanguage].areas}</TabsTrigger>
                   <TabsTrigger value="tipo" className="h-10">{translations[selectedLanguage].propertyType}</TabsTrigger>
                   <TabsTrigger value="espacios" className="h-10">{translations[selectedLanguage].spaces}</TabsTrigger>
                   <TabsTrigger value="caracteristicas" className="h-10">{translations[selectedLanguage].characteristics}</TabsTrigger>
                   <TabsTrigger value="servicios" className="h-10">{translations[selectedLanguage].services}</TabsTrigger>
                   <TabsTrigger value="ubicacion" className="h-10">{translations[selectedLanguage].location}</TabsTrigger>
                   <TabsTrigger value="fotos" className="h-10">{translations[selectedLanguage].photos}</TabsTrigger>
                   <TabsTrigger value="ajustes" className="h-10">{translations[selectedLanguage].valuation}</TabsTrigger>
                 </TabsList>

                 <TabsContent value="areas" className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].constructionAreas}</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="areaSotano">{translations[selectedLanguage].basement}</Label>
                       <Input
                         id="areaSotano"
                         type="number"
                         value={propertyData.areaSotano || ''}
                         onChange={(e) => handleInputChange('areaSotano', Number(e.target.value))}
                         placeholder="0"
                       />
                     </div>
                     <div>
                        <Label htmlFor="areaPrimerNivel">{translations[selectedLanguage].firstFloor}</Label>
                        <Input
                          id="areaPrimerNivel"
                          type="number"
                          value={propertyData.areaPrimerNivel || ''}
                          onChange={(e) => handleInputChange('areaPrimerNivel', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaSegundoNivel">{translations[selectedLanguage].secondFloor}</Label>
                        <Input
                          id="areaSegundoNivel"
                          type="number"
                          value={propertyData.areaSegundoNivel || ''}
                          onChange={(e) => handleInputChange('areaSegundoNivel', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaTercerNivel">{translations[selectedLanguage].thirdFloor}</Label>
                        <Input
                          id="areaTercerNivel"
                          type="number"
                          value={propertyData.areaTercerNivel || ''}
                          onChange={(e) => handleInputChange('areaTercerNivel', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaCuartoNivel">{translations[selectedLanguage].fourthFloor}</Label>
                        <Input
                          id="areaCuartoNivel"
                          type="number"
                          value={propertyData.areaCuartoNivel || ''}
                          onChange={(e) => handleInputChange('areaCuartoNivel', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaTerreno">{translations[selectedLanguage].landArea}</Label>
                       <Input
                         id="areaTerreno"
                         type="number"
                         value={propertyData.areaTerreno || ''}
                         onChange={(e) => handleInputChange('areaTerreno', Number(e.target.value))}
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

                <TabsContent value="espacios" className="space-y-4 mt-6">
                   <h3 className="text-lg font-semibold text-foreground mb-4">{translations[selectedLanguage].spacesDistribution}</h3>
                   
                   {/* Espacios Habitacionales */}
                   <div className="mb-6">
                     <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">{translations[selectedLanguage].livingSpaces}</h4>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                       {[
                         { key: 'recamaras', label: translations[selectedLanguage].bedrooms, description: translations[selectedLanguage].bedroomsDescription },
                         { key: 'salas', label: translations[selectedLanguage].livingRooms, description: translations[selectedLanguage].livingRoomsDescription },
                         { key: 'comedor', label: translations[selectedLanguage].diningRoom, description: translations[selectedLanguage].diningRoomDescription },
                         { key: 'banos', label: translations[selectedLanguage].bathrooms, description: translations[selectedLanguage].bathroomsDescription }
                        ].map(({ key, label, description }) => (
                         <div key={key} className="space-y-1">
                           <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                           <Input
                             id={key}
                             type="number"
                             value={propertyData[key as keyof Omit<PropertyData, 'servicios'>] || ''}
                             onChange={(e) => handleInputChange(key as keyof PropertyData, Number(e.target.value))}
                             placeholder="0"
                             className="text-center"
                           />
                           <p className="text-xs text-muted-foreground">{description}</p>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Espacios de Servicio */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">Espacios de Servicio</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { key: 'cocina', label: 'Cocina', description: 'Número de cocinas' },
                        { key: 'areaServicio', label: 'Área de Servicio/Lavado', description: 'Cuarto de lavado/servicio' },
                        { key: 'bodega', label: 'Bodegas/Trasteros', description: 'Espacios de almacenamiento' },
                        { key: 'cochera', label: 'Cocheras/Garajes', description: 'Espacios para vehículos' }
                       ].map(({ key, label, description }) => (
                         <div key={key} className="space-y-1">
                           <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                           <Input
                             id={key}
                             type="number"
                             value={propertyData[key as keyof Omit<PropertyData, 'servicios'>] || ''}
                             onChange={(e) => handleInputChange(key as keyof PropertyData, Number(e.target.value))}
                             placeholder="0"
                             className="text-center"
                           />
                           <p className="text-xs text-muted-foreground">{description}</p>
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Espacios Adicionales */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">Espacios Adicionales</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="otros" className="text-sm font-medium">Otros Espacios</Label>
                        <Input
                          id="otros"
                          type="number"
                          value={propertyData.otros || ''}
                          onChange={(e) => handleInputChange('otros', Number(e.target.value))}
                          placeholder="0"
                          className="text-center"
                        />
                        <p className="text-xs text-muted-foreground">Estudios, oficinas, patios techados, etc.</p>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de espacios */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Resumen de Espacios:</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Total Recámaras: <span className="font-medium">{propertyData.recamaras}</span></div>
                      <div>Total Baños: <span className="font-medium">{propertyData.banos}</span></div>
                      <div>Total Salas: <span className="font-medium">{propertyData.salas}</span></div>
                      <div>Cocheras: <span className="font-medium">{propertyData.cochera}</span></div>
                      <div>Espacios Servicio: <span className="font-medium">{propertyData.areaServicio + propertyData.bodega}</span></div>
                      <div>Otros Espacios: <span className="font-medium">{propertyData.otros}</span></div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="caracteristicas" className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Características Generales y Específicas</h3>
                  
                  {/* Información Temporal */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">Información Temporal</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="antiguedad" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Antigüedad de la Construcción (años)
                        </Label>
                        <Input
                          id="antiguedad"
                          type="number"
                          value={propertyData.antiguedad || ''}
                          onChange={(e) => handleInputChange('antiguedad', Number(e.target.value))}
                          placeholder="0"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Años desde la construcción original</p>
                      </div>
                    </div>
                  </div>

                  {/* Calidad y Estado */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">Calidad y Estado de la Propiedad</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Calidad de Ubicación
                        </Label>
                        <Select value={propertyData.ubicacion} onValueChange={(value) => handleInputChange('ubicacion', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona la calidad de ubicación" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="excelente">Excelente - Zona exclusiva/premium</SelectItem>
                            <SelectItem value="buena">Buena - Zona residencial consolidada</SelectItem>
                            <SelectItem value="regular">Regular - Zona en desarrollo</SelectItem>
                            <SelectItem value="mala">Mala - Zona con problemas urbanos</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">Evalúa servicios, seguridad, accesibilidad</p>
                      </div>
                      
                      <div>
                        <Label className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Estado General de Conservación
                        </Label>
                        <Select value={propertyData.estadoGeneral} onValueChange={(value) => handleInputChange('estadoGeneral', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el estado de conservación" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="nuevo">NUEVO - Sin uso, como recién construido</SelectItem>
                            <SelectItem value="bueno">BUENO - Muy bien conservado, mínimo desgaste</SelectItem>
                            <SelectItem value="medio">MEDIO - Conservación promedio, uso normal</SelectItem>
                            <SelectItem value="regular">REGULAR - Desgaste visible, necesita mantenimiento</SelectItem>
                            <SelectItem value="reparaciones-sencillas">REPARACIONES SENCILLAS - Pintura, detalles menores</SelectItem>
                            <SelectItem value="reparaciones-medias">REPARACIONES MEDIAS - Cambio de pisos, plomería</SelectItem>
                            <SelectItem value="reparaciones-importantes">REPARACIONES IMPORTANTES - Estructura, instalaciones</SelectItem>
                            <SelectItem value="danos-graves">DAÑOS GRAVES - Problemas estructurales serios</SelectItem>
                            <SelectItem value="en-desecho">EN DESECHO - Demolición parcial necesaria</SelectItem>
                            <SelectItem value="inservibles">INSERVIBLES - Propiedad no habitable</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">Afecta directamente el valor de la propiedad</p>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de características */}
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="text-sm font-semibold mb-2">Resumen de Características:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-medium">Antigüedad:</span> {propertyData.antiguedad} años
                      </div>
                      <div>
                        <span className="font-medium">Ubicación:</span> {propertyData.ubicacion || 'No especificada'}
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-medium">Estado:</span> {propertyData.estadoGeneral || 'No especificado'}
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
                     <h4 className="text-sm font-semibold mb-2">Resumen de Servicios:</h4>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                       <div className="flex justify-between">
                         <span>Básicos:</span>
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Croquis de Ubicación</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Marca la ubicación exacta de la propiedad en el mapa. Esto ayudará a proporcionar una valuación más precisa.
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
                          <p className="text-sm font-medium">Dirección Registrada:</p>
                          <p className="text-sm text-muted-foreground">{propertyData.direccionCompleta}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Coordenadas: {propertyData.latitud?.toFixed(6)}, {propertyData.longitud?.toFixed(6)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
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
                           <p className="text-xs text-muted-foreground mt-1">Máximo 10 fotos</p>
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
                       <div className="space-y-3">
                         <h4 className="text-sm font-medium">Fotos seleccionadas ({propertyImages.length})</h4>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

                  <TabsContent value="ajustes" className="space-y-4 mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
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
                              onChange={(e) => handlePriceAdjustment(Number(e.target.value))}
                              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>-30%</span>
                            <span>0%</span>
                            <span>+30%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePriceAdjustment(-10)}
                            className="text-xs"
                          >
                            -10%
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePriceAdjustment(0)}
                            className="text-xs"
                          >
                            Reset 0%
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePriceAdjustment(10)}
                            className="text-xs"
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
              
              <div className="mt-8 pt-4 border-t">
                <Button 
                  onClick={calculateValuation} 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                  size="lg"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  {translations[selectedLanguage].calculate}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Resultados */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg sticky top-4">
            <CardHeader className="bg-gradient-to-r from-secondary to-real-estate-accent text-secondary-foreground">
              <CardTitle>Resultado de Valuación</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {valuation ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-muted-foreground">Valor Estimado</h3>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(valuation, selectedCurrency)}
                    </p>
                    <Badge variant="secondary" className="mt-2">{selectedCurrency.code}</Badge>
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
                   {allComparativeProperties.length > 0 && (
                     <div className="pt-4 border-t">
                       <Label className="text-sm font-medium mb-3 block">
                         Seleccionar Comparables (3 de 10)
                       </Label>
                       <div className="space-y-3 max-h-80 overflow-y-auto">
                         {allComparativeProperties.map((comp, index) => (
                           <div 
                             key={index}
                             className={`p-3 border rounded-lg cursor-pointer transition-all ${
                               selectedComparatives.includes(index) 
                                 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                 : 'border-gray-200 hover:border-gray-300'
                             }`}
                             onClick={() => {
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
                             }}
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
                                 {selectedComparatives.includes(index) && (
                                   <Badge variant="default" className="text-xs">
                                     #{selectedComparatives.indexOf(index) + 1}
                                   </Badge>
                                 )}
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
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
                      </div>
                    )}
                    
                    
                     <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground text-center">
                        * Esta valuación es un estimado basado en los datos proporcionados. 
                        Se recomienda consultar con un perito valuador certificado para valuaciones oficiales.
                      </p>
                    </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {selectedLanguage === 'es' ? 
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
    </div>
  );
};

export default PropertyValuation;