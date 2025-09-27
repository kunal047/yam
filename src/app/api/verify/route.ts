import { NextResponse } from "next/server";
import { SelfBackendVerifier, AllIds, DefaultConfigStore } from "@selfxyz/core";

// Reuse a single verifier instance
const selfBackendVerifier = new SelfBackendVerifier(
  "yam-marketplace",
  "https://playground.self.xyz/api/verify", // Self.xyz playground endpoint
  true, // mockPassport: true = staging/testnet, false = mainnet
  AllIds, // Now supports Aadhaar (3) in the new version
  new DefaultConfigStore({
    minimumAge: 18,
    excludedCountries: ["IRN","PRK","RUS","SYR"], // from documentation example
    ofac: true, // from documentation example
  }),
  "uuid" // userIdentifierType - must match frontend userIdType
);

export async function POST(req: Request) {
  try {
    // Extract data from the request
    const { attestationId, proof, publicSignals, userContextData } = await req.json();

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
    return NextResponse.json({
      status: "success",
      result: true,
      credentialSubject: result.discloseOutput,
    });
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
