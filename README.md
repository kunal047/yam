# 🍠 YAM - Yet Another Marketplace

A web3 marketplace built on Flow blockchain featuring fair raffles and direct purchases with privacy-preserving identity verification via Self.xyz.

## ✨ Features

- **🎰 Fair Raffles**: One verified entry per person prevents multiple accounts
- **⚡ Direct Purchases**: Instant transactions on Flow blockchain
- **🛡️ Identity Verification**: Self.xyz integration for age, country, and uniqueness checks
- **🏆 Loyalty System**: Points, badges, and reputation for users
- **🎁 Mystery Drops**: Surprise item reveals and gamification features

## 🚀 Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Blockchain**: Flow Testnet (@onflow/fcl)
- **Identity**: Self.xyz SDK (@selfxyz/qrcode, @selfxyz/core, ethers)
- **Styling**: Purple/Orange YAM theme with responsive design

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout with Flow provider
│   ├── raffles/           # Raffles listing and details
│   ├── sell/             # Seller dashboard
│   └── profile/          # User profile
├── components/           # Reusable UI components
│   ├── Button.tsx        # Custom button component
│   ├── Card.tsx          # Card components
│   ├── Badge.tsx         # Status badges
│   ├── WalletConnect.tsx # Flow wallet connection
│   └── FlowProvider.tsx  # Flow FCL provider
├── hooks/               # Custom React hooks
│   ├── useFlow.tsx      # Flow wallet connection
│   ├── useSelfXYZ.tsx   # Identity verification (mock)
│   ├── useRaffles.tsx   # Raffle management
│   └── usePurchases.tsx # Direct purchase management
└── ...
```

## 🛠️ Getting Started

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open [http://localhost:3000](http://localhost:3000)**

## 🔗 Flow Blockchain Setup

The app is configured for Flow Testnet:

- **FCL Config**: `fcl.config.js` - Flow client configuration
- **Wallet**: Uses Flow's default discovery wallet for testnet
- **Contracts**: Mock contract interactions (ready for real Cadence contracts)

## 📱 Pages

- **`/`** - Homepage with branding and navigation
- **`/raffles`** - Active raffles listing
- **`/raffles/[id]`** - Individual raffle details and entry
- **`/sell`** - Seller dashboard for creating listings
- **`/profile`** - User profile with reputation and badges

## 🎨 UI Components

- **Theme**: Purple/Orange gradient with glassmorphism effects
- **Responsive**: Mobile-first design with Tailwind CSS
- **Components**: Reusable Button, Card, Badge, and WalletConnect components

## 🔧 Development Notes

### Mock Data
Currently uses mock data for:
- Raffle listings and details
- User profiles and reputation
- Contract interactions

### Flow Integration
- ✅ Flow FCL client configured
- ✅ Wallet connection implemented
- ⏳ Real Cadence contracts (ready to integrate)
- ⏳ Smart contract deployment scripts

### Self.xyz Integration
- ✅ Real Self.xyz SDK integration (@selfxyz/qrcode, @selfxyz/core)
- ✅ QR code generation and verification
- ✅ Backend verification API route
- ✅ Modal-based verification flow
- ✅ Scope and configuration matching between frontend/backend

## 🚀 Deployment

Ready for deployment on Vercel, Netlify, or any Next.js-compatible platform.

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this codebase for your own web3 marketplace projects!

---

**Built with ❤️ for the Flow blockchain ecosystem**
