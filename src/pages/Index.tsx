import PropertyValuation from "@/components/PropertyValuation";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        {/* Enlace para móvil - Barra superior fija */}
        <div className="bg-primary text-primary-foreground py-2 text-center">
          <a 
            href="https://3ec5020c-6e84-4581-8725-0120596969e6.lovableproject.com?forceHideBadge=true"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 hover:opacity-90 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">📱 Ver en Celular - Optimizado para Móviles</span>
          </a>
        </div>
        
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  Valuador Inmobiliario Pro
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Sistema profesional de avalúos
                </p>
              </div>
            </div>
            
            {/* Estadísticas en vivo */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12,450+</div>
                <div className="text-xs text-slate-500">Propiedades Valuadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">98.5%</div>
                <div className="text-xs text-slate-500">Precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-xs text-slate-500">Disponible</div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">En Línea</span>
              </div>
            </div>
            
            {/* Indicador móvil de estadísticas */}
            <div className="flex lg:hidden items-center space-x-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">12K+</div>
                <div className="text-xs text-slate-500">Valuadas</div>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>
          
          {/* Banner de demostración */}
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Modo Demostración Activo
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Explorando una propiedad de muestra con datos reales del mercado inmobiliario
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  Casa en Del Valle, CDMX
                </span>
                <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                  $2,850,000 MXN
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <PropertyValuation />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-slate-600 dark:text-slate-400">
            <p>&copy; 2024 Valuador Inmobiliario Pro. Sistema profesional de evaluación de propiedades.</p>
            <p className="mt-2 text-sm">Avalúos precisos basados en análisis de mercado y comparables.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
