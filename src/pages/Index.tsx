import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentSystem } from "@/components/CommentSystem";
import { ShareButtons } from "@/components/ShareButtons";

// Lazy load components for better performance
const PropertyValuation = lazy(() => import("@/components/PropertyValuation"));
const PWAInstallPrompt = lazy(() => import("@/components/PWAInstallPrompt"));
const HeroSection = lazy(() => import("@/components/HeroSection"));
const FeaturesSection = lazy(() => import("@/components/FeaturesSection"));
const DemoWalkthrough = lazy(() => import("@/components/DemoWalkthrough"));

const Index = () => {
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
                  Sistema profesional de avalúos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Evaluación de propiedades
                </p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {!showComments && !showValuation && (
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={handleShowComments}
                  className="flex items-center gap-3 text-lg font-bold px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  💬 Ver Comentarios
                </Button>
              )}
              
              <ShareButtons />
              {/* Live stats */}
              <div className="hidden lg:flex items-center space-x-8" role="region" aria-label="Estadísticas del sistema">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" aria-label="12,450 propiedades valuadas">12,450+</div>
                  <div className="text-xs text-muted-foreground">Propiedades</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary" aria-label="98.5% de precisión">98.5%</div>
                  <div className="text-xs text-muted-foreground">Precisión</div>
                </div>
                <div className="flex items-center space-x-2" role="status" aria-label="Sistema en línea">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="text-sm text-green-500 font-medium">En Línea</span>
                </div>
              </div>
              
              {/* Mobile stats */}
              <div className="flex lg:hidden items-center space-x-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">12K+</div>
                  <div className="text-xs text-muted-foreground">Valuadas</div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-500 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Comments Section */}
      {showComments && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="outline" onClick={handleBackToHome}>
              ← Volver al inicio
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
                ¿Cómo saber el valor de mi casa o departamento?
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Nuestro sistema profesional de avalúos inmobiliarios te permite conocer el precio real de tu propiedad de forma gratuita e instantánea.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-3">Avalúo de Casas</h3>
                <p className="text-muted-foreground">
                  Calcula el valor comercial de tu casa habitación con nuestro sistema de <strong>tasación inmobiliaria profesional</strong>. 
                  Análisis completo de comparables del mercado actual.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-3">Valuación de Departamentos</h3>
                <p className="text-muted-foreground">
                  <strong>Precio de departamento</strong> basado en ubicación, amenidades y características. 
                  Reporte PDF con análisis detallado del mercado inmobiliario.
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg border">
                <h3 className="font-semibold text-lg mb-3">Tasación de Terrenos</h3>
                <p className="text-muted-foreground">
                  <strong>Avalúo de terreno comercial y residencial</strong>. Calculadora especializada para 
                  determinar el valor por metro cuadrado según zona y uso de suelo.
                </p>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                Software de Valuación Inmobiliaria más Usado en América
              </h3>
              <p className="text-muted-foreground max-w-4xl mx-auto">
                Herramientas profesionales de <strong>avalúo inmobiliario online</strong> que incluyen análisis de mercado, 
                comparables automatizados, reportes certificados y <strong>calculadora de valor de propiedades</strong> 
                para casas, departamentos, terrenos comerciales y residenciales. 
                Sistema confiable para obtener el <strong>precio real de tu propiedad</strong>.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Valuation Section */}
      {showValuation && (
        <main id="valuation-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
          <div className="mb-8 flex items-center justify-between">
            <Button variant="outline" onClick={handleBackToHome}>
              ← Volver al inicio
            </Button>
            <Button 
              variant="default" 
              size="lg"
              onClick={handleShowComments}
              className="flex items-center gap-3 text-lg font-bold px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              💬 Ver Comentarios
            </Button>
            <ShareButtons 
              title="Valuación Inmobiliaria Profesional - Sistema de Avalúos"
              description="Sistema de valuación más avanzado de América. ¡Obtén tu avalúo profesional ahora!"
            />
            <div className="text-center flex-1">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                Realizar Valuación Profesional
              </h2>
              <p className="text-muted-foreground">
                Complete los datos de la propiedad para obtener una valuación precisa
              </p>
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
              ¿Listo para obtener una valuación profesional?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Únete a miles de profesionales que confían en nuestro sistema para 
              obtener valuaciones precisas y reportes de calidad bancaria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={handleStartValuation}
              >
                Comenzar Valuación Ahora
              </Button>
              <Button 
                variant="outline"
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={handleShowDemo}
              >
                Ver Demo de Uso
              </Button>
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
                Sistema profesional de avalúos
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                El sistema de valuación más avanzado y confiable de América. 
                Tecnología de vanguardia al servicio de profesionales inmobiliarios.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Características</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Análisis de mercado automático</li>
                <li>✓ Reportes profesionales PDF/Word</li>
                <li>✓ Integración con Google Maps</li>
                <li>✓ Soporte para múltiples monedas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Cobertura</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>🌎 Todo el continente americano</li>
                <li>🏠 Casas, departamentos, terrenos</li>
                <li>🏢 Propiedades comerciales</li>
                <li>📱 Optimizado para móviles</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left text-muted-foreground">
              <p>&copy; 2024 Sistema profesional de avalúos. Evaluación de propiedades.</p>
              <p className="mt-1 text-sm">Metodología certificada • Reportes de calidad bancaria • Precisión garantizada</p>
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
