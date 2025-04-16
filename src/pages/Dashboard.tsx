import { useDashboardSummary, useAlerts, useWeatherData } from "@/hooks/useInventoryData";
import { StatCard } from "@/components/dashboard/StatCard";
import { AlertsList } from "@/components/dashboard/AlertsList";
import { WeatherForecast } from "@/components/dashboard/WeatherForecast";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { Boxes, AlertTriangle, TrendingUp, DollarSign, ShoppingCart, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { markAlertAsRead } from "@/lib/mock-api";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { data: summaryData, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: alertsData, isLoading: isAlertsLoading, refetch: refetchAlerts } = useAlerts();
  const { data: weatherData, isLoading: isWeatherLoading } = useWeatherData();
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Filter out read alerts
  const alerts = alertsData?.filter(alert => !alert.read).slice(0, 5) || [];

  const handleMarkAsRead = async (alertId: string) => {
    try {
      setIsMarkingRead(true);
      await markAlertAsRead(alertId);
      await refetchAlerts();
      toast({
        title: "Success",
        description: "Alert marked as read",
      });
    } catch (error) {
      console.error("Error marking alert as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark alert as read",
        variant: "destructive",
      });
    } finally {
      setIsMarkingRead(false);
    }
  };

  // Create sample inventory KPIs
  const inventoryKPIs = [
    { date: "2023-01", turnoverRate: 4.2, stockLevel: 85 },
    { date: "2023-02", turnoverRate: 4.5, stockLevel: 82 },
    { date: "2023-03", turnoverRate: 4.7, stockLevel: 80 },
    { date: "2023-04", turnoverRate: 5.1, stockLevel: 78 },
    { date: "2023-05", turnoverRate: 5.3, stockLevel: 75 },
    { date: "2023-06", turnoverRate: 5.5, stockLevel: 79 },
    { date: "2023-07", turnoverRate: 5.8, stockLevel: 73 },
    { date: "2023-08", turnoverRate: 6.0, stockLevel: 70 },
    { date: "2023-09", turnoverRate: 6.3, stockLevel: 68 },
    { date: "2023-10", turnoverRate: 6.5, stockLevel: 72 },
    { date: "2023-11", turnoverRate: 6.8, stockLevel: 74 },
    { date: "2023-12", turnoverRate: 7.0, stockLevel: 76 }
  ];

  // Create sample top products data
  const topProductsData = summaryData?.topSellingProducts.map((product: any) => ({
    name: product.name,
    sales: product.sales
  })) || [];

  const isLoading = isSummaryLoading || isAlertsLoading || isWeatherLoading;

  if (isLoading) {
    return (
      <div className="container p-6">
        <h1 className="text-3xl font-bold mb-6">Inventory Dashboard</h1>
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-muted-foreground">Loading inventory data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-1" />
            Last updated: Today 10:30 AM
          </Button>
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            Generate Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Products" 
          value={summaryData?.totalProducts || 0} 
          icon={<Boxes className="text-primary" />}
          description="Currently in inventory"
          className="inventory-card"
        />
        <StatCard 
          title="Low Stock Items" 
          value={summaryData?.lowStockCount || 0} 
          icon={<AlertTriangle className="text-destructive" />}
          description="Requires attention"
          colorScheme="warning"
          className="inventory-card"
        />
        <StatCard 
          title="Inventory Value" 
          value={`$${summaryData?.totalValue?.toLocaleString() || 0}`} 
          icon={<DollarSign className="text-success" />}
          description="Total current value"
          colorScheme="success"
          className="inventory-card"
        />
        <StatCard 
          title="Pending Orders" 
          value={summaryData?.alertsCount || 0} 
          icon={<ShoppingCart className="text-secondary" />}
          description="Awaiting fulfillment"
          colorScheme="primary"
          className="inventory-card"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 inventory-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Inventory Performance</CardTitle>
                <CardDescription>Turnover rate vs. stock levels</CardDescription>
              </div>
              <Button variant="outline" size="sm">Last 12 Months</Button>
            </div>
          </CardHeader>
          <CardContent>
            <LineChart 
              data={inventoryKPIs}
              xAxisKey="date"
              xAxisFormatter={(date) => date.substring(5)}
              lines={[
                { key: "turnoverRate", name: "Turnover Rate", color: "#0284c7", strokeWidth: 3 },
                { key: "stockLevel", name: "Stock Level (%)", color: "#6366f1", dashed: true }
              ]}
              height={320}
            />
          </CardContent>
        </Card>
        <AlertsList 
          alerts={alerts} 
          onMarkAsRead={handleMarkAsRead}
          className="inventory-card"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 inventory-card">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Units sold this month</CardDescription>
              </div>
              <Link to="/inventory-monitoring">
                <Button variant="outline" size="sm">View All Products</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={topProductsData}
              xAxisKey="name"
              xAxisFormatter={(name) => name.split(" ").pop() || name}
              bars={[
                { key: "sales", name: "Units Sold", color: "#0284c7" }
              ]}
              height={280}
            />
          </CardContent>
        </Card>
        <Card className="inventory-card">
          <CardHeader>
            <CardTitle>External Factors</CardTitle>
            <CardDescription>Weather impact on inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <WeatherForecast 
              weatherData={weatherData || []} 
              className="border-none p-0"
            />
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm font-medium mb-2">Recommended Actions</div>
              <div className="text-sm text-muted-foreground">
                Prepare for increased demand of seasonal items due to forecasted weather changes.
              </div>
              <div className="mt-4">
                <Link to="/weather-impact">
                  <Button variant="outline" size="sm" className="w-full">
                    View Weather Impact Details
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="inventory-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inventory Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-success">92%</div>
              <div className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Good</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Based on stock levels, turnover, and demand forecasts
            </div>
            <div className="w-full bg-muted/50 h-2 rounded-full mt-3">
              <div className="bg-success h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="inventory-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Inventory Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">$24,580</div>
              <div className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">-3.2%</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Total holding costs this month
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="text-sm">Last month:</div>
              <div className="text-sm font-medium">$25,392</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="inventory-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Reorder Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning">Pending</div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Products requiring reorder review
            </div>
            <div className="mt-3">
              <Link to="/reordering-system">
                <Button size="sm" variant="secondary" className="w-full">Review Reorder List</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
