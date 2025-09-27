"use client";

import { useState, useEffect } from "react";
import { getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";

import { SelfVerificationResult } from "@/contexts/SelfXYZContext";

interface SelfXYZModalProps {
  isOpen: boolean;
  onSuccess: (result: SelfVerificationResult) => void;
  onError: () => void;
  onClose: () => void;
}

export default function SelfXYZModal({ isOpen, onSuccess, onError, onClose }: SelfXYZModalProps) {
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId] = useState("550e8400-e29b-41d4-a716-446655440000"); // Valid UUID to avoid hydration mismatch

  useEffect(() => {
    if (isOpen) {
      try {
        const app = new SelfAppBuilder({
          version: 2,
          appName: "Yam Marketplace",
          scope: "yam-marketplace", // Must match backend scope
          endpoint: "https://82ac421dc420.ngrok-free.app/api/verify", // Your ngrok public URL
          logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png", // Using placeholder logo
          userId: userId,
          endpointType: "https",
          userIdType: "uuid", // Must match backend userIdentifierType
          userDefinedData: "Hello World",
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
  }, [isOpen, userId, onError]);

  const handleSuccessfulVerification = (result: unknown) => {
    console.log("Verification successful!");
    // Pass the actual result from Self.xyz verification
    onSuccess(result as SelfVerificationResult);
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
