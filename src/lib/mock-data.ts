
import { subDays, format, addDays } from "date-fns";

// Types
export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  price: number;
  stockLevel: number;
  reorderPoint: number;
  minStockLevel: number;
  maxStockLevel: number;
  leadTime: number; // in days
  supplier: string;
  salesVelocity: number; // units per day
  lastReordered?: string;
  locationId: string;
}

export interface SalesData {
  date: string;
  productId: string;
  quantity: number;
  revenue: number;
}

export interface Forecast {
  date: string;
  productId: string;
  predictedDemand: number;
  confidenceScore: number;
  factors: {
    seasonal: number;
    trend: number;
    weather?: number;
    social?: number;
  };
}

export interface WeatherData {
  date: string;
  locationId: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  temperature: number;
  precipitation: number;
  impact: number; // impact score on sales -1 to 1
}

export interface SocialSentiment {
  date: string;
  productId: string;
  sentiment: number; // -1 to 1
  volume: number; // number of mentions
  trending: boolean;
  sources: {
    twitter: number;
    instagram: number;
    facebook: number;
    tiktok: number;
  };
}

export interface Location {
  id: string;
  name: string;
  type: 'store' | 'warehouse';
  address: string;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'overstock' | 'trending_product' | 'weather_alert' | 'reorder';
  productId: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  read: boolean;
}

// Generate dates array
export function getDatesArray(days: number): string[] {
  return Array.from({ length: days }).map((_, i) => {
    return format(subDays(new Date(), days - i - 1), 'yyyy-MM-dd');
  });
}

export function getFutureDatesArray(days: number): string[] {
  return Array.from({ length: days }).map((_, i) => {
    return format(addDays(new Date(), i), 'yyyy-MM-dd');
  });
}

// Mock data generators
export function generateProducts(count = 20): Product[] {
  const categories = ['Electronics', 'Clothing', 'Food', 'Home Goods', 'Sports'];
  const suppliers = ['Acme Inc', 'Global Supply Co', 'Quality Products Ltd', 'Prime Distributors', 'Mega Wholesale'];
  const locations = ['store-001', 'store-002', 'warehouse-main'];
  
  return Array.from({ length: count }).map((_, i) => {
    const id = `prod-${i.toString().padStart(4, '0')}`;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const stockLevel = Math.floor(Math.random() * 100);
    const price = parseFloat((10 + Math.random() * 90).toFixed(2));
    
    return {
      id,
      name: `${category} Item ${i + 1}`,
      category,
      sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      price,
      stockLevel,
      reorderPoint: Math.floor(Math.random() * 25),
      minStockLevel: Math.floor(Math.random() * 10),
      maxStockLevel: 100 + Math.floor(Math.random() * 50),
      leadTime: 3 + Math.floor(Math.random() * 14),
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      salesVelocity: parseFloat((Math.random() * 5).toFixed(2)),
      lastReordered: Math.random() > 0.7 ? format(subDays(new Date(), Math.floor(Math.random() * 30)), 'yyyy-MM-dd') : undefined,
      locationId: locations[Math.floor(Math.random() * locations.length)]
    };
  });
}

export function generateSalesHistory(products: Product[], days = 90): SalesData[] {
  const dates = getDatesArray(days);
  const salesData: SalesData[] = [];
  
  products.forEach(product => {
    dates.forEach(date => {
      // Base sales with some randomness
      let quantity = Math.max(0, Math.round(product.salesVelocity * (1 + (Math.random() - 0.5))));
      
      // Add seasonality (more sales on weekends)
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        quantity = Math.round(quantity * 1.5);
      }
      
      // Add some trend
      const dayIndex = dates.indexOf(date);
      const trendFactor = 1 + (dayIndex / dates.length) * 0.2;
      quantity = Math.round(quantity * trendFactor);
      
      salesData.push({
        date,
        productId: product.id,
        quantity,
        revenue: quantity * product.price
      });
    });
  });
  
  return salesData;
}

export function generateForecasts(products: Product[], days = 30): Forecast[] {
  const futureDates = getFutureDatesArray(days);
  const forecasts: Forecast[] = [];
  
  products.forEach(product => {
    futureDates.forEach((date, index) => {
      // Base forecast
      let predictedDemand = product.salesVelocity;
      
      // Add trend
      const trendFactor = 1 + (index / futureDates.length) * 0.3;
      predictedDemand *= trendFactor;
      
      // Add seasonality
      const dayOfWeek = new Date(date).getDay();
      const seasonal = dayOfWeek === 0 || dayOfWeek === 6 ? 1.5 : 1.0;
      predictedDemand *= seasonal;
      
      // Add some randomness for confidence score
      const confidenceScore = 0.7 + Math.random() * 0.3;
      
      forecasts.push({
        date,
        productId: product.id,
        predictedDemand: parseFloat(predictedDemand.toFixed(2)),
        confidenceScore: parseFloat(confidenceScore.toFixed(2)),
        factors: {
          seasonal,
          trend: trendFactor,
          weather: Math.random() > 0.7 ? parseFloat((Math.random() * 0.4).toFixed(2)) : undefined,
          social: Math.random() > 0.7 ? parseFloat((Math.random() * 0.3).toFixed(2)) : undefined
        }
      });
    });
  });
  
  return forecasts;
}

export function generateWeatherData(days = 7): WeatherData[] {
  const futureDates = getFutureDatesArray(days);
  const locations = ['store-001', 'store-002', 'warehouse-main'];
  const conditions: Array<'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy'> = ['sunny', 'cloudy', 'rainy', 'stormy', 'snowy'];
  const weatherData: WeatherData[] = [];
  
  locations.forEach(locationId => {
    futureDates.forEach(date => {
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      let temperature = 15 + Math.floor(Math.random() * 20); // 15-35 degrees
      let precipitation = 0;
      let impact = 0;
      
      // Adjust based on condition
      switch (condition) {
        case 'sunny':
          impact = 0.2;
          precipitation = 0;
          break;
        case 'cloudy':
          impact = 0;
          precipitation = Math.random() * 0.5;
          break;
        case 'rainy':
          impact = -0.2;
          precipitation = 2 + Math.random() * 8;
          temperature -= 5;
          break;
        case 'stormy':
          impact = -0.5;
          precipitation = 10 + Math.random() * 20;
          temperature -= 8;
          break;
        case 'snowy':
          impact = -0.4;
          precipitation = 5 + Math.random() * 15;
          temperature = -5 + Math.random() * 10;
          break;
      }
      
      weatherData.push({
        date,
        locationId,
        condition,
        temperature,
        precipitation,
        impact
      });
    });
  });
  
  return weatherData;
}

export function generateSocialSentiment(products: Product[], days = 30): SocialSentiment[] {
  const dates = getDatesArray(days);
  const sentimentData: SocialSentiment[] = [];
  
  products.forEach(product => {
    // Generate a baseline sentiment and volume for each product
    let baseSentiment = -0.5 + Math.random();
    let baseVolume = 10 + Math.floor(Math.random() * 990);
    let trending = Math.random() > 0.8;
    
    dates.forEach((date, index) => {
      // Gradually change sentiment and volume over time
      baseSentiment = Math.max(-1, Math.min(1, baseSentiment + (Math.random() - 0.5) * 0.1));
      
      // If trending, increase volume
      if (trending && index > dates.length - 10) {
        baseVolume *= 1.1;
      }
      
      // Add some day-to-day variance
      const sentiment = parseFloat((baseSentiment + (Math.random() - 0.5) * 0.2).toFixed(2));
      const volume = Math.floor(baseVolume * (0.9 + Math.random() * 0.2));
      
      // Distribution across platforms
      const twitterShare = 0.3 + Math.random() * 0.2;
      const instagramShare = 0.2 + Math.random() * 0.2;
      const facebookShare = 0.3 + Math.random() * 0.2;
      const tiktokShare = 1 - twitterShare - instagramShare - facebookShare;
      
      sentimentData.push({
        date,
        productId: product.id,
        sentiment: Math.max(-1, Math.min(1, sentiment)),
        volume,
        trending: trending && index > dates.length - 5,
        sources: {
          twitter: Math.floor(volume * twitterShare),
          instagram: Math.floor(volume * instagramShare),
          facebook: Math.floor(volume * facebookShare),
          tiktok: Math.floor(volume * tiktokShare)
        }
      });
    });
  });
  
  return sentimentData;
}

export function generateLocations(): Location[] {
  return [
    {
      id: 'store-001',
      name: 'Downtown Store',
      type: 'store',
      address: '123 Main St, New York, NY 10001'
    },
    {
      id: 'store-002',
      name: 'Westside Location',
      type: 'store',
      address: '456 Park Ave, New York, NY 10002'
    },
    {
      id: 'warehouse-main',
      name: 'Central Distribution Center',
      type: 'warehouse',
      address: '789 Industrial Pkwy, Newark, NJ 07102'
    }
  ];
}

export function generateAlerts(products: Product[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  
  // Create low stock alerts
  products.filter(p => p.stockLevel < p.reorderPoint).forEach((product, idx) => {
    alerts.push({
      id: `alert-low-${idx}`,
      type: 'low_stock',
      productId: product.id,
      message: `${product.name} is below reorder point (${product.stockLevel}/${product.reorderPoint})`,
      severity: product.stockLevel < product.minStockLevel ? 'high' : 'medium',
      createdAt: format(subDays(now, Math.floor(Math.random() * 3)), 'yyyy-MM-dd HH:mm:ss'),
      read: Math.random() > 0.7
    });
  });
  
  // Create overstock alerts
  products.filter(p => p.stockLevel > p.maxStockLevel).forEach((product, idx) => {
    alerts.push({
      id: `alert-high-${idx}`,
      type: 'overstock',
      productId: product.id,
      message: `${product.name} exceeds maximum stock level (${product.stockLevel}/${product.maxStockLevel})`,
      severity: 'low',
      createdAt: format(subDays(now, Math.floor(Math.random() * 5)), 'yyyy-MM-dd HH:mm:ss'),
      read: Math.random() > 0.5
    });
  });
  
  // Create reorder recommendations
  products.filter(p => p.stockLevel < p.reorderPoint * 1.2 && p.stockLevel >= p.reorderPoint).forEach((product, idx) => {
    alerts.push({
      id: `alert-reorder-${idx}`,
      type: 'reorder',
      productId: product.id,
      message: `Consider ordering ${product.name} soon, approaching reorder point`,
      severity: 'low',
      createdAt: format(subDays(now, Math.floor(Math.random() * 2)), 'yyyy-MM-dd HH:mm:ss'),
      read: Math.random() > 0.3
    });
  });
  
  // Add some trending product alerts
  for (let i = 0; i < 3; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    alerts.push({
      id: `alert-trend-${i}`,
      type: 'trending_product',
      productId: randomProduct.id,
      message: `${randomProduct.name} is trending on social media, consider increasing stock`,
      severity: 'medium',
      createdAt: format(subDays(now, Math.floor(Math.random() * 2)), 'yyyy-MM-dd HH:mm:ss'),
      read: Math.random() > 0.6
    });
  }
  
  // Add weather alerts
  alerts.push({
    id: `alert-weather-1`,
    type: 'weather_alert',
    productId: products[Math.floor(Math.random() * products.length)].id,
    message: `Storm forecast for next week may affect delivery schedules`,
    severity: 'medium',
    createdAt: format(subDays(now, 1), 'yyyy-MM-dd HH:mm:ss'),
    read: false
  });
  
  return alerts;
}
