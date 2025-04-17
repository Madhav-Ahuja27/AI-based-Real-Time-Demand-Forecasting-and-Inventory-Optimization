
import { useQuery } from "@tanstack/react-query";

interface ExternalInventoryItem {
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

export function useExternalInventory() {
  return useQuery({
    queryKey: ['external-inventory'],
    queryFn: fetchExternalInventory,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
