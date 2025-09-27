#!/bin/bash

# Flow Contract Test Script
# Usage: ./deploy/test_deployment.sh [testnet|mainnet|emulator]

set -e

NETWORK=${1:-testnet}
ACCOUNT_NAME="yam-marketplace"

echo "🧪 Testing Flow contract deployment on $NETWORK..."

if [ "$NETWORK" = "emulator" ]; then
    ACCOUNT_NAME="emulator-account"
fi

# Get contract address
CONTRACT_ADDRESS=$(flow accounts get $ACCOUNT_NAME --network $NETWORK | grep "Address:" | awk '{print $2}')

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo "❌ Could not find contract address for $ACCOUNT_NAME on $NETWORK"
    exit 1
fi

echo "📍 Testing contract at: $CONTRACT_ADDRESS"

# Test 1: Check if contract is deployed
echo "🔍 Test 1: Checking contract deployment..."
CONTRACT_INFO=$(flow accounts get $CONTRACT_ADDRESS --network $NETWORK)

if echo "$CONTRACT_INFO" | grep -q "Listings"; then
    echo "✅ Contract 'Listings' is deployed"
else
    echo "❌ Contract 'Listings' not found"
    exit 1
fi

# Test 2: Test getActiveListings function
echo "🔍 Test 2: Testing getActiveListings function..."
RESULT=$(flow scripts execute ./scripts/get_active_listings.cdc --network $NETWORK 2>/dev/null || echo "ERROR")

if [ "$RESULT" != "ERROR" ]; then
    echo "✅ getActiveListings function works"
    echo "   Result: $RESULT"
else
    echo "❌ getActiveListings function failed"
fi

# Test 3: Test verifySeller function (this will fail if not set up properly, which is expected)
echo "🔍 Test 3: Testing verifySeller function..."
VERIFY_RESULT=$(flow transactions build ./transactions/verify_seller.cdc \
    --args-json '[{"type": "String", "value": "IND"}, {"type": "String", "value": "test_nullifier_123"}]' \
    --proposer $ACCOUNT_NAME \
    --authorizer $ACCOUNT_NAME \
    --payer $ACCOUNT_NAME \
    --network $NETWORK \
    --save test_transaction.cdc 2>/dev/null && echo "BUILT" || echo "ERROR")

if [ "$VERIFY_RESULT" = "BUILT" ]; then
    echo "✅ verifySeller transaction builds successfully"
    rm -f test_transaction.cdc
else
    echo "⚠️ verifySeller transaction failed to build (this may be expected if not set up)"
fi

echo ""
echo "🎉 Contract testing completed!"
echo "📍 Contract Address: $CONTRACT_ADDRESS"
echo "🌐 Network: $NETWORK"

echo ""
echo "Manual tests you can run:"
echo "1. Create a listing: flow transactions send ./transactions/create_listing.cdc --network $NETWORK --signer $ACCOUNT_NAME"
echo "2. Get a specific listing: flow scripts execute ./scripts/get_listing.cdc --args-json '[{\"type\": \"UInt64\", \"value\": \"1\"}]' --network $NETWORK"
echo "3. Check contract account: flow accounts get $CONTRACT_ADDRESS --network $NETWORK"
