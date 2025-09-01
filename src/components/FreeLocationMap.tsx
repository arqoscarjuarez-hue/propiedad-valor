import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FreeLocationMapProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const FreeLocationMap: React.FC<FreeLocationMapProps> = ({
  onLocationChange,
  initialLat = 19.4326,
  initialLng = -99.1332,
  initialAddress = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
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
        setCurrentAddress(address);
        onLocationChange?.(lat, lng, address);
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

    // Crear el mapa
    map.current = L.map(mapContainer.current).setView([initialLat, initialLng], 15);

    // Agregar capa de OpenStreetMap (gratuito)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Crear marcador arrastrable
    marker.current = L.marker([initialLat, initialLng], {
      draggable: true
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

      {/* Contenedor del mapa */}
      <div 
        ref={mapContainer} 
        className="w-full h-96 bg-gray-200 rounded-lg border-2 border-emerald-200"
        style={{ minHeight: '400px' }}
      >
        {!isMapReady && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
              <p className="text-emerald-600">Cargando mapa...</p>
            </div>
          </div>
        )}
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
          💡 <strong>Instrucciones:</strong> Haz clic en el mapa o arrastra el marcador para seleccionar una ubicación. 
          También puedes buscar una dirección usando el campo de búsqueda.
        </p>
      </div>
    </div>
  );
};

export default FreeLocationMap;