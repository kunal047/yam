"use client";

import Link from "next/link";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import SelfXYZButton from "@/components/SelfXYZButton";
import WalletConnect from "@/components/WalletConnect";

// Mock user data - replace with real wallet connection
const mockUser = {
  address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  reputation: 4.8,
  totalSales: 23,
  totalPurchases: 45,
  badges: [
    { name: "Verified Seller", icon: "✓", color: "green" },
    { name: "Top Trader", icon: "🏆", color: "gold" },
    { name: "Early Adopter", icon: "🚀", color: "blue" },
  ],
  loyaltyPoints: 1250,
  recentActivity: [
    { type: "raffle_win", item: "iPhone 15 Pro", date: new Date(Date.now() - 86400000), amount: 50 },
    { type: "purchase", item: "MacBook Pro", date: new Date(Date.now() - 172800000), amount: 1200 },
    { type: "raffle_entry", item: "Gaming PC", date: new Date(Date.now() - 259200000), amount: 25 },
  ],
};

export default function ProfilePage() {
  const { isLoggedIn, verification } = useSelfXYZContext();
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
              <Link href="/profile" className="text-purple-600 font-medium">
                Profile
              </Link>
              <SelfXYZButton />
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {mockUser.address.slice(2, 4).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h1>
              <div className="flex items-center space-x-4 mb-4">
                <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">
                  {mockUser.address}
                </code>
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-semibold">{mockUser.reputation}</span>
                  <span className="text-gray-500">reputation</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {mockUser.badges.map((badge, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${
                      badge.color === 'green' ? 'bg-green-100 text-green-800' :
                      badge.color === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    <span>{badge.icon}</span>
                    <span>{badge.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Loyalty Points */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Loyalty Points</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{mockUser.loyaltyPoints}</div>
                <div className="text-gray-600">points earned</div>
                <div className="mt-4 text-sm text-gray-500">
                  Earn points with every transaction • Redeem for discounts
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales</span>
                  <span className="font-semibold">{mockUser.totalSales}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Purchases</span>
                  <span className="font-semibold">{mockUser.totalPurchases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Raffle Wins</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">89%</span>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            {isLoggedIn ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white">✓</span>
                  </div>
                  <h3 className="text-lg font-semibold text-green-800">Identity Verified via Self.xyz</h3>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>• DID: <code className="bg-green-100 px-1 rounded text-xs">{verification.did}</code></p>
                  <p>• Age: {verification.age}+ verified</p>
                  <p>• Country: {verification.country}</p>
                  <p>• Unique identity confirmed</p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white">🔐</span>
                  </div>
                  <h3 className="text-lg font-semibold text-yellow-800">Identity Not Verified</h3>
                </div>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• Login with Self.xyz to verify your identity</p>
                  <p>• Required for buying and selling on YAM</p>
                  <p>• Age, uniqueness, and country verification</p>
                </div>
                <div className="mt-3">
                  <SelfXYZButton />
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {mockUser.recentActivity.map((activity, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === 'raffle_win' ? 'bg-yellow-100 text-yellow-600' :
                          activity.type === 'purchase' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {activity.type === 'raffle_win' ? '🏆' :
                           activity.type === 'purchase' ? '💰' : '🎰'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {activity.type === 'raffle_win' ? 'Won Raffle' :
                             activity.type === 'purchase' ? 'Purchase' : 'Raffle Entry'}
                          </div>
                          <div className="text-sm text-gray-600">{activity.item}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${activity.amount}</div>
                        <div className="text-sm text-gray-500">
                          {activity.date.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Connection Notice */}
            {isLoggedIn ? (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Connect Your Flow Wallet</h3>
                <p className="text-blue-700 mb-4">
                  Now that you&apos;re verified with Self.xyz, connect your Flow wallet to start buying and selling on YAM.
                </p>
                <WalletConnect />
              </div>
            ) : (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Started with YAM</h3>
                <p className="text-gray-700 mb-4">
                  First verify your identity with Self.xyz, then connect your Flow wallet to start trading.
                </p>
                <div className="flex space-x-4">
                  <SelfXYZButton />
                  <WalletConnect />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
