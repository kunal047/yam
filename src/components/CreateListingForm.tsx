"use client";

import { useState } from "react";
import { useSelfXYZContext } from "@/contexts/SelfXYZContext";
import { useFlow } from "@/hooks/useFlow";
import { useListings } from "@/hooks/useListings";
import Button from "./Button";
import Badge from "./Badge";

interface CreateListingFormProps {
  onSuccess?: (listingId: string) => void;
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
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "SG", name: "Singapore" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "EG", name: "Egypt" },
  { code: "KE", name: "Kenya" },
];

export default function CreateListingForm({ onSuccess, onError }: CreateListingFormProps) {
  const { isLoggedIn, verification } = useSelfXYZContext();
  const { isConnected, connectWallet } = useFlow();
  const { createListing, loading: transactionLoading } = useListings();
  
  const [formData, setFormData] = useState<FormData>({
    itemName: "",
    itemDesc: "",
    price: "",
    quantity: "1",
    type: "direct",
    deadline: "",
    allowedCountries: [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-add seller's nationality to allowed countries
  const sellerNationality = verification.country;
  const defaultAllowedCountries = sellerNationality ? [sellerNationality] : [];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.itemName.trim()) {
      newErrors.itemName = "Item name is required";
    }

    if (!formData.itemDesc.trim()) {
      newErrors.itemDesc = "Description is required";
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (formData.type === "raffle") {
      if (!formData.deadline) {
        newErrors.deadline = "Deadline is required for raffles";
      } else {
        const deadlineDate = new Date(formData.deadline);
        const now = new Date();
        if (deadlineDate <= now) {
          newErrors.deadline = "Deadline must be in the future";
        }
      }
    }

    const allowedCountries = formData.allowedCountries.length > 0 
      ? formData.allowedCountries 
      : defaultAllowedCountries;
    
    if (allowedCountries.length === 0) {
      newErrors.allowedCountries = "At least one country must be selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      onError?.("Please verify your identity with Self.xyz first");
      return;
    }

    if (!isConnected) {
      try {
        await connectWallet();
      } catch (err) {
        onError?.("Failed to connect wallet");
        return;
      }
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare transaction data
      const allowedCountries = formData.allowedCountries.length > 0 
        ? formData.allowedCountries 
        : defaultAllowedCountries;

      if (!sellerNationality) {
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

      // Call Flow transaction
      const listingId = await createListing(transactionData);
      
      onSuccess?.(listingId);
      
      // Reset form
      setFormData({
        itemName: "",
        itemDesc: "",
        price: "",
        quantity: "1",
        type: "direct",
        deadline: "",
        allowedCountries: [],
      });
      
    } catch (err) {
      console.error("Error creating listing:", err);
      onError?.(err instanceof Error ? err.message : "Failed to create listing");
    } finally {
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
      </div>

      {/* Self.xyz Verification Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Badge variant="success">✓ Verified via Self.xyz</Badge>
                <span className="text-sm text-gray-600">
                  Nationality: {sellerNationality}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <label className="flex items-center">
              <input
                type="radio"
                value="direct"
                checked={formData.type === "direct"}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as "direct" | "raffle" }))}
                className="mr-2"
              />
              Direct Purchase
            </label>
            <label className="flex items-center">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
          </div>
        )}

        {/* Allowed Countries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allowed Countries *
          </label>
        {sellerNationality && (
          <div className="text-sm text-gray-600 mb-3">
            Your nationality ({sellerNationality}) is automatically included
          </div>
        )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
            {COUNTRIES.map((country) => (
              <label key={country.code} className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={formData.allowedCountries.includes(country.code) || country.code === sellerNationality}
                  onChange={() => handleCountryToggle(country.code)}
                  disabled={country.code === sellerNationality}
                  className="mr-2"
                />
                <span className={country.code === sellerNationality ? "text-purple-600 font-medium" : ""}>
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
