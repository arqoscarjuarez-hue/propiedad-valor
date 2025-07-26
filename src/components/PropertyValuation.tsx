import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Home, MapPin, Calendar, Star, Shuffle, BarChart3, TrendingUp } from 'lucide-react';
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
    
    // Factores por estado general
    const factorEstado = {
      'excelente': 1.3,
      'bueno': 1.1,
      'regular': 1.0,
      'malo': 0.6,
      'muy-malo': 0.4
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
                  <TabsTrigger value="comparativas">Comparativas</TabsTrigger>
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
                          <SelectItem value="excelente">Excelente</SelectItem>
                          <SelectItem value="bueno">Bueno</SelectItem>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="malo">Malo</SelectItem>
                          <SelectItem value="muy-malo">Muy Malo</SelectItem>
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

                <TabsContent value="comparativas" className="space-y-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Propiedades Comparativas Cercanas</h3>
                      <p className="text-sm text-muted-foreground">Propiedades similares en un radio de 2 km</p>
                    </div>
                    {comparativeProperties.length > 0 && (
                      <Button variant="outline" size="sm" onClick={regenerateComparatives}>
                        <Shuffle className="h-4 w-4 mr-2" />
                        Regenerar
                      </Button>
                    )}
                  </div>
                  
                  {comparativeProperties.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Dirección</TableHead>
                            <TableHead>Distancia</TableHead>
                            <TableHead>m² Const.</TableHead>
                            <TableHead>Rec.</TableHead>
                            <TableHead>Baños</TableHead>
                            <TableHead>Precio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {comparativeProperties.map((property) => (
                            <TableRow key={property.id}>
                              <TableCell className="font-medium max-w-[200px]">
                                <div className="truncate" title={property.address}>
                                  {property.address.length > 40 
                                    ? `${property.address.substring(0, 40)}...` 
                                    : property.address
                                  }
                                </div>
                              </TableCell>
                              <TableCell>
                                {property.distancia ? (
                                  <span className="text-sm">
                                    {property.distancia < 1000 
                                      ? `${property.distancia}m` 
                                      : `${(property.distancia / 1000).toFixed(1)}km`
                                    }
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>{property.areaConstruida.toLocaleString()}</TableCell>
                              <TableCell>{property.recamaras}</TableCell>
                              <TableCell>{property.banos}</TableCell>
                              <TableCell className="font-bold">
                                {formatCurrency(property.precio, selectedCurrency)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {(() => {
                        const analysis = getMarketAnalysis();
                        return analysis ? (
                          <div className="bg-muted/50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Análisis de Mercado
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Precio Promedio:</span>
                                <span className="ml-2 font-medium">
                                  {formatCurrency(analysis.avgPrice, selectedCurrency)}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Rango:</span>
                                <span className="ml-2 font-medium">
                                  {formatCurrency(analysis.minPrice, selectedCurrency)} - {formatCurrency(analysis.maxPrice, selectedCurrency)}
                                </span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground">Diferencia con promedio:</span>
                                <span className={`ml-2 font-medium ${analysis.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {analysis.difference > 0 ? '+' : ''}{analysis.difference.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-2">
                        Primero establece la ubicación exacta de la propiedad en la pestaña "Ubicación".
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Luego calcula la valuación para generar comparativos cercanos automáticamente.
                      </p>
                    </div>
                  )}
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