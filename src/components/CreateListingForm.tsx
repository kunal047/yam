"use client";

import { useState } from "react";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import { useFlow } from "@/hooks/useFlow";
import { useListings } from "@/hooks/useListings";
import Button from "./Button";
import Badge from "./Badge";

interface CreateListingFormProps {
  onSuccess?: (listingId: string, transactionId: string) => void;
  onError?: (error: string) => void;
}

interface FormData {
  itemName: string;
  itemDesc: string;
  price: string;
  quantity: string;
  type: "direct" | "raffle";
  deadline: string;
  allowedCountries: string[];
}

const COUNTRIES = [
  { code: "US", name: "United States", code3: "USA" },
  { code: "CA", name: "Canada", code3: "CAN" },
  { code: "GB", name: "United Kingdom", code3: "GBR" },
  { code: "DE", name: "Germany", code3: "DEU" },
  { code: "FR", name: "France", code3: "FRA" },
  { code: "IT", name: "Italy", code3: "ITA" },
  { code: "ES", name: "Spain", code3: "ESP" },
  { code: "NL", name: "Netherlands", code3: "NLD" },
  { code: "AU", name: "Australia", code3: "AUS" },
  { code: "JP", name: "Japan", code3: "JPN" },
  { code: "KR", name: "South Korea", code3: "KOR" },
  { code: "SG", name: "Singapore", code3: "SGP" },
  { code: "IN", name: "India", code3: "IND" },
  { code: "BR", name: "Brazil", code3: "BRA" },
  { code: "MX", name: "Mexico", code3: "MEX" },
  { code: "AR", name: "Argentina", code3: "ARG" },
  { code: "ZA", name: "South Africa", code3: "ZAF" },
  { code: "NG", name: "Nigeria", code3: "NGA" },
  { code: "EG", name: "Egypt", code3: "EGY" },
  { code: "KE", name: "Kenya", code3: "KEN" },
];

// Helper function to convert between 2-letter and 3-letter country codes
const convertCountryCode = (code: string, from3To2: boolean = false): string => {
  if (from3To2) {
    // Convert 3-letter to 2-letter
    const country = COUNTRIES.find(c => c.code3 === code);
    return country ? country.code : code;
  } else {
    // Convert 2-letter to 3-letter
    const country = COUNTRIES.find(c => c.code === code);
    return country ? country.code3 : code;
  }
};

export default function CreateListingForm({ onSuccess, onError }: CreateListingFormProps) {
  const { isLoggedIn, verification } = useSelfXYZContext();
  const { isConnected, connectWallet } = useFlow();
  const { createListing, loading: transactionLoading } = useListings();
  
  const [formData, setFormData] = useState<FormData>({
    itemName: "Vintage Gaming Console",
    itemDesc: "A classic retro gaming console in excellent condition. Comes with 2 controllers and 5 games. Perfect for collectors or retro gaming enthusiasts.",
    price: "25.50",
    quantity: "1",
    type: "direct",
    deadline: "",
    allowedCountries: [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-add seller's nationality to allowed countries
  const sellerNationality = verification.country;
  // Convert 3-letter code to 2-letter code for form display
  const sellerNationality2Letter = sellerNationality ? convertCountryCode(sellerNationality, true) : null;
  const defaultAllowedCountries = sellerNationality2Letter ? [sellerNationality2Letter] : [];

  const validateForm = (): boolean => {
    console.log("🔍 [VALIDATION] Starting form validation");
    console.log("📋 [VALIDATION] Form data to validate:", JSON.stringify(formData, null, 2));
    
    const newErrors: Record<string, string> = {};

    // Validate item name
    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item name is required";
      console.log("❌ [VALIDATION] Item name validation failed: empty");
    } else {
      console.log("✅ [VALIDATION] Item name validation passed:", formData.itemName);
    }

    // Validate description
    if (!formData.itemDesc.trim()) {
      newErrors.itemDesc = "Description is required";
      console.log("❌ [VALIDATION] Description validation failed: empty");
    } else {
      console.log("✅ [VALIDATION] Description validation passed");
    }

    // Validate price
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = "Price must be greater than 0";
      console.log("❌ [VALIDATION] Price validation failed:", { price, isNaN: isNaN(price) });
    } else {
      console.log("✅ [VALIDATION] Price validation passed:", price);
    }

    // Validate quantity
    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
      console.log("❌ [VALIDATION] Quantity validation failed:", { quantity, isNaN: isNaN(quantity) });
    } else {
      console.log("✅ [VALIDATION] Quantity validation passed:", quantity);
    }

    // Validate raffle deadline
    if (formData.type === "raffle") {
      if (!formData.deadline) {
        newErrors.deadline = "Deadline is required for raffles";
        console.log("❌ [VALIDATION] Raffle deadline validation failed: empty");
      } else {
        const deadlineDate = new Date(formData.deadline);
        const now = new Date();
        if (deadlineDate <= now) {
          newErrors.deadline = "Deadline must be in the future";
          console.log("❌ [VALIDATION] Raffle deadline validation failed: not in future", { deadlineDate, now });
        } else {
          console.log("✅ [VALIDATION] Raffle deadline validation passed:", deadlineDate);
        }
      }
    }

    // Validate allowed countries
    const allowedCountries = formData.allowedCountries.length > 0 
      ? formData.allowedCountries 
      : defaultAllowedCountries;
    
    if (allowedCountries.length === 0) {
      newErrors.allowedCountries = "At least one country must be selected";
      console.log("❌ [VALIDATION] Allowed countries validation failed: none selected");
    } else {
      console.log("✅ [VALIDATION] Allowed countries validation passed:", allowedCountries);
    }

    console.log("📊 [VALIDATION] Validation results:", {
      errors: newErrors,
      isValid: Object.keys(newErrors).length === 0,
      errorCount: Object.keys(newErrors).length
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("📝 [FORM_SUBMIT] Form submission started");
    console.log("📋 [FORM_SUBMIT] Form data:", JSON.stringify(formData, null, 2));
    console.log("🔐 [FORM_SUBMIT] Verification status:", { isLoggedIn, sellerNationality });
    console.log("🔗 [FORM_SUBMIT] Wallet status:", { isConnected });
    
    if (!isLoggedIn) {
      console.log("❌ [FORM_SUBMIT] User not logged in, aborting");
      onError?.("Please verify your identity with Self.xyz first");
      return;
    }

    if (!isConnected) {
      console.log("🔗 [FORM_SUBMIT] Wallet not connected, attempting to connect...");
      try {
        await connectWallet();
        console.log("✅ [FORM_SUBMIT] Wallet connected successfully");
      } catch (err) {
        console.error("❌ [FORM_SUBMIT] Failed to connect wallet:", err);
        onError?.("Failed to connect wallet");
        return;
      }
    }

    console.log("✅ [FORM_SUBMIT] Starting form validation...");
    if (!validateForm()) {
      console.log("❌ [FORM_SUBMIT] Form validation failed, aborting");
      return;
    }
    console.log("✅ [FORM_SUBMIT] Form validation passed");

    console.log("🔄 [FORM_SUBMIT] Setting submitting state to true");
    setIsSubmitting(true);

    try {
      // Prepare transaction data
      const allowedCountries2Letter = formData.allowedCountries.length > 0 
        ? formData.allowedCountries 
        : defaultAllowedCountries;
      
      // Convert 2-letter codes to 3-letter codes for the contract
      const allowedCountries = allowedCountries2Letter.map(code => convertCountryCode(code, false));

      console.log("🌍 [FORM_SUBMIT] Allowed countries (2-letter):", allowedCountries2Letter);
      console.log("🌍 [FORM_SUBMIT] Allowed countries (3-letter):", allowedCountries);

      if (!sellerNationality) {
        console.log("❌ [FORM_SUBMIT] No seller nationality found, aborting");
        onError?.("Please verify your nationality with Self.xyz first");
        return;
      }

      const transactionData = {
        itemName: formData.itemName,
        itemDesc: formData.itemDesc,
        price: parseFloat(formData.price),
        type: formData.type,
        deadline: formData.type === "raffle" ? new Date(formData.deadline).getTime() / 1000 : undefined,
        allowedCountries,
        quantity: parseInt(formData.quantity),
        sellerNationality,
        sellerNullifier: verification.nullifier || "",
      };

      console.log("📦 [FORM_SUBMIT] Prepared transaction data:", JSON.stringify(transactionData, null, 2));
      console.log("🚀 [FORM_SUBMIT] Calling createListing function...");

      // Call Flow transaction
      const result = await createListing(transactionData);
      
      console.log("🎉 [FORM_SUBMIT] Listing created successfully:", result);
      onSuccess?.(result.listingId, result.transactionId);
      
      // Reset form
      console.log("🔄 [FORM_SUBMIT] Resetting form to default values");
      setFormData({
        itemName: "Vintage Gaming Console",
        itemDesc: "A classic retro gaming console in excellent condition. Comes with 2 controllers and 5 games. Perfect for collectors or retro gaming enthusiasts.",
        price: "25.50",
        quantity: "1",
        type: "direct",
        deadline: "",
        allowedCountries: [],
      });
      
    } catch (err) {
      console.error("❌ [FORM_SUBMIT] Error creating listing:", err);
      console.error("❌ [FORM_SUBMIT] Error details:", {
        message: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : "No stack trace",
        type: typeof err
      });
      onError?.(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
      console.log("🏁 [FORM_SUBMIT] Setting submitting state to false");
      setIsSubmitting(false);
    }
  };

  const handleCountryToggle = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      allowedCountries: prev.allowedCountries.includes(countryCode)
        ? prev.allowedCountries.filter(c => c !== countryCode)
        : [...prev.allowedCountries, countryCode]
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Listing</h2>
        <p className="text-gray-600">List your item for sale or create a raffle</p>
        <div className="mt-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
          💡 Form is pre-filled with example data for testing. You can modify any fields as needed.
        </div>
      </div>

      {/* Self.xyz Verification Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Badge variant="success">✓ Verified via Self.xyz</Badge>
                <span className="text-sm text-gray-600">
                  Nationality: {sellerNationality2Letter ? COUNTRIES.find(c => c.code === sellerNationality2Letter)?.name : sellerNationality}
                </span>
              </>
            ) : (
              <>
                <Badge variant="warning">⚠️ Verification Required</Badge>
                <span className="text-sm text-gray-600">
                  Please verify your identity to create listings
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Name */}
        <div>
          <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            id="itemName"
            value={formData.itemName}
            onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
            placeholder="Enter item name"
          />
          {errors.itemName && <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="itemDesc" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="itemDesc"
            value={formData.itemDesc}
            onChange={(e) => setFormData(prev => ({ ...prev, itemDesc: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
            placeholder="Describe your item"
          />
          {errors.itemDesc && <p className="mt-1 text-sm text-red-600">{errors.itemDesc}</p>}
        </div>

        {/* Price and Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price (FLOW) *
            </label>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
              placeholder="1"
            />
            {errors.quantity && <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>}
          </div>
        </div>

        {/* Listing Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Type *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center text-black">
              <input
                type="radio"
                value="direct"
                checked={formData.type === "direct"}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as "direct" | "raffle" }))}
                className="mr-2"
              />
              Direct Purchase
            </label>
            <label className="flex items-center text-black">
              <input
                type="radio"
                value="raffle"
                checked={formData.type === "raffle"}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as "direct" | "raffle" }))}
                className="mr-2"
              />
              Raffle
            </label>
          </div>
        </div>

        {/* Deadline (for raffles only) */}
        {formData.type === "raffle" && (
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Raffle Deadline *
            </label>
            <input
              type="datetime-local"
              id="deadline"
              value={formData.deadline}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black"
            />
            {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
          </div>
        )}

        {/* Allowed Countries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Countries *
          </label>
        {sellerNationality2Letter && (
          <div className="text-sm text-gray-600 mb-3">
            Your nationality ({COUNTRIES.find(c => c.code === sellerNationality2Letter)?.name}) is automatically included
          </div>
        )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
            {COUNTRIES.map((country) => (
              <label key={country.code} className="flex items-center text-sm text-black">
                <input
                  type="checkbox"
                  checked={formData.allowedCountries.includes(country.code) || country.code === sellerNationality2Letter}
                  onChange={() => handleCountryToggle(country.code)}
                  disabled={country.code === sellerNationality2Letter}
                  className="mr-2"
                />
                <span className={country.code === sellerNationality2Letter ? "text-purple-600 font-medium" : ""}>
                  {country.name}
                </span>
              </label>
            ))}
          </div>
          {errors.allowedCountries && <p className="mt-1 text-sm text-red-600">{errors.allowedCountries}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full py-3 text-lg"
            disabled={!isLoggedIn || isSubmitting || transactionLoading}
          >
            {isSubmitting || transactionLoading ? "Creating Listing..." : "Create Listing"}
          </Button>
          
          {!isLoggedIn && (
            <p className="mt-2 text-sm text-gray-600 text-center">
              Please verify your identity with Self.xyz to create listings
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
