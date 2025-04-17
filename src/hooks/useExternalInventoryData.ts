import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ExternalInventoryItem {
  Product: string;
  Current_Stock: number;
  Recommended_Order: number;
  Status: string;
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
    Product: "Apple MacBook Pro M3 Pro (14-inch, 18GB RAM, 512GB SSD)",
    Current_Stock: 12,
    Recommended_Order: 8,
    Status: "In Stock",
    SKU: "APP-MBP-M3P-512",
    Category: "Laptops",
    Price: 1999.99,
    Supplier: "Apple Inc.",
    Location: "Delhi"
  },
  {
    Id: "2",
    Product: "Samsung Galaxy S24 Ultra (12GB RAM, 512GB)",
    Current_Stock: 6,
    Recommended_Order: 10,
    Status: "Low Stock",
    SKU: "SAM-GS24U-12-512",
    Category: "Smartphones",
    Price: 1299.99,
    Supplier: "Samsung Electronics",
    Location: "Chandigarh"
  },
  {
    Id: "3",
    Product: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    Current_Stock: 0,
    Recommended_Order: 15,
    Status: "Out of Stock",
    SKU: "SNY-WH1000-05",
    Category: "Audio",
    Price: 349.99,
    Supplier: "Sony Corporation",
    Location: "Ludhiana"
  },
  {
    Id: "4",
    Product: "ASUS ROG Strix G16 (2024) Gaming Laptop, Intel i9-14900H, RTX 4070",
    Current_Stock: 8,
    Recommended_Order: 5,
    Status: "In Stock",
    SKU: "ASUS-ROG-G16-4070",
    Category: "Gaming Laptops",
    Price: 1799.99,
    Supplier: "Asus Inc.",
    Location: "Jalandhar"
  },
  {
    Id: "5",
    Product: "Apple iPad Pro 12.9-inch (M2, Wi-Fi, 512GB)",
    Current_Stock: 4,
    Recommended_Order: 8,
    Status: "Low Stock",
    SKU: "APP-IPP-M2-512",
    Category: "Tablets",
    Price: 1399.99,
    Supplier: "Apple Inc.",
    Location: "Delhi"
  },
  {
    Id: "6",
    Product: "Bose QuietComfort Ultra Headphones",
    Current_Stock: 10,
    Recommended_Order: 6,
    Status: "In Stock",
    SKU: "BOSE-QCU-BLK",
    Category: "Audio",
    Price: 429.99,
    Supplier: "Bose Corporation",
    Location: "Chandigarh"
  },
  {
    Id: "7",
    Product: "Sony Bravia XR A80L 65-inch OLED 4K TV",
    Current_Stock: 3,
    Recommended_Order: 5,
    Status: "Low Stock",
    SKU: "SNY-BRAVIA-A80L-65",
    Category: "TVs",
    Price: 2499.99,
    Supplier: "Sony Corporation",
    Location: "Delhi"
  },
  {
    Id: "8",
    Product: "Dyson V15 Detect Absolute Cordless Vacuum",
    Current_Stock: 0,
    Recommended_Order: 8,
    Status: "Out of Stock",
    SKU: "DYS-V15-DETECT",
    Category: "Home Appliances",
    Price: 749.99,
    Supplier: "Dyson Ltd",
    Location: "Ludhiana"
  },
  {
    Id: "9",
    Product: "NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card",
    Current_Stock: 2,
    Recommended_Order: 5,
    Status: "Low Stock",
    SKU: "NV-RTX4090-24G",
    Category: "Computer Components",
    Price: 1599.99,
    Supplier: "NVIDIA Corporation",
    Location: "Chandigarh"
  },
  {
    Id: "10",
    Product: "Amazon Echo Show 10 (3rd Gen)",
    Current_Stock: 15,
    Recommended_Order: 10,
    Status: "In Stock",
    SKU: "AMZN-ECHO10-BLK",
    Category: "Smart Home",
    Price: 249.99,
    Supplier: "Amazon.com, Inc.",
    Location: "Jalandhar"
  },
  {
    Id: "11",
    Product: "Canon EOS R5 Full-Frame Mirrorless Camera",
    Current_Stock: 5,
    Recommended_Order: 3,
    Status: "In Stock",
    SKU: "CAN-EOS-R5",
    Category: "Cameras",
    Price: 3899.99,
    Supplier: "Canon Inc.",
    Location: "Delhi"
  },
  {
    Id: "12",
    Product: "DJI Air 3 Drone Fly More Combo",
    Current_Stock: 2,
    Recommended_Order: 6,
    Status: "Low Stock",
    SKU: "DJI-AIR3-FMC",
    Category: "Drones",
    Price: 1199.99,
    Supplier: "DJI Technology",
    Location: "Chandigarh"
  },
  {
    Id: "13",
    Product: "LG C3 65\" OLED 4K Smart TV",
    Current_Stock: 0,
    Recommended_Order: 7,
    Status: "Out of Stock",
    SKU: "LG-OLED65C3-4K",
    Category: "TVs",
    Price: 1899.99,
    Supplier: "LG Electronics",
    Location: "Jalandhar"
  },
  {
    Id: "14",
    Product: "Apple AirPods Pro (2nd Generation)",
    Current_Stock: 22,
    Recommended_Order: 15,
    Status: "In Stock",
    SKU: "APP-APP-2",
    Category: "Audio",
    Price: 249.99,
    Supplier: "Apple Inc.",
    Location: "Ludhiana"
  },
  {
    Id: "15",
    Product: "Dell XPS 15 (Intel i9, 32GB RAM, 1TB SSD, RTX 4070)",
    Current_Stock: 3,
    Recommended_Order: 5,
    Status: "Low Stock",
    SKU: "DELL-XPS15-i9-32",
    Category: "Laptops",
    Price: 2499.99,
    Supplier: "Dell Inc.",
    Location: "Delhi"
  }
];

// In-memory inventory data cache - in a real app, this would be on a server
let inventoryCache: ExternalInventoryItem[] = [];

const fetchExternalInventory = async (): Promise<ExternalInventoryItem[]> => {
  console.log("Fetching external inventory data from API...");
  
  try {
    // Fetch from the real API
    const response = await fetch("https://inventory-api-hybt.onrender.com/api/inventory");
    
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
      Category: item.Category || "Uncategorized",
      Price: item.Price || 0,
      Supplier: item.Supplier || "Unknown Supplier",
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

const updateExternalInventoryItem = async (item: ExternalInventoryItem): Promise<ExternalInventoryItem> => {
  console.log("Updating item:", item);
  
  try {
    // In a real scenario, we would call the API to update the item
    // const response = await fetch("https://inventory-api-hybt.onrender.com/api/inventory/update", {
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
    // const response = await fetch(`https://inventory-api-hybt.onrender.com/api/inventory/${itemId}`, {
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
    // const response = await fetch("https://inventory-api-hybt.onrender.com/api/inventory", {
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
