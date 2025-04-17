
import { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, Filter, Edit, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductTableProps {
  products: Product[];
  className?: string;
}

export function ProductTable({ products, className }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Product>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product>>({});

  // Filter products by search term
  const filteredProducts = products.filter(
    (product) => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
  );

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" 
        ? aValue - bValue 
        : bValue - aValue;
    }
    return 0;
  });

  // Handle sorting
  const handleSort = (column: keyof Product) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Start editing a product
  const startEditing = (product: Product) => {
    setEditingProduct(product.id);
    setEditValues({
      name: product.name,
      sku: product.sku,
      category: product.category,
      stockLevel: product.stockLevel,
      price: product.price,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      reorderPoint: product.reorderPoint
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProduct(null);
    setEditValues({});
  };

  // Save changes
  const saveChanges = (productId: string) => {
    // In a real application, you would call an API to update the product
    // For now, we'll just show a success message
    toast.success("Product updated successfully!");
    setEditingProduct(null);
    setEditValues({});
  };

  // Handle input change
  const handleInputChange = (field: keyof Product, value: string | number) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  // Stock level indicator
  const getStockLevelIndicator = (product: Product) => {
    if (product.stockLevel <= product.minStockLevel) {
      return <Badge variant="destructive">Low</Badge>;
    } else if (product.stockLevel < product.reorderPoint) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Reorder</Badge>;
    } else if (product.stockLevel > product.maxStockLevel) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Overstock</Badge>;
    } else {
      return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">Optimal</Badge>;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between pb-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                <div className="flex items-center">
                  Product
                  {sortBy === "name" && (
                    <ArrowUpDown className={cn("ml-1 h-4 w-4", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("category")} className="cursor-pointer">
                <div className="flex items-center">
                  Category
                  {sortBy === "category" && (
                    <ArrowUpDown className={cn("ml-1 h-4 w-4", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </TableHead>
              <TableHead onClick={() => handleSort("stockLevel")} className="cursor-pointer">
                <div className="flex items-center">
                  Stock
                  {sortBy === "stockLevel" && (
                    <ArrowUpDown className={cn("ml-1 h-4 w-4", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead onClick={() => handleSort("price")} className="cursor-pointer text-right">
                <div className="flex items-center justify-end">
                  Price
                  {sortBy === "price" && (
                    <ArrowUpDown className={cn("ml-1 h-4 w-4", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.length > 0 ? (
              sortedProducts.map((product) => {
                const isEditing = editingProduct === product.id;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editValues.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full"
                          />
                          <Input
                            value={editValues.sku || ''}
                            onChange={(e) => handleInputChange('sku', e.target.value)}
                            className="w-full text-xs"
                            placeholder="SKU"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={editValues.category || ''}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        product.category
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            type="number"
                            value={editValues.stockLevel || 0}
                            onChange={(e) => handleInputChange('stockLevel', Number(e.target.value))}
                            className="w-20"
                          />
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              value={editValues.minStockLevel || 0}
                              onChange={(e) => handleInputChange('minStockLevel', Number(e.target.value))}
                              className="w-16 h-7 text-xs"
                              placeholder="Min"
                            />
                            <Input
                              type="number"
                              value={editValues.maxStockLevel || 0}
                              onChange={(e) => handleInputChange('maxStockLevel', Number(e.target.value))}
                              className="w-16 h-7 text-xs"
                              placeholder="Max"
                            />
                          </div>
                          <Input
                            type="number"
                            value={editValues.reorderPoint || 0}
                            onChange={(e) => handleInputChange('reorderPoint', Number(e.target.value))}
                            className="w-16 h-7 text-xs"
                            placeholder="Reorder"
                          />
                        </div>
                      ) : (
                        <>
                          <div>{product.stockLevel}</div>
                          <div className="text-xs text-muted-foreground">Min: {product.minStockLevel} | Max: {product.maxStockLevel}</div>
                        </>
                      )}
                    </TableCell>
                    <TableCell>{getStockLevelIndicator(product)}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.price || 0}
                          onChange={(e) => handleInputChange('price', Number(e.target.value))}
                          className="w-24"
                          step="0.01"
                        />
                      ) : (
                        `$${product.price.toFixed(2)}`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex space-x-2 justify-end">
                          <Button onClick={() => saveChanges(product.id)} size="sm" variant="outline">
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button onClick={cancelEditing} size="sm" variant="ghost">
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => startEditing(product)} size="sm" variant="ghost">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
