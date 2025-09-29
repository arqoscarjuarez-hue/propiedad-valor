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
          <div className="p-6 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">💰 Valor Base Calculado</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(baseValuation * selectedCurrency.rate, selectedCurrency)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Basado en método de costo de reposición
                </p>
              </div>
              <Calculator className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
        )}

        {finalValuation && (
          <div className="p-6 bg-gradient-to-r from-primary/15 to-primary/5 rounded-lg border border-primary/30 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-primary/80 mb-1">🏆 Valor Final de Mercado</p>
                <p className="text-4xl font-bold text-primary">
                  {formatCurrency(finalValuation * selectedCurrency.rate, selectedCurrency)}
                </p>
                <p className="text-xs text-primary/70 mt-1">
                  Valor estimado de mercado actual
                </p>
              </div>
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
          </div>
        )}
        
        {baseValuation && finalValuation && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-card border rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">💵 Por m² Terreno</p>
              <p className="text-lg font-semibold">
                {formatCurrency((baseValuation * selectedCurrency.rate) / 100, selectedCurrency)}
              </p>
            </div>
            <div className="p-4 bg-card border rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">📊 Método Utilizado</p>
              <p className="text-sm font-medium">Costo de Reposición</p>
            </div>
            <div className="p-4 bg-card border rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">⏱️ Fecha Valuación</p>
              <p className="text-sm font-medium">{new Date().toLocaleDateString('es-ES')}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}