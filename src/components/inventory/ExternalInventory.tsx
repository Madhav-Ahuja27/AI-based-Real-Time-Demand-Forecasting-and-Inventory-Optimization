
import React, { useState } from "react";
import { useExternalInventory, useUpdateExternalInventory, ExternalInventoryItem } from "@/hooks/useExternalInventoryData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw, Edit, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
      Status: item.Status
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
      Recommended_Order: Number(editValues.Recommended_Order)
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>External Inventory</CardTitle>
          <CardDescription>Live data from external inventory API</CardDescription>
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Recommended Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-md">
                      {editingItem === item ? (
                        <Input
                          value={editValues.Product || ''}
                          onChange={(e) => handleInputChange('Product', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.Product
                      )}
                    </TableCell>
                    <TableCell>
                      {editingItem === item ? (
                        <Input
                          type="number"
                          value={editValues.Current_Stock}
                          onChange={(e) => handleInputChange('Current_Stock', e.target.value)}
                          className="w-20"
                        />
                      ) : (
                        item.Current_Stock
                      )}
                    </TableCell>
                    <TableCell>
                      {editingItem === item ? (
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
                    <TableCell>
                      {editingItem === item ? (
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
                      {editingItem === item ? (
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
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
