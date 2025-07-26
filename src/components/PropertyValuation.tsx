import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calculator, Home, MapPin, Calendar, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    estadoGeneral: ''
  });
  
  const [valuation, setValuation] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('areas');

  const handleInputChange = (field: keyof PropertyData, value: string | number) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateValuation = () => {
    const areaTotal = propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel;
    
    // Precio base por m² según tipo de propiedad
    const precioBase = {
      'casa': 15000,
      'departamento': 12000,
      'terreno': 8000,
      'comercial': 18000,
      'bodega': 10000
    };
    
    let valorBase = (areaTotal * (precioBase[propertyData.tipoPropiedad as keyof typeof precioBase] || 12000)) +
                    (propertyData.areaTerreno * 5000);
    
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
    
    // Bonificación por espacios
    const bonificacionEspacios = (propertyData.recamaras * 50000) +
                                (propertyData.banos * 30000) +
                                (propertyData.cochera * 40000) +
                                (propertyData.salas * 25000) +
                                (propertyData.cocina * 35000);
    
    const valorFinal = (valorBase * 
                       (factorUbicacion[propertyData.ubicacion as keyof typeof factorUbicacion] || 1) *
                       (factorEstado[propertyData.estadoGeneral as keyof typeof factorEstado] || 1) *
                       factorAntiguedad) + bonificacionEspacios;
    
    setValuation(valorFinal);
    
    toast({
      title: "Valuación Calculada",
      description: `El valor estimado de la propiedad es $${valorFinal.toLocaleString('es-MX')} MXN`,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="areas">Áreas</TabsTrigger>
                  <TabsTrigger value="tipo">Tipo</TabsTrigger>
                  <TabsTrigger value="espacios">Espacios</TabsTrigger>
                  <TabsTrigger value="caracteristicas">Características</TabsTrigger>
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
                      ${valuation.toLocaleString('es-MX')}
                    </p>
                    <Badge variant="secondary" className="mt-2">MXN</Badge>
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
                    <div className="flex justify-between">
                      <span>Precio por m² construido:</span>
                      <span className="font-medium">
                        ${Math.round(valuation / (propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + propertyData.areaTercerNivel || 1)).toLocaleString()}
                      </span>
                    </div>
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