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
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£' },
  { code: 'JPY', name: 'Yen Japonés', symbol: '¥' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$' },
  { code: 'CHF', name: 'Franco Suizo', symbol: 'CHF' },
  { code: 'CNY', name: 'Yuan Chino', symbol: '¥' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/' },
  { code: 'INR', name: 'Rupia India', symbol: '₹' },
  { code: 'KRW', name: 'Won Surcoreano', symbol: '₩' },
  { code: 'SGD', name: 'Dólar de Singapur', symbol: 'S$' },
  { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$' },
  { code: 'NZD', name: 'Dólar Neozelandés', symbol: 'NZ$' },
  { code: 'SEK', name: 'Corona Sueca', symbol: 'kr' },
  { code: 'NOK', name: 'Corona Noruega', symbol: 'kr' },
  { code: 'DKK', name: 'Corona Danesa', symbol: 'kr' },
  { code: 'PLN', name: 'Zloty Polaco', symbol: 'zł' },
  { code: 'CZK', name: 'Corona Checa', symbol: 'Kč' },
  { code: 'HUF', name: 'Forint Húngaro', symbol: 'Ft' },
  { code: 'RUB', name: 'Rublo Ruso', symbol: '₽' },
  { code: 'TRY', name: 'Lira Turca', symbol: '₺' },
  { code: 'ZAR', name: 'Rand Sudafricano', symbol: 'R' },
  { code: 'EGP', name: 'Libra Egipcia', symbol: 'E£' },
  { code: 'SAR', name: 'Riyal Saudí', symbol: 'SR' },
  { code: 'AED', name: 'Dirham de EAU', symbol: 'د.إ' },
  { code: 'QAR', name: 'Riyal Qatarí', symbol: 'QR' },
  { code: 'KWD', name: 'Dinar Kuwaití', symbol: 'KD' },
  { code: 'BHD', name: 'Dinar de Baréin', symbol: 'BD' },
  { code: 'OMR', name: 'Rial Omaní', symbol: 'OMR' },
  { code: 'ILS', name: 'Shekel Israelí', symbol: '₪' },
  { code: 'THB', name: 'Baht Tailandés', symbol: '฿' },
  { code: 'MYR', name: 'Ringgit Malayo', symbol: 'RM' },
  { code: 'IDR', name: 'Rupia Indonesia', symbol: 'Rp' },
  { code: 'PHP', name: 'Peso Filipino', symbol: '₱' },
  { code: 'VND', name: 'Dong Vietnamita', symbol: '₫' }
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

  const handleCurrencySelect = (currencyCode: string) => {
    const currency = popularCurrencies.find(c => c.code === currencyCode);
    if (currency) {
      onCurrencyChange({
        ...currency,
        rate: currency.code === 'USD' ? 1 : (selectedCurrency.rate || 1)
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedCurrency.code} onValueChange={handleCurrencySelect}>
            <SelectTrigger className="flex-1">
              <SelectValue>
                {selectedCurrency.symbol} {selectedCurrency.name} ({selectedCurrency.code})
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {popularCurrencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{currency.symbol}</span>
                    <span>{currency.name}</span>
                    <span className="text-muted-foreground">({currency.code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={updateExchangeRates}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>

        {selectedCurrency.code !== 'USD' && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span>{exchangeRateLabel} (USD → {selectedCurrency.code}):</span>
              <span className="font-mono font-medium">
                1 USD = {selectedCurrency.rate?.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 6 
                })} {selectedCurrency.code}
              </span>
            </div>
          </div>
        )}

        {lastUpdate && (
          <p className="text-xs text-muted-foreground text-center">
            {lastUpdateText}: {lastUpdate && lastUpdate.toLocaleString()}
          </p>
        )}

        <div className="text-xs text-muted-foreground">
          <p>{exchangeRateNote}</p>
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