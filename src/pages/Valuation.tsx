import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PropertyValuation from '@/components/PropertyValuation';
import { useLanguage } from '@/hooks/useLanguage';
import { indexTranslations } from '@/translations/indexTranslations';

const Valuation = () => {
  console.log('Valuation page is loading...');
  const { selectedLanguage } = useLanguage();
  const t = indexTranslations[selectedLanguage];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center">
            <h1 className="text-xl font-semibold">{t.heroButtonMain}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertyValuation />
      </main>
    </div>
  );
};

export default Valuation;