
import { useState } from "react";
import { Link } from "react-router-dom";
import { Product } from "@/lib/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductTableProps {
  products: Product[];
  className?: string;
}

export function ProductTable({ products, className }: ProductTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Product>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
              sortedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>
                    <div>{product.stockLevel}</div>
                    <div className="text-xs text-muted-foreground">Min: {product.minStockLevel} | Max: {product.maxStockLevel}</div>
                  </TableCell>
                  <TableCell>{getStockLevelIndicator(product)}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/inventory-monitoring/${product.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
