import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Shield, Zap, Star, MapPin } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { indexTranslations } from '@/translations/indexTranslations';

const HeroSection = ({ onStartValuation, onShowDemo }: { onStartValuation: () => void; onShowDemo: () => void }) => {
  const { selectedLanguage } = useLanguage();
  const t = indexTranslations[selectedLanguage];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 py-12 lg:py-20">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero content */}
          <div className="text-center lg:text-left">
            <Badge variant="secondary" className="mb-4">
              <Star className="w-3 h-3 mr-1" />
              {t.heroBadge}
            </Badge>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {t.heroMainTitle}
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t.heroSubtitle}</span>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-normal text-muted-foreground">
                {t.heroTagline}
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              <strong>{t.heroDescription}</strong> {t.heroAlgorithm}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link to="/avaluos">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  {t.heroButtonMain}
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg"
                className="text-lg px-8 py-6"
                onClick={onShowDemo}
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                {t.heroButtonDemo}
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                {t.heroSecurity}
              </div>
              <div className="flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                {t.heroInstant}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                {t.heroAmerica}
              </div>
            </div>
          </div>
          
          {/* Feature showcase */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4">
                    <Calculator className="w-8 h-8 text-primary mx-auto" />
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {t.heroValuation}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {t.heroAlgorithm}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">98.5%</div>
                    <div className="text-xs text-green-600">{t.heroPrecision}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">&lt;3min</div>
                    <div className="text-xs text-blue-600">{t.heroTime}</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.heroPropertiesText}</span>
                    <span className="font-semibold text-primary">2,847</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium animate-pulse">
              {t.heroNewBadge}
            </div>
            <div className="absolute -bottom-4 -left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              {t.heroFreeBadge}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;