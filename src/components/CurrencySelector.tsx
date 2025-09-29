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
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' }
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
        <CardTitle className="text-base sm:text-lg">
          <span className="text-sm sm:text-base">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 p-2 bg-muted rounded-md text-center">
            <span className="text-sm font-medium">{selectedCurrency.symbol} {selectedCurrency.name} ({selectedCurrency.code})</span>
          </div>
        </div>
        
        {/* Mostrar nombre de la moneda seleccionada */}
        <div className="text-center mt-3">
          <p className="text-sm font-semibold text-foreground">
            {selectedCurrency.name}
          </p>
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