import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Settings, Shield, CheckCircle } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';

/// <reference types="google.maps" />

interface SupabaseGoogleLocationMapProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const SupabaseGoogleLocationMap: React.FC<SupabaseGoogleLocationMapProps> = ({
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
  
  

  // Función para obtener API key desde Supabase Edge Function
  const getGoogleMapsApiKey = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('google-maps', {
        body: { action: 'get-api-key' }
      });

      if (error) throw error;
      if (!data?.apiKey) throw new Error('No API key received from server');
      
      return data.apiKey;
    } catch (error) {
      console.error('Error getting API key:', error);
      throw new Error('Failed to get Google Maps API key from server');
    }
  };

  // Función para geocodificar usando Supabase Edge Function
  const geocodeAddress = async (address: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-maps', {
        body: { 
          action: 'geocode',
          data: { address }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  };

  // Función para geocodificación inversa usando Supabase Edge Function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('google-maps', {
        body: { 
          action: 'reverse-geocode',
          data: { lat, lng }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  };

  // Inicializar Google Maps
  const initializeGoogleMaps = async () => {
    if (!mapContainer.current) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener API key desde Supabase
      const apiKey = await getGoogleMapsApiKey();

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

      // Crear marcador personalizado
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

      setIsMapReady(true);
      
      // Geocodificar dirección inicial si existe
      if (initialAddress && !currentAddress) {
        setCurrentAddress(initialAddress);
      }

      console.log("Google Maps Cargado desde Supabase");

    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
      
      console.error("Error al Cargar Google Maps");
    } finally {
      setLoading(false);
    }
  };

  // Manejar actualizaciones de ubicación
  const handleLocationUpdate = async (lat: number, lng: number) => {
    try {
      const result = await reverseGeocode(lat, lng);

      if (result.results && result.results[0]) {
        const address = result.results[0].formatted_address;
        setCurrentAddress(address);
        
        if (onLocationChange) {
          onLocationChange(lat, lng, address);
        }
        
        console.log("Ubicación Actualizada:", address);
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

  // Buscar dirección
  const searchAddress = async (address: string) => {
    if (!address.trim()) return;

    try {
      const result = await geocodeAddress(address);
      
      if (result.results && result.results[0]) {
        const location = result.results[0].geometry.location;
        const lat = location.lat;
        const lng = location.lng;
        
        // Centrar mapa y mover marcador
        map.current?.setCenter({ lat, lng });
        marker.current?.setPosition({ lat, lng });
        
        handleLocationUpdate(lat, lng);
      } else {
        console.error("Dirección no encontrada");
      }
    } catch (error) {
      console.error('Error searching address:', error);
      console.error("Error al buscar la dirección");
    }
  };

  // Cargar mapa al montar el componente
  useEffect(() => {
    let mounted = true;
    
    const initMap = async () => {
      if (!mounted) return;
      await initializeGoogleMaps();
    };
    
    initMap();
    
    // Cleanup function to prevent DOM manipulation errors
    return () => {
      mounted = false;
      
      // Remove event listeners first
      if (marker.current && typeof google !== 'undefined' && google.maps?.event) {
        try {
          google.maps.event.clearInstanceListeners(marker.current);
          marker.current.setMap(null);
        } catch (e) {
          console.warn('Error cleaning marker:', e);
        }
        marker.current = null;
      }
      
      if (map.current && typeof google !== 'undefined' && google.maps?.event) {
        try {
          google.maps.event.clearInstanceListeners(map.current);
        } catch (e) {
          console.warn('Error cleaning map:', e);
        }
        map.current = null;
      }
      
      // Clear container safely - let React handle the outer wrapper
      if (mapContainer.current) {
        try {
          // Don't manipulate DOM directly, let React handle it
          // Just clear the ref
          mapContainer.current = null;
        } catch (e) {
          console.warn('Error clearing map container ref:', e);
        }
      }
      
      setIsMapReady(false);
      setLoading(false);
      setError(null);
    };
  }, []);

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Settings className="h-5 w-5" />
            Error de Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive mb-2">
              <strong>Error:</strong> {error}
            </p>
            <p className="text-xs text-muted-foreground">
              El API key de Google Maps debe estar configurado en los secretos de Supabase.
            </p>
          </div>
          <Button onClick={initializeGoogleMaps} variant="outline" className="w-full">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info de seguridad */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Conexión Segura</span>
            <CheckCircle className="h-4 w-4" />
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 mt-1">
            API key protegido mediante Supabase Edge Functions
          </p>
        </CardContent>
      </Card>

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

      <div className="w-full h-96 rounded-lg border overflow-hidden">
        <div 
          ref={mapContainer} 
          className={`w-full h-full ${
            !isMapReady ? 'bg-muted flex items-center justify-center' : ''
          }`}
        >
          {!isMapReady && !loading && !error && (
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Inicializando Google Maps...</p>
            </div>
          )}
          {loading && (
            <div className="text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Cargando Google Maps de forma segura...</p>
            </div>
          )}
        </div>
      </div>

      {isMapReady && (
        <div className="text-xs text-muted-foreground">
          <p>💡 Tip: Puedes arrastrar el marcador rojo o hacer clic en cualquier parte del mapa para cambiar la ubicación.</p>
        </div>
      )}
    </div>
  );
};

export default SupabaseGoogleLocationMap;