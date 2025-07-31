import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  MapPin, 
  FileText, 
  Camera, 
  Shield, 
  Globe,
  Clock,
  Award,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: "Análisis de Mercado",
    description: "Comparables automáticos con propiedades similares en tu zona geográfica",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    icon: MapPin,
    title: "Geolocalización Precisa",
    description: "Integración con Google Maps para ubicación exacta y factores de localización",
    gradient: "from-green-500 to-green-600"
  },
  {
    icon: FileText,
    title: "Reportes Profesionales",
    description: "Documentos PDF y Word listos para bancos, notarías y clientes",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    icon: Camera,
    title: "Galería de Fotos",
    description: "Hasta 12 fotografías incluidas en reportes con análisis visual",
    gradient: "from-orange-500 to-orange-600"
  },
  {
    icon: Shield,
    title: "Datos Seguros",
    description: "Encriptación de grado bancario y cumplimiento con regulaciones internacionales",
    gradient: "from-red-500 to-red-600"
  },
  {
    icon: Globe,
    title: "Cobertura Total",
    description: "Disponible en todo el continente americano con monedas locales",
    gradient: "from-indigo-500 to-indigo-600"
  },
  {
    icon: Clock,
    title: "Resultados Instantáneos",
    description: "Valuación completa en menos de 3 minutos con actualización en tiempo real",
    gradient: "from-teal-500 to-teal-600"
  },
  {
    icon: Award,
    title: "Certificación Profesional",
    description: "Metodología avalada por colegios de valuadores y organismos reguladores",
    gradient: "from-yellow-500 to-yellow-600"
  },
  {
    icon: TrendingUp,
    title: "Tendencias del Mercado",
    description: "Análisis de tendencias históricas y proyecciones de valor futuro",
    gradient: "from-pink-500 to-pink-600"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-muted/30 to-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            ¿Por qué elegir nuestro sistema?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tecnología de vanguardia que combina inteligencia artificial, 
            análisis de mercado y metodología profesional para obtener las 
            valuaciones más precisas del mercado.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card/50 backdrop-blur-sm"
            >
              <CardContent className="p-6">
                <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Stats section */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="group">
            <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
              12,450+
            </div>
            <div className="text-muted-foreground font-medium">Propiedades Valuadas</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-secondary mb-2 group-hover:scale-110 transition-transform duration-300">
              98.5%
            </div>
            <div className="text-muted-foreground font-medium">Precisión Promedio</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-yellow-500 mb-2 group-hover:scale-110 transition-transform duration-300">
              45
            </div>
            <div className="text-muted-foreground font-medium">Países Cubiertos</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform duration-300">
              24/7
            </div>
            <div className="text-muted-foreground font-medium">Disponibilidad</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;