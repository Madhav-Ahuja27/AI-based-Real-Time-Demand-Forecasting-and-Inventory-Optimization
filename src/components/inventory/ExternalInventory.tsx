
import React from "react";
import { useExternalInventory } from "@/hooks/useExternalInventoryData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export function ExternalInventory() {
  const { data: inventory = [], isLoading, isError, error, refetch } = useExternalInventory();
  
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
        >
          <RefreshCw className="h-4 w-4" />
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium max-w-md">{item.Product}</TableCell>
                    <TableCell>{item.Current_Stock}</TableCell>
                    <TableCell>{item.Recommended_Order}</TableCell>
                    <TableCell>{getStatusBadge(item.Status)}</TableCell>
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
