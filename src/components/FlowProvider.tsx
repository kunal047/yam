"use client";

import { ReactNode, useEffect } from "react";

interface FlowProviderProps {
  children: ReactNode;
}

export default function FlowProvider({ children }: FlowProviderProps) {
  useEffect(() => {
    // Import the config dynamically to ensure it runs on client side
    import("../../fcl.config");
  }, []);

  return <>{children}</>;
}
