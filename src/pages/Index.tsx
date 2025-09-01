import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { indexTranslations } from '@/translations/indexTranslations';

const Index = () => {
  const { selectedLanguage } = useLanguage();
  const t = indexTranslations[selectedLanguage];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-2xl font-bold text-primary">{t.systemTitle}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              {t.heroTitle}
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t.heroDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                {t.houseAppraisal}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t.houseDescription}
              </p>
              <Link to="/valuation">
                <Button className="w-full" size="lg">
                  {t.heroButtonMain}
                </Button>
              </Link>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                {t.apartmentValuation}
              </h3>
              <p className="text-muted-foreground mb-6">
                Valuación especializada para departamentos y condominios con análisis de mercado actualizado.
              </p>
              <Link to="/valuation">
                <Button className="w-full" size="lg" variant="outline">
                  {t.heroButtonMain}
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">{t.valued}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">{t.precision}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">{t.online}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">{t.properties}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;