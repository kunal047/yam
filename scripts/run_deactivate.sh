#!/bin/bash

echo "🔄 Deactivating all listings..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if FCL is installed
if [ ! -d "node_modules/@onflow" ]; then
    echo "📦 Installing Flow Client Library..."
    npm install @onflow/fcl
fi

# Run the deactivation script
echo "🚀 Running deactivation script..."
node scripts/deactivate_all_listings.js

echo "✅ Deactivation script completed!"
