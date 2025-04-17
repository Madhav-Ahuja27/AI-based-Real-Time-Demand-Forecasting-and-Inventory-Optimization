
import { useState, useEffect, useMemo } from 'react';
import { DetailedForecastData, parseForecastData, groupDataByProduct, getUniqueProducts } from '@/lib/data-parser';

interface UseDetailedForecastProps {
  rawData: string;
  selectedProduct?: string | null;
}

export function useDetailedForecast({ rawData, selectedProduct }: UseDetailedForecastProps) {
  const [loading, setLoading] = useState(true);
  const [parsedData, setParsedData] = useState<DetailedForecastData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      const data = parseForecastData(rawData);
      setParsedData(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error parsing forecast data');
      console.error('Error parsing forecast data:', e);
    } finally {
      setLoading(false);
    }
  }, [rawData]);

  const filteredData = useMemo(() => {
    if (!selectedProduct) return parsedData;
    return parsedData.filter(item => item.productName === selectedProduct);
  }, [parsedData, selectedProduct]);

  const uniqueProducts = useMemo(() => {
    return getUniqueProducts(parsedData);
  }, [parsedData]);

  const productGroups = useMemo(() => {
    return groupDataByProduct(parsedData);
  }, [parsedData]);

  return {
    data: filteredData,
    allData: parsedData,
    uniqueProducts,
    productGroups,
    loading,
    error
  };
}
