import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Settings, Eye, EyeOff } from 'lucide-react';
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
  const geocoder = useRef<google.maps.Geocoder | null>(null);
  
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  // Cargar API key desde localStorage al montar
  useEffect(() => {
    const savedApiKey = localStorage.getItem('googleMapsApiKey');
    if (savedApiKey) {
      setGoogleMapsApiKey(savedApiKey);
    }
  }, []);

  const initializeGoogleMaps = async (apiKey: string) => {
    if (!mapContainer.current) return;

    setLoading(true);
    try {
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      await loader.load();

      // Inicializar el mapa
      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: initialLat, lng: initialLng },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'simplified' }]
          }
        ]
      });

      // Inicializar servicios
      geocoder.current = new google.maps.Geocoder();

      // Crear marcador
      marker.current = new google.maps.Marker({
        position: { lat: initialLat, lng: initialLng },
        map: map.current,
        draggable: true,
        title: 'Ubicación de la propiedad',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 32)
        }
      });

      // Event listeners
      marker.current.addListener('dragend', () => {
        if (marker.current) {
          const position = marker.current.getPosition();
          if (position) {
            handleLocationUpdate(position.lat(), position.lng());
          }
        }
      });

      map.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && marker.current) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          
          marker.current.setPosition({ lat, lng });
          handleLocationUpdate(lat, lng);
        }
      });

      // Guardar API key en localStorage
      localStorage.setItem('googleMapsApiKey', apiKey);
      setIsMapReady(true);
      
      // Geocodificar dirección inicial si existe
      if (initialAddress && !currentAddress) {
        setCurrentAddress(initialAddress);
      }

      toast({
        title: "Google Maps Cargado",
        description: "Haz clic en el mapa o arrastra el marcador para ubicar la propiedad",
      });

    } catch (error) {
      console.error('Error loading Google Maps:', error);
      toast({
        title: "Error al Cargar Google Maps",
        description: "Verifica que tu API key sea válida y tenga permisos para Maps JavaScript API",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationUpdate = async (lat: number, lng: number) => {
    if (!geocoder.current) return;

    try {
      const response = await geocoder.current.geocode({
        location: { lat, lng }
      });

      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setCurrentAddress(address);
        
        if (onLocationChange) {
          onLocationChange(lat, lng, address);
        }
        
        toast({
          title: "Ubicación Actualizada",
          description: address,
        });
      }
    } catch (error) {
      console.error('Error en geocodificación:', error);
      const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setCurrentAddress(coords);
      
      if (onLocationChange) {
        onLocationChange(lat, lng, coords);
      }
    }
  };

  const handleApiKeySubmit = () => {
    if (!googleMapsApiKey.trim()) {
      toast({
        title: "API Key Requerida",
        description: "Por favor ingresa tu API key de Google Maps",
        variant: "destructive"
      });
      return;
    }

    try {
      initializeGoogleMaps(googleMapsApiKey);
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      toast({
        title: "Error de Inicialización",
        description: "Error al inicializar Google Maps. Verifica tu conexión.",
        variant: "destructive"
      });
    }
  };

  const searchAddress = async (address: string) => {
    if (!geocoder.current || !address.trim()) return;

    try {
      // Timeout para búsquedas lentas en móvil
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Búsqueda timeout')), 10000)
      );
      
      const searchPromise = geocoder.current.geocode({ address });
      const response = await Promise.race([searchPromise, timeoutPromise]);
      
      if ((response as any).results[0]) {
        const location = (response as any).results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        
        // Centrar mapa y mover marcador
        map.current?.setCenter({ lat, lng });
        marker.current?.setPosition({ lat, lng });
        
        handleLocationUpdate(lat, lng);
      } else {
        toast({
          title: "Dirección no encontrada",
          description: "No se pudo encontrar la dirección especificada",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching address:', error);
      toast({
        title: "Error de búsqueda",
        description: error.message === 'Búsqueda timeout' 
          ? "La búsqueda tomó demasiado tiempo. Intenta nuevamente." 
          : "Error al buscar la dirección",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {!isMapReady && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Google Maps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Recomendación: Usar Supabase para mayor seguridad
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Para manejar API keys de forma segura, recomendamos conectar tu proyecto con Supabase.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href="/projects/3ec5020c-6e84-4581-8725-0120596969e6?settings=supabase" target="_blank">
                  Conectar Supabase
                </a>
              </Button>
            </div>

            <div>
              <Label htmlFor="googleMapsApiKey">API Key de Google Maps</Label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <Input
                    id="googleMapsApiKey"
                    type={showApiKey ? "text" : "password"}
                    placeholder="AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={googleMapsApiKey}
                    onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  onClick={handleApiKeySubmit} 
                  variant="outline"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Cargar Mapa"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Obtén tu API key en{' '}
                <a 
                  href="https://console.cloud.google.com/google/maps-apis" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google Cloud Console
                </a>
                . Asegúrate de habilitar Maps JavaScript API.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isMapReady && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar dirección..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchAddress(e.currentTarget.value);
                }
              }}
            />
            <Button 
              variant="outline"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Buscar dirección..."]') as HTMLInputElement;
                if (input) searchAddress(input.value);
              }}
            >
              Buscar
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Dirección: {currentAddress || 'Selecciona una ubicación en el mapa'}</span>
          </div>
        </div>
      )}

      <div 
        ref={mapContainer} 
        className={`w-full h-96 rounded-lg border ${
          !isMapReady ? 'bg-muted flex items-center justify-center' : ''
        }`}
      >
        {!isMapReady && !loading && (
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Configura tu API key de Google Maps para ver el mapa</p>
          </div>
        )}
        {loading && (
          <div className="text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Cargando Google Maps...</p>
          </div>
        )}
      </div>

      {isMapReady && (
        <div className="text-xs text-muted-foreground">
          <p>💡 Tip: Puedes arrastrar el marcador rojo o hacer clic en cualquier parte del mapa para cambiar la ubicación.</p>
        </div>
      )}
    </div>
  );
};

export default GoogleLocationMap;