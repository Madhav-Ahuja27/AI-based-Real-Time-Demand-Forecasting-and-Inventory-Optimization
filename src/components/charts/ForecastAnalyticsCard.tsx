
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailedForecastData } from "@/lib/data-parser";
import { ArrowDownIcon, ArrowUpIcon, CloudRainIcon, TrendingUpIcon } from "lucide-react";

interface ForecastAnalyticsCardProps {
  data: DetailedForecastData[];
  productName?: string;
  className?: string;
}

export function ForecastAnalyticsCard({ data, productName, className }: ForecastAnalyticsCardProps) {
  const analytics = useMemo(() => {
    if (!data.length) return null;
    
    // Calculate overall trends
    const stockTrend = data[data.length - 1].stockLevel - data[0].stockLevel;
    const revenueTrend = data[data.length - 1].revenue - data[0].revenue;
    
    // Get average impacts
    const avgWeatherImpact = data.reduce((sum, item) => sum + item.weatherImpact, 0) / data.length;
    const avgSocialImpact = data.reduce((sum, item) => sum + item.socialImpact, 0) / data.length;
    
    // Find day with highest predicted stock
    const highestStockDay = [...data].sort((a, b) => b.predictedStock - a.predictedStock)[0];
    
    // Find day with highest revenue
    const highestRevenueDay = [...data].sort((a, b) => b.revenue - a.revenue)[0];
    
    return {
      stockTrend,
      stockTrendPercent: ((stockTrend / data[0].stockLevel) * 100).toFixed(1),
      revenueTrend,
      revenueTrendPercent: ((revenueTrend / data[0].revenue) * 100).toFixed(1),
      avgWeatherImpact,
      avgSocialImpact,
      highestStockDay,
      highestRevenueDay,
      totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0),
      avgPrice: data.reduce((sum, item) => sum + item.price, 0) / data.length
    };
  }, [data]);
  
  if (!analytics) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Forecast Analytics {productName && `for ${productName}`}</CardTitle>
        <CardDescription>
          Key insights from the forecast data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Stock Trend</h3>
              {analytics.stockTrend > 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold mt-2">
              {analytics.stockTrend > 0 ? '+' : ''}{analytics.stockTrendPercent}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics.stockTrend > 0 
                ? 'Increasing stock trend over the period' 
                : 'Decreasing stock trend over the period'}
            </p>
          </div>
          
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Revenue Trend</h3>
              {analytics.revenueTrend > 0 ? (
                <TrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="text-2xl font-bold mt-2">
              ${(analytics.totalRevenue / 1000).toFixed(1)}k
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {analytics.revenueTrend > 0 
                ? `+${analytics.revenueTrendPercent}% revenue growth` 
                : `${analytics.revenueTrendPercent}% revenue decline`}
            </p>
          </div>
          
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Impact Analysis</h3>
              <CloudRainIcon className="h-4 w-4 text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-sm text-muted-foreground">Weather Impact</p>
                <p className="font-medium">{analytics.avgWeatherImpact.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Social Impact</p>
                <p className="font-medium">{analytics.avgSocialImpact.toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg bg-muted/50 p-4">
            <h3 className="font-medium">Key Dates</h3>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <div>
                <p className="text-sm text-muted-foreground">Highest Stock Date</p>
                <p className="font-medium">{analytics.highestStockDay.date} ({analytics.highestStockDay.predictedStock.toFixed(0)} units)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Revenue Date</p>
                <p className="font-medium">{analytics.highestRevenueDay.date} (${analytics.highestRevenueDay.revenue.toLocaleString()})</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
