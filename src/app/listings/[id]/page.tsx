"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import { useFlow } from "@/hooks/useFlow";
import { useListings } from "@/hooks/useListings";
import SelfXYZButton from "@/components/SelfXYZButton";
import WalletConnect from "@/components/WalletConnect";

// Helper function to generate placeholder image based on listing data
const getPlaceholderImage = (title: string) => {
  return `https://placehold.co/800x600/purple/orange/png?text=${encodeURIComponent(title)}`;
};

interface ListingPageProps {
  params: {
    id: string;
  };
}

export default function ListingDetailPage({ params }: ListingPageProps) {
  const { isLoggedIn, verification } = useSelfXYZContext();
  const { isConnected, connectWallet, loading: walletLoading } = useFlow();
  const { buyListing, enterRaffle, getListing } = useListings();
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load listing data from blockchain
  useEffect(() => {
    const loadListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const resolvedParams = await params;
        const listingId = resolvedParams.id;
        console.log("🔄 [LISTING_DETAIL] Loading listing:", listingId);
        
        const listingData = await getListing(listingId);
        if (listingData) {
          // Check if listing is still active
          if (!listingData.isActive) {
            setError("This item has been sold and is no longer available");
          } else {
            setListing(listingData);
            console.log("✅ [LISTING_DETAIL] Loaded listing:", listingData);
          }
        } else {
          setError("Listing not found");
        }
      } catch (err) {
        console.error("❌ [LISTING_DETAIL] Failed to load listing:", err);
        setError(err instanceof Error ? err.message : "Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [params, getListing]); // Use params directly as dependency

  const handlePurchase = async () => {
    if (!listing) {
      alert("Listing not loaded");
      return;
    }

    if (!isLoggedIn) {
      alert("Please verify your identity with Self.xyz first");
      return;
    }

    if (!isConnected) {
      try {
        await connectWallet();
      } catch {
        alert("Failed to connect wallet. Please try again.");
        return;
      }
    }

    setTransactionLoading(true);
    try {
      const buyerNationality = verification.country;
      const buyerNullifier = verification.nullifier || "";
      
      if (!buyerNationality) {
        alert("Please verify your nationality with Self.xyz first");
        setTransactionLoading(false);
        return;
      }
      
      console.log("🛒 [LISTING_DETAIL] Starting purchase:", {
        listingId: listing.id,
        type: listing.type,
        price: listing.price,
        buyerNationality,
        buyerNullifier
      });
      
      if (listing.type === "raffle") {
        await enterRaffle(listing.id, buyerNationality, buyerNullifier, Number(listing.price));
        alert("Successfully entered raffle!");
      } else {
        await buyListing(listing.id, buyerNationality, Number(listing.price));
        alert("Purchase successful!");
      }
    } catch (error) {
      console.error("❌ [LISTING_DETAIL] Purchase failed:", error);
      alert(`Transaction failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setTransactionLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Loading listing...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error: {error || "Listing not found"}</div>
          <Link href="/buy" className="text-purple-600 hover:underline">
            ← Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🍠</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">YAM</span>
            </Link>
            <div className="flex space-x-6 items-center">
              <Link href="/buy" className="text-gray-600 hover:text-purple-600 transition-colors">
                Buy
              </Link>
              <Link href="/sell" className="text-gray-600 hover:text-purple-600 transition-colors">
                Sell
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-purple-600 transition-colors">
                Profile
              </Link>
              <SelfXYZButton />
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <img
              src={listing.image || getPlaceholderImage(listing.itemName || listing.title)}
              alt={listing.itemName || listing.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{listing.itemName || listing.title}</h1>
                {listing.type === 'raffle' && (
                  <div className="bg-orange-100 text-orange-800 text-sm px-2 py-1 rounded-full">
                    🎰 Raffle
                  </div>
                )}
                {listing.type === 'direct' && (
                  <div className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full">
                    ⚡ Direct Purchase
                  </div>
                )}
                {listing.sellerVerified && (
                  <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <span>✓</span>
                    <span>Verified Seller</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-lg">{listing.itemDesc || listing.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Address:</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded text-black">
                  {listing.seller}
                </code>
              </div>
            </div>

            {/* Listing Specific Info */}
            {listing.type === 'raffle' && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Raffle Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Participants: {listing.participants?.length || 0}</span>
                    <span>1 winner</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-orange-500 h-3 rounded-full w-full"></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {listing.deadline ? `Ends: ${new Date(listing.deadline * 1000).toLocaleDateString()} at ${new Date(listing.deadline * 1000).toLocaleTimeString()}` : 'No deadline set'}
                  </div>
                </div>
              </div>
            )}

            {listing.type === 'direct' && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Purchase Details</h3>
                <div className="text-sm text-gray-600">
                  {listing.isActive ? (
                    <span className="text-green-600">✓ In Stock - Ready to ship</span>
                  ) : (
                    <span className="text-red-600">✗ Out of Stock</span>
                  )}
                </div>
              </div>
            )}

            {/* Purchase Section */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold">{listing.price} FLOW</div>
                  <div className="text-purple-100">
                    {listing.type === 'raffle' ? 'per raffle entry' : 'total price'}
                  </div>
                </div>
                {listing.type === 'raffle' && listing.deadline && (
                  <div className="text-right">
                    <div className="text-sm opacity-90">Time remaining</div>
                    <div className="font-semibold">
                      {Math.max(0, Math.floor((listing.deadline * 1000 - Date.now()) / (1000 * 60 * 60)))}h {Math.max(0, Math.floor(((listing.deadline * 1000 - Date.now()) % (1000 * 60 * 60)) / (1000 * 60)))}m
                    </div>
                  </div>
                )}
              </div>

              {!isLoggedIn ? (
                <div className="space-y-3">
                  <div className="text-center text-purple-100 text-sm">
                    🔐 Self.xyz verification required to {listing.type === 'raffle' ? 'enter raffle' : 'purchase'}
                  </div>
                  <button
                    className="w-full bg-white/20 border border-white/30 text-white hover:bg-white/30 font-semibold px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 cursor-not-allowed opacity-60"
                    disabled
                  >
                    {listing.type === 'raffle' ? '🎰 Enter Raffle' : '⚡ Buy Now'}
                  </button>
                </div>
              ) : (
                <button
                  className="w-full bg-white text-purple-600 hover:bg-gray-50 font-semibold px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handlePurchase}
                  disabled={transactionLoading || walletLoading}
                >
                  {transactionLoading ? "Processing..." :
                   !isConnected ? "🔗 Connect Wallet to Continue" :
                   listing.type === 'raffle' ? '🎰 Enter Raffle' : '⚡ Buy Now'}
                </button>
              )}

              <div className="text-sm text-purple-100 text-center mt-3">
                {listing.type === 'raffle'
                  ? 'One verified entry per person • Self.xyz identity required'
                  : 'Secure transaction via Flow blockchain • Instant delivery'
                }
              </div>
            </div>

            {/* Terms */}
            <div className="text-sm text-gray-500 space-y-1">
              {listing.type === 'raffle' ? (
                <>
                  <p>• Winners are selected randomly after the raffle ends</p>
                  <p>• Funds are held in escrow until winner is selected</p>
                  <p>• Non-winners receive full refunds automatically</p>
                  <p>• Seller verification ensures legitimacy</p>
                </>
              ) : (
                <>
                  <p>• Instant purchase with immediate transfer</p>
                  <p>• Funds held in escrow until delivery confirmation</p>
                  <p>• Full refund available if item doesn&apos;t match description</p>
                  <p>• Seller verification ensures legitimacy</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
