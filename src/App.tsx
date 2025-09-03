import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import PropertyValuation from "@/components/PropertyValuation";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { LogOut, User } from "lucide-react";

const queryClient = new QueryClient();

function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
        <User className="mr-2 h-4 w-4" />
        Iniciar Sesión
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">
        {user.email}
      </span>
      <Button onClick={signOut} variant="outline" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Salir
      </Button>
    </div>
  );
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={
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
                      Valuador de Propiedades
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Sistema profesional de valuación inmobiliaria
                    </p>
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex items-center space-x-4">
                  <UserMenu />
                  
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
                      <span className="text-sm text-green-500 font-medium">En línea</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Mobile Stats Section - Solo visible en móviles */}
          <div className="lg:hidden bg-background border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex justify-center items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">12,450+</div>
                  <div className="text-xs text-muted-foreground">Propiedades</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary">98.5%</div>
                  <div className="text-xs text-muted-foreground">Precisión</div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-500 font-medium">En línea</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PropertyValuation />
          </div>
        </div>
      } />
      <Route path="/auth" element={<Auth />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
