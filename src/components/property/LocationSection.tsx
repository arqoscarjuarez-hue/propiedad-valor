import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Globe } from 'lucide-react';
import SupabaseGoogleLocationMap from '../SupabaseGoogleLocationMap';

interface PropertyData {
  latitud?: number;
  longitud?: number;
  direccionCompleta?: string;
}

interface LocationSectionProps {
  propertyData: PropertyData;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

export default function LocationSection({ propertyData, onLocationChange }: LocationSectionProps) {
  const handleLocationUpdate = (lat: number, lng: number, address: string) => {
    console.log(`Nueva ubicación: ${lat}, ${lng} - ${address}`);
    onLocationChange(lat, lng, address);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Ubicación de la Propiedad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Badge variant="default" className="cursor-pointer">
          <Globe className="w-3 h-3 mr-1" />
          Google Maps
        </Badge>

        {propertyData.latitud && propertyData.longitud && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Coordenadas:</span>
              <span>{propertyData.latitud.toFixed(6)}, {propertyData.longitud.toFixed(6)}</span>
            </div>
            {propertyData.direccionCompleta && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Dirección:</span> {propertyData.direccionCompleta}
              </p>
            )}
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <SupabaseGoogleLocationMap
            onLocationChange={handleLocationUpdate}
            initialLat={propertyData.latitud || 19.4326}
            initialLng={propertyData.longitud || -99.1332}
            initialAddress={propertyData.direccionCompleta || ''}
          />
        </div>
      </CardContent>
    </Card>
  );
}