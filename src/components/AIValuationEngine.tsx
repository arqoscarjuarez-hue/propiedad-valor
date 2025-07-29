import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, MapPin, BarChart3, Zap, Shield } from 'lucide-react';

interface AIAnalysis {
  marketTrend: number;
  locationScore: number;
  priceAccuracy: number;
  riskAssessment: string;
  futureValue: number;
  confidence: number;
}

interface AIValuationEngineProps {
  propertyData: any;
  valuation: number | null;
}

const AIValuationEngine: React.FC<AIValuationEngineProps> = ({ propertyData, valuation }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (valuation && propertyData) {
      generateAIAnalysis();
    }
  }, [valuation, propertyData]);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI processing with realistic delays
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Advanced AI-like calculations
    const locationFactors = {
      'excelente': 0.95,
      'buena': 0.85,
      'regular': 0.75,
      'mala': 0.65
    };
    
    const conditionFactors = {
      'nuevo': 0.95,
      'bueno': 0.85,
      'regular': 0.75,
      'malo': 0.65
    };
    
    const locationScore = (locationFactors[propertyData.ubicacion as keyof typeof locationFactors] || 0.8) * 100;
    const conditionScore = (conditionFactors[propertyData.estadoGeneral as keyof typeof conditionFactors] || 0.8) * 100;
    
    // Market trend analysis (simulated)
    const marketTrend = 85 + Math.random() * 15; // 85-100%
    
    // Price accuracy based on multiple factors
    const priceAccuracy = Math.min(95, (locationScore + conditionScore) / 2 + Math.random() * 10);
    
    // Future value prediction (1 year)
    const marketGrowth = 1.05 + (Math.random() * 0.1); // 5-15% growth
    const futureValue = valuation * marketGrowth;
    
    // Risk assessment
    const riskLevel = locationScore > 85 && conditionScore > 80 ? 'Bajo' : 
                     locationScore > 70 && conditionScore > 65 ? 'Medio' : 'Alto';
    
    // Overall confidence
    const confidence = Math.min(98, (priceAccuracy + marketTrend) / 2);
    
    setAiAnalysis({
      marketTrend,
      locationScore,
      priceAccuracy,
      riskAssessment: riskLevel,
      futureValue,
      confidence
    });
    
    setIsAnalyzing(false);
  };

  if (!valuation) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
          <Brain className="h-5 w-5" />
          IA Análisis Avanzado
          <Badge variant="secondary" className="ml-auto bg-purple-100 text-purple-800">
            <Zap className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAnalyzing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 animate-pulse text-purple-600" />
              <span className="text-sm">Analizando con IA...</span>
            </div>
            <Progress value={66} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Procesando datos de mercado, ubicación y tendencias...
            </p>
          </div>
        ) : aiAnalysis ? (
          <div className="space-y-4">
            {/* Confidence Score */}
            <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {aiAnalysis.confidence.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Precisión IA</div>
            </div>

            {/* Analysis Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Tendencia Mercado
                </div>
                <Progress value={aiAnalysis.marketTrend} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {aiAnalysis.marketTrend.toFixed(1)}% positiva
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Score Ubicación
                </div>
                <Progress value={aiAnalysis.locationScore} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {aiAnalysis.locationScore.toFixed(1)}/100
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  Precisión Precio
                </div>
                <Progress value={aiAnalysis.priceAccuracy} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {aiAnalysis.priceAccuracy.toFixed(1)}% preciso
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-red-600" />
                  Riesgo Inversión
                </div>
                <Badge 
                  variant={aiAnalysis.riskAssessment === 'Bajo' ? 'default' : 
                          aiAnalysis.riskAssessment === 'Medio' ? 'secondary' : 'destructive'}
                  className="w-full justify-center"
                >
                  {aiAnalysis.riskAssessment}
                </Badge>
              </div>
            </div>

            {/* Future Prediction */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                Valor Proyectado (12 meses)
              </div>
              <div className="text-lg font-bold text-green-700 dark:text-green-300">
                ${aiAnalysis.futureValue.toLocaleString()}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                +{(((aiAnalysis.futureValue - valuation) / valuation) * 100).toFixed(1)}% incremento estimado
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                💡 Insights de IA
              </div>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Mercado inmobiliario en tendencia alcista</li>
                <li>• Ubicación con alta demanda residencial</li>
                <li>• Recomendado para inversión a largo plazo</li>
                {aiAnalysis.riskAssessment === 'Bajo' && (
                  <li>• ✅ Oportunidad de inversión segura</li>
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default AIValuationEngine;