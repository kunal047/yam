import Link from "next/link";

// Mock data - replace with real contract data
const getRaffleData = (id: string) => ({
  id,
  title: "iPhone 15 Pro Max",
  description: "Latest iPhone with all premium features including Pro camera system, A17 Pro chip, and titanium design.",
  price: 50,
  image: "https://placehold.co/800x600/purple/orange/png?text=iPhone+15+Pro+Max",
  entries: 234,
  maxEntries: 1000,
  endTime: new Date(Date.now() + 86400000), // 24 hours from now
  seller: "0x1234567890abcdef",
  verified: true,
  sellerReputation: 4.8,
  totalSales: 156,
});

interface RafflePageProps {
  params: {
    id: string;
  };
}

export default function RaffleDetailPage({ params }: RafflePageProps) {
  const raffle = getRaffleData(params.id);

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
            <div className="flex space-x-6">
              <Link href="/raffles" className="text-gray-600 hover:text-purple-600 transition-colors">
                ← Back to Raffles
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <img
              src={raffle.image}
              alt={raffle.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{raffle.title}</h1>
                {raffle.verified && (
                  <div className="bg-green-500 text-white text-sm px-2 py-1 rounded-full flex items-center space-x-1">
                    <span>✓</span>
                    <span>Verified Seller</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-lg">{raffle.description}</p>
            </div>

            {/* Seller Info */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Seller Information</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Address:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {raffle.seller}
                  </code>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Reputation</div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{raffle.sellerReputation}</span>
                    <span className="text-sm text-gray-500">({raffle.totalSales} sales)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raffle Progress */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Raffle Progress</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Entries: {raffle.entries}/{raffle.maxEntries}</span>
                  <span>{Math.round((raffle.entries / raffle.maxEntries) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(raffle.entries / raffle.maxEntries) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  Ends: {raffle.endTime.toLocaleDateString()} at {raffle.endTime.toLocaleTimeString()}
                </div>
              </div>
            </div>

            {/* Entry Section */}
            <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-6 rounded-lg text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold">${raffle.price}</div>
                  <div className="text-purple-100">per raffle entry</div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Time remaining</div>
                  <div className="font-semibold">23h 45m</div>
                </div>
              </div>

              <button className="w-full bg-white text-purple-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors mb-4">
                🎰 Enter Raffle (Requires Verification)
              </button>

              <div className="text-sm text-purple-100 text-center">
                One verified entry per person • Self.xyz identity required
              </div>
            </div>

            {/* Terms */}
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Winners are selected randomly after the raffle ends</p>
              <p>• Funds are held in escrow until winner is selected</p>
              <p>• Non-winners receive full refunds automatically</p>
              <p>• Seller verification ensures legitimacy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
