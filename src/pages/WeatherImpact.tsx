
import { useEffect, useState } from "react";
import { fetchProducts, fetchProductForecast } from "@/lib/mock-api";
import { Product, Forecast } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from "@/components/charts/LineChart";
import { WeatherForecast } from "@/components/dashboard/WeatherForecast";
import { MultiLocationWeather } from "@/components/dashboard/MultiLocationWeather";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CloudSun, CloudRain, Umbrella, Snowflake, CloudLightning, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useWeatherForecast } from "@/hooks/useWeatherData";
import { toast } from "sonner";

export default function WeatherImpact() {
  const [products, setProducts] = useState<Product[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("store-001");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Use our new weather hook
  const { weatherData, isLoading: isLoadingWeather, isError: isWeatherError, refetch: refetchWeather } = useWeatherForecast(selectedLocation);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingProducts(true);
        const productsData = await fetchProducts();
        
        setProducts(productsData);
        
        if (productsData.length > 0) {
          setSelectedProduct(productsData[0].id);
        }
      } catch (error) {
        console.error("Error loading weather impact data:", error);
        toast.error("Failed to load product data");
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      const loadForecast = async () => {
        try {
          const forecast = await fetchProductForecast(selectedProduct);
          setForecasts(forecast);
        } catch (error) {
          console.error("Error loading product forecast:", error);
          toast.error("Failed to load forecast data");
        }
      };
      
      loadForecast();
    }
  }, [selectedProduct]);

  const combinedData = weatherData.map(weather => {
    const forecast = forecasts.find(f => f.date === weather.date);
    
    return {
      date: weather.date,
      condition: weather.condition,
      temperature: weather.temperature,
      precipitation: weather.precipitation,
      predictedDemand: forecast?.predictedDemand || 0,
      weatherImpact: weather.impact * 100
    };
  });

  const weatherSensitiveProducts = [...products]
    .sort((a, b) => Math.random() - 0.5)
    .slice(0, 5)
    .map(product => ({
      ...product,
      weatherImpact: (Math.random() * 2 - 1) * 0.4
    }));

  const getWeatherProductImpactClass = (impact: number) => {
    if (impact > 0.2) return "text-emerald-500";
    if (impact > 0.05) return "text-emerald-400";
    if (impact > -0.05) return "text-gray-500";
    if (impact > -0.2) return "text-rose-400";
    return "text-rose-500";
  };

  const getImpactDescription = (impact: number) => {
    if (impact > 0.2) return "Strong positive";
    if (impact > 0.05) return "Positive";
    if (impact > -0.05) return "Neutral";
    if (impact > -0.2) return "Negative";
    return "Strong negative";
  };

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Weather-Based Sales Impact</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Weather Forecast</CardTitle>
                <CardDescription>Upcoming weather conditions and sales impact</CardDescription>
              </div>
              <Select 
                value={selectedLocation} 
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="store-001">Downtown Store</SelectItem>
                  <SelectItem value="store-002">Westside Location</SelectItem>
                  <SelectItem value="warehouse-main">Main Warehouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <WeatherForecast 
              weatherData={weatherData}
              className="border-none shadow-none p-0"
              isLoading={isLoadingWeather}
              isError={isWeatherError}
              onRefresh={refetchWeather}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weather Insights</CardTitle>
            <CardDescription>How weather affects your business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center mb-2">
                <CloudRain className="h-5 w-5 mr-2 text-blue-500" />
                <h3 className="font-medium">Rainy Days</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Umbrella and raincoat sales increase by 120% during rainy forecasts.
              </p>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center mb-2">
                <CloudSun className="h-5 w-5 mr-2 text-yellow-500" />
                <h3 className="font-medium">Sunny Days</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Outdoor equipment and sunscreen sales rise by 85% during sunny periods.
              </p>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center mb-2">
                <Snowflake className="h-5 w-5 mr-2 text-blue-300" />
                <h3 className="font-medium">Snow Forecasts</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Winter gear and emergency supplies see a 150% increase prior to snowfall.
              </p>
            </div>
            
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center mb-2">
                <CloudLightning className="h-5 w-5 mr-2 text-purple-500" />
                <h3 className="font-medium">Storm Warnings</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Batteries and flashlights see a 95% sales increase when storms are forecast.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Weather Impact Analysis</CardTitle>
                <CardDescription>Effects on sales by weather conditions</CardDescription>
              </div>
              <Select 
                value={selectedProduct || ""} 
                onValueChange={setSelectedProduct}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingProducts || isLoadingWeather ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <span className="text-muted-foreground">Loading impact data...</span>
                </div>
              </div>
            ) : (
              <LineChart
                data={combinedData}
                xAxisKey="date"
                height={350}
                lines={[
                  { key: "predictedDemand", name: "Predicted Demand", color: "#3b82f6" },
                  { key: "weatherImpact", name: "Weather Impact (%)", color: "#ec4899" }
                ]}
              />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Weather Sensitive Products</CardTitle>
            <CardDescription>Products most affected by weather</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {weatherSensitiveProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between pb-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {getImpactDescription(product.weatherImpact)}
                      </p>
                    </div>
                    <div className={`flex items-center ${getWeatherProductImpactClass(product.weatherImpact)}`}>
                      {product.weatherImpact > 0 ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      <span className="font-medium">
                        {Math.abs(Math.round(product.weatherImpact * 100))}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Weather-Based Inventory Recommendations</CardTitle>
          <CardDescription>Suggested actions based on weather forecast</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Weather Condition</TableHead>
                <TableHead>Affected Products</TableHead>
                <TableHead>Expected Impact</TableHead>
                <TableHead>Recommended Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                {
                  icon: CloudRain,
                  iconColor: "text-blue-500",
                  condition: "Rain forecast (next 3 days)",
                  products: "Umbrellas, Raincoats, Waterproof Boots",
                  impact: "+120% Demand",
                  action: "Increase stock levels by 100%, feature prominently in store"
                },
                {
                  icon: CloudSun,
                  iconColor: "text-yellow-500",
                  condition: "Heat wave (temperature &gt; 30°C)",
                  products: "Fans, Air Conditioners, Cold Beverages",
                  impact: "+85% Demand",
                  action: "Double stock levels, create promotional bundles"
                },
                {
                  icon: Snowflake,
                  iconColor: "text-blue-300",
                  condition: "Snow forecast",
                  products: "Snow Shovels, Winter Boots, De-icer",
                  impact: "+150% Demand",
                  action: "Triple stock levels, expedite delivery from warehouse"
                },
                {
                  icon: CloudLightning,
                  iconColor: "text-purple-500",
                  condition: "Severe storm warning",
                  products: "Flashlights, Batteries, Emergency Kits",
                  impact: "+95% Demand",
                  action: "Create emergency displays, ensure adequate stock"
                },
                {
                  icon: CloudSun,
                  iconColor: "text-yellow-500",
                  condition: "Extended sunny period",
                  products: "Winter Apparel, Heaters, Hot Beverages",
                  impact: "-50% Demand",
                  action: "Reduce stock, offer promotions to clear inventory"
                }
              ].map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center">
                      <item.icon className={`h-4 w-4 mr-2 ${item.iconColor}`} />
                      <span>{item.condition}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.products}</TableCell>
                  <TableCell>
                    <Badge 
                      className={`${
                        item.impact.startsWith("+") 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                          : "bg-rose-100 text-rose-800 border-rose-300"
                      }`}
                    >
                      {item.impact}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.action}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
