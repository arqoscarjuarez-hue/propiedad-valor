import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, X, Play, CheckCircle2 } from 'lucide-react';

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  action?: string;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: 'welcome',
    title: '¡Bienvenido al Sistema de Valuación!',
    description: 'Te guiaremos paso a paso para completar la valuación de tu propiedad de manera profesional y precisa.',
    action: 'Comenzar Tutorial'
  },
  {
    id: 'estrato-social',
    title: 'Paso 1: ¿Cómo te consideras? - Estrato Socioeconómico',
    description: 'Selecciona tu estrato socioeconómico. Esto afecta el valor final de la propiedad según las normas de valuación. Cada estrato tiene un porcentaje específico que se aplica al cálculo.',
    target: 'estrato-social-select',
    action: 'Seleccionar Estrato'
  },
  {
    id: 'tipo-propiedad',
    title: 'Paso 2: Tipo de Propiedad',
    description: 'Indica si es una casa, apartamento, terreno o local comercial. Esto determina qué campos adicionales necesitarás completar.',
    target: 'tipo-propiedad-select',
    action: 'Seleccionar Tipo'
  },
  {
    id: 'ubicacion',
    title: 'Paso 3: Ubicación de la Propiedad',
    description: 'Ve a la pestaña "Ubicación" e ingresa la dirección completa. Puedes usar el mapa para ser más preciso. La ubicación es fundamental para encontrar comparables.',
    target: 'ubicacion-tab',
    action: 'Ir a Ubicación'
  },
  {
    id: 'areas',
    title: 'Paso 4: Información de Áreas',
    description: 'En la pestaña "Áreas", completa las medidas de tu propiedad. Para apartamentos ingresa el área total, para casas las áreas por nivel, y para terrenos el área del lote.',
    target: 'areas-tab',
    action: 'Completar Áreas'
  },
  {
    id: 'depreciacion',
    title: 'Paso 5: Estado de Conservación',
    description: 'Ve a la pestaña "Depreciación" y selecciona el estado actual de tu propiedad. Puedes usar las tarjetas explicativas para entender cada nivel. Este factor afecta significativamente el valor final.',
    target: 'depreciacion-tab',
    action: 'Evaluar Estado'
  },
  {
    id: 'calcular',
    title: 'Paso 6: Realizar la Valuación',
    description: '¡Ya tienes todos los datos! Ahora haz clic en el botón "Calcular Valuación" para obtener el valor estimado de tu propiedad. El sistema aplicará todos los factores automáticamente.',
    target: 'calcular-button',
    action: 'Calcular Valuación'
  },
  {
    id: 'complete',
    title: '¡Valuación Completada!',
    description: 'Tu valuación estará lista en unos segundos. Podrás ver el valor estimado, los comparables utilizados y descargar un reporte profesional en PDF.',
    action: 'Finalizar Tutorial'
  }
];

interface ValuationWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepId: string) => void;
}

export function ValuationWalkthrough({ isOpen, onClose, onStepChange }: ValuationWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const step = walkthroughSteps[currentStep];
  const isLastStep = currentStep === walkthroughSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      setIsCompleted(true);
      onClose();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(walkthroughSteps[nextStep].id);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(walkthroughSteps[prevStep].id);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    onStepChange?.(walkthroughSteps[stepIndex].id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Tutorial de Valuación</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Paso {currentStep + 1} de {walkthroughSteps.length}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / walkthroughSteps.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step indicators */}
          <div className="flex flex-wrap gap-2">
            {walkthroughSteps.map((s, index) => (
              <button
                key={s.id}
                onClick={() => handleStepClick(index)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  index === currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index < currentStep
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                ) : null}
                {index + 1}
              </button>
            ))}
          </div>

          {/* Step content */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>

            {step.target && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="font-medium text-sm">
                    Busca el elemento resaltado en la página
                  </span>
                </div>
              </div>
            )}

            {currentStep === 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  ¿Qué aprenderás en este tutorial?
                </h4>
                <ul className="text-sm text-green-600 dark:text-green-400 space-y-1">
                  <li>• Cómo seleccionar tu estrato socioeconómico correctamente</li>
                  <li>• Qué información necesitas para cada tipo de propiedad</li>
                  <li>• Cómo usar el mapa para ubicar tu propiedad</li>
                  <li>• Cómo evaluar el estado de conservación</li>
                  <li>• Dónde hacer clic para calcular la valuación</li>
                </ul>
              </div>
            )}

            {currentStep === walkthroughSteps.length - 1 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                  🎉 ¡Felicidades! Has completado el tutorial
                </h4>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Ahora puedes realizar valuaciones profesionales de manera independiente. 
                  Si necesitas ayuda, siempre puedes volver a activar este tutorial.
                </p>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <Badge variant="secondary" className="px-3 py-1">
              {currentStep + 1} / {walkthroughSteps.length}
            </Badge>

            <Button
              onClick={handleNext}
              className="flex items-center gap-2"
            >
              {isLastStep ? 'Finalizar' : step.action || 'Siguiente'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}