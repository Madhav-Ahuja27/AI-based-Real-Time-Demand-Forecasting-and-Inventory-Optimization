
/**
 * Utility functions to parse and process forecast data
 */

// Define the structure for our parsed data
export interface DetailedForecastData {
  date: string;
  productId: string;
  productName: string;
  stockLevel: number;
  weatherImpact: number;
  socialImpact: number;
  predictedStock: number;
  price: number;
  revenue: number;
  dayNumber: number;
}

/**
 * Parse raw CSV-like forecast data into structured objects
 */
export function parseForecastData(rawData: string): DetailedForecastData[] {
  // Split the data by lines
  const lines = rawData.trim().split('\n');
  
  // Parse each line
  const parsedData: DetailedForecastData[] = lines.map(line => {
    const values = line.split(',');
    
    return {
      date: values[0],
      productId: values[1],
      productName: values[2],
      stockLevel: Number(values[3]),
      weatherImpact: Number(values[4]),
      socialImpact: Number(values[5]),
      predictedStock: Number(values[6]),
      price: Number(values[7]),
      revenue: Number(values[8]),
      dayNumber: Number(values[9])
    };
  });
  
  return parsedData;
}

/**
 * Group forecast data by product
 */
export function groupDataByProduct(data: DetailedForecastData[]): Record<string, DetailedForecastData[]> {
  const groupedData: Record<string, DetailedForecastData[]> = {};
  
  data.forEach(item => {
    if (!groupedData[item.productId]) {
      groupedData[item.productId] = [];
    }
    groupedData[item.productId].push(item);
  });
  
  return groupedData;
}

/**
 * Group forecast data by date
 */
export function groupDataByDate(data: DetailedForecastData[]): Record<string, DetailedForecastData[]> {
  const groupedData: Record<string, DetailedForecastData[]> = {};
  
  data.forEach(item => {
    if (!groupedData[item.date]) {
      groupedData[item.date] = [];
    }
    groupedData[item.date].push(item);
  });
  
  return groupedData;
}

/**
 * Get unique product names from the data
 */
export function getUniqueProducts(data: DetailedForecastData[]): string[] {
  const uniqueProducts = new Set<string>();
  
  data.forEach(item => {
    uniqueProducts.add(item.productName);
  });
  
  return Array.from(uniqueProducts);
}

/**
 * Get aggregated data for all products on each date
 */
export function getAggregatedDailyData(data: DetailedForecastData[]): Array<{
  date: string;
  totalStock: number;
  totalRevenue: number;
  averagePredictedStock: number;
  weatherImpactAvg: number;
  socialImpactAvg: number;
}> {
  const groupedByDate = groupDataByDate(data);
  
  return Object.entries(groupedByDate).map(([date, items]) => {
    const totalStock = items.reduce((sum, item) => sum + item.stockLevel, 0);
    const totalRevenue = items.reduce((sum, item) => sum + item.revenue, 0);
    const averagePredictedStock = items.reduce((sum, item) => sum + item.predictedStock, 0) / items.length;
    const weatherImpactAvg = items.reduce((sum, item) => sum + item.weatherImpact, 0) / items.length;
    const socialImpactAvg = items.reduce((sum, item) => sum + item.socialImpact, 0) / items.length;
    
    return {
      date,
      totalStock,
      totalRevenue,
      averagePredictedStock,
      weatherImpactAvg,
      socialImpactAvg
    };
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
