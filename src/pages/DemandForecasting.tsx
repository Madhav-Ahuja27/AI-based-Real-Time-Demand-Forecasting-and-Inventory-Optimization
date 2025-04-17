
import { useState } from "react";
import { useProducts, useProductSalesHistory, useProductForecast } from "@/hooks/useInventoryData";
import { LineChart } from "@/components/charts/LineChart";
import { Product } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DemandForecasting() {
  const { data: products = [], isLoading: isProductsLoading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"30" | "60" | "90">("30");
  const [showFullTable, setShowFullTable] = useState(false);
  
  const { data: salesData = [], isLoading: isSalesLoading } = useProductSalesHistory(
    selectedProduct, 
    parseInt(timeRange)
  );
  const { data: forecastData = [], isLoading: isForecastLoading } = useProductForecast(selectedProduct);

  // Select first product by default when products load
  if (!selectedProduct && products.length > 0 && !isProductsLoading) {
    setSelectedProduct(products[0].id);
  }

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

  // Check if there are any forecasts with weather and social factors
  const hasWeatherFactors = forecastData.some(d => d.factors && d.factors.weather !== undefined);
  const hasSocialFactors = forecastData.some(d => d.factors && d.factors.social !== undefined);

  const isLoading = isProductsLoading || isSalesLoading || isForecastLoading;
  
  // Complete forecast data table for all products
  const fullForecastData = [
    { productName: "RAM", predictionDate: "2025-04-16", predictedStock: 35.71, r2Score: 0.8825 },
    { productName: "SSD", predictionDate: "2025-04-16", predictedStock: 40.46, r2Score: 0.8781 },
    { productName: "HDD", predictionDate: "2025-04-16", predictedStock: 55.04, r2Score: 0.8841 },
    { productName: "Power Supply", predictionDate: "2025-04-16", predictedStock: 73.17, r2Score: 0.8749 },
    { productName: "PC Case", predictionDate: "2025-04-16", predictedStock: 64.11, r2Score: 0.8801 },
    { productName: "CPU Cooler", predictionDate: "2025-04-16", predictedStock: 40.12, r2Score: 0.8871 },
    { productName: "Monitor Stand", predictionDate: "2025-04-16", predictedStock: 23.32, r2Score: 0.8817 },
    { productName: "Mouse Pad", predictionDate: "2025-04-16", predictedStock: 52.47, r2Score: 0.8841 },
    { productName: "Thermal Paste", predictionDate: "2025-04-16", predictedStock: 56.18, r2Score: 0.8766 },
    { productName: "Wireless Charger", predictionDate: "2025-04-16", predictedStock: 63.84, r2Score: 0.8825 },
    { productName: "WiFi Adapter", predictionDate: "2025-04-16", predictedStock: 63.95, r2Score: 0.9000 },
    { productName: "External DVD Drive", predictionDate: "2025-04-16", predictedStock: 32.66, r2Score: 0.8830 },
    { productName: "Printer Cable", predictionDate: "2025-04-16", predictedStock: 45.06, r2Score: 0.8857 },
    { productName: "Keyboard Cleaner", predictionDate: "2025-04-16", predictedStock: 64.19, r2Score: 0.8817 },
    { productName: "Laptop Cooling Pad", predictionDate: "2025-04-16", predictedStock: 72.24, r2Score: 0.8833 },
    { productName: "USB Hub", predictionDate: "2025-04-16", predictedStock: 36.29, r2Score: 0.8875 },
    { productName: "Anti-Glare Screen Protector", predictionDate: "2025-04-16", predictedStock: 56.64, r2Score: 0.8676 },
    { productName: "USB-C Adapter", predictionDate: "2025-04-16", predictedStock: 51.63, r2Score: 0.8807 },
    { productName: "Laptop Sleeve", predictionDate: "2025-04-16", predictedStock: 40.57, r2Score: 0.8824 },
    { productName: "Motherboard", predictionDate: "2025-04-16", predictedStock: 45.34, r2Score: 0.8732 },
    { productName: "Cable Management Kit", predictionDate: "2025-04-16", predictedStock: 52.35, r2Score: 0.8867 },
    { productName: "CPU", predictionDate: "2025-04-16", predictedStock: 40.17, r2Score: 0.8926 },
    { productName: "Desk Lamp", predictionDate: "2025-04-16", predictedStock: 56.29, r2Score: 0.8694 },
    { productName: "Gaming Monitor", predictionDate: "2025-04-16", predictedStock: 65.86, r2Score: 0.8894 },
    { productName: "USB-C Cable", predictionDate: "2025-04-16", predictedStock: 29.67, r2Score: 0.8762 },
    { productName: "Laptop", predictionDate: "2025-04-16", predictedStock: 58.58, r2Score: 0.8760 },
    { productName: "Monitor", predictionDate: "2025-04-16", predictedStock: 76.08, r2Score: 0.8835 },
    { productName: "Keyboard", predictionDate: "2025-04-16", predictedStock: 42.51, r2Score: 0.8827 },
    { productName: "Headphones", predictionDate: "2025-04-16", predictedStock: 45.30, r2Score: 0.8744 },
    { productName: "Smartphone", predictionDate: "2025-04-16", predictedStock: 36.09, r2Score: 0.8889 },
    { productName: "Tablet", predictionDate: "2025-04-16", predictedStock: 57.11, r2Score: 0.8866 },
    { productName: "Router", predictionDate: "2025-04-16", predictedStock: 35.33, r2Score: 0.8854 },
    { productName: "External Hard Drive", predictionDate: "2025-04-16", predictedStock: 59.53, r2Score: 0.8790 },
    { productName: "Graphics Card", predictionDate: "2025-04-16", predictedStock: 34.45, r2Score: 0.8821 },
    { productName: "Wireless Earbuds", predictionDate: "2025-04-16", predictedStock: 28.74, r2Score: 0.8839 },
    { productName: "Desk Chair", predictionDate: "2025-04-16", predictedStock: 40.71, r2Score: 0.8809 },
    { productName: "USB Flash Drive", predictionDate: "2025-04-16", predictedStock: 28.60, r2Score: 0.8713 },
    { productName: "Ethernet Cable", predictionDate: "2025-04-16", predictedStock: 33.64, r2Score: 0.8600 },
    { productName: "Power Strip", predictionDate: "2025-04-16", predictedStock: 34.32, r2Score: 0.8776 },
    { productName: "Wireless Mouse", predictionDate: "2025-04-16", predictedStock: 37.14, r2Score: 0.8810 },
    { productName: "Gaming Keyboard", predictionDate: "2025-04-16", predictedStock: 43.34, r2Score: 0.8811 },
    { productName: "Gaming Mouse", predictionDate: "2025-04-16", predictedStock: 56.12, r2Score: 0.8838 },
    { productName: "Gaming Headset", predictionDate: "2025-04-16", predictedStock: 51.23, r2Score: 0.8858 },
    { productName: "Gaming Chair", predictionDate: "2025-04-16", predictedStock: 39.31, r2Score: 0.8811 },
    { productName: "Webcam", predictionDate: "2025-04-16", predictedStock: 60.50, r2Score: 0.8890 },
    { productName: "Gaming Desk", predictionDate: "2025-04-16", predictedStock: 60.49, r2Score: 0.8827 }
  ];

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
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Complete Forecast Data</CardTitle>
          <CardDescription>Full forecast data for all products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Prediction Date</TableHead>
                  <TableHead className="text-right">Predicted Hand In Stock</TableHead>
                  <TableHead className="text-right">R² Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fullForecastData.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.predictionDate}</TableCell>
                    <TableCell className="text-right">{item.predictedStock.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{item.r2Score.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
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
          <CardDescription>
            Machine learning powered analysis of your forecast data
          </CardDescription>
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
                {(hasWeatherFactors || hasSocialFactors)
                  ? " a noticeable impact on upcoming demand. Monitor these factors closely."
                  : " minimal impact on upcoming demand based on current forecasts."}
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Link to="/reordering-system">
              <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded">
                Plan Reorder Based on Forecast
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
