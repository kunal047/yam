"use client";

import Link from "next/link";
import { useState } from "react";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import { useFlow } from "@/hooks/useFlow";
import SelfXYZButton from "@/components/SelfXYZButton";
import WalletConnect from "@/components/WalletConnect";
import Button from "@/components/Button";

// Mock listing data - replace with real contract data
const getListingData = (id: string) => {
  if (id === "raffle-1") {
    return {
      id,
      type: "raffle" as const,
      title: "iPhone 15 Pro Max",
      description: "Latest iPhone with all premium features including Pro camera system, A17 Pro chip, and titanium design.",
      price: 50,
      image: "https://placehold.co/800x600/purple/orange/png?text=iPhone+15+Pro+Max",
      entries: 234,
      maxEntries: 1000,
      endTime: new Date(Date.now() + 86400000), // 24 hours from now
      seller: "0x1234567890abcdef",
      sellerVerified: true,
      sellerReputation: 4.8,
    };
  } else {
    return {
      id,
      type: "direct" as const,
      title: "Gaming PC Setup",
      description: "Complete gaming rig with RTX 4080, Intel i9, 32GB RAM, and 2TB SSD. Perfect for 4K gaming.",
      price: 2500,
      image: "https://placehold.co/800x600/purple/orange/png?text=Gaming+PC",
      seller: "0x567890abcdef1234",
      sellerVerified: true,
      sellerReputation: 4.9,
      inStock: true,
    };
  }
};

interface ListingPageProps {
  params: {
    id: string;
  };
}

export default function ListingDetailPage({ params }: ListingPageProps) {
  const { isLoggedIn } = useSelfXYZContext();
  const { isConnected, connectWallet, loading: walletLoading } = useFlow();
  const [transactionLoading, setTransactionLoading] = useState(false);

  const listing = getListingData(params.id);

  const handlePurchase = async () => {
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
      // TODO: Implement actual Flow contract transaction
      await new Promise(resolve => setTimeout(resolve, 3000)); // Mock delay
      alert(`${listing.type === 'raffle' ? 'Raffle entry' : 'Purchase'} successful!`);
    } catch {
      alert("Transaction failed. Please try again.");
    } finally {
      setTransactionLoading(false);
    }
  };

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
              <Link href="/raffles" className="text-gray-600 hover:text-purple-600 transition-colors">
                Raffles
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
              src={listing.image}
              alt={listing.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
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
              <p className="text-gray-600 text-lg">{listing.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Address:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {listing.seller}
                  </code>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Reputation</div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{listing.sellerReputation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Specific Info */}
            {listing.type === 'raffle' && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">Raffle Progress</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Entries: {listing.entries}/{listing.maxEntries}</span>
                    <span>{Math.round((listing.entries / listing.maxEntries) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full"
                      style={{ width: `${(listing.entries / listing.maxEntries) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Ends: {listing.endTime.toLocaleDateString()} at {listing.endTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}

            {listing.type === 'direct' && (
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Purchase Details</h3>
                <div className="text-sm text-gray-600">
                  {listing.inStock ? (
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
                  <div className="text-2xl font-bold">${listing.price}</div>
                  <div className="text-purple-100">
                    {listing.type === 'raffle' ? 'per raffle entry' : 'total price'}
                  </div>
                </div>
                {listing.type === 'raffle' && (
                  <div className="text-right">
                    <div className="text-sm opacity-90">Time remaining</div>
                    <div className="font-semibold">23h 45m</div>
                  </div>
                )}
              </div>

              {!isLoggedIn ? (
                <div className="space-y-3">
                  <div className="text-center text-purple-100 text-sm">
                    🔐 Self.xyz verification required to {listing.type === 'raffle' ? 'enter raffle' : 'purchase'}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30"
                    disabled
                  >
                    {listing.type === 'raffle' ? '🎰 Enter Raffle' : '⚡ Buy Now'}
                  </Button>
                </div>
              ) : (
                <Button
                  className="w-full bg-white text-purple-600 hover:bg-gray-50 font-semibold"
                  onClick={handlePurchase}
                  disabled={transactionLoading || walletLoading}
                >
                  {transactionLoading ? "Processing..." :
                   !isConnected ? "🔗 Connect Wallet to Continue" :
                   listing.type === 'raffle' ? '🎰 Enter Raffle' : '⚡ Buy Now'}
                </Button>
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
