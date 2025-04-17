
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ExternalInventoryItem {
  Product: string;
  Current_Stock: number;
  Recommended_Order: number;
  Status: string;
}

interface ExternalInventoryResponse {
  status: string;
  count: number;
  inventory: ExternalInventoryItem[];
}

const fetchExternalInventory = async (): Promise<ExternalInventoryItem[]> => {
  try {
    const response = await fetch("https://inventory-api-hybt.onrender.com/api/inventory");
    if (!response.ok) {
      throw new Error("Failed to fetch external inventory data");
    }
    const data: ExternalInventoryResponse = await response.json();
    return data.inventory;
  } catch (error) {
    console.error("Error fetching external inventory:", error);
    throw error;
  }
};

// This function would normally send data to the API,
// but for demo purposes we'll just log it
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
