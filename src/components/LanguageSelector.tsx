import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, type Language } from '@/hooks/useLanguage';

const languages = [
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt' as Language, name: 'Português', flag: '🇧🇷' },
];

export function LanguageSelector() {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  
  const currentLanguage = languages.find(lang => lang.code === selectedLanguage) || languages[0]; // Español por defecto
  
  // Debug: verificar qué se está mostrando
  console.log('LanguageSelector - currentLanguage:', currentLanguage);
  console.log('LanguageSelector - botón muestra solo:', '🌐', currentLanguage.flag);

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg">
          <span className="text-sm sm:text-base">Idioma / Language</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 sm:gap-2 bg-background/95 hover:bg-muted/50 border-border min-w-[80px] sm:min-w-[100px] w-full justify-center"
            >
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="text-sm sm:text-lg">{currentLanguage.flag}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-background/95 backdrop-blur-sm border shadow-lg z-[9999]">
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                onClick={() => setSelectedLanguage(language.code)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedLanguage === language.code ? 'bg-muted' : ''
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Mostrar nombre del idioma seleccionado */}
        <div className="text-center mt-3">
          <p className="text-sm font-semibold text-foreground">
            {currentLanguage.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}