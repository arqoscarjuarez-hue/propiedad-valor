import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowRight, 
  ArrowLeft, 
  MapPin, 
  Home, 
  Calculator, 
  FileText,
  CheckCircle,
  Play,
  X
} from 'lucide-react';

interface DemoWalkthroughProps {
  onClose: () => void;
}

const DemoWalkthrough = ({ onClose }: DemoWalkthroughProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [demoData, setDemoData] = useState({
    address: '',
    city: '',
    propertyType: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    yearBuilt: '',
    condition: '',
    description: ''
  });

  const steps = [
    {
      title: "Bienvenido a la Demo",
      subtitle: "Te mostraremos cómo funciona nuestro sistema de valuación paso a paso",
      icon: <Play className="w-6 h-6" />,
      content: (
        <div className="text-center space-y-6">
          <div className="bg-primary/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">¿Qué aprenderás?</h3>
            <div className="grid gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cómo ingresar los datos de la propiedad
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                El proceso de análisis automático
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Interpretación de resultados
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Generación de reportes profesionales
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            Duración: ~3 minutos
          </Badge>
        </div>
      )
    },
    {
      title: "Paso 1: Ubicación",
      subtitle: "Ingresa la dirección de la propiedad que deseas valuar",
      icon: <MapPin className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-address">Dirección completa</Label>
            <Input
              id="demo-address"
              placeholder="Ej: Av. Libertador 1234"
              value={demoData.address}
              onChange={(e) => setDemoData({...demoData, address: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-city">Ciudad/Estado</Label>
            <Input
              id="demo-city"
              placeholder="Ej: Buenos Aires, Argentina"
              value={demoData.city}
              onChange={(e) => setDemoData({...demoData, city: e.target.value})}
            />
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Nuestro sistema utilizará Google Maps para validar la ubicación y obtener datos del área</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Paso 2: Características",
      subtitle: "Define las características principales de la propiedad",
      icon: <Home className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-type">Tipo de propiedad</Label>
              <Select value={demoData.propertyType} onValueChange={(value) => setDemoData({...demoData, propertyType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casa">Casa</SelectItem>
                  <SelectItem value="departamento">Departamento</SelectItem>
                  <SelectItem value="terreno">Terreno</SelectItem>
                  <SelectItem value="local">Local Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-area">Área total (m²)</Label>
              <Input
                id="demo-area"
                type="number"
                placeholder="120"
                value={demoData.area}
                onChange={(e) => setDemoData({...demoData, area: e.target.value})}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="demo-bedrooms">Dormitorios</Label>
              <Select value={demoData.bedrooms} onValueChange={(value) => setDemoData({...demoData, bedrooms: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="0" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-bathrooms">Baños</Label>
              <Select value={demoData.bathrooms} onValueChange={(value) => setDemoData({...demoData, bathrooms: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="0" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-year">Año construcción</Label>
              <Input
                id="demo-year"
                type="number"
                placeholder="2010"
                value={demoData.yearBuilt}
                onChange={(e) => setDemoData({...demoData, yearBuilt: e.target.value})}
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Paso 3: Estado y Detalles",
      subtitle: "Agrega información adicional sobre el estado de la propiedad",
      icon: <FileText className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-condition">Estado de conservación</Label>
            <Select value={demoData.condition} onValueChange={(value) => setDemoData({...demoData, condition: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excelente">Excelente</SelectItem>
                <SelectItem value="muy-bueno">Muy Bueno</SelectItem>
                <SelectItem value="bueno">Bueno</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="a-refaccionar">A Refaccionar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="demo-description">Descripción adicional (opcional)</Label>
            <Textarea
              id="demo-description"
              placeholder="Ej: Propiedad con piscina, jardín amplio, cochera para 2 autos..."
              value={demoData.description}
              onChange={(e) => setDemoData({...demoData, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-yellow-700 dark:text-yellow-300 text-sm">
              <strong>Tip:</strong> Mientras más detalles proporciones, más precisa será la valuación. 
              Incluye características especiales como piscina, jardín, cochera, etc.
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Paso 4: Procesamiento",
      subtitle: "Nuestro sistema analiza la información y calcula la valuación",
      icon: <Calculator className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-2xl font-bold mb-4">
              Analizando propiedad...
            </div>
            <div className="bg-muted rounded-full h-2 mb-6">
              <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000 w-3/4" />
            </div>
          </div>
          
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Ubicación validada con Google Maps</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Comparables de mercado encontrados (127)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm">Análisis de precios por m² completado</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Generando reporte profesional...</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "¡Resultados Listos!",
      subtitle: "Tu valuación profesional ha sido completada",
      icon: <CheckCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-6">
          <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl">
            <div className="text-3xl font-bold text-primary mb-2">$185,000 USD</div>
            <div className="text-sm text-muted-foreground mb-4">Valor estimado de mercado</div>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Confianza: 94.5%
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-card p-4 rounded-lg border">
              <div className="font-semibold text-foreground">Rango de valor</div>
              <div className="text-muted-foreground">$175K - $195K USD</div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="font-semibold text-foreground">Precio por m²</div>
              <div className="text-muted-foreground">$1,542 USD/m²</div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-blue-700 dark:text-blue-300 text-sm">
              <strong>¡Felicidades!</strong> Tu reporte PDF profesional estaría listo para descargar 
              con análisis detallado, comparables y metodología aplicada.
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

  // Auto-fill demo data on step 4
  useEffect(() => {
    if (currentStep === 4) {
      setDemoData({
        address: 'Av. Libertador 1234',
        city: 'Buenos Aires, Argentina',
        propertyType: 'departamento',
        area: '120',
        bedrooms: '3',
        bathrooms: '2',
        yearBuilt: '2015',
        condition: 'muy-bueno',
        description: 'Departamento con balcón, cocina integrada y excelente ubicación'
      });
    }
  }, [currentStep]);

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