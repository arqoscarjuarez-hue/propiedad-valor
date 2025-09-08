import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, DollarSign, RefreshCw } from 'lucide-react';


export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  title?: string;
  exchangeRateUpdated?: string;
  exchangeRateError?: string;
  errorTitle?: string;
  lastUpdateText?: string;
  exchangeRateNote?: string;
  exchangeRateLabel?: string;
}

const popularCurrencies = [
  // América del Norte
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$' },
  
  // América Latina
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$U' },
  { code: 'BOB', name: 'Boliviano', symbol: 'Bs.' },
  { code: 'PYG', name: 'Guaraní Paraguayo', symbol: '₲' },
  { code: 'CRC', name: 'Colón Costarricense', symbol: '₡' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', symbol: 'Q' },
  { code: 'HNL', name: 'Lempira Hondureño', symbol: 'L' },
  { code: 'NIO', name: 'Córdoba Nicaragüense', symbol: 'C$' },
  { code: 'PAB', name: 'Balboa Panameño', symbol: 'B/.' },
  { code: 'DOP', name: 'Peso Dominicano', symbol: 'RD$' },
  { code: 'CUP', name: 'Peso Cubano', symbol: '$' },
  { code: 'JMD', name: 'Dólar Jamaiquino', symbol: 'J$' },
  { code: 'TTD', name: 'Dólar de Trinidad y Tobago', symbol: 'TT$' },
  { code: 'BBD', name: 'Dólar de Barbados', symbol: 'Bds$' },
  { code: 'BSD', name: 'Dólar de Bahamas', symbol: 'B$' },
  { code: 'BZD', name: 'Dólar de Belice', symbol: 'BZ$' },
  { code: 'GYD', name: 'Dólar Guyanés', symbol: 'G$' },
  { code: 'SRD', name: 'Dólar de Suriname', symbol: 'Sr$' },
  { code: 'HTG', name: 'Gourde Haitiano', symbol: 'G' },
  
  // Europa
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  { code: 'CHF', name: 'Franco Suizo', symbol: 'CHF' },
  { code: 'SEK', name: 'Corona Sueca', symbol: 'kr' },
  { code: 'NOK', name: 'Corona Noruega', symbol: 'kr' },
  { code: 'DKK', name: 'Corona Danesa', symbol: 'kr' },
  { code: 'PLN', name: 'Zloty Polaco', symbol: 'zł' },
  { code: 'CZK', name: 'Corona Checa', symbol: 'Kč' },
  { code: 'HUF', name: 'Forint Húngaro', symbol: 'Ft' }
];

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  title = "Moneda de Valuación",
  exchangeRateUpdated = "Tipos de Cambio Actualizados",
  exchangeRateError = "No se pudieron actualizar los tipos de cambio. Se usarán las tasas anteriores.",
  errorTitle = "Error",
  lastUpdateText = "Última actualización",
  exchangeRateNote = "Los tipos de cambio se obtienen de ExchangeRate-API y se actualizan en tiempo real.",
  exchangeRateLabel = "Tipo de cambio"
}) => {
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  

  const updateExchangeRates = async () => {
    setLoading(true);
    try {
      // Usando ExchangeRate-API (gratuita, sin registro requerido)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error(`Error al obtener tipos de cambio: ${response.status}`);
      }

      const data = await response.json();
      
      // Actualizar las tasas de cambio en las monedas populares
      const updatedCurrencies = popularCurrencies.map(currency => ({
        ...currency,
        rate: data.rates[currency.code] || 1
      }));

      // Si la moneda seleccionada no es USD, actualizar su tasa
      if (selectedCurrency.code !== 'USD') {
        const updatedSelectedCurrency = {
          ...selectedCurrency,
          rate: data.rates[selectedCurrency.code] || selectedCurrency.rate
        };
        onCurrencyChange(updatedSelectedCurrency);
      }

      setLastUpdate(new Date());
      // Tipos de cambio actualizados silenciosamente
      console.log(`${exchangeRateUpdated}: ${new Date().toLocaleTimeString()}`);

    } catch (error) {
      // Error actualizando tipos de cambio
      console.error(errorTitle, exchangeRateError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Actualizar tipos de cambio al montar el componente
    if (!lastUpdate) {
      updateExchangeRates();
    }
  }, []);

  const handleCurrencySelect = async (currencyCode: string) => {
    const currency = popularCurrencies.find(c => c.code === currencyCode);
    if (currency) {
      // Obtener la tasa de cambio actual
      let currentRate = 1;
      if (currency.code !== 'USD') {
        try {
          const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
          if (response.ok) {
            const data = await response.json();
            currentRate = data.rates[currency.code] || 1;
          }
        } catch (error) {
          console.error('Error obteniendo tasa de cambio:', error);
          // Usar tasa por defecto si hay error
          currentRate = currency.code === 'EUR' ? 0.85 : 
                       currency.code === 'MXN' ? 18 : 
                       currency.code === 'GBP' ? 0.75 : 1;
        }
      }
      
      onCurrencyChange({
        ...currency,
        rate: currentRate
      });
    }
  };

  const formatCurrency = (amount: number, currency: Currency): string => {
    try {
      if (currency.code === 'JPY' || currency.code === 'KRW' || currency.code === 'VND' || currency.code === 'IDR') {
        // Monedas sin decimales
        return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
      } else if (currency.code === 'BHD' || currency.code === 'KWD' || currency.code === 'OMR') {
        // Monedas con 3 decimales
        return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
      } else {
        // Monedas con 2 decimales (mayoría)
        return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    } catch (error) {
      return `${currency.symbol}${amount.toLocaleString()}`;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="text-sm sm:text-base">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex gap-2">
          <Select value={selectedCurrency.code} onValueChange={handleCurrencySelect}>
            <SelectTrigger className="flex-1 text-xs sm:text-sm">
              <SelectValue>
                <span className="truncate">{selectedCurrency.symbol} {selectedCurrency.name} ({selectedCurrency.code})</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60 z-50">
              {popularCurrencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                    <span className="font-mono text-xs sm:text-sm">{currency.symbol}</span>
                    <span className="truncate">{currency.name}</span>
                    <span className="text-muted-foreground text-xs">({currency.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>


      </CardContent>
    </Card>
  );
};

export default CurrencySelector;

// Helper function to format currency
export const formatCurrency = (amount: number, currency: Currency): string => {
  try {
    if (currency.code === 'JPY' || currency.code === 'KRW' || currency.code === 'VND' || currency.code === 'IDR') {
      return `${currency.symbol}${Math.round(amount).toLocaleString()}`;
    } else if (currency.code === 'BHD' || currency.code === 'KWD' || currency.code === 'OMR') {
      return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
    } else {
      return `${currency.symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  } catch (error) {
    return `${currency.symbol}${amount.toLocaleString()}`;
  }
};