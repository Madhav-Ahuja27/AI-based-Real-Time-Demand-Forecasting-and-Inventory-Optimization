
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeatherForecast } from "./WeatherForecast";
import { useWeatherForecast } from "@/hooks/useWeatherData";
import { locationCityMap } from "@/hooks/useWeatherData";
import Map from "@/components/inventory/Map";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface MultiLocationWeatherProps {
  className?: string;
  title?: string;
  description?: string;
  showMap?: boolean;
}

export function MultiLocationWeather({ 
  className,
  title = "Multi-Location Weather Forecast",
  description = "Real-time weather at all locations",
  showMap = true
}: MultiLocationWeatherProps) {
  // Get all location IDs
  const locationIds = Object.keys(locationCityMap);
  const [selectedLocation, setSelectedLocation] = useState(locationIds[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch weather data for the selected location
  const { 
    weatherData, 
    isLoading, 
    isError, 
    refetch 
  } = useWeatherForecast(selectedLocation);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refetch();
    toast.success(`Weather data for ${locationCityMap[selectedLocation].displayName} refreshed`);
    
    // Reset refreshing state after a short delay
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-2">
        <div className="flex flex-col space-y-4">
          {showMap && (
            <div className="px-6 pb-4">
              <Map className="h-48 w-full rounded-md" />
            </div>
          )}
          
          <Tabs 
            defaultValue={selectedLocation} 
            value={selectedLocation}
            onValueChange={setSelectedLocation} 
            className="w-full"
          >
            <div className="px-6">
              <TabsList className="w-full h-auto flex flex-wrap">
                {locationIds.map(id => (
                  <TabsTrigger 
                    key={id} 
                    value={id}
                    className="flex-grow mb-1"
                    onClick={() => {
                      if (id !== selectedLocation) {
                        setSelectedLocation(id);
                      }
                    }}
                  >
                    {locationCityMap[id].displayName}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {locationIds.map(id => (
              <TabsContent key={id} value={id} className="m-0">
                <WeatherForecast
                  weatherData={id === selectedLocation ? weatherData : []}
                  isLoading={id === selectedLocation && isLoading}
                  isError={id === selectedLocation && isError}
                  onRefresh={id === selectedLocation ? refetch : undefined}
                  locationId={id}
                  showLocation={true}
                  className="border-t rounded-none shadow-none"
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}
