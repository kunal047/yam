import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">🍠</span>
              </div>
              <span className="text-white font-bold text-xl">YAM</span>
            </div>
            <div className="flex space-x-6 items-center">
              <Link href="/raffles" className="text-white hover:text-orange-300 transition-colors">
                Raffles
              </Link>
              <Link href="/sell" className="text-white hover:text-orange-300 transition-colors">
                Sell
              </Link>
              <Link href="/profile" className="text-white hover:text-orange-300 transition-colors">
                Profile
              </Link>
              <WalletConnect />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Yet Another Marketplace
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
            The web3 marketplace where fair raffles meet instant purchases.
            Powered by Flow blockchain and Self.xyz identity verification.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/raffles"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              🎰 Enter Raffles
            </Link>
            <Link
              href="/sell"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              💰 Start Selling
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">Fair Raffles</h3>
            <p className="text-purple-100">
              One verified entry per person ensures fairness. Self.xyz prevents multiple accounts.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">Instant Purchases</h3>
            <p className="text-purple-100">
              Direct buy option for immediate transactions on the Flow blockchain.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Verified Identity</h3>
            <p className="text-purple-100">
              Age, country, and uniqueness verification for sellers and buyers.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
