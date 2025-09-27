"use client";

import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import Button from "./Button";

export default function SelfXYZButton() {
  const { isLoggedIn, loading, connectSelf, disconnectSelf, showVerificationModal } = useSelfXYZContext();

  if (isLoggedIn) {
    return (
      <div className="flex items-center space-x-3">
        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1">
          <span>✓</span>
          <span>Verified via Self.xyz</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectSelf}
          className="text-white border-white/30 hover:bg-white/10"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={connectSelf}
      disabled={loading || showVerificationModal}
      className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
    >
      {loading || showVerificationModal ? "🔗 Connecting..." : "🔐 Login with Self.xyz"}
    </Button>
  );
}
