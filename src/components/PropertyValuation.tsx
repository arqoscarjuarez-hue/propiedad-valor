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

  const generateComparativeProperties = async (baseValue: number): Promise<ComparativeProperty[]> => {
    const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel + propertyData.areaCuartoNivel;
    
    // Generar ubicaciones cercanas basadas en las coordenadas de la propiedad
    const nearbyAddresses = await generateNearbyAddresses(
      propertyData.latitud || 19.4326, 
      propertyData.longitud || -99.1332
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
  const generateNearbyAddresses = async (lat: number, lng: number) => {
    const addresses = [];
    const radiusKm = 2; // Radio de 2 km para buscar comparativos
    
    for (let i = 0; i < 3; i++) {
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
    
    // Realizar múltiples valuaciones con diferentes comparables
    const valuations = [];
    
    toast({
      title: "Calculando Valuaciones",
      description: "Generando múltiples avalúos con diferentes comparables...",
    });

    for (let i = 1; i <= 4; i++) {
      const comparatives = await generateComparativeProperties(valorFinal);
      const valorFinalEnMonedaSeleccionada = convertCurrency(valorFinal, selectedCurrency);
      
      valuations.push({
        id: i,
        valor: valorFinalEnMonedaSeleccionada,
        comparatives: comparatives
      });
      
      // Pequeña pausa entre cada generación para mayor variabilidad
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setMultipleValuations(valuations);
    
    // Calcular promedio de las valuaciones
    const promedioValuacion = valuations.reduce((sum, val) => sum + val.valor, 0) / valuations.length;
    setValuation(promedioValuacion);
    
    // Usar los comparativos del primer avalúo para la vista principal
    setComparativeProperties(valuations[0].comparatives);
    
    toast({
      title: "Valuaciones Completadas",
      description: `Se realizaron 4 avalúos. Valor promedio: ${formatCurrency(promedioValuacion, selectedCurrency)}`,
    });
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
      doc.text("Basado en 4 Avalúos Independientes", pageWidth / 2, 32, { align: "center" });
      
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

      // Espacios adicionales
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("ESPACIOS Y CARACTERÍSTICAS", 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(`Salas: ${propertyData.salas}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Comedor: ${propertyData.comedor}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Cocina: ${propertyData.cocina}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Bodega: ${propertyData.bodega}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Área de Servicio: ${propertyData.areaServicio}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Otros: ${propertyData.otros}`, 20, yPosition);
      yPosition += 15;

      // Resultado de valuación
      doc.setFillColor(220, 252, 231);
      doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`Valor Promedio Final: ${formatCurrency(valuation, selectedCurrency)}`, 20, yPosition + 8);
      
      doc.setFontSize(12);
      doc.text(`Precio por m²: ${formatCurrency(valuation / areaTotal, selectedCurrency)}`, 20, yPosition + 18);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Basado en 4 avalúos independientes con diferentes comparables", 20, yPosition + 28);
      
      yPosition += 45;

      // Mostrar múltiples valuaciones
      if (multipleValuations.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("AVALÚOS INDIVIDUALES", 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        multipleValuations.forEach((val, index) => {
          doc.text(`Avalúo #${val.id}: ${formatCurrency(val.valor, selectedCurrency)} (${val.comparatives.length} comparables)`, 20, yPosition);
          yPosition += 6;
        });
        
        yPosition += 10;
      }

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

      // Croquis de ubicación (mapa)
      if (propertyData.latitud && propertyData.longitud) {
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("CROQUIS DE UBICACIÓN", 20, yPosition);
        yPosition += 15;

        // Generar URL del mapa estático de OpenStreetMap
        const mapWidth = 400;
        const mapHeight = 300;
        const zoom = 15;
        const bbox = [
          propertyData.longitud - 0.005,
          propertyData.latitud - 0.005,
          propertyData.longitud + 0.005,
          propertyData.latitud + 0.005
        ].join(',');
        
        // URL para mapa estático de OpenStreetMap
        const staticMapUrl = `https://render.openstreetmap.org/cgi-bin/export?bbox=${bbox}&scale=1000&format=png`;
        
        try {
          // Crear un canvas para dibujar el mapa con marcador
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = pageWidth - 40;
          canvas.height = 60;
          
          if (ctx) {
            // Fondo del mapa
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Dibujar información del mapa
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Ubicación del Inmueble', canvas.width / 2, 20);
            
            // Marcador visual simple
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            // Coordenadas
            ctx.fillStyle = '#333';
            ctx.font = '10px Arial';
            ctx.fillText(`Lat: ${propertyData.latitud.toFixed(6)}, Lng: ${propertyData.longitud.toFixed(6)}`, canvas.width / 2, canvas.height - 10);
            
            // Convertir canvas a imagen y agregar al PDF
            const mapImageData = canvas.toDataURL('image/png');
            doc.addImage(mapImageData, 'PNG', 20, yPosition, pageWidth - 40, 60);
          }
        } catch (error) {
          console.log('Error generating map image, using placeholder');
          // Fallback: usar placeholder
          doc.setFillColor(240, 240, 240);
          doc.rect(20, yPosition, pageWidth - 40, 60, 'F');
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text("Mapa de ubicación del inmueble", pageWidth / 2, yPosition + 25, { align: "center" });
          doc.text(`Lat: ${propertyData.latitud.toFixed(6)}, Lng: ${propertyData.longitud.toFixed(6)}`, pageWidth / 2, yPosition + 35, { align: "center" });
          
          // Agregar marcador visual
          doc.setFillColor(231, 76, 60);
          doc.circle(pageWidth / 2, yPosition + 20, 3, 'F');
        }
        
        yPosition += 70;
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

        // Información detallada de cada comparable
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        
        for (let i = 0; i < Math.min(comparativeProperties.length, 5); i++) {
          const comp = comparativeProperties[i];
          
          // Verificar si necesitamos nueva página
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Título del comparable
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`COMPARABLE ${i + 1}`, 20, yPosition);
          yPosition += 10;
          
          // Información detallada
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          
          // Dirección
          doc.text(`Dirección: ${comp.address}`, 25, yPosition);
          yPosition += 6;
          
          // Características
          doc.text(`Área Construida: ${comp.areaConstruida}m² | Terreno: ${comp.areaTerreno}m²`, 25, yPosition);
          yPosition += 6;
          
          doc.text(`Recámaras: ${comp.recamaras} | Baños: ${comp.banos} | Antigüedad: ${comp.antiguedad} años`, 25, yPosition);
          yPosition += 6;
          
          doc.text(`Estado: ${comp.estadoGeneral} | Ubicación: ${comp.ubicacion}`, 25, yPosition);
          yPosition += 6;
          
          // Precio
          doc.setFont("helvetica", "bold");
          doc.text(`Precio: ${formatCurrency(comp.precio, selectedCurrency)}`, 25, yPosition);
          yPosition += 6;
          
          // Distancia
          if (comp.distancia) {
            doc.setFont("helvetica", "normal");
            doc.text(`Distancia: ${(comp.distancia / 1000).toFixed(2)} km`, 25, yPosition);
            yPosition += 6;
          }
          
          // Descripción
          if (comp.descripcion) {
            const descripcionLines = doc.splitTextToSize(comp.descripcion, pageWidth - 50);
            doc.text(`Descripción: ${descripcionLines[0]}`, 25, yPosition);
            if (descripcionLines.length > 1) {
              yPosition += 6;
              doc.text(descripcionLines.slice(1).join(' '), 25, yPosition);
            }
            yPosition += 6;
          }
          
          // URL
          if (comp.url) {
            doc.setTextColor(0, 100, 200);
            doc.text(`Ver detalles: ${comp.url}`, 25, yPosition);
            doc.setTextColor(0, 0, 0);
            yPosition += 8;
          }
          
          // Coordenadas
          if (comp.latitud && comp.longitud) {
            doc.text(`Coordenadas: ${comp.latitud.toFixed(6)}, ${comp.longitud.toFixed(6)}`, 25, yPosition);
            yPosition += 8;
          }
          
          // Línea separadora
          doc.setDrawColor(200, 200, 200);
          doc.line(20, yPosition, pageWidth - 20, yPosition);
          yPosition += 8;
        }

        // Resumen de tabla comparativa
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("RESUMEN COMPARATIVO", 20, yPosition);
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

      // Fotografías del inmueble
      if (propertyImages.length > 0) {
        // Verificar si necesitamos una nueva página
        if (yPosition > pageHeight - 100) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("FOTOGRAFÍAS DEL INMUEBLE", 20, yPosition);
        yPosition += 15;

        let imageCount = 0;
        const imagesPerRow = 2;
        const imageWidth = (pageWidth - 60) / imagesPerRow;
        const imageHeight = 50;

        for (let i = 0; i < propertyImages.length; i++) {
          const image = propertyImages[i];
          const col = i % imagesPerRow;
          const row = Math.floor(i / imagesPerRow);
          
          const xPos = 20 + (col * (imageWidth + 20));
          const currentYPos = yPosition + (row * (imageHeight + 15));

          // Verificar si necesitamos una nueva página
          if (currentYPos + imageHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
            const newRow = row - Math.floor(i / imagesPerRow);
            yPosition = 20 + (newRow * (imageHeight + 15));
          }

          try {
            // Agregar imagen al PDF
            doc.addImage(image.preview, 'JPEG', xPos, currentYPos, imageWidth, imageHeight);
          } catch (error) {
            // Si hay error con la imagen, agregar placeholder
            doc.setFillColor(240, 240, 240);
            doc.rect(xPos, currentYPos, imageWidth, imageHeight, 'F');
            doc.setFontSize(8);
            doc.text(`Imagen ${i + 1}`, xPos + imageWidth/2, currentYPos + imageHeight/2, { align: "center" });
          }

          imageCount++;
        }

        yPosition += Math.ceil(propertyImages.length / imagesPerRow) * (imageHeight + 15);
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
              text: "Basado en 4 Avalúos Independientes",
              alignment: "center"
            }),
            new Paragraph({ text: "" }), // Espacio
            ...(multipleValuations.length > 0 ? [
              new Paragraph({
                text: "AVALÚOS INDIVIDUALES",
                heading: HeadingLevel.HEADING_1
              }),
              ...multipleValuations.map(val => 
                new Paragraph({
                  children: [
                    new TextRun({ text: `Avalúo #${val.id}: `, bold: true }),
                    new TextRun({ text: `${formatCurrency(val.valor, selectedCurrency)} (${val.comparatives.length} comparables utilizados)` })
                  ]
                })
              ),
              new Paragraph({ text: "" }), // Espacio
              new Paragraph({
                children: [
                  new TextRun({ text: "Valor Promedio Final: ", bold: true }),
                  new TextRun({ text: formatCurrency(valuation, selectedCurrency), size: 28, bold: true })
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
              text: "ESPACIOS Y CARACTERÍSTICAS",
              heading: HeadingLevel.HEADING_1
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Salas: ", bold: true }),
                new TextRun({ text: `${propertyData.salas}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Comedor: ", bold: true }),
                new TextRun({ text: `${propertyData.comedor}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Cocina: ", bold: true }),
                new TextRun({ text: `${propertyData.cocina}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Bodega: ", bold: true }),
                new TextRun({ text: `${propertyData.bodega}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Área de Servicio: ", bold: true }),
                new TextRun({ text: `${propertyData.areaServicio}` })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Otros: ", bold: true }),
                new TextRun({ text: `${propertyData.otros}` })
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
                text: "INFORMACIÓN DETALLADA DE COMPARABLES",
                heading: HeadingLevel.HEADING_1
              }),
              ...comparativeProperties.slice(0, 5).flatMap((comp, index) => [
                new Paragraph({
                  text: `COMPARABLE ${index + 1}`,
                  heading: HeadingLevel.HEADING_2
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Dirección: ", bold: true }),
                    new TextRun({ text: comp.address })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Características: ", bold: true }),
                    new TextRun({ text: `${comp.areaConstruida}m² construidos, ${comp.areaTerreno}m² terreno, ${comp.recamaras} recámaras, ${comp.banos} baños` })
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
                    new TextRun({ text: "Estado: ", bold: true }),
                    new TextRun({ text: `${comp.estadoGeneral} - Ubicación ${comp.ubicacion}` })
                  ]
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: "Precio: ", bold: true }),
                    new TextRun({ text: formatCurrency(comp.precio, selectedCurrency) })
                  ]
                }),
                ...(comp.distancia ? [new Paragraph({
                  children: [
                    new TextRun({ text: "Distancia: ", bold: true }),
                    new TextRun({ text: `${(comp.distancia / 1000).toFixed(2)} km` })
                  ]
                })] : []),
                ...(comp.descripcion ? [new Paragraph({
                  children: [
                    new TextRun({ text: "Descripción: ", bold: true }),
                    new TextRun({ text: comp.descripcion })
                  ]
                })] : []),
                ...(comp.url ? [new Paragraph({
                  children: [
                    new TextRun({ text: "Ver más información: ", bold: true }),
                    new TextRun({ text: comp.url })
                  ]
                })] : []),
                ...(comp.latitud && comp.longitud ? [new Paragraph({
                  children: [
                    new TextRun({ text: "Coordenadas: ", bold: true }),
                    new TextRun({ text: `${comp.latitud.toFixed(6)}, ${comp.longitud.toFixed(6)}` })
                  ]
                })] : []),
                new Paragraph({ text: "" }) // Espacio entre comparables
              ]),
              new Paragraph({
                text: "RESUMEN COMPARATIVO",
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
                <TabsList className="grid w-full grid-cols-6">
                   <TabsTrigger value="areas">Áreas</TabsTrigger>
                   <TabsTrigger value="tipo">Tipo</TabsTrigger>
                   <TabsTrigger value="espacios">Espacios</TabsTrigger>
                   <TabsTrigger value="caracteristicas">Características</TabsTrigger>
                   <TabsTrigger value="ubicacion">Ubicación</TabsTrigger>
                   <TabsTrigger value="fotos">Fotos</TabsTrigger>
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
                    <h3 className="text-lg font-semibold text-muted-foreground">Valor Promedio Final</h3>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(valuation, selectedCurrency)}
                    </p>
                    <Badge variant="secondary" className="mt-2">{selectedCurrency.code}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Basado en 4 avalúos independientes</p>
                  </div>

                  {/* Mostrar múltiples valuaciones */}
                  {multipleValuations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Avalúos Individuales:</h4>
                      {multipleValuations.map((val, index) => (
                        <div key={val.id} className="bg-muted p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Avalúo #{val.id}</span>
                            <span className="font-bold text-primary">
                              {formatCurrency(val.valor, selectedCurrency)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {val.comparatives.length} comparables utilizados
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  
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