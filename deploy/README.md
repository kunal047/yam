# Flow Contract Deployment Guide

## Prerequisites

### 1. Install Flow CLI

**macOS (using Homebrew):**
```bash
brew install flow-cli
```

**Linux/Windows:**
```bash
sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)"
```

**Verify installation:**
```bash
flow version
```

### 2. Create Flow Account

You'll need a Flow account to deploy contracts. You can create one at:
- **Testnet**: https://testnet-faucet.onflow.org/
- **Mainnet**: https://portal.flow.com/

## Configuration

### 1. Initialize Flow Project

```bash
# In your project root
flow init
```

This creates a `flow.json` configuration file.

### 2. Configure flow.json

Update the `flow.json` file with your account details:

```json
{
  "networks": {
    "testnet": "access.devnet.nodes.onflow.org:9000",
    "mainnet": "access.mainnet.nodes.onflow.org:9000"
  },
  "accounts": {
    "yam-marketplace": {
      "address": "YOUR_ACCOUNT_ADDRESS",
      "key": "YOUR_PRIVATE_KEY"
    }
  },
  "contracts": {
    "Listings": "./contracts/Listings.cdc"
  },
  "deployments": {
    "testnet": {
      "yam-marketplace": ["Listings"]
    }
  }
}
```

### 3. Set up Admin Resource

After deployment, you need to set up the admin resource for listing creation.

## Deployment Commands

### Deploy to Testnet

```bash
# Deploy the contract
flow accounts create --key YOUR_PRIVATE_KEY --host access.devnet.nodes.onflow.org:9000

# Update flow.json with the new address, then:
flow project deploy --network testnet
```

### Deploy to Mainnet

```bash
flow project deploy --network mainnet
```

## Post-Deployment Setup

### 1. Set up Admin Resource

After deployment, you need to set up the admin resource:

```bash
flow transactions send ./transactions/setup_admin.cdc --network testnet --signer yam-marketplace
```

### 2. Update Contract Addresses

Update all contract addresses in:
- Transaction scripts
- Query scripts
- Frontend hooks
- Replace `0xYOUR_CONTRACT_ADDRESS` with your actual contract address

## Verification

### 1. Check Contract Deployment

```bash
flow accounts get YOUR_CONTRACT_ADDRESS --network testnet
```

### 2. Test Contract Functions

```bash
# Test getting listings
flow scripts execute ./scripts/get_active_listings.cdc --network testnet
```

## Security Notes

- **Never commit private keys** to version control
- **Use environment variables** for sensitive data
- **Test thoroughly** on testnet before mainnet deployment
- **Keep admin resources secure** - they control listing creation

## Troubleshooting

### Common Issues:

1. **Insufficient Flow**: Ensure your account has enough FLOW tokens for deployment
2. **Invalid Key**: Verify your private key is correct
3. **Network Issues**: Check network connectivity and node status
4. **Contract Errors**: Review contract syntax and dependencies

### Getting Help:

- [Flow Documentation](https://docs.onflow.org/)
- [Flow Discord](https://discord.gg/flow)
- [Flow GitHub](https://github.com/onflow)
