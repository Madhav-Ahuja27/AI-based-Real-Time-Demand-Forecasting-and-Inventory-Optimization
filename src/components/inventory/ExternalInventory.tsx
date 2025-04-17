
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
  Search
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
  const { data: inventory = [], isLoading, isError, error, refetch } = useExternalInventory();
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
    Location: "Delhi"
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(
    new Set(inventory.map(item => item.Category).filter(Boolean))
  );

  // Filter items by search and category
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
      Location: item.Location || ""
    });
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditValues({});
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
    // Validate required fields
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
        // Reset form
        setNewItem({
          Product: "",
          Current_Stock: 0,
          Recommended_Order: 0,
          Status: "In Stock",
          SKU: "",
          Category: "",
          Price: 0,
          Supplier: "",
          Location: "Delhi"
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
    
    // Create a blob and download the file
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
  
  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle>External Inventory</CardTitle>
          <CardDescription>Live product inventory data</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
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
            <DialogContent className="sm:max-w-[550px]">
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
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddItem} disabled={isAdding}>Add Item</Button>
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
        </div>
      
        <Tabs defaultValue="all" className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="low" className="text-amber-500">Low Stock</TabsTrigger>
            <TabsTrigger value="out" className="text-rose-500">Out of Stock</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <span className="text-muted-foreground">Loading inventory data...</span>
            </div>
          ) : isError ? (
            <div className="h-[200px] flex items-center justify-center flex-col">
              <AlertTriangle className="h-8 w-8 text-destructive mb-2" />
              <span className="text-destructive">Error loading inventory data</span>
              <p className="text-sm text-muted-foreground">{error instanceof Error ? error.message : 'Unknown error'}</p>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Price & Category</TableHead>
                        <TableHead>Supplier & Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory.map((item, index) => {
                        const isEditing = editingItem === item;
                        return (
                          <TableRow key={index}>
                            {renderBasicInfo(item, isEditing)}
                            {renderExtendedInfo(item, isEditing)}
                            <TableCell>
                              {isEditing ? (
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={saveChanges} 
                                    variant="outline" 
                                    size="sm"
                                    disabled={isUpdating}
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button 
                                    onClick={cancelEditing} 
                                    variant="ghost" 
                                    size="sm"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={() => startEditing(item)} 
                                    variant="ghost" 
                                    size="sm"
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    onClick={() => handleDeleteItem(item)} 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-rose-500 hover:text-rose-700"
                                    disabled={isDeleting}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="low">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Recommended Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price & Category</TableHead>
                        <TableHead>Supplier & Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory
                        .filter(item => item.Status.toLowerCase() === 'low stock')
                        .map((item, index) => {
                          const isEditing = editingItem === item;
                          return (
                            <TableRow key={index}>
                              {renderBasicInfo(item, isEditing)}
                              {renderExtendedInfo(item, isEditing)}
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex space-x-2">
                                    <Button onClick={saveChanges} variant="outline" size="sm" disabled={isUpdating}>
                                      <Save className="h-4 w-4 mr-1" />Save
                                    </Button>
                                    <Button onClick={cancelEditing} variant="ghost" size="sm">
                                      <X className="h-4 w-4 mr-1" />Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-2">
                                    <Button onClick={() => startEditing(item)} variant="ghost" size="sm">
                                      <Edit className="h-4 w-4 mr-1" />Edit
                                    </Button>
                                    <Button 
                                      onClick={() => handleDeleteItem(item)} 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-rose-500 hover:text-rose-700"
                                      disabled={isDeleting}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="out">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Recommended Order</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Price & Category</TableHead>
                        <TableHead>Supplier & Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInventory
                        .filter(item => item.Status.toLowerCase() === 'out of stock')
                        .map((item, index) => {
                          const isEditing = editingItem === item;
                          return (
                            <TableRow key={index}>
                              {renderBasicInfo(item, isEditing)}
                              {renderExtendedInfo(item, isEditing)}
                              <TableCell>
                                {isEditing ? (
                                  <div className="flex space-x-2">
                                    <Button onClick={saveChanges} variant="outline" size="sm" disabled={isUpdating}>
                                      <Save className="h-4 w-4 mr-1" />Save
                                    </Button>
                                    <Button onClick={cancelEditing} variant="ghost" size="sm">
                                      <X className="h-4 w-4 mr-1" />Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex space-x-2">
                                    <Button onClick={() => startEditing(item)} variant="ghost" size="sm">
                                      <Edit className="h-4 w-4 mr-1" />Edit
                                    </Button>
                                    <Button 
                                      onClick={() => handleDeleteItem(item)} 
                                      variant="ghost" 
                                      size="sm" 
                                      className="text-rose-500 hover:text-rose-700"
                                      disabled={isDeleting}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
