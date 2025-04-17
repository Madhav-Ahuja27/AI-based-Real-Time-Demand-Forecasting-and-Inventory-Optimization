
import { 
  generateProducts, 
  generateSalesHistory, 
  generateForecasts, 
  generateWeatherData, 
  generateSocialSentiment,
  generateLocations,
  generateAlerts,
  Product,
  SalesData,
  Forecast,
  WeatherData,
  SocialSentiment,
  Location,
  Alert
} from './mock-data';

// Cache for mock data
let mockProducts: Product[] | null = null;
let mockSalesHistory: SalesData[] | null = null;
let mockForecasts: Forecast[] | null = null;
let mockWeatherData: WeatherData[] | null = null;
let mockSocialSentiment: SocialSentiment[] | null = null;
let mockLocations: Location[] | null = null;
let mockAlerts: Alert[] | null = null;

// Helper for simulating API delays
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Initialize mock data
export function initializeMockData() {
  mockProducts = generateProducts(30);
  mockSalesHistory = generateSalesHistory(mockProducts);
  mockForecasts = generateForecasts(mockProducts);
  mockWeatherData = generateWeatherData();
  mockSocialSentiment = generateSocialSentiment(mockProducts);
  mockLocations = generateLocations();
  mockAlerts = generateAlerts(mockProducts);
}

// API functions
export async function fetchProducts(): Promise<Product[]> {
  if (!mockProducts) initializeMockData();
  await delay(300); // Simulate network delay
  return mockProducts || [];
}

export async function fetchSalesHistory(days = 90): Promise<SalesData[]> {
  if (!mockProducts) initializeMockData();
  if (!mockSalesHistory) mockSalesHistory = generateSalesHistory(mockProducts || [], days);
  await delay(500);
  return mockSalesHistory || [];
}

export async function fetchForecasts(days = 30): Promise<Forecast[]> {
  if (!mockProducts) initializeMockData();
  if (!mockForecasts) mockForecasts = generateForecasts(mockProducts || [], days);
  await delay(700);
  return mockForecasts || [];
}

export async function fetchWeatherData(): Promise<WeatherData[]> {
  if (!mockWeatherData) {
    if (!mockProducts) initializeMockData();
    mockWeatherData = generateWeatherData();
  }
  await delay(400);
  return mockWeatherData || [];
}

export async function fetchSocialSentiment(): Promise<SocialSentiment[]> {
  if (!mockSocialSentiment) {
    if (!mockProducts) initializeMockData();
    mockSocialSentiment = generateSocialSentiment(mockProducts || []);
  }
  await delay(600);
  return mockSocialSentiment || [];
}

export async function fetchLocations(): Promise<Location[]> {
  if (!mockLocations) {
    if (!mockProducts) initializeMockData();
    mockLocations = generateLocations();
  }
  await delay(200);
  return mockLocations || [];
}

export async function fetchAlerts(): Promise<Alert[]> {
  if (!mockAlerts) {
    if (!mockProducts) initializeMockData();
    mockAlerts = generateAlerts(mockProducts || []);
  }
  await delay(300);
  return mockAlerts || [];
}

export async function fetchProductById(productId: string): Promise<Product | undefined> {
  if (!mockProducts) initializeMockData();
  await delay(200);
  return mockProducts?.find(p => p.id === productId);
}

export async function fetchProductSalesHistory(productId: string, days = 90): Promise<SalesData[]> {
  if (!mockSalesHistory) {
    if (!mockProducts) initializeMockData();
    mockSalesHistory = generateSalesHistory(mockProducts || [], days);
  }
  await delay(400);
  return mockSalesHistory?.filter(s => s.productId === productId) || [];
}

export async function fetchProductForecast(productId: string): Promise<Forecast[]> {
  if (!mockForecasts) {
    if (!mockProducts) initializeMockData();
    mockForecasts = generateForecasts(mockProducts || []);
  }
  await delay(500);
  return mockForecasts?.filter(f => f.productId === productId) || [];
}

export async function markAlertAsRead(alertId: string): Promise<boolean> {
  if (!mockAlerts) {
    if (!mockProducts) initializeMockData();
    mockAlerts = generateAlerts(mockProducts || []);
  }
  await delay(200);
  
  const alert = mockAlerts?.find(a => a.id === alertId);
  if (alert) {
    alert.read = true;
    return true;
  }
  return false;
}

// New function: Update product stock after placing an order
export async function placeOrder(productId: string, orderQuantity: number, deliveryDate: string, supplier: string, notes: string): Promise<boolean> {
  if (!mockProducts) initializeMockData();
  await delay(500);
  
  const product = mockProducts?.find(p => p.id === productId);
  if (!product) return false;
  
  // Log the order for debugging
  console.log("Placing order:", {
    productId,
    productName: product.name,
    quantity: orderQuantity,
    supplier,
    deliveryDate,
    notes
  });
  
  // In a real system, this would create a new order record
  // For our mock implementation, we'll just update the stock level
  // assuming the order will arrive and be added to inventory
  product.stockLevel += orderQuantity;
  
  // Also create a new alert about the order
  if (mockAlerts) {
    const newAlert: Alert = {
      id: `order-${Date.now()}`,
      type: 'order',
      severity: 'info',
      title: `Order placed: ${product.name}`,
      message: `${orderQuantity} units ordered from ${supplier}. Expected delivery: ${deliveryDate}`,
      createdAt: new Date().toISOString(),
      read: false,
      productId: productId
    };
    mockAlerts.unshift(newAlert);
  }
  
  return true;
}

// Function to get recommended reorder amount
export async function getRecommendedReorderAmount(productId: string): Promise<{
  productId: string;
  recommendedQuantity: number;
  reasoning: {
    currentStock: number;
    avgDailyDemand: number;
    leadTime: number;
    safetyStock: number;
    weatherImpact: number;
    socialImpact: number;
  };
}> {
  if (!mockProducts || !mockForecasts || !mockSalesHistory) initializeMockData();
  
  await delay(800);
  
  const product = mockProducts?.find(p => p.id === productId);
  if (!product) throw new Error(`Product ${productId} not found`);
  
  const forecasts = mockForecasts?.filter(f => f.productId === productId) || [];
  const avgDailyDemand = forecasts.reduce((sum, f) => sum + f.predictedDemand, 0) / Math.max(1, forecasts.length);
  
  const leadTimeDemand = avgDailyDemand * product.leadTime;
  const safetyStock = avgDailyDemand * 5; // Example safety stock calculation
  
  // Calculate weather and social impacts
  const weatherImpact = forecasts.reduce((sum, f) => sum + (f.factors.weather || 0), 0) / Math.max(1, forecasts.length);
  const socialImpact = forecasts.reduce((sum, f) => sum + (f.factors.social || 0), 0) / Math.max(1, forecasts.length);
  
  const recommendedQuantity = Math.max(
    0,
    Math.round(leadTimeDemand + safetyStock - product.stockLevel + (weatherImpact * 10) + (socialImpact * 15))
  );
  
  return {
    productId,
    recommendedQuantity,
    reasoning: {
      currentStock: product.stockLevel,
      avgDailyDemand,
      leadTime: product.leadTime,
      safetyStock,
      weatherImpact,
      socialImpact
    }
  };
}

// Generate dashboard summary data
export async function fetchDashboardSummary(): Promise<{
  totalProducts: number;
  lowStockCount: number;
  overstockCount: number;
  totalValue: number;
  alertsCount: number;
  topSellingProducts: Array<{id: string; name: string; sales: number}>;
  recentAlerts: Alert[];
}> {
  if (!mockProducts || !mockAlerts || !mockSalesHistory) initializeMockData();
  
  await delay(600);
  
  const products = mockProducts || [];
  const alerts = mockAlerts || [];
  const salesHistory = mockSalesHistory || [];
  
  // Calculate top selling products
  const productSales: Record<string, number> = {};
  salesHistory.forEach(sale => {
    if (!productSales[sale.productId]) {
      productSales[sale.productId] = 0;
    }
    productSales[sale.productId] += sale.quantity;
  });
  
  const topSellingProducts = Object.entries(productSales)
    .map(([id, sales]) => ({
      id,
      name: products.find(p => p.id === id)?.name || 'Unknown Product',
      sales
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);
  
  return {
    totalProducts: products.length,
    lowStockCount: products.filter(p => p.stockLevel < p.reorderPoint).length,
    overstockCount: products.filter(p => p.stockLevel > p.maxStockLevel).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stockLevel), 0),
    alertsCount: alerts.filter(a => !a.read).length,
    topSellingProducts,
    recentAlerts: alerts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5)
  };
}
