"use client";

import { useState, useEffect } from "react";
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";


interface SelfXYZModalProps {
  isOpen: boolean;
  onSuccess: (apiResponse: Record<string, unknown>) => void;
  onError: () => void;
  onClose: () => void;
  flowWalletAddress?: string; // Flow wallet address to use as userId
}

export default function SelfXYZModal({ isOpen, onSuccess, onError, onClose, flowWalletAddress }: SelfXYZModalProps) {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      try {
        // Require Flow wallet address - no fallback to UUID
        if (!flowWalletAddress) {
          console.error("Flow wallet address is required for verification");
          onError();
          return;
        }

        const userId = flowWalletAddress;
        setSessionId(userId);
        
        const app = new SelfAppBuilder({
          version: 2,
          appName: "Yam Marketplace",
          scope: "yam-marketplace", // Must match backend scope
          endpoint: "https://ab8866ece5d9.ngrok-free.app/api/verify", // Your ngrok public URL
          logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png", // Using placeholder logo
          userId: userId,
          endpointType: "https",
          userIdType: "hex", // Keep as uuid for now until we find the correct type
          userDefinedData: "YAM Marketplace Verification",
          disclosures: {
            minimumAge: 18,
            nationality: true,
            gender: true,
            ofac: false, // Must match backend
          }
        }).build();

        setSelfApp(app);
        setUniversalLink(getUniversalLink(app));
      } catch (error) {
        console.error("Failed to initialize Self app:", error);
        onError();
      }
    }
  }, [isOpen, onError, flowWalletAddress]);

    const handleSuccessfulVerification = async (result: unknown) => {
      console.log("Verification successful!");
      console.log("Verification result:", JSON.stringify(result, null, 2));
      
      // The Self.xyz SDK onSuccess callback doesn't contain the API response
      // We need to fetch the verification result from our backend using the userId as sessionId
      try {
        // Wait a moment for the backend to complete processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Fetch the verification result from our backend
        const response = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            checkStatus: true,
            sessionId: sessionId // Use the generated sessionId
          })
        });
        
        if (response.ok) {
          const apiResponse = await response.json();
          console.log("Retrieved verification result:", JSON.stringify(apiResponse, null, 2));
          
          if (apiResponse && apiResponse.status === "success") {
            onSuccess(apiResponse);
          } else {
            console.error("Invalid verification result:", apiResponse);
            onError();
          }
        } else {
          console.error("Failed to retrieve verification result:", response.status);
          onError();
        }
      } catch (error) {
        console.error("Error retrieving verification result:", error);
        onError();
      }
    };

  const handleVerificationError = () => {
    console.error("Self.xyz verification failed");
    onError();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Verify Your Identity
          </h2>
          <p className="text-gray-600 mb-6">
            Scan this QR code with the Self app
          </p>

          {selfApp ? (
            <div className="flex flex-col items-center space-y-4">
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={() => handleSuccessfulVerification({})}
                onError={handleVerificationError}
              />

              <div className="text-sm text-gray-500 text-center">
                <p className="mb-2">Don&apos;t have the Self app?</p>
                <a
                  href={universalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 underline"
                >
                  Open in mobile browser
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">Loading QR Code...</span>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
