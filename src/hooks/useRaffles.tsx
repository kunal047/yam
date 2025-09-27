"use client";

import { useState, useEffect } from "react";

export interface Raffle {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  entries: number;
  maxEntries: number;
  endTime: Date;
  seller: string;
  verified: boolean;
  status: "active" | "ended" | "cancelled";
}

export interface RaffleEntry {
  userAddress: string;
  timestamp: Date;
  verified: boolean;
}

// Mock data - replace with real contract calls
const mockRaffles: Raffle[] = [
  {
    id: "1",
    title: "iPhone 15 Pro Max",
    description: "Latest iPhone with all premium features",
    price: 50,
    image: "https://placehold.co/400x300/purple/orange/png?text=iPhone",
    entries: 234,
    maxEntries: 1000,
    endTime: new Date(Date.now() + 86400000),
    seller: "0x1234...abcd",
    verified: true,
    status: "active",
  },
  {
    id: "2",
    title: "MacBook Pro M3",
    description: "Powerful laptop for creators and developers",
    price: 100,
    image: "https://placehold.co/400x300/purple/orange/png?text=MacBook",
    entries: 89,
    maxEntries: 500,
    endTime: new Date(Date.now() + 172800000),
    seller: "0x5678...efgh",
    verified: true,
    status: "active",
  },
];

export function useRaffles() {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching raffles from blockchain
    const fetchRaffles = async () => {
      setLoading(true);
      try {
        // Mock API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRaffles(mockRaffles);
      } catch (error) {
        console.error("Failed to fetch raffles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, []);

  const enterRaffle = async (raffleId: string) => {
    try {
      // Mock transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local state
      setRaffles(prev =>
        prev.map(raffle =>
          raffle.id === raffleId
            ? { ...raffle, entries: raffle.entries + 1 }
            : raffle
        )
      );

      return { success: true, txId: `mock_tx_${Date.now()}` };
    } catch (error) {
      console.error("Failed to enter raffle:", error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    }
  };

  const getRaffleById = (id: string): Raffle | undefined => {
    return raffles.find(raffle => raffle.id === id);
  };

  return {
    raffles,
    loading,
    enterRaffle,
    getRaffleById,
  };
}
