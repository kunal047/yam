import { NextResponse } from "next/server";
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";
import { promises as fs } from "fs";
import { existsSync, writeFileSync } from "fs";
import path from "path";

// Reuse a single verifier instance
const selfBackendVerifier = new SelfBackendVerifier(
  "yam-marketplace", // Use the playground's default scope
  "https://1092c45d94e2.ngrok-free.app/api/verify", // Must match frontend endpoint
  false, // mockPassport: false = mainnet, true = staging/testnet
  AllIds, // Now supports Aadhaar (3) in the new version
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: [], // from documentation example
    ofac: false, // Disable OFAC checks to match circuit
  }),
  "hex" // userIdentifierType - must match frontend userIdType (using Flow wallet address as string)
);

// JSON file storage for verification results
const STORAGE_FILE = path.join(process.cwd(), 'verification-results.json');
if (!existsSync(STORAGE_FILE)) {
  writeFileSync(STORAGE_FILE, '{}');
}

// Helper functions for JSON file storage
async function loadVerificationResults(): Promise<Record<string, Record<string, unknown>>> {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveVerificationResults(results: Record<string, Record<string, unknown>>): Promise<void> {
  await fs.writeFile(STORAGE_FILE, JSON.stringify(results, null, 2), 'utf-8');
}

// Helper function to normalize Flow addresses for comparison
function normalizeFlowAddress(address: string): string {
  if (!address) return address;
  
  // Remove 0x prefix
  let cleanAddress = address.startsWith('0x') ? address.slice(2) : address;
  
  // Pad to 40 characters (20 bytes = 40 hex chars)
  cleanAddress = cleanAddress.padStart(40, '0');
  
  // Add 0x prefix back
  return `0x${cleanAddress}`;
}

export async function POST(req: Request) {
  try {
    // Extract data from the request
    const { attestationId, proof, publicSignals, userContextData, checkStatus, sessionId } = await req.json();

    // Handle status check requests
    if (checkStatus && sessionId) {
      console.log("=== STATUS CHECK REQUEST ===");
      console.log("sessionId:", sessionId);
      console.log("=============================");
      
      // Load verification results from JSON file
      const verificationResults = await loadVerificationResults();
      
      // Normalize the sessionId for comparison
      const normalizedSessionId = normalizeFlowAddress(sessionId);
      console.log("Normalized sessionId:", normalizedSessionId);
      
      // Find by direct key lookup using normalized userIdentifier
      let foundResult = verificationResults[normalizedSessionId];
      
      if (foundResult) {
        console.log("Returning stored verification result:", JSON.stringify(foundResult, null, 2));
        return NextResponse.json(foundResult);
      } else {
        console.log("No verification result found for sessionId:", sessionId);
        console.log("Available userIdentifiers:", Object.keys(verificationResults));
        return NextResponse.json(
          {
            status: "pending",
            result: false,
            reason: "Verification result not found",
          },
          { status: 200 }
        );
      }
    }

    // Log the complete request
    console.log("=== SELF.XYZ VERIFICATION REQUEST ===");
    console.log("attestationId:", attestationId);
    console.log("userContextData:", userContextData);
    console.log("userContextData type:", typeof userContextData);
    console.log("userContextData length:", userContextData?.length);
    console.log("proof keys:", proof ? Object.keys(proof) : "no proof");
    console.log("publicSignals length:", publicSignals?.length);
    console.log("publicSignals:", publicSignals);
    console.log("=====================================");

    // Verify all required fields are present
    if (!proof || !publicSignals || !attestationId || !userContextData) {
      console.log("Missing required fields:", {
        proof: !!proof,
        publicSignals: !!publicSignals,
        attestationId: !!attestationId,
        userContextData: !!userContextData
      });
      return NextResponse.json(
        {
          status: "error",
          result: false,
          reason: "Proof, publicSignals, attestationId and userContextData are required",
        },
        { status: 200 }
      );
    }


    // Verify the proof
    console.log("Calling selfBackendVerifier.verify...");
    const result = await selfBackendVerifier.verify(
      attestationId,    // Document type (1 = passport, 2 = EU ID card, 3 = Aadhaar)
      proof,            // The zero-knowledge proof
      publicSignals,    // Public signals array
      userContextData   // User context data (hex string)
    );
    
    console.log("=== SELF.XYZ VERIFICATION RESULT ===");
    console.log("Result:", JSON.stringify(result, null, 2));
    console.log("====================================");

    const { isValid, isMinimumAgeValid, isOfacValid } = result.isValidDetails;
    
    // Check if verification was successful (following documentation example)
    if (!isValid || !isMinimumAgeValid || !isOfacValid) {
      let reason = "Verification failed";
      if (!isMinimumAgeValid) reason = "Minimum age verification failed";
      if (!isOfacValid) reason = "OFAC verification failed";
      
      return NextResponse.json(
        {
          status: "error",
          result: false,
          reason,
        },
        { status: 200 }
      );
    }

      // Verification successful - process the result
      const response = {
        status: "success",
        result: true,
        attestationId: result.attestationId,
        isValidDetails: result.isValidDetails,
        forbiddenCountriesList: result.forbiddenCountriesList,
        discloseOutput: result.discloseOutput,
        userData: result.userData,
        nullifier: result.discloseOutput.nullifier,
        nationality: result.discloseOutput.nationality,
        userIdentifier: result.userData.userIdentifier,
        credentialSubject: {
          age: result.discloseOutput.minimumAge,
          nationality: result.discloseOutput.nationality,
          gender: result.discloseOutput.gender,
          ofac: result.discloseOutput.ofac[0] || false
        },
      };

      // Use userIdentifier (Flow wallet address) as the unique identifier for storage
      const userIdentifier = result.userData.userIdentifier;
      const normalizedUserIdentifier = normalizeFlowAddress(userIdentifier);
      
      // Load existing verification results
      const verificationResults = await loadVerificationResults();
      
      // Check if we already have this userIdentifier (same user verified before)
      if (verificationResults[normalizedUserIdentifier]) {
        console.log("User already verified with userIdentifier:", normalizedUserIdentifier);
        console.log("Returning existing verification result");
        return NextResponse.json(verificationResults[normalizedUserIdentifier]);
      }
      
      // Store the verification result using normalized userIdentifier as key
      verificationResults[normalizedUserIdentifier] = response;
      
      await saveVerificationResults(verificationResults);
      console.log("Stored new verification result for userIdentifier:", normalizedUserIdentifier);

      console.log("=== SELF.XYZ API RESPONSE ===");
      console.log("Response:", JSON.stringify(response, null, 2));
      console.log("=============================");

      return NextResponse.json(response);
  } catch (error) {
    console.log("=== SELF.XYZ VERIFICATION ERROR ===");
    console.log("Error:", error);
    console.log("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.log("Error stack:", error instanceof Error ? error.stack : "No stack");
    console.log("===================================");
    
    return NextResponse.json(
      {
        status: "error",
        result: false,
        reason: error instanceof Error ? error.message : "Unknown error",
        error_code: "UNKNOWN_ERROR"
      },
      { status: 200 }
    );
  }
}
