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
  Gift,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { indexTranslations } from '@/translations/indexTranslations';

const FeaturesSection = () => {
  const { selectedLanguage } = useLanguage();
  const t = indexTranslations[selectedLanguage];

  const features = [
    {
      icon: BarChart3,
      title: t.featureMarketAnalysis,
      description: t.featureMarketDesc,
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: MapPin,
      title: t.featureGeolocation,
      description: t.featureGeoDesc,
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: FileText,
      title: t.featureReports,
      description: t.featureReportsDesc,
      gradient: "from-purple-500 to-purple-600"
    },
    {
      icon: Camera,
      title: t.featurePhotos,
      description: t.featurePhotosDesc,
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      title: t.featureSecurity,
      description: t.featureSecurityDesc,
      gradient: "from-red-500 to-red-600"
    },
    {
      icon: Globe,
      title: t.featureGlobal,
      description: t.featureGlobalDesc,
      gradient: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Clock,
      title: t.featureInstant,
      description: t.featureInstantDesc,
      gradient: "from-teal-500 to-teal-600"
    },
    {
      icon: Gift,
      title: t.featureFree,
      description: t.featureFreeDesc,
      gradient: "from-yellow-500 to-yellow-600"
    },
    {
      icon: TrendingUp,
      title: t.featureTrends,
      description: t.featureTrendsDesc,
      gradient: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-muted/30 to-muted/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t.featuresTitle}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.featuresDescription}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
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
            <div className="text-muted-foreground font-medium">{t.statsProperties}</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-secondary mb-2 group-hover:scale-110 transition-transform duration-300">
              98.5%
            </div>
            <div className="text-muted-foreground font-medium">{t.statsPrecision}</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-yellow-500 mb-2 group-hover:scale-110 transition-transform duration-300">
              45
            </div>
            <div className="text-muted-foreground font-medium">{t.statsCountries}</div>
          </div>
          <div className="group">
            <div className="text-4xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform duration-300">
              24/7
            </div>
            <div className="text-muted-foreground font-medium">{t.statsAvailability}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;