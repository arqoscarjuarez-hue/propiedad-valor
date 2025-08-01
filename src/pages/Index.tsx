import React, { useState, useEffect } from 'react';
import PropertyValuation from "@/components/PropertyValuation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import DemoWalkthrough from "@/components/DemoWalkthrough";
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

const Index = () => {
  const [showValuation, setShowValuation] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
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
                  Valuador Inmobiliario Pro
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sistema profesional de avalúos
                </p>
              </div>
            </div>
            
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
      </header>

      {/* Hero Section */}
      {!showValuation && <HeroSection onStartValuation={handleStartValuation} onShowDemo={handleShowDemo} />}
      
      {/* Features Section */}
      {!showValuation && <FeaturesSection />}

      {/* Valuation Section */}
      {showValuation && (
        <main id="valuation-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Realizar Valuación Profesional
            </h2>
            <p className="text-muted-foreground">
              Complete los datos de la propiedad para obtener una valuación precisa
            </p>
          </div>
          <PropertyValuation />
        </main>
      )}

      {/* Call to Action */}
      {!showValuation && (
        <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              ¿Listo para obtener una valuación profesional?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Únete a miles de profesionales que confían en nuestro sistema para 
              obtener valuaciones precisas y reportes de calidad bancaria.
            </p>
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={handleStartValuation}
            >
              Comenzar Valuación Ahora
            </Button>
          </div>
        </section>
      )}

      {/* Enhanced Footer */}
      <footer className="bg-card border-t border-border mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">
                Valuador Inmobiliario Pro
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
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Valuador Inmobiliario Pro. Sistema profesional de evaluación de propiedades.</p>
            <p className="mt-2 text-sm">Metodología certificada • Reportes de calidad bancaria • Precisión garantizada</p>
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
      {showDemo && <DemoWalkthrough onClose={handleCloseDemo} />}
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
