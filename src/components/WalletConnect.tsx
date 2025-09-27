"use client";

import { useFlow } from "@/hooks/useFlow";
import Button from "./Button";

export default function WalletConnect() {
  const { user, loading, connectWallet, disconnectWallet, isConnected, canConnectWallet } = useFlow();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Connected
        </div>
        <code className="bg-black/30 text-white text-sm px-2 py-1 rounded">
          {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
        </code>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          disabled={loading}
          className="text-white border-white/30 hover:bg-white/10"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  if (!canConnectWallet) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
          Requires Self.xyz
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={true}
          className="opacity-50 cursor-not-allowed"
        >
          🔗 Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={connectWallet}
      disabled={loading}
    >
      {loading ? "Connecting..." : "🔗 Connect Wallet"}
    </Button>
  );
}
