
import { WeatherData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { CloudSun, Cloud, CloudRain, Snowflake, CloudLightning } from "lucide-react";

interface WeatherForecastProps {
  weatherData: WeatherData[];
  className?: string;
}

export function WeatherForecast({ weatherData, className }: WeatherForecastProps) {
  if (!weatherData.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Weather Forecast</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          No weather data available
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
        <CardTitle>Weather Forecast</CardTitle>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
