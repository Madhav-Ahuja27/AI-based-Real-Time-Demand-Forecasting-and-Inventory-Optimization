
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
    Product: "Apple MacBook Air M2 (8GB RAM, 256GB SSD)",
    Current_Stock: 15,
    Recommended_Order: 5,
    Status: "In Stock",
    SKU: "APP-MBA-M2-01",
    Category: "Laptops",
    Price: 999.99,
    Supplier: "Apple Inc.",
    Location: "Delhi"
  },
  {
    Product: "Samsung Galaxy S23 Ultra (12GB RAM, 256GB)",
    Current_Stock: 8,
    Recommended_Order: 10,
    Status: "Low Stock",
    SKU: "SAM-GS23U-01",
    Category: "Smartphones",
    Price: 1199.99,
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
    Product: "HP 15, AMD Ryzen 5 7520U (8GB LPDDR5, 512GB SSD)",
    Current_Stock: 10,
    Recommended_Order: 5,
    Status: "In Stock",
    SKU: "HP-15S-FC0155AU",
    Category: "Laptops",
    Price: 649.99,
    Supplier: "HP Inc.",
    Location: "Jalandhar"
  },
  {
    Product: "Apple iPad Pro 12.9-inch (M2, Wi-Fi, 256GB)",
    Current_Stock: 6,
    Recommended_Order: 8,
    Status: "Low Stock",
    SKU: "APP-IPP-M2-01",
    Category: "Tablets",
    Price: 1099.99,
    Supplier: "Apple Inc.",
    Location: "Delhi"
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
