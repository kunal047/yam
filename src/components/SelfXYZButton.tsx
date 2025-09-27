"use client";

import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import { useFlow } from "@/hooks/useFlow";
import Button from "./Button";
import UserDropdown from "./UserDropdown";

export default function SelfXYZButton() {
  const { isLoggedIn, loading, connectSelf, showVerificationModal } = useSelfXYZContext();
  const { user: flowUser, isConnected } = useFlow();

  if (isLoggedIn) {
    return <UserDropdown />;
  }

  const handleClick = () => {
    if (!isConnected || !flowUser.addr) {
      alert("Please connect your Flow wallet first before verifying your identity.");
      return;
    }
    connectSelf(flowUser.addr);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={loading || showVerificationModal}
      className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
    >
      {loading || showVerificationModal ? "🔗 Connecting..." : "🔐 Login with Self.xyz"}
    </Button>
  );
}
