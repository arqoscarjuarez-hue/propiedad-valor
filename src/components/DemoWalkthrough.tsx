import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Home, 
  Calculator, 
  FileText,
  CheckCircle,
  Play,
  X,
  Building,
  Settings,
  Camera,
  Star
} from 'lucide-react';

interface DemoWalkthroughProps {
  onClose: () => void;
}

const DemoWalkthrough = ({ onClose }: DemoWalkthroughProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const steps = [
    {
      title: "Bienvenido al Sistema de Valuación",
      subtitle: "Te mostraremos cómo usar las características reales de tu plataforma",
      icon: <Play className="w-6 h-6" />,
      content: (
        <div className="text-center space-y-6">
          <div className="bg-primary/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Características del Sistema Real</h3>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Sistema de pestañas para organizar datos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Captura de áreas por niveles de construcción
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Selección de servicios y características
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Mapas interactivos con Google Maps
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Carga de fotografías del inmueble
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Reportes profesionales en PDF y Word
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            Exploraremos cada funcionalidad paso a paso
          </Badge>
        </div>
      )
    },
    {
      title: "Pestaña 1: Áreas de Construcción",
      subtitle: "Captura las áreas construidas por nivel del inmueble",
      icon: <Building className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">¿Qué se captura aquí?</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Las áreas de construcción en metros cuadrados de cada nivel del inmueble
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-sotano">Sótano (m²)</Label>
              <Input id="demo-sotano" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-primer">Primer Nivel (m²)</Label>
              <Input id="demo-primer" placeholder="120" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-segundo">Segundo Nivel (m²)</Label>
              <Input id="demo-segundo" placeholder="80" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-tercero">Tercer Nivel (m²)</Label>
              <Input id="demo-tercero" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-cuarto">Cuarto Nivel (m²)</Label>
              <Input id="demo-cuarto" placeholder="0" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-terreno">Área del Terreno (m²)</Label>
              <Input id="demo-terreno" placeholder="250" type="number" />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-green-700 dark:text-green-300 text-sm">
              <strong>Resultado:</strong> El sistema calcula automáticamente el área total construida 
              y el coeficiente de ocupación del terreno.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pestaña 2: Tipo de Propiedad",
      subtitle: "Selecciona el tipo de inmueble a valuar",
      icon: <Home className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Tipos disponibles</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              El tipo de propiedad define la metodología de valuación aplicada
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="demo-tipo">Tipo de Propiedad</Label>
            <Select defaultValue="casa">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo de propiedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casa">🏠 Casa</SelectItem>
                <SelectItem value="departamento">🏢 Departamento</SelectItem>
                <SelectItem value="terreno">🌱 Terreno</SelectItem>
                <SelectItem value="comercial">🏪 Comercial</SelectItem>
                <SelectItem value="bodega">📦 Bodega/Almacén</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-yellow-700 dark:text-yellow-300 text-sm">
              <strong>Importante:</strong> Cada tipo de propiedad utiliza comparables 
              y metodologías específicas para obtener valuaciones más precisas.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pestaña 3: Espacios y Características",
      subtitle: "Define la distribución de espacios del inmueble",
      icon: <Settings className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Espacios Habitacionales</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Número de espacios por categoría
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-recamaras">Recámaras</Label>
              <Input id="demo-recamaras" placeholder="3" type="number" className="text-center" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-banos">Baños</Label>
              <Input id="demo-banos" placeholder="2" type="number" className="text-center" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-salas">Salas</Label>
              <Input id="demo-salas" placeholder="1" type="number" className="text-center" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-cochera">Cocheras</Label>
              <Input id="demo-cochera" placeholder="2" type="number" className="text-center" />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Características adicionales:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Antigüedad: 8 años</Label>
              </div>
              <div>
                <Label>Calidad de Ubicación: Excelente</Label>
              </div>
              <div>
                <Label>Estado General: Bueno</Label>
              </div>
              <div>
                <Label>Cocinas: 1</Label>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pestaña 4: Servicios Disponibles",
      subtitle: "Selecciona los servicios y amenidades del inmueble",
      icon: <CheckCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Servicios Básicos y Amenidades</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Los servicios disponibles afectan directamente el valor del inmueble
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium">Servicios Básicos</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <label className="text-sm">Agua Potable</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <label className="text-sm">Electricidad</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <label className="text-sm">Gas Natural</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <label className="text-sm">Drenaje</label>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h5 className="font-medium">Amenidades</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <label className="text-sm">Internet</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <label className="text-sm">Alberca</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox defaultChecked />
                  <label className="text-sm">Jardín</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox />
                  <label className="text-sm">Elevador</label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Resumen de Servicios:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="flex justify-between">
                <span>Básicos:</span>
                <span className="font-medium">4/4</span>
              </div>
              <div className="flex justify-between">
                <span>Comunicación:</span>
                <span className="font-medium">1/3</span>
              </div>
              <div className="flex justify-between">
                <span>Comodidades:</span>
                <span className="font-medium">1/5</span>
              </div>
              <div className="flex justify-between">
                <span>Especiales:</span>
                <span className="font-medium">0/3</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pestaña 5: Ubicación",
      subtitle: "Define la ubicación exacta con mapas interactivos",
      icon: <MapPin className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Croquis de Ubicación</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Sistema integrado con Google Maps para ubicación precisa
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo-direccion">Dirección Completa</Label>
              <Input 
                id="demo-direccion" 
                placeholder="Av. Libertador 1234, Colonia Centro, Ciudad" 
                value="Av. Libertador 1234, Buenos Aires, Argentina"
                readOnly
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="demo-lat">Latitud</Label>
                <Input id="demo-lat" value="-34.6037" readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-lng">Longitud</Label>
                <Input id="demo-lng" value="-58.3816" readOnly />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demo-ubicacion">Calidad de Ubicación</Label>
              <Select defaultValue="excelente">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excelente">Excelente</SelectItem>
                  <SelectItem value="buena">Buena</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="mala">Mala</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
              <MapPin className="w-4 h-4" />
              <span>El sistema permite hacer clic en el mapa para seleccionar ubicación exacta</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pestaña 6: Fotografías",
      subtitle: "Carga imágenes del inmueble para el reporte",
      icon: <Camera className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Fotos del Inmueble</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Carga hasta 12 fotografías que se incluirán en el reporte profesional
            </p>
          </div>
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Camera className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Zona de carga de fotografías</p>
            <p className="text-xs text-muted-foreground mt-1">Formatos: JPG, PNG, WebP • Máximo 12 fotos</p>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Tipos de fotos recomendadas:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>✓ Fachada principal</div>
              <div>✓ Sala/Estancia</div>
              <div>✓ Cocina</div>
              <div>✓ Recámaras</div>
              <div>✓ Baños</div>
              <div>✓ Jardín/Patio</div>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-yellow-700 dark:text-yellow-300 text-sm">
              <strong>Tip:</strong> Las fotografías se incluyen automáticamente en el reporte PDF 
              con numeración y fecha de captura.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Pestaña 7: Valuación y Resultados",
      subtitle: "Genera la valuación y descarga reportes profesionales",
      icon: <Calculator className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Análisis y Resultados</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              El sistema procesa la información y genera reportes profesionales
            </p>
          </div>
          
          {/* Resultado simulado */}
          <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl">
            <div className="text-3xl font-bold text-primary mb-2">$185,000 USD</div>
            <div className="text-sm text-muted-foreground mb-4">Valor estimado de mercado</div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Star className="w-3 h-3 mr-1" />
              Confianza: 94.5%
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-card p-4 rounded-lg border">
              <div className="font-semibold text-foreground">Precio por m²</div>
              <div className="text-muted-foreground">$925 USD/m²</div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="font-semibold text-foreground">Comparables</div>
              <div className="text-muted-foreground">127 encontrados</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button className="flex-1" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
            <Button variant="outline" className="flex-1" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Descargar Word
            </Button>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-green-700 dark:text-green-300 text-sm">
              <strong>Funciones adicionales:</strong> Comparación de propiedades 
              y selector de monedas.
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTyping(false);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsTyping(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTyping(false);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 bg-rose-50 dark:bg-rose-950 z-50 overflow-y-auto">
      <Card className="w-full max-w-4xl mx-auto my-8 shadow-2xl border-2">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-xl">
                {currentStepData.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
                <p className="text-muted-foreground">{currentStepData.subtitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-destructive/10">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-3 mb-8 p-4 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Progreso:</span>
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-3 w-12 rounded-full transition-all duration-500 ${
                  index <= currentStep ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-muted'
                }`}
              />
            ))}
            <span className="text-sm font-medium text-primary ml-2">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>

          {/* Content */}
          <div className={`transition-all duration-500 min-h-[400px] ${isTyping ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="bg-card/50 border border-border/50 rounded-xl p-6">
              {currentStepData.content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t bg-muted/20 -mx-8 px-8 py-4 rounded-b-xl">
            <div className="text-muted-foreground font-medium">
              Paso {currentStep + 1} de {steps.length}
            </div>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious} size="lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} size="lg">
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={onClose} className="bg-green-600 hover:bg-green-700" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ¡Entendido!
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DemoWalkthrough;