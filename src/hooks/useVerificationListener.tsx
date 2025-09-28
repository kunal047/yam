"use client";

import { useEffect } from "react";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";

export function useVerificationListener() {
  const { updateVerificationFromAPI } = useSelfXYZContext();

  useEffect(() => {
    // Listen for verification completion events
    const handleVerificationComplete = (event: CustomEvent) => {
      console.log("Verification complete event received:", event.detail);
      
      if (event.detail && event.detail.status === "success") {
        updateVerificationFromAPI(event.detail);
      }
    };

    // Listen for the custom event
    window.addEventListener("verificationComplete", handleVerificationComplete as EventListener);

    return () => {
      window.removeEventListener("verificationComplete", handleVerificationComplete as EventListener);
    };
  }, [updateVerificationFromAPI]);

  // Also listen for storage changes (when verification data is updated)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "yam_selfxyz_verification" && event.newValue) {
        try {
          const verificationData = JSON.parse(event.newValue);
          if (verificationData.isVerified) {
            console.log("Verification data updated in localStorage:", verificationData);
          }
        } catch (error) {
          console.error("Failed to parse verification data from localStorage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
}
