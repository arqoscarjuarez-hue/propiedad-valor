import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/// <reference types="google.maps" />

interface GoogleLocationMapProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const GoogleLocationMap: React.FC<GoogleLocationMapProps> = ({
  onLocationChange,
  initialLat = 19.4326,
  initialLng = -99.1332,
  initialAddress = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const { toast } = useToast();

  // Función para geocodificación inversa
  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          setCurrentAddress(address);
          onLocationChange?.(lat, lng, address);
        }
      }
    );
  };

  // Función para geocodificar dirección
  const geocodeAddress = (address: string) => {
    if (!address.trim()) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        // Actualizar mapa y marcador
        map.current?.setCenter({ lat, lng });
        if (marker.current) {
          marker.current.setPosition({ lat, lng });
        }
        
        setCurrentAddress(results[0].formatted_address);
        onLocationChange?.(lat, lng, results[0].formatted_address);
      } else {
        toast({
          title: "Error",
          description: "No se pudo encontrar la dirección especificada",
          variant: "destructive"
        });
      }
    });
  };

  // Función para actualizar ubicación
  const handleLocationUpdate = (lat: number, lng: number) => {
    reverseGeocode(lat, lng);
  };

  // Función para buscar dirección
  const searchAddress = () => {
    geocodeAddress(currentAddress);
  };

  // Inicializar Google Maps
  const initializeGoogleMaps = async () => {
    if (!mapContainer.current) return;

    setLoading(true);
    setError(null);

    try {
      let googleApiKey = apiKey;
      
      // Si no tenemos API key, pedir al usuario
      if (!googleApiKey) {
        setShowApiKeyInput(true);
        setLoading(false);
        return;
      }

      const loader = new Loader({
        apiKey: googleApiKey,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      if (!mapContainer.current) return;

      // Crear el mapa
      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Crear marcador arrastrable
      marker.current = new google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: map.current,
        draggable: true,
        title: 'Ubicación de la propiedad'
      });

      // Evento cuando se arrastra el marcador
      marker.current.addListener('dragend', () => {
        if (marker.current) {
          const position = marker.current.getPosition();
          if (position) {
            const lat = position.lat();
            const lng = position.lng();
            handleLocationUpdate(lat, lng);
          }
        }
      });

      // Evento cuando se hace clic en el mapa
      map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng && marker.current) {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          
          marker.current.setPosition({ lat, lng });
          handleLocationUpdate(lat, lng);
        }
      });

      // Geocodificar posición inicial si tenemos una dirección
      if (initialAddress) {
        geocodeAddress(initialAddress);
      } else {
        reverseGeocode(initialLat, initialLng);
      }

      setIsMapReady(true);
      setLoading(false);
      setShowApiKeyInput(false);

    } catch (error) {
      console.error('Error inicializando Google Maps:', error);
      setError('Error al cargar Google Maps. Verifica tu API key.');
      setLoading(false);
    }
  };

  // Efecto para inicializar el mapa
  useEffect(() => {
    initializeGoogleMaps();
  }, [apiKey]);

  // Manejar entrada de API key
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      initializeGoogleMaps();
    }
  };

  if (showApiKeyInput) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración de Google Maps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div>
              <Label htmlFor="api-key">API Key de Google Maps</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Ingresa tu API key de Google Maps"
                className="mt-2"
              />
            </div>
            <Button type="submit" disabled={!apiKey.trim()}>
              Cargar Mapa
            </Button>
          </form>
          <p className="text-sm text-muted-foreground mt-2">
            Necesitas un API key de Google Maps para usar esta funcionalidad.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={() => setShowApiKeyInput(true)}
              variant="outline"
            >
              Configurar API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Campo de búsqueda */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={currentAddress}
            onChange={(e) => setCurrentAddress(e.target.value)}
            placeholder="Buscar dirección..."
            onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
          />
        </div>
        <Button onClick={searchAddress} size="sm">
          <MapPin className="w-4 h-4" />
        </Button>
      </div>

      {/* Contenedor del mapa */}
      <div 
        ref={mapContainer} 
        className="w-full h-96 bg-gray-200 rounded-lg"
        style={{ minHeight: '400px' }}
      >
        {loading && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Cargando mapa...</p>
            </div>
          </div>
        )}
        {!loading && !isMapReady && (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">Inicializando mapa...</p>
          </div>
        )}
      </div>

      {/* Información de la ubicación seleccionada */}
      {currentAddress && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">📍 Ubicación seleccionada:</p>
          <p className="text-sm text-blue-600">{currentAddress}</p>
        </div>
      )}
    </div>
  );
};

export default GoogleLocationMap;