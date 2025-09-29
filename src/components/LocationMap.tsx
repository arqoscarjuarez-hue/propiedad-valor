import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Settings } from 'lucide-react';

import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationMapProps {
  onLocationChange?: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
}

const LocationMap: React.FC<LocationMapProps> = ({
  onLocationChange,
  initialLat = 19.4326,
  initialLng = -99.1332,
  initialAddress = ''
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialLng, initialLat],
        zoom: 15,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Create marker
      marker.current = new mapboxgl.Marker({
        color: '#ef4444',
        draggable: true
      })
        .setLngLat([initialLng, initialLat])
        .addTo(map.current);

      // Handle marker drag
      marker.current.on('dragend', () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          handleLocationUpdate(lngLat.lat, lngLat.lng);
        }
      });

      // Handle map click
      map.current.on('click', (e) => {
        if (marker.current) {
          marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          handleLocationUpdate(e.lngLat.lat, e.lngLat.lng);
        }
      });

      setIsMapReady(true);
      console.log("Mapa Cargado - Haz clic en el mapa o arrastra el marcador");

    } catch (error) {
      console.error("Error de Mapbox - Verifica tu token");
    }

    // Cleanup function to prevent DOM manipulation errors
    return () => {
      try {
        if (marker.current) {
          marker.current.remove();
          marker.current = null;
        }
        
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        
        setIsMapReady(false);
      } catch (e) {
        console.warn('Could not clean up Mapbox resources:', e);
      }
    };
  }, [mapboxToken, initialLat, initialLng]);

  const handleLocationUpdate = async (lat: number, lng: number) => {
    try {
      // Reverse geocoding to get address
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&language=es`
      );
      const data = await response.json();
      
      const address = data.features[0]?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setCurrentAddress(address);
      
      if (onLocationChange) {
        onLocationChange(lat, lng, address);
      }
      
      console.log("Ubicación Actualizada:", address);
    } catch (error) {
      console.error('Error en geocodificación:', error);
      const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setCurrentAddress(coords);
      
      if (onLocationChange) {
        onLocationChange(lat, lng, coords);
      }
    }
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      console.error("Token Requerido - Ingresa tu token de Mapbox");
      return;
    }
    
    if (!mapboxToken.startsWith('pk.')) {
      console.error("Token Inválido - Debe comenzar con 'pk.'");
      return;
    }
  };

  return (
    <div className="space-y-4">
      {!isMapReady && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Mapbox
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mapboxToken">Token Público de Mapbox</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="mapboxToken"
                  type="password"
                  placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                />
                <Button onClick={handleTokenSubmit} variant="outline">
                  Cargar Mapa
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Obtén tu token gratuito en{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isMapReady && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Dirección: {currentAddress}</span>
          </div>
        </div>
      )}

      <div 
        ref={mapContainer} 
        className={`w-full h-96 rounded-lg border ${
          !isMapReady ? 'bg-muted flex items-center justify-center' : ''
        }`}
      >
        {!isMapReady && (
          <div className="text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Configura tu token de Mapbox para ver el mapa</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMap;