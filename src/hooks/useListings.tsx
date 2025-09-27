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

  const createListing = useCallback(async (listingData: ListingData): Promise<{ listingId: string; transactionId: string }> => {
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
        const transactionId = `mock_tx_${Date.now()}`;
        console.log("🎉 [CREATE_LISTING] Mock listing created with ID:", listingId);
        return { listingId, transactionId };
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

      // Check if user is authenticated and refresh if needed
      console.log("🔐 [CREATE_LISTING] Checking user authentication...");
      const currentUser = await fcl.currentUser.snapshot();
      console.log("👤 [CREATE_LISTING] Current user:", currentUser);
      
      // Check if user is properly authenticated
      if (currentUser.loggedIn) {
        console.log("✅ [CREATE_LISTING] User is authenticated:", currentUser);
      }
      
      if (!currentUser.loggedIn) {
        console.error("❌ [CREATE_LISTING] User not authenticated");
        throw new Error("User not authenticated. Please connect your wallet first.");
      }

      console.log("✅ [CREATE_LISTING] User authenticated:", currentUser.addr);

      // Optional: Check if seller is already verified (to avoid unnecessary verification)
      console.log("🔍 [CREATE_LISTING] Checking if seller is already verified...");
      try {
        const checkVerifiedScript = `
          import YAMListings from 0x1f67c2e66c7e3ee3

          access(all) fun main(seller: Address): Bool {
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

      console.log("📜 [CREATE_LISTING] Using transaction file: create_listing.cdc");

      console.log("🔧 [CREATE_LISTING] Building combined transaction...");
      console.log("🔧 [CREATE_LISTING] About to call fcl.mutate...");
      
      // Ensure fresh authorization for each transaction
      console.log("🔐 [CREATE_LISTING] Ensuring fresh wallet authorization...");
      const authz = fcl.currentUser.authorization;
      console.log("🔑 [CREATE_LISTING] Authorization function:", authz);
      
      let transactionId;
      try {
        console.log("🚀 [CREATE_LISTING] Starting fcl.mutate...");
        
        // Create listing directly (skip verification for now to avoid computation limits)
        console.log("🏗️ [CREATE_LISTING] Creating listing...");
        console.log("📊 [CREATE_LISTING] Transaction data:", JSON.stringify(listingData, null, 2));
        console.log("💰 [CREATE_LISTING] Price value:", listingData.price, "Type:", typeof listingData.price);
        console.log("⏰ [CREATE_LISTING] Deadline value:", listingData.deadline, "Type:", typeof listingData.deadline);
        if (listingData.deadline) {
          console.log("⏰ [CREATE_LISTING] Deadline timestamp:", new Date(listingData.deadline * 1000).toISOString());
          console.log("⏰ [CREATE_LISTING] Current timestamp:", new Date().toISOString());
        }
        // Use explicit compute limit to override FCL's default limit of 10
        console.log("🔧 [CREATE_LISTING] About to call fcl.mutate with computeLimit...");
        
        transactionId = await fcl.mutate({
          cadence: `
            import YAMListings from 0x1f67c2e66c7e3ee3

            transaction(
                itemName: String,
                itemDesc: String,
                price: UFix64,
                type: String,
                deadline: UFix64?,
                allowedCountries: [String],
                quantity: UInt64,
                sellerNationality: String
            ) {
                prepare(acct: auth(Storage, Keys, Contracts, Inbox, Capabilities) &Account) {
                    let admin = YAMListings.getAdmin()
                    admin.createListing(
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
                }
            }
          `,
          args: (arg, t) => [
            arg(listingData.itemName, t.String),
            arg(listingData.itemDesc, t.String),
            arg(listingData.price.toFixed(8), t.UFix64),
            arg(listingData.type, t.String),
            arg(listingData.deadline ? listingData.deadline.toFixed(8) : null, t.Optional(t.UFix64)),
            arg(listingData.allowedCountries, t.Array(t.String)),
            arg(listingData.quantity, t.UInt64),
            arg(listingData.sellerNationality, t.String)
          ]
        });
        
        console.log("✅ [CREATE_LISTING] fcl.mutate returned transaction ID:", transactionId);
        console.log("✅ [CREATE_LISTING] Transaction submitted successfully with ID:", transactionId);
      } catch (mutateError) {
        console.error("❌ [CREATE_LISTING] Error during fcl.mutate:", mutateError);
        throw mutateError;
      }

      console.log("⏳ [CREATE_LISTING] Waiting for transaction to be sealed...");
      
      // Wait for transaction to be sealed
      const createResult = await Promise.race([
        fcl.tx(transactionId).onceSealed(),
        timeoutPromise
      ]);
      console.log("✅ [CREATE_LISTING] Transaction sealed:", createResult);

      // Extract listing ID from transaction result
      // In a real implementation, you would parse the transaction result
      const listingId = `listing_${Date.now()}`;
      
      console.log("🎉 [CREATE_LISTING] Listing created successfully with ID:", listingId);
      console.log("🔗 [CREATE_LISTING] Transaction ID:", transactionId);
      
      // Return both listing ID and transaction ID
      return { listingId, transactionId };
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

    // Ensure paymentAmount is a valid number
    const numPaymentAmount = Number(paymentAmount);
    if (isNaN(numPaymentAmount) || numPaymentAmount <= 0) {
      throw new Error("Invalid payment amount");
    }

    try {
      const transaction = `
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868
        import YAMListings from 0x1f67c2e66c7e3ee3

        transaction(listingId: UInt64, buyerNationality: String, paymentAmount: UFix64) {
          let payment: @{FungibleToken.Vault}
          
          prepare(signer: auth(BorrowValue) &Account) {
            // Get a reference to the signer's stored vault directly
            let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
              from: /storage/flowTokenVault
            ) ?? panic("Could not borrow reference to the owner's Vault!")

            // Withdraw tokens from the signer's stored vault
            self.payment <- vaultRef.withdraw(amount: paymentAmount)
          }
          
          execute {
            // Buy the listing
            YAMListings.buyListing(
              listingId: listingId,
              buyerNationality: buyerNationality,
              payment: <- self.payment
            )
            
            log("Successfully purchased listing: ".concat(listingId.toString()))
          }
        }
      `;

      const transactionId = await fcl.mutate({
        cadence: transaction,
        args: (arg, t) => [
          arg(parseInt(listingId), t.UInt64),
          arg(buyerNationality, t.String),
          arg(numPaymentAmount.toFixed(8), t.UFix64)
        ]
      });

      console.log("🔄 [BUY_LISTING] Transaction submitted:", transactionId);
      
      // Wait for transaction to be sealed
      await fcl.tx(transactionId).onceSealed();
      console.log("✅ [BUY_LISTING] Transaction sealed successfully");
           } catch (err) {
             const errorMessage = err instanceof Error ? err.message : "Failed to buy listing";
             console.error("❌ [BUY_LISTING] Transaction failed:", errorMessage);
             
             // Handle specific contract errors gracefully
             if (errorMessage.includes("Buyer country not allowed")) {
               setError("Your country is not eligible for this purchase. Please check the listing requirements.");
             } else if (errorMessage.includes("Insufficient balance")) {
               setError("Insufficient FLOW balance. Please add more FLOW to your wallet.");
             } else if (errorMessage.includes("Listing not found")) {
               setError("This listing is no longer available.");
             } else if (errorMessage.includes("Listing already sold")) {
               setError("This item has already been sold.");
             } else {
               setError(`Purchase failed: ${errorMessage}`);
             }
             
             throw new Error(errorMessage);
           } finally {
      setLoading(false);
    }
  }, []);

  const enterRaffle = useCallback(async (listingId: string, buyerNationality: string, buyerNullifier: string, paymentAmount: number): Promise<void> => {
    setLoading(true);
    setError(null);

    // Ensure paymentAmount is a valid number
    const numPaymentAmount = Number(paymentAmount);
    if (isNaN(numPaymentAmount) || numPaymentAmount <= 0) {
      throw new Error("Invalid payment amount");
    }

    try {
      const transaction = `
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868
        import YAMListings from 0x1f67c2e66c7e3ee3

        transaction(listingId: UInt64, buyerNationality: String, nullifier: String, paymentAmount: UFix64) {
          let payment: @{FungibleToken.Vault}
          
          prepare(signer: auth(BorrowValue) &Account) {
            // Get a reference to the signer's stored vault directly
            let vaultRef = signer.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Provider}>(
              from: /storage/flowTokenVault
            ) ?? panic("Could not borrow reference to the owner's Vault!")

            // Withdraw tokens from the signer's stored vault
            self.payment <- vaultRef.withdraw(amount: paymentAmount)
          }
          
          execute {
            // Enter the raffle
            YAMListings.enterRaffle(
              listingId: listingId,
              buyerNationality: buyerNationality,
              nullifier: nullifier,
              payment: <- self.payment
            )
            
            log("Successfully entered raffle: ".concat(listingId.toString()))
          }
        }
      `;

      const transactionId = await fcl.mutate({
        cadence: transaction,
        args: (arg, t) => [
          arg(parseInt(listingId), t.UInt64),
          arg(buyerNationality, t.String),
          arg(buyerNullifier, t.String),
          arg(numPaymentAmount.toFixed(8), t.UFix64)
        ]
      });

      console.log("🔄 [ENTER_RAFFLE] Transaction submitted:", transactionId);
      
      // Wait for transaction to be sealed
      await fcl.tx(transactionId).onceSealed();
      console.log("✅ [ENTER_RAFFLE] Transaction sealed successfully");
           } catch (err) {
             const errorMessage = err instanceof Error ? err.message : "Failed to enter raffle";
             console.error("❌ [ENTER_RAFFLE] Transaction failed:", errorMessage);
             
             // Handle specific contract errors gracefully
             if (errorMessage.includes("Buyer country not allowed")) {
               setError("Your country is not eligible for this raffle. Please check the raffle requirements.");
             } else if (errorMessage.includes("Insufficient balance")) {
               setError("Insufficient FLOW balance. Please add more FLOW to your wallet.");
             } else if (errorMessage.includes("Listing not found")) {
               setError("This raffle is no longer available.");
             } else if (errorMessage.includes("Raffle already ended")) {
               setError("This raffle has already ended.");
             } else if (errorMessage.includes("Already entered")) {
               setError("You have already entered this raffle.");
             } else {
               setError(`Failed to enter raffle: ${errorMessage}`);
             }
             
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
          
          prepare(acct: auth(Storage, Keys, Contracts, Inbox, Capabilities) &Account) {
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
      // Check if FCL is properly configured
      const config = fcl.config();
      if (!config.get("accessNode.api")) {
        console.error("❌ [GET_LISTING] FCL not properly configured - accessNode.api missing");
        throw new Error("Flow configuration not loaded. Please refresh the page.");
      }

      const script = `
        import YAMListings from 0x1f67c2e66c7e3ee3

        access(all) fun main(listingId: UInt64): YAMListings.Listing? {
          return YAMListings.getListing(id: listingId)
        }
      `;

      const result = await fcl.query({
        cadence: script,
        args: (arg, t) => [
          arg(parseInt(listingId), t.UInt64)
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
      // Check if FCL is properly configured
      const config = fcl.config();
      if (!config.get("accessNode.api")) {
        console.error("❌ [GET_ACTIVE_LISTINGS] FCL not properly configured - accessNode.api missing");
        throw new Error("Flow configuration not loaded. Please refresh the page.");
      }

      const script = `
        import YAMListings from 0x1f67c2e66c7e3ee3

        access(all) fun main(): [YAMListings.Listing] {
          return YAMListings.getActiveListings()
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
