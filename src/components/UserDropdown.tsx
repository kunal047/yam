"use client";

import { useState, useRef, useEffect } from "react";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import { useFlow } from "@/hooks/useFlow";

export default function UserDropdown() {
  const { isLoggedIn, verification, disconnectSelf } = useSelfXYZContext();
  const { isConnected, disconnectWallet } = useFlow();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isLoggedIn) {
    return null;
  }

  const handleLogout = () => {
    disconnectSelf();
    if (isConnected) {
      disconnectWallet();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors"
      >
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
        <span className="text-sm font-medium">Verified</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {verification.nullifier?.slice(0, 2).toUpperCase() || "??"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {verification.country} • {verification.gender}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Age: {verification.age}+ • Verified
                </p>
              </div>
            </div>
          </div>

          {/* Verification Details */}
          <div className="px-4 py-2">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Nationality:</span>
                <span className="font-medium">{verification.country}</span>
              </div>
              <div className="flex justify-between">
                <span>Gender:</span>
                <span className="font-medium">{verification.gender}</span>
              </div>
              <div className="flex justify-between">
                <span>Age:</span>
                <span className="font-medium">{verification.age}+</span>
              </div>
              <div className="flex justify-between">
                <span>ID:</span>
                <code className="font-mono text-xs bg-gray-100 px-1 rounded">
                  {verification.nullifier?.slice(0, 8)}...
                </code>
              </div>
            </div>
          </div>

          {/* Wallet Status */}
          {isConnected && (
            <div className="px-4 py-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-blue-600">
                <span>🔗</span>
                <span>Flow Wallet Connected</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
            >
              <span>🚪</span>
              <span>Logout from Self.xyz</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
