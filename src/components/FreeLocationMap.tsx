import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Inyectar CSS de Leaflet
if (typeof document !== 'undefined') {
  const leafletCSS = document.createElement('link');
  leafletCSS.rel = 'stylesheet';
  leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
  document.head.appendChild(leafletCSS);
}

// Configurar iconos de Leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface FreeLocationMapProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  fixedAddress?: boolean; // Nuevo prop para controlar si la dirección está fija
}

const FreeLocationMap: React.FC<FreeLocationMapProps> = ({
  onLocationChange,
  initialLat = 19.4326,
  initialLng = -99.1332,
  initialAddress = '',
  fixedAddress = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const { toast } = useToast();

  // Función para geocodificación inversa usando Nominatim (gratuito)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        const address = data.display_name;
        
        // Solo actualizar la dirección mostrada si no está fija
        if (!fixedAddress) {
          setCurrentAddress(address);
          onLocationChange?.(lat, lng, address);
        } else {
          // Si la dirección está fija, solo enviar coordenadas
          onLocationChange?.(lat, lng, currentAddress);
        }
        return address;
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
    }
    return null;
  };

  // Función para geocodificar dirección usando Nominatim (gratuito)
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
        
        if (map.current && marker.current) {
          // Actualizar mapa y marcador
          map.current.setView([latitude, longitude], 16);
          marker.current.setLatLng([latitude, longitude]);
          
          // Obtener dirección de la ubicación actual
          handleLocationUpdate(latitude, longitude);
          
          toast({
            title: "Ubicación encontrada",
            description: "Se ha actualizado tu ubicación en el mapa",
          });
        }
        setGettingLocation(false);
      },
      (error) => {
        let errorMessage = "No se pudo obtener tu ubicación";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación en tu navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Se agotó el tiempo para obtener la ubicación";
            break;
        }
        
        toast({
          title: "Error de ubicación",
          description: errorMessage,
          variant: "destructive"
        });
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Función para actualizar ubicación
  const handleLocationUpdate = (lat: number, lng: number) => {
    reverseGeocode(lat, lng);
  };

  // Función para buscar dirección
  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) return;
    
    const result = await geocodeAddress(searchAddress);
    if (result && map.current && marker.current) {
      // Actualizar mapa y marcador
      map.current.setView([result.lat, result.lng], 16);
      marker.current.setLatLng([result.lat, result.lng]);
      
      setCurrentAddress(result.address);
      onLocationChange?.(result.lat, result.lng, result.address);
    }
  };

  // Inicializar el mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Crear el mapa
      map.current = L.map(mapContainer.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true
      });

      // Agregar capa de OpenStreetMap (gratuito)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Crear marcador arrastrable
      marker.current = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: DefaultIcon
      }).addTo(map.current);

      // Evento cuando se arrastra el marcador
      marker.current.on('dragend', () => {
        if (marker.current) {
          const position = marker.current.getLatLng();
          handleLocationUpdate(position.lat, position.lng);
        }
      });

      // Evento cuando se hace clic en el mapa
      map.current.on('click', (e: L.LeafletMouseEvent) => {
        if (marker.current) {
          const { lat, lng } = e.latlng;
          marker.current.setLatLng([lat, lng]);
          handleLocationUpdate(lat, lng);
        }
      });

      // Geocodificar posición inicial
      if (initialAddress) {
        geocodeAddress(initialAddress);
      } else {
        reverseGeocode(initialLat, initialLng);
      }

      setIsMapReady(true);
      
      // Forzar redibujado del mapa
      setTimeout(() => {
        if (map.current) {
          map.current.invalidateSize();
        }
      }, 100);

    } catch (error) {
      console.error('Error inicializando mapa:', error);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Controles de ubicación */}
      <div className="space-y-3">
        {/* Campo de búsqueda */}
        <div className="space-y-2">
          <Label className="text-base font-semibold">🔍 Buscar dirección (o haga clic en el mapa para seleccionar ubicación)</Label>
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
          className="w-full h-96 bg-gray-200 rounded-lg border-2 border-emerald-200 z-0"
          style={{ 
            minHeight: '400px',
            position: 'relative'
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
          {fixedAddress && (
            <p className="text-xs text-emerald-600 mt-1 italic">
              ✓ Dirección confirmada - solo se actualizan las coordenadas
            </p>
          )}
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

export default FreeLocationMap;