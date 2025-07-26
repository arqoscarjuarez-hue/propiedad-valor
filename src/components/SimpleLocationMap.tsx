import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Navigation, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleLocationMapProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const SimpleLocationMap: React.FC<SimpleLocationMapProps> = ({
  onLocationChange,
  initialLat = 19.4326,
  initialLng = -99.1332,
  initialAddress = ''
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [searchAddress, setSearchAddress] = useState('');
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Geocodificación gratuita usando Nominatim (OpenStreetMap)
  const searchLocation = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const address = result.display_name;

        setPosition([lat, lng]);
        setCurrentAddress(address);

        if (onLocationChange) {
          onLocationChange(lat, lng, address);
        }

        toast({
          title: "Ubicación Encontrada",
          description: address,
        });
      } else {
        toast({
          title: "No se encontró la dirección",
          description: "Intenta con una dirección más específica",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "Error de búsqueda",
        description: "Error al buscar la ubicación",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Geocodificación inversa
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        setCurrentAddress(data.display_name);
        
        if (onLocationChange) {
          onLocationChange(lat, lng, data.display_name);
        }

        toast({
          title: "Ubicación Actualizada",
          description: data.display_name,
        });
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setCurrentAddress(coords);
      
      if (onLocationChange) {
        onLocationChange(lat, lng, coords);
      }
    }
  };

  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  // Obtener ubicación actual del usuario
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalización no disponible",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handlePositionChange(lat, lng);
        setLoading(false);
        
        toast({
          title: "Ubicación Actual Obtenida",
          description: "Se ha centrado el mapa en tu ubicación",
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoading(false);
        toast({
          title: "Error de Geolocalización",
          description: "No se pudo obtener tu ubicación actual",
          variant: "destructive"
        });
      }
    );
  };

  const openInGoogleMaps = () => {
    const [lat, lng] = position;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const openInAppleMaps = () => {
    const [lat, lng] = position;
    const url = `https://maps.apple.com/?q=${lat},${lng}`;
    window.open(url, '_blank');
  };

  const openInOpenStreetMap = () => {
    const [lat, lng] = position;
    const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Info de aplicación gratuita */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Búsqueda de Ubicación Gratuita</span>
            <span className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">OpenStreetMap</span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Sin necesidad de API keys • Completamente gratuito • Búsqueda global
          </p>
        </CardContent>
      </Card>

      {/* Controles de búsqueda */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar dirección (ej: Av. Reforma 123, CDMX)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchLocation(searchAddress);
              }
            }}
          />
          <Button 
            onClick={() => searchLocation(searchAddress)}
            disabled={loading}
            variant="outline"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={getCurrentLocation}
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Mi Ubicación
          </Button>
          <Button 
            onClick={() => {
              setPosition([19.4326, -99.1332]); // CDMX centro
              reverseGeocode(19.4326, -99.1332);
            }}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Centro CDMX
          </Button>
        </div>

        {currentAddress && (
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Dirección Encontrada:</p>
              <p className="text-xs text-muted-foreground">{currentAddress}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordenadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Vista del mapa estático */}
      <div className="relative">
        <div className="h-64 rounded-lg overflow-hidden border bg-muted">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${position[1] - 0.01},${position[0] - 0.01},${position[1] + 0.01},${position[0] + 0.01}&layer=mapnik&marker=${position[0]},${position[1]}`}
          />
        </div>
        
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{position[0].toFixed(4)}, {position[1].toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Botones para abrir en diferentes aplicaciones de mapas */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Abrir ubicación en:</p>
        <div className="grid grid-cols-3 gap-2">
          <Button 
            onClick={openInGoogleMaps}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Google Maps
          </Button>
          <Button 
            onClick={openInAppleMaps}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            Apple Maps
          </Button>
          <Button 
            onClick={openInOpenStreetMap}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            OpenStreetMap
          </Button>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 <strong>Cómo usar:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Busca una dirección específica en el campo de búsqueda</li>
          <li>Usa "Mi Ubicación" para obtener tu posición actual</li>
          <li>Haz clic en cualquier botón de mapa para ver la ubicación en detalle</li>
          <li>Las coordenadas se usan automáticamente en la valuación</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleLocationMap;