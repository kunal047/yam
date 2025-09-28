# YAM Marketplace 🍠

A decentralized marketplace built on the Flow blockchain with Self.xyz identity verification. YAM allows users to create listings, buy items, and participate in raffles with verified identities.

## 🏗️ Architecture

YAM is a Web3 marketplace that combines:
- **Flow Blockchain** for decentralized transactions
- **Self.xyz** for privacy-preserving identity verification
- **Next.js 15.5.4** with Turbopack for the frontend
- **Cadence** smart contracts for marketplace logic

## 📋 Contract Information

### Flow Contract Address
```
YAMListings Contract: 0x1f67c2e66c7e3ee3
```

**Contract Explorer**: [View on Flow Testnet](https://testnet.flowscan.io/contract/A.1f67c2e66c7e3ee3.YAMListings)

### Network Details
- **Testnet**: `access.devnet.nodes.onflow.org:9000`
- **Mainnet**: `access.mainnet.nodes.onflow.org:9000`
- **Emulator**: `127.0.0.1:3569`

### Contract Features
- Create and manage item listings
- Direct purchase functionality
- Raffle system with random winner selection
- Country-based restrictions
- Seller verification system
- Escrow management for secure transactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Flow CLI
- Self.xyz account for identity verification

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd yam
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Flow CLI**
```bash
# Install Flow CLI (if not already installed)
sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"

# Start Flow emulator
flow emulator start
```

4. **Deploy contracts**
```bash
# Deploy to emulator
flow project deploy --network emulator

# Deploy to testnet
flow project deploy --network testnet
```

5. **Start development server**
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file with:
```env
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_SELF_APP_NAME=YAM Marketplace
NEXT_PUBLIC_SELF_SCOPE=yam-marketplace
NEXT_PUBLIC_SELF_ENDPOINT=https://your-ngrok-url.ngrok.io/api/verify
```

### Flow Configuration
The project uses `flow.json` for contract deployment and account management. Key accounts:
- **yam-marketplace**: `0x1f67c2e66c7e3ee3` (Main contract account)
- **default**: User account for transactions

## 🎯 Key Features

### Identity Verification
- **Self.xyz Integration**: Privacy-preserving KYC using zero-knowledge proofs
- **QR Code Scanning**: Simple mobile verification process
- **Age & Nationality Verification**: Ensures compliance and eligibility

### Marketplace Functions
- **Create Listings**: Sellers can list items with detailed descriptions
- **Direct Purchase**: Instant buy functionality for available items
- **Raffle System**: Limited-quantity raffles with random winner selection
- **Country Restrictions**: Sellers can restrict sales to specific countries
- **Escrow System**: Secure fund holding until transaction completion

### Smart Contract Functions
```cadence
// Core functions available in the contract
pub fun createListing(...)     // Create new item listing
pub fun buyListing(...)       // Purchase item directly
pub fun enterRaffle(...)       // Enter raffle for item
pub fun pickWinners(...)       // Admin picks raffle winners
pub fun verifySeller(...)      // Admin verifies seller identity
```

## 🛠️ Development

### Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes for verification
│   ├── buy/               # Browse listings
│   ├── sell/              # Create listings
│   └── profile/           # User profile
├── components/            # React components
├── hooks/                 # Custom React hooks
├── contexts/              # React context providers
└── contracts/             # Cadence smart contracts
```

### Key Components
- **SelfXYZModal**: Identity verification with QR code
- **CreateListingForm**: Form for creating new listings
- **WalletConnect**: Flow wallet connection
- **useListings**: Hook for blockchain interactions

### Testing
```bash
# Run tests
npm test

# Test contract deployment
flow project deploy --network testnet
```

## 🔐 Security Features

### Identity Verification
- Zero-knowledge proofs ensure privacy
- Age and nationality verification
- OFAC compliance checking
- Unique nullifier prevents double-spending

### Smart Contract Security
- Resource-based ownership model
- Admin controls for verification
- Escrow system for fund security
- Country restriction enforcement

## 📱 Usage

### For Sellers
1. Connect Flow wallet
2. Verify identity with Self.xyz
3. Create listing with item details
4. Set price and restrictions
5. Choose direct sale or raffle

### For Buyers
1. Browse available listings
2. Verify identity with Self.xyz
3. Connect Flow wallet
4. Purchase items or enter raffles
5. Receive items after verification

## 🌐 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to Vercel
vercel deploy
```

### Contract Deployment
```bash
# Deploy to testnet
flow project deploy --network testnet

# Deploy to mainnet
flow project deploy --network mainnet
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the Flow documentation
- Review Self.xyz integration guides

## 🔗 Links

- **Flow Documentation**: https://docs.onflow.org/
- **Self.xyz Documentation**: https://docs.self.xyz/
- **Next.js Documentation**: https://nextjs.org/docs
- **Cadence Language**: https://docs.onflow.org/cadence/
