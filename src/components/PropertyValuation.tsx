import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp, FileText, Camera, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import LocationMap from './LocationMap';
import GoogleLocationMap from './GoogleLocationMap';
import SupabaseGoogleLocationMap from './SupabaseGoogleLocationMap';
import SimpleLocationMap from './SimpleLocationMap';
import CurrencySelector, { Currency, formatCurrency } from './CurrencySelector';

interface PropertyData {
  // Áreas
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
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
}

const PropertyValuation = () => {
  const { toast } = useToast();
  const [propertyData, setPropertyData] = useState<PropertyData>({
    areaPrimerNivel: 0,
    areaSegundoNivel: 0,
    areaTercerNivel: 0,
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
    const areaTotal = propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel;
    
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
        distancia: addressInfo.distance
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

  const calculateValuation = () => {
    const areaTotal = propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel;
    
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
    
    // Factor por antigüedad
    const factorAntiguedad = Math.max(0.5, 1 - (propertyData.antiguedad * 0.015));
    
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
    
    setValuation(valorFinalEnMonedaSeleccionada);
    
    // Generar comparativas de forma asíncrona
    generateComparativeProperties(valorFinal).then(comparatives => {
      setComparativeProperties(comparatives);
    });
    
    toast({
      title: "Valuación Calculada",
      description: `El valor estimado es ${formatCurrency(valorFinalEnMonedaSeleccionada, selectedCurrency)}`,
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

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Función para agregar encabezado de sección
    const addSectionHeader = (title: string, icon = '') => {
      // Fondo del encabezado
      doc.setFillColor(59, 130, 246); // Color azul
      doc.rect(15, yPosition - 5, pageWidth - 30, 12, 'F');
      
      // Texto del encabezado
      doc.setTextColor(255, 255, 255); // Texto blanco
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text(`${icon} ${title}`, 20, yPosition + 3);
      
      // Resetear color de texto
      doc.setTextColor(0, 0, 0);
      yPosition += 20;
    };

    // Función para agregar línea divisoria
    const addDivider = () => {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;
    };

    // Header principal con diseño atractivo
    doc.setFillColor(30, 41, 59); // Color azul oscuro
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE VALUACIÓN INMOBILIARIA", pageWidth / 2, 20, { align: "center" });
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Análisis Profesional de Valor de Mercado", pageWidth / 2, 28, { align: "center" });
    
    // Resetear color de texto
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // Información de fecha con diseño
    doc.setFillColor(248, 250, 252);
    doc.rect(15, yPosition - 3, pageWidth - 30, 10, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`📅 Fecha de valuación: ${new Date().toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`, 20, yPosition + 3);
    yPosition += 20;

    // Sección: Datos de la Propiedad
    addSectionHeader("INFORMACIÓN GENERAL DE LA PROPIEDAD", "🏠");
    
    const areaTotal = propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel;
    
    // Información principal destacada
    doc.setFillColor(254, 249, 195); // Fondo amarillo claro
    doc.rect(15, yPosition - 3, pageWidth - 30, 25, 'F');
    
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`Tipo: ${propertyData.tipoPropiedad.toUpperCase()}`, 20, yPosition + 5);
    doc.text(`Área Total: ${areaTotal.toLocaleString()} m²`, 20, yPosition + 12);
    doc.text(`Terreno: ${propertyData.areaTerreno.toLocaleString()} m²`, 20, yPosition + 19);
    yPosition += 35;

    // Detalles de construcción
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    const constructionDetails = [
      `📐 Distribución de áreas:`,
      `    • Primer nivel: ${propertyData.areaPrimerNivel.toLocaleString()} m²`,
      `    • Segundo nivel: ${propertyData.areaSegundoNivel.toLocaleString()} m²`,
      `    • Tercer nivel: ${propertyData.areaTercerNivel.toLocaleString()} m²`,
      `🏠 Espacios:`,
      `    • Recámaras: ${propertyData.recamaras} • Baños: ${propertyData.banos} • Cocheras: ${propertyData.cochera}`,
      `📅 Antigüedad: ${propertyData.antiguedad} años`,
      `📍 Zona: ${propertyData.ubicacion.toUpperCase()}`,
      `🔧 Estado: ${propertyData.estadoGeneral.replace('-', ' ').toUpperCase()}`
    ];

    constructionDetails.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 6;
    });

    if (propertyData.direccionCompleta) {
      yPosition += 5;
      doc.setFont("helvetica", "bold");
      doc.text(`📍 Dirección:`, 20, yPosition);
      yPosition += 6;
      doc.setFont("helvetica", "normal");
      const addressLines = doc.splitTextToSize(propertyData.direccionCompleta, pageWidth - 50);
      doc.text(addressLines, 25, yPosition);
      yPosition += (addressLines.length * 6) + 5;
    }

    addDivider();

    // Sección: Resultado de Valuación (destacado)
    addSectionHeader("RESULTADO DE VALUACIÓN", "💰");
    
    // Caja destacada para el valor
    doc.setFillColor(220, 252, 231); // Verde claro
    doc.setDrawColor(34, 197, 94); // Verde
    doc.setLineWidth(1);
    doc.rect(15, yPosition - 5, pageWidth - 30, 30, 'FD');
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52); // Verde oscuro
    doc.text(`Valor Estimado: ${formatCurrency(valuation, selectedCurrency)}`, 20, yPosition + 8);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Precio por m²: ${formatCurrency(valuation / areaTotal, selectedCurrency)}`, 20, yPosition + 18);
    
    doc.setTextColor(0, 0, 0);
    yPosition += 40;

    // Sección: Ubicación y Coordenadas
    addSectionHeader("UBICACIÓN Y COORDENADAS", "📍");
    
    if (propertyData.direccionCompleta) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`🏠 Dirección completa:`, 20, yPosition);
      yPosition += 6;
      const addressLines = doc.splitTextToSize(propertyData.direccionCompleta, pageWidth - 50);
      doc.text(addressLines, 25, yPosition);
      yPosition += (addressLines.length * 6) + 8;
    }
    
    // Coordenadas en caja destacada
    doc.setFillColor(239, 246, 255); // Azul muy claro
    doc.rect(15, yPosition - 3, pageWidth - 30, 20, 'F');
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`🌐 Coordenadas geográficas:`, 20, yPosition + 5);
    doc.setFont("helvetica", "normal");
    doc.text(`Latitud: ${propertyData.latitud?.toFixed(6)}° | Longitud: ${propertyData.longitud?.toFixed(6)}°`, 20, yPosition + 12);
    yPosition += 30;

    // Croquis de ubicación mejorado
    try {
      const mapWidth = 160;
      const mapHeight = 90;
      
      // Marco para el mapa
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(1);
      doc.rect(20, yPosition, mapWidth, mapHeight, 'FD');
      
      // Contenido del mapa
      doc.setFillColor(59, 130, 246);
      doc.circle(20 + mapWidth/2, yPosition + mapHeight/2, 3, 'F');
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(59, 130, 246);
      doc.text("📍 UBICACIÓN", 20 + mapWidth/2, yPosition + mapHeight/2 - 15, { align: "center" });
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(`${propertyData.latitud?.toFixed(4)}°, ${propertyData.longitud?.toFixed(4)}°`, 20 + mapWidth/2, yPosition + mapHeight/2 + 15, { align: "center" });
      
      yPosition += mapHeight + 20;
    } catch (error) {
      console.warn('No se pudo agregar el mapa al PDF:', error);
      yPosition += 10;
    }

    // Sección: Propiedades Comparativas (si existen)
    if (comparativeProperties.length > 0) {
      // Verificar si necesita nueva página
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      addSectionHeader("ANÁLISIS COMPARATIVO DE MERCADO", "📊");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text("Propiedades similares en un radio de 2 km:", 20, yPosition);
      yPosition += 12;

      comparativeProperties.forEach((prop, index) => {
        const distance = prop.distancia ? 
          (prop.distancia < 1000 ? `${prop.distancia}m` : `${(prop.distancia / 1000).toFixed(1)}km`) 
          : 'N/A';
        
        // Fondo alternado para cada propiedad
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(15, yPosition - 2, pageWidth - 30, 16, 'F');
        }
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(`${index + 1}. ${prop.address.substring(0, 80)}${prop.address.length > 80 ? '...' : ''}`, 20, yPosition + 3);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80, 80, 80);
        doc.text(`📏 ${prop.areaConstruida}m² | 📍 ${distance} | 💲 ${formatCurrency(prop.precio, selectedCurrency)}`, 25, yPosition + 9);
        yPosition += 18;
      });

      // Análisis de mercado en caja destacada
      const analysis = getMarketAnalysis();
      if (analysis) {
        yPosition += 10;
        
        doc.setFillColor(254, 243, 199); // Amarillo claro
        doc.setDrawColor(245, 158, 11); // Amarillo
        doc.setLineWidth(1);
        doc.rect(15, yPosition - 5, pageWidth - 30, 35, 'FD');
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(146, 64, 14); // Amarillo oscuro
        doc.text("📈 RESUMEN DEL ANÁLISIS DE MERCADO", 20, yPosition + 5);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(`• Precio promedio: ${formatCurrency(analysis.avgPrice, selectedCurrency)}`, 25, yPosition + 15);
        doc.text(`• Rango: ${formatCurrency(analysis.minPrice, selectedCurrency)} - ${formatCurrency(analysis.maxPrice, selectedCurrency)}`, 25, yPosition + 22);
        doc.text(`• Diferencia con promedio: ${analysis.difference > 0 ? '+' : ''}${analysis.difference.toFixed(1)}%`, 25, yPosition + 29);
        
        doc.setTextColor(0, 0, 0);
        yPosition += 45;
      }
    }

    // Sección: Ubicación y Coordenadas
    yPosition += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("UBICACIÓN Y COORDENADAS", 20, yPosition);
    yPosition += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    if (propertyData.direccionCompleta) {
      doc.text(`Dirección: ${propertyData.direccionCompleta}`, 20, yPosition);
      yPosition += 6;
    }
    
    doc.text(`Coordenadas: ${propertyData.latitud?.toFixed(6)}, ${propertyData.longitud?.toFixed(6)}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Latitud: ${propertyData.latitud?.toFixed(6)}°`, 20, yPosition);
    yPosition += 6;
    doc.text(`Longitud: ${propertyData.longitud?.toFixed(6)}°`, 20, yPosition);
    yPosition += 10;

    // Croquis de ubicación usando un mapa estático
    try {
      const mapWidth = 150;
      const mapHeight = 100;
      
      // Crear URL para mapa estático de OpenStreetMap
      const zoom = 15;
      const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+ff0000(${propertyData.longitud},${propertyData.latitud})/${propertyData.longitud},${propertyData.latitud},${zoom}/${mapWidth}x${mapHeight}?access_token=pk.eyJ1IjoidGVzdCIsImEiOiJjazB6MHVhMm4wMDNhM29xbHE1YXRqOTY1In0.fakeToken`;
      
      // Como alternativa, usar un marcador de posición para el mapa
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition, mapWidth, mapHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(20, yPosition, mapWidth, mapHeight);
      
      // Agregar texto indicativo del mapa
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("Croquis de Ubicación", 20 + mapWidth/2, yPosition + mapHeight/2 - 10, { align: "center" });
      doc.text(`Lat: ${propertyData.latitud?.toFixed(4)}°`, 20 + mapWidth/2, yPosition + mapHeight/2, { align: "center" });
      doc.text(`Lng: ${propertyData.longitud?.toFixed(4)}°`, 20 + mapWidth/2, yPosition + mapHeight/2 + 10, { align: "center" });
      
      yPosition += mapHeight + 15;
    } catch (error) {
      console.warn('No se pudo agregar el mapa al PDF:', error);
      yPosition += 10;
    }
    if (propertyImages.length > 0) {
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition += 15;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("FOTOS DEL INMUEBLE", 20, yPosition);
      yPosition += 15;

      // Procesar las imágenes de manera asíncrona
      for (let i = 0; i < propertyImages.length; i++) {
        const image = propertyImages[i];
        
        try {
          // Convertir blob a base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              // Calcular dimensiones para el PDF (máximo 120x80mm)
              const maxWidth = 120;
              const maxHeight = 80;
              const aspectRatio = img.width / img.height;
              
              let width = maxWidth;
              let height = maxWidth / aspectRatio;
              
              if (height > maxHeight) {
                height = maxHeight;
                width = maxHeight * aspectRatio;
              }
              
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              
              const imgData = canvas.toDataURL('image/jpeg', 0.7);
              
              // Verificar si necesitamos nueva página
              if (yPosition + height > 250) {
                doc.addPage();
                yPosition = 20;
              }
              
              // Agregar imagen al PDF
              doc.addImage(imgData, 'JPEG', 20, yPosition, width, height);
              yPosition += height + 10;
              
              resolve(null);
            };
            img.onerror = reject;
          });
          
          img.src = image.preview;
        } catch (error) {
          console.error('Error processing image:', error);
          // Continuar con la siguiente imagen si hay error
        }
      }

      yPosition += 10;
    }

    // Agregar nueva página si es necesario
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 20;
    }

    // Disclaimer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const disclaimer = "IMPORTANTE: Esta valuación es un estimado basado en los datos proporcionados y factores de mercado generales. Se recomienda consultar con un perito valuador certificado para valuaciones oficiales con fines legales, fiscales o comerciales.";
    const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 40);
    doc.text(disclaimerLines, 20, yPosition);

    // Pie de página profesional
    const currentPage = doc.getCurrentPageInfo().pageNumber;
    yPosition = pageHeight - 25;
    
    // Línea superior del pie
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(1);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    
    // Información del pie
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Sistema de Valuación Inmobiliaria Profesional", 20, yPosition + 8);
    doc.text(`Página ${currentPage}`, pageWidth - 20, yPosition + 8, { align: "right" });
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, yPosition + 8, { align: "center" });

    // Descargar el PDF
    const fileName = `Valuacion_${propertyData.tipoPropiedad}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    toast({
      title: "📄 PDF Generado Exitosamente",
      description: `El reporte de valuación se ha descargado como ${fileName}`,
    });
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
                  <h3 className="text-lg font-semibold text-foreground mb-4">Distribución de Espacios</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: 'recamaras', label: 'Recámaras' },
                      { key: 'salas', label: 'Salas' },
                      { key: 'comedor', label: 'Comedor' },
                      { key: 'cocina', label: 'Cocina' },
                      { key: 'bodega', label: 'Bodega' },
                      { key: 'areaServicio', label: 'Área de Servicio' },
                      { key: 'cochera', label: 'Cochera' },
                      { key: 'banos', label: 'Baños' },
                      { key: 'otros', label: 'Otros' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label htmlFor={key}>{label}</Label>
                        <Input
                          id={key}
                          type="number"
                          value={propertyData[key as keyof PropertyData] || ''}
                          onChange={(e) => handleInputChange(key as keyof PropertyData, Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="caracteristicas" className="space-y-4 mt-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Características Generales</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="antiguedad" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Antigüedad (años)
                      </Label>
                      <Input
                        id="antiguedad"
                        type="number"
                        value={propertyData.antiguedad || ''}
                        onChange={(e) => handleInputChange('antiguedad', Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <Label className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Ubicación
                      </Label>
                      <Select value={propertyData.ubicacion} onValueChange={(value) => handleInputChange('ubicacion', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Califica la ubicación" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excelente">Excelente</SelectItem>
                          <SelectItem value="buena">Buena</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="mala">Mala</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Estado General
                      </Label>
                      <Select value={propertyData.estadoGeneral} onValueChange={(value) => handleInputChange('estadoGeneral', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Califica el estado de la propiedad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nuevo">NUEVO</SelectItem>
                          <SelectItem value="bueno">BUENO</SelectItem>
                          <SelectItem value="medio">MEDIO</SelectItem>
                          <SelectItem value="regular">REGULAR</SelectItem>
                          <SelectItem value="reparaciones-sencillas">REPARACIONES SENCILLAS</SelectItem>
                          <SelectItem value="reparaciones-medias">REPARACIONES MEDIAS</SelectItem>
                          <SelectItem value="reparaciones-importantes">REPARACIONES IMPORTANTES</SelectItem>
                          <SelectItem value="danos-graves">DAÑOS GRAVES</SelectItem>
                          <SelectItem value="en-desecho">EN DESECHO</SelectItem>
                          <SelectItem value="inservibles">INSERVIBLES</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <h3 className="text-lg font-semibold text-muted-foreground">Valor Estimado</h3>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(valuation, selectedCurrency)}
                    </p>
                    <Badge variant="secondary" className="mt-2">{selectedCurrency.code}</Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Área Total Construida:</span>
                      <span className="font-medium">
                        {(propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel).toLocaleString()} m²
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
                          valuation / (propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel || 1), 
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