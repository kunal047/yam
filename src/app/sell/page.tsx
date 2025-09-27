"use client";

import Link from "next/link";
import { useState } from "react";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import SelfXYZButton from "@/components/SelfXYZButton";
import WalletConnect from "@/components/WalletConnect";
import Button from "@/components/Button";
import CreateListingForm from "@/components/CreateListingForm";

export default function SellPage() {
  const { isLoggedIn, verification } = useSelfXYZContext();
  const [showForm, setShowForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFormSuccess = (listingId: string) => {
    setSuccessMessage(`Listing created successfully! ID: ${listingId}`);
    setShowForm(false);
    setErrorMessage("");
  };

  const handleFormError = (error: string) => {
    setErrorMessage(error);
    setSuccessMessage("");
  };

  if (showForm) {
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
                <Link href="/sell" className="text-purple-600 font-medium">
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="mb-4"
            >
              ← Back to Options
            </Button>
          </div>

          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✅</span>
                <span className="text-green-800">{successMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-red-600">❌</span>
                <span className="text-red-800">{errorMessage}</span>
              </div>
            </div>
          )}

          <CreateListingForm
            onSuccess={handleFormSuccess}
            onError={handleFormError}
          />
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
              <Link href="/raffles" className="text-gray-600 hover:text-purple-600 transition-colors">
                Raffles
              </Link>
              <Link href="/sell" className="text-purple-600 font-medium">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Listing</h1>
          <p className="text-gray-600">Choose how you want to sell your item</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Raffle Option */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎰</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create a Raffle</h2>
              <p className="text-gray-600">
                Let multiple buyers enter for a chance to win. Great for high-value items!
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">One verified entry per person</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Funds held in escrow</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Automatic winner selection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Refunds for non-winners</span>
              </div>
            </div>

            {isLoggedIn ? (
              <Button
                className="w-full"
                onClick={() => setShowForm(true)}
              >
                Create Raffle Listing
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="w-full opacity-50 cursor-not-allowed"
                disabled
              >
                Login with Self.xyz First
              </Button>
            )}
          </div>

          {/* Direct Purchase Option */}
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚡</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Direct Purchase</h2>
              <p className="text-gray-600">
                Instant sale at a fixed price. Perfect for standard marketplace transactions!
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Immediate transaction</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Escrow protection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Fixed pricing</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Instant delivery</span>
              </div>
            </div>

            {isLoggedIn ? (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowForm(true)}
              >
                Create Direct Listing
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="w-full opacity-50 cursor-not-allowed"
                disabled
              >
                Login with Self.xyz First
              </Button>
            )}
          </div>
        </div>

        {/* Verification Status */}
        {isLoggedIn ? (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="text-green-600 text-xl">✅</div>
              <div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">Identity Verified</h3>
                <p className="text-green-700 mb-3">
                  Your identity has been verified via Self.xyz. You can now create listings on YAM.
                </p>
                <div className="text-sm text-green-600 space-y-1">
                  <p>• DID: <code className="bg-green-100 px-1 rounded text-xs">{verification.did}</code></p>
                  <p>• Age: {verification.age}+</p>
                  <p>• Country: {verification.country}</p>
                  <p>• Gender: {verification.gender}</p>
                  <p>• Nullifier: <code className="bg-green-100 px-1 rounded text-xs">{verification.nullifier?.slice(0, 16)}...</code></p>
                  <p>• Unique ID verified</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 text-xl">🔐</div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Self.xyz Verification Required</h3>
                <p className="text-yellow-700 mb-3">
                  To create listings on YAM, you&apos;ll need to verify your identity using Self.xyz first.
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

        {/* Coming Soon */}
        <div className="mt-8 text-center">
          <div className="bg-gray-100 rounded-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Features Coming Soon</h3>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🏆</div>
                <div className="font-medium text-gray-900">Loyalty Points</div>
                <div className="text-sm text-gray-600">Earn points for sales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🎁</div>
                <div className="font-medium text-gray-900">Mystery Drops</div>
                <div className="text-sm text-gray-600">Surprise item reveals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🏅</div>
                <div className="font-medium text-gray-900">Seller Badges</div>
                <div className="text-sm text-gray-600">Reputation system</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
