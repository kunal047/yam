"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import SelfXYZModal from "@/components/SelfXYZModal";

export interface CredentialSubject {
  age?: number;
  nationality?: string;
  gender?: string;
  ofac?: boolean;
}

export interface SelfVerificationResult {
  credentialSubject?: CredentialSubject;
  status?: string;
}

export interface SelfVerification {
  isVerified: boolean;
  did?: string;
  age?: number;
  country?: string;
  uniqueId?: string;
  proofs?: Record<string, unknown>[];
  timestamp?: Date;
  credentialSubject?: CredentialSubject;
}

interface SelfXYZContextType {
  verification: SelfVerification;
  loading: boolean;
  connectSelf: () => Promise<void>;
  disconnectSelf: () => void;
  isLoggedIn: boolean;
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
  handleVerificationSuccess: (result: SelfVerificationResult) => void;
  handleVerificationError: () => void;
}

const SelfXYZContext = createContext<SelfXYZContextType | undefined>(undefined);

interface SelfXYZProviderProps {
  children: ReactNode;
}

export function SelfXYZProvider({ children }: SelfXYZProviderProps) {
  const [verification, setVerification] = useState<SelfVerification>({
    isVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const connectSelf = async () => {
    setLoading(true);
    setShowVerificationModal(true);
    // The actual verification will be handled by the SelfXYZModal component
  };

  const handleVerificationSuccess = (result: SelfVerificationResult) => {
    setVerification({
      isVerified: true,
      did: `did:self:${Date.now()}`, // Generate a mock DID
      age: result.credentialSubject?.age || 25,
      country: result.credentialSubject?.nationality || "US",
      uniqueId: `self_xyz_${Date.now()}`,
      proofs: [
        {
          type: "AgeVerification",
          value: result.credentialSubject?.age || 25,
          issuer: "self.xyz"
        },
        {
          type: "CountryVerification",
          value: result.credentialSubject?.nationality || "US",
          issuer: "self.xyz"
        },
        {
          type: "UniquenessVerification",
          value: true,
          issuer: "self.xyz"
        }
      ],
      timestamp: new Date(),
      credentialSubject: result.credentialSubject,
    });
    setLoading(false);
    setShowVerificationModal(false);
  };

  const handleVerificationError = () => {
    setLoading(false);
    setShowVerificationModal(false);
  };

  const disconnectSelf = () => {
    setVerification({ isVerified: false });
    setShowVerificationModal(false);
  };

  const value: SelfXYZContextType = {
    verification,
    loading,
    connectSelf,
    disconnectSelf,
    isLoggedIn: verification.isVerified,
    showVerificationModal,
    setShowVerificationModal,
  };

  return (
    <SelfXYZContext.Provider value={{ ...value, handleVerificationSuccess, handleVerificationError }}>
      {children}
      <SelfXYZModal
        isOpen={showVerificationModal}
        onSuccess={handleVerificationSuccess}
        onError={handleVerificationError}
        onClose={() => setShowVerificationModal(false)}
      />
    </SelfXYZContext.Provider>
  );
}

export function useSelfXYZContext() {
  const context = useContext(SelfXYZContext);
  if (context === undefined) {
    throw new Error("useSelfXYZContext must be used within a SelfXYZProvider");
  }
  return context;
}
