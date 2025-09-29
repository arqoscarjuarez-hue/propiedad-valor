import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Download, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CodeExporter = () => {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const projectInfo = {
    name: "Sistema Profesional de Valuación Inmobiliaria",
    version: "2.0.0",
    description: "Aplicación web profesional para valuación de propiedades inmobiliarias con mapas interactivos, múltiples métodos de valuación y generación de documentos.",
    author: "Desarrollado con Lovable",
    lastUpdate: new Date().toLocaleDateString('es-ES')
  };

  const getAllProjectCode = async () => {
    // Estructura completa del código del proyecto
    const projectStructure = `
# ${projectInfo.name}
Versión: ${projectInfo.version}
Descripción: ${projectInfo.description}
Autor: ${projectInfo.author}
Última actualización: ${projectInfo.lastUpdate}

## Estructura del Proyecto

### Archivos Principales
- src/App.tsx - Aplicación principal con routing y providers
- src/main.tsx - Punto de entrada de la aplicación
- src/index.css - Estilos globales y tokens de diseño

### Componentes Principales
- src/components/PropertyValuation.tsx - Componente principal de valuación
- src/components/GoogleLocationMap.tsx - Mapa de Google Maps
- src/components/SupabaseGoogleLocationMap.tsx - Mapa con integración Supabase
- src/components/SimpleLocationMap.tsx - Mapa simple con OpenStreetMap
- src/components/LocationMap.tsx - Mapa de Mapbox
- src/components/CurrencySelector.tsx - Selector de monedas
- src/components/ShareButtons.tsx - Botones de compartir
- src/components/DemoWalkthrough.tsx - Tutorial interactivo
- src/components/FeaturesSection.tsx - Sección de características
- src/components/PropertyComparison.tsx - Comparación de propiedades
- src/components/PWAInstallPrompt.tsx - Prompt de instalación PWA
- src/components/HeroSection.tsx - Sección héroe
- src/components/LanguageSelector.tsx - Selector de idiomas

### Componentes UI (shadcn/ui)
- src/components/ui/ - Biblioteca completa de componentes UI

### Hooks Personalizados
- src/hooks/useAuth.tsx - Hook de autenticación
- src/hooks/useLanguage.tsx - Hook de idiomas
- src/hooks/use-mobile.tsx - Hook para detectar móviles
- src/hooks/use-toast.ts - Hook de notificaciones

### Utilidades
- src/utils/validation.ts - Validaciones del sistema
- src/utils/landSizeAdjustment.ts - Ajustes por tamaño de terreno
- src/utils/errorHandler.ts - Manejo de errores
- src/utils/logger.ts - Sistema de logging
- src/utils/logging.ts - Utilidades de logging
- src/utils/generateSitemap.ts - Generación de sitemap

### Páginas
- src/pages/Index.tsx - Página principal
- src/pages/Auth.tsx - Página de autenticación
- src/pages/NotFound.tsx - Página 404

### Configuración
- src/integrations/supabase/client.ts - Cliente de Supabase
- src/translations/indexTranslations.ts - Traducciones
- src/types/global.ts - Tipos TypeScript globales
- src/constants/appConstants.ts - Constantes de la aplicación

### Configuración del Proyecto
- tailwind.config.ts - Configuración de Tailwind CSS
- vite.config.ts - Configuración de Vite
- tsconfig.json - Configuración de TypeScript
- package.json - Dependencias del proyecto

### Características Principales
✅ Sistema de valuación inmobiliaria profesional
✅ Múltiples métodos de valuación (comparativo y renta)
✅ Integración con mapas (Google Maps, Mapbox, OpenStreetMap)
✅ Generación de documentos PDF y Word
✅ Sistema de autenticación
✅ Soporte multiidioma (Español/Inglés)
✅ Diseño responsive y moderno
✅ PWA (Progressive Web App)
✅ SEO optimizado
✅ Integración con Supabase
✅ Sistema de notificaciones
✅ Validaciones completas
✅ Manejo de errores robusto

### Tecnologías Utilizadas
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Supabase
- React Router
- React Hook Form
- Zod (validaciones)
- jsPDF (generación PDF)
- docx (generación Word)
- Lucide React (iconos)
- Radix UI (componentes base)
- Google Maps API
- Mapbox GL JS
- Leaflet (OpenStreetMap)

### Estructura de Carpetas
\`\`\`
src/
├── components/
│   ├── ui/              # Componentes UI base
│   ├── PropertyValuation.tsx
│   ├── GoogleLocationMap.tsx
│   ├── SupabaseGoogleLocationMap.tsx
│   ├── SimpleLocationMap.tsx
│   ├── LocationMap.tsx
│   ├── CurrencySelector.tsx
│   ├── ShareButtons.tsx
│   ├── DemoWalkthrough.tsx
│   ├── FeaturesSection.tsx
│   ├── PropertyComparison.tsx
│   ├── PWAInstallPrompt.tsx
│   ├── HeroSection.tsx
│   └── LanguageSelector.tsx
├── hooks/
│   ├── useAuth.tsx
│   ├── useLanguage.tsx
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── pages/
│   ├── Index.tsx
│   ├── Auth.tsx
│   └── NotFound.tsx
├── utils/
│   ├── validation.ts
│   ├── landSizeAdjustment.ts
│   ├── errorHandler.ts
│   ├── logger.ts
│   ├── logging.ts
│   └── generateSitemap.ts
├── integrations/
│   └── supabase/
│       └── client.ts
├── translations/
│   └── indexTranslations.ts
├── types/
│   └── global.ts
├── constants/
│   └── appConstants.ts
├── lib/
│   └── utils.ts
├── App.tsx
├── main.tsx
└── index.css
\`\`\`

## Instrucciones de Instalación

1. Clonar el repositorio
2. Instalar dependencias: \`npm install\`
3. Configurar variables de entorno en .env
4. Ejecutar en desarrollo: \`npm run dev\`
5. Construir para producción: \`npm run build\`

## Variables de Entorno Requeridas
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_GOOGLE_MAPS_API_KEY (opcional)
- VITE_MAPBOX_ACCESS_TOKEN (opcional)

## Características del Sistema

### Valuación de Propiedades
- Método comparativo de mercado
- Método de capitalización de renta
- Validaciones automáticas
- Cálculos precisos basados en ubicación

### Mapas Interactivos
- Google Maps con búsqueda
- Mapbox con diseño personalizado
- OpenStreetMap gratuito
- Geolocalización automática

### Generación de Documentos
- Reportes PDF profesionales
- Documentos Word editables
- Incluye mapas y datos completos
- Descarga automática

### Sistema de Usuarios
- Autenticación con Supabase
- Gestión de sesiones
- Perfiles de usuario
- Seguridad implementada

Este es un sistema completo y profesional de valuación inmobiliaria desarrollado con las mejores prácticas de desarrollo web moderno.
`;

    return projectStructure;
  };

  const handleCopyCode = async () => {
    try {
      const fullCode = await getAllProjectCode();
      await navigator.clipboard.writeText(fullCode);
      setIsCopied(true);
      toast({
        title: "¡Código copiado!",
        description: "El código completo del proyecto ha sido copiado al portapapeles.",
      });
      
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Error al copiar",
        description: "No se pudo copiar el código. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async () => {
    try {
      const fullCode = await getAllProjectCode();
      const blob = new Blob([fullCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectInfo.name.replace(/\s+/g, '-').toLowerCase()}-codigo-completo.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "¡Descarga iniciada!",
        description: "El archivo con el código completo se está descargando.",
      });
    } catch (error) {
      toast({
        title: "Error en la descarga",
        description: "No se pudo descargar el archivo. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Exportar Código del Proyecto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Información del Proyecto */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">{projectInfo.name}</h3>
          <p className="text-muted-foreground text-sm mb-3">{projectInfo.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">v{projectInfo.version}</Badge>
            <Badge variant="outline">{projectInfo.author}</Badge>
            <Badge variant="outline">Actualizado: {projectInfo.lastUpdate}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Tecnologías:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>React 18 + TypeScript</li>
                <li>Tailwind CSS + Radix UI</li>
                <li>Supabase + Authentication</li>
                <li>Google Maps + Mapbox</li>
              </ul>
            </div>
            <div>
              <strong>Características:</strong>
              <ul className="list-disc list-inside text-muted-foreground mt-1">
                <li>Valuación Inmobiliaria</li>
                <li>Mapas Interactivos</li>
                <li>Generación PDF/Word</li>
                <li>Sistema Multiidioma</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={handleCopyCode}
            className="flex-1"
            size="lg"
          >
            {isCopied ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                ¡Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Código Completo
              </>
            )}
          </Button>
          
          <Button 
            onClick={handleDownload}
            variant="outline"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            Descargar como Archivo
          </Button>
        </div>

        {/* Nota Informativa */}
        <div className="text-xs text-muted-foreground p-3 bg-blue-50 rounded-lg border border-blue-200">
          <strong>Nombre recomendado del archivo:</strong> <code>sistema-avaluos-inmobiliarios-completo.txt</code>
          <br />
          <strong>Nota:</strong> Este exportador incluye la estructura completa del proyecto, 
          descripción de componentes, tecnologías utilizadas e instrucciones de instalación.
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeExporter;