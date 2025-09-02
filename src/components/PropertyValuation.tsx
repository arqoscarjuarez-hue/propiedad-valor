import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calculator, Download, Home, Building2, TreePine, Factory, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { indexTranslations } from '@/translations/indexTranslations';
import { LanguageSelector } from '@/components/LanguageSelector';
import CurrencySelector from '@/components/CurrencySelector';
import DemoWalkthrough from '@/components/DemoWalkthrough';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

interface PropertyData {
  tipoPropiedad: string;
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  recamaras: number;
  banos: number;
  estacionamientos: number;
  ubicacion: string;
  direccionCompleta: string;
  tipoConstruccion: string;
  anoPropiedad: number;
  anoRemodelacion?: number;
  estadoConservacion: string;
  nivelSocioeconomico: string;
  factorObsolescencia: number;
  factorDepreciacion: number;
  factorVista: number;
  factorUbicacion: number;
  factorCalidadConstruccion: number;
  costoConstruccion: number;
  valorTerreno: number;
  factorComercializacion: number;
  documentacionLegal: string;
  restriccionesLegales: string;
  serviciosPublicos: string[];
  amenidades: string[];
  riesgosNaturales: string[];
  metodovaluacion: string;
  autovaluo: number;
}

const PropertyValuation = () => {
  const { toast } = useToast();
  const { selectedLanguage } = useLanguage();
  const translations = indexTranslations;

  const [showDemo, setShowDemo] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    tipoPropiedad: '',
    areaSotano: 0,
    areaPrimerNivel: 0,
    areaSegundoNivel: 0,
    areaTercerNivel: 0,
    areaCuartoNivel: 0,
    areaTerreno: 0,
    recamaras: 0,
    banos: 0,
    estacionamientos: 0,
    ubicacion: '',
    direccionCompleta: '',
    tipoConstruccion: '',
    anoPropiedad: new Date().getFullYear() - 10,
    estadoConservacion: '',
    nivelSocioeconomico: '',
    factorObsolescencia: 1.0,
    factorDepreciacion: 1.0,
    factorVista: 1.0,
    factorUbicacion: 1.0,
    factorCalidadConstruccion: 1.0,
    costoConstruccion: 0,
    valorTerreno: 0,
    factorComercializacion: 1.0,
    documentacionLegal: '',
    restriccionesLegales: '',
    serviciosPublicos: [],
    amenidades: [],
    riesgosNaturales: [],
    metodovaluacion: '',
    autovaluo: 0
  });

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'MXN',
    symbol: '$',
    name: 'Peso Mexicano',
    rate: 1
  });

  const [valuation, setValuation] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  const formatCurrency = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateValuation = async () => {
    if (!propertyData.tipoPropiedad) {
      toast({
        title: "Error",
        description: "Por favor selecciona un tipo de propiedad",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    
    setTimeout(() => {
      const builtArea = propertyData.areaPrimerNivel + propertyData.areaSegundoNivel + 
                       propertyData.areaTercerNivel + propertyData.areaCuartoNivel + propertyData.areaSotano;
      
      let baseValue = 0;
      
      if (propertyData.tipoPropiedad === 'terreno') {
        baseValue = propertyData.areaTerreno * 5000;
      } else {
        const constructionValue = builtArea * 15000;
        const landValue = propertyData.areaTerreno * 3000;
        baseValue = constructionValue + landValue;
      }

      const adjustedValue = baseValue * 
        propertyData.factorUbicacion *
        propertyData.factorCalidadConstruccion *
        propertyData.factorVista *
        propertyData.factorComercializacion *
        propertyData.factorDepreciacion *
        propertyData.factorObsolescencia;

      setValuation(adjustedValue);
      setIsCalculating(false);

      toast({
        title: "Éxito",
        description: "Valuación calculada exitosamente",
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
          <Calculator className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
          {translations[selectedLanguage].heroTitle}
        </h1>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground px-4">
          {translations[selectedLanguage].heroDescription}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Paso 1: Selectores */}
        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  1.1
                </div>
                Idioma
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <LanguageSelector />
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-primary-foreground p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="w-6 h-6 bg-white text-primary rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  1.2
                </div>
                Moneda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <CurrencySelector 
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-dashed border-green-300 bg-green-50">
            <CardContent className="p-3 sm:p-6 text-center">
              <Zap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800 mb-1">Modo Demo</h3>
              <p className="text-sm text-green-600 mb-3">Prueba el sistema con datos de ejemplo</p>
              <Button 
                onClick={() => setShowDemo(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Iniciar Demo
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Paso 2 y 3: Formulario */}
        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary to-purple-600 text-secondary-foreground p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="w-6 h-6 bg-white text-secondary rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  2
                </div>
                Tipo de Propiedad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { id: 'casa', icon: Home, label: 'Casa' },
                  { id: 'departamento', icon: Building2, label: 'Departamento' },
                  { id: 'terreno', icon: TreePine, label: 'Terreno' },
                  { id: 'industrial', icon: Factory, label: 'Industrial' }
                ].map((tipo) => (
                  <Button
                    key={tipo.id}
                    variant={propertyData.tipoPropiedad === tipo.id ? "default" : "outline"}
                    className="h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                    onClick={() => setPropertyData(prev => ({ ...prev, tipoPropiedad: tipo.id }))}
                  >
                    <tipo.icon className="h-4 w-4 sm:h-6 sm:w-6" />
                    {tipo.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-accent to-orange-600 text-accent-foreground p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="w-6 h-6 bg-white text-accent rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  3
                </div>
                Datos de la Propiedad
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Áreas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {propertyData.tipoPropiedad !== 'terreno' && (
                    <>
                      <div>
                        <Label htmlFor="areaPrimerNivel">Primer Nivel (m²)</Label>
                        <Input
                          id="areaPrimerNivel"
                          type="number"
                          value={propertyData.areaPrimerNivel || ''}
                          onChange={(e) => setPropertyData(prev => ({ ...prev, areaPrimerNivel: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="areaSegundoNivel">Segundo Nivel (m²)</Label>
                        <Input
                          id="areaSegundoNivel"
                          type="number"
                          value={propertyData.areaSegundoNivel || ''}
                          onChange={(e) => setPropertyData(prev => ({ ...prev, areaSegundoNivel: Number(e.target.value) }))}
                          placeholder="0"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label htmlFor="areaTerreno">Área de Terreno (m²)</Label>
                    <Input
                      id="areaTerreno"
                      type="number"
                      value={propertyData.areaTerreno || ''}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, areaTerreno: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {propertyData.tipoPropiedad !== 'terreno' && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-base sm:text-lg">Características</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="recamaras">Recámaras</Label>
                      <Input
                        id="recamaras"
                        type="number"
                        value={propertyData.recamaras || ''}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, recamaras: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="banos">Baños</Label>
                      <Input
                        id="banos"
                        type="number"
                        value={propertyData.banos || ''}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, banos: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="estacionamientos">Estacionamientos</Label>
                      <Input
                        id="estacionamientos"
                        type="number"
                        value={propertyData.estacionamientos || ''}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, estacionamientos: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-semibold text-base sm:text-lg">Ubicación</h3>
                <div>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    type="text"
                    value={propertyData.ubicacion}
                    onChange={(e) => setPropertyData(prev => ({ ...prev, ubicacion: e.target.value }))}
                    placeholder="Ej: Colonia Centro, Ciudad de México"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    3.6
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg">Calcular Valuación</h3>
                </div>
                <Button 
                  onClick={calculateValuation}
                  disabled={isCalculating || !propertyData.tipoPropiedad}
                  className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  {isCalculating ? 'Calculando...' : 'Calcular Valuación'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Paso 4: Panel de Resultados */}
      {valuation > 0 && (
        <div className="mt-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary to-real-estate-accent text-secondary-foreground p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="w-6 h-6 bg-white text-secondary rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  4
                </div>
                Resultado de Valuación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-semibold text-muted-foreground">Valor Estimado</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-primary leading-tight break-words">
                    {formatCurrency(valuation, selectedCurrency)}
                  </p>
                  <Badge variant="secondary" className="mt-1 sm:mt-2">{selectedCurrency.code}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Paso 5: Descargar Documentos */}
      {valuation > 0 && (
        <div className="mt-6">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <div className="w-6 h-6 bg-white text-green-600 rounded-full flex items-center justify-center text-sm font-bold mr-2">
                  5
                </div>
                Descargar Documentos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Button variant="outline" className="h-12 flex items-center justify-center gap-2">
                  <Download className="h-5 w-5" />
                  Descargar PDF
                </Button>
                <Button variant="outline" className="h-12 flex items-center justify-center gap-2">
                  <Download className="h-5 w-5" />
                  Descargar Word
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showDemo && <DemoWalkthrough onClose={() => setShowDemo(false)} />}
    </div>
  );
};

export default PropertyValuation;