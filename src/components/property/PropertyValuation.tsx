import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { indexTranslations } from '@/translations/indexTranslations';
import PropertyForm from './PropertyForm';
import LocationSection from './LocationSection';
import ValuationResults from './ValuationResults';
import CurrencySelector, { Currency } from '../CurrencySelector';
import { ShareButtons } from '../ShareButtons';
import { getUserLocation } from '@/utils/location';
import { calculateBaseValue } from '@/utils/valuation';

interface PropertyData {
  areaSotano: number;
  areaPrimerNivel: number;
  areaSegundoNivel: number;
  areaTercerNivel: number;
  areaCuartoNivel: number;
  areaTerreno: number;
  tipoPropiedad: string;
  ubicacion: string;
  estadoGeneral: string;
  topografia?: string;
  tipoValoracion?: string;
  latitud?: number;
  longitud?: number;
  direccionCompleta?: string;
  alquiler?: number;
}

export default function PropertyValuation() {
  const { selectedLanguage } = useLanguage();
  const t = indexTranslations[selectedLanguage];

  // Estado inicial
  const [propertyData, setPropertyData] = useState<PropertyData>({
    areaSotano: 0,
    areaPrimerNivel: 0,
    areaSegundoNivel: 0,
    areaTercerNivel: 0,
    areaCuartoNivel: 0,
    areaTerreno: 0,
    tipoPropiedad: '',
    ubicacion: '',
    estadoGeneral: ''
  });

  const [activeTab, setActiveTab] = useState('property');
  const [baseValuation, setBaseValuation] = useState<number | null>(null);
  const [finalValuation, setFinalValuation] = useState<number | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>({
    code: 'USD',
    name: 'Dólar Estadounidense',
    symbol: '$',
    rate: 1
  });
  const [adjustmentPercentage, setAdjustmentPercentage] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Inicialización de ubicación del usuario
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getUserLocation();
        setPropertyData(prev => ({
          ...prev,
          latitud: location.lat,
          longitud: location.lng
        }));
        console.log(`Sistema configurado en: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
      } catch (error) {
        console.error('Error inicializando ubicación:', error);
      }
    };

    initializeLocation();
  }, []);

  // Función para manejar cambios en los datos
  const handleInputChange = (field: keyof PropertyData, value: any) => {
    const newData = { ...propertyData, [field]: value };
    setPropertyData(newData);
    
    // Limpiar valuación cuando se cambian datos importantes
    if (['tipoPropiedad', 'areaPrimerNivel', 'areaTerreno', 'ubicacion'].includes(field)) {
      setBaseValuation(null);
      setFinalValuation(null);
      setAdjustmentPercentage(0);
    }
  };

  // Función para manejar cambios de ubicación
  const handleLocationChange = (lat: number, lng: number, address: string) => {
    setPropertyData(prev => ({
      ...prev,
      latitud: lat,
      longitud: lng,
      direccionCompleta: address
    }));
  };

  // Función para manejar cambios de moneda
  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    console.log(`Moneda cambiada: ${currency.name}`);
  };

  // Validación de datos mínimos
  const validateMinimumData = () => {
    if (!propertyData.tipoPropiedad) {
      console.error('Debe seleccionar el tipo de propiedad');
      return false;
    }

    if (propertyData.tipoPropiedad !== 'terreno') {
      const areaTotal = propertyData.areaSotano + propertyData.areaPrimerNivel + 
                       propertyData.areaSegundoNivel + propertyData.areaTercerNivel + 
                       propertyData.areaCuartoNivel;
      
      if (areaTotal <= 0) {
        console.error('Debe ingresar al menos un área de construcción');
        return false;
      }
    }

    if (!propertyData.areaTerreno || propertyData.areaTerreno <= 0) {
      console.error('Debe ingresar el área del terreno');
      return false;
    }

    if (!propertyData.ubicacion) {
      console.error('Debe seleccionar la calidad de ubicación');
      return false;
    }

    if (!propertyData.estadoGeneral) {
      console.error('Debe seleccionar el estado general');
      return false;
    }

    return true;
  };

  // Función principal de cálculo
  const calculateValuation = async () => {
    if (!validateMinimumData()) {
      return;
    }

    setIsCalculating(true);
    
    try {
      console.log('Generando reporte de valuación...');
      
      // Calcular valor base
      const baseValue = calculateBaseValue(propertyData);
      setBaseValuation(baseValue);
      
      // Por ahora, el valor final es igual al base (se puede expandir con comparables)
      setFinalValuation(baseValue);
      setAdjustmentPercentage(0);
      
      console.log(`Valuación completada: ${baseValue.toLocaleString()}`);
      
    } catch (error) {
      console.error('Error en el cálculo:', error);
      console.error('Error calculando la valuación');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Valuación de Propiedades</h1>
          <p className="text-muted-foreground">Sistema profesional de avalúos inmobiliarios</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <CurrencySelector 
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
          />
          <ShareButtons />
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="property">Datos de la Propiedad</TabsTrigger>
          <TabsTrigger value="location">Ubicación</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="property" className="space-y-6">
          <PropertyForm 
            propertyData={propertyData}
            onDataChange={handleInputChange}
          />
          
          <div className="flex gap-3">
            <Button 
              onClick={calculateValuation}
              disabled={isCalculating || !propertyData.tipoPropiedad}
              className="flex-1 lg:flex-initial"
            >
              <Calculator className="w-4 h-4 mr-2" />
              {isCalculating ? 'Calculando...' : 'Calcular Valuación'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('location')}
            >
              Establecer Ubicación
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <LocationSection 
            propertyData={propertyData}
            onLocationChange={handleLocationChange}
          />
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setActiveTab('property')}
            >
              Volver a Propiedades
            </Button>
            <Button 
              onClick={() => setActiveTab('results')}
              disabled={!baseValuation}
            >
              Ver Resultados
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <ValuationResults
            baseValuation={baseValuation}
            finalValuation={finalValuation}
            adjustmentPercentage={adjustmentPercentage}
            selectedCurrency={selectedCurrency}
            isCalculating={isCalculating}
          />
          
          {!baseValuation && !isCalculating && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay valuación disponible</p>
              <Button 
                onClick={() => setActiveTab('property')}
                variant="outline"
                className="mt-4"
              >
                Comenzar Valuación
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}