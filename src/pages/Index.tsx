import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentSystem } from "@/components/CommentSystem";
import { ShareButtons } from "@/components/ShareButtons";

import { useLanguage } from "@/hooks/useLanguage";
import { indexTranslations } from "@/translations/indexTranslations";

// Lazy load components for better performance
const PropertyValuation = lazy(() => import("@/components/PropertyValuation"));
const PWAInstallPrompt = lazy(() => import("@/components/PWAInstallPrompt"));
const HeroSection = lazy(() => import("@/components/HeroSection"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const DemoWalkthrough = lazy(() => import("@/components/DemoWalkthrough"));

const Index = () => {
  const { selectedLanguage } = useLanguage();
  const t = indexTranslations[selectedLanguage];
  
  const [showValuation, setShowValuation] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartValuation = () => {
    setShowValuation(true);
    setShowComments(false);
    // Scroll to valuation section
    setTimeout(() => {
      document.getElementById('valuation-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleShowDemo = () => {
    setShowDemo(true);
  };

  const handleCloseDemo = () => {
    setShowDemo(false);
  };

  const handleShowComments = () => {
    setShowComments(true);
    setShowValuation(false);
  };

  const handleBackToHome = () => {
    setShowValuation(false);
    setShowComments(false);
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Enhanced Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleBackToHome}>
              <div className="bg-primary/10 p-2 rounded-xl" role="img" aria-label="Logo del valuador inmobiliario">
                <svg 
                  className="w-8 h-8 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
              </div>
              <div>
                <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground">
                  {t.systemTitle}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t.systemSubtitle}
                </p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {/* Sistema en Español */}
               
               {!showComments && !showValuation && (
                 <div className="hidden lg:block">
                   <Button 
                     variant="default" 
                     size="lg"
                     onClick={handleShowComments}
                     className="flex items-center gap-3 text-lg font-bold px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                   >
                     {t.viewComments}
                   </Button>
                 </div>
               )}
              
               <div className="hidden lg:block">
                 <ShareButtons />
               </div>
              {/* Live stats */}
              <div className="hidden lg:flex items-center space-x-8" role="region" aria-label="Estadísticas del sistema">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" aria-label="12,450 propiedades valuadas">12,450+</div>
                  <div className="text-xs text-muted-foreground">{t.properties}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary" aria-label="98.5% de precisión">98.5%</div>
                  <div className="text-xs text-muted-foreground">{t.precision}</div>
                </div>
                <div className="flex items-center space-x-2" role="status" aria-label="Sistema en línea">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="text-sm text-green-500 font-medium">{t.online}</span>
                </div>
              </div>
              
            </div>
          </div>
        </div>
       </header>

       {/* Mobile Stats and Share Section - Solo visible en móviles */}
       <div className="lg:hidden bg-background border-b border-border">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
           <div className="flex flex-col gap-4">
             {/* Share Button y Ver Comentarios en móviles */}
             <div className="flex justify-center gap-3">
               <ShareButtons />
               {!showComments && !showValuation && (
                 <Button 
                   variant="default" 
                   size="sm"
                   onClick={handleShowComments}
                   className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                 >
                   {t.viewComments}
                 </Button>
               )}
             </div>
             
             {/* Statistics */}
             <div className="flex justify-center items-center space-x-6">
               <div className="text-center">
                 <div className="text-lg font-bold text-primary">12,450+</div>
                 <div className="text-xs text-muted-foreground">{t.properties}</div>
               </div>
               <div className="text-center">
                 <div className="text-lg font-bold text-secondary">98.5%</div>
                 <div className="text-xs text-muted-foreground">{t.precision}</div>
               </div>
               <div className="flex items-center space-x-1">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-sm text-green-500 font-medium">{t.online}</span>
               </div>
             </div>
           </div>
         </div>
       </div>

      {/* Comments Section */}
      {showComments && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={handleBackToHome}>
              {t.backToHome}
            </Button>
            <ShareButtons 
              title="Sistema de Comentarios - Avalúos Profesionales"
              description="Comparte tu experiencia y lee comentarios sobre nuestro sistema de valuación inmobiliaria"
            />
          </div>
          <CommentSystem />
        </div>
      )}

      {/* Hero Section */}
      {!showValuation && !showComments && (
        <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
          <HeroSection onStartValuation={handleStartValuation} onShowDemo={handleShowDemo} />
        </Suspense>
      )}
      
      {/* Features Section */}
      {!showValuation && !showComments && (
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <FeaturesSection />
        </Suspense>
      )}

      {/* SEO Content Section */}
      {!showValuation && !showComments && (
        <section className="py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                {t.heroTitle}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {t.heroDescription}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-3">{t.houseAppraisal}</h3>
                <p className="text-muted-foreground">
                  {t.houseDescription}
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-3">{t.apartmentValuation}</h3>
                <p className="text-muted-foreground">
                  {t.apartmentDescription}
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-3">{t.landAppraisal}</h3>
                <p className="text-muted-foreground">
                  {t.landDescription}
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                {t.softwareTitle}
              </h3>
              <p className="text-muted-foreground max-w-4xl mx-auto">
                {t.softwareDescription}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Valuation Section */}
      {showValuation && (
        <main id="valuation-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
          {/* Desktop layout */}
          <div className="mb-8 hidden lg:flex items-center justify-between">
            <Button variant="outline" onClick={handleBackToHome}>
              {t.backToHome}
            </Button>
            <Button 
              variant="default" 
              size="lg"
              onClick={handleShowComments}
              className="flex items-center gap-3 text-lg font-bold px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {t.viewComments}
            </Button>
            <ShareButtons 
              title="Valuación Inmobiliaria Profesional - Sistema de Avalúos"
              description="Sistema de valuación más avanzado de América. ¡Obtén tu avalúo profesional ahora!"
            />
            <div className="text-center flex-1">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                {t.performValuation}
              </h2>
              <p className="text-muted-foreground">
                {t.performDescription}
              </p>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="mb-8 lg:hidden">
            {/* Top row with share and comments buttons */}
            <div className="flex justify-center gap-3 mb-4">
              <ShareButtons 
                title="Valuación Inmobiliaria Profesional - Sistema de Avalúos"
                description="Sistema de valuación más avanzado de América. ¡Obtén tu avalúo profesional ahora!"
              />
              <Button 
                variant="default" 
                size="sm"
                onClick={handleShowComments}
                className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                {t.viewComments}
              </Button>
            </div>
            
            {/* Title section */}
            <div className="text-center mb-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {t.performValuation}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t.performDescription}
              </p>
            </div>
            
            {/* Back button */}
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleBackToHome}>
                {t.backToHome}
              </Button>
            </div>
          </div>
          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <PropertyValuation />
          </Suspense>
        </main>
      )}

      {/* Call to Action */}
      {!showValuation && !showComments && (
        <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              {t.ctaTitle}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {t.ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={handleStartValuation}
              >
                {t.startValuation}
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={handleShowDemo}
              >
                {t.viewDemo}
              </Button>
            </div>
            
            {/* Código de descarga */}
            <div className="mt-12 p-6 bg-card border rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-4 text-foreground">📂 Descargar Código del Componente</h3>
              <div className="space-y-4">
                <Button 
                  variant="secondary"
                  size="lg" 
                  className="text-lg px-8 py-3 w-full sm:w-auto"
                  onClick={() => {
                    const content = `// Archivo: SupabaseGoogleLocationMap.tsx
// Ubicación: src/components/SupabaseGoogleLocationMap.tsx
// Componente React con Google Maps integrado a Supabase

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
    // Esperar a que el DOM esté listo y verificar múltiples veces
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!mapContainer.current && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!mapContainer.current) {
      console.warn('Map container not available after retries');
      setError('No se pudo inicializar el contenedor del mapa');
      return;
    }

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

      // Verificar nuevamente que el contenedor existe después de cargar la API
      if (!mapContainer.current) {
        throw new Error('Map container is null after loading Google Maps API');
      }

      // Limpiar cualquier mapa existente
      if (map.current) {
        map.current = null;
      }
      if (marker.current) {
        marker.current.setMap(null);
        marker.current = null;
      }

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
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(\`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" fill="white"/>
            </svg>
          \`),
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
      const coords = \`\${lat.toFixed(6)}, \${lng.toFixed(6)}\`;
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
    // Usar requestAnimationFrame para asegurar que el DOM esté completamente renderizado
    const initMap = () => {
      requestAnimationFrame(() => {
        initializeGoogleMaps();
      });
    };

    // Delay adicional para asegurar estabilidad
    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      // Limpiar Google Maps al desmontar
      if (marker.current) {
        marker.current.setMap(null);
        marker.current = null;
      }
      if (map.current) {
        map.current = null;
      }
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

      <div 
        ref={mapContainer} 
        className="w-full h-96 rounded-lg border"
        style={{ minHeight: '384px' }}
      >
        {!isMapReady && !loading && !error && (
          <div className="w-full h-96 bg-muted flex items-center justify-center text-center text-muted-foreground">
            <div>
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Inicializando Google Maps...</p>
            </div>
          </div>
        )}
        {loading && (
          <div className="w-full h-96 bg-muted flex items-center justify-center text-center text-muted-foreground">
            <div>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>Cargando Google Maps de forma segura...</p>
            </div>
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

export default SupabaseGoogleLocationMap;

/* 
INSTRUCCIONES PARA USO:

1. Guarda este archivo como: SupabaseGoogleLocationMap.tsx
2. Ubicación en tu proyecto: src/components/SupabaseGoogleLocationMap.tsx
3. Abre con cualquier editor de texto en Windows (Notepad, VSCode, etc.)
4. Copia todo el contenido desde la línea "import React..." hasta "export default SupabaseGoogleLocationMap;"

CARACTERÍSTICAS:
- Integración segura con Google Maps
- API key protegida via Supabase Edge Functions  
- Búsqueda de direcciones
- Geocodificación inversa
- Marcador arrastrable
- Responsive design
- Manejo robusto de errores
*/`;

                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'SupabaseGoogleLocationMap-CODIGO-COMPLETO.txt';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  }}
                >
                  💾 Descargar Código Completo
                </Button>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded inline-block">
                    📁 SupabaseGoogleLocationMap-CODIGO-COMPLETO.txt
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-card border-t border-border mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                {t.systemTitle}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t.softwareDescription}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t.features}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t.automaticAnalysis}</li>
                <li>{t.professionalReports}</li>
                <li>{t.mapsIntegration}</li>
                <li>{t.multiCurrency}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">{t.coverage}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>{t.americaCoverage}</li>
                <li>{t.propertyTypes}</li>
                <li>{t.commercialProperties}</li>
                <li>{t.mobileOptimized}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left text-muted-foreground">
              <p>{t.copyright}</p>
              <p className="mt-1 text-sm">{t.certification}</p>
            </div>
            <ShareButtons />
          </div>
        </div>
      </footer>
      
      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 rounded-full p-3 shadow-lg z-40"
          aria-label="Volver arriba"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
      
      {/* Demo Walkthrough */}
      {showDemo && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50" />}>
          <DemoWalkthrough onClose={handleCloseDemo} />
        </Suspense>
      )}
      
      {/* PWA Install Prompt */}
      <Suspense fallback={null}>
        <PWAInstallPrompt />
      </Suspense>
    </div>
  );
};

export default Index;
