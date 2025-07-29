import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Play, 
  Pause, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Share2,
  Download,
  Eye,
  Home,
  Building,
  MapPin,
  Ruler
} from 'lucide-react';

interface VirtualTourProps {
  propertyType: string;
  images?: Array<{ file: File; preview: string }>;
}

const VirtualTour: React.FC<VirtualTourProps> = ({ propertyType, images = [] }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentView, setCurrentView] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Vistas panorámicas simuladas según el tipo de propiedad
  const virtualViews = {
    casa: [
      { name: 'Fachada Principal', icon: Home, description: 'Vista frontal de la propiedad' },
      { name: 'Sala Principal', icon: Home, description: 'Espacio social principal' },
      { name: 'Cocina Integral', icon: Home, description: 'Área de cocina y comedor' },
      { name: 'Recámara Principal', icon: Home, description: 'Habitación principal con baño' },
      { name: 'Jardín Trasero', icon: MapPin, description: 'Área exterior y jardín' },
      { name: 'Vista Aérea', icon: Building, description: 'Perspectiva general de la propiedad' }
    ],
    departamento: [
      { name: 'Entrada Principal', icon: Building, description: 'Acceso al departamento' },
      { name: 'Sala Comedor', icon: Home, description: 'Área social integrada' },
      { name: 'Cocina', icon: Home, description: 'Cocina equipada moderna' },
      { name: 'Recámara', icon: Home, description: 'Habitación principal' },
      { name: 'Balcón', icon: MapPin, description: 'Vista desde el balcón' },
      { name: 'Amenidades', icon: Building, description: 'Áreas comunes del edificio' }
    ],
    terreno: [
      { name: 'Límites del Terreno', icon: MapPin, description: 'Perímetro de la propiedad' },
      { name: 'Acceso Principal', icon: MapPin, description: 'Entrada al terreno' },
      { name: 'Vista Panorámica', icon: Eye, description: 'Vista general del terreno' },
      { name: 'Servicios Cercanos', icon: Building, description: 'Infraestructura disponible' }
    ]
  };

  const currentViews = virtualViews[propertyType as keyof typeof virtualViews] || virtualViews.casa;

  useEffect(() => {
    generateVirtualView();
  }, [currentView, zoom, rotation]);

  const generateVirtualView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Sky blue
    gradient.addColorStop(1, '#98FB98'); // Pale green
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(zoom, zoom);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw simulated architecture based on property type
    if (propertyType === 'casa') {
      drawHouse(ctx, canvas.width, canvas.height);
    } else if (propertyType === 'departamento') {
      drawApartment(ctx, canvas.width, canvas.height);
    } else {
      drawLand(ctx, canvas.width, canvas.height);
    }

    ctx.restore();
  };

  const drawHouse = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // House base
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(width * 0.2, height * 0.4, width * 0.6, height * 0.4);
    
    // Roof
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(width * 0.15, height * 0.4);
    ctx.lineTo(width * 0.5, height * 0.2);
    ctx.lineTo(width * 0.85, height * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // Door
    ctx.fillStyle = '#654321';
    ctx.fillRect(width * 0.45, height * 0.6, width * 0.1, height * 0.2);
    
    // Windows
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(width * 0.3, height * 0.5, width * 0.08, height * 0.08);
    ctx.fillRect(width * 0.62, height * 0.5, width * 0.08, height * 0.08);
  };

  const drawApartment = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Building
    ctx.fillStyle = '#708090';
    ctx.fillRect(width * 0.25, height * 0.1, width * 0.5, height * 0.7);
    
    // Windows grid
    ctx.fillStyle = '#87CEEB';
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const x = width * 0.3 + col * width * 0.1;
        const y = height * 0.15 + row * height * 0.1;
        ctx.fillRect(x, y, width * 0.05, width * 0.05);
      }
    }
    
    // Balcony
    ctx.fillStyle = '#D3D3D3';
    ctx.fillRect(width * 0.27, height * 0.45, width * 0.46, width * 0.02);
  };

  const drawLand = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Land boundaries
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 3;
    ctx.strokeRect(width * 0.1, height * 0.2, width * 0.8, height * 0.6);
    
    // Trees
    for (let i = 0; i < 3; i++) {
      const x = width * (0.2 + i * 0.3);
      const y = height * 0.6;
      
      // Tree trunk
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x, y, width * 0.02, height * 0.1);
      
      // Tree top
      ctx.fillStyle = '#228B22';
      ctx.beginPath();
      ctx.arc(x + width * 0.01, y, width * 0.04, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Auto-rotate through views
      const interval = setInterval(() => {
        setCurrentView(prev => (prev + 1) % currentViews.length);
      }, 3000);
      
      setTimeout(() => {
        clearInterval(interval);
        setIsPlaying(false);
      }, currentViews.length * 3000);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-indigo-600" />
          Tour Virtual 360°
          <Badge variant="secondary" className="ml-auto bg-indigo-100 text-indigo-800">
            <Eye className="h-3 w-3 mr-1" />
            Inmersivo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="tour" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tour">Tour Virtual</TabsTrigger>
            <TabsTrigger value="measurements">Medidas</TabsTrigger>
            <TabsTrigger value="features">Características</TabsTrigger>
          </TabsList>

          <TabsContent value="tour" className="space-y-4">
            {/* Virtual Tour Viewer */}
            <div className="relative bg-gradient-to-br from-blue-100 to-green-100 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="w-full h-64 object-cover"
              />
              
              {/* Tour Controls Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/70 backdrop-blur-sm text-white p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                      className="text-white hover:bg-white/20"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm px-2">{Math.round(zoom * 100)}%</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                      className="text-white hover:bg-white/20"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRotation(rotation + 90)}
                    className="text-white hover:bg-white/20"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Current View Info */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  {React.createElement(currentViews[currentView].icon, { className: "h-4 w-4" })}
                  <div>
                    <div className="text-sm font-medium">{currentViews[currentView].name}</div>
                    <div className="text-xs opacity-75">{currentViews[currentView].description}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* View Navigation */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {currentViews.map((view, index) => (
                <Button
                  key={index}
                  variant={currentView === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentView(index)}
                  className="flex flex-col items-center gap-1 h-auto py-2"
                >
                  {React.createElement(view.icon, { className: "h-4 w-4" })}
                  <span className="text-xs">{view.name}</span>
                </Button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="measurements" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Dimensiones Principales</h4>
                </div>
                <div className="space-y-2 text-sm text-amber-700">
                  <div className="flex justify-between">
                    <span>Frente:</span>
                    <span className="font-medium">12.50 m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fondo:</span>
                    <span className="font-medium">25.00 m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Superficie total:</span>
                    <span className="font-medium">312.5 m²</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Espacios Interiores</h4>
                </div>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex justify-between">
                    <span>Sala:</span>
                    <span className="font-medium">25 m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cocina:</span>
                    <span className="font-medium">15 m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recámaras:</span>
                    <span className="font-medium">45 m²</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* 3D Floor Plan Placeholder */}
            <div className="bg-gradient-to-br from-slate-100 to-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center text-gray-600">
                <Building className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <div className="font-medium">Plano 3D Interactivo</div>
                <div className="text-sm opacity-75">Disponible en versión premium</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">🏡 Características Arquitectónicas</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Construcción moderna (2020)</li>
                  <li>• Techos de 3.20m de altura</li>
                  <li>• Ventanas de doble cristal</li>
                  <li>• Acabados de primera calidad</li>
                  <li>• Iluminación LED integrada</li>
                </ul>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3">🏠 Espacios y Comodidades</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• 3 recámaras con closets</li>
                  <li>• 2.5 baños completos</li>
                  <li>• Cochera para 2 autos</li>
                  <li>• Jardín trasero (100m²)</li>
                  <li>• Área de lavado techada</li>
                </ul>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
                <h4 className="font-semibold text-red-800 mb-3">🔧 Instalaciones</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Instalación eléctrica 220V</li>
                  <li>• Plomería hidráulica completa</li>
                  <li>• Gas natural conectado</li>
                  <li>• Internet fibra óptica</li>
                  <li>• Sistema de seguridad</li>
                </ul>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                <h4 className="font-semibold text-teal-800 mb-3">🌟 Extras Premium</h4>
                <ul className="text-sm text-teal-700 space-y-1">
                  <li>• Aire acondicionado central</li>
                  <li>• Calentador solar</li>
                  <li>• Paneles solares (opcional)</li>
                  <li>• Cisterna de 5,000L</li>
                  <li>• Jardín con riego automático</li>
                </ul>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button className="flex-1" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar Tour
          </Button>
          <Button className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualTour;