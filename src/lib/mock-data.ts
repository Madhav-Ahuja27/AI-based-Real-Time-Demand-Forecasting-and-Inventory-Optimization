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
  const amazonLikeProducts: Product[] = [
    {
      id: "prod-0001",
      name: "Apple iPhone 15 Pro Max (256GB, Natural Titanium)",
      category: "Smartphones",
      sku: "APL-IP15PM-256-NT",
      price: 1199.99,
      stockLevel: 18,
      reorderPoint: 15,
      minStockLevel: 10,
      maxStockLevel: 50,
      leadTime: 5,
      supplier: "Apple Inc.",
      salesVelocity: 3.5,
      locationId: "store-001"
    },
    {
      id: "prod-0002",
      name: "Samsung Galaxy S24 Ultra (12GB RAM, 512GB)",
      category: "Smartphones",
      sku: "SAM-S24U-512",
      price: 1299.99,
      stockLevel: 8,
      reorderPoint: 10,
      minStockLevel: 5,
      maxStockLevel: 30,
      leadTime: 7,
      supplier: "Samsung Electronics",
      salesVelocity: 2.8,
      locationId: "warehouse-main"
    },
    {
      id: "prod-0003",
      name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
      category: "Audio",
      sku: "SON-WH1000XM5-BLK",
      price: 349.99,
      stockLevel: 0,
      reorderPoint: 15,
      minStockLevel: 10,
      maxStockLevel: 40,
      leadTime: 10,
      supplier: "Sony Corporation",
      salesVelocity: 1.7,
      lastReordered: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
      locationId: "store-002"
    },
    {
      id: "prod-0004",
      name: "Apple MacBook Pro 16\" M3 Pro (36GB RAM, 1TB SSD)",
      category: "Laptops",
      sku: "APL-MBP16-M3P-1TB",
      price: 2899.99,
      stockLevel: 5,
      reorderPoint: 8,
      minStockLevel: 3,
      maxStockLevel: 15,
      leadTime: 12,
      supplier: "Apple Inc.",
      salesVelocity: 0.8,
      locationId: "store-001"
    },
    {
      id: "prod-0005",
      name: "LG C3 65\" OLED 4K Smart TV",
      category: "TVs",
      sku: "LG-OLED65C3-4K",
      price: 1799.99,
      stockLevel: 3,
      reorderPoint: 5,
      minStockLevel: 2,
      maxStockLevel: 12,
      leadTime: 14,
      supplier: "LG Electronics",
      salesVelocity: 0.6,
      locationId: "warehouse-main"
    },
    {
      id: "prod-0006",
      name: "Dyson V15 Detect Absolute Cordless Vacuum",
      category: "Home Appliances",
      sku: "DYS-V15-DETECT",
      price: 749.99,
      stockLevel: 12,
      reorderPoint: 10,
      minStockLevel: 5,
      maxStockLevel: 25,
      leadTime: 8,
      supplier: "Dyson Ltd",
      salesVelocity: 1.2,
      locationId: "store-002"
    },
    {
      id: "prod-0007",
      name: "Nintendo Switch OLED Model",
      category: "Gaming",
      sku: "NIN-SWOLED-WHT",
      price: 349.99,
      stockLevel: 22,
      reorderPoint: 15,
      minStockLevel: 10,
      maxStockLevel: 40,
      leadTime: 7,
      supplier: "Nintendo Co., Ltd.",
      salesVelocity: 2.1,
      locationId: "store-001"
    },
    {
      id: "prod-0008",
      name: "Canon EOS R6 Mark II Mirrorless Camera",
      category: "Cameras",
      sku: "CAN-EOSR6M2-BDY",
      price: 2499.99,
      stockLevel: 4,
      reorderPoint: 5,
      minStockLevel: 2,
      maxStockLevel: 10,
      leadTime: 15,
      supplier: "Canon Inc.",
      salesVelocity: 0.5,
      locationId: "store-002"
    },
    {
      id: "prod-0009",
      name: "Bose QuietComfort Ultra Headphones",
      category: "Audio",
      sku: "BOSE-QCU-BLK",
      price: 429.99,
      stockLevel: 7,
      reorderPoint: 10,
      minStockLevel: 5,
      maxStockLevel: 25,
      leadTime: 9,
      supplier: "Bose Corporation",
      salesVelocity: 1.3,
      locationId: "warehouse-main"
    },
    {
      id: "prod-0010",
      name: "NVIDIA GeForce RTX 4090 Graphics Card",
      category: "Computer Components",
      sku: "NV-RTX4090-FE",
      price: 1599.99,
      stockLevel: 2,
      reorderPoint: 5,
      minStockLevel: 2,
      maxStockLevel: 15,
      leadTime: 20,
      supplier: "NVIDIA Corporation",
      salesVelocity: 0.7,
      locationId: "warehouse-main"
    },
    {
      id: "prod-0011",
      name: "Amazon Echo Show 10 (3rd Gen)",
      category: "Smart Home",
      sku: "AMZN-ECHO10-BLK",
      price: 249.99,
      stockLevel: 15,
      reorderPoint: 12,
      minStockLevel: 8,
      maxStockLevel: 30,
      leadTime: 6,
      supplier: "Amazon.com, Inc.",
      salesVelocity: 1.8,
      locationId: "store-001"
    },
    {
      id: "prod-0012",
      name: "Philips Hue White and Color Ambiance Starter Kit",
      category: "Smart Home",
      sku: "PHIL-HUE-SKIT",
      price: 199.99,
      stockLevel: 9,
      reorderPoint: 15,
      minStockLevel: 10,
      maxStockLevel: 35,
      leadTime: 8,
      supplier: "Signify N.V.",
      salesVelocity: 1.5,
      locationId: "store-002"
    },
    {
      id: "prod-0013",
      name: "Samsung Galaxy Tab S9+ (12.4\", 256GB)",
      category: "Tablets",
      sku: "SAM-TABS9P-256",
      price: 999.99,
      stockLevel: 6,
      reorderPoint: 8,
      minStockLevel: 5,
      maxStockLevel: 20,
      leadTime: 10,
      supplier: "Samsung Electronics",
      salesVelocity: 1.1,
      locationId: "warehouse-main"
    },
    {
      id: "prod-0014",
      name: "Sonos Arc Premium Smart Soundbar",
      category: "Audio",
      sku: "SONOS-ARC-BLK",
      price: 899.99,
      stockLevel: 4,
      reorderPoint: 6,
      minStockLevel: 3,
      maxStockLevel: 15,
      leadTime: 12,
      supplier: "Sonos, Inc.",
      salesVelocity: 0.8,
      locationId: "store-001"
    },
    {
      id: "prod-0015",
      name: "Microsoft Xbox Series X Console",
      category: "Gaming",
      sku: "MS-XBOX-SX",
      price: 499.99,
      stockLevel: 0,
      reorderPoint: 10,
      minStockLevel: 5,
      maxStockLevel: 25,
      leadTime: 15,
      supplier: "Microsoft Corporation",
      salesVelocity: 1.9,
      lastReordered: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
      locationId: "warehouse-main"
    },
    {
      id: "prod-0016",
      name: "Apple iPad Pro 12.9\" M2 (512GB, Wi-Fi + Cellular)",
      category: "Tablets",
      sku: "APL-IPP129-M2-512C",
      price: 1599.99,
      stockLevel: 7,
      reorderPoint: 8,
      minStockLevel: 4,
      maxStockLevel: 15,
      leadTime: 9,
      supplier: "Apple Inc.",
      salesVelocity: 0.9,
      locationId: "store-002"
    },
    {
      id: "prod-0017",
      name: "Logitech MX Master 3S Wireless Mouse",
      category: "Computer Accessories",
      sku: "LOG-MXM3S-GRY",
      price: 99.99,
      stockLevel: 25,
      reorderPoint: 15,
      minStockLevel: 10,
      maxStockLevel: 40,
      leadTime: 7,
      supplier: "Logitech International S.A.",
      salesVelocity: 2.2,
      locationId: "store-001"
    },
    {
      id: "prod-0018",
      name: "GoPro HERO12 Black",
      category: "Cameras",
      sku: "GP-HERO12-BLK",
      price: 399.99,
      stockLevel: 11,
      reorderPoint: 12,
      minStockLevel: 8,
      maxStockLevel: 30,
      leadTime: 8,
      supplier: "GoPro, Inc.",
      salesVelocity: 1.4,
      locationId: "warehouse-main"
    },
    {
      id: "prod-0019",
      name: "DJI Mavic 3 Pro Drone",
      category: "Drones",
      sku: "DJI-MAV3-PRO",
      price: 2199.99,
      stockLevel: 3,
      reorderPoint: 5,
      minStockLevel: 2,
      maxStockLevel: 10,
      leadTime: 18,
      supplier: "DJI Technology Co., Ltd.",
      salesVelocity: 0.4,
      locationId: "store-002"
    },
    {
      id: "prod-0020",
      name: "Samsung Odyssey Neo G9 49\" Curved Gaming Monitor",
      category: "Monitors",
      sku: "SAM-ODYG9-49",
      price: 1999.99,
      stockLevel: 2,
      reorderPoint: 3,
      minStockLevel: 1,
      maxStockLevel: 8,
      leadTime: 14,
      supplier: "Samsung Electronics",
      salesVelocity: 0.3,
      locationId: "warehouse-main"
    }
  ];
  
  // Return the predefined list of products
  return amazonLikeProducts;
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
