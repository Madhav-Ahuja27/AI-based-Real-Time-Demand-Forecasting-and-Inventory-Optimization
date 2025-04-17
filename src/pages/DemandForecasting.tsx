
import { useState } from "react";
import { LineChart } from "@/components/charts/LineChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DetailedForecastChart } from "@/components/charts/DetailedForecastChart";
import { ForecastAnalyticsCard } from "@/components/charts/ForecastAnalyticsCard";
import { useDetailedForecast } from "@/hooks/useDetailedForecast";

const RAW_FORECAST_DATA = `2025-04-01,P101,Laptop,69,4,3,62.44,1200,85200,91
2025-04-01,P102,Monitor,67,-1,1,74.04,500,33500,91
2025-04-01,P103,Keyboard,60,5,3,42.87,50,3450,91
2025-04-01,P104,Headphones,40,3,6,49.55,100,4300,91
2025-04-01,P105,Smartphone,29,1,-1,37.47,900,29700,91
2025-04-01,P106,Tablet,40,3,2,58.77,700,31500,91
2025-04-01,P107,Router,51,3,2,36.49,150,8700,91
2025-04-01,P108,External Hard Drive,49,6,7,61.23,200,10600,91
2025-04-01,P109,Wireless Earbuds,72,2,3,29.06,80,6320,91
2025-04-01,P110,Webcam,55,4,0,62.69,60,4020,91
2025-04-01,P111,Desk Chair,65,4,7,41.48,150,10050,91
2025-04-01,P112,Desk Lamp,50,3,2,56.48,30,1680,91
2025-04-01,P113,USB Flash Drive,46,4,-1,34.54,20,1180,91
2025-04-01,P114,Ethernet Cable,42,3,4,35.47,10,420,91
2025-04-01,P115,Power Strip,62,3,-1,34.26,25,1750,91
2025-04-01,P116,Wireless Mouse,64,1,4,42.32,40,2600,91
2025-04-01,P117,Gaming Keyboard,48,-1,2,41.17,100,5000,91
2025-04-01,P118,Gaming Mouse,53,4,3,57.22,80,4880,91
2025-04-01,P119,Gaming Headset,62,5,-2,54.10,120,8280,91
2025-04-01,P120,Gaming Chair,46,1,2,40.50,200,9600,91
2025-04-01,P121,Gaming Monitor,73,2,7,63.85,400,29200,91
2025-04-01,P122,Graphics Card,58,1,5,35.31,600,36000,91
2025-04-01,P123,CPU,60,3,-2,41.20,350,23450,91
2025-04-01,P124,Motherboard,42,2,1,48.82,200,10800,91
2025-04-01,P125,RAM,46,6,2,35.48,80,4320,91
2025-04-01,P126,SSD,37,-2,7,41.54,120,3840,91
2025-04-01,P127,HDD,39,2,-1,56.71,60,3000,91
2025-04-01,P128,Power Supply,51,3,2,75.28,100,5800,91
2025-04-01,P129,PC Case,48,6,3,64.56,80,4400,91
2025-04-01,P130,CPU Cooler,38,4,3,39.87,50,1850,91
2025-04-01,P131,Monitor Stand,72,2,4,27.39,30,2220,91
2025-04-01,P132,Mouse Pad,65,2,2,54.10,10,710,91
2025-04-01,P133,Thermal Paste,43,3,4,59.02,5,225,91
2025-04-01,P134,Cable Management Kit,63,1,0,49.95,15,960,91
2025-04-01,P135,WiFi Adapter,48,3,7,66.39,20,1020,91
2025-04-01,P136,External DVD Drive,42,0,4,32.21,50,2400,91
2025-04-01,P137,Printer Cable,62,1,3,44.97,5,330,91
2025-04-01,P138,Keyboard Cleaner,59,5,-1,66.25,8,592,91
2025-04-01,P139,Laptop Cooling Pad,61,2,1,70.23,20,1280,91
2025-04-01,P140,USB Hub,63,-1,3,37.47,15,885,91
2025-04-01,P141,Anti-Glare Screen Protector,63,0,0,56.29,10,690,91
2025-04-01,P142,USB-C Adapter,43,2,1,52.24,15,780,91
2025-04-01,P143,Laptop Sleeve,56,3,7,41.88,20,1200,91
2025-04-01,P144,Wireless Charger,62,2,0,63.92,30,2070,91
2025-04-01,P145,USB-C Cable,59,3,6,34.10,8,496,91
2025-04-01,P146,Gaming Desk,30,-1,0,60.30,150,4950,91`;

export default function DemandForecasting() {
  const [selectedDetailedProduct, setSelectedDetailedProduct] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("detailed-forecast");
  
  const { 
    data: filteredDetailedData, 
    uniqueProducts, 
    loading: isDetailedForecastLoading 
  } = useDetailedForecast({
    rawData: RAW_FORECAST_DATA,
    selectedProduct: selectedDetailedProduct
  });

  const fullForecastData = [
    { productName: "RAM", predictionDate: "2025-04-16", predictedStock: 35.48, r2Score: 0.9011 },
    { productName: "SSD", predictionDate: "2025-04-16", predictedStock: 41.54, r2Score: 0.8945 },
    { productName: "HDD", predictionDate: "2025-04-16", predictedStock: 56.71, r2Score: 0.9002 },
    { productName: "Power Supply", predictionDate: "2025-04-16", predictedStock: 75.28, r2Score: 0.8950 },
    { productName: "PC Case", predictionDate: "2025-04-16", predictedStock: 64.56, r2Score: 0.8958 },
    { productName: "CPU Cooler", predictionDate: "2025-04-16", predictedStock: 39.87, r2Score: 0.9043 },
    { productName: "Monitor Stand", predictionDate: "2025-04-16", predictedStock: 27.39, r2Score: 0.8963 },
    { productName: "Mouse Pad", predictionDate: "2025-04-16", predictedStock: 54.10, r2Score: 0.8997 },
    { productName: "Thermal Paste", predictionDate: "2025-04-16", predictedStock: 59.02, r2Score: 0.8966 },
    { productName: "Wireless Charger", predictionDate: "2025-04-16", predictedStock: 63.92, r2Score: 0.9005 },
    { productName: "WiFi Adapter", predictionDate: "2025-04-16", predictedStock: 66.39, r2Score: 0.9128 },
    { productName: "External DVD Drive", predictionDate: "2025-04-16", predictedStock: 32.21, r2Score: 0.9012 },
    { productName: "Printer Cable", predictionDate: "2025-04-16", predictedStock: 44.97, r2Score: 0.8998 },
    { productName: "Keyboard Cleaner", predictionDate: "2025-04-16", predictedStock: 66.25, r2Score: 0.9001 },
    { productName: "Laptop Cooling Pad", predictionDate: "2025-04-16", predictedStock: 70.23, r2Score: 0.8997 },
    { productName: "USB Hub", predictionDate: "2025-04-16", predictedStock: 37.47, r2Score: 0.9055 },
    { productName: "Anti-Glare Screen Protector", predictionDate: "2025-04-16", predictedStock: 56.29, r2Score: 0.8865 },
    { productName: "USB-C Adapter", predictionDate: "2025-04-16", predictedStock: 52.24, r2Score: 0.8948 },
    { productName: "Laptop Sleeve", predictionDate: "2025-04-16", predictedStock: 41.88, r2Score: 0.8997 },
    { productName: "Motherboard", predictionDate: "2025-04-16", predictedStock: 48.82, r2Score: 0.8925 },
    { productName: "Cable Management Kit", predictionDate: "2025-04-16", predictedStock: 49.95, r2Score: 0.9044 },
    { productName: "CPU", predictionDate: "2025-04-16", predictedStock: 41.20, r2Score: 0.9064 },
    { productName: "Desk Lamp", predictionDate: "2025-04-16", predictedStock: 56.48, r2Score: 0.8908 },
    { productName: "Gaming Monitor", predictionDate: "2025-04-16", predictedStock: 63.85, r2Score: 0.9044 },
    { productName: "USB-C Cable", predictionDate: "2025-04-16", predictedStock: 34.10, r2Score: 0.8962 },
    { productName: "Laptop", predictionDate: "2025-04-16", predictedStock: 62.44, r2Score: 0.8956 },
    { productName: "Monitor", predictionDate: "2025-04-16", predictedStock: 74.04, r2Score: 0.8997 },
    { productName: "Keyboard", predictionDate: "2025-04-16", predictedStock: 42.87, r2Score: 0.9021 },
    { productName: "Headphones", predictionDate: "2025-04-16", predictedStock: 49.55, r2Score: 0.8927 },
    { productName: "Smartphone", predictionDate: "2025-04-16", predictedStock: 37.47, r2Score: 0.9513 },
    { productName: "Tablet", predictionDate: "2025-04-16", predictedStock: 58.77, r2Score: 0.9023 },
    { productName: "Router", predictionDate: "2025-04-16", predictedStock: 36.49, r2Score: 0.9023 },
    { productName: "External Hard Drive", predictionDate: "2025-04-16", predictedStock: 61.23, r2Score: 0.8960 },
    { productName: "Graphics Card", predictionDate: "2025-04-16", predictedStock: 35.31, r2Score: 0.8984 },
    { productName: "Wireless Earbuds", predictionDate: "2025-04-16", predictedStock: 29.06, r2Score: 0.8984 },
    { productName: "Desk Chair", predictionDate: "2025-04-16", predictedStock: 41.48, r2Score: 0.9006 },
    { productName: "USB Flash Drive", predictionDate: "2025-04-16", predictedStock: 34.54, r2Score: 0.8896 },
    { productName: "Ethernet Cable", predictionDate: "2025-04-16", predictedStock: 35.47, r2Score: 0.8826 },
    { productName: "Power Strip", predictionDate: "2025-04-16", predictedStock: 34.26, r2Score: 0.8912 },
    { productName: "Wireless Mouse", predictionDate: "2025-04-16", predictedStock: 42.32, r2Score: 0.8906 },
    { productName: "Gaming Keyboard", predictionDate: "2025-04-16", predictedStock: 41.17, r2Score: 0.8973 },
    { productName: "Gaming Mouse", predictionDate: "2025-04-16", predictedStock: 57.22, r2Score: 0.9006 },
    { productName: "Gaming Headset", predictionDate: "2025-04-16", predictedStock: 54.10, r2Score: 0.9022 },
    { productName: "Gaming Chair", predictionDate: "2025-04-16", predictedStock: 40.50, r2Score: 0.8993 },
    { productName: "Webcam", predictionDate: "2025-04-16", predictedStock: 62.69, r2Score: 0.9043 },
    { productName: "Gaming Desk", predictionDate: "2025-04-16", predictedStock: 60.30, r2Score: 0.9003 }
  ];

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Demand Forecasting</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="detailed-forecast">Detailed Forecast</TabsTrigger>
          <TabsTrigger value="forecast-table">Forecast Table</TabsTrigger>
        </TabsList>
        
        <TabsContent value="detailed-forecast">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <CardTitle>Detailed Forecast Data</CardTitle>
                    <CardDescription>Day-by-day forecast analysis with impact factors</CardDescription>
                  </div>
                  
                  <Select 
                    value={selectedDetailedProduct || ""} 
                    onValueChange={setSelectedDetailedProduct}
                  >
                    <SelectTrigger className="w-full md:w-[280px] mt-4 md:mt-0">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_products">All Products</SelectItem>
                      {uniqueProducts.map((product) => (
                        <SelectItem key={product} value={product}>
                          {product}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
            </Card>
            
            {isDetailedForecastLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Loading detailed forecast data...</span>
              </div>
            ) : (
              <>
                <DetailedForecastChart data={filteredDetailedData} />
                
                <ForecastAnalyticsCard 
                  data={filteredDetailedData}
                  productName={selectedDetailedProduct || undefined}
                />
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="forecast-table">
          <Card>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
