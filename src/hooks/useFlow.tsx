"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";

export interface FlowUser {
  addr: string | null;
  loggedIn: boolean;
  cid?: string;
}

export function useFlow() {
  const [user, setUser] = useState<FlowUser>({ addr: null, loggedIn: false });
  const [loading, setLoading] = useState(false);
  const { isLoggedIn: isSelfVerified } = useSelfXYZContext();

  useEffect(() => {
    // Subscribe to user state changes
    fcl.currentUser().subscribe((user: { addr?: string; loggedIn?: boolean; cid?: string }) => {
      setUser({
        addr: user.addr || null,
        loggedIn: user.loggedIn || false,
        cid: user.cid
      });
    });
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      await fcl.authenticate();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setLoading(true);
    try {
      await fcl.unauthenticate();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const canConnectWallet = true; // Allow wallet connection without Self.xyz verification

  return {
    user,
    loading,
    connectWallet,
    disconnectWallet,
    isConnected: user.loggedIn,
    canConnectWallet,
    isSelfVerified,
  };
}
