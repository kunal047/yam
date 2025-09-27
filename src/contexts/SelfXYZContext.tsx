"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import SelfXYZModal from "@/components/SelfXYZModal";

// Function to check if user exists in verification-results.json
async function checkVerificationResults(walletAddress: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch('/api/check-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.exists ? result.verificationData : null;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to check verification results:', error);
    return null;
  }
}

export interface CredentialSubject {
  age?: number;
  nationality?: string;
  gender?: string;
  ofac?: boolean;
  nullifier?: string;
}

export interface SelfVerificationResult {
  credentialSubject?: CredentialSubject;
  status?: string;
  nullifier?: string;
  nationality?: string;
  userIdentifier?: string;
}

export interface SelfVerification {
  isVerified: boolean;
  did?: string;
  age?: number;
  country?: string;
  gender?: string;
  uniqueId?: string;
  nullifier?: string;
  userIdentifier?: string;
  proofs?: Record<string, unknown>[];
  timestamp?: Date;
  credentialSubject?: CredentialSubject;
}

interface SelfXYZContextType {
  verification: SelfVerification;
  loading: boolean;
  connectSelf: (walletAddress?: string) => Promise<void>;
  disconnectSelf: () => void;
  isLoggedIn: boolean;
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
  handleVerificationSuccess: (apiResponse: Record<string, unknown>) => void;
  handleVerificationError: () => void;
  updateVerificationFromAPI: (apiResponse: Record<string, unknown>) => void;
  checkExistingVerification: (walletAddress: string) => Promise<boolean>;
}

const SelfXYZContext = createContext<SelfXYZContextType | undefined>(undefined);

interface SelfXYZProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "yam_selfxyz_verification";

export function SelfXYZProvider({ children }: SelfXYZProviderProps) {
  const [verification, setVerification] = useState<SelfVerification>({
    isVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [flowWalletAddress, setFlowWalletAddress] = useState<string | undefined>(undefined);

  // Load verification from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert timestamp back to Date object
        if (parsed.timestamp) {
          parsed.timestamp = new Date(parsed.timestamp);
        }
        setVerification(parsed);
      }
    } catch (error) {
      console.error("Failed to load verification from localStorage:", error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save verification to localStorage whenever it changes
  useEffect(() => {
    if (verification.isVerified) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(verification));
      } catch (error) {
        console.error("Failed to save verification to localStorage:", error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [verification]);

  const connectSelf = async (walletAddress?: string) => {
    // Check if Flow wallet is connected first
    if (!walletAddress) {
      console.error("Flow wallet must be connected before verification");
      setLoading(false);
      return;
    }
    
    setFlowWalletAddress(walletAddress);
    setLoading(true);
    setShowVerificationModal(true);
    // The actual verification will be handled by the SelfXYZModal component
  };

  const handleVerificationSuccess = async (apiResponse: Record<string, unknown>) => {
    console.log("QR code verification completed, processing API response:", apiResponse);
    
    setLoading(true);
    setShowVerificationModal(false);
    
    // Process the API response directly
    if (apiResponse && apiResponse.status === "success") {
      updateVerificationFromAPI(apiResponse);
    } else {
      console.error("Invalid API response:", apiResponse);
      setLoading(false);
    }
  };

  // Function to update verification data from backend API response
  const updateVerificationFromAPI = (apiResponse: Record<string, unknown>) => {
    console.log("Updating verification from API response:", apiResponse);
    
    const now = new Date().toISOString();
    
    // Extract data from the API response
    const nullifier = apiResponse.nullifier as string;
    const nationality = apiResponse.nationality as string;
    const userIdentifier = apiResponse.userIdentifier as string;
    const credentialSubject = apiResponse.credentialSubject as Record<string, unknown>;
    const age = credentialSubject?.age ? parseInt(credentialSubject.age as string) : undefined;
    const gender = credentialSubject?.gender as string;
    const ofac = credentialSubject?.ofac as boolean;
    
    const verificationData = {
      isVerified: true,
      did: `did:self:${now}`,
      age: age,
      country: nationality,
      gender: gender,
      uniqueId: nullifier || `self_xyz_${now}`, // Use nullifier as unique ID
      nullifier: nullifier,
      userIdentifier: userIdentifier,
      proofs: [
        {
          type: "AgeVerification",
          value: age,
          issuer: "self.xyz"
        },
        {
          type: "CountryVerification", 
          value: nationality,
          issuer: "self.xyz"
        },
        {
          type: "GenderVerification",
          value: gender,
          issuer: "self.xyz"
        },
        {
          type: "UniquenessVerification",
          value: true,
          issuer: "self.xyz",
          nullifier: nullifier
        }
      ],
      timestamp: new Date(now),
      credentialSubject: {
        age: age,
        nationality: nationality,
        gender: gender,
        ofac: ofac,
        nullifier: nullifier
      },
    };
    
    console.log("Setting verification data:", verificationData);
    setVerification(verificationData);
    setLoading(false);
    
    console.log("Verification completed successfully!");
  };

  const handleVerificationError = () => {
    setLoading(false);
    setShowVerificationModal(false);
  };

  const disconnectSelf = () => {
    setVerification({ isVerified: false });
    setShowVerificationModal(false);
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
  };

  const checkExistingVerification = async (walletAddress: string): Promise<boolean> => {
    try {
      const verificationData = await checkVerificationResults(walletAddress);
      
      if (verificationData && verificationData.status === "success") {
        // User exists in verification-results.json, update verification state
        updateVerificationFromAPI(verificationData);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check existing verification:', error);
      return false;
    }
  };

  const value: SelfXYZContextType = {
    verification,
    loading,
    connectSelf,
    disconnectSelf,
    isLoggedIn: verification.isVerified,
    showVerificationModal,
    setShowVerificationModal,
    handleVerificationSuccess,
    handleVerificationError,
    updateVerificationFromAPI,
    checkExistingVerification,
  };

  return (
    <SelfXYZContext.Provider value={value}>
      {children}
      <SelfXYZModal
        isOpen={showVerificationModal}
        onSuccess={handleVerificationSuccess}
        onError={handleVerificationError}
        onClose={() => setShowVerificationModal(false)}
        flowWalletAddress={flowWalletAddress}
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
