
import { useEffect, useState } from "react";
import { fetchDashboardSummary, fetchAlerts, fetchWeatherData, markAlertAsRead } from "@/lib/mock-api";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { WeatherForecast } from "@/components/dashboard/WeatherForecast";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { Alert, WeatherData } from "@/lib/mock-data";
import { ShoppingCart, AlertTriangle, Package, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Load data in parallel
        const [summary, alertsData, weatherForecast] = await Promise.all([
          fetchDashboardSummary(),
          fetchAlerts(),
          fetchWeatherData()
        ]);
        
        setSummaryData(summary);
        setAlerts(alertsData.filter(alert => !alert.read).slice(0, 5));
        setWeatherData(weatherForecast);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const handleMarkAsRead = async (alertId: string) => {
    await markAlertAsRead(alertId);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  // Create sample sales trend data
  const salesTrendData = [
    { date: "2023-01", actual: 1200, predicted: 1100 },
    { date: "2023-02", actual: 1300, predicted: 1250 },
    { date: "2023-03", actual: 1400, predicted: 1350 },
    { date: "2023-04", actual: 1600, predicted: 1500 },
    { date: "2023-05", actual: 1800, predicted: 1750 },
    { date: "2023-06", actual: 1900, predicted: 1850 },
    { date: "2023-07", actual: 2100, predicted: 2000 },
    { date: "2023-08", actual: 2300, predicted: 2250 },
    { date: "2023-09", actual: 2500, predicted: 2400 },
    { date: "2023-10", actual: 2600, predicted: 2550 },
    { date: "2023-11", actual: 2800, predicted: 2700 },
    { date: "2023-12", actual: 3000, predicted: 2900 }
  ];

  // Create sample top products data
  const topProductsData = summaryData?.topSellingProducts.map((product: any) => ({
    name: product.name,
    sales: product.sales
  })) || [];

  if (isLoading) {
    return (
      <div className="container p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-muted-foreground">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Products" 
          value={summaryData?.totalProducts || 0} 
          icon={<Package />}
        />
        <StatCard 
          title="Low Stock Items" 
          value={summaryData?.lowStockCount || 0} 
          icon={<AlertTriangle />}
          colorScheme={summaryData?.lowStockCount > 0 ? "warning" : "default"}
        />
        <StatCard 
          title="Overstock Items" 
          value={summaryData?.overstockCount || 0} 
          icon={<Package />}
        />
        <StatCard 
          title="Total Inventory Value" 
          value={`$${summaryData?.totalValue?.toLocaleString() || 0}`} 
          icon={<ShoppingCart />}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <LineChart 
          title="Sales Trend vs. Predicted"
          description="Actual vs. forecasted sales over 12 months"
          className="lg:col-span-2"
          data={salesTrendData}
          xAxisKey="date"
          xAxisFormatter={(date) => date.substring(5)}
          lines={[
            { key: "actual", name: "Actual Sales", color: "#3b82f6" },
            { key: "predicted", name: "Predicted", color: "#94a3b8", dashed: true }
          ]}
        />
        <AlertsList 
          alerts={alerts} 
          onMarkAsRead={handleMarkAsRead} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <BarChart 
          title="Top Selling Products"
          data={topProductsData}
          xAxisKey="name"
          xAxisFormatter={(name) => name.split(" ").pop() || name}
          bars={[
            { key: "sales", name: "Sales", color: "#3b82f6" }
          ]}
          height={300}
          className="lg:col-span-2"
        />
        <WeatherForecast weatherData={weatherData} />
      </div>
    </div>
  );
}
