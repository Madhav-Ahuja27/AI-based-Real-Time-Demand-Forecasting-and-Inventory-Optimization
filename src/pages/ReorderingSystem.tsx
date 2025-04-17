
import { useEffect, useState } from "react";
import { fetchProducts, fetchProductForecast, getRecommendedReorderAmount } from "@/lib/mock-api";
import { Product } from "@/lib/mock-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, RefreshCw, Search, FileDown, Settings } from "lucide-react";
import { toast } from "sonner";

interface ReorderRecommendation {
  productId: string;
  recommendedQuantity: number;
  reasoning: {
    currentStock: number;
    avgDailyDemand: number;
    leadTime: number;
    safetyStock: number;
    weatherImpact: number;
    socialImpact: number;
  };
}

export default function ReorderingSystem() {
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const productsData = await fetchProducts();
      setProducts(productsData);
      
      // Get recommendations for products below or near reorder point
      const productsToCheck = productsData.filter(
        p => p.stockLevel <= p.reorderPoint * 1.2
      );
      
      const recommendationPromises = productsToCheck.map(p => 
        getRecommendedReorderAmount(p.id)
      );
      
      const recommendationResults = await Promise.all(recommendationPromises);
      const recommendationsMap: Record<string, ReorderRecommendation> = {};
      
      recommendationResults.forEach(rec => {
        recommendationsMap[rec.productId] = rec;
      });
      
      setRecommendations(recommendationsMap);
    } catch (error) {
      console.error("Error loading reordering data:", error);
      toast.error("Failed to load reordering data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      const loadRecommendation = async () => {
        try {
          const recommendation = await getRecommendedReorderAmount(selectedProduct);
          setReorderDetails(recommendation);
          setOrderQuantity(recommendation.recommendedQuantity);
          
          const product = products.find(p => p.id === selectedProduct);
          if (product) {
            setSelectedSupplier(product.supplier || "");
          }
          
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
  }, [selectedProduct, products]);

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
    toast.success("Reordering data refreshed");
  };

  // Export recommendations
  const handleExport = () => {
    const headers = [
      "Product", "SKU", "Current Stock", "Recommended Order", "Status"
    ].join(",");
    
    const rows = products
      .filter(p => p.stockLevel <= p.reorderPoint * 1.2)
      .map(product => {
        const rec = recommendations[product.id];
        return [
          `"${product.name}"`,
          product.sku,
          product.stockLevel,
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

  // Place order
  const handlePlaceOrder = () => {
    if (!reorderDetails) return;
    
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
    
    // In a real app, this would send the order to the backend
    const product = products.find(p => p.id === selectedProduct);
    
    toast.success(`Order placed for ${orderQuantity} units of ${product?.name}`);
    console.log("Order details:", {
      productId: selectedProduct,
      productName: product?.name,
      quantity: orderQuantity,
      supplier: selectedSupplier,
      deliveryDate,
      notes: orderNotes
    });
    
    // Close the order form
    setSelectedProduct(null);
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
    p.stockLevel > p.minStockLevel && 
    p.stockLevel <= p.reorderPoint &&
    recommendations[p.id]?.recommendedQuantity > 0
  );
  
  const optimalProducts = filteredProducts.filter(p => 
    p.stockLevel > p.reorderPoint && p.stockLevel <= p.maxStockLevel
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
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
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
                  onClick={handleExport}
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
                      <TableHead>Status</TableHead>
                      <TableHead>Recommended Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Loading reorder data...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : urgentProducts.length > 0 ? (
                      urgentProducts.map((product) => (
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
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Critical
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{recommendations[product.id]?.recommendedQuantity} units</div>
                            <div className="text-xs text-muted-foreground">{product.leadTime} days lead time</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => setSelectedProduct(product.id)}>
                              Order Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
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
                      <TableHead>Status</TableHead>
                      <TableHead>Recommended Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Loading reorder data...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : recommendedProducts.length > 0 ? (
                      recommendedProducts.map((product) => (
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
                            <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300">
                              <RefreshCw className="h-3 w-3" />
                              Reorder Soon
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{recommendations[product.id]?.recommendedQuantity} units</div>
                            <div className="text-xs text-muted-foreground">{product.leadTime} days lead time</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedProduct(product.id)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
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
                      <TableHead>Status</TableHead>
                      <TableHead>Days Until Reorder</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                            Loading inventory data...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : optimalProducts.slice(0, 5).length > 0 ? (
                      optimalProducts.slice(0, 5).map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{product.stockLevel} units</div>
                            <div className="text-xs text-muted-foreground">Reorder: {product.reorderPoint}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 bg-emerald-100 text-emerald-800 border-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              Optimal
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {Math.round((product.stockLevel - product.reorderPoint) / product.salesVelocity)} days
                            </div>
                            <div className="text-xs text-muted-foreground">
                              At current sales velocity
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedProduct(product.id)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No products at optimal stock level.
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
      
      {reorderDetails && selectedProduct && (
        <Card>
          <CardHeader>
            <CardTitle>
              Reorder Details: {products.find(p => p.id === selectedProduct)?.name}
            </CardTitle>
            <CardDescription>
              Detailed breakdown of reorder recommendation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Recommendation Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-sm text-muted-foreground">Current Stock</div>
                      <div className="text-xl font-medium">{reorderDetails.reasoning.currentStock} units</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-sm text-muted-foreground">Recommended Order</div>
                      <div className="text-xl font-medium">{reorderDetails.recommendedQuantity} units</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-sm text-muted-foreground">Avg. Daily Demand</div>
                      <div className="text-xl font-medium">{reorderDetails.reasoning.avgDailyDemand.toFixed(2)} units</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-sm text-muted-foreground">Lead Time</div>
                      <div className="text-xl font-medium">{reorderDetails.reasoning.leadTime} days</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-sm text-muted-foreground">Safety Stock</div>
                      <div className="text-xl font-medium">{reorderDetails.reasoning.safetyStock.toFixed(0)} units</div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <div className="text-sm text-muted-foreground">Total Forecast</div>
                      <div className="text-xl font-medium">
                        {(reorderDetails.reasoning.avgDailyDemand * reorderDetails.reasoning.leadTime).toFixed(0)} units
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">External Impact Factors</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <div className="text-sm text-muted-foreground">Weather Impact</div>
                        <div className="text-xl font-medium">
                          {reorderDetails.reasoning.weatherImpact > 0 ? "+" : ""}
                          {(reorderDetails.reasoning.weatherImpact * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <div className="text-sm text-muted-foreground">Social Media Impact</div>
                        <div className="text-xl font-medium">
                          {reorderDetails.reasoning.socialImpact > 0 ? "+" : ""}
                          {(reorderDetails.reasoning.socialImpact * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-2">Reorder Calculation</h4>
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <p className="mb-2"><strong>Lead Time Demand:</strong> {reorderDetails.reasoning.avgDailyDemand.toFixed(2)} units/day × {reorderDetails.reasoning.leadTime} days = {(reorderDetails.reasoning.avgDailyDemand * reorderDetails.reasoning.leadTime).toFixed(0)} units</p>
                    <p className="mb-2"><strong>Safety Stock:</strong> {reorderDetails.reasoning.safetyStock.toFixed(0)} units</p>
                    <p className="mb-2"><strong>Current Stock:</strong> {reorderDetails.reasoning.currentStock} units</p>
                    <p className="mb-2"><strong>External Factor Adjustment:</strong> {Math.round((reorderDetails.reasoning.weatherImpact + reorderDetails.reasoning.socialImpact) * 10)} units</p>
                    <p className="pt-2 border-t"><strong>Recommended Order Quantity:</strong> {reorderDetails.recommendedQuantity} units</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Order Form</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Order Quantity</label>
                      <Input 
                        type="number" 
                        value={orderQuantity} 
                        onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Supplier</label>
                      <Select 
                        value={selectedSupplier} 
                        onValueChange={setSelectedSupplier}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Acme Inc">Acme Inc</SelectItem>
                          <SelectItem value="Global Supply Co">Global Supply Co</SelectItem>
                          <SelectItem value="Quality Products Ltd">Quality Products Ltd</SelectItem>
                          <SelectItem value="Prime Distributors">Prime Distributors</SelectItem>
                          <SelectItem value="Apple Inc.">Apple Inc.</SelectItem>
                          <SelectItem value="Samsung Electronics">Samsung Electronics</SelectItem>
                          <SelectItem value="Sony Corporation">Sony Corporation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expected Delivery Date</label>
                    <Input 
                      type="date" 
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notes</label>
                    <textarea 
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Add any special instructions for this order"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedProduct(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handlePlaceOrder}>
                      Place Order
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
