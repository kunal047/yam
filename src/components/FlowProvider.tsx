"use client";

import { ReactNode, useEffect, useState } from "react";

interface FlowProviderProps {
  children: ReactNode;
}

export default function FlowProvider({ children }: FlowProviderProps) {
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);

  useEffect(() => {
    // Import the config dynamically to ensure it runs on client side
    import("../../fcl.config").then(() => {
      console.log("✅ [FLOW_PROVIDER] FCL configuration loaded");
      setIsConfigLoaded(true);
    }).catch((error) => {
      console.error("❌ [FLOW_PROVIDER] Failed to load FCL configuration:", error);
      setIsConfigLoaded(true); // Still render children to show error
    });
  }, []);

  // Show loading state while configuration is being loaded
  if (!isConfigLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Loading Flow configuration...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
