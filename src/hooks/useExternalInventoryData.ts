import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ExternalInventoryItem {
  Product: string;
  Current_Stock: number;
  Recommended_Order: number;
  Status: string;
  // New fields from the updated API
  Audience_Fit?: string | null;
  Confidence?: string | null;
  Market_Sentiment?: string | null;
  Prediction?: string | null;
  // Optional fields maintained for backward compatibility
  SKU?: string;
  Category?: string;
  Price?: number;
  Supplier?: string;
  Location?: string;
  // Adding a unique identifier
  Id?: string;
}

interface ExternalInventoryResponse {
  status: string;
  count: number;
  inventory: ExternalInventoryItem[];
}

// This is our fallback mock data if API fails
const mockInventoryData: ExternalInventoryItem[] = [
  {
    Id: "1",
    Product: "Blue Star 1.5 Ton 5 Star Split AC",
    Current_Stock: 5,
    Recommended_Order: 18,
    Status: "In Stock",
    Audience_Fit: "Medium",
    Confidence: "Medium",
    Market_Sentiment: "Mixed",
    Prediction: "May succeed",
    SKU: "BLUESTAR-AC-15T",
    Category: "Air Conditioners",
    Price: 42999.99,
    Supplier: "Blue Star Ltd",
    Location: "Delhi"
  },
  {
    Id: "2",
    Product: "Haier 1.5 Ton 4 Star Smart Split AC",
    Current_Stock: 18,
    Recommended_Order: 0,
    Status: "In Stock",
    Audience_Fit: "High",
    Confidence: "High",
    Market_Sentiment: "Positive",
    Prediction: "Will succeed",
    SKU: "HAIER-AC-15T-4S",
    Category: "Air Conditioners",
    Price: 38999.99,
    Supplier: "Haier Electronics",
    Location: "Mumbai"
  },
  {
    Id: "3",
    Product: "HP 15, 12th Gen Intel Core i5 Laptop",
    Current_Stock: 0,
    Recommended_Order: 25,
    Status: "Out of Stock",
    Audience_Fit: "High",
    Confidence: "High",
    Market_Sentiment: "Positive",
    Prediction: "Will succeed",
    SKU: "HP-I5-12GEN",
    Category: "Laptops",
    Price: 65999.99,
    Supplier: "HP Inc.",
    Location: "Bangalore"
  },
  {
    Id: "4",
    Product: "Voltas 1.5 ton 3 Star Inverter Split AC",
    Current_Stock: 0,
    Recommended_Order: 20,
    Status: "Out of Stock",
    Audience_Fit: "High",
    Confidence: "High",
    Market_Sentiment: "Positive",
    Prediction: "Will succeed",
    SKU: "VOLTAS-AC-15T-3S",
    Category: "Air Conditioners",
    Price: 35999.99,
    Supplier: "Voltas Ltd",
    Location: "Chennai"
  },
  {
    Id: "5",
    Product: "HP 15, AMD Ryzen 5 7520U Laptop",
    Current_Stock: 10,
    Recommended_Order: 5,
    Status: "In Stock",
    Audience_Fit: "Medium",
    Confidence: "Medium",
    Market_Sentiment: "Mixed",
    Prediction: "May succeed",
    SKU: "HP-R5-7520U",
    Category: "Laptops",
    Price: 55999.99,
    Supplier: "HP Inc.",
    Location: "Hyderabad"
  }
];

// In-memory inventory data cache - in a real app, this would be on a server
let inventoryCache: ExternalInventoryItem[] = [];

const fetchExternalInventory = async (): Promise<ExternalInventoryItem[]> => {
  console.log("Fetching external inventory data from API...");
  
  try {
    // Fetch from the real API - using the new endpoint
    const response = await fetch("https://llmhacksmith.vercel.app/api/inventory");
    
    if (!response.ok) {
      console.warn(`API request failed with status ${response.status}, falling back to mock data`);
      return mockInventoryData;
    }
    
    const data: ExternalInventoryResponse = await response.json();
    console.log("API response received:", data);
    
    // Check if we have valid inventory data
    if (!data.inventory || data.inventory.length === 0) {
      console.info("API returned empty inventory, falling back to mock data");
      return mockInventoryData;
    }
    
    // Process and enhance the API data
    const processedData = data.inventory.map((item, index) => ({
      ...item,
      Id: item.Id || `api-${index + 1}`,
      // Set default values for missing fields
      SKU: item.SKU || `SKU-${index + 1}`,
      Category: item.Category || determineCategory(item.Product),
      Price: item.Price || estimatePrice(item.Product),
      Supplier: item.Supplier || determineSupplier(item.Product),
      Location: item.Location || "Delhi"
    }));
    
    // Update our cache with the processed data
    inventoryCache = processedData;
    
    console.log(`Successfully loaded ${processedData.length} items from API`);
    return processedData;
  } catch (error) {
    console.error("Error fetching external inventory:", error);
    console.info("Falling back to mock inventory data");
    
    // If API fetch fails, use mock data
    return mockInventoryData;
  }
};

// Helper function to determine category from product name
const determineCategory = (productName: string): string => {
  const productNameLower = productName.toLowerCase();
  if (productNameLower.includes("ac") || productNameLower.includes("ton") || 
      productNameLower.includes("air conditioner") || productNameLower.includes("split")) {
    return "Air Conditioners";
  } else if (productNameLower.includes("laptop") || 
            productNameLower.includes("intel") || 
            productNameLower.includes("amd") || 
            productNameLower.includes("ryzen") || 
            productNameLower.includes("core")) {
    return "Laptops";
  } else {
    return "Electronics";
  }
};

// Helper function to estimate price from product name
const estimatePrice = (productName: string): number => {
  const productNameLower = productName.toLowerCase();
  if (productNameLower.includes("laptop") || 
      productNameLower.includes("intel i7") || 
      productNameLower.includes("ryzen 7")) {
    return 75000 + Math.random() * 25000;
  } else if (productNameLower.includes("laptop") || 
            productNameLower.includes("intel i5") || 
            productNameLower.includes("ryzen 5")) {
    return 55000 + Math.random() * 20000;
  } else if (productNameLower.includes("ac") || 
            productNameLower.includes("air conditioner") || 
            productNameLower.includes("ton")) {
    return 35000 + Math.random() * 15000;
  } else {
    return 15000 + Math.random() * 10000;
  }
};

// Helper function to determine supplier from product name
const determineSupplier = (productName: string): string => {
  const productNameLower = productName.toLowerCase();
  if (productNameLower.includes("hp")) {
    return "HP Inc.";
  } else if (productNameLower.includes("samsung")) {
    return "Samsung Electronics";
  } else if (productNameLower.includes("haier")) {
    return "Haier Electronics";
  } else if (productNameLower.includes("blue star")) {
    return "Blue Star Ltd";
  } else if (productNameLower.includes("voltas")) {
    return "Voltas Ltd";
  } else if (productNameLower.includes("panasonic")) {
    return "Panasonic Corporation";
  } else {
    return "Unknown Supplier";
  }
};

const updateExternalInventoryItem = async (item: ExternalInventoryItem): Promise<ExternalInventoryItem> => {
  console.log("Updating item:", item);
  
  try {
    // In a real scenario, we would call the API to update the item
    // const response = await fetch("https://llmhacksmith.vercel.app/api/inventory/update", {
    //   method: "PUT",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(item)
    // });
    
    // For our mock implementation, update the cache
    const index = inventoryCache.findIndex(i => i.Id === item.Id);
    if (index !== -1) {
      inventoryCache[index] = { ...item };
    }
    
    return item;
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw new Error("Failed to update inventory item");
  }
};

const deleteExternalInventoryItem = async (itemId: string): Promise<{ id: string }> => {
  console.log("Deleting item:", itemId);
  
  try {
    // In a real scenario, we would call the API to delete the item
    // const response = await fetch(`https://llmhacksmith.vercel.app/api/inventory/${itemId}`, {
    //   method: "DELETE"
    // });
    
    // For our mock implementation, update the cache
    inventoryCache = inventoryCache.filter(item => item.Id !== itemId);
    
    return { id: itemId };
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw new Error("Failed to delete inventory item");
  }
};

const addExternalInventoryItem = async (item: ExternalInventoryItem): Promise<ExternalInventoryItem> => {
  console.log("Adding new item:", item);
  
  try {
    // In a real scenario, we would call the API to add the item
    // const response = await fetch("https://llmhacksmith.vercel.app/api/inventory", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(item)
    // });
    
    // For our mock implementation, add to cache with a new ID
    const newId = String(Math.max(...inventoryCache.map(i => Number(i.Id || 0))) + 1);
    const newItem = { ...item, Id: newId };
    inventoryCache.push(newItem);
    
    return newItem;
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw new Error("Failed to add inventory item");
  }
};

export function useExternalInventory() {
  return useQuery({
    queryKey: ['external-inventory'],
    queryFn: fetchExternalInventory,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry failed requests up to 2 times
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

export function useUpdateExternalInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateExternalInventoryItem,
    onSuccess: () => {
      // Invalidate the external inventory query to refetch data
      queryClient.invalidateQueries({ queryKey: ['external-inventory'] });
    },
  });
}

export function useDeleteExternalInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteExternalInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-inventory'] });
    },
  });
}

export function useAddExternalInventory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addExternalInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-inventory'] });
    },
  });
}

export function useExternalInventoryForReordering() {
  const { data: inventory = [], isLoading, isError, error, refetch, isFetching } = useExternalInventory();
  
  // Transform external inventory to format needed by reordering system
  const transformedData = inventory.map(item => ({
    id: item.Id || '',
    name: item.Product,
    sku: item.SKU || `SKU-${item.Product.substring(0, 5)}`,
    category: item.Category || 'Electronics',
    stockLevel: item.Current_Stock,
    price: item.Price || 0,
    minStockLevel: Math.floor(item.Current_Stock * 0.2) || 0,
    maxStockLevel: item.Current_Stock * 2 || 30,
    reorderPoint: Math.floor(item.Current_Stock * 0.5) || 5,
    supplier: item.Supplier || 'Default Supplier',
    leadTime: 5, // Default lead time
    locationId: item.Location || 'Default',
    audience_fit: item.Audience_Fit,
    confidence: item.Confidence,
    market_sentiment: item.Market_Sentiment,
    prediction: item.Prediction,
    recommended_order: item.Recommended_Order,
    salesVelocity: 10 // Adding the missing salesVelocity property
  }));
  
  return {
    data: transformedData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  };
}
