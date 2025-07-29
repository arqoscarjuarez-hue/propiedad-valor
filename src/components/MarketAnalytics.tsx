import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Building, 
  Home,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

interface MarketData {
  month: string;
  precio: number;
  ventas: number;
  inventario: number;
}

interface PropertyTypeData {
  tipo: string;
  ventas: number;
  precio_promedio: number;
  color: string;
}

interface MarketAnalyticsProps {
  propertyType: string;
  location: string;
}

const MarketAnalytics: React.FC<MarketAnalyticsProps> = ({ propertyType, location }) => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [propertyTypeData, setPropertyTypeData] = useState<PropertyTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateMarketData();
  }, [propertyType, location]);

  const generateMarketData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic market data
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const basePrice = propertyType === 'casa' ? 2800000 : 
                     propertyType === 'departamento' ? 1800000 : 800000;
    
    const marketHistory = months.map((month, index) => {
      const trend = 1 + (index * 0.02) + (Math.random() * 0.1 - 0.05); // 2% monthly growth with variance
      return {
        month,
        precio: Math.round(basePrice * trend),
        ventas: Math.round(50 + Math.random() * 30),
        inventario: Math.round(200 + Math.random() * 100)
      };
    });

    const propertyTypes = [
      { tipo: 'Casas', ventas: 45, precio_promedio: 2800000, color: '#8884d8' },
      { tipo: 'Departamentos', ventas: 35, precio_promedio: 1800000, color: '#82ca9d' },
      { tipo: 'Terrenos', ventas: 20, precio_promedio: 800000, color: '#ffc658' }
    ];

    setMarketData(marketHistory);
    setPropertyTypeData(propertyTypes);
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 animate-pulse" />
            Cargando Análisis de Mercado...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Análisis de Mercado Inmobiliario
          <Badge variant="outline" className="ml-auto">
            <Calendar className="h-3 w-3 mr-1" />
            Tiempo Real
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendencias
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Por Tipo
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-sm text-green-700">Precio Promedio</div>
                    <div className="text-lg font-bold text-green-800">
                      {formatCurrency(marketData[marketData.length - 1]?.precio || 0)}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-blue-700">Ventas Mensuales</div>
                    <div className="text-lg font-bold text-blue-800">
                      {marketData[marketData.length - 1]?.ventas || 0}
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="text-sm text-purple-700">Inventario</div>
                    <div className="text-lg font-bold text-purple-800">
                      {marketData[marketData.length - 1]?.inventario || 0}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="h-64">
              <h3 className="text-lg font-semibold mb-3">Evolución de Precios (6 meses)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Precio']} />
                  <Line 
                    type="monotone" 
                    dataKey="precio" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64">
                <h3 className="text-lg font-semibold mb-3">Distribución por Tipo</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="ventas"
                      label={({ tipo, ventas }) => `${tipo}: ${ventas}%`}
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="h-64">
                <h3 className="text-lg font-semibold mb-3">Precio Promedio por Tipo</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertyTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis tickFormatter={(value) => `$${(value/1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Precio Promedio']} />
                    <Bar dataKey="precio_promedio" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Tendencia del Mercado</h4>
                </div>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Crecimiento sostenido del 12% anual</li>
                  <li>• Alta demanda en zona residencial</li>
                  <li>• Inventario balanceado</li>
                  <li>• Tiempo promedio de venta: 45 días</li>
                </ul>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-teal-600" />
                  <h4 className="font-semibold text-teal-800">Análisis de Ubicación</h4>
                </div>
                <ul className="text-sm text-teal-700 space-y-1">
                  <li>• Excelente conectividad urbana</li>
                  <li>• Servicios completos disponibles</li>
                  <li>• Plusvalía proyectada: +15%</li>
                  <li>• Zona de alta demanda familiar</li>
                </ul>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-rose-600" />
                  <h4 className="font-semibold text-rose-800">Factores de Precio</h4>
                </div>
                <ul className="text-sm text-rose-700 space-y-1">
                  <li>• Construcción de calidad premium</li>
                  <li>• Ubicación estratégica</li>
                  <li>• Amenidades modernas</li>
                  <li>• Potencial de revaluación alto</li>
                </ul>
              </Card>

              <Card className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="h-5 w-5 text-violet-600" />
                  <h4 className="font-semibold text-violet-800">Recomendaciones</h4>
                </div>
                <ul className="text-sm text-violet-700 space-y-1">
                  <li>• ✅ Excelente momento para invertir</li>
                  <li>• ✅ Mercado estable y en crecimiento</li>
                  <li>• ✅ ROI proyectado: 8-12% anual</li>
                  <li>• ✅ Liquidez alta en el mercado</li>
                </ul>
              </Card>
            </div>

            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-center">
                <h4 className="font-semibold text-blue-800 mb-2">🏆 Score de Inversión</h4>
                <div className="text-3xl font-bold text-blue-600 mb-2">9.2/10</div>
                <p className="text-sm text-blue-700">
                  Excelente oportunidad de inversión basada en análisis de mercado
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MarketAnalytics;