import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MapPin, Home, DollarSign, Ruler } from 'lucide-react';

interface Comparable {
  id?: string;
  property_type: string;
  total_area: number;
  price_per_sqm_usd: number;
  price_usd: number;
  address: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  source?: string;
  confidence_score?: number;
  sale_date?: string;
  months_old?: number;
}

interface ComparablesFinderProps {
  latitude: number;
  longitude: number;
  propertyType: string;
  area: number;
}

const ComparablesFinder: React.FC<ComparablesFinderProps> = ({
  latitude,
  longitude,
  propertyType,
  area
}) => {
  const [comparables, setComparables] = useState<Comparable[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<string>('');

  const searchComparables = async () => {
    setIsSearching(true);
    setComparables([]);
    
    try {
      // Buscar primero en la base de datos local
      console.log('🔍 Buscando en base de datos local...');
      const { data: dbData, error: dbError } = await supabase.functions.invoke('find-comparables-by-location', {
        body: {
          lat: latitude,
          lng: longitude,
          property_type: propertyType || 'casa',
          area: area || 100
        }
      });

      let foundComparables: Comparable[] = [];

      if (dbData && !dbError && dbData.comparables && dbData.comparables.length > 0) {
        foundComparables = dbData.comparables.slice(0, 3).map((comp: any) => ({
          ...comp,
          source: 'Base de Datos Local'
        }));
        console.log(`✅ Encontrados ${foundComparables.length} comparables en BD local`);
        setSearchSource('Base de Datos Local');
      }

      // Si no hay suficientes, buscar en portales de internet
      if (foundComparables.length < 3) {
        console.log('🌐 Buscando en portales inmobiliarios de internet...');
        const { data: webData, error: webError } = await supabase.functions.invoke('search-real-estate-portals', {
          body: {
            lat: latitude,
            lng: longitude,
            property_type: propertyType || 'casa',
            area: area || 100,
            country: 'Salvador'
          }
        });

        if (webData && !webError && webData.comparables && webData.comparables.length > 0) {
          const webComparables = webData.comparables.slice(0, 3 - foundComparables.length).map((comp: any) => ({
            ...comp,
            source: 'Portales Web'
          }));
          foundComparables = [...foundComparables, ...webComparables];
          console.log(`✅ Encontrados ${webComparables.length} comparables adicionales en web`);
          setSearchSource(foundComparables.length > 0 ? 'Base de Datos + Portales Web' : 'Portales Web');
        }
      }

      if (foundComparables.length > 0) {
        setComparables(foundComparables);
        toast.success(`¡Encontré ${foundComparables.length} comparables cercanos!`);
      } else {
        toast.error('No se encontraron comparables en la zona. Intenta expandir el área de búsqueda.');
        setSearchSource('Sin resultados');
      }

    } catch (error) {
      console.error('Error buscando comparables:', error);
      toast.error('Error al buscar comparables. Inténtalo de nuevo.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control de búsqueda */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Búsqueda de Comparables en Internet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Ubicación:</strong>
                <br />
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </div>
              <div>
                <strong>Tipo:</strong>
                <br />
                {propertyType || 'casa'}
              </div>
              <div>
                <strong>Área:</strong>
                <br />
                {area || 100} m²
              </div>
              <div>
                <strong>Fuentes:</strong>
                <br />
                BD Local + Web
              </div>
            </div>
            
            <Button 
              onClick={searchComparables}
              disabled={isSearching}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSearching ? 'Buscando en todos los portales...' : '🔍 Buscar Comparables en Internet'}
            </Button>
            
            {searchSource && (
              <p className="text-sm text-muted-foreground">
                <strong>Última búsqueda:</strong> {searchSource}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {comparables.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Comparables Encontrados ({comparables.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {comparables.map((comparable, index) => (
                <div key={comparable.id || index} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                      Comparable #{index + 1}
                    </span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {comparable.source}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      <strong>Tipo:</strong> {comparable.property_type}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      <strong>Área:</strong> {comparable.total_area} m²
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <strong>Precio total:</strong>
                      <span className="text-lg font-bold text-green-600">
                        ${comparable.price_usd?.toLocaleString()} USD
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <strong>Precio por m²:</strong>
                      <span className="font-bold text-green-600">
                        ${comparable.price_per_sqm_usd?.toLocaleString()} USD/m²
                      </span>
                    </div>
                    
                    {comparable.distance && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <strong>Distancia:</strong> {comparable.distance.toFixed(1)} km
                      </div>
                    )}
                    
                    {comparable.confidence_score && (
                      <div className="text-xs">
                        <strong>Confianza:</strong> {comparable.confidence_score.toFixed(1)}%
                      </div>
                    )}
                    
                    {comparable.sale_date && (
                      <div className="text-xs">
                        <strong>Fecha de venta:</strong> {new Date(comparable.sale_date).toLocaleDateString('es-ES')}
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-600 border-t pt-2">
                      <strong>📍 Ubicación:</strong> {comparable.address}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-xs">
                ✅ <strong>Búsqueda completa:</strong> Se analizaron tanto la base de datos local como 
                múltiples portales inmobiliarios en internet para encontrar los mejores comparables 
                cercanos a tu propiedad en San Salvador.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparablesFinder;