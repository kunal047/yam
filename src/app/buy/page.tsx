"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import { useFlow } from "@/hooks/useFlow";
import { useListings } from "@/hooks/useListings";
import SelfXYZButton from "@/components/SelfXYZButton";
import WalletConnect from "@/components/WalletConnect";
import Button from "@/components/Button";

// Helper function to generate placeholder image based on listing data
const getPlaceholderImage = (title: string) => {
  return `https://placehold.co/400x300/purple/orange/png?text=${encodeURIComponent(title)}`;
};

export default function BuyPage() {
  const { isLoggedIn } = useSelfXYZContext();
  const { isConnected } = useFlow();
  const { getActiveListings, loading: listingsLoading } = useListings();
  
  const [listings, setListings] = useState<any[]>([]);
  const [filter, setFilter] = useState<"all" | "direct" | "raffle">("all");

  // Load real listings from the blockchain
  const loadListings = async () => {
    try {
      console.log("🔄 [BUY_PAGE] Loading active listings from blockchain...");
      const realListings = await getActiveListings();
      console.log("📋 [BUY_PAGE] Received listings:", realListings);
      
      if (realListings && realListings.length > 0) {
        setListings(realListings);
        console.log("✅ [BUY_PAGE] Successfully loaded", realListings.length, "listings");
      } else {
        console.log("📭 [BUY_PAGE] No listings found");
        setListings([]);
      }
    } catch (error) {
      console.error("❌ [BUY_PAGE] Failed to load listings:", error);
      setListings([]);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure the hook is fully initialized
    const timer = setTimeout(() => {
      loadListings();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Refresh listings when page becomes visible (e.g., returning from purchase)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("🔄 [BUY_PAGE] Page became visible, refreshing listings...");
        loadListings();
      }
    };

    const handleFocus = () => {
      console.log("🔄 [BUY_PAGE] Page focused, refreshing listings...");
      loadListings();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const filteredListings = listings.filter(listing => {
    if (filter === "all") return true;
    return listing.type === filter;
  });

  // No sorting - display listings as they come from blockchain

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
              <Link href="/buy" className="text-purple-600 font-medium">
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
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Listings</h1>
            <p className="text-gray-600">Discover amazing items from verified sellers</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("🔄 [BUY_PAGE] Manual refresh triggered");
              loadListings();
            }}
            disabled={listingsLoading}
          >
            {listingsLoading ? "Loading..." : "🔄 Refresh"}
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({listings.length})
            </Button>
            <Button
              variant={filter === "direct" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("direct")}
            >
              Direct Purchase ({listings.filter(l => l.type === "direct").length})
            </Button>
            <Button
              variant={filter === "raffle" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter("raffle")}
            >
              Raffles ({listings.filter(l => l.type === "raffle").length})
            </Button>
          </div>
        </div>

        {/* Listings Grid */}
        {listingsLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading listings...</div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-2">No active listings found</div>
            <div className="text-sm text-gray-400">
              {filter === "all" 
                ? "All items may have been purchased or raffles may have ended"
                : `${filter === "direct" ? "Direct purchase" : "Raffle"} items may have been sold or ended`
              }
            </div>
            <button
              onClick={loadListings}
              className="mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              🔄 Refresh to check for new listings
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <img
                    src={listing.image || getPlaceholderImage(listing.itemName || listing.title)}
                    alt={listing.itemName || listing.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {listing.itemName || listing.title}
                      </h3>
                      <div className="flex items-center space-x-1">
                        {listing.type === 'raffle' && (
                          <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            🎰 Raffle
                          </div>
                        )}
                        {listing.type === 'direct' && (
                          <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            ⚡ Direct
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {listing.itemDesc || listing.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                  <div className="text-2xl font-bold text-gray-900">
                    {listing.price} FLOW
                  </div>
                    </div>
                    
                    {listing.type === 'raffle' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Participants: {listing.participants?.length || 0}</span>
                          <span>1 winner</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full w-full"></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {listing.deadline ? `Ends: ${new Date(listing.deadline * 1000).toLocaleDateString()}` : 'No deadline set'}
                        </div>
                      </div>
                    )}
                    
                    {listing.type === 'direct' && (
                      <div className="text-sm">
                        {listing.isActive ? (
                          <span className="text-green-600">✓ Available</span>
                        ) : (
                          <span className="text-red-600">✗ Sold Out</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Verification Notice */}
        {!isLoggedIn && (
          <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 text-xl">🔐</div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Self.xyz Verification Required
                </h3>
                <p className="text-yellow-700 mb-3">
                  To purchase items or enter raffles, you'll need to verify your identity using Self.xyz first.
                  This ensures trust and prevents fraud.
                </p>
                <div className="text-sm text-yellow-600">
                  <p>• Age verification (18+)</p>
                  <p>• Uniqueness check (one account per person)</p>
                  <p>• Optional country verification</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
