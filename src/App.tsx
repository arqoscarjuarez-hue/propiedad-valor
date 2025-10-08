import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import PropertyValuationTest from "@/components/PropertyValuationTest";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div className="min-h-screen bg-background">
              <header className="bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-primary/10 p-2 rounded-xl">
                        <svg 
                          className="w-8 h-8 text-primary" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="font-display text-xl lg:text-2xl font-bold text-foreground">
                          Valuador de Propiedades
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Sistema profesional de valuación inmobiliaria
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </header>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PropertyValuationTest />
              </div>
            </div>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
