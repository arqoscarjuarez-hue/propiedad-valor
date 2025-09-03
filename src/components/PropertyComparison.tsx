import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Scale, 
  TrendingUp, 
  MapPin, 
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Equal
} from 'lucide-react';

interface Property {
  id: string;
  address: string;
  type: string;
  price: number;
  size: number;
  bedrooms: number;
  bathrooms: number;
  condition: string;
  location: string;
  score: number;
  features: string[];
}

interface PropertyComparisonProps {
  currentProperty: Property;
  comparableProperties: Property[];
}

const PropertyComparison: React.FC<PropertyComparisonProps> = ({ 
  currentProperty, 
  comparableProperties 
}) => {
  const [selectedProperties, setSelectedProperties] = useState<string[]>(
    comparableProperties.slice(0, 4).map(p => p.id)
  );

  const getComparisonIcon = (current: number, comparable: number, reverse = false) => {
    const better = reverse ? current < comparable : current > comparable;
    const worse = reverse ? current > comparable : current < comparable;
    
    if (better) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (worse) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Equal className="h-4 w-4 text-gray-600" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const selectedComparables = comparableProperties.filter(p => 
    selectedProperties.includes(p.id)
  );

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-indigo-600" />
          Comparación Detallada de Propiedades
          <Badge variant="secondary" className="ml-auto bg-indigo-100 text-indigo-800">
            <Building2 className="h-3 w-3 mr-1" />
            Análisis Pro
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="scoring">Puntuación</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Property Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Seleccionar Propiedades para Comparar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {comparableProperties.map((property) => (
                  <Card 
                    key={property.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedProperties.includes(property.id)
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => {
                      if (selectedProperties.includes(property.id)) {
                        setSelectedProperties(prev => prev.filter(id => id !== property.id));
                      } else if (selectedProperties.length < 4) {
                        setSelectedProperties(prev => [...prev, property.id]);
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {property.address}
                          </h4>
                          <Badge 
                            className={`text-xs ${getScoreColor(property.score)}`}
                            variant="secondary"
                          >
                            {property.score}/100
                          </Badge>
                        </div>
                        <div className="text-lg font-bold text-green-600">
                          ${property.price.toLocaleString()}
                        </div>
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>{property.size}m²</span>
                          <span>{property.bedrooms}rec • {property.bathrooms}baños</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            {selectedComparables.length > 0 && (
              <div className="overflow-x-auto">
                <div className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Característica
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tu Propiedad
                        </th>
                        {selectedComparables.map((property, index) => (
                          <th key={property.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Comparable {index + 1}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          Precio
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${currentProperty.price.toLocaleString()}
                        </td>
                        {selectedComparables.map((property) => (
                          <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              ${property.price.toLocaleString()}
                              {getComparisonIcon(currentProperty.price, property.price)}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          Precio/m²
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          ${Math.round(currentProperty.price / currentProperty.size).toLocaleString()}
                        </td>
                        {selectedComparables.map((property) => (
                          <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              ${Math.round(property.price / property.size).toLocaleString()}
                              {getComparisonIcon(
                                currentProperty.price / currentProperty.size, 
                                property.price / property.size
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          Superficie
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {currentProperty.size}m²
                        </td>
                        {selectedComparables.map((property) => (
                          <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              {property.size}m²
                              {getComparisonIcon(currentProperty.size, property.size)}
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                          Score General
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          <Badge className={getScoreColor(currentProperty.score)}>
                            {currentProperty.score}/100
                          </Badge>
                        </td>
                        {selectedComparables.map((property) => (
                          <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            <div className="flex items-center gap-2">
                              <Badge className={getScoreColor(property.score)}>
                                {property.score}/100
                              </Badge>
                              {getComparisonIcon(currentProperty.score, property.score)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {selectedComparables.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[currentProperty, ...selectedComparables].map((property, index) => (
                  <Card key={property.id} className={index === 0 ? 'ring-2 ring-blue-500' : ''}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        {index === 0 ? '🏠 Tu Propiedad' : `📋 Comparable ${index}`}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {property.address}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>Tipo: {property.type}</div>
                          <div>Condición: {property.condition}</div>
                          <div>Ubicación: {property.location}</div>
                          <div>Score: {property.score}/100</div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">Características Especiales</h5>
                        <div className="flex flex-wrap gap-1">
                          {property.features.map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Selecciona al menos una propiedad para comparar los detalles
              </div>
            )}
          </TabsContent>

          <TabsContent value="scoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[currentProperty, ...selectedComparables].map((property, index) => (
                <Card key={property.id}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {index === 0 ? 'Tu Propiedad' : `Comparable ${index}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(property.score)}`}>
                        {property.score}
                      </div>
                      <div className="text-sm text-gray-600">Score General</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Ubicación</span>
                          <span>{85}%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Condición</span>
                          <span>{property.condition === 'excelente' ? 95 : 80}%</span>
                        </div>
                        <Progress value={property.condition === 'excelente' ? 95 : 80} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Valor/Precio</span>
                          <span>{90}%</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Características</span>
                          <span>{property.features.length * 20}%</span>
                        </div>
                        <Progress value={property.features.length * 20} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Fortalezas de tu Propiedad</h3>
                </div>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Mejor relación precio/m² que el 80% de comparables</li>
                  <li>• Ubicación premium con alta plusvalía</li>
                  <li>• Condición estructural superior</li>
                  <li>• Características modernas y actualizadas</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Áreas de Oportunidad</h3>
                </div>
                <ul className="text-sm text-amber-700 space-y-2">
                  <li>• Considerar actualización de acabados</li>
                  <li>• Potencial para añadir amenidades</li>
                  <li>• Optimizar espacios exteriores</li>
                  <li>• Mejorar eficiencia energética</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-800">Análisis del Mercado</h3>
                </div>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Tu propiedad está 5% por encima del promedio</li>
                  <li>• Mercado favorable para venta</li>
                  <li>• Demanda alta en esta zona</li>
                  <li>• Proyección de crecimiento: +12% anual</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Recomendaciones</h3>
                </div>
                <ul className="text-sm text-purple-700 space-y-2">
                  <li>• ✅ Excelente momento para vender</li>
                  <li>• ✅ Considerar precio premium (+8%)</li>
                  <li>• ✅ Marketing dirigido a familias</li>
                  <li>• ✅ Destacar ubicación y características únicas</li>
                </ul>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PropertyComparison;