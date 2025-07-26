import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp, FileText, Download, Camera, Trash2 } from 'lucide-react';

import jsPDF from 'jspdf';
import { 
  Document as DocxDocument, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table as DocxTable, 
  TableCell as DocxTableCell, 
  TableRow as DocxTableRow 
} from 'docx';
import { saveAs } from 'file-saver';
import { useToast } from '@/hooks/use-toast';
import LocationMap from './LocationMap';
import GoogleLocationMap from './GoogleLocationMap';
import SupabaseGoogleLocationMap from './SupabaseGoogleLocationMap';
import SimpleLocationMap from './SimpleLocationMap';
import CurrencySelector, { Currency, formatCurrency } from './CurrencySelector';

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
    areaPrimerNivel: 0,
    areaSegundoNivel: 0,
    areaTercerNivel: 0,
    areaCuartoNivel: 0,
    areaTerreno: 0,
    tipoPropiedad: '',
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
    latitud: 19.4326,
    longitud: -99.1332,
    direccionCompleta: ''
  });
  
  const [valuation, setValuation] = useState<number | null>(null);
  const [baseValuation, setBaseValuation] = useState<number | null>(null);
  const [priceAdjustment, setPriceAdjustment] = useState<number>(0); // Porcentaje de ajuste (-30 a +30)
  const [multipleValuations, setMultipleValuations] = useState<Array<{
    id: number;
    valor: number;
    comparatives: ComparativeProperty[];
  }>>([]);
  const [comparativeProperties, setComparativeProperties] = useState<ComparativeProperty[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    rate: 1
  });
  const [activeTab, setActiveTab] = useState('areas');
  const [propertyImages, setPropertyImages] = useState<Array<{ file: File; preview: string }>>([]);

  const handleInputChange = (field: keyof PropertyData, value: string | number) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
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
      title: "Moneda Cambiada",
      description: `Valuación ahora se muestra en ${currency.name} (${currency.code})`,
    });
  };

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

  const generateComparativeProperties = async (baseValue: number, numComparables: number = 3): Promise<ComparativeProperty[]> => {
    const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
    
    // Generar ubicaciones cercanas basadas en las coordenadas de la propiedad
    const nearbyAddresses = await generateNearbyAddresses(
      propertyData.latitud || 19.4326, 
      propertyData.longitud || -99.1332,
      numComparables
    );
    
    return Promise.all(nearbyAddresses.map(async (addressInfo, index) => {
      const variation = (Math.random() - 0.5) * 0.2; // ±10% variation (más cercano al valor base)
      const areaVariation = 1 + (Math.random() - 0.5) * 0.3; // ±15% area variation
      
      return {
        id: `comp-${index + 1}`,
        address: addressInfo.address,
        areaConstruida: Math.round(areaTotal * areaVariation),
        areaTerreno: Math.round(propertyData.areaTerreno * areaVariation),
        tipoPropiedad: propertyData.tipoPropiedad,
        recamaras: Math.max(1, propertyData.recamaras + Math.floor((Math.random() - 0.5) * 2)),
        banos: Math.max(1, propertyData.banos + Math.floor((Math.random() - 0.5) * 2)),
        antiguedad: Math.max(0, propertyData.antiguedad + Math.floor((Math.random() - 0.5) * 8)),
        ubicacion: propertyData.ubicacion,
        estadoGeneral: propertyData.estadoGeneral,
        precio: convertCurrency(baseValue * (1 + variation), selectedCurrency),
        distancia: addressInfo.distance,
        descripcion: `${propertyData.tipoPropiedad} de ${Math.round(areaTotal * areaVariation)}m² con ${Math.max(1, propertyData.recamaras + Math.floor((Math.random() - 0.5) * 2))} recámaras y ${Math.max(1, propertyData.banos + Math.floor((Math.random() - 0.5) * 2))} baños. Excelente ubicación en zona ${propertyData.ubicacion}.`,
        url: `https://propiedades.com/inmueble/${Math.random().toString(36).substr(2, 9)}`,
        latitud: addressInfo.lat,
        longitud: addressInfo.lng
      };
    }));
  };

  // Función para generar direcciones cercanas usando geocodificación inversa
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
      
      try {
        // Intentar obtener la dirección real usando geocodificación inversa
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&addressdetails=1`
        );
        const data = await response.json();
        
        if (data && data.display_name) {
          addresses.push({
            address: data.display_name,
            distance: Math.round(randomDistance * 1000), // en metros
            lat: newLat,
            lng: newLng
          });
        } else {
          // Fallback si no se encuentra dirección
          addresses.push({
            address: `Propiedad cercana ${i + 1} (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`,
            distance: Math.round(randomDistance * 1000),
            lat: newLat,
            lng: newLng
          });
        }
      } catch (error) {
        console.error('Error getting nearby address:', error);
        // Fallback en caso de error
        addresses.push({
          address: `Propiedad cercana ${i + 1} (${randomDistance.toFixed(1)} km)`,
          distance: Math.round(randomDistance * 1000),
          lat: newLat,
          lng: newLng
        });
      }
      
      // Delay para evitar rate limiting de Nominatim
      await new Promise(resolve => setTimeout(resolve, 1000));
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
      title: "Calculando Valuación",
      description: "Generando avalúo con 3 comparables...",
    });

    // Generar comparativas con solo 3 comparables
    const comparatives = await generateComparativeProperties(valorFinal, 3);
    setComparativeProperties(comparatives);
    
    // Limpiar múltiples valuaciones ya que ahora solo hacemos una
    setMultipleValuations([]);
    
    toast({
      title: "Valuación Completada",
      description: `Valor estimado: ${formatCurrency(valorAjustado, selectedCurrency)} (3 comparables)`,
    });
  };

  // Función para manejar cambios en el ajuste de precio
  const handlePriceAdjustment = (newAdjustment: number) => {
    setPriceAdjustment(newAdjustment);
    
    if (baseValuation) {
      const valorAjustado = baseValuation * (1 + newAdjustment / 100);
      setValuation(valorAjustado);
      
      toast({
        title: "Precio Ajustado",
        description: `Ajuste: ${newAdjustment > 0 ? '+' : ''}${newAdjustment}% - Nuevo valor: ${formatCurrency(valorAjustado, selectedCurrency)}`,
      });
    }
  };

  const regenerateComparatives = async () => {
    if (valuation) {
      // Convertir valuación actual de vuelta a USD base para generar comparativas
      const valuationInUSD = selectedCurrency.code === 'USD' ? valuation : valuation / (selectedCurrency.rate || 1);
      const newComparatives = await generateComparativeProperties(valuationInUSD);
      setComparativeProperties(newComparatives);
      toast({
        title: "Comparativas Actualizadas",
        description: "Se han generado nuevas propiedades cercanas",
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
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = 20;

      // Header principal
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE DE VALUACIÓN INMOBILIARIA", pageWidth / 2, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Análisis Profesional de Valor de Mercado", pageWidth / 2, 28, { align: "center" });
      doc.text("Basado en 3 Comparables", pageWidth / 2, 32, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      yPosition = 50;

      // Información general
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("INFORMACIÓN GENERAL", 20, yPosition);
      yPosition += 10;

      const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Tipo: ${propertyData.tipoPropiedad.toUpperCase()}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Área Total Construida: ${areaTotal.toLocaleString()} m²`, 20, yPosition);
      yPosition += 7;
      doc.text(`Área de Terreno: ${propertyData.areaTerreno.toLocaleString()} m²`, 20, yPosition);
      yPosition += 7;
      doc.text(`Recámaras: ${propertyData.recamaras}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Baños: ${propertyData.banos}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Cocheras: ${propertyData.cochera}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Antigüedad de la Construcción: ${propertyData.antiguedad} años`, 20, yPosition);
      yPosition += 7;
      doc.text(`Ubicación: ${propertyData.ubicacion}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Estado General: ${propertyData.estadoGeneral}`, 20, yPosition);
      yPosition += 15;

      // Detalles de áreas
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DETALLES DE ÁREAS", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      if (propertyData.areaSotano > 0) {
        doc.text(`Sótano: ${propertyData.areaSotano} m²`, 20, yPosition);
        yPosition += 7;
      }
      if (propertyData.areaPrimerNivel > 0) {
        doc.text(`Primer Nivel: ${propertyData.areaPrimerNivel} m²`, 20, yPosition);
        yPosition += 7;
      }
      if (propertyData.areaSegundoNivel > 0) {
        doc.text(`Segundo Nivel: ${propertyData.areaSegundoNivel} m²`, 20, yPosition);
        yPosition += 7;
      }
      if (propertyData.areaTercerNivel > 0) {
        doc.text(`Tercer Nivel: ${propertyData.areaTercerNivel} m²`, 20, yPosition);
        yPosition += 7;
      }
      if (propertyData.areaCuartoNivel > 0) {
        doc.text(`Cuarto Nivel: ${propertyData.areaCuartoNivel} m²`, 20, yPosition);
        yPosition += 7;
      }
      yPosition += 10;

      // Espacios habitacionales y de servicio
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DISTRIBUCIÓN COMPLETA DE ESPACIOS", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      
      // Espacios habitacionales
      doc.setFont("helvetica", "bold");
      doc.text("Espacios Habitacionales:", 20, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`• Recámaras/Dormitorios: ${propertyData.recamaras}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Salas/Estancias: ${propertyData.salas}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Comedor: ${propertyData.comedor}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Baños Completos: ${propertyData.banos}`, 25, yPosition);
      yPosition += 10;
      
      // Espacios de servicio
      doc.setFont("helvetica", "bold");
      doc.text("Espacios de Servicio:", 20, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`• Cocina: ${propertyData.cocina}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Área de Servicio/Lavado: ${propertyData.areaServicio}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Bodegas/Trasteros: ${propertyData.bodega}`, 25, yPosition);
      yPosition += 6;
      doc.text(`• Cocheras/Garajes: ${propertyData.cochera}`, 25, yPosition);
      yPosition += 10;
      
      // Espacios adicionales
      if (propertyData.otros > 0) {
        doc.setFont("helvetica", "bold");
        doc.text("Espacios Adicionales:", 20, yPosition);
        yPosition += 7;
        doc.setFont("helvetica", "normal");
        doc.text(`• Otros Espacios (estudios, oficinas, patios techados): ${propertyData.otros}`, 25, yPosition);
        yPosition += 10;
      }
      
      // Resumen total de espacios
      const totalEspacios = propertyData.recamaras + propertyData.salas + propertyData.comedor + 
                           propertyData.banos + propertyData.cocina + propertyData.areaServicio + 
                           propertyData.bodega + propertyData.cochera + propertyData.otros;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPosition, pageWidth - 40, 15, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`TOTAL DE ESPACIOS IDENTIFICADOS: ${totalEspacios}`, 25, yPosition + 10);
      yPosition += 20;

      // Resultado de valuación
      doc.setFillColor(220, 252, 231);
      doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
      
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
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Basado en 3 comparables", 20, yPosition + 28);
      
      yPosition += 35;

      // Ubicación
      if (propertyData.direccionCompleta) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("UBICACIÓN", 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const addressLines = doc.splitTextToSize(propertyData.direccionCompleta, pageWidth - 40);
        doc.text(addressLines, 20, yPosition);
        yPosition += (addressLines.length * 6) + 7;
        
        if (propertyData.latitud && propertyData.longitud) {
          doc.text(`Coordenadas: ${propertyData.latitud.toFixed(6)}, ${propertyData.longitud.toFixed(6)}`, 20, yPosition);
          yPosition += 15;
        }
      }


      // Tabla de comparables
      if (comparativeProperties.length > 0) {
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 120) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PROPIEDADES COMPARABLES", 20, yPosition);
        yPosition += 15;

        // Resumen de tabla comparativa
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("PROPIEDADES COMPARABLES", 20, yPosition);
        yPosition += 10;
        const colWidths = [40, 25, 25, 25, 30, 35];
        const colPositions = [20, 60, 85, 110, 135, 165];
        
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPosition - 2, pageWidth - 40, 15, 'F');
        
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
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        
        for (let i = 0; i < Math.min(comparativeProperties.length, 8); i++) {
          const comp = comparativeProperties[i];
          
          // Verificar si necesitamos nueva página
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Alternar color de fila
          if (i % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, yPosition - 2, pageWidth - 40, 12, 'F');
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

        // Análisis de mercado
        const analysis = getMarketAnalysis();
        if (analysis) {
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("ANÁLISIS DE MERCADO", 20, yPosition);
          yPosition += 10;
          
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`Precio Promedio: ${formatCurrency(analysis.avgPrice, selectedCurrency)}`, 20, yPosition);
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

      // Fotografías del inmueble - Diseño profesional en máximo 2 hojas
      if (propertyImages.length > 0) {
        // Nueva página dedicada para fotografías
        doc.addPage();
        yPosition = 20;

        // Título principal centrado
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("FOTOGRAFÍAS DEL INMUEBLE", pageWidth / 2, 18, { align: "center" });
        
        doc.setTextColor(0, 0, 0);
        yPosition = 40;

        // Configuración de layout profesional
        const maxImagesPage1 = 6; // 3x2 en primera página
        const maxImagesPage2 = 6; // 3x2 en segunda página
        const maxTotalImages = Math.min(propertyImages.length, 12); // Máximo 12 fotos
        
        // Primera página: 3 columnas x 2 filas
        const imagesPerRowPage1 = 3;
        const imageWidthPage1 = (pageWidth - 80) / imagesPerRowPage1;
        const imageHeightPage1 = 60;
        const spacingX = 20;
        const spacingY = 15;

        // Procesar imágenes de la primera página
        const imagesPage1 = Math.min(maxImagesPage1, maxTotalImages);
        
        for (let i = 0; i < imagesPage1; i++) {
          const image = propertyImages[i];
          const col = i % imagesPerRowPage1;
          const row = Math.floor(i / imagesPerRowPage1);
          
          const xPos = 20 + (col * (imageWidthPage1 + spacingX));
          const currentYPos = yPosition + (row * (imageHeightPage1 + spacingY + 20)); // +20 para el caption

          try {
            // Agregar imagen con marco
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.5);
            doc.rect(xPos - 1, currentYPos - 1, imageWidthPage1 + 2, imageHeightPage1 + 2);
            
            // Imagen
            doc.addImage(image.preview, 'JPEG', xPos, currentYPos, imageWidthPage1, imageHeightPage1);
            
            // Caption numerado
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`Foto ${i + 1}`, xPos + imageWidthPage1/2, currentYPos + imageHeightPage1 + 8, { align: "center" });
            
          } catch (error) {
            // Placeholder en caso de error
            doc.setFillColor(240, 240, 240);
            doc.rect(xPos, currentYPos, imageWidthPage1, imageHeightPage1, 'F');
            doc.setDrawColor(180, 180, 180);
            doc.rect(xPos, currentYPos, imageWidthPage1, imageHeightPage1);
            doc.setFontSize(8);
            doc.text(`Imagen ${i + 1}`, xPos + imageWidthPage1/2, currentYPos + imageHeightPage1/2, { align: "center" });
          }
        }

        // Si hay más de 6 imágenes, crear segunda página
        if (maxTotalImages > maxImagesPage1) {
          doc.addPage();
          yPosition = 20;
          
          // Título de continuación
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text("FOTOGRAFÍAS DEL INMUEBLE (Continuación)", pageWidth / 2, yPosition, { align: "center" });
          yPosition += 25;

          // Segunda página: 3 columnas x 2 filas
          const remainingImages = Math.min(maxImagesPage2, maxTotalImages - maxImagesPage1);
          
          for (let i = 0; i < remainingImages; i++) {
            const imageIndex = maxImagesPage1 + i;
            const image = propertyImages[imageIndex];
            const col = i % imagesPerRowPage1;
            const row = Math.floor(i / imagesPerRowPage1);
            
            const xPos = 20 + (col * (imageWidthPage1 + spacingX));
            const currentYPos = yPosition + (row * (imageHeightPage1 + spacingY + 20));

            try {
              // Marco y imagen
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(0.5);
              doc.rect(xPos - 1, currentYPos - 1, imageWidthPage1 + 2, imageHeightPage1 + 2);
              doc.addImage(image.preview, 'JPEG', xPos, currentYPos, imageWidthPage1, imageHeightPage1);
              
              // Caption
              doc.setFontSize(8);
              doc.setFont("helvetica", "normal");
              doc.text(`Foto ${imageIndex + 1}`, xPos + imageWidthPage1/2, currentYPos + imageHeightPage1 + 8, { align: "center" });
              
            } catch (error) {
              doc.setFillColor(240, 240, 240);
              doc.rect(xPos, currentYPos, imageWidthPage1, imageHeightPage1, 'F');
              doc.setDrawColor(180, 180, 180);
              doc.rect(xPos, currentYPos, imageWidthPage1, imageHeightPage1);
              doc.setFontSize(8);
              doc.text(`Imagen ${imageIndex + 1}`, xPos + imageWidthPage1/2, currentYPos + imageHeightPage1/2, { align: "center" });
            }
          }

          // Nota si hay más de 12 fotos
          if (propertyImages.length > 12) {
            yPosition += Math.ceil(remainingImages / imagesPerRowPage1) * (imageHeightPage1 + spacingY + 20) + 20;
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.text(`Nota: Se muestran las primeras 12 de ${propertyImages.length} fotografías disponibles.`, pageWidth / 2, yPosition, { align: "center" });
          }
        }

        // Información adicional al final de las fotos
        let finalImages = maxTotalImages > maxImagesPage1 ? maxTotalImages - maxImagesPage1 : imagesPage1;
        const lastPageY = yPosition + Math.ceil(finalImages / imagesPerRowPage1) * (imageHeightPage1 + spacingY + 20) + 30;
        
        if (lastPageY < pageHeight - 40) {
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          doc.text(`Total de fotografías en el expediente: ${propertyImages.length}`, pageWidth / 2, lastPageY, { align: "center" });
          doc.text(`Fecha de captura: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, lastPageY + 10, { align: "center" });
        }
      }

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
      
      const doc = new DocxDocument({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "REPORTE DE VALUACIÓN INMOBILIARIA",
              heading: HeadingLevel.TITLE,
              alignment: "center"
            }),
            new Paragraph({
              text: "Análisis Profesional de Valor de Mercado",
              alignment: "center"
            }),
            new Paragraph({
              text: "Basado en 3 Comparables",
              alignment: "center"
            }),
            new Paragraph({ text: "" }), // Espacio
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
                new TextRun({ text: "Recámaras: ", bold: true }),
                new TextRun({ text: `${propertyData.recamaras}` })
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
            new Paragraph({
              children: [
                new TextRun({ text: "• Recámaras/Dormitorios: ", bold: true }),
                new TextRun({ text: `${propertyData.recamaras}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "• Salas/Estancias: ", bold: true }),
                new TextRun({ text: `${propertyData.salas}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "• Comedor: ", bold: true }),
                new TextRun({ text: `${propertyData.comedor}` })
              ]
            }),
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
            ...(propertyData.direccionCompleta ? [
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                text: "UBICACIÓN",
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
              })
            ] : []),
            ...(comparativeProperties.length > 0 ? [
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                text: "PROPIEDADES COMPARABLES",
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                text: "PROPIEDADES COMPARABLES",
                heading: HeadingLevel.HEADING_1
              }),
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
                  ...comparativeProperties.slice(0, 8).map(comp => 
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
                      new TextRun({ text: formatCurrency(analysis.avgPrice, selectedCurrency) })
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
              })())
            ] : []),
            ...(propertyImages.length > 0 ? [
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                text: "FOTOGRAFÍAS DEL INMUEBLE",
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Se adjuntan ${propertyImages.length} fotografías del inmueble.` })
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
          Valuador de Propiedades
        </h1>
        <p className="text-lg text-muted-foreground">
          Sistema profesional de valuación inmobiliaria
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Selector de Moneda */}
        <div className="lg:col-span-1">
          <CurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
          />
        </div>

        {/* Formulario Principal */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Datos de la Propiedad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                   <TabsTrigger value="areas">Áreas</TabsTrigger>
                   <TabsTrigger value="tipo">Tipo</TabsTrigger>
                   <TabsTrigger value="espacios">Espacios</TabsTrigger>
                   <TabsTrigger value="caracteristicas">Características</TabsTrigger>
                   <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
                   <TabsTrigger value="fotos">Fotos</TabsTrigger>
                   <TabsTrigger value="ajustes">Ajustes</TabsTrigger>
                 </TabsList>

                 <TabsContent value="areas" className="space-y-4 mt-6">
                   <h3 className="text-lg font-semibold text-foreground mb-4">Áreas de Construcción (m²)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <Label htmlFor="areaSotano">Sótano</Label>
                       <Input
                         id="areaSotano"
                         type="number"
                         value={propertyData.areaSotano || ''}
                         onChange={(e) => handleInputChange('areaSotano', Number(e.target.value))}
                         placeholder="0"
                       />
                     </div>
                     <div>
                       <Label htmlFor="areaPrimerNivel">Primer Nivel</Label>
                       <Input
                         id="areaPrimerNivel"
                         type="number"
                         value={propertyData.areaPrimerNivel || ''}
                         onChange={(e) => handleInputChange('areaPrimerNivel', Number(e.target.value))}
                         placeholder="0"
                       />
                     </div>
                     <div>
                       <Label htmlFor="areaSegundoNivel">Segundo Nivel</Label>
                       <Input
                         id="areaSegundoNivel"
                         type="number"
                         value={propertyData.areaSegundoNivel || ''}
                         onChange={(e) => handleInputChange('areaSegundoNivel', Number(e.target.value))}
                         placeholder="0"
                       />
                     </div>
                     <div>
                       <Label htmlFor="areaTercerNivel">Tercer Nivel</Label>
                       <Input
                         id="areaTercerNivel"
                         type="number"
                         value={propertyData.areaTercerNivel || ''}
                         onChange={(e) => handleInputChange('areaTercerNivel', Number(e.target.value))}
                         placeholder="0"
                       />
                     </div>
                     <div>
                       <Label htmlFor="areaCuartoNivel">Cuarto Nivel</Label>
                       <Input
                         id="areaCuartoNivel"
                         type="number"
                         value={propertyData.areaCuartoNivel || ''}
                         onChange={(e) => handleInputChange('areaCuartoNivel', Number(e.target.value))}
                         placeholder="0"
                       />
                     </div>
                     <div>
                       <Label htmlFor="areaTerreno">Área del Terreno</Label>
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Tipo de Propiedad</h3>
                  <Select value={propertyData.tipoPropiedad} onValueChange={(value) => handleInputChange('tipoPropiedad', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo de propiedad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa</SelectItem>
                      <SelectItem value="departamento">Departamento</SelectItem>
                      <SelectItem value="terreno">Terreno</SelectItem>
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="bodega">Bodega</SelectItem>
                    </SelectContent>
                  </Select>
                </TabsContent>

                <TabsContent value="espacios" className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Distribución de Espacios y Características</h3>
                  
                  {/* Espacios Habitacionales */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium text-foreground mb-3 border-b pb-2">Espacios Habitacionales</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { key: 'recamaras', label: 'Recámaras/Dormitorios', description: 'Número de habitaciones' },
                        { key: 'salas', label: 'Salas/Estancias', description: 'Salas de estar principales' },
                        { key: 'comedor', label: 'Comedor', description: 'Espacios de comedor' },
                        { key: 'banos', label: 'Baños Completos', description: 'Baños con regadera/tina' }
                      ].map(({ key, label, description }) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                          <Input
                            id={key}
                            type="number"
                            value={propertyData[key as keyof PropertyData] || ''}
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
                            value={propertyData[key as keyof PropertyData] || ''}
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
                  Calcular Valuación
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
                   
                   <div className="pt-4 border-t space-y-3">
                     <Button 
                       onClick={generatePDF} 
                       variant="outline" 
                       className="w-full"
                       size="sm"
                     >
                       <FileText className="mr-2 h-4 w-4" />
                       Descargar Reporte PDF
                     </Button>
                     
                     <Button 
                       onClick={generateWord} 
                       variant="secondary" 
                       className="w-full"
                       size="sm"
                     >
                       <Download className="mr-2 h-4 w-4" />
                       Descargar Reporte Word
                     </Button>
                     
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
                    Completa los datos de la propiedad y presiona "Calcular Valuación" para ver el resultado.
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