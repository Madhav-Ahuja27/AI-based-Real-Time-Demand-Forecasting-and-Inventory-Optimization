import { useEffect, useState } from "react";
import { fetchProductForecast, getRecommendedReorderAmount, placeOrder } from "@/lib/mock-api";
import { useExternalInventoryForReordering } from "@/hooks/useExternalInventoryData";
import { Product } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, RefreshCw, Search, FileDown, Settings, Loader2, ThumbsUp, ThumbsDown, HelpCircle, TrendingUp, TrendingDown, Shuffle } from "lucide-react";
import { toast } from "sonner";

// Import for the detailed forecast data
import { parseForecastData } from "@/lib/data-parser";

// Raw forecast data
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

interface ReorderRecommendation {
  productId: string;
  recommendedQuantity: number;
  reasoning: {
    currentStock: number;
    predictedStock: number; // Required field for the type
    avgDailyDemand: number;
    leadTime: number;
    safetyStock: number;
    weatherImpact: number;
    socialImpact: number;
  };
}

// Create forecast data lookup map
const forecastDataMap = new Map();
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

// Create lookup map
fullForecastData.forEach(item => {
  forecastDataMap.set(item.productName, item.predictedStock);
});

export default function ReorderingSystem() {
  const { data: externalProducts = [], isLoading: isLoadingExternal, isError: isErrorExternal, error: externalError, refetch: refetchExternal, isFetching: isFetchingExternal } = useExternalInventoryForReordering();
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Record<string, ReorderRecommendation>>({});
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [reorderDetails, setReorderDetails] = useState<ReorderRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("urgent");
  const [orderQuantity, setOrderQuantity] = useState<number>(0);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [deliveryDate, setDeliveryDate] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (externalProducts.length > 0) {
      // Add the required salesVelocity property and cast to Product[]
      const productsWithSalesVelocity = externalProducts.map(product => ({
        ...product,
        salesVelocity: 10, // Default value for salesVelocity
      })) as unknown as Product[];
      
      setProducts(productsWithSalesVelocity);
      loadRecommendationsData(productsWithSalesVelocity);
    }
  }, [externalProducts]);

  const loadRecommendationsData = async (productsData: Product[]) => {
    try {
      setIsLoading(true);
      
      // Get recommendations for products below or near reorder point
      const productsToCheck = productsData.filter(
        p => p.stockLevel <= p.reorderPoint * 1.2
      );
      
      // For each product that needs checking, create a recommendation
      const recommendationMap: Record<string, ReorderRecommendation> = {};
      
      // Use the external data's "recommended_order" field directly or calculate it
      for (const product of productsToCheck) {
        const predictedStock = forecastDataMap.get(product.name);
        const recommendedQuantity = (product as any).recommended_order || 
          Math.max(0, Math.round(product.reorderPoint - product.stockLevel + 10));
        
        recommendationMap[product.id] = {
          productId: product.id,
          recommendedQuantity,
          reasoning: {
            currentStock: product.stockLevel,
            predictedStock: predictedStock !== undefined ? predictedStock : product.stockLevel * 0.9,
            avgDailyDemand: product.stockLevel * 0.1,
            leadTime: product.leadTime || 5,
            safetyStock: product.minStockLevel,
            weatherImpact: Math.random() * 5,
            socialImpact: Math.random() * 5
          }
        };
      }
      
      setRecommendations(recommendationMap);
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error loading reordering data:", error);
      toast.error("Failed to load reordering data");
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refreshing data
  const handleRefresh = () => {
    setIsRefreshing(true);
    refetchExternal().then(() => {
      toast.success("Reordering data refreshed");
    });
  };

  useEffect(() => {
    if (selectedProduct) {
      const loadRecommendation = async () => {
        try {
          // Find the selected product
          const product = products.find(p => p.id === selectedProduct);
          if (!product) return;
          
          // Get or create recommendation
          let recommendation = recommendations[selectedProduct];
          if (!recommendation) {
            const predictedStock = forecastDataMap.get(product.name);
            const recommendedQuantity = (product as any).recommended_order || 
              Math.max(0, Math.round(product.reorderPoint - product.stockLevel + 10));
            
            recommendation = {
              productId: product.id,
              recommendedQuantity,
              reasoning: {
                currentStock: product.stockLevel,
                predictedStock: predictedStock !== undefined ? predictedStock : product.stockLevel * 0.9,
                avgDailyDemand: product.stockLevel * 0.1,
                leadTime: product.leadTime || 5,
                safetyStock: product.minStockLevel,
                weatherImpact: Math.random() * 5,
                socialImpact: Math.random() * 5
              }
            };
          }
          
          setReorderDetails(recommendation);
          setOrderQuantity(recommendation.recommendedQuantity);
          setSelectedSupplier(product.supplier || "");
          
          // Set delivery date to 7 days from now by default
          const date = new Date();
          date.setDate(date.getDate() + 7);
          setDeliveryDate(date.toISOString().split('T')[0]);
        } catch (error) {
          console.error("Error loading recommendation:", error);
          toast.error("Failed to load product reorder details");
        }
      };
      
      loadRecommendation();
    } else {
      setReorderDetails(null);
      setOrderQuantity(0);
      setSelectedSupplier("");
      setDeliveryDate("");
      setOrderNotes("");
    }
  }, [selectedProduct, products, recommendations]);

  const exportToCSV = () => {
    const headers = [
      "Product", "SKU", "Current Stock", "Predicted Stock", "Recommended Order", "Status"
    ].join(",");
    
    const rows = products
      .filter(p => p.stockLevel <= p.reorderPoint * 1.2)
      .map(product => {
        const rec = recommendations[product.id];
        const predictedStock = rec?.reasoning.predictedStock || forecastDataMap.get(product.name) || 'N/A';
        return [
          `"${product.name}"`,
          product.sku,
          product.stockLevel,
          typeof predictedStock === 'number' ? predictedStock.toFixed(2) : predictedStock,
          rec ? rec.recommendedQuantity : 0,
          product.stockLevel <= product.minStockLevel ? "Critical" : "Reorder Soon"
        ].join(",");
      });
    
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reorder-recommendations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Reorder recommendations exported successfully");
  };

  const handlePlaceOrder = async () => {
    if (!reorderDetails || !selectedProduct) return;
    
    if (!orderQuantity) {
      toast.error("Please enter a valid order quantity");
      return;
    }
    
    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }
    
    if (!deliveryDate) {
      toast.error("Please select an expected delivery date");
      return;
    }
    
    setIsPlacingOrder(true);
    
    try {
      // Call the API to place the order and update inventory
      const success = await placeOrder(
        selectedProduct,
        orderQuantity,
        deliveryDate,
        selectedSupplier,
        orderNotes
      );
      
      if (success) {
        const product = products.find(p => p.id === selectedProduct);
        toast.success(`Order placed for ${orderQuantity} units of ${product?.name}`);
        
        // Refresh the data to show updated inventory levels
        setIsRefreshing(true);
        refetchExternal().then(() => {
          setIsRefreshing(false);
          setSelectedProduct(null);
        });
      } else {
        toast.error("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("An error occurred while placing the order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Get audience fit badge for market analysis
  const getAudienceFitBadge = (audienceFit: string | null | undefined) => {
    if (!audienceFit) return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
        <HelpCircle className="w-3 h-3 mr-1" /> Unknown
      </Badge>
    );

    switch (audienceFit.toLowerCase()) {
      case "high":
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            <ThumbsUp className="w-3 h-3 mr-1" /> High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            <Shuffle className="w-3 h-3 mr-1" /> Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-300">
            <ThumbsDown className="w-3 h-3 mr-1" /> Low
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">{audienceFit}</Badge>
        );
    }
  };
  
  const getMarketSentimentBadge = (sentiment: string | null | undefined) => {
    if (!sentiment) return (
      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
        <HelpCircle className="w-3 h-3 mr-1" /> Unknown
      </Badge>
    );

    switch (sentiment.toLowerCase()) {
      case "positive":
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            <TrendingUp className="w-3 h-3 mr-1" /> Positive
          </Badge>
        );
      case "mixed":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            <Shuffle className="w-3 h-3 mr-1" /> Mixed
          </Badge>
        );
      case "negative":
        return (
          <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-300">
            <TrendingDown className="w-3 h-3 mr-1" /> Negative
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">{sentiment}</Badge>
        );
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    searchQuery === "" ||
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const urgentProducts = filteredProducts.filter(p => 
    p.stockLevel <= p.minStockLevel && recommendations[p.id]?.recommendedQuantity > 0
  );
  
  const recommendedProducts = filteredProducts.filter(p => 
    (p.stockLevel > p.minStockLevel && 
     p.stockLevel <= p.reorderPoint &&
     recommendations[p.id]?.recommendedQuantity > 0) ||
    ((p as any).audience_fit === "Medium" && p.stockLevel < 10 && p.stockLevel > 0)
  );
  
  const optimalProducts = filteredProducts.filter(p => 
    p.stockLevel > p.reorderPoint && p.stockLevel <= p.maxStockLevel &&
    !((p as any).audience_fit === "Medium" && p.stockLevel < 10)
  );

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Smart Reordering System</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Reorder Recommendations</CardTitle>
          <CardDescription>AI-driven suggestions based on stock levels, demand forecast, and external factors</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="urgent" 
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="urgent" className="relative">
                  Urgent
                  {urgentProducts.length > 0 && (
                    <Badge className="ml-2 bg-rose-500">{urgentProducts.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="recommended" className="relative">
                  Recommended
                  {recommendedProducts.length > 0 && (
                    <Badge className="ml-2 bg-amber-500">{recommendedProducts.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="optimal">Optimal</TabsTrigger>
              </TabsList>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-[200px] pl-8"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isFetchingExternal}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing || isFetchingExternal ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    toast.info("Opening reorder settings");
                  }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={exportToCSV}
                >
                  <FileDown className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
            
            <TabsContent value="urgent" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Predicted Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Market Analysis</TableHead>
                      <TableHead>Recommended Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || isLoadingExternal ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Loading reorder data...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : urgentProducts.length > 0 ? (
                      urgentProducts.map((product) => {
                        const rec = recommendations[product.id];
                        const predictedStock = rec?.reasoning.predictedStock;
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-rose-500">{product.stockLevel} units</div>
                              <div className="text-xs text-muted-foreground">Min: {product.minStockLevel}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {predictedStock !== undefined ? predictedStock.toFixed(2) : "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Critical
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1">
                                {getAudienceFitBadge((product as any).audience_fit)}
                                <div className="text-xs text-muted-foreground">
                                  {(product as any).prediction || "No prediction"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{rec.recommendedQuantity} units</div>
                              <div className="text-xs text-muted-foreground">{product.leadTime} days lead time</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" onClick={() => setSelectedProduct(product.id)}>
                                Order Now
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No urgent reorders needed.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="recommended" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Predicted Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Market Analysis</TableHead>
                      <TableHead>Recommended Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || isLoadingExternal ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Loading reorder data...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : recommendedProducts.length > 0 ? (
                      recommendedProducts.map((product) => {
                        const rec = recommendations[product.id];
                        const predictedStock = rec?.reasoning.predictedStock;
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-amber-500">{product.stockLevel} units</div>
                              <div className="text-xs text-muted-foreground">Reorder: {product.reorderPoint}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {predictedStock !== undefined ? predictedStock.toFixed(2) : "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300">
                                <AlertTriangle className="h-3 w-3" />
                                Reorder Soon
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1">
                                {getAudienceFitBadge((product as any).audience_fit)}
                                <div className="text-xs text-muted-foreground">
                                  {(product as any).prediction || "No prediction"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{rec.recommendedQuantity} units</div>
                              <div className="text-xs text-muted-foreground">{product.leadTime} days lead time</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="outline" onClick={() => setSelectedProduct(product.id)}>
                                Order
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No recommended reorders at this time.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="optimal" className="m-0">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Predicted Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Market Analysis</TableHead>
                      <TableHead>Reorder Point</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading || isLoadingExternal ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Loading inventory data...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : optimalProducts.length > 0 ? (
                      optimalProducts.map((product) => {
                        const predictedStock = forecastDataMap.get(product.name);
                        
                        return (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-green-500">{product.stockLevel} units</div>
                              <div className="text-xs text-muted-foreground">Max: {product.maxStockLevel}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {predictedStock !== undefined ? predictedStock.toFixed(2) : "N/A"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
                                <CheckCircle2 className="h-3 w-3" />
                                Optimal
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col space-y-1">
                                {getAudienceFitBadge((product as any).audience_fit)}
                                <div className="text-xs text-muted-foreground">
                                  {(product as any).prediction || "No prediction"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{product.reorderPoint} units</div>
                              <div className="text-xs text-muted-foreground">{product.leadTime} days lead time</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button size="sm" variant="ghost">
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No products with optimal stock levels.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Selected Product Order Details */}
      {selectedProduct && reorderDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
            <CardDescription>
              {products.find(p => p.id === selectedProduct)?.name} - SKU: {products.find(p => p.id === selectedProduct)?.sku}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Order Quantity</label>
                  <Input
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="mt-1"
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended quantity: {reorderDetails.recommendedQuantity} units
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Expected Delivery Date</label>
                  <Input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="mt-1"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Supplier</label>
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supplier1">Acme Electronics</SelectItem>
                      <SelectItem value="supplier2">Tech Solutions Inc.</SelectItem>
                      <SelectItem value="supplier3">Global Components Ltd.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Order Notes</label>
                  <Input
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="mt-1"
                    placeholder="Add any special instructions"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Reorder Recommendation Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Current Stock:</span>
                      <span>{reorderDetails.reasoning.currentStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Predicted Stock:</span>
                      <span>{reorderDetails.reasoning.predictedStock?.toFixed(2) || "N/A"} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg. Daily Demand:</span>
                      <span>{reorderDetails.reasoning.avgDailyDemand.toFixed(2)} units/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lead Time:</span>
                      <span>{reorderDetails.reasoning.leadTime} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Safety Stock:</span>
                      <span>{reorderDetails.reasoning.safetyStock} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Weather Impact:</span>
                      <span>{reorderDetails.reasoning.weatherImpact > 0 ? "+" : ""}{reorderDetails.reasoning.weatherImpact}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Social Media Impact:</span>
                      <span>{reorderDetails.reasoning.socialImpact > 0 ? "+" : ""}{reorderDetails.reasoning.socialImpact}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-6">
                  <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                    {isPlacingOrder ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
