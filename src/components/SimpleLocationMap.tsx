import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Navigation, Zap, Info, Move } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Leaflet imports
declare global {
  interface Window {
    L: any;
  }
}

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
  const [searchCoordinates, setSearchCoordinates] = useState('');
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(false);
  const [showCoordinatesInfo, setShowCoordinatesInfo] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const { toast } = useToast();

  // Función para convertir coordenadas decimales a formato DMS
  const convertToDMS = (decimal: number, isLatitude: boolean): string => {
    const direction = isLatitude 
      ? (decimal >= 0 ? 'N' : 'S') 
      : (decimal >= 0 ? 'E' : 'W');
    
    const absoluteDecimal = Math.abs(decimal);
    const degrees = Math.floor(absoluteDecimal);
    const minutesFloat = (absoluteDecimal - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = (minutesFloat - minutes) * 60;
    
    return `${degrees}°${minutes.toString().padStart(2, '0')}'${seconds.toFixed(2).padStart(5, '0')}"${direction}`;
  };

  // Cargar Leaflet dinámicamente
  useEffect(() => {
    const loadLeaflet = async () => {
      if (window.L) {
        initMap();
        return;
      }
      
      // Cargar CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
      
      // Cargar JS
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initMap();
      document.head.appendChild(script);
    };
    
    loadLeaflet();
  }, []);

  const initMap = () => {
    if (!mapRef.current || leafletMapRef.current) return;
    
    const L = window.L;
    
    // Crear el mapa
    leafletMapRef.current = L.map(mapRef.current).setView([position[0], position[1]], 15);
    
    // Agregar tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMapRef.current);
    
    // Agregar marcador inicial
    markerRef.current = L.marker([position[0], position[1]], {
      draggable: false
    }).addTo(leafletMapRef.current);
    
    // Event listener para clics en el mapa
    leafletMapRef.current.on('click', function(e: any) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Mover marcador
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      
      // Actualizar posición
      setPosition([lat, lng]);
      reverseGeocode(lat, lng);
    });
  };

  // Actualizar mapa cuando cambia la posición
  useEffect(() => {
    if (leafletMapRef.current && window.L) {
      leafletMapRef.current.setView([position[0], position[1]], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([position[0], position[1]]);
      }
    }
  }, [position]);

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

  // Función simplificada para convertir DMS a decimal
  const parseDMS = (dmsString: string): number => {
    try {
      // Remover espacios extra
      let input = dmsString.trim();
      
      // Detectar dirección
      const isNegative = /[SW]/i.test(input);
      
      // Extraer todos los números (grados, minutos, segundos)
      const numbers = input.match(/\d+(?:\.\d+)?/g);
      
      if (!numbers || numbers.length < 3) {
        throw new Error('Se requieren al menos 3 números: grados, minutos, segundos');
      }
      
      const degrees = parseFloat(numbers[0]);
      const minutes = parseFloat(numbers[1]);
      const seconds = parseFloat(numbers[2]);
      
      // Validaciones básicas
      if (minutes >= 60) throw new Error('Minutos deben ser < 60');
      if (seconds >= 60) throw new Error('Segundos deben ser < 60');
      
      // Convertir a decimal
      let decimal = degrees + minutes / 60 + seconds / 3600;
      
      // Aplicar signo
      if (isNegative) decimal = -decimal;
      
      return decimal;
      
    } catch (error) {
      console.error('Error in parseDMS:', error);
      throw new Error(`Error parseando DMS "${dmsString}": ${error instanceof Error ? error.message : 'formato inválido'}`);
    }
  };

  // Búsqueda por coordenadas directas
  const searchByCoordinates = async (coordsInput: string) => {
    if (!coordsInput.trim()) return;

    setLoading(true);
    try {
      // Parsear diferentes formatos de coordenadas
      let lat: number, lng: number;
      
      // Detectar si es formato DMS (contiene ° o ')
      if (coordsInput.includes('°') || coordsInput.includes("'") || coordsInput.includes('"')) {
        // Formato DMS - puede venir con coma o sin coma
        let parts: string[];
        
        if (coordsInput.includes(',')) {
          // Con coma: "13°43'59.4"N, 89°11'48.9"W"
          parts = coordsInput.split(',');
        } else {
          // Sin coma: "13°43'59.4"N 89°11'48.9"W" - separar por dirección doble
          const pattern = /([0-9°'"NSEW\s.]+[NSEW])\s+([0-9°'"NSEW\s.]+[NSEW])/i;
          const match = coordsInput.match(pattern);
          if (match) {
            parts = [match[1], match[2]];
          } else {
            throw new Error('Formato DMS debe contener latitud y longitud con direcciones N/S/E/W');
          }
        }
        
        if (parts.length === 2) {
          try {
            lat = parseDMS(parts[0].trim());
            lng = parseDMS(parts[1].trim());
          } catch (dmsError) {
            console.error('DMS parsing error:', dmsError);
            throw new Error('Error parseando coordenadas DMS: ' + (dmsError instanceof Error ? dmsError.message : 'formato inválido'));
          }
        } else {
          throw new Error('No se pudieron separar latitud y longitud en formato DMS');
        }
      }
      // Formato decimal: "lat, lng" o "lat,lng"
      else if (coordsInput.includes(',')) {
        const parts = coordsInput.split(',').map(part => part.trim());
        if (parts.length === 2) {
          lat = parseFloat(parts[0]);
          lng = parseFloat(parts[1]);
        } else {
          throw new Error('Formato inválido');
        }
      }
      // Formato decimal: "lat lng" (separado por espacio)
      else if (coordsInput.includes(' ')) {
        const parts = coordsInput.split(' ').filter(part => part.trim() !== '');
        if (parts.length === 2) {
          lat = parseFloat(parts[0]);
          lng = parseFloat(parts[1]);
        } else {
          throw new Error('Formato inválido');
        }
      } else {
        throw new Error('Formato inválido');
      }

      // Validar que las coordenadas son números válidos
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error('Las coordenadas deben ser números válidos');
      }

      // Validar rangos de coordenadas
      if (lat < -90 || lat > 90) {
        throw new Error('La latitud debe estar entre -90 y 90 grados');
      }
      if (lng < -180 || lng > 180) {
        throw new Error('La longitud debe estar entre -180 y 180 grados');
      }

      setPosition([lat, lng]);
      
      // Obtener dirección para estas coordenadas
      await reverseGeocode(lat, lng);

      toast({
        title: "Coordenadas Encontradas",
        description: `Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });

    } catch (error) {
      console.error('Error parsing coordinates:', error);
      toast({
        title: "Error en Coordenadas",
        description: error instanceof Error ? error.message : "Formato inválido. Usa: latitud, longitud",
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

      {/* Instrucciones */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 <strong>Cómo usar:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Busca una dirección específica en el primer campo</li>
          <li><strong>Busca por coordenadas</strong> en el segundo campo (formato: latitud, longitud)</li>
          <li>Usa "Mi Ubicación" para obtener tu posición actual</li>
          <li><strong>Mueve el mapa</strong> arrastrando para explorar diferentes áreas</li>
          <li><strong>Haz clic en el mapa</strong> para colocar el marcador en la ubicación exacta</li>
          <li>Haz clic en cualquier botón de mapa para ver la ubicación en detalle</li>
          <li>Las coordenadas se usan automáticamente en la valuación</li>
        </ul>
        <div className="flex items-center gap-2 mt-2">
          <Button
            onClick={() => setShowCoordinatesInfo(!showCoordinatesInfo)}
            variant="ghost"
            size="sm"
            className="p-1 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
          >
            <Info className="h-4 w-4" />
          </Button>
          <span className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer" onClick={() => setShowCoordinatesInfo(!showCoordinatesInfo)}>
            Ver formatos de coordenadas válidos
          </span>
        </div>
        
        {showCoordinatesInfo && (
          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">Formatos de coordenadas válidos:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700 dark:text-blue-300 text-xs">
              <li><strong>Decimales:</strong> 19.432608, -99.133209</li>
              <li><strong>DMS:</strong> 19°25'57.39"N, 99°8'0.35"W</li>
              <li><strong>Con espacios:</strong> 19° 25' 57.39" N, 99° 8' 0.35" W</li>
              <li>Latitud entre -90 y 90, Longitud entre -180 y 180</li>
            </ul>
          </div>
        )}
      </div>

      {/* Controles de búsqueda */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Escribir dirección del inmueble valuado"
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

        {/* Campo para búsqueda por coordenadas */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Escribir coordenadas del inmueble valuado"
              value={searchCoordinates}
              onChange={(e) => setSearchCoordinates(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  searchByCoordinates(searchCoordinates);
                }
              }}
            />
            <Button 
              onClick={() => searchByCoordinates(searchCoordinates)}
              disabled={loading}
              variant="outline"
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setShowCoordinatesInfo(!showCoordinatesInfo)}
              variant="outline"
              size="sm"
              className="px-2"
              title="Ver formatos de coordenadas válidos"
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
          
          {showCoordinatesInfo && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-2">Formatos de coordenadas válidos:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-blue-700 dark:text-blue-300 text-xs">
                <li><strong>Decimales:</strong> 19.432608, -99.133209</li>
                <li><strong>DMS:</strong> 19°25'57.39"N, 99°8'0.35"W</li>
                <li><strong>Con espacios:</strong> 19° 25' 57.39" N, 99° 8' 0.35" W</li>
                <li>Latitud entre -90 y 90, Longitud entre -180 y 180</li>
              </ul>
            </div>
          )}
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
        </div>

        {currentAddress && (
          <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
            <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">Dirección Encontrada:</p>
              <p className="text-xs text-muted-foreground">{currentAddress}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>Coordenadas Decimales:</strong> {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Coordenadas DMS:</strong> {convertToDMS(position[0], true)}, {convertToDMS(position[1], false)}
              </p>
            </div>
          </div>
        )}
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

      {/* Mapa interactivo Leaflet */}
      <div className="relative">
        <div 
          ref={mapRef}
          className="h-96 rounded-lg overflow-hidden border bg-muted relative"
          style={{ minHeight: '400px' }}
        />
        
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 z-[1000]">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{position[0].toFixed(4)}, {position[1].toFixed(4)}</span>
          </div>
        </div>
        
        <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-2 py-1 z-[1000]">
          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
            <Move className="h-3 w-3" />
            <span>Arrastra para navegar • Haz clic para ubicar</span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default SimpleLocationMap;