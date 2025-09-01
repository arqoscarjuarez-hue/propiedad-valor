import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SimpleMapProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  onLocationChange,
  initialLat = 19.4326,
  initialLng = -99.1332,
  initialAddress = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  
  const { toast } = useToast();

  // Función para geocodificación inversa
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name;
        setCurrentAddress(address);
        onLocationChange?.(lat, lng, address);
        return address;
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
    }
    return null;
  };

  // Función para geocodificar dirección
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return null;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        return { lat, lng, address: result.display_name };
      }
    } catch (error) {
      console.error('Error en geocodificación:', error);
      toast({
        title: "Error",
        description: "No se pudo encontrar la dirección especificada",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
    return null;
  };

  // Función para buscar dirección
  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return;
    
    const result = await geocodeAddress(searchAddress);
    if (result && map && marker) {
      // Actualizar mapa y marcador
      map.setView([result.lat, result.lng], 16);
      marker.setLatLng([result.lat, result.lng]);
      
      setCurrentAddress(result.address);
      onLocationChange?.(result.lat, result.lng, result.address);
    }
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive"
      });
      return;
    }

    setGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (map && marker) {
          map.setView([latitude, longitude], 16);
          marker.setLatLng([latitude, longitude]);
          reverseGeocode(latitude, longitude);
          
          toast({
            title: "Ubicación encontrada",
            description: "Se ha actualizado tu ubicación en el mapa",
          });
        }
        setGettingLocation(false);
      },
      (error) => {
        toast({
          title: "Error de ubicación",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive"
        });
        setGettingLocation(false);
      }
    );
  };

  // Inicializar el mapa usando scripts dinámicos
  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      try {
        // Cargar CSS de Leaflet
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const cssLink = document.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
          document.head.appendChild(cssLink);
        }

        // Cargar JS de Leaflet
        if (!(window as any).L) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
          script.onload = () => {
            createMap();
          };
          document.head.appendChild(script);
        } else {
          createMap();
        }
      } catch (error) {
        console.error('Error cargando Leaflet:', error);
      }
    };

    const createMap = () => {
      if (!mapContainer.current || !(window as any).L) return;

      const L = (window as any).L;
      
      // Crear el mapa
      const newMap = L.map(mapContainer.current).setView([initialLat, initialLng], 15);

      // Agregar capa de tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(newMap);

      // Crear marcador
      const newMarker = L.marker([initialLat, initialLng], {
        draggable: true
      }).addTo(newMap);

      // Eventos
      newMarker.on('dragend', () => {
        const position = newMarker.getLatLng();
        reverseGeocode(position.lat, position.lng);
      });

      newMap.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        newMarker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      setMap(newMap);
      setMarker(newMarker);
      setIsMapReady(true);

      // Geocodificar posición inicial
      reverseGeocode(initialLat, initialLng);
    };

    initializeMap();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Controles de ubicación */}
      <div className="space-y-3">
        {/* Campo de búsqueda */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">🔍 Buscar dirección</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="Ingresa una dirección para buscar..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearchAddress()}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleSearchAddress} 
              size="sm"
              disabled={loading || !searchAddress.trim()}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Botón de ubicación actual */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">📍 Tu ubicación</Label>
          <Button 
            onClick={getCurrentLocation}
            variant="outline"
            disabled={gettingLocation}
            className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          >
            {gettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                Obteniendo ubicación...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Usar mi ubicación actual
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Contenedor del mapa */}
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-96 bg-gray-200 rounded-lg border-2 border-emerald-200"
          style={{ 
            minHeight: '400px',
            background: isMapReady ? 'transparent' : '#f0f0f0'
          }}
        >
          {!isMapReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
                <p className="text-emerald-600">Cargando mapa...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información de la ubicación seleccionada */}
      {currentAddress && (
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm font-medium text-emerald-800 mb-1">📍 Ubicación seleccionada:</p>
          <p className="text-sm text-emerald-700">{currentAddress}</p>
        </div>
      )}

      {/* Instrucciones */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          💡 <strong>Instrucciones:</strong> 
        </p>
        <ul className="text-xs text-blue-700 mt-1 ml-4 space-y-1">
          <li>🖱️ <strong>Haz clic con el cursor en el mapa</strong> para seleccionar una ubicación</li>
          <li>🔄 Arrastra el marcador para ajustar la posición</li>
          <li>🔍 Busca una dirección específica en el campo de búsqueda</li>
          <li>📍 Usa tu ubicación actual con el botón GPS</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleMap;