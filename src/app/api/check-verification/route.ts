import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// JSON file storage for verification results
const STORAGE_FILE = path.join(process.cwd(), 'verification-results.json');

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

// Helper function to load verification results
async function loadVerificationResults(): Promise<Record<string, Record<string, unknown>>> {
  try {
    const data = await fs.readFile(STORAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Load verification results from JSON file
    const verificationResults = await loadVerificationResults();
    
    // Normalize the wallet address for comparison
    const normalizedAddress = normalizeFlowAddress(walletAddress);
    
    // Check if user exists in verification results
    const userVerification = verificationResults[normalizedAddress];
    
    if (userVerification && userVerification.status === "success") {
      return NextResponse.json({
        exists: true,
        verificationData: userVerification
      });
    }
    
    return NextResponse.json({
      exists: false,
      verificationData: null
    });
    
  } catch (error) {
    console.error("Error checking verification results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
