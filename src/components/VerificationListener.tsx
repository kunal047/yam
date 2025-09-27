"use client";

import { ReactNode } from "react";
import { useVerificationListener } from "@/hooks/useVerificationListener";

interface VerificationListenerProps {
  children: ReactNode;
}

export function VerificationListener({ children }: VerificationListenerProps) {
  useVerificationListener();
  return <>{children}</>;
}
