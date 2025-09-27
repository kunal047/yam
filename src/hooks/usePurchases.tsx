"use client";

import { useState } from "react";

export interface DirectPurchase {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  seller: string;
  verified: boolean;
  status: "available" | "sold" | "cancelled";
  category: string;
}

// Mock data - replace with real contract calls
const mockPurchases: DirectPurchase[] = [
  {
    id: "1",
    title: "Wireless Headphones",
    description: "High-quality noise cancelling wireless headphones",
    price: 150,
    image: "https://placehold.co/400x300/purple/orange/png?text=Headphones",
    seller: "0x1234...abcd",
    verified: true,
    status: "available",
    category: "Electronics",
  },
  {
    id: "2",
    title: "Designer Watch",
    description: "Luxury timepiece with premium materials",
    price: 300,
    image: "https://placehold.co/400x300/purple/orange/png?text=Watch",
    seller: "0x5678...efgh",
    verified: false,
    status: "available",
    category: "Fashion",
  },
];

export function usePurchases() {
  const [purchases, setPurchases] = useState<DirectPurchase[]>(mockPurchases);
  const [loading, setLoading] = useState(false);

  const buyItem = async (itemId: string) => {
    setLoading(true);
    try {
      // Mock transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      setPurchases(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, status: "sold" as const }
            : item
        )
      );

      return { success: true, txId: `mock_purchase_${Date.now()}` };
    } catch (error) {
      console.error("Failed to purchase item:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getPurchaseById = (id: string): DirectPurchase | undefined => {
    return purchases.find(item => item.id === id);
  };

  return {
    purchases,
    loading,
    buyItem,
    getPurchaseById,
  };
}
