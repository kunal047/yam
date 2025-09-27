"use client";

import { useState, useCallback } from "react";
import * as fcl from "@onflow/fcl";

export interface ListingData {
  itemName: string;
  itemDesc: string;
  price: number;
  type: "direct" | "raffle";
  deadline?: number;
  allowedCountries: string[];
  quantity: number;
  sellerNationality: string;
  sellerNullifier: string;
}

export interface Listing {
  id: string;
  seller: string;
  itemName: string;
  itemDesc: string;
  price: number;
  type: "direct" | "raffle";
  deadline?: number;
  participants: string[];
  allowedCountries: string[];
  quantity: number;
  sellerNationality: string;
  createdAt: number;
  isActive: boolean;
}

export function useListings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListing = useCallback(async (listingData: ListingData): Promise<string> => {
    console.log("🚀 [CREATE_LISTING] Starting listing creation process");
    console.log("📋 [CREATE_LISTING] Input data:", JSON.stringify(listingData, null, 2));
    
    setLoading(true);
    setError(null);

    // Mock mode for testing - bypass Flow transactions
    const MOCK_MODE = false; // Temporarily disabled to test real transactions
    
    if (MOCK_MODE) {
      console.log("🎭 [CREATE_LISTING] Running in MOCK MODE - bypassing Flow transactions");
      try {
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const listingId = `mock_listing_${Date.now()}`;
        console.log("🎉 [CREATE_LISTING] Mock listing created with ID:", listingId);
        return listingId;
      } catch (err) {
        console.error("❌ [CREATE_LISTING] Mock error:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    }

    try {
      // Create a timeout promise to prevent hanging (increased to 60 seconds for Flow testnet)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.error("⏰ [CREATE_LISTING] Transaction timeout after 60 seconds");
          reject(new Error("Transaction timeout after 60 seconds. Please check your wallet and try again."));
        }, 60000);
      });

      // Check if user is authenticated
      console.log("🔐 [CREATE_LISTING] Checking user authentication...");
      const currentUser = await fcl.currentUser.snapshot();
      console.log("👤 [CREATE_LISTING] Current user:", currentUser);
      
      if (!currentUser.loggedIn) {
        throw new Error("User not authenticated");
      }

      // Optional: Check if seller is already verified (to avoid unnecessary verification)
      console.log("🔍 [CREATE_LISTING] Checking if seller is already verified...");
      try {
        const checkVerifiedScript = `
          import YAMListings from 0x1f67c2e66c7e3ee3

          pub fun main(seller: Address): Bool {
            return YAMListings.isSellerVerified(seller: seller)
          }
        `;

        const isVerified = await fcl.query({
          cadence: checkVerifiedScript,
          args: (arg, t) => [
            arg(currentUser.addr || "", t.Address)
          ]
        });
        
        console.log("✅ [CREATE_LISTING] Seller verification status:", isVerified);
      } catch (err) {
        console.log("⚠️ [CREATE_LISTING] Could not check verification status, proceeding anyway:", err);
      }

      // Create a single transaction that both verifies the seller and creates the listing
      console.log("🏗️ [CREATE_LISTING] Starting combined verification and listing creation...");
      console.log("📝 [CREATE_LISTING] Transaction params:", {
        itemName: listingData.itemName,
        itemDesc: listingData.itemDesc,
        price: listingData.price,
        type: listingData.type,
        deadline: listingData.deadline,
        allowedCountries: listingData.allowedCountries,
        quantity: listingData.quantity,
        sellerNationality: listingData.sellerNationality,
        sellerNullifier: listingData.sellerNullifier
      });

      const createListingTransaction = `
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868
        import YAMListings from 0x1f67c2e66c7e3ee3

        transaction(
          itemName: String,
          itemDesc: String,
          price: UFix64,
          type: String,
          deadline: UFix64?,
          allowedCountries: [String],
          quantity: UInt64,
          sellerNationality: String,
          sellerNullifier: String
        ) {
          let listingId: UInt64
          
          prepare(acct: AuthAccount) {
            // No special preparation needed
          }
          
          execute {
            // First verify the seller
            YAMListings.verifySeller(
              nationality: sellerNationality,
              nullifier: sellerNullifier,
              seller: acct.address
            )
            
            // Then create the listing using contract's admin resource
            let admin = YAMListings.getAdmin()
            self.listingId = admin.createListing(
              itemName: itemName,
              itemDesc: itemDesc,
              price: price,
              type: type,
              deadline: deadline,
              allowedCountries: allowedCountries,
              quantity: quantity,
              sellerNationality: sellerNationality,
              seller: acct.address
            )
            
            log("Listing created with ID: ".concat(self.listingId.toString()))
          }
        }
      `;

      console.log("📜 [CREATE_LISTING] Combined transaction cadence:", createListingTransaction);

      console.log("🔧 [CREATE_LISTING] Building combined transaction...");
      const createPromise = fcl.mutate({
        cadence: createListingTransaction,
        args: (arg, t) => [
          arg(listingData.itemName, t.String),
          arg(listingData.itemDesc, t.String),
          arg(listingData.price.toFixed(2), t.UFix64),
          arg(listingData.type, t.String),
          arg(listingData.deadline ? listingData.deadline.toString() : null, t.Optional(t.UFix64)),
          arg(listingData.allowedCountries, t.Array(t.String)),
          arg(listingData.quantity.toString(), t.UInt64),
          arg(listingData.sellerNationality, t.String),
          arg(listingData.sellerNullifier, t.String)
        ]
      });
      console.log("🔧 [CREATE_LISTING] Combined transaction built, starting execution...");

      console.log("⏳ [CREATE_LISTING] Waiting for combined transaction...");
      console.log("🔍 [CREATE_LISTING] About to start Promise.race for combined transaction...");
      
      const createResult = await Promise.race([createPromise, timeoutPromise]);
      console.log("✅ [CREATE_LISTING] Combined transaction completed:", createResult);

      // Extract listing ID from transaction result
      // In a real implementation, you would parse the transaction result
      const listingId = `listing_${Date.now()}`;
      
      console.log("🎉 [CREATE_LISTING] Listing created successfully with ID:", listingId);
      return listingId;
    } catch (err) {
      console.error("❌ [CREATE_LISTING] Error occurred:", err);
      console.error("❌ [CREATE_LISTING] Error stack:", err instanceof Error ? err.stack : "No stack trace");
      console.error("❌ [CREATE_LISTING] Error type:", typeof err);
      console.error("❌ [CREATE_LISTING] Error constructor:", err?.constructor?.name);
      
      let errorMessage = err instanceof Error ? err.message : "Failed to create listing";
      
      // Provide more helpful error messages for common issues
      if (errorMessage.includes("Transaction timeout")) {
        errorMessage = "Transaction is taking too long. Please check your wallet connection and try again.";
      } else if (errorMessage.includes("Nullifier already used")) {
        errorMessage = "This identity has already been used. Please use a different Self.xyz verification.";
      } else if (errorMessage.includes("User not authenticated")) {
        errorMessage = "Please connect your wallet and verify your identity with Self.xyz.";
      } else if (errorMessage.includes("Insufficient balance")) {
        errorMessage = "Insufficient Flow tokens. Please add tokens to your wallet.";
      } else if (errorMessage.includes("Admin resource not found")) {
        errorMessage = "Contract not properly deployed. Please contact support.";
      }
      
      console.error("❌ [CREATE_LISTING] Final error message:", errorMessage);
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      console.log("🏁 [CREATE_LISTING] Process completed, setting loading to false");
      setLoading(false);
    }
  }, []);

  const buyListing = useCallback(async (listingId: string, buyerNationality: string, paymentAmount: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const transaction = `
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868
        import YAMListings from 0x1f67c2e66c7e3ee3

        transaction(listingId: UInt64, buyerNationality: String, paymentAmount: UFix64) {
          let buyerVault: &FlowToken.Vault
          let payment: @FungibleToken.Vault
          
          prepare(acct: AuthAccount) {
            // Get buyer's Flow token vault
            self.buyerVault = acct.borrow<&FlowToken.Vault>(from: FlowToken.VaultStoragePath)
              ?? panic("Flow token vault not found")
            
            // Withdraw payment amount from buyer's vault
            self.payment <- self.buyerVault.withdraw(amount: paymentAmount)
          }
          
          execute {
            // Buy the listing
            Listings.buyListing(
              listingId: listingId,
              buyerNationality: buyerNationality,
              payment: <- self.payment
            )
            
            log("Successfully purchased listing: ".concat(listingId.toString()))
          }
        }
      `;

      await fcl.mutate({
        cadence: transaction,
        args: (arg, t) => [
          arg(listingId, t.UInt64),
          arg(buyerNationality, t.String),
          arg(paymentAmount.toFixed(2), t.UFix64)
        ]
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to buy listing";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const enterRaffle = useCallback(async (listingId: string, buyerNationality: string, buyerNullifier: string, paymentAmount: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const transaction = `
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868
        import YAMListings from 0x1f67c2e66c7e3ee3

        transaction(listingId: UInt64, buyerNationality: String, nullifier: String, paymentAmount: UFix64) {
          let buyerVault: &FlowToken.Vault
          let payment: @FungibleToken.Vault
          
          prepare(acct: AuthAccount) {
            // Get buyer's Flow token vault
            self.buyerVault = acct.borrow<&FlowToken.Vault>(from: FlowToken.VaultStoragePath)
              ?? panic("Flow token vault not found")
            
            // Withdraw payment amount from buyer's vault
            self.payment <- self.buyerVault.withdraw(amount: paymentAmount)
          }
          
          execute {
            // Enter the raffle
            Listings.enterRaffle(
              listingId: listingId,
              buyerNationality: buyerNationality,
              nullifier: nullifier,
              payment: <- self.payment
            )
            
            log("Successfully entered raffle: ".concat(listingId.toString()))
          }
        }
      `;

      await fcl.mutate({
        cadence: transaction,
        args: (arg, t) => [
          arg(listingId, t.UInt64),
          arg(buyerNationality, t.String),
          arg(buyerNullifier, t.String),
          arg(paymentAmount.toFixed(2), t.UFix64)
        ]
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to enter raffle";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const pickWinners = useCallback(async (listingId: string): Promise<string[]> => {
    setLoading(true);
    setError(null);

    try {
      const transaction = `
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868
        import YAMListings from 0x1f67c2e66c7e3ee3

        transaction(listingId: UInt64) {
          let winners: [Address]
          let winnerVault: &FlowToken.Vault
          let payment: @FungibleToken.Vault
          
          prepare(acct: AuthAccount) {
            // Get winner's Flow token vault
            self.winnerVault = acct.borrow<&FlowToken.Vault>(from: FlowToken.VaultStoragePath)
              ?? panic("Flow token vault not found")
          }
          
          execute {
            // Pick winners for the raffle
            self.winners = Listings.pickWinners(listingId: listingId)
            
            // Transfer escrow to winner (assuming caller is the winner)
            let winner = self.winners[0]
            let listing = Listings.getListing(id: listingId)
            
            if listing != nil {
              self.payment <- Listings.transferToWinner(
                listingId: listingId,
                winner: winner,
                amount: listing!.price
              )
            }
            
            // Deposit payment into winner's vault
            self.winnerVault.deposit(from: <- self.payment)
            
            log("Winners picked for raffle: ".concat(listingId.toString()))
            log("Winner: ".concat(winner.toString()))
          }
        }
      `;

      await fcl.mutate({
        cadence: transaction,
        args: (arg, t) => [
          arg(listingId, t.UInt64)
        ]
      });

      // Return winner addresses (in a real implementation, you'd parse this from the transaction result)
      return [`winner_${listingId}`];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to pick winners";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getListing = useCallback(async (listingId: string): Promise<Listing | null> => {
    try {
      const script = `
        import YAMListings from 0x1f67c2e66c7e3ee3

        pub fun main(listingId: UInt64): Listings.Listing? {
          return Listings.getListing(id: listingId)
        }
      `;

      const result = await fcl.query({
        cadence: script,
        args: (arg, t) => [
          arg(listingId, t.UInt64)
        ]
      });

      return result;
    } catch (err) {
      console.error("Failed to get listing:", err);
      return null;
    }
  }, []);

  const getActiveListings = useCallback(async (): Promise<Listing[]> => {
    try {
      const script = `
        import YAMListings from 0x1f67c2e66c7e3ee3

        pub fun main(): [Listings.Listing] {
          return Listings.getActiveListings()
        }
      `;

      const result = await fcl.query({
        cadence: script
      });

      return result || [];
    } catch (err) {
      console.error("Failed to get active listings:", err);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    createListing,
    buyListing,
    enterRaffle,
    pickWinners,
    getListing,
    getActiveListings
  };
}
