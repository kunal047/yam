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
    setLoading(true);
    setError(null);

    try {
      // First verify the seller with Self.xyz nationality and nullifier
      const verifySellerTransaction = `
        import Listings from 0x1f67c2e66c7e3ee3

        transaction(nationality: String, nullifier: String) {
          execute {
            Listings.verifySeller(nationality: nationality, nullifier: nullifier)
          }
        }
      `;

      await fcl.mutate({
        cadence: verifySellerTransaction,
        args: (arg, t) => [
          arg(listingData.sellerNationality, t.String),
          arg(listingData.sellerNullifier, t.String)
        ]
      });

      // Then create the listing using admin resource
      const createListingTransaction = `
        import FungibleToken from 0x9a0766d93b6608b7
        import FlowToken from 0x7e60df042a9c0868
        import Listings from 0x1f67c2e66c7e3ee3

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
          let admin: &Listings.Admin
          let listingId: UInt64
          
          prepare(acct: AuthAccount) {
            // Get admin resource from account storage
            self.admin = acct.borrow<&Listings.Admin>(from: Listings.AdminStoragePath)
              ?? panic("Admin resource not found")
          }
          
          execute {
            // Create listing using admin resource
            self.listingId = self.admin.createListing(
              itemName: itemName,
              itemDesc: itemDesc,
              price: price,
              type: type,
              deadline: deadline,
              allowedCountries: allowedCountries,
              quantity: quantity,
              sellerNationality: sellerNationality,
              seller: self.admin.account.address
            )
            
            log("Listing created with ID: ".concat(self.listingId.toString()))
          }
        }
      `;

      const result = await fcl.mutate({
        cadence: createListingTransaction,
        args: (arg, t) => [
          arg(listingData.itemName, t.String),
          arg(listingData.itemDesc, t.String),
          arg(listingData.price.toFixed(2), t.UFix64),
          arg(listingData.type, t.String),
          arg(listingData.deadline ? listingData.deadline.toString() : null, t.Optional(t.UFix64)),
          arg(listingData.allowedCountries, t.Array(t.String)),
          arg(listingData.quantity.toString(), t.UInt64),
          arg(listingData.sellerNationality, t.String)
        ]
      });

      // Extract listing ID from transaction result
      // In a real implementation, you would parse the transaction result
      const listingId = `listing_${Date.now()}`;
      
      return listingId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create listing";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
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
        import Listings from 0x1f67c2e66c7e3ee3

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
        import Listings from 0x1f67c2e66c7e3ee3

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
        import Listings from 0x1f67c2e66c7e3ee3

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
        import Listings from 0x1f67c2e66c7e3ee3

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
        import Listings from 0x1f67c2e66c7e3ee3

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
