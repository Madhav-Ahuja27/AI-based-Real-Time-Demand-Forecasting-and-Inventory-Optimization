import React, { useState } from "react";
import { useExternalInventory, useUpdateExternalInventory, ExternalInventoryItem } from "@/hooks/useExternalInventoryData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw, Edit, Save, X, DollarSign, Package, MapPin, Tag, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ExternalInventory() {
  const { data: inventory = [], isLoading, isError, error, refetch } = useExternalInventory();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateExternalInventory();
  const [editingItem, setEditingItem] = useState<ExternalInventoryItem | null>(null);
  const [editValues, setEditValues] = useState<Partial<ExternalInventoryItem>>({});

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

  const handleInputChange = (field: keyof ExternalInventoryItem, value: string | number) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>External Inventory</CardTitle>
          <CardDescription>Live product inventory data</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading || isUpdating}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
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
          ) : inventory.length === 0 ? (
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
                      {inventory.map((item, index) => {
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
                                <Button 
                                  onClick={() => startEditing(item)} 
                                  variant="ghost" 
                                  size="sm"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
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
                      {inventory
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
                                  <Button onClick={() => startEditing(item)} variant="ghost" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />Edit
                                  </Button>
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
                      {inventory
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
                                  <Button onClick={() => startEditing(item)} variant="ghost" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />Edit
                                  </Button>
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
