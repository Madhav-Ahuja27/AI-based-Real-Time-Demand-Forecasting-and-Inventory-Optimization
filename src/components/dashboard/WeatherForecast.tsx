
import { WeatherData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CloudSun, Cloud, CloudRain, Snowflake, CloudLightning, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";

interface WeatherForecastProps {
  weatherData: WeatherData[];
  className?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRefresh?: () => void;
}

export function WeatherForecast({ 
  weatherData, 
  className, 
  isLoading = false, 
  isError = false,
  onRefresh 
}: WeatherForecastProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (!onRefresh) return;
    
    setIsRefreshing(true);
    onRefresh();
    
    // Reset refreshing state after a short delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="bg-muted/50">
          <CardTitle>Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !weatherData.length) {
    return (
      <Card className={className}>
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <CardTitle>Weather Forecast</CardTitle>
            {onRefresh && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          {isError ? "Failed to load weather data" : "No weather data available"}
        </CardContent>
      </Card>
    );
  }

  const getWeatherIcon = (condition: WeatherData['condition']) => {
    switch (condition) {
      case 'sunny':
        return <CloudSun className="h-8 w-8 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-8 w-8 text-gray-400" />;
      case 'rainy':
        return <CloudRain className="h-8 w-8 text-blue-400" />;
      case 'snowy':
        return <Snowflake className="h-8 w-8 text-blue-300" />;
      case 'stormy':
        return <CloudLightning className="h-8 w-8 text-purple-500" />;
      default:
        return <CloudSun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getImpactClass = (impact: number) => {
    if (impact > 0.3) return "text-emerald-600";
    if (impact > 0) return "text-emerald-500";
    if (impact > -0.3) return "text-amber-500";
    return "text-rose-500";
  };

  // Group by date and take first location for each date (simplification)
  const uniqueDays = weatherData.reduce<Record<string, WeatherData>>((acc, weather) => {
    const date = weather.date;
    if (!acc[date]) {
      acc[date] = weather;
    }
    return acc;
  }, {});

  // Take first 5 days
  const forecastDays = Object.values(uniqueDays).slice(0, 5);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50">
        <div className="flex items-center justify-between">
          <CardTitle>Weather Forecast</CardTitle>
          {onRefresh && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-5 divide-x">
          {forecastDays.map((weather, index) => (
            <div key={index} className="p-4 text-center">
              <div className="font-medium text-sm mb-2">
                {format(parseISO(weather.date), "EEE, MMM d")}
              </div>
              <div className="flex justify-center mb-2">
                {getWeatherIcon(weather.condition)}
              </div>
              <div className="text-lg font-semibold">
                {Math.round(weather.temperature)}°C
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {weather.condition}
              </div>
              <div className={cn("text-xs mt-2 font-medium", getImpactClass(weather.impact))}>
                Sales Impact: {weather.impact > 0 ? "+" : ""}{Math.round(weather.impact * 100)}%
              </div>
              {weather.precipitation > 0 && (
                <div className="text-xs mt-1 text-muted-foreground">
                  Precip: {Math.round(weather.precipitation)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
