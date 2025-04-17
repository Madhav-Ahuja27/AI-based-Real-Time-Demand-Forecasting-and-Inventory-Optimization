
import { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, Filter, Edit, Save, X, Trash2, FileDown, FilePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProductTableProps {
  products: Product[];
  className?: string;
  onProductUpdate?: (updatedProduct: Product) => void;
  onProductDelete?: (productId: string) => void;
}

export function ProductTable({ products, className, onProductUpdate, onProductDelete }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Product>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Product>>({});
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  // Get unique categories for filter dropdown
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  // Filter products by search term and category
  const filteredProducts = products.filter(
    (product) => {
      const matchesSearch = 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = !filterCategory || product.category === filterCategory;
      
      return matchesSearch && matchesCategory;
    }
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
      reorderPoint: product.reorderPoint,
      supplier: product.supplier,
      locationId: product.locationId
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingProduct(null);
    setEditValues({});
  };

  // Save changes
  const saveChanges = (product: Product) => {
    const updatedProduct = {
      ...product,
      ...editValues
    };
    
    if (onProductUpdate) {
      onProductUpdate(updatedProduct);
    } else {
      // Fallback implementation if no onProductUpdate prop is provided
      // In a real app, this would call an API
      console.log("Updating product:", updatedProduct);
    }
    
    toast.success(`${updatedProduct.name} updated successfully!`);
    setEditingProduct(null);
    setEditValues({});
  };
  
  // Handle product deletion
  const handleDeleteProduct = (productId: string, productName: string) => {
    if (onProductDelete) {
      onProductDelete(productId);
    } else {
      // Fallback implementation
      console.log("Deleting product:", productId);
    }
    toast.success(`${productName} has been deleted`);
  };

  // Handle input change
  const handleInputChange = (field: keyof Product, value: string | number) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  // Export products to CSV
  const exportToCSV = () => {
    const headers = [
      "Name", "SKU", "Category", "Stock Level", 
      "Min Stock", "Max Stock", "Reorder Point", "Price"
    ].join(",");
    
    const rows = sortedProducts.map(product => [
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

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setFilterCategory(null);
    setSortBy("name");
    setSortOrder("asc");
  };

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={filterCategory || ""}
            onChange={(e) => setFilterCategory(e.target.value || null)}
          >
            <option value="">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button size="sm">
            <FilePlus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
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
                          <Button onClick={() => saveChanges(product)} size="sm" variant="outline">
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button onClick={cancelEditing} size="sm" variant="ghost">
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2 justify-end">
                          <Button onClick={() => startEditing(product)} size="sm" variant="ghost">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            onClick={() => handleDeleteProduct(product.id, product.name)} 
                            size="sm" 
                            variant="ghost"
                            className="text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                          </Button>
                        </div>
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
