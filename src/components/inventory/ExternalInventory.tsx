import React, { useState } from "react";
import { 
  useExternalInventory, 
  useUpdateExternalInventory, 
  useDeleteExternalInventory,
  useAddExternalInventory,
  ExternalInventoryItem 
} from "@/hooks/useExternalInventoryData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Edit, 
  Save, 
  X, 
  DollarSign, 
  Package, 
  MapPin, 
  Tag, 
  User, 
  Plus,
  Trash2,
  FileDown,
  Search,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Shuffle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ExternalInventory() {
  const { data: inventory = [], isLoading, isError, error, refetch, isFetching } = useExternalInventory();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateExternalInventory();
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteExternalInventory();
  const { mutate: addItem, isPending: isAdding } = useAddExternalInventory();
  const [editingItem, setEditingItem] = useState<ExternalInventoryItem | null>(null);
  const [editValues, setEditValues] = useState<Partial<ExternalInventoryItem>>({});
  const [newItem, setNewItem] = useState<Partial<ExternalInventoryItem>>({
    Product: "",
    Current_Stock: 0,
    Recommended_Order: 0,
    Status: "In Stock",
    SKU: "",
    Category: "",
    Price: 0,
    Supplier: "",
    Location: "Delhi",
    Audience_Fit: "Medium",
    Confidence: "Medium",
    Market_Sentiment: "Mixed",
    Prediction: "May succeed"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("basic");

  const uniqueCategories = Array.from(
    new Set(inventory.map(item => item.Category).filter(Boolean))
  );

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      (item.Product?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.SKU?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       item.Category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.Supplier?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !filterCategory || item.Category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "in stock":
        return (
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
            <CheckCircle className="w-3 h-3 mr-1" /> In Stock
          </Badge>
        );
      case "low stock":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
            <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
          </Badge>
        );
      case "out of stock":
        return (
          <Badge variant="destructive">
            Out of Stock
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">{status}</Badge>
        );
    }
  };

  const getAudienceFitBadge = (audienceFit: string | null) => {
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

  const getMarketSentimentBadge = (sentiment: string | null) => {
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

  const startEditing = (item: ExternalInventoryItem) => {
    setEditingItem(item);
    setEditValues({
      Product: item.Product,
      Current_Stock: item.Current_Stock,
      Recommended_Order: item.Recommended_Order,
      Status: item.Status,
      SKU: item.SKU || "",
      Category: item.Category || "",
      Price: item.Price || 0,
      Supplier: item.Supplier || "",
      Location: item.Location || "",
      Audience_Fit: item.Audience_Fit || "Medium",
      Confidence: item.Confidence || "Medium",
      Market_Sentiment: item.Market_Sentiment || "Mixed",
      Prediction: item.Prediction || "May succeed"
    });
    toast.info(`Editing ${item.Product}`);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({});
    toast.info("Editing cancelled");
  };

  const saveChanges = () => {
    if (!editingItem) return;
    
    const updatedItem = {
      ...editingItem,
      ...editValues,
      Current_Stock: Number(editValues.Current_Stock),
      Recommended_Order: Number(editValues.Recommended_Order),
      Price: Number(editValues.Price)
    };
    
    console.log("Saving updated item:", updatedItem);
    
    updateItem(updatedItem, {
      onSuccess: () => {
        toast.success("Inventory item updated successfully");
        setEditingItem(null);
        setEditValues({});
      },
      onError: (error) => {
        toast.error(`Failed to update: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const handleDeleteItem = (item: ExternalInventoryItem) => {
    if (!item.Id) {
      toast.error("Cannot delete item without ID");
      return;
    }
    
    deleteItem(item.Id, {
      onSuccess: () => {
        toast.success(`"${item.Product}" has been deleted`);
      },
      onError: (error) => {
        toast.error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const handleInputChange = (field: keyof ExternalInventoryItem, value: string | number) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  const handleNewItemChange = (field: keyof ExternalInventoryItem, value: string | number) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    if (!newItem.Product) {
      toast.error("Product name is required");
      return;
    }
    
    const itemToAdd = {
      ...newItem,
      Current_Stock: Number(newItem.Current_Stock),
      Recommended_Order: Number(newItem.Recommended_Order),
      Price: Number(newItem.Price)
    } as ExternalInventoryItem;
    
    addItem(itemToAdd, {
      onSuccess: () => {
        toast.success("New product added successfully");
        setIsAddDialogOpen(false);
        setNewItem({
          Product: "",
          Current_Stock: 0,
          Recommended_Order: 0,
          Status: "In Stock",
          SKU: "",
          Category: "",
          Price: 0,
          Supplier: "",
          Location: "Delhi",
          Audience_Fit: "Medium",
          Confidence: "Medium",
          Market_Sentiment: "Mixed",
          Prediction: "May succeed"
        });
      },
      onError: (error) => {
        toast.error(`Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const exportToCSV = () => {
    const headers = [
      "Product", "SKU", "Category", "Current Stock", 
      "Recommended Order", "Status", "Price", "Supplier", "Location"
    ].join(",");
    
    const rows = filteredInventory.map(item => [
      `"${item.Product}"`,
      item.SKU,
      item.Category,
      item.Current_Stock,
      item.Recommended_Order,
      item.Status,
      item.Price ? item.Price.toFixed(2) : "",
      `"${item.Supplier || ''}"`,
      item.Location
    ].join(","));
    
    const csv = [headers, ...rows].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `external-inventory-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Inventory data exported successfully");
  };

  const renderBasicInfo = (item: ExternalInventoryItem, isEditing: boolean) => (
    <>
      <TableCell className="font-medium max-w-md">
        {isEditing ? (
          <Input
            value={editValues.Product || ''}
            onChange={(e) => handleInputChange('Product', e.target.value)}
            className="w-full"
          />
        ) : (
          <div>
            <div>{item.Product}</div>
            {item.SKU && <div className="text-xs text-muted-foreground">SKU: {item.SKU}</div>}
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              type="number"
              value={editValues.Current_Stock}
              onChange={(e) => handleInputChange('Current_Stock', e.target.value)}
              className="w-20"
            />
            {editValues.SKU !== undefined && (
              <div className="flex items-center gap-2 pt-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={editValues.SKU}
                  onChange={(e) => handleInputChange('SKU', e.target.value)}
                  className="w-28 h-7 text-xs"
                  placeholder="SKU"
                />
              </div>
            )}
          </div>
        ) : (
          item.Current_Stock
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            type="number"
            value={editValues.Recommended_Order}
            onChange={(e) => handleInputChange('Recommended_Order', e.target.value)}
            className="w-20"
          />
        ) : (
          item.Recommended_Order
        )}
      </TableCell>
    </>
  );

  const renderExtendedInfo = (item: ExternalInventoryItem, isEditing: boolean) => (
    <>
      <TableCell>
        {isEditing ? (
          <Select
            value={editValues.Status}
            onValueChange={(value) => handleInputChange('Status', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          getStatusBadge(item.Status)
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                value={editValues.Price}
                onChange={(e) => handleInputChange('Price', e.target.value)}
                className="w-24"
                step="0.01"
                placeholder="Price"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Input
                value={editValues.Category}
                onChange={(e) => handleInputChange('Category', e.target.value)}
                className="w-28 h-7 text-xs"
                placeholder="Category"
              />
            </div>
          </div>
        ) : (
          <div>
            {item.Price ? `$${item.Price.toFixed(2)}` : '-'}
            {item.Category && <div className="text-xs text-muted-foreground">{item.Category}</div>}
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Input
                value={editValues.Supplier}
                onChange={(e) => handleInputChange('Supplier', e.target.value)}
                className="w-32 h-7 text-xs"
                placeholder="Supplier"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <Select
                value={editValues.Location}
                onValueChange={(value) => handleInputChange('Location', value)}
              >
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                  <SelectItem value="Ludhiana">Ludhiana</SelectItem>
                  <SelectItem value="Jalandhar">Jalandhar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div>
            {item.Supplier && <div>{item.Supplier}</div>}
            {item.Location && <div className="text-xs text-muted-foreground">{item.Location}</div>}
          </div>
        )}
      </TableCell>
    </>
  );

  const renderPredictionInfo = (item: ExternalInventoryItem, isEditing: boolean) => (
    <>
      <TableCell>
        {isEditing ? (
          <Select
            value={editValues.Audience_Fit || ""}
            onValueChange={(value) => handleInputChange('Audience_Fit', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select fit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          getAudienceFitBadge(item.Audience_Fit)
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Select
                value={editValues.Confidence || ""}
                onValueChange={(value) => handleInputChange('Confidence', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Select
                value={editValues.Market_Sentiment || ""}
                onValueChange={(value) => handleInputChange('Market_Sentiment', value)}
              >
                <SelectTrigger className="w-32 h-7 text-xs">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Positive">Positive</SelectItem>
                  <SelectItem value="Mixed">Mixed</SelectItem>
                  <SelectItem value="Negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div>
            {item.Confidence && <div className="mb-1 text-sm">{item.Confidence} confidence</div>}
            {getMarketSentimentBadge(item.Market_Sentiment)}
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select
            value={editValues.Prediction || ""}
            onValueChange={(value) => handleInputChange('Prediction', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select prediction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Will succeed">Will succeed</SelectItem>
              <SelectItem value="May succeed">May succeed</SelectItem>
              <SelectItem value="May fail">May fail</SelectItem>
              <SelectItem value="Will fail">Will fail</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div>
            <div className={`
              ${item.Prediction?.toLowerCase().includes("succeed") ? "text-emerald-600" : ""}
              ${item.Prediction?.toLowerCase().includes("fail") ? "text-rose-600" : ""}
              font-medium
            `}>
              {item.Prediction || "No prediction"}
            </div>
          </div>
        )}
      </TableCell>
    </>
  );
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>External Inventory</CardTitle>
          <CardDescription>
            Live product inventory data from API
            {isFetching && " (refreshing...)"}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              toast.info("Refreshing inventory data...");
              refetch();
            }}
            disabled={isFetching}
            className="flex items-center gap-2"
          >
            {isFetching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isFetching ? "Refreshing..." : "Refresh"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            Export
          </Button>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px]">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Enter details for the new inventory item
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="col-span-2">
                  <label htmlFor="product-name" className="block text-sm font-medium mb-1">Product Name</label>
                  <Input
                    id="product-name"
                    value={newItem.Product}
                    onChange={(e) => handleNewItemChange('Product', e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label htmlFor="sku" className="block text-sm font-medium mb-1">SKU</label>
                  <Input
                    id="sku"
                    value={newItem.SKU}
                    onChange={(e) => handleNewItemChange('SKU', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                  <Input
                    id="category"
                    value={newItem.Category}
                    onChange={(e) => handleNewItemChange('Category', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium mb-1">Current Stock</label>
                  <Input
                    id="stock"
                    type="number"
                    value={newItem.Current_Stock}
                    onChange={(e) => handleNewItemChange('Current_Stock', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="recommended" className="block text-sm font-medium mb-1">Recommended Order</label>
                  <Input
                    id="recommended"
                    type="number"
                    value={newItem.Recommended_Order}
                    onChange={(e) => handleNewItemChange('Recommended_Order', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                  <Select
                    value={newItem.Status}
                    onValueChange={(value) => handleNewItemChange('Status', value)}
                  >
                    <SelectTrigger id="status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="In Stock">In Stock</SelectItem>
                      <SelectItem value="Low Stock">Low Stock</SelectItem>
                      <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-1">Price</label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newItem.Price}
                    onChange={(e) => handleNewItemChange('Price', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium mb-1">Supplier</label>
                  <Input
                    id="supplier"
                    value={newItem.Supplier}
                    onChange={(e) => handleNewItemChange('Supplier', e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
                  <Select
                    value={newItem.Location}
                    onValueChange={(value) => handleNewItemChange('Location', value)}
                  >
                    <SelectTrigger id="location" className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Chandigarh">Chandigarh</SelectItem>
                      <SelectItem value="Ludhiana">Ludhiana</SelectItem>
                      <SelectItem value="Jalandhar">Jalandhar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* New fields for market analysis */}
                <div>
                  <label htmlFor="audience-fit" className="block text-sm font-medium mb-1">Audience Fit</label>
                  <Select
                    value={newItem.Audience_Fit as string}
                    onValueChange={(value) => handleNewItemChange('Audience_Fit', value)}
                  >
                    <SelectTrigger id="audience-fit" className="w-full">
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="confidence" className="block text-sm font-medium mb-1">Confidence</label>
                  <Select
                    value={newItem.Confidence as string}
                    onValueChange={(value) => handleNewItemChange('Confidence', value)}
                  >
                    <SelectTrigger id="confidence" className="w-full">
                      <SelectValue placeholder="Select confidence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="market-sentiment" className="block text-sm font-medium mb-1">Market Sentiment</label>
                  <Select
                    value={newItem.Market_Sentiment as string}
                    onValueChange={(value) => handleNewItemChange('Market_Sentiment', value)}
                  >
                    <SelectTrigger id="market-sentiment" className="w-full">
                      <SelectValue placeholder="Select sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Mixed">Mixed</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="prediction" className="block text-sm font-medium mb-1">Prediction</label>
                  <Select
                    value={newItem.Prediction as string}
                    onValueChange={(value) => handleNewItemChange('Prediction', value)}
                  >
                    <SelectTrigger id="prediction" className="w-full">
                      <SelectValue placeholder="Select prediction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Will succeed">Will succeed</SelectItem>
                      <SelectItem value="May succeed">May succeed</SelectItem>
                      <SelectItem value="May fail">May fail</SelectItem>
                      <SelectItem value="Will fail">Will fail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    toast.info("Cancelled adding new item");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddItem} 
                  disabled={isAdding}
                >
                  {isAdding ? "Adding..." : "Add Item"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          
          <select 
            className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full sm:w-auto"
            value={filterCategory || ""}
            onChange={(e) => setFilterCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div className="flex gap-2 ml-auto">
            <Button 
              size="sm" 
              variant={activeView === "basic" ? "default" : "outline"}
              onClick={() => setActiveView("basic")}
            >
              Basic View
            </Button>
            <Button 
              size="sm" 
              variant={activeView === "analysis" ? "default" : "outline"}
              onClick={() => setActiveView("analysis")}
            >
              Market Analysis
            </Button>
          </div>
        </div>
      
        <Tabs defaultValue="all" className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="low" className="text-amber-500">Low Stock</TabsTrigger>
            <TabsTrigger value="out" className="text-rose-500">Out of Stock</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                <span className="text-muted-foreground">Loading inventory data from API...</span>
              </div>
            </div>
          ) : isError ? (
            <div className="h-[200px] flex items-center justify-center flex-col">
              <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
              <span className="text-destructive">Error loading inventory data</span>
              <p className="text-sm text-muted-foreground mb-4">{error instanceof Error ? error.message : 'API connection failed'}</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <span className="text-muted-foreground">No inventory items found</span>
            </div>
          ) : (
            <>
              <TabsContent value="all">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Recommended Order</TableHead>
                        {activeView === "basic" ? (
                          <>
                            <TableHead>Status</TableHead>
                            <TableHead>Price & Category</TableHead>
                            <TableHead>Supplier & Location</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead>Audience Fit</TableHead>
                            <TableHead>Confidence & Sentiment</TableHead>
                            <TableHead>Prediction</TableHead>
                          </>
                        )}
                        <TableHead>Actions</TableHead
