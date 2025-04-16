
import { useEffect, useState } from "react";
import { fetchProducts, fetchProductForecast, fetchSalesHistory } from "@/lib/mock-api";
import { LineChart } from "@/components/charts/LineChart";
import { Product, Forecast, SalesData } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, subDays } from "date-fns";

export default function DemandForecasting() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [forecastData, setForecastData] = useState<Forecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"30" | "60" | "90">("30");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
        
        if (productsData.length > 0) {
          setSelectedProduct(productsData[0].id);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const loadProductData = async () => {
        setIsLoading(true);
        try {
          const [productSalesData, productForecastData] = await Promise.all([
            fetchSalesHistory(parseInt(timeRange)),
            fetchProductForecast(selectedProduct)
          ]);
          
          // Filter sales data for selected product
          const filteredSalesData = productSalesData.filter(
            (sale) => sale.productId === selectedProduct
          );
          
          setSalesData(filteredSalesData);
          setForecastData(productForecastData);
        } catch (error) {
          console.error("Error loading product data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadProductData();
    }
  }, [selectedProduct, timeRange]);

  // Prepare data for the charts
  const salesChartData = salesData.map((sale) => ({
    date: sale.date,
    quantity: sale.quantity,
    revenue: sale.revenue
  }));

  const forecastChartData = forecastData.map((forecast) => ({
    date: forecast.date,
    predictedDemand: forecast.predictedDemand,
    confidenceHigh: forecast.predictedDemand * (1 + (1 - forecast.confidenceScore) / 2),
    confidenceLow: forecast.predictedDemand * (1 - (1 - forecast.confidenceScore) / 2),
    seasonal: forecast.factors.seasonal,
    trend: forecast.factors.trend
  }));

  // Combine past sales with future forecasts for a continuous chart
  const combinedChartData = [
    ...salesChartData.slice(-14).map(sale => ({
      date: sale.date,
      actual: sale.quantity,
      predicted: null as null | number
    })),
    ...forecastChartData.slice(0, 14).map(forecast => ({
      date: forecast.date,
      actual: null as null | number,
      predicted: forecast.predictedDemand
    }))
  ];

  const selectedProductDetails = products.find(p => p.id === selectedProduct);

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Demand Forecasting</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Product Selection</CardTitle>
              <CardDescription>Select a product to view its demand forecast</CardDescription>
            </div>
            <Select
              value={selectedProduct || ""}
              onValueChange={(value) => setSelectedProduct(value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full md:w-[280px]">
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        {selectedProductDetails && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div>
                <span className="text-sm text-muted-foreground">Category</span>
                <p className="font-medium">{selectedProductDetails.category}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Current Stock</span>
                <p className="font-medium">{selectedProductDetails.stockLevel} units</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Sales Velocity</span>
                <p className="font-medium">{selectedProductDetails.salesVelocity} units/day</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
      
      <Tabs defaultValue="forecast" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="factors">Impact Factors</TabsTrigger>
          </TabsList>
          
          <Select value={timeRange} onValueChange={(value: "30" | "60" | "90") => setTimeRange(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <TabsContent value="forecast" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecast</CardTitle>
              <CardDescription>Combined view of historical and forecasted demand</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <span className="text-muted-foreground">Loading forecast data...</span>
                </div>
              ) : (
                <LineChart
                  data={combinedChartData}
                  xAxisKey="date"
                  height={350}
                  lines={[
                    { key: "actual", name: "Actual Demand", color: "#3b82f6" },
                    { key: "predicted", name: "Predicted Demand", color: "#f59e0b" }
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historical" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Historical Sales Data</CardTitle>
              <CardDescription>Past sales quantity and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <span className="text-muted-foreground">Loading sales data...</span>
                </div>
              ) : (
                <LineChart
                  data={salesChartData}
                  xAxisKey="date"
                  height={350}
                  lines={[
                    { key: "quantity", name: "Units Sold", color: "#3b82f6" },
                    { key: "revenue", name: "Revenue ($)", color: "#10b981", strokeWidth: 3 }
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="factors" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Impact Factors</CardTitle>
              <CardDescription>Factors affecting demand prediction</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <span className="text-muted-foreground">Loading factors data...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LineChart
                    title="Seasonal & Trend Factors"
                    data={forecastChartData}
                    xAxisKey="date"
                    lines={[
                      { key: "seasonal", name: "Seasonality", color: "#8b5cf6" },
                      { key: "trend", name: "Trend", color: "#ec4899" }
                    ]}
                  />
                  <LineChart
                    title="Forecast with Confidence Range"
                    data={forecastChartData}
                    xAxisKey="date"
                    lines={[
                      { key: "predictedDemand", name: "Predicted", color: "#f59e0b" },
                      { key: "confidenceHigh", name: "Confidence High", color: "#d1d5db", dashed: true },
                      { key: "confidenceLow", name: "Confidence Low", color: "#d1d5db", dashed: true }
                    ]}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium mb-1">Demand Trend</h3>
              <p className="text-sm text-muted-foreground">
                Based on historical data and current factors, demand is expected to 
                {forecastChartData.length > 0 && forecastChartData[0].trend > 1 
                  ? " increase by approximately " + ((forecastChartData[0].trend - 1) * 100).toFixed(1) + "% "
                  : " remain stable "} 
                over the next 30 days.
              </p>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium mb-1">Seasonal Patterns</h3>
              <p className="text-sm text-muted-foreground">
                {selectedProductDetails?.name || "This product"} shows 
                {forecastChartData.some(d => d.seasonal > 1.2) 
                  ? " strong seasonal variations with peak demand during weekends and holidays." 
                  : " minimal seasonal variations throughout the year."}
              </p>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="font-medium mb-1">External Factors</h3>
              <p className="text-sm text-muted-foreground">
                Weather conditions and social media sentiment are expected to have 
                {forecastChartData.some(d => d.factors.weather || d.factors.social)
                  ? " a noticeable impact on upcoming demand. Monitor these factors closely."
                  : " minimal impact on upcoming demand based on current forecasts."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
