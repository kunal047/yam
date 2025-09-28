"use client";

import Link from "next/link";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import { useFlow } from "@/hooks/useFlow";
import SelfXYZButton from "@/components/SelfXYZButton";
import WalletConnect from "@/components/WalletConnect";

export default function ProfilePage() {
  const { isLoggedIn, verification } = useSelfXYZContext();
  const { isConnected, user } = useFlow();

  if (!isLoggedIn) {
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
                <Link href="/profile" className="text-purple-600 font-medium">
                  Profile
                </Link>
                <SelfXYZButton />
                <WalletConnect />
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🔐</span>
                </div>
                <h1 className="text-2xl font-bold text-yellow-800">Identity Verification Required</h1>
              </div>
              <p className="text-yellow-700 mb-6">
                Please verify your identity with Self.xyz to access your profile and participate in YAM Marketplace.
              </p>
              <SelfXYZButton />
            </div>
          </div>
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
              <span className="text-black font-bold text-xl">YAM</span>
            </Link>
            <div className="flex space-x-6 items-center">
              <Link href="/buy" className="text-black hover:text-purple-600 transition-colors">
                Buy
              </Link>
              <Link href="/sell" className="text-black hover:text-purple-600 transition-colors">
                Sell
              </Link>
              <Link href="/profile" className="text-purple-600 font-medium">
                Profile
              </Link>
              <SelfXYZButton />
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {verification.nullifier?.slice(0, 2).toUpperCase() || "??"}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-2">Your Profile</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-green-100 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <span>✓</span>
                  <span>Verified via Self.xyz</span>
                </div>
                {isConnected && user && (
                  <div className="bg-blue-100 text-black px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <span>🔗</span>
                    <span>Flow Wallet Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Verification Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Identity Verification</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-black">Age</span>
                <span className="font-semibold text-black">{verification.age}+ years</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black">Nationality</span>
                <span className="font-semibold text-black">{verification.country}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black">Gender</span>
                <span className="font-semibold text-black">{verification.gender}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black">Unique ID</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-black">
                  {verification.nullifier?.slice(0, 16)}...
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-black">Verified</span>
                <span className="text-black font-semibold">
                  {verification.timestamp?.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Flow Wallet Connection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-black mb-4">Flow Wallet</h3>
            <div className="text-center">
              {isConnected && user ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-semibold text-black">Wallet Connected</span>
                    </div>
                    <code className="bg-green-100 px-2 py-1 rounded text-xs font-mono text-black">
                      {user.addr}
                    </code>
                  </div>
                  <WalletConnect />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-yellow-600">🔗</span>
                      <span className="font-semibold text-black">Connect Wallet</span>
                    </div>
                    <p className="text-sm text-black mb-3">
                      Connect your Flow wallet to participate in transactions
                    </p>
                    <WalletConnect />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}