import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, HelpCircle, CheckCircle, Shuffle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FreeLocationMap from '@/components/FreeLocationMap';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ValuationWalkthrough } from '@/components/ValuationWalkthrough';

// Interfaces y tipos
interface PropertyData {
  tipoPropiedad: string;
  area: number;
  construction_area: number;
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
  estratoSocial: EstratoSocial | '';
}

// Tipos de estrato social
export type EstratoSocial = 
  | 'bajo_bajo' | 'bajo_medio' | 'bajo_alto'
  | 'medio_bajo' | 'medio_medio' | 'medio_alto' 
  | 'alto_medio' | 'alto_alto';

// Etiquetas para estratos sociales
export const estratoSocialLabels: Record<EstratoSocial, string> = {
  'bajo_bajo': 'Barrio Muy Pobre - Sin casi servicios',
  'bajo_medio': 'Barrio Pobre - Pocos servicios',
  'bajo_alto': 'Barrio Humilde - Servicios básicos',
  'medio_bajo': 'Barrio Trabajador - Buenos servicios',
  'medio_medio': 'Barrio Clase Media - Muy buenos servicios',
  'medio_alto': 'Barrio Acomodado - Excelentes servicios',
  'alto_medio': 'Barrio Rico - Zona exclusiva',
  'alto_alto': 'Barrio Muy Rico - Zona de lujo'
};

// Multiplicadores de valor según estrato social
export const estratoMultipliers: Record<EstratoSocial, number> = {
  'bajo_bajo': 0.6,
  'bajo_medio': 0.8,
  'bajo_alto': 0.9,
  'medio_bajo': 0.95,
  'medio_medio': 1.1,
  'medio_alto': 1.2,
  'alto_medio': 1.6,
  'alto_alto': 1.8
};

// Configuración de países
const countriesConfig = {
  'usa': { name: 'Estados Unidos', currency: 'USD', symbol: '$', flag: '🇺🇸' },
  'canada': { name: 'Canadá', currency: 'CAD', symbol: '$', flag: '🇨🇦' },
  'mexico': { name: 'México', currency: 'MXN', symbol: '$', flag: '🇲🇽' },
  'guatemala': { name: 'Guatemala', currency: 'GTQ', symbol: 'Q', flag: '🇬🇹' },
  'salvador': { name: 'El Salvador', currency: 'USD', symbol: '$', flag: '🇸🇻' },
  'honduras': { name: 'Honduras', currency: 'HNL', symbol: 'L', flag: '🇭🇳' },
  'nicaragua': { name: 'Nicaragua', currency: 'NIO', symbol: 'C$', flag: '🇳🇮' },
  'costarica': { name: 'Costa Rica', currency: 'CRC', symbol: '₡', flag: '🇨🇷' },
  'panama': { name: 'Panamá', currency: 'PAB', symbol: 'B/.', flag: '🇵🇦' },
  'colombia': { name: 'Colombia', currency: 'COP', symbol: '$', flag: '🇨🇴' },
};

const PropertyValuation = () => {
  const [propertyData, setPropertyData] = useState<PropertyData>({
    tipoPropiedad: '',
    area: 0,
    construction_area: 0,
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
    estratoSocial: ''
  });

  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedCountry, setSelectedCountry] = useState('usa');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedMainStrata, setSelectedMainStrata] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  const handleInputChange = (field: keyof PropertyData, value: any) => {
    console.log(`✅ CAMPO ACTUALIZADO: ${field} = ${value}`);
    setPropertyData(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📊 DATOS COMPLETOS:', updated);
      return updated;
    });
  };

  const performValuation = async () => {
    setIsLoading(true);
    try {
      // Simulación de cálculo
      const basePrice = propertyData.area * 1500;
      const estratoMultiplier = propertyData.estratoSocial ? estratoMultipliers[propertyData.estratoSocial as EstratoSocial] : 1;
      const finalPrice = basePrice * estratoMultiplier;
      
      setValuationResult({
        estimatedValue: finalPrice,
        currency: selectedCurrency,
        propertyType: propertyData.tipoPropiedad,
        area: propertyData.area
      });
      
      toast.success('¡Valuación completada exitosamente!');
    } catch (error) {
      toast.error('Error al calcular la valuación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <Card className="shadow-lg border-2 border-primary/20">
            <CardHeader className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-primary-foreground p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">💎 Valuador Latinoamericano</CardTitle>
                <div className="text-sm bg-white/20 px-3 py-1 rounded-lg">
                  {countriesConfig[selectedCountry as keyof typeof countriesConfig]?.flag} {selectedLanguage.toUpperCase()}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <Tabs defaultValue="setup" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="setup">Paso 1</TabsTrigger>
                  <TabsTrigger value="estrato">Paso 2</TabsTrigger>
                  <TabsTrigger value="tipo">Paso 3</TabsTrigger>
                  <TabsTrigger value="ubicacion">Paso 4</TabsTrigger>
                  <TabsTrigger value="caracteristicas">Paso 5</TabsTrigger>
                  <TabsTrigger value="valuacion">Paso 6</TabsTrigger>
                </TabsList>

                {/* Paso 1: Configuración */}
                <TabsContent value="setup" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>🌍 Configuración Inicial</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>País</Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el país" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(countriesConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                {config.flag} {config.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 2: Tipo y Ubicación */}
                <TabsContent value="estrato" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>🏠 Tipo de Propiedad y Ubicación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Tipo de Propiedad */}
                      <div>
                        <Label>Tipo de Propiedad</Label>
                        <Select value={propertyData.tipoPropiedad} onValueChange={(value) => handleInputChange('tipoPropiedad', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casa">🏠 Casa</SelectItem>
                            <SelectItem value="apartamento">🏢 Apartamento</SelectItem>
                            <SelectItem value="terreno">🌳 Terreno</SelectItem>
                            <SelectItem value="comercial">🏪 Comercial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Mapa de Ubicación */}
                      <div>
                        <Label>Ubicación en el Mapa</Label>
                        <FreeLocationMap
                          onLocationChange={(lat, lng, address) => {
                            handleInputChange('latitud', lat);
                            handleInputChange('longitud', lng);
                            handleInputChange('direccionCompleta', address);
                          }}
                          initialLat={13.7042}
                          initialLng={-89.2073}
                        />
                      </div>

                      {/* Estrato Social */}
                      <div>
                        <Label>Estrato Social del Barrio</Label>
                        {!propertyData.estratoSocial && (
                          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded mb-4">
                            <p className="text-red-800 font-medium">
                              ⚠️ <strong>FALTA COMPLETAR:</strong> Estrato social VACÍO
                            </p>
                          </div>
                        )}
                        
                        {!selectedMainStrata && (
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <button 
                              className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50"
                              onClick={() => setSelectedMainStrata('bajo')}
                            >
                              <div className="text-center">
                                <span className="text-3xl">🏚️</span>
                                <h4 className="font-bold">BARRIO POBRE</h4>
                              </div>
                            </button>
                            <button 
                              className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50"
                              onClick={() => setSelectedMainStrata('medio')}
                            >
                              <div className="text-center">
                                <span className="text-3xl">🏙️</span>
                                <h4 className="font-bold">BARRIO NORMAL</h4>
                              </div>
                            </button>
                            <button 
                              className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50"
                              onClick={() => setSelectedMainStrata('alto')}
                            >
                              <div className="text-center">
                                <span className="text-3xl">🏰</span>
                                <h4 className="font-bold">BARRIO RICO</h4>
                              </div>
                            </button>
                          </div>
                        )}

                        {selectedMainStrata && !propertyData.estratoSocial && (
                          <div className="mt-4 space-y-2">
                            {selectedMainStrata === 'bajo' && (
                              <>
                                <button 
                                  className="w-full p-3 border-2 border-red-200 rounded-lg hover:bg-red-50 text-left"
                                  onClick={() => handleInputChange('estratoSocial', 'bajo_bajo')}
                                >
                                  🏚️ {estratoSocialLabels['bajo_bajo']}
                                </button>
                                <button 
                                  className="w-full p-3 border-2 border-red-200 rounded-lg hover:bg-red-50 text-left"
                                  onClick={() => handleInputChange('estratoSocial', 'bajo_medio')}
                                >
                                  🏡 {estratoSocialLabels['bajo_medio']}
                                </button>
                                <button 
                                  className="w-full p-3 border-2 border-red-200 rounded-lg hover:bg-red-50 text-left"
                                  onClick={() => handleInputChange('estratoSocial', 'bajo_alto')}
                                >
                                  🏘️ {estratoSocialLabels['bajo_alto']}
                                </button>
                              </>
                            )}
                            {selectedMainStrata === 'medio' && (
                              <>
                                <button 
                                  className="w-full p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-left"
                                  onClick={() => handleInputChange('estratoSocial', 'medio_bajo')}
                                >
                                  🏙️ {estratoSocialLabels['medio_bajo']}
                                </button>
                                <button 
                                  className="w-full p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-left"
                                  onClick={() => handleInputChange('estratoSocial', 'medio_medio')}
                                >
                                  🏢 {estratoSocialLabels['medio_medio']}
                                </button>
                                <button 
                                  className="w-full p-3 border-2 border-blue-200 rounded-lg hover:bg-blue-50 text-left"
                                  onClick={() => handleInputChange('estratoSocial', 'medio_alto')}
                                >
                                  🏰 {estratoSocialLabels['medio_alto']}
                                </button>
                              </>
                            )}
                            {selectedMainStrata === 'alto' && (
                              <>
                                <button 
                                  className="w-full p-3 border-2 border-green-200 rounded-lg hover:bg-green-50 text-left"
                                  onClick={() => handleInputChange('estratoSocial', 'alto_medio')}
                                >
                                  🗼 {estratoSocialLabels['alto_medio']}
                                </button>
                                <button 
                                  className="w-full p-3 border-2 border-green-200 rounded-lg hover:bg-green-50 text-left"
                                  onClick={() => handleInputChange('estratoSocial', 'alto_alto')}
                                >
                                  💎 {estratoSocialLabels['alto_alto']}
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {propertyData.estratoSocial && (
                          <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                            <p className="text-green-800 font-medium">
                              ✅ <strong>COMPLETADO:</strong> {estratoSocialLabels[propertyData.estratoSocial as EstratoSocial]}
                            </p>
                          </div>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 3: Características */}
                <TabsContent value="tipo" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>📏 Características de la Propiedad</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Área Total (m²)</Label>
                          <Input 
                            type="number" 
                            value={propertyData.area || ''}
                            onChange={(e) => handleInputChange('area', Number(e.target.value))}
                            placeholder="Ingresa el área"
                          />
                        </div>
                        <div>
                          <Label>Habitaciones</Label>
                          <Input 
                            type="number" 
                            value={propertyData.habitaciones || ''}
                            onChange={(e) => handleInputChange('habitaciones', Number(e.target.value))}
                            placeholder="Número de habitaciones"
                          />
                        </div>
                        <div>
                          <Label>Baños</Label>
                          <Input 
                            type="number" 
                            value={propertyData.banos || ''}
                            onChange={(e) => handleInputChange('banos', Number(e.target.value))}
                            placeholder="Número de baños"
                          />
                        </div>
                        <div>
                          <Label>Antigüedad (años)</Label>
                          <Input 
                            type="number" 
                            value={propertyData.antiguedad || ''}
                            onChange={(e) => handleInputChange('antiguedad', Number(e.target.value))}
                            placeholder="Años de construcción"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 4: Estado */}
                <TabsContent value="ubicacion" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>🔧 Estado de Conservación</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={propertyData.estadoConservacion} onValueChange={(value) => handleInputChange('estadoConservacion', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NUEVO">🆕 Nuevo</SelectItem>
                          <SelectItem value="BUENO">👍 Bueno</SelectItem>
                          <SelectItem value="REGULAR">⚠️ Regular</SelectItem>
                          <SelectItem value="MALO">❌ Malo</SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 5: Características Adicionales */}
                <TabsContent value="caracteristicas" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>🏗️ Características Adicionales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Descripción Adicional</Label>
                        <Textarea 
                          value={propertyData.descripcion}
                          onChange={(e) => handleInputChange('descripcion', e.target.value)}
                          placeholder="Describe características especiales de tu propiedad..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Paso 6: Valuación */}
                <TabsContent value="valuacion" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>💎 Calcular Valuación</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                      <div>
                        <Calculator className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-4">
                          {propertyData.area && propertyData.tipoPropiedad && propertyData.estratoSocial ? 
                            '🎉 ¡Listo para la valuación!' : 
                            '⏳ Complete todos los campos'
                          }
                        </h3>
                      </div>

                      <Button
                        onClick={performValuation}
                        disabled={isLoading || !propertyData.area || !propertyData.tipoPropiedad || !propertyData.estratoSocial}
                        size="lg"
                        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-4 px-8 rounded-xl shadow-lg"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Calculando...
                          </>
                        ) : (
                          <>
                            <Calculator className="w-5 h-5 mr-2" />
                            💎 Calcular Valuación
                          </>
                        )}
                      </Button>

                      {valuationResult && (
                        <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-lg">
                          <h4 className="text-2xl font-bold text-green-800 mb-4">
                            🏆 Resultado de la Valuación
                          </h4>
                          <div className="text-3xl font-bold text-green-900">
                            {countriesConfig[selectedCountry as keyof typeof countriesConfig]?.symbol}
                            {valuationResult.estimatedValue?.toLocaleString()} {valuationResult.currency}
                          </div>
                          <p className="text-green-700 mt-2">
                            Propiedad: {valuationResult.propertyType} de {valuationResult.area} m²
                          </p>
                        </div>
                      )}

                      {(!propertyData.area || !propertyData.tipoPropiedad || !propertyData.estratoSocial) && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded">
                          <p className="text-red-800 font-medium">
                            ❌ <strong>Campos requeridos:</strong>
                          </p>
                          <ul className="text-red-700 text-sm mt-2 space-y-1">
                            {!propertyData.area && <li>• Área de la propiedad</li>}
                            {!propertyData.tipoPropiedad && <li>• Tipo de propiedad</li>}
                            {!propertyData.estratoSocial && <li>• Estrato social del barrio</li>}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </CardContent>
          </Card>

        </div>
      </div>

      <ValuationWalkthrough
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
        onStepChange={() => {}}
      />
    </div>
  );
};

export default PropertyValuation;