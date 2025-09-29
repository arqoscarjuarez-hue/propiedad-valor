import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { LanguageProvider } from "@/hooks/useLanguage";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
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
      <Route path="/" element={<Index />} />
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
          
          
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
