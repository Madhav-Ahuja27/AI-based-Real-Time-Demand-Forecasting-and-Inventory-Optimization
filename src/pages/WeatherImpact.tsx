
import { useEffect, useState } from "react";
import { fetchProducts, fetchWeatherData, fetchProductForecast } from "@/lib/mock-api";
import { WeatherData, Product, Forecast } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart } from "@/components/charts/LineChart";
import { WeatherForecast } from "@/components/dashboard/WeatherForecast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CloudSun, CloudRain, Umbrella, Snowflake, CloudLightning, ArrowUp, ArrowDown } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function WeatherImpact() {
  const [products, setProducts] = useState<Product[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("store-001");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [productsData, weatherForecast] = await Promise.all([
          fetchProducts(),
          fetchWeatherData()
        ]);
        
        setProducts(productsData);
        setWeatherData(weatherForecast);
        
        if (productsData.length > 0) {
          setSelectedProduct(productsData[0].id);
        }
      } catch (error) {
        console.error("Error loading weather impact data:", error);
      } finally {
        setIsLoading(false);
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
        }
      };
      
      loadForecast();
    }
  }, [selectedProduct]);

  // Filter weather data by location
  const locationWeatherData = weatherData.filter(w => w.locationId === selectedLocation);
  
  // Create combined data for chart
  const combinedData = locationWeatherData.map(weather => {
    const forecast = forecasts.find(f => f.date === weather.date);
    
    return {
      date: weather.date,
      condition: weather.condition,
      temperature: weather.temperature,
      precipitation: weather.precipitation,
      predictedDemand: forecast?.predictedDemand || 0,
      weatherImpact: weather.impact * 100 // Convert to percentage
    };
  });

  // Sort products by weather sensitivity (using mock values for demonstration)
  const weatherSensitiveProducts = [...products]
    .sort((a, b) => Math.random() - 0.5) // Sort randomly for demo
    .slice(0, 5)
    .map(product => ({
      ...product,
      weatherImpact: (Math.random() * 2 - 1) * 0.4 // Random value between -40% and 40%
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
              weatherData={locationWeatherData}
              className="border-none shadow-none p-0"
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
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Loading impact data...</span>
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
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <CloudRain className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Rain forecast (next 3 days)</span>
                  </div>
                </TableCell>
                <TableCell>Umbrellas, Raincoats, Waterproof Boots</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    +120% Demand
                  </Badge>
                </TableCell>
                <TableCell>
                  Increase stock levels by 100%, feature prominently in store
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <CloudSun className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>Heat wave (temperature > 30°C)</span>
                  </div>
                </TableCell>
                <TableCell>Fans, Air Conditioners, Cold Beverages</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    +85% Demand
                  </Badge>
                </TableCell>
                <TableCell>
                  Double stock levels, create promotional bundles
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <Snowflake className="h-4 w-4 mr-2 text-blue-300" />
                    <span>Snow forecast</span>
                  </div>
                </TableCell>
                <TableCell>Snow Shovels, Winter Boots, De-icer</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    +150% Demand
                  </Badge>
                </TableCell>
                <TableCell>
                  Triple stock levels, expedite delivery from warehouse
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <CloudLightning className="h-4 w-4 mr-2 text-purple-500" />
                    <span>Severe storm warning</span>
                  </div>
                </TableCell>
                <TableCell>Flashlights, Batteries, Emergency Kits</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    +95% Demand
                  </Badge>
                </TableCell>
                <TableCell>
                  Create emergency displays, ensure adequate stock
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <CloudSun className="h-4 w-4 mr-2 text-yellow-500" />
                    <span>Extended sunny period</span>
                  </div>
                </TableCell>
                <TableCell>Winter Apparel, Heaters, Hot Beverages</TableCell>
                <TableCell>
                  <Badge className="bg-rose-100 text-rose-800 border-rose-300">
                    -50% Demand
                  </Badge>
                </TableCell>
                <TableCell>
                  Reduce stock, offer promotions to clear inventory
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
