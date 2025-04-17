
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
}

interface ExternalInventoryResponse {
  status: string;
  count: number;
  inventory: ExternalInventoryItem[];
}

const mockInventoryData: ExternalInventoryItem[] = [
  {
    Product: "Apple MacBook Air M3 (16GB RAM, 512GB SSD)",
    Current_Stock: 12,
    Recommended_Order: 8,
    Status: "In Stock",
    SKU: "APP-MBA-M3-16-512",
    Category: "Laptops",
    Price: 1499.99,
    Supplier: "Apple Inc.",
    Location: "Delhi"
  },
  {
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
    Product: "HP Spectre x360 14 (Intel i7, 16GB RAM, 1TB SSD)",
    Current_Stock: 8,
    Recommended_Order: 5,
    Status: "In Stock",
    SKU: "HP-SPX360-14-i7",
    Category: "Laptops",
    Price: 1499.99,
    Supplier: "HP Inc.",
    Location: "Jalandhar"
  },
  {
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
    Product: "LG C3 65\" OLED 4K Smart TV",
    Current_Stock: 3,
    Recommended_Order: 5,
    Status: "Low Stock",
    SKU: "LG-OLED65C3-4K",
    Category: "TVs",
    Price: 1799.99,
    Supplier: "LG Electronics",
    Location: "Delhi"
  },
  {
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
    Product: "NVIDIA GeForce RTX 4090 Graphics Card",
    Current_Stock: 2,
    Recommended_Order: 5,
    Status: "Low Stock",
    SKU: "NV-RTX4090-FE",
    Category: "Computer Components",
    Price: 1599.99,
    Supplier: "NVIDIA Corporation",
    Location: "Chandigarh"
  },
  {
    Product: "Amazon Echo Show 10 (3rd Gen)",
    Current_Stock: 15,
    Recommended_Order: 10,
    Status: "In Stock",
    SKU: "AMZN-ECHO10-BLK",
    Category: "Smart Home",
    Price: 249.99,
    Supplier: "Amazon.com, Inc.",
    Location: "Jalandhar"
  }
];

const fetchExternalInventory = async (): Promise<ExternalInventoryItem[]> => {
  try {
    // Attempt to fetch from the real API first
    const response = await fetch("https://inventory-api-hybt.onrender.com/api/inventory");
    
    if (!response.ok) {
      console.warn("API request failed, falling back to mock data");
      return mockInventoryData;
    }
    
    const data: ExternalInventoryResponse = await response.json();
    
    // If the API returns empty or limited data, enhance it with our mock data
    if (!data.inventory || data.inventory.length <= 1) {
      console.info("Enhancing API data with mock inventory items");
      return mockInventoryData;
    }
    
    return data.inventory;
  } catch (error) {
    console.error("Error fetching external inventory:", error);
    console.info("Falling back to mock inventory data");
    return mockInventoryData;
  }
};

// This function would normally send data to the API,
// but for demo purposes we'll just log it and simulate success
const updateExternalInventoryItem = async (item: ExternalInventoryItem): Promise<ExternalInventoryItem> => {
  console.log("Updating item:", item);
  // In a real scenario, we would call the API to update the item
  // const response = await fetch("https://inventory-api-hybt.onrender.com/api/inventory/update", {
  //   method: "PUT",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(item)
  // });
  // if (!response.ok) throw new Error("Failed to update inventory item");
  // return response.json();
  
  // For demo, return the modified item directly
  return item;
};

export function useExternalInventory() {
  return useQuery({
    queryKey: ['external-inventory'],
    queryFn: fetchExternalInventory,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
