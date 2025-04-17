
import { useState } from "react";
import { useProducts, useLocations, useAlerts } from "@/hooks/useInventoryData";
import { ProductTable } from "@/components/inventory/ProductTable";
import { AlertsList } from "@/components/dashboard/AlertsList";
import Map from "@/components/inventory/Map";
import { ExternalInventory } from "@/components/inventory/ExternalInventory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search, MapPin, FileDown, FilePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Product } from "@/lib/mock-data";

export default function InventoryMonitoring() {
  const { data: products = [], isLoading: isProductsLoading, refetch: refetchProducts } = useProducts();
  const { data: locations = [], isLoading: isLocationsLoading } = useLocations();
  const { data: alerts = [], isLoading: isAlertsLoading } = useAlerts();
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeView, setActiveView] = useState<"list" | "map">("list");

  const filteredProducts = products
    .filter(product => selectedLocation === "all" || product.locationId === selectedLocation)
    .filter(product => 
      searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const lowStockCount = filteredProducts.filter(p => p.stockLevel <= p.reorderPoint).length;
  const optimalStockCount = filteredProducts.filter(p => p.stockLevel > p.reorderPoint && p.stockLevel <= p.maxStockLevel).length;
  const overstockCount = filteredProducts.filter(p => p.stockLevel > p.maxStockLevel).length;

  const isLoading = isProductsLoading || isLocationsLoading || isAlertsLoading;

  // Handle product updates
  const handleProductUpdate = (updatedProduct: Product) => {
    // In a real app, this would call an API to update the product
    console.log("Updated product:", updatedProduct);
    toast.success(`${updatedProduct.name} updated successfully`);
    
    // Refresh the product list
    setTimeout(() => {
      refetchProducts();
    }, 500);
  };

  // Handle product deletion
  const handleProductDelete = (productId: string) => {
    // In a real app, this would call an API to delete the product
    console.log("Deleting product:", productId);
    toast.success("Product deleted successfully");
    
    // Refresh the product list
    setTimeout(() => {
      refetchProducts();
    }, 500);
  };

  // Export products to CSV
  const exportToCSV = () => {
    const headers = [
      "Name", "SKU", "Category", "Stock Level", 
      "Min Stock", "Max Stock", "Reorder Point", "Price"
    ].join(",");
    
    const rows = filteredProducts.map(product => [
      `"${product.name}"`,
      product.sku,
      product.category,
      product.stockLevel,
      product.minStockLevel,
      product.maxStockLevel,
      product.reorderPoint,
      product.price
    ].join(","));
    
    const csv = [headers, ...rows].join("\n");
    
    // Create a blob and download the file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `inventory-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Inventory data exported successfully");
  };

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Inventory Monitoring</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Card className="md:w-1/3 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Low Stock</CardTitle>
            <CardDescription>Items below reorder point</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center">
            <div className="flex items-center w-full">
              <div className="h-16 w-16 rounded-full bg-rose-100 flex items-center justify-center mr-4">
                <AlertTriangle className="h-8 w-8 text-rose-500" />
              </div>
              <div>
                <span className="text-3xl font-bold">{lowStockCount}</span>
                <p className="text-sm text-muted-foreground">Items needing attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/3 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Optimal Stock</CardTitle>
            <CardDescription>Items at optimal levels</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center">
            <div className="flex items-center w-full">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mr-4">
                <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <span className="text-3xl font-bold">{optimalStockCount}</span>
                <p className="text-sm text-muted-foreground">Items at ideal levels</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-1/3 flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Overstock</CardTitle>
            <CardDescription>Items above max stock level</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center">
            <div className="flex items-center w-full">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div>
                <span className="text-3xl font-bold">{overstockCount}</span>
                <p className="text-sm text-muted-foreground">Items exceeding limits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          <Button 
            variant={activeView === "list" ? "default" : "outline"} 
            onClick={() => {
              setActiveView("list");
              toast.info("Switched to list view");
            }}
          >
            List View
          </Button>
          <Button 
            variant={activeView === "map" ? "default" : "outline"} 
            onClick={() => {
              setActiveView("map");
              toast.info("Switched to map view");
            }}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            Map View
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={exportToCSV}
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={() => toast.info("Add product feature coming soon!")}
          >
            <FilePlus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        <ExternalInventory />
      </div>
      
      {activeView === "list" ? (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>View and filter your current inventory</CardDescription>
              </div>
              
              <div className="flex gap-2 flex-col sm:flex-row w-full md:w-auto">
                <div className="relative w-full sm:w-[200px]">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select 
                  value={selectedLocation} 
                  onValueChange={(value) => {
                    setSelectedLocation(value);
                    toast.info(`Filtered by location: ${value === 'all' ? 'All Locations' : locations.find(loc => loc.id === value)?.name || value}`);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <span className="text-muted-foreground">Loading inventory data...</span>
              </div>
            ) : (
              <ProductTable 
                products={filteredProducts} 
                onProductUpdate={handleProductUpdate}
                onProductDelete={handleProductDelete}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inventory Locations</CardTitle>
            <CardDescription>Main warehouse location in Chandigarh, India</CardDescription>
          </CardHeader>
          <CardContent>
            <Map className="h-[500px] w-full" />
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Stock Level Monitoring</CardTitle>
            <CardDescription>Real-time tracking across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Items</TabsTrigger>
                <TabsTrigger value="low" className="text-amber-500">Low Stock</TabsTrigger>
                <TabsTrigger value="optimal" className="text-emerald-500">Optimal</TabsTrigger>
                <TabsTrigger value="overstock" className="text-blue-500">Overstock</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="rounded-md border overflow-hidden">
                  <div className="p-4">
                    {filteredProducts.slice(0, 5).map(product => (
                      <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{product.stockLevel} units</p>
                            <p className="text-xs text-muted-foreground">
                              Min: {product.minStockLevel} | Max: {product.maxStockLevel}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast.success(`Viewing details for ${product.name}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="low">
                <div className="space-y-2">
                  {filteredProducts
                    .filter(p => p.stockLevel <= p.reorderPoint)
                    .slice(0, 5)
                    .map(product => (
                      <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-rose-500">{product.stockLevel} units</p>
                            <p className="text-xs text-muted-foreground">
                              Reorder at: {product.reorderPoint}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              toast.success(`Processing order for ${product.name}`);
                            }}
                          >
                            Order
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="optimal">
                <div className="space-y-2">
                  {filteredProducts
                    .filter(p => p.stockLevel > p.reorderPoint && p.stockLevel <= p.maxStockLevel)
                    .slice(0, 5)
                    .map(product => (
                      <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-emerald-500">{product.stockLevel} units</p>
                            <p className="text-xs text-muted-foreground">
                              Optimal: {product.reorderPoint}-{product.maxStockLevel}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast.success(`Viewing details for ${product.name}`);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="overstock">
                <div className="space-y-2">
                  {filteredProducts
                    .filter(p => p.stockLevel > p.maxStockLevel)
                    .slice(0, 5)
                    .map(product => (
                      <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium text-blue-500">{product.stockLevel} units</p>
                            <p className="text-xs text-muted-foreground">
                              Max: {product.maxStockLevel}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast.info(`Managing overstock for ${product.name}`);
                            }}
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <AlertsList 
          alerts={alerts
            .filter(alert => 
              alert.type === 'low_stock' || 
              alert.type === 'overstock'
            )
            .slice(0, 10)
          } 
        />
      </div>
    </div>
  );
}
