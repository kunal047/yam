import Link from "next/link";
import { useRaffles } from "@/hooks/useRaffles";
import WalletConnect from "@/components/WalletConnect";

export default function RafflesPage() {
  const { raffles, loading } = useRaffles();
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
              <Link href="/raffles" className="text-purple-600 font-medium">
                Raffles
              </Link>
              <Link href="/sell" className="text-gray-600 hover:text-purple-600 transition-colors">
                Sell
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-purple-600 transition-colors">
                Profile
              </Link>
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Raffles</h1>
          <p className="text-gray-600">Enter raffles for amazing prizes. One verified entry per person.</p>
        </div>
      </div>

      {/* Raffles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎰</div>
            <p className="text-gray-600">Loading raffles...</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map((raffle) => (
                <Link key={raffle.id} href={`/listings/${raffle.id}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img
                        src={raffle.image}
                        alt={raffle.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {raffle.verified && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                          <span>✓</span>
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{raffle.title}</h3>
                      <p className="text-gray-600 mb-4">{raffle.description}</p>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl font-bold text-purple-600">${raffle.price}</span>
                        <span className="text-sm text-gray-500">per entry</span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Entries: {raffle.entries}/{raffle.maxEntries}</span>
                          <span>{Math.round((raffle.entries / raffle.maxEntries) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${(raffle.entries / raffle.maxEntries) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500">
                        Ends: {raffle.endTime.toLocaleDateString()} {raffle.endTime.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {raffles.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <div className="text-6xl mb-4">🎰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Raffles</h3>
                <p className="text-gray-600 mb-4">Check back later for new raffles!</p>
                <Link
                  href="/sell"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
                >
                  Create a Raffle
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
