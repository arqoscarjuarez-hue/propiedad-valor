import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, BarChart3 } from 'lucide-react';
import { formatCurrency, Currency } from '../CurrencySelector';

interface ValuationResultsProps {
  baseValuation: number | null;
  finalValuation: number | null;
  adjustmentPercentage: number;
  selectedCurrency: Currency;
  isCalculating: boolean;
}

export default function ValuationResults({
  baseValuation,
  finalValuation,
  adjustmentPercentage,
  selectedCurrency,
  isCalculating
}: ValuationResultsProps) {

  if (isCalculating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 animate-spin" />
            Calculando...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!baseValuation && !finalValuation) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Resultados de Valuación
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {baseValuation && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Base</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(baseValuation * selectedCurrency.rate, selectedCurrency)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        )}

        {finalValuation && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Final</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(finalValuation * selectedCurrency.rate, selectedCurrency)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}