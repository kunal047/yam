#!/bin/bash

# Flow Contract Deployment Script
# Usage: ./deploy/deploy.sh [testnet|mainnet|emulator]

set -e

NETWORK=${1:-testnet}
ACCOUNT_NAME="yam-marketplace"

echo "🚀 Starting Flow contract deployment to $NETWORK..."

# Check if Flow CLI is installed
if ! command -v flow &> /dev/null; then
    echo "❌ Flow CLI is not installed. Please install it first:"
    echo "   macOS: brew install flow-cli"
    echo "   Linux: sh -ci \"\$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)\""
    exit 1
fi

# Check if flow.json exists
if [ ! -f "flow.json" ]; then
    echo "❌ flow.json not found. Please create it first."
    exit 1
fi

# Validate network
if [[ "$NETWORK" != "testnet" && "$NETWORK" != "mainnet" && "$NETWORK" != "emulator" ]]; then
    echo "❌ Invalid network. Use: testnet, mainnet, or emulator"
    exit 1
fi

echo "📋 Checking Flow CLI version..."
flow version

echo "🔍 Checking account configuration..."
if [ "$NETWORK" = "emulator" ]; then
    ACCOUNT_NAME="emulator-account"
fi

# Check if account is configured
ACCOUNT_ADDRESS=$(flow accounts get $ACCOUNT_NAME --network $NETWORK 2>/dev/null | grep "Address:" | awk '{print $2}' || echo "")
if [ -z "$ACCOUNT_ADDRESS" ]; then
    echo "❌ Account $ACCOUNT_NAME not found or not configured for $NETWORK"
    echo "   Please update flow.json with your account details"
    exit 1
fi

echo "✅ Account found: $ACCOUNT_ADDRESS"

# Deploy contracts
echo "📦 Deploying contracts to $NETWORK..."
flow project deploy --network $NETWORK --update

if [ $? -eq 0 ]; then
    echo "✅ Contracts deployed successfully!"
    
    # Get the deployed contract address
    DEPLOYED_ADDRESS=$(flow accounts get $ACCOUNT_NAME --network $NETWORK | grep "Address:" | awk '{print $2}')
    echo "📍 Contract deployed at: $DEPLOYED_ADDRESS"
    
    # Update contract addresses in files
    echo "🔄 Updating contract addresses in project files..."
    
    # Update transaction scripts
    find ./transactions -name "*.cdc" -exec sed -i '' "s/0xYOUR_CONTRACT_ADDRESS/0x$DEPLOYED_ADDRESS/g" {} \;
    
    # Update query scripts
    find ./scripts -name "*.cdc" -exec sed -i '' "s/0xYOUR_CONTRACT_ADDRESS/0x$DEPLOYED_ADDRESS/g" {} \;
    
    # Update frontend hooks
    find ./src -name "*.tsx" -exec sed -i '' "s/0xYOUR_CONTRACT_ADDRESS/0x$DEPLOYED_ADDRESS/g" {} \;
    
    echo "✅ Contract addresses updated in all files"
    
    # Setup admin resource (only for real networks, not emulator)
    if [ "$NETWORK" != "emulator" ]; then
        echo "⚙️ Setting up admin resource..."
        
        # Update setup transaction with actual address
        sed -i '' "s/0xYOUR_CONTRACT_ADDRESS/0x$DEPLOYED_ADDRESS/g" ./transactions/setup_admin.cdc
        
        flow transactions send ./transactions/setup_admin.cdc --network $NETWORK --signer $ACCOUNT_NAME
        
        if [ $? -eq 0 ]; then
            echo "✅ Admin resource set up successfully"
        else
            echo "⚠️ Admin resource setup failed. You may need to set it up manually."
        fi
    fi
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📍 Contract Address: 0x$DEPLOYED_ADDRESS"
    echo "🌐 Network: $NETWORK"
    echo ""
    echo "Next steps:"
    echo "1. Test your contract functions"
    echo "2. Update your frontend with the new contract address"
    echo "3. Verify all transactions work correctly"
    
else
    echo "❌ Deployment failed!"
    exit 1
fi
