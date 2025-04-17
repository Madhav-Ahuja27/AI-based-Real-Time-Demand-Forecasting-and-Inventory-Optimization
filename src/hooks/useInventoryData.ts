
import { useQuery } from "@tanstack/react-query";
import { 
  fetchProducts, 
  fetchLocations, 
  fetchAlerts,
  fetchDashboardSummary,
  fetchWeatherData,
  fetchSalesHistory,
  fetchForecasts,
  fetchProductById,
  fetchProductSalesHistory,
  fetchProductForecast,
  getRecommendedReorderAmount,
  placeOrder
} from "@/lib/mock-api";
import { Product, Location, Alert } from "@/lib/mock-data";

// Product hooks
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
}

export function useProductById(productId: string | null) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => productId ? fetchProductById(productId) : Promise.resolve(undefined),
    enabled: !!productId,
  });
}

// Location hooks
export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });
}

// Alert hooks
export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
  });
}

// Dashboard hooks
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
  });
}

// Weather hooks
export function useWeatherData() {
  return useQuery({
    queryKey: ['weather-data'],
    queryFn: fetchWeatherData,
  });
}

// Sales hooks
export function useSalesHistory(days = 90) {
  return useQuery({
    queryKey: ['sales-history', days],
    queryFn: () => fetchSalesHistory(days),
  });
}

export function useProductSalesHistory(productId: string | null, days = 90) {
  return useQuery({
    queryKey: ['product-sales-history', productId, days],
    queryFn: () => productId ? fetchProductSalesHistory(productId, days) : Promise.resolve([]),
    enabled: !!productId,
  });
}

// Forecast hooks
export function useForecasts(days = 30) {
  return useQuery({
    queryKey: ['forecasts', days],
    queryFn: () => fetchForecasts(days),
  });
}

export function useProductForecast(productId: string | null) {
  return useQuery({
    queryKey: ['product-forecast', productId],
    queryFn: () => productId ? fetchProductForecast(productId) : Promise.resolve([]),
    enabled: !!productId,
  });
}

// Reorder recommendation hooks
export function useReorderRecommendation(productId: string | null) {
  return useQuery({
    queryKey: ['reorder-recommendation', productId],
    queryFn: () => productId ? getRecommendedReorderAmount(productId) : Promise.resolve(null),
    enabled: !!productId,
  });
}

// Order placement hook
export function usePlaceOrder() {
  return (
    productId: string,
    orderQuantity: number,
    deliveryDate: string,
    supplier: string,
    notes: string
  ) => placeOrder(productId, orderQuantity, deliveryDate, supplier, notes);
}
